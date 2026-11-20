import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { approve, clear, driftFails, driftReport, fingerprint } from "../scripts/drift.ts";

const PRODUCT = "# Product\n\nStatus: Draft\n\n## Summary\n\nA.\n\nLast change: 2026-11-01, x\n\nR-1 the system shall work.\n";
const PRD = "# PRD\n\nStatus: Draft\n\n## Summary\n\nB.\n\nLast change: 2026-11-01, x\n\nThe system shall do RULE-1.\n";

function project() {
  const root = mkdtempSync(join(tmpdir(), "drift-"));
  mkdirSync(join(root, "docs", "chain"), { recursive: true });
  const product = join(root, "docs", "PRODUCT.md");
  const prd = join(root, "docs", "chain", "PRD.md");
  writeFileSync(product, PRODUCT);
  writeFileSync(prd, PRD);
  return { root, product, prd };
}
const rd = (p: string) => readFileSync(p, "utf8");
const edit = (p: string, a: string, b: string) => { const t = rd(p); expect(t).toContain(a); writeFileSync(p, t.replace(a, b)); };
function approved() {
  const p = project();
  approve(p.product, p.root, "2026-11-21");
  approve(p.prd, p.root, "2026-11-21");
  return p;
}
const refuses = (f: () => void, msg: string) => expect(f).toThrow(msg);

// covers: chain/FRD-01/EX-1
test("FRD-01/EX-1: LF, CRLF and trailing spaces give one fingerprint", () => {
  expect(fingerprint(PRD)).toBe(fingerprint(PRD.replace(/\n/g, "\r\n").replace("do RULE-1.", "do RULE-1.  ").replace("B.\r", "B.  \r")));
});

// covers: chain/FRD-01/EX-2
test("FRD-01/EX-2: Status, Approval and Last change lines do not change the fingerprint", () => {
  const b = PRD.replace("Status: Draft", "Status: Approved (2026-11-21)\nApproval: content abc").replace("2026-11-01, x", "2026-11-21, y");
  expect(fingerprint(b)).toBe(fingerprint(PRD));
});

// covers: chain/FRD-01/EX-3
test("FRD-01/EX-3: one changed word changes the fingerprint", () => {
  expect(fingerprint(PRD.replace("shall", "should"))).not.toBe(fingerprint(PRD));
});

// covers: chain/FRD-01/EX-4
// covers: chain/FRD-01/ST-1
test("FRD-01/EX-4: approve writes the Approval line directly under Status, with 12-char hashes", () => {
  const { prd, product } = approved();
  const ls = rd(prd).split("\n");
  expect(ls[2]).toBe("Status: Approved (2026-11-21)");
  expect(ls[3]).toBe("Approval: content " + fingerprint(PRD) + "; rests on ../PRODUCT.md " + fingerprint(PRODUCT));
  expect(ls[3]).toMatch(/^Approval: content [\w-]{12}; rests on \.\.\/PRODUCT\.md [\w-]{12}$/);
  expect(rd(product).split("\n")[3]).toMatch(/^Approval: content [\w-]{12}$/);
});

// covers: chain/FRD-01/EX-5
// covers: chain/FRD-01/DT-2
test("FRD-01/EX-5, DT-2: no Approval line is a warning, not a failure", () => {
  const { root, prd } = approved();
  writeFileSync(prd, rd(prd).split("\n").filter((l) => !l.startsWith("Approval:")).join("\n"));
  const r = driftFails(root);
  expect(r.fails).toEqual([]);
  expect(r.warnings).toEqual([prd + ": approved without an Approval line; approve it again to record one"]);
});

// covers: chain/FRD-01/EX-6
// covers: chain/FRD-01/DT-3
test("FRD-01/EX-6, DT-3: an edited body fails, even with Last change updated", () => {
  const { root, prd } = approved();
  edit(prd, "shall do", "should do");
  edit(prd, "2026-11-01, x", "2026-11-22, y");
  expect(driftFails(root).fails).toEqual([prd + ": body changed since approval: approve it again"]);
});

// covers: chain/FRD-01/EX-7
// covers: chain/FRD-01/DT-1
test("FRD-01/EX-7, DT-1: only Last change edited passes", () => {
  const { root, prd } = approved();
  edit(prd, "2026-11-01, x", "2026-11-22, y");
  expect(driftFails(root)).toEqual({ fails: [], warnings: [] });
});

// covers: chain/FRD-01/EX-8
// covers: chain/FRD-01/DT-4
test("FRD-01/EX-8, DT-4: an edited parent makes the child suspect", () => {
  const { root, prd, product } = approved();
  edit(product, "shall work", "shall not work");
  expect(driftFails(root).fails).toContain(prd + ": suspect: ../PRODUCT.md changed since approval: clear or approve it again");
  expect(driftReport(root)).toEqual([
    { path: product, cause: "body" },
    { path: prd, cause: "parent", parent: "../PRODUCT.md" },
  ]);
});

// covers: chain/FRD-01/EX-9
test("FRD-01/EX-9: only the parent's Last change edited passes", () => {
  const { root, product } = approved();
  edit(product, "2026-11-01, x", "2026-11-22, y");
  expect(driftFails(root).fails).toEqual([]);
});

// covers: chain/FRD-01/EX-10
// covers: chain/FRD-01/ST-2
test("FRD-01/EX-10: clear rewrites only the parent hashes", () => {
  const { root, prd, product } = approved();
  const before = rd(prd);
  edit(product, "R-1 the system", "R-1 the whole system");
  approve(product, root, "2026-11-22");
  clear(prd, root);
  const after = rd(prd).split("\n");
  expect(after[3]).toBe("Approval: content " + fingerprint(PRD) + "; rests on ../PRODUCT.md " + fingerprint(rd(product)));
  expect(after.filter((_, i) => i !== 3)).toEqual(before.split("\n").filter((_, i) => i !== 3));
  expect(driftFails(root).fails).toEqual([]);
});

// covers: chain/FRD-01/EX-11
// covers: chain/FRD-01/ST-3
test("FRD-01/EX-11: clear is refused for an edited body and leaves the file byte-identical", () => {
  const { root, prd } = approved();
  edit(prd, "shall do", "should do");
  const before = rd(prd);
  refuses(() => clear(prd, root), "body changed since approval: approve it again");
  expect(rd(prd)).toBe(before);
});

// covers: chain/FRD-02/ST-2
test("a superseded document cannot be approved again: write a new document", () => {
  const { root, prd } = project();
  edit(prd, "Status: Draft", "Status: Superseded by ../PRODUCT.md (2026-11-21)");
  refuses(() => approve(prd, root, "2026-11-22"), "no Status line");
});

// covers: chain/FRD-02/DT-3
test("a superseded document is not checked for drift", () => {
  const { root, prd } = approved();
  edit(prd, "B.", "B changed.");
  expect(driftReport(root).some((d) => d.path === prd)).toBe(true);
  edit(prd, "Status: Approved (2026-11-21)", "Status: Superseded by ../PRODUCT.md (2026-11-21)");
  expect(driftReport(root).some((d) => d.path === prd)).toBe(false);
});

// covers: chain/FRD-01/EX-12
// covers: chain/FRD-01/ST-4
// covers: chain/FRD-01/EX-12
test("FRD-01/EX-12: clear is refused for a draft and leaves the file byte-identical", () => {
  const { root, prd } = project();
  refuses(() => clear(prd, root), "not approved: nothing to clear");
  expect(rd(prd)).toBe(PRD);
});

test("a CRLF document keeps its line endings through approve and clear", () => {
  const { root, prd, product } = project();
  writeFileSync(prd, PRD.replace(/\n/g, "\r\n"));
  approve(product, root, "2026-11-21");
  approve(prd, root, "2026-11-21");
  edit(product, "R-1 the", "R-1 a");
  clear(prd, root);
  expect(rd(prd).replace(/\r\n/g, "")).not.toContain("\n");
});

test("the CLI exits 0 on pass, 1 on drift, 2 on bad usage", () => {
  const { root, prd, product } = approved();
  const run = (...a: string[]) => Bun.spawnSync(["bun", join(import.meta.dir, "..", "scripts", "drift.ts"), ...a]).exitCode;
  expect(run("check", prd, root)).toBe(0);
  edit(product, "R-1 the", "R-1 a");
  expect(run("check", prd, root)).toBe(1);
  expect(run("bogus")).toBe(2);
});
