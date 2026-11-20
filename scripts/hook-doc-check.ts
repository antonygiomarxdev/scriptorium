#!/usr/bin/env bun
// L-12 layer 1, PostToolUse on Write|Edit|MultiEdit: after the agent edits a chain document, run that document's
// check and the docs lint on it. Hook input (JSON) arrives on stdin; failures go to stderr with exit 2 so the agent sees them.
// The same functions serve the Stop hook, the git pre-commit hook and CI (see hook-stop.ts, pre-commit.ts).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { lintDocs, loadPhrases } from "./lint-docs.ts";

const CHECK = join(import.meta.dir, "check.ts");

// A check to run from the project root. only: keep just the failures that name this file (the check runs on a whole folder).
export type Check = { args?: string[]; only?: string; fail?: string };

// root is the folder holding docs/, rel the document's path under it ("docs/pickups/PRD.md").
// shortcut: the last "/docs/" in the path is the docs folder, wrong for a project nested inside a folder that is itself named docs.
export function splitDocPath(file: string): { root: string; rel: string } | undefined {
  const p = file.replaceAll("\\", "/");
  const i = p.lastIndexOf("/docs/");
  return i < 0 || !p.endsWith(".md") ? undefined : { root: p.slice(0, i) || "/", rel: p.slice(i + 1) };
}

export function checksFor(root: string, rel: string): Check[] {
  const parts = rel.split("/"); // parts[0] === "docs"
  const name = parts[parts.length - 1];
  const summary: Check = { args: ["summary", rel] };
  const read = (p: string) => (existsSync(join(root, p)) ? readFileSync(join(root, p), "utf8") : "");
  if (parts.length === 2) return name === "PRODUCT.md" ? [summary] : [];
  const top = parts[1];
  if (["retro", "decisions", "research"].includes(top)) return [];
  if (top === "requests") return /^REQ-/.test(name) ? [summary] : [];
  if (top === "adr") return /^ADR-/.test(name) ? [summary] : [];
  if (top === "tp") return name === "TP.md" ? [{ args: ["tp", rel, "docs/adr"] }, summary] : [];
  const dir = "docs/" + top;
  const prd = read(dir + "/PRD.md");
  // The slice id is the one the PRD's requirements use: R-<ID>-n.
  const id = prd.match(/\bR-([A-Z0-9]+)-\d+\b/)?.[1] ?? top.toUpperCase();
  const sub = parts[2];
  if (parts.length === 3 && name === "PRD.md") return [{ args: ["prd", rel, id] }, summary];
  if (sub === "frd" && /^FRD-\d{2}-/.test(name)) return [{ args: ["frd", dir, id], only: name }, summary];
  if (sub === "ux" && /^UX-\d{2}-/.test(name)) return [{ args: ["ux", dir], only: name }, summary];
  if (sub === "tp" && /^TP-\d{2}-/.test(name)) return [{ args: ["tp", rel, "docs/adr"] }, summary];
  if (sub === "specs" && /^SPEC-\d{2}-/.test(name)) {
    const nn = name.slice(5, 7);
    const frdDir = join(root, dir, "frd");
    const frd = existsSync(frdDir) ? readdirSync(frdDir).find((f) => f.startsWith("FRD-" + nn + "-")) : undefined;
    return [frd ? { args: ["spec", rel, dir + "/frd/" + frd] } : { fail: name + ": no FRD-" + nn + "-*.md in " + dir + "/frd" }, summary];
  }
  return [];
}

function run(root: string, script: string, args: string[]): { code: number; out: string } {
  const r = Bun.spawnSync([process.execPath, script, ...args], { cwd: root });
  return { code: r.exitCode ?? 1, out: r.stdout.toString() + r.stderr.toString() };
}

// Failure lines of one command: its FAIL lines on exit 1, its whole message on exit 2 (usage, missing file).
function failures(label: string, r: { code: number; out: string }): string[] {
  if (r.code === 0) return [];
  const lines = r.out.split(/\r?\n/).filter(Boolean);
  return r.code === 1 ? lines.filter((l) => l.startsWith("FAIL")) : [label + ": " + lines.join(" ")];
}

// Every failure for one document. strict: do not narrow a folder check to this file (CI wants the PRD coverage too).
export function runDocChecks(root: string, rel: string, strict = false): string[] {
  const out: string[] = [];
  for (const c of checksFor(root, rel)) {
    if (c.fail) { out.push("FAIL " + c.fail); continue; }
    const f = failures("check " + c.args![0] + " " + rel, run(root, CHECK, c.args!));
    out.push(...(c.only && !strict ? f.filter((l) => l.includes(c.only + ":")) : f));
  }
  const under = rel.slice("docs/".length);
  for (const x of lintDocs(root, loadPhrases())) if (x.file === under) out.push("FAIL docs/" + x.file + ":" + x.line + ": " + x.reason);
  return out;
}

// The plugin is installed user-wide: a project without docs/PRODUCT.md is not a Scriptorium project and is never touched.
export const isChainProject = (root: string) => existsSync(join(root, "docs", "PRODUCT.md"));

export const runStatus = (root: string): string[] => failures("status", run(root, CHECK, ["status", "."]));

// Documents under docs/ that changed since HEAD, are staged, or are new. Legacy documents that did not change are left alone,
// so a project in the middle of an adoption is not blocked by the documents it has not migrated yet.
export function changedDocs(root: string): string[] {
  const git = (...a: string[]) => Bun.spawnSync(["git", ...a], { cwd: root }).stdout.toString().split(/\r?\n/).filter(Boolean);
  const files = new Set([...git("diff", "--name-only", "--relative", "HEAD"), ...git("diff", "--cached", "--name-only", "--relative"), ...git("ls-files", "--others", "--exclude-standard")]);
  return [...files].map((f) => f.replaceAll("\\", "/")).filter((f) => f.startsWith("docs/") && f.endsWith(".md") && existsSync(join(root, f))).sort();
}

// What the Stop hook runs: the per-document checks on the changed documents, plus the chain status.
export function runChanged(root: string): string[] {
  if (!isChainProject(root)) return [];
  return [...changedDocs(root).flatMap((rel) => runDocChecks(root, rel)), ...runStatus(root)];
}

if (import.meta.main) {
  let input: { tool_input?: { file_path?: string }; cwd?: string } = {};
  try { input = JSON.parse(await Bun.stdin.text()); } catch { process.exit(0); }
  const file = input.tool_input?.file_path;
  const doc = file ? splitDocPath(resolve(input.cwd ?? process.cwd(), file)) : undefined;
  if (!doc || !isChainProject(doc.root)) process.exit(0);
  const fails = runDocChecks(doc.root, doc.rel);
  if (fails.length) {
    console.error("Scriptorium: " + doc.rel + " fails its checks. Fix them before going on.\n" + fails.join("\n"));
    process.exit(2);
  }
}
