import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { changesetRule } from "../scripts/pre-commit.ts";
import { splitDocPath, checksFor, runDocChecks, isChainProject, changedDocs } from "../scripts/hook-doc-check.ts";

const S = join(import.meta.dir, "..", "scripts");
const REQ = "# REQ-1: x\n\nStatus: Open\n\n## Summary\n\ns\n\nLast change: 2026-11-20, opened\n\n## Who asked and when\nMarta, 2026-11-12.\n## What they said\n> words\n## The problem behind it\np\n## Evidence\nUnknown\n## Decision\nOpen.\n";

function project(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-hook-"));
  for (const [p, t] of Object.entries(files)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  return root;
}

function hook(script: string, opts: { input?: object; cwd?: string; args?: string[] }) {
  const r = Bun.spawnSync([process.execPath, join(S, script), ...(opts.args ?? [])], {
    cwd: opts.cwd, stdin: Buffer.from(JSON.stringify(opts.input ?? {})), env: { ...process.env, CLAUDE_PROJECT_DIR: opts.cwd ?? "" },
  });
  return { code: r.exitCode, err: r.stderr.toString(), out: r.stdout.toString() };
}

test("a document path splits into its project root and its path under docs/", () => {
  expect(splitDocPath("C:\\p\\examples\\larder\\docs\\pickups\\PRD.md")).toEqual({ root: "C:/p/examples/larder", rel: "docs/pickups/PRD.md" });
  expect(splitDocPath("/p/src/index.ts")).toBeUndefined();
  expect(splitDocPath("/p/docs/diagram.png")).toBeUndefined();
});

test("each document kind maps to its check", () => {
  const root = project({
    "docs/pickups/PRD.md": "R-PICKUPS-1 a",
    "docs/pickups/frd/FRD-01-book.md": "x",
  });
  const args = (rel: string) => checksFor(root, rel).map((c) => c.args ?? c.fail);
  expect(args("docs/pickups/PRD.md")).toEqual([["prd", "docs/pickups/PRD.md", "PICKUPS"], ["summary", "docs/pickups/PRD.md"]]);
  expect(args("docs/pickups/frd/FRD-01-book.md")).toEqual([["frd", "docs/pickups", "PICKUPS"], ["summary", "docs/pickups/frd/FRD-01-book.md"]]);
  expect(args("docs/pickups/ux/UX-01-book.md")[0]).toEqual(["ux", "docs/pickups"]);
  expect(args("docs/tp/TP.md")[0]).toEqual(["tp", "docs/tp/TP.md", "docs/adr"]);
  expect(args("docs/pickups/tp/TP-01-book.md")[0]).toEqual(["tp", "docs/pickups/tp/TP-01-book.md", "docs/adr"]);
  expect(args("docs/pickups/specs/SPEC-01-1-book.md")[0]).toEqual(["spec", "docs/pickups/specs/SPEC-01-1-book.md"]);
  expect(args("docs/PRODUCT.md")).toEqual([["summary", "docs/PRODUCT.md"]]);
  expect(args("docs/requests/REQ-1-a.md")).toEqual([["summary", "docs/requests/REQ-1-a.md"]]);
  expect(args("docs/adr/ADR-001-a.md")).toEqual([["summary", "docs/adr/ADR-001-a.md"]]);
  for (const none of ["docs/DECISIONS.md", "docs/GLOSSARY.md", "docs/research/x.md", "docs/retro/RETRO.md"]) expect(args(none)).toEqual([]);
});

test("runDocChecks passes a good document and fails a mutant", () => {
  const good = project({ "docs/requests/REQ-1-a.md": REQ });
  expect(runDocChecks(good, "docs/requests/REQ-1-a.md")).toEqual([]);
  const noLast = project({ "docs/requests/REQ-1-a.md": REQ.replace("Last change: 2026-11-20, opened\n", "") });
  expect(runDocChecks(noLast, "docs/requests/REQ-1-a.md").some((f) => f.includes("Last change"))).toBe(true);
  const slop = project({ "docs/requests/REQ-1-a.md": REQ.replace("words", "a seamless flow") });
  expect(runDocChecks(slop, "docs/requests/REQ-1-a.md").some((f) => f.includes("seamless"))).toBe(true);
});

test("the edit hook: exit 0 for a good document and for code, exit 2 with the failures for a bad document", () => {
  const good = project({ "docs/PRODUCT.md": "Status: Draft\n", "docs/requests/REQ-1-a.md": REQ });
  const bad = project({ "docs/PRODUCT.md": "Status: Draft\n", "docs/requests/REQ-1-a.md": REQ.replace("Last change: 2026-11-20, opened\n", "") });
  const call = (root: string, file: string) => hook("hook-doc-check.ts", { cwd: root, input: { cwd: root, tool_input: { file_path: file } } });
  expect(call(good, join(good, "docs/requests/REQ-1-a.md")).code).toBe(0);
  expect(call(good, join(good, "src/index.ts")).code).toBe(0);
  const r = call(bad, join(bad, "docs", "requests", "REQ-1-a.md"));
  expect(r.code).toBe(2);
  expect(r.err).toContain("Last change");
  expect(hook("hook-doc-check.ts", { cwd: good, input: {} }).code).toBe(0);
});

const git = (root: string, ...a: string[]) => Bun.spawnSync(["git", ...a], { cwd: root });
const BAD_REQ = REQ.replace("Last change: 2026-11-20, opened\n", "");
const PRODUCT = "# P\n\nStatus: Draft\n\n## Summary\n\ns\n\nLast change: 2026-11-20, started\n";

function committed(files: Record<string, string>) {
  const root = project(files);
  git(root, "init");
  git(root, "add", ".");
  git(root, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-m", "x");
  return root;
}

test("a project without docs/PRODUCT.md is never touched, even with a broken document", () => {
  const root = project({ "docs/requests/REQ-1-a.md": BAD_REQ });
  expect(isChainProject(root)).toBe(false);
  const file = join(root, "docs", "requests", "REQ-1-a.md");
  expect(hook("hook-doc-check.ts", { cwd: root, input: { cwd: root, tool_input: { file_path: file } } }).code).toBe(0);
  expect(hook("hook-stop.ts", { cwd: root }).code).toBe(0);
  git(root, "init");
  git(root, "add", ".");
  expect(hook("pre-commit.ts", { cwd: root }).code).toBe(0);
}, 60000);

test("the stop hook checks only changed documents: legacy broken ones do not block, a changed broken one does", () => {
  const root = committed({ "docs/PRODUCT.md": PRODUCT, "docs/requests/REQ-1-legacy.md": BAD_REQ });
  expect(changedDocs(root)).toEqual([]);
  expect(hook("hook-stop.ts", { cwd: root }).code).toBe(0);
  writeFileSync(join(root, "docs/requests/REQ-2-new.md"), BAD_REQ);
  expect(changedDocs(root)).toEqual(["docs/requests/REQ-2-new.md"]);
  const r = hook("hook-stop.ts", { cwd: root });
  expect(r.code).toBe(2);
  expect(r.err).toContain("Last change");
  writeFileSync(join(root, "docs/requests/REQ-2-new.md"), REQ);
  expect(hook("hook-stop.ts", { cwd: root }).code).toBe(0);
  writeFileSync(join(root, "docs/requests/REQ-1-legacy.md"), BAD_REQ + "\nmore\n");
  expect(hook("hook-stop.ts", { cwd: root }).code).toBe(2);
}, 60000);

test("the stop hook warns but does not block again when stop_hook_active is true", () => {
  const root = committed({ "docs/PRODUCT.md": PRODUCT, "docs/requests/.keep.md": "x" });
  writeFileSync(join(root, "docs/requests/REQ-2-new.md"), BAD_REQ);
  expect(hook("hook-stop.ts", { cwd: root, input: { stop_hook_active: false } }).code).toBe(2);
  const r = hook("hook-stop.ts", { cwd: root, input: { stop_hook_active: true } });
  expect(r.code).toBe(0);
  expect(r.err).toContain("Last change");
}, 60000);

test("the stop hook fails on the chain status: an approved document holding an open question", () => {
  const root = committed({ "docs/PRODUCT.md": "Status: Approved (2026-11-17)\n## Open questions\nQ-1 who pays?\n" });
  const r = hook("hook-stop.ts", { cwd: root });
  expect(r.code).toBe(2);
  expect(r.err).toContain("Open questions");
}, 60000);

test("pre-commit checks staged documents and --all checks a whole project", () => {
  const commit = (text: string) => {
    const root = project({ "docs/PRODUCT.md": PRODUCT, "docs/requests/REQ-1-a.md": text });
    git(root, "init");
    git(root, "add", ".");
    return { root, r: hook("pre-commit.ts", { cwd: root }) };
  };
  expect(commit(REQ).r.code).toBe(0);
  const bad = commit(REQ.replace("Last change: 2026-11-20, opened\n", ""));
  expect(bad.r.code).toBe(1);
  expect(bad.r.err).toContain("commit blocked");
  expect(hook("pre-commit.ts", { cwd: bad.root, args: ["--all", bad.root] }).code).toBe(1);
  expect(hook("pre-commit.ts", { cwd: bad.root, args: ["--all", commit(REQ).root] }).code).toBe(0);
}, 60000);

// covers: chain/FRD-02/EX-17
// covers: chain/FRD-02/EX-18
// covers: chain/FRD-02/EX-19
test("changesetRule: code needs a new changeset, docs and tests do not", () => {
  const A = (p: string) => "A\t" + p, M = (p: string) => "M\t" + p;
  expect(changesetRule([M("scripts/check.ts")])).toHaveLength(1);
  expect(changesetRule([M("scripts/check.ts"), A(".changeset/x.md")])).toEqual([]);
  expect(changesetRule([M("scripts/check.ts"), M(".changeset/x.md")])).toHaveLength(1);
  expect(changesetRule([M("scripts/check.ts"), A(".changeset/README.md")])).toHaveLength(1);
  expect(changesetRule([M("docs/PRD.md"), M("test/a.ts"), M("src/b.test.ts"), M("x/__tests__/c.ts"), M("d.spec.ts"), M(".changeset/config.json")])).toEqual([]);
  expect(changesetRule([M("docs/PRD.md"), "R100\told.ts\tnew.ts"])).toHaveLength(1);
});

// covers: chain/FRD-02/EX-17
test("changesetRule: a rename checks both paths, and a deleted code file counts", () => {
  expect(changesetRule(["R100\tsrc/a.ts\tdocs/a.md"])).toHaveLength(1); // code moved into docs/
  expect(changesetRule(["R100\tdocs/a.md\tsrc/a.ts"])).toHaveLength(1);
  expect(changesetRule(["R100\tsrc/a.ts\tdocs/a.md", "A\t.changeset/x.md"])).toEqual([]);
  expect(changesetRule(["R100\tdocs/a.md\tdocs/b.md", "R090\ttest/a.ts\ttests/a.ts"])).toEqual([]);
  expect(changesetRule(["D\tsrc/a.ts"])).toHaveLength(1);
  expect(changesetRule(["D\tdocs/a.md", "D\ttest/a.ts"])).toEqual([]);
});

test("pre-commit blocks a commit that only deletes code, where changesets are configured", () => {
  const root = project({ "src/a.ts": "x", ".changeset/config.json": "{}" });
  git(root, "init");
  git(root, "add", ".");
  git(root, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-m", "init", "--no-verify");
  git(root, "rm", "src/a.ts");
  const r = hook("pre-commit.ts", { cwd: root });
  expect(r.code).toBe(1);
  expect(r.err).toContain("src/a.ts");
}, 60000);

// covers: chain/FRD-02/EX-17
// covers: chain/FRD-02/EX-18
// covers: chain/FRD-02/EX-20
test("pre-commit blocks code without a changeset only where .changeset/config.json exists", () => {
  const run = (files: Record<string, string>) => {
    const root = project(files);
    git(root, "init");
    git(root, "add", ".");
    return hook("pre-commit.ts", { cwd: root });
  };
  const code = { "src/a.ts": "x" };
  expect(run(code).code).toBe(0);
  const r = run({ ...code, ".changeset/config.json": "{}" });
  expect(r.code).toBe(1);
  expect(r.err).toContain("bunx changeset");
  expect(run({ ...code, ".changeset/config.json": "{}", ".changeset/a.md": "---\n---\nx\n" }).code).toBe(0);
}, 60000);

test("pre-commit --all fails a document edited after approval", () => {
  const root = project({ "docs/PRODUCT.md": PRODUCT });
  const cli = (...a: string[]) => Bun.spawnSync([process.execPath, join(S, "check.ts"), ...a], { cwd: root });
  expect(cli("approve", "docs/PRODUCT.md", ".").exitCode).toBe(0);
  expect(hook("pre-commit.ts", { cwd: root, args: ["--all", root] }).code).toBe(0);
  writeFileSync(join(root, "docs/PRODUCT.md"), readFileSync(join(root, "docs/PRODUCT.md"), "utf8") + "\nAn extra requirement.\n");
  const r = hook("pre-commit.ts", { cwd: root, args: ["--all", root] });
  expect(r.code).toBe(1);
  expect(r.err).toContain("body changed since approval");
}, 60000);
