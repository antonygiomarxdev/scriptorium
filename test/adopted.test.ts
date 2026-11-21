import { test, expect } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const S = join(import.meta.dir, "..", "scripts");
const FIXTURE = join(import.meta.dir, "fixtures", "adopted");
// What the fixture must hold (the tests read these paths):
//   .scriptorium/config.json            {"format":3,"legacyAdrsThrough":5}
//   docs/PRODUCT.md                     approved, tables padded, the word "shall" in its body
//   docs/adopted/PRD.md, docs/adopted/frd/FRD-01-*.md, docs/adopted/tp/TP-01-*.md (one file each)
//   docs/adr/0003-*.md                  a legacy ADR: bare, none of the ADR sections; the TP cites ADR-0003
//   docs/adr/ADR-0006-*.md              a full ADR from the template; the TP cites ADR-0006
//   docs/requests/REQ-*.md              accepted, with Decision ids the TP rests on and cites
//   archive/linear/plan.md              holds the banned phrase "delve"
//   the FRD has a line "Source: [..](../../../archive/linear/plan.md)" linking it

const run = (script: string, ...args: string[]) => {
  const r = Bun.spawnSync([process.execPath, join(S, script), ...args], { cwd: join(import.meta.dir, "..") });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
};
const only = (dir: string, prefix: string) => {
  const found = readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith(".md"));
  expect(found).toHaveLength(1);
  return join(dir, found[0] as string);
};
const checks = (root: string) => {
  const docs = join(root, "docs");
  return {
    status: () => run("check.ts", "status", root),
    lint: () => run("lint-docs.ts", root),
    tp: () => run("check.ts", "tp", only(join(docs, "adopted", "tp"), "TP-"), join(docs, "adr"), "--root", docs),
    frd: () => only(join(docs, "adopted", "frd"), "FRD-"),
  };
};
const copy = () => {
  const dest = mkdtempSync(join(tmpdir(), "scriptorium-adopted-"));
  cpSync(FIXTURE, dest, { recursive: true });
  return dest;
};

// covers: chain/FRD-09/EX-1
test("EX-1: status, the docs lint and the TP check pass on the adopted fixture, run from the repository root", () => {
  expect(existsSync(FIXTURE)).toBe(true);
  const c = checks(FIXTURE);
  for (const [name, r] of [
    ["status", c.status()],
    ["lint", c.lint()],
    ["tp", c.tp()],
  ] as const)
    expect([name, r.code, r.code === 0 ? "" : r.out]).toEqual([name, 0, ""]);
});

// covers: chain/FRD-09/EX-2
test("EX-2: without legacyAdrsThrough the legacy ADR fails the TP check on its missing sections", () => {
  const root = copy();
  writeFileSync(join(root, ".scriptorium", "config.json"), '{"format":3}');
  const r = checks(root).tp();
  expect(r.code).toBe(1);
  expect(r.out).toContain("missing section");
  expect(r.out).toContain("0003");
});

// covers: chain/FRD-09/EX-3
test("EX-3: one changed word in the approved document makes status fail with body changed since approval", () => {
  const root = copy();
  const product = join(root, "docs", "PRODUCT.md");
  const text = readFileSync(product, "utf8");
  expect(text).toContain("shall");
  writeFileSync(product, text.replace("shall", "should"));
  const r = checks(root).status();
  expect(r.code).toBe(1);
  expect(r.out).toContain("body changed since approval");
});

// covers: chain/FRD-09/EX-4
test("EX-4: the archive holds a banned phrase and nothing is reported for it, and the Source link resolves", () => {
  const plan = join(FIXTURE, "archive", "linear", "plan.md");
  expect(readFileSync(plan, "utf8").toLowerCase()).toContain("delve");
  const frd = checks(FIXTURE).frd();
  const link = readFileSync(frd, "utf8").match(/^Source:.*\]\(([^)]*archive\/linear\/plan\.md)\)/m);
  expect(link).not.toBeNull();
  expect(existsSync(join(frd, "..", link?.[1] as string))).toBe(true);
  const r = checks(FIXTURE).lint();
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("archive");
});

// covers: chain/FRD-09/EX-5
test("EX-5: a Source line linking a file that is not in the archive fails the docs lint", () => {
  const root = copy();
  const frd = checks(root).frd();
  const text = readFileSync(frd, "utf8");
  expect(text).toContain("archive/linear/plan.md");
  writeFileSync(frd, text.replace("archive/linear/plan.md", "archive/linear/missing.md"));
  const r = checks(root).lint();
  expect(r.code).toBe(1);
  expect(r.out).toContain("link does not resolve");
});

// covers: chain/FRD-09/EX-1
test("EX-1: approve run from another folder records the parent, and status then passes on the copy", () => {
  const root = copy();
  const prd = join(root, "docs", "adopted", "PRD.md");
  const text = readFileSync(prd, "utf8");
  expect(text).toMatch(/^Approval: .*rests on \.\.\/PRODUCT\.md/m);
  writeFileSync(prd, text.replace(/^Status: Approved.*\n(Approval:.*\n)?/m, "Status: Draft\n")); // back to a draft, so approve has work to do
  expect(readFileSync(prd, "utf8")).not.toContain("Approval:");
  const a = run("check.ts", "approve", prd); // the working folder is the repository root, not the copy
  expect(a.code).toBe(0);
  const after = readFileSync(prd, "utf8").split("\n");
  expect(after[2]).toMatch(/^Status: Approved/);
  expect(after[3]).toMatch(/^Approval: content \S+; rests on \.\.\/PRODUCT\.md \S+$/);
  const s = checks(root).status();
  expect(s.code).toBe(0);
  expect(s.out).not.toContain("suspect");
});
