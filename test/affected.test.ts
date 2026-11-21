import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { plan } from "../scripts/affected.ts";

const ROOT = join(import.meta.dir, "..");
const wf = (name: string) => readFileSync(join(ROOT, ".github", "workflows", name), "utf8");

// AFF-1
test("a changed hook script gives the test file the map names for it", () => {
  const r = plan(["scripts/hook-stop.ts"]);
  expect(Array.isArray(r)).toBe(true);
  expect(r).toContain("test/hooks.test.ts");
});

// AFF-1
test("a changed test file gives itself, next to the mapped tests of a changed script", () => {
  expect(plan(["test/gate.test.ts"])).toEqual(["test/gate.test.ts"]);
  const r = plan(["scripts/hook-stop.ts", "test/gate.test.ts"]) as string[];
  expect(r).toContain("test/hooks.test.ts");
  expect(r).toContain("test/gate.test.ts");
  expect(r.filter((f) => f === "test/gate.test.ts")).toHaveLength(1);
});

// AFF-2
test("a file the map cannot place runs the whole suite", () => {
  for (const f of ["package.json", "bun.lock", "tsconfig.json", ".github/workflows/ci.yml", "scripts/mutation.ts"]) expect(plan([f])).toBe("all");
  expect(plan(["scripts/hook-stop.ts", "package.json"])).toBe("all");
});

// AFF-3
test("a change with only documents runs nothing", () => {
  expect(plan(["README.md"])).toBe("none");
  expect(plan(["README.md", "docs/chain/PRD.md"])).toBe("none");
  expect(plan([])).toBe("none");
  expect(plan(["README.md", "test/gate.test.ts"])).not.toBe("none"); // mutant: one test file among documents
});

// AFF-4
test("the Windows leg and the example chain run only when the changed paths ask for them", () => {
  const ci = wf("ci.yml");
  expect(ci).toContain("--changed");
  expect(ci).toMatch(/windows/i);
  expect(ci).toContain("examples/");
  expect(ci).toContain("scripts/");
  expect(ci.match(/^\s*if:/gm)?.length ?? 0).toBeGreaterThanOrEqual(2); // gated steps or jobs
});

// AFF-5
test("the nightly run on main also runs the whole suite", () => {
  const m = wf("mutation.yml");
  expect(m).toMatch(/cron:/);
  expect(m).toMatch(/bun test(?! --changed)/);
});

// AFF-2
test("a fixture file, which no import graph reaches, runs the whole suite", () => {
  expect(plan(["test/fixtures/x.json"])).toBe("all");
  expect(plan(["test/gate.test.ts"])).not.toBe("all"); // mutant: a test file is not a fixture
});

// The computed branch of the diff step: what runs when a base exists, before the else that sets everything to run.
const diffStep = () => {
  const ci = wf("ci.yml");
  const step = ci.slice(ci.indexOf("id: diff"));
  return { step, computed: step.slice(step.indexOf("git diff --name-only"), step.indexOf("\n          else")) };
};

// AFF-6
test("an empty plan runs the whole suite: a -z guard on plan sets plan=all in the computed branch", () => {
  expect(diffStep().computed).toMatch(/\[\[?\s+-z\s+"\$\{?plan\}?"\s+\]\]?\s*;\s*then\s+plan=all\s*;\s*fi/);
});

// AFF-6
test("an empty code answer means code changed: a -z guard on code sets code=true in the computed branch", () => {
  expect(diffStep().computed).toMatch(/\[\[?\s+-z\s+"\$\{?code\}?"\s+\]\]?\s*;\s*then\s+code=true\s*;\s*fi/);
});

// AFF-6
test("a plan or code command that fails sets plan=all or code=true, and takes code from the script", () => {
  const { computed } = diffStep();
  expect(computed).toMatch(/plan=\$\(bun scripts\/affected\.ts[^\n]*\)\s*\|\|\s*plan=all/);
  expect(computed).toMatch(/code=\$\(bun scripts\/affected\.ts[^\n]*\)\s*\|\|\s*code=true/);
  expect(computed).not.toMatch(/grep[^\n]*(\\\.md|docs\/)/); // no second document rule in the workflow
  expect(computed).not.toMatch(/grep[^\n]*&&\s*code=true/); // code is not set from a grep
});

// AFF-6
test("the plan command's exit status is not hidden by a pipe", () => {
  const { step } = diffStep();
  const line = step.split("\n").find((l) => l.includes("plan=$(bun scripts/affected.ts")) as string;
  expect(line).toBeDefined();
  const piped = /[^|]\|[^|]/.test(line.slice(line.indexOf("plan=$(")).replace(/\)\s*\|\|.*/, ")"));
  if (piped) expect(step.slice(0, step.indexOf("plan=$(bun"))).toMatch(/set\s+-[a-z]*o\s+pipefail|set\s+-o\s+pipefail/);
  else expect(piped).toBe(false);
});

// AFF-3
test("a template or a skill is product text: it runs the whole suite", () => {
  expect(plan(["templates/SPEC.md"])).toBe("all");
  expect(plan(["skills/review/SKILL.md"])).toBe("all");
  expect(plan(["README.md"])).toBe("none"); // mutant: a document is still nothing
});

const code = (...files: string[]) =>
  Bun.spawnSync([process.execPath, join(ROOT, "scripts", "affected.ts"), "--code"], { cwd: ROOT, stdin: Buffer.from(files.join("\n") + "\n") })
    .stdout.toString()
    .trim();

// AFF-2
test("a markdown file under test/fixtures is a fixture, not a document: the whole suite runs and code changed", () => {
  for (const f of ["test/fixtures/x.md", "test/fixtures/format-1/examples/larder/docs/a.md"]) {
    expect(plan([f])).toBe("all");
    expect(code(f)).toBe("true");
  }
  expect(plan(["docs/x.md"])).toBe("none"); // mutant: a document outside the fixtures is still nothing
  expect(code("README.md")).not.toBe("true");
});

// AFF-5
test("the nightly suite job runs bun test with the long timeout, on its own line", () => {
  const w = wf("mutation.yml");
  const suite = w.slice(w.indexOf("\n  suite:"), w.indexOf("\n  mutation:"));
  expect(suite).toMatch(/^\s+- run: bun test --timeout 120000\s*$/m);
});
