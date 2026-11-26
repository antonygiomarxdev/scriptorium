#!/usr/bin/env bun
// L-12 layer 1, PostToolUse on Write|Edit|MultiEdit: after the agent edits a chain document, run that document's
// check and the docs lint on it. Hook input (JSON) arrives on stdin; failures go to stderr with exit 2 so the agent sees them.
// The same functions serve the Stop hook, the git pre-commit hook and CI (see hook-stop.ts, pre-commit.ts).
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { lintDocs, loadPhrases } from "./lint-docs.ts";
import { pinProblem } from "./format.ts";
import { kindOf } from "./kinds.ts";
import { samePath, toPosix, typed } from "./paths.ts";

const CHECK = join(import.meta.dir, "check.ts");

// A check to run from the project root. only: keep just the failures that name this file (the check runs on a whole folder).
export type Check = { args?: string[]; only?: string; fail?: string };

// root is the folder holding docs/, rel the document's path under it ("docs/pickups/PRD.md").
// shortcut: the last "/docs/" in the path is the docs folder, wrong for a project nested inside a folder that is itself named docs.
export function splitDocPath(file: string): { root: string; rel: string } | undefined {
  const p = typed(file); // the host gives the path as text: either slash, on any system
  const i = p.lastIndexOf("/docs/");
  return i < 0 || !p.endsWith(".md") ? undefined : { root: p.slice(0, i) || "/", rel: p.slice(i + 1) };
}

export function checksFor(root: string, rel: string): Check[] {
  const parts = rel.split("/"); // parts[0] === "docs"
  const kind = kindOf(rel.slice("docs/".length)); // the one rule: no name pattern of its own here
  const summary: Check = { args: ["summary", rel] };
  const read = (p: string) => (existsSync(join(root, p)) ? readFileSync(join(root, p), "utf8") : "");
  if (kind === "PRODUCT" || kind === "ADR" || kind === "REQUEST") return [summary];
  if (kind === "TP" && parts.length === 3) return [{ args: ["tp", rel, "docs/adr"] }, summary]; // the cross-cutting TP, docs/tp/TP.md
  if (!kind || !["PRD", "FRD", "UX", "TP", "SPEC"].includes(kind)) return [];
  const dir = "docs/" + parts[1];
  const prd = read(dir + "/PRD.md");
  // The slice id is the one the PRD's requirements use: R-<ID>-n.
  const id = prd.match(/\bR-([A-Z0-9]+)-\d+\b/)?.[1] ?? parts[1]!.toUpperCase();
  const name = parts[parts.length - 1]!;
  if (kind === "PRD") return [{ args: ["prd", rel, id] }, summary];
  if (kind === "FRD") return [{ args: ["frd", dir, id], only: name }, summary];
  if (kind === "UX") return [{ args: ["ux", dir], only: name }, summary];
  if (kind === "TP") return [{ args: ["tp", rel, "docs/adr"] }, summary];
  return [{ args: ["spec", rel] }, summary];
}

function run(root: string, script: string, args: string[]): { code: number; out: string } {
  const r = Bun.spawnSync([process.execPath, script, ...args], { cwd: root });
  return { code: r.exitCode ?? 1, out: r.stdout.toString() + r.stderr.toString() };
}

// Failure lines of one command: its FAIL lines on exit 1, its whole message on exit 2 (usage, missing file).
// WARN lines (rules of a newer format than the pin) are pushed to warns, if given, and never fail.
function failures(label: string, r: { code: number; out: string }, warns?: string[]): string[] {
  const lines = r.out.split(/\r?\n/).filter(Boolean);
  warns?.push(...lines.filter((l) => l.startsWith("WARN")));
  if (r.code === 0) return [];
  return r.code === 1 ? lines.filter((l) => l.startsWith("FAIL")) : [label + ": " + lines.join(" ")];
}

// Every failure for one document. strict: do not narrow a folder check to this file (CI wants the PRD coverage too).
export function runDocChecks(root: string, rel: string, strict = false, warns?: string[]): string[] {
  const out: string[] = [];
  for (const c of checksFor(root, rel)) {
    if (c.fail) {
      out.push("FAIL " + c.fail);
      continue;
    }
    const f = failures("check " + c.args![0] + " " + rel, run(root, CHECK, c.args!), warns);
    out.push(...(c.only && !strict ? f.filter((l) => l.includes(c.only + ":")) : f));
  }
  const under = rel.slice("docs/".length);
  for (const x of lintDocs(root, loadPhrases())) if (x.file === under) out.push("FAIL docs/" + x.file + ":" + x.line + ": " + x.reason);
  return out;
}

// The plugin is installed user-wide: a project without docs/PRODUCT.md is not a Scriptorium project and is never touched.
export const isChainProject = (root: string) => existsSync(join(root, "docs", "PRODUCT.md"));

// A path for comparing with what git prints: through the real path, so a short 8.3 name (C:\Users\RUNNER~1) and the long one match; samePath when the path does not resolve.
const canon = (p: string): string => {
  try {
    return samePath(realpathSync.native(p));
  } catch {
    return samePath(p);
  }
};

// The worktrees git lists from the session root; undefined when git fails.
function worktreesOf(sessionRoot: string): Set<string> | undefined {
  try {
    const r = Bun.spawnSync(["git", "worktree", "list", "--porcelain"], { cwd: sessionRoot });
    if (r.exitCode !== 0) return undefined;
    return new Set(
      r.stdout
        .toString()
        .split(/\r?\n/)
        .filter((l) => l.startsWith("worktree "))
        .map((l) => canon(l.slice(9))),
    );
  } catch {
    return undefined; // no git binary: the same as a failing git
  }
}

// The project a file belongs to: the nearest folder above it, up to the session root, that is a chain project and a git worktree
// registered with the session's repository (a nested .claude/worktrees/<name>/). Any other folder, or a git failure, leaves the session root.
export function projectOf(abs: string, sessionRoot: string): string {
  let trees: Set<string> | undefined | null = null; // read once, and only when a nested candidate shows up
  for (let dir = dirname(abs); !relative(sessionRoot, dir).startsWith(".."); dir = dirname(dir)) {
    if (canon(dir) === canon(sessionRoot)) break;
    if (isChainProject(dir)) {
      trees = trees === null ? worktreesOf(sessionRoot) : trees;
      if (trees?.has(canon(dir))) return dir;
    }
    if (dirname(dir) === dir) break;
  }
  return sessionRoot;
}

// status also runs the drift check (body edited or parent changed since approval).
export const runStatus = (root: string): string[] => failures("status", run(root, CHECK, ["status", "."]));

// Covers tags against the FRDs. shortcut: the test directory is always "test" (skipped when absent); read it from docs/CHECKS.md when a project needs another.
export const runTrace = (root: string): string[] => (existsSync(join(root, "test")) ? failures("trace", run(root, CHECK, ["trace", "."])) : []);

// Documents under docs/ that changed since HEAD, are staged, or are new. Legacy documents that did not change are left alone,
// so a project in the middle of an adoption is not blocked by the documents it has not migrated yet.
export function changedDocs(root: string): string[] {
  const git = (...a: string[]) =>
    Bun.spawnSync(["git", ...a], { cwd: root })
      .stdout.toString()
      .split(/\r?\n/)
      .filter(Boolean);
  const files = new Set([...git("diff", "--name-only", "--relative", "HEAD"), ...git("diff", "--cached", "--name-only", "--relative"), ...git("ls-files", "--others", "--exclude-standard")]);
  return [...files]
    .map((f) => toPosix(f))
    .filter((f) => f.startsWith("docs/") && f.endsWith(".md") && existsSync(join(root, f)))
    .sort();
}

// What the Stop hook runs: the per-document checks on the changed documents, plus the chain status.
export function runChanged(root: string): string[] {
  if (!isChainProject(root)) return [];
  return [...changedDocs(root).flatMap((rel) => runDocChecks(root, rel)), ...runStatus(root)];
}

if (import.meta.main) {
  let input: { tool_input?: { file_path?: string }; cwd?: string } = {};
  try {
    input = JSON.parse(await Bun.stdin.text());
  } catch {
    process.exit(0);
  }
  const file = input.tool_input?.file_path;
  const doc = file ? splitDocPath(resolve(input.cwd ?? process.cwd(), file)) : undefined;
  if (!doc || !isChainProject(doc.root)) process.exit(0);
  const pin = pinProblem(doc.root);
  if (pin) {
    console.error("Scriptorium warning: " + pin);
    process.exit(0);
  }
  const warns: string[] = [];
  const fails = runDocChecks(doc.root, doc.rel, false, warns);
  if (warns.length) console.error("Scriptorium: " + doc.rel + "\n" + [...new Set(warns)].join("\n"));
  if (fails.length) {
    console.error("Scriptorium: " + doc.rel + " fails its checks. Fix them before going on.\n" + fails.join("\n"));
    process.exit(2);
  }
}
