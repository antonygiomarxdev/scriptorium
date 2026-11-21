import { test, expect } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as mutation from "../scripts/mutation.ts";
import { summary, unmapped } from "../scripts/mutation.ts";

const ROOT = join(import.meta.dir, "..");
const workflow = () => readFileSync(join(ROOT, ".github", "workflows", "mutation.yml"), "utf8");

// A report in the shape of the tool's JSON report: files, each with mutants that carry a status, a mutator and a location.
const mutant = (id: string, status: string, mutatorName: string, line: number) => ({ id, status, mutatorName, location: { start: { line, column: 1 }, end: { line, column: 9 } } });
const report = (files: Record<string, ReturnType<typeof mutant>[]>) => ({ schemaVersion: "2", thresholds: { high: 80, low: 60 }, files: Object.fromEntries(Object.entries(files).map(([f, mutants]) => [f, { language: "typescript", source: "", mutants }])) });

// MUT-2
test("a script missing from the map is reported as unmapped, and a mapped one is not", () => {
  const r = unmapped(["scripts/check.ts", "scripts/brand-new-script.ts"]);
  expect(r).toContain("scripts/brand-new-script.ts");
  expect(r).not.toContain("scripts/check.ts");
});

// MUT-2
test("every script in the repository is in the map", () => {
  expect(unmapped()).toEqual([]);
});

// MUT-3
test("survivors give a body grouped by file with line and mutator, and killed mutants stay out", () => {
  const body = summary(
    report({
      "scripts/a.ts": [mutant("1", "Survived", "ConditionalExpression", 12), mutant("2", "Killed", "StringLiteral", 13), mutant("3", "Survived", "EqualityOperator", 40)],
      "scripts/b.ts": [mutant("4", "Survived", "BlockStatement", 7)],
      "scripts/c.ts": [mutant("5", "Killed", "ArithmeticOperator", 3)],
    }),
  ) as string;
  expect(body).toBeDefined();
  for (const s of ["scripts/a.ts", "scripts/b.ts", "ConditionalExpression", "EqualityOperator", "BlockStatement"]) expect(body).toContain(s);
  expect(body).toMatch(/\b12\b/);
  expect(body).toMatch(/\b40\b/);
  expect(body).toMatch(/\b7\b/);
  expect(body).not.toContain("StringLiteral"); // killed
  expect(body).not.toContain("scripts/c.ts"); // nothing survived there
  expect(body.split("scripts/a.ts").length).toBe(2); // a file is named once: grouped
  expect(body.indexOf("scripts/a.ts")).toBeLessThan(body.indexOf("EqualityOperator"));
  expect(body.indexOf("EqualityOperator")).toBeLessThan(body.indexOf("scripts/b.ts"));
});

// MUT-3
test("a report with no survivors gives undefined, so no issue is opened", () => {
  expect(summary(report({ "scripts/a.ts": [mutant("1", "Killed", "StringLiteral", 1)] }))).toBeUndefined();
  expect(summary(report({}))).toBeUndefined();
});

// MUT-1
test("the workflow runs on a schedule and on manual dispatch only, on main", () => {
  const w = workflow();
  expect(w).toMatch(/cron:\s*["']0 9 \* \* \*["']/);
  expect(w).toContain("workflow_dispatch");
  expect(w).not.toMatch(/^\s*(push|pull_request|pull_request_target):/m);
  expect(w).toContain("main");
});

// MUT-1
test("the tool is not in the project: no mutation dependency or script in package.json", () => {
  const pkg = readFileSync(join(ROOT, "package.json"), "utf8").toLowerCase();
  expect(pkg).not.toContain("stryker");
  expect(pkg).not.toContain("mutation");
});

// MUT-4
test("the workflow caches the incremental file between runs", () => {
  const w = workflow();
  expect(w).toContain("actions/cache");
  expect(w).toContain("--incremental");
});

// MUT-5
test("the tool is pinned to an exact version of its package", () => {
  const w = workflow();
  expect(w).toContain("@stryker-mutator/core@10.1.1");
  expect(w).not.toMatch(/@stryker-mutator\/core(@(latest|\^|~|\*)|\s|$)/m);
});

// MUT-2
test("the real scripts list is not empty and every script in it is mapped", () => {
  const real = readdirSync(join(ROOT, "scripts"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => "scripts/" + f);
  expect(real.length).toBeGreaterThan(5);
  expect(unmapped(real)).toEqual([]);
});

// MUT-2
test("every test file the map names exists", () => {
  // the map is the exported plain object whose values are test paths (a string or a list per script)
  const map = Object.values(mutation).find((v) => v && typeof v === "object" && !Array.isArray(v)) as Record<string, string | string[]> | undefined;
  expect(map).toBeDefined();
  const entries = Object.entries(map as Record<string, string | string[]>);
  expect(entries.length).toBeGreaterThan(5);
  for (const [script, tests] of entries) {
    expect(script.startsWith("scripts/")).toBe(true);
    for (const f of ([] as string[]).concat(tests)) expect([f, existsSync(join(ROOT, f))]).toEqual([f, true]);
  }
});

// MUT-3
test("the summary command merges several reports into one body, and prints nothing when none survived", () => {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-mutation-"));
  const write = (n: string, r: object) => (writeFileSync(join(dir, n), JSON.stringify(r)), join(dir, n));
  const a = write("a.json", report({ "scripts/a.ts": [mutant("1", "Survived", "ConditionalExpression", 12)] }));
  const b = write("b.json", report({ "scripts/b.ts": [mutant("2", "Survived", "BlockStatement", 7)] }));
  const none = write("none.json", report({ "scripts/c.ts": [mutant("3", "Killed", "StringLiteral", 1)] }));
  const run = (...f: string[]) => Bun.spawnSync([process.execPath, join(ROOT, "scripts", "mutation.ts"), "summary", ...f], { cwd: ROOT }).stdout.toString();
  const merged = run(a, b);
  for (const s of ["scripts/a.ts", "ConditionalExpression", "scripts/b.ts", "BlockStatement"]) expect(merged).toContain(s);
  expect(run(a, none)).not.toContain("scripts/c.ts");
  expect(run(none, none).trim()).toBe("");
});

// The steps of the mutation job, each as its own text: a step starts at a "- " at the step indent.
const steps = () =>
  workflow()
    .slice(workflow().indexOf("\n  mutation:"))
    .split(/\n      - /)
    .slice(1);
const stepWith = (s: string) => {
  const found = steps().filter((x) => x.includes(s));
  expect(found).toHaveLength(1);
  return found[0] as string;
};
const loop = (step: string) => step.slice(step.indexOf("while "), step.indexOf("\n          done"));

// MUT-6
test("the Stryker run line of each file appends the file to failed.txt when the tool fails", () => {
  const run = stepWith("@stryker-mutator/core@10.1.1");
  const body = loop(run);
  const cmd = body.slice(body.indexOf("npx"), body.indexOf("failed.txt", body.indexOf("npx")));
  expect(cmd).toContain("@stryker-mutator/core@10.1.1 run");
  expect(cmd).not.toContain("[ -s"); // the first failed.txt write comes from the tool's own command, not the report check
  expect(cmd).toMatch(/\|\|\s*echo "\$file"\s*>>\s*$/); // the || echo belongs to the tool's own command
  expect(run).toMatch(/:\s*>\s*failed\.txt/); // the list starts empty for each run
  expect(run.indexOf("failed.txt")).toBeLessThan(run.indexOf("while "));
});

// MUT-6
test("a step inside the loop checks that the file's report is non-empty", () => {
  const body = loop(stepWith("@stryker-mutator/core@10.1.1"));
  expect(body).toMatch(/\[\s+-s\s+"reports\/\$name\.json"\s+\]\s*\|\|\s*echo "\$file"\s*>>\s*failed\.txt/);
  expect(body.indexOf("-s ")).toBeGreaterThan(body.indexOf("@stryker-mutator/core")); // checked after the run, not before
});

// MUT-6
test("Run failed for: is written in the step that writes body.md, from failed.txt", () => {
  const w = stepWith("> body.md");
  expect(w).toContain("Run failed for:");
  expect(w).toMatch(/-s failed\.txt/); // only when something failed
  expect(w.indexOf("Run failed for:")).toBeLessThan(w.indexOf("> body.md"));
  for (const other of steps().filter((x) => x !== w && x.includes("Run failed for:"))) expect(other).toContain("exit 1"); // the failing step may name it too, no other step writes it into the body
});

// MUT-6
test("the last step of the job exits 1 when failed.txt is not empty", () => {
  const last = steps().at(-1) as string;
  expect(last).toMatch(/\[?\s*-s failed\.txt/);
  expect(last).toContain("exit 1");
  expect(last).toContain("cat failed.txt");
  expect(last).not.toContain("body.md");
});

// MUT-4
test("the incremental cache is saved even when the job fails", () => {
  const w = workflow();
  expect(w).toContain("actions/cache/restore");
  const save = stepWith("actions/cache/save");
  expect(save).toMatch(/if:\s*always\(\)/);
  expect(save).toContain(".stryker-incremental");
  expect(steps().findIndex((x) => x.includes("actions/cache/save"))).toBeGreaterThan(steps().findIndex((x) => x.includes("@stryker-mutator/core@10.1.1"))); // saved after the runs
});

// MUT-4
test("the run asks for incremental mode as its own flag, and the restore step falls back to the last run's cache", () => {
  const run = stepWith("@stryker-mutator/core@10.1.1");
  expect(run).toMatch(/\s--incremental(?![A-Za-z])/); // --incrementalFile does not count
  expect(run).toContain("--incrementalFile");
  const restore = stepWith("actions/cache/restore");
  expect(restore).toMatch(/key:\s*mutation-\$\{\{\s*github\.run_id\s*\}\}/);
  expect(restore).toMatch(/restore-keys:\s*\|?\s*mutation-\s*$/m);
});

// MUT-3
test("a run with no survivors opens nothing: the issue step stops on an empty body before it calls gh", () => {
  const issue = stepWith("gh issue");
  const guard = issue.indexOf("[ -s body.md ] || exit 0");
  expect(guard).toBeGreaterThan(-1);
  expect(guard).toBeLessThan(issue.indexOf("gh issue create"));
  expect(guard).toBeLessThan(issue.indexOf("gh issue comment"));
  expect(guard).toBeLessThan(issue.indexOf("gh issue list"));
});

// MUT-1
test("both jobs run on main only", () => {
  const w = workflow();
  const suite = w.slice(w.indexOf("\n  suite:"), w.indexOf("\n  mutation:"));
  const mutation = w.slice(w.indexOf("\n  mutation:"));
  for (const job of [suite, mutation]) expect(job.slice(0, job.indexOf("steps:"))).toMatch(/^\s+if:\s*github\.ref == 'refs\/heads\/main'\s*$/m);
  expect(suite.length).toBeGreaterThan(50);
});

// MUT-2
test("unmapped() with no argument reads the scripts folder: a new script there is reported", () => {
  const probe = join(ROOT, "scripts", "zz-unmapped-probe.ts");
  writeFileSync(probe, "export {};\n");
  try {
    expect(unmapped()).toEqual(["scripts/zz-unmapped-probe.ts"]);
  } finally {
    rmSync(probe, { force: true });
  }
  expect(unmapped()).toEqual([]);
});
