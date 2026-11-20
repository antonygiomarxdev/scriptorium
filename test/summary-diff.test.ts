import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { staleSummary, waived } from "../scripts/summary-diff.ts";

const SCRIPT = join(import.meta.dir, "..", "scripts", "summary-diff.ts");
const doc = (sum: string, body: string) => "# T\n\n## Summary\n\n" + sum + "\n\n## Rest\n\n" + body + "\n";

test("body change with summary change passes; body-only fails; summary-only, no Summary and new files pass", () => {
  expect(staleSummary(doc("a", "x"), doc("b", "y"))).toBe(false);
  expect(staleSummary(doc("a", "x"), doc("a", "y"))).toBe(true);
  expect(staleSummary(doc("a", "x"), doc("b", "x"))).toBe(false);
  expect(staleSummary("# G\nx\n", "# G\ny\n")).toBe(false);
  expect(staleSummary(undefined, doc("a", "y"))).toBe(false);
  expect(staleSummary(doc("a", "x"), doc("a", "x").replace(/\n/g, "\r\n"))).toBe(false); // CRLF is not a change
});

test("the waiver names the file or all, and needs a reason", () => {
  expect(waived("x\nSummary unchanged: docs/a/PRD.md, typo", "docs/a/PRD.md")).toBe(true);
  expect(waived("Summary unchanged: all, typos", "docs/a/PRD.md")).toBe(true);
  expect(waived("Summary unchanged: docs/b/PRD.md, typo", "docs/a/PRD.md")).toBe(false);
  expect(waived("Summary unchanged:", "docs/a/PRD.md")).toBe(false);
  expect(waived("Summary unchanged: docs/a/PRD.md, fixed all typos", "docs/b/FRD.md")).toBe(false);
  expect(waived("Summary unchanged: docs/a/PRD.md.bak, typo", "docs/a/PRD.md")).toBe(false);
  expect(waived("Summary unchanged: docs/b/FRD.md docs/a/PRD.md, typo", "docs/a/PRD.md")).toBe(true);
  expect(waived("nothing", "docs/a/PRD.md")).toBe(false);
  // covers: chain/FRD-02/EX-24
  expect(waived("Summary unchanged: docs\\a\\PRD.md, typo", "docs/a/PRD.md")).toBe(true); // typed with backslashes
  expect(waived("Summary unchanged: docs\\b\\PRD.md, typo", "docs/a/PRD.md")).toBe(false);
});

// A temp git repo: base commit holds docs/a/PRD.md, a branch edits it.
function run(edit: (dir: string) => void, body = "") {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-sd-"));
  const git = (...a: string[]) => {
    const r = Bun.spawnSync(["git", "-c", "user.name=t", "-c", "user.email=t@t", ...a], { cwd: dir });
    if (r.exitCode) throw new Error(r.stderr.toString());
  };
  git("init", "-q", "-b", "main");
  mkdirSync(join(dir, "docs", "a"), { recursive: true });
  writeFileSync(join(dir, "docs", "a", "PRD.md"), doc("old", "old"));
  git("add", ".");
  git("commit", "-qm", "base");
  git("checkout", "-qb", "pr");
  edit(dir);
  git("add", ".");
  git("commit", "-qm", "change");
  const r = Bun.spawnSync(["bun", SCRIPT, "main"], { cwd: dir, env: { ...process.env, PR_BODY: body } });
  return { code: r.exitCode, out: r.stdout.toString() };
}
const put = (rel: string, text: string) => (dir: string) => {
  mkdirSync(join(dir, rel, ".."), { recursive: true });
  writeFileSync(join(dir, rel), text);
};

test("in a pull request: body+summary passes, body-only fails, waiver passes, new file passes", () => {
  expect(run(put("docs/a/PRD.md", doc("new", "new"))).code).toBe(0);
  const bad = run(put("docs/a/PRD.md", doc("old", "new")));
  expect(bad.code).toBe(1);
  expect(bad.out).toContain("docs/a/PRD.md");
  expect(run(put("docs/a/PRD.md", doc("old", "new")), "Summary unchanged: docs/a/PRD.md, typo fix").code).toBe(0);
  expect(run(put("docs/a/frd/FRD-01-x.md", doc("n", "n"))).code).toBe(0);
  expect(run(put("docs/GLOSSARY.md", "x\n")).code).toBe(0);
}, 60000); // each run spawns a dozen processes; Windows needs the time
