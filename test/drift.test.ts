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
const edit = (p: string, a: string, b: string) => {
  const t = rd(p);
  expect(t).toContain(a);
  writeFileSync(p, t.replace(a, b));
};
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
  writeFileSync(
    prd,
    rd(prd)
      .split("\n")
      .filter((l) => !l.startsWith("Approval:"))
      .join("\n"),
  );
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

const TABLE = "\n| ID | Text |\n|---|---|\n| EX-1 | the first row |\n| EX-2 | the second row |\n";
function approvedWithTable() {
  const p = project();
  writeFileSync(p.prd, PRD + TABLE);
  approve(p.product, p.root, "2026-11-21");
  approve(p.prd, p.root, "2026-11-21");
  return p;
}

// covers: chain/FRD-08/EX-8
test("FRD-08/EX-8: padded tables, extra blank lines and runs of spaces are not drift", () => {
  const { root, prd } = approvedWithTable();
  expect(driftFails(root).fails).toEqual([]);
  edit(prd, "|---|---|", "| --- | --- |");
  edit(prd, "| EX-1 | the first row |", "|  EX-1  |  the first   row  |");
  edit(prd, "The system shall do RULE-1.", "\n\nThe  system shall   do RULE-1.\n\n");
  expect(driftFails(root).fails).toEqual([]);
});

// covers: chain/FRD-08/EX-9
test("FRD-08/EX-9: one changed word of a row is still drift", () => {
  const { root, prd } = approvedWithTable();
  edit(prd, "|---|---|", "| --- | --- |"); // formatting alone passes, as above
  edit(prd, "the second row", "the third row");
  const r = driftFails(root).fails;
  expect(r.length).toBe(1);
  expect(r[0]).toContain("body changed since approval");
});

// covers: chain/FRD-08/EX-10
test("FRD-08/EX-10: a document approved before the change, with no change since, is not drift", () => {
  // OLD is a document and the stored fingerprint its text had before the formatting rule; nothing in it changed since.
  const OLD = "# Product\n\nStatus: Draft\n\n## Summary\n\nA.\n\nLast change: 2026-11-01, x\n\n| a | b |\n|---|---|\n| one | two |\n\nR-1 the system shall work.\n";
  const stored = "BVN8Iy58CAc4";
  const root = mkdtempSync(join(tmpdir(), "drift-old-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  const product = join(root, "docs", "PRODUCT.md");
  const approvedText = OLD.replace("Status: Draft", "Status: Approved (2026-11-01)\nApproval: content " + stored);
  writeFileSync(product, approvedText);
  expect(driftFails(root).fails).toEqual([]);
  writeFileSync(product, approvedText.replace("one | two", "one | three")); // mutant: a real change still fails
  expect(driftFails(root).fails.length).toBe(1);
});

const LINKS = "Links: [Asana](https://app.asana.com/1/1/project/2/task/3)";
const withLinks = (text: string) => text.replace(/^(Approval:.*\n)/m, "$1" + LINKS + "\n");

// covers: chain/FRD-08/EX-12
test("FRD-08/EX-12: a Links header line added to an approved document is not drift", () => {
  const { root, product } = approved();
  expect(driftFails(root).fails).toEqual([]);
  writeFileSync(product, withLinks(rd(product)));
  expect(rd(product)).toContain(LINKS);
  expect(driftFails(root).fails).toEqual([]);
  edit(product, "R-1 the system shall work.", "R-1 the system should work."); // mutant: a real change beside the Links line is still drift
  // the PRD resting on the PRODUCT is suspect too, so the check is for the PRODUCT line, not a count
  expect(driftFails(root).fails.some((f) => f.includes("PRODUCT.md") && f.includes("body changed since approval"))).toBe(true);
});

// covers: chain/FRD-08/EX-12
test("FRD-08/EX-12: a document approved before the Links line existed, with the earlier fingerprint, still matches after it is added", () => {
  const OLD = "# Product\n\nStatus: Draft\n\n## Summary\n\nA.\n\nLast change: 2026-11-01, x\n\n| a | b |\n|---|---|\n| one | two |\n\nR-1 the system shall work.\n";
  const stored = "BVN8Iy58CAc4"; // the earlier form of the fingerprint of OLD, frozen
  const root = mkdtempSync(join(tmpdir(), "drift-links-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  const product = join(root, "docs", "PRODUCT.md");
  const approvedText = OLD.replace("Status: Draft", "Status: Approved (2026-11-01)\nApproval: content " + stored);
  writeFileSync(product, approvedText);
  expect(driftFails(root).fails).toEqual([]);
  writeFileSync(product, withLinks(approvedText));
  expect(driftFails(root).fails).toEqual([]);
});

// covers: chain/FRD-08/EX-18
test("FRD-08/EX-18: a Links line below the first heading is drift", () => {
  const { root, product } = approved();
  edit(product, "## Summary\n", "## Summary\n" + LINKS + "\n");
  const r = driftFails(root).fails;
  expect(r.some((f) => f.includes("PRODUCT.md") && f.includes("body changed since approval"))).toBe(true);
});

// covers: chain/FRD-08/EX-19
test("FRD-08/EX-19: a second Links line in the header is drift, and a change of the first one is not", () => {
  const { root, product } = approved();
  writeFileSync(product, withLinks(rd(product)));
  expect(driftFails(root).fails).toEqual([]); // the first header Links line is left out
  edit(product, "app.asana.com/1/1/project/2/task/3", "app.asana.com/9/9/project/9/task/9");
  expect(driftFails(root).fails).toEqual([]); // and so is a change of it
  const first = LINKS.replace("1/1/project/2/task/3", "9/9/project/9/task/9");
  edit(product, first + "\n", first + "\nLinks: [Other](https://app.asana.com/1/1/1)\n");
  const r = driftFails(root).fails;
  expect(r.some((f) => f.includes("PRODUCT.md") && f.includes("body changed since approval"))).toBe(true);
});

// covers: chain/FRD-08/EX-26
test("FRD-08/EX-26: a body line that starts with Approval: or Status: is drift", () => {
  for (const [line, anchor] of [
    ["Approval: the owner agreed to 10 places", "## Summary\n"],
    ["Status: Approved by the owner on a call", "## Summary\n"],
  ] as const) {
    const { root, product } = approved();
    edit(product, anchor, anchor + line + "\n");
    const r = driftFails(root).fails;
    expect([line, r.some((f) => f.includes("PRODUCT.md") && f.includes("body changed since approval"))]).toEqual([line, true]);
  }
  const { root } = approved(); // mutant: untouched, no drift
  expect(driftFails(root).fails).toEqual([]);
});

// covers: chain/FRD-08/EX-27
test("FRD-08/EX-27: a document approved before this change, with Status and Approval only in its header, is not drift in either fingerprint form", () => {
  const doc = "# Product\n\nStatus: Approved (2026-11-01)\nApproval: content PLACEHOLDER\n\n## Summary\n\nA.\n\nLast change: 2026-11-01, x\n\n| a | b |\n|---|---|\n| one | two |\n\nR-1 the system shall work.\n";
  // both stored values were taken from the fingerprint code of the day: the earlier form, and the form with formatting ignored
  for (const [form, stored] of [
    ["earlier", "BVN8Iy58CAc4"],
    ["current", "WI0pREjVV2i_"],
  ] as const) {
    const root = mkdtempSync(join(tmpdir(), "drift-header-"));
    mkdirSync(join(root, "docs"), { recursive: true });
    const product = join(root, "docs", "PRODUCT.md");
    writeFileSync(product, doc.replace("PLACEHOLDER", stored));
    expect([form, driftFails(root).fails]).toEqual([form, []]);
    writeFileSync(product, doc.replace("PLACEHOLDER", stored).replace("one | two", "one | three")); // mutant: a real change still fails
    expect([form, driftFails(root).fails.length]).toEqual([form, 1]);
  }
});
