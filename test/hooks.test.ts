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
    cwd: opts.cwd,
    stdin: Buffer.from(JSON.stringify(opts.input ?? {})),
    env: { ...process.env, CLAUDE_PROJECT_DIR: opts.cwd ?? "" },
  });
  return { code: r.exitCode, err: r.stderr.toString(), out: r.stdout.toString() };
}

// covers: chain/FRD-02/EX-24
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
  expect(args("docs/pickups/PRD.md")).toEqual([
    ["prd", "docs/pickups/PRD.md", "PICKUPS"],
    ["summary", "docs/pickups/PRD.md"],
  ]);
  expect(args("docs/pickups/frd/FRD-01-book.md")).toEqual([
    ["frd", "docs/pickups", "PICKUPS"],
    ["summary", "docs/pickups/frd/FRD-01-book.md"],
  ]);
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
  const A = (p: string) => "A\t" + p,
    M = (p: string) => "M\t" + p;
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
  const root = project({ "src/a.ts": "x", ".changeset/config.json": "{}", ".scriptorium/config.json": '{"format":2}' });
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
  const r = run({ ...code, ".changeset/config.json": "{}", ".scriptorium/config.json": '{"format":2}' });
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

// covers: chain/FRD-03/EX-6
// covers: chain/FRD-03/EX-7
test("EX-6, EX-7: a missing changeset warns under format 1 and blocks under format 2", () => {
  const repo = project({ ".changeset/config.json": "{}", "scripts/a.ts": "x" });
  const git = (...a: string[]) => Bun.spawnSync(["git", ...a], { cwd: repo });
  git("init", "-q"), git("add", "scripts/a.ts");
  const run = () => Bun.spawnSync([process.execPath, join(S, "pre-commit.ts")], { cwd: repo });
  const r = run();
  expect(r.exitCode).toBe(0);
  expect(r.stdout.toString()).toContain("WARN (format 2): Changeset missing");
  mkdirSync(join(repo, ".scriptorium"));
  writeFileSync(join(repo, ".scriptorium", "config.json"), '{"format":2}');
  expect(run().exitCode).toBe(1);
});

// covers: chain/FRD-03/EX-3
test("the stop hook in a project pinned to an unknown format passes with the update warning", () => {
  const root = project({ "docs/PRODUCT.md": "x", ".scriptorium/config.json": '{"format": 9}' });
  const r = hook("hook-stop.ts", { cwd: root });
  expect(r.code).toBe(0);
  expect(r.err).toContain("this project uses format 9; this Scriptorium knows up to 4: update Scriptorium");
  const ok = project({ "docs/PRODUCT.md": "x", ".scriptorium/config.json": '{"format": 2}' }); // mutant: a known pin gives no warning
  expect(hook("hook-stop.ts", { cwd: ok }).err).not.toContain("update Scriptorium");
});

const gateCall = (root: string, rel: string) => hook("hook-gate.ts", { cwd: root, input: { cwd: root, tool_input: { file_path: join(root, rel) } } });
const PIN2 = '{"format":2}';

// covers: chain/FRD-04/EX-9
test("pre-commit fails a staged code file no approved spec lists, and names it", () => {
  const root = project({ "docs/PRODUCT.md": PRODUCT, "scripts/b.ts": "x", ".scriptorium/config.json": PIN2 });
  git(root, "init");
  git(root, "add", ".");
  const r = hook("pre-commit.ts", { cwd: root });
  expect(r.code).toBe(1);
  expect(r.err + r.out).toContain("scripts/b.ts");
  const docsOnly = project({ "docs/PRODUCT.md": PRODUCT, ".scriptorium/config.json": PIN2 }); // mutant: nothing to gate
  git(docsOnly, "init");
  git(docsOnly, "add", ".");
  expect(hook("pre-commit.ts", { cwd: docsOnly }).code).toBe(0);
}, 60000);

// covers: chain/FRD-04/EX-12
test("under format 1 the edit hook warns with the refusal text and lets the edit go ahead", () => {
  const root = project({ "docs/PRODUCT.md": PRODUCT, "scripts/b.ts": "x" });
  const r = gateCall(root, "scripts/b.ts");
  expect(r.code).toBe(0);
  expect(r.err + r.out).toContain("WARN (format 2):");
  expect(r.err + r.out).toContain("scripts/b.ts: no approved spec names it in its Files table");
  const pinned = project({ "docs/PRODUCT.md": PRODUCT, "scripts/b.ts": "x", ".scriptorium/config.json": PIN2 }); // mutant: format 2 refuses
  const p = gateCall(pinned, "scripts/b.ts");
  expect(p.code).toBe(2);
  expect(p.err).toContain("scripts/b.ts: no approved spec names it in its Files table");
});

// covers: chain/FRD-04/EX-13
test("a project without docs/PRODUCT.md: the edit hook does nothing", () => {
  const root = project({ "scripts/b.ts": "x", ".scriptorium/config.json": PIN2 });
  const r = gateCall(root, "scripts/b.ts");
  expect(r.code).toBe(0);
  expect(r.err + r.out).toBe("");
});

// covers: chain/FRD-03/EX-26
test("EX-26: pre-commit blocks a staged pin lower than HEAD's", () => {
  const pinAt = (head: string | undefined, staged: string) => {
    const root = committed({ "docs/PRODUCT.md": PRODUCT, ...(head ? { ".scriptorium/config.json": head } : {}), "keep.txt": "x" });
    mkdirSync(join(root, ".scriptorium"), { recursive: true });
    writeFileSync(join(root, ".scriptorium/config.json"), staged);
    git(root, "add", ".scriptorium/config.json");
    return hook("pre-commit.ts", { cwd: root });
  };
  const down = pinAt(PIN2, '{"format":1}');
  expect(down.code).toBe(1);
  expect(down.err + down.out).toContain("one-way");
  expect(pinAt(undefined, '{"format":1}').code).toBe(0); // mutant: no HEAD pin means format 1, so no downgrade
  expect(pinAt('{"format":1}', PIN2).code).toBe(0); // going up is fine
}, 60000);

// covers: chain/FRD-04/EX-16
test("EX-16: input the edit hook cannot parse exits 2 and says why", () => {
  const root = project({ "docs/PRODUCT.md": PRODUCT, ".scriptorium/config.json": PIN2 });
  const r = Bun.spawnSync([process.execPath, join(S, "hook-gate.ts")], { cwd: root, stdin: Buffer.from("not json {"), env: { ...process.env, CLAUDE_PROJECT_DIR: root } });
  expect(r.exitCode).toBe(2);
  expect(r.stderr.toString().length).toBeGreaterThan(0);
  expect(gateCall(root, "test/a.test.ts").code).toBe(0); // mutant: valid input for an exempt file goes ahead
});

// covers: chain/FRD-04/EX-17
test("EX-17: NotebookEdit is gated through notebook_path", () => {
  const root = project({ "docs/PRODUCT.md": PRODUCT, ".scriptorium/config.json": PIN2 });
  const note = (rel: string) => hook("hook-gate.ts", { cwd: root, input: { cwd: root, tool_name: "NotebookEdit", tool_input: { notebook_path: join(root, rel) } } });
  const r = note("notes/a.ipynb");
  expect(r.code).toBe(2);
  expect(r.err).toContain("notes/a.ipynb");
  expect(note("test/a.ipynb").code).toBe(0); // mutant: a notebook in a test folder is exempt
});

// covers: chain/FRD-04/EX-18
test("EX-18: the plugin's hook configuration runs the edit hook for every editing tool", () => {
  const cfg = JSON.parse(readFileSync(join(S, "..", "hooks", "hooks.json"), "utf8"));
  const entry = cfg.hooks.PreToolUse.find((e: { hooks: { args?: string[]; command?: string }[] }) => e.hooks.some((h) => JSON.stringify(h).includes("hook-gate.ts")));
  expect(entry).toBeDefined();
  expect(entry.matcher.split("|").sort()).toEqual(expect.arrayContaining(["Edit", "MultiEdit", "NotebookEdit", "Write"]));
});

// covers: metrics/FRD-01/EX-6
test("EX-6: pre-commit blocks any commit while the rework log fails, with the same line", () => {
  const causes = "| ID | Step | Cause | Open | Prevention | Since |\n|---|---|---|---|---|---|\n| C-1 | FRD | c | 0 | none | n/a |\n";
  const findings = "| ID | Date | Change | Cause | Finding |\n|---|---|---|---|---|\n| R-1 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n| R-2 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n";
  const log = "# Rework queue\n\nStatus: Draft\n\n## Causes\n\n" + causes + "\n## Open findings\n\n" + findings;
  const run = (pin: string, text: string) => {
    const root = project({ "docs/PRODUCT.md": PRODUCT, "docs/metrics/rework.md": text, "docs/keep.md": "x", ".scriptorium/config.json": pin });
    git(root, "init");
    git(root, "add", "docs/keep.md");
    return hook("pre-commit.ts", { cwd: root });
  };
  const r = run('{"format":3}', log);
  expect(r.code).toBe(1);
  expect(r.err + r.out).toContain("C-1 (FRD) found 2 times with no prevention: R-1, R-2");
  expect(run('{"format":3}', log.replace("| R-2 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n", "")).code).toBe(0); // mutant: one finding passes
}, 60000);

// covers: metrics/FRD-01/EX-6
test("EX-6: the rework gate of pre-commit runs when only a non-document file is staged", () => {
  const log = (findings: string) => "# Rework queue\n\nStatus: Draft\n\n## Causes\n\n| ID | Step | Cause | Open | Prevention | Since |\n|---|---|---|---|---|---|\n| C-1 | FRD | c | 0 | none | n/a |\n\n## Open findings\n\n| ID | Date | Change | Cause | Finding |\n|---|---|---|---|---|\n" + findings;
  const R1 = "| R-1 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n";
  const R2 = "| R-2 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n";
  const run = (text: string) => {
    const root = project({ "docs/PRODUCT.md": PRODUCT, "docs/metrics/rework.md": text, "test/keep.txt": "x", ".scriptorium/config.json": '{"format":3}' });
    git(root, "init");
    git(root, "add", "test/keep.txt"); // only this file is staged: no document, exempt from the edit gate
    return hook("pre-commit.ts", { cwd: root });
  };
  const r = run(log(R1 + R2));
  expect(r.code).toBe(1);
  expect(r.err + r.out).toContain("C-1 (FRD) found 2 times with no prevention: R-1, R-2");
  expect(run(log(R1)).code).toBe(0); // mutant: one finding passes
}, 60000);

// covers: metrics/FRD-01/EX-15
test("EX-15: pre-commit at pin 2 passes with the failing rework log and prints the format 3 warning", () => {
  const log =
    "# Rework queue\n\nStatus: Draft\n\n## Causes\n\n| ID | Step | Cause | Open | Prevention | Since |\n|---|---|---|---|---|---|\n| C-1 | FRD | c | 0 | none | n/a |\n\n## Open findings\n\n| ID | Date | Change | Cause | Finding |\n|---|---|---|---|---|\n| R-1 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n| R-2 | 2026-11-20 | SPEC-01-1 | C-1 | f |\n";
  const run = (pin: string) => {
    const root = project({ "docs/PRODUCT.md": PRODUCT, "docs/metrics/rework.md": log, "docs/keep.md": "x", ".scriptorium/config.json": pin });
    git(root, "init");
    git(root, "add", "docs/keep.md");
    return hook("pre-commit.ts", { cwd: root });
  };
  const r = run('{"format":2}');
  expect(r.code).toBe(0);
  const out = r.err + r.out;
  expect(out).toContain("WARN (format 3): ");
  expect(out).toContain("C-1 (FRD) found 2 times with no prevention: R-1, R-2");
  expect(run('{"format":3}').code).toBe(1); // mutant: under format 3 the same log blocks
}, 60000);
