import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDocChecks } from "../scripts/hook-doc-check.ts";
import { docStatus, checkPrd, checkFrds, checkUx, checkTp, checkAdr, checkSpec, checkSummary, chainStatus, excerpt } from "../scripts/check.ts";

const SUM = "## Summary\n\ns\n\nLast change: 2026-11-20, written\n";

const PRODUCT = "# P\n## 4. Principles\n1. One.\n2. Two.\n## 5. Use cases\n| UC-1 | a |\n| UC-2 | b |\n";

const PRD = "# Inbox PRD\n\nStatus: Draft\n\n" + SUM + "\nSee [product](../PRODUCT.md).\n" + "## Why\nREQ-1\n## Use cases\nUC-1\n## Requirements\nR-INBOX-1 a. R-INBOX-2 b. R-INBOX-3 c.\n" + "## Principles honored\nprinciple 2 holds.\n## Non-goals\n## Dependencies\n## Success criteria\n## Open questions\n";

const QC = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "| QC-" + i + " | c | " + (i === 1 ? "p95 under 200 ms, measured by the e2e run" : "n/a: no such concern") + " |").join("\n");
const FRD =
  "# FRD-01: a\n\nStatus: Draft\n\n" +
  SUM +
  "\n[PRD](../PRD.md)\n" +
  "## Why\nREQ-1\n## Requirements covered\nR-INBOX-1, R-INBOX-2, R-INBOX-3\n" +
  "## Behavior\n| ID | Pattern | Requirement |\n|---|---|---|\n" +
  "| FR-INBOX-01-1 | WHEN | WHEN a, the system shall b. |\n| FR-INBOX-01-2 | always | The system shall always c. |\n" +
  "## Rules and examples\n| Rule | Text | Covers |\n|---|---|---|\n| RULE-1 | r | FR-INBOX-01-1 |\n\n" +
  "| Example | Rule | Kind | Given | When | Then |\n|---|---|---|---|---|---|\n" +
  "| EX-1 | RULE-1 | positive | g | w | t |\n| EX-2 | RULE-1 | boundary | g | w | t |\n" +
  "## Decision table\nDT-1 a b c\n## States\nn/a: no lifecycle\n## Invariants\nINV-1 holds\n" +
  "## Quality criteria\n| ID | Characteristic | Criterion |\n|---|---|---|\n" +
  QC +
  "\n" +
  "## Cross-cutting\nCC-1 n/a: none\n## Information\nx\n## Open questions\n## Acceptance criteria\nAC-1\n";

test("a good PRD passes", () => expect(checkPrd(PRD, "INBOX", PRODUCT)).toEqual([]));

test("a PRD citing an unknown principle, an unknown use case or a technology fails", () => {
  const bad = PRD.replace("principle 2", "principle 3").replace("UC-1", "UC-9").replace("REQ-1", "stored in SQLite");
  const fails = checkPrd(bad, "INBOX", PRODUCT);
  expect(fails).toContain("unknown principle 3");
  expect(fails).toContain("unknown use case UC-9");
  expect(fails.some((f) => f.includes("SQLite"))).toBe(true);
});

test("a PRD without a section, requirements or the product link fails", () => {
  expect(checkPrd(PRD.replace("## Non-goals", "## Other"), "INBOX", PRODUCT)).toContain("missing section: ## Non-goals");
  expect(checkPrd(PRD.replace("R-INBOX-3", "R-INBOX-2"), "INBOX", PRODUCT)).toContain("fewer than 3 requirement IDs like R-INBOX-1");
  expect(checkPrd(PRD.replace("../PRODUCT.md", "x.md"), "INBOX", PRODUCT)).toContain("does not link ../PRODUCT.md");
});

function slice(frd: string, ux?: string) {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-"));
  mkdirSync(join(dir, "frd"), { recursive: true });
  writeFileSync(join(dir, "PRD.md"), PRD);
  writeFileSync(join(dir, "frd", "FRD-01-a.md"), frd);
  if (ux) {
    mkdirSync(join(dir, "ux"));
    writeFileSync(join(dir, "ux", "UX-01-a.md"), ux);
  }
  return dir;
}
const fr = (frd: string) => checkFrds(slice(frd), "INBOX").fails;

test("FRDs that cover every PRD requirement pass", () => expect(fr(FRD)).toEqual([]));

test("an uncovered requirement, a requirement not in the PRD and a technology fail", () => {
  const fails = fr(FRD.replace("R-INBOX-3", "R-INBOX-9 as JSON"));
  expect(fails).toContain("PRD requirement R-INBOX-3 is covered by no FRD");
  expect(fails).toContain("FRD-01-a.md: cites R-INBOX-9, not in the PRD");
  expect(fails.some((f) => f.includes("JSON"))).toBe(true);
});

test("an FRD behavior row needs an EARS pattern and shall; two rows; its own prefix", () => {
  expect(fr(FRD.replace("| WHEN | WHEN a, the system shall b. |", "| soon | WHEN a, the system shall b. |"))).toContain("FRD-01-a.md: FR-INBOX-01-1: Pattern is not WHEN, WHILE, IF, WHERE or always");
  expect(fr(FRD.replace("shall b", "does b"))).toContain('FRD-01-a.md: FR-INBOX-01-1: requirement has no "shall"');
  expect(fr(FRD.replace(/\| FR-INBOX-01-2.*\n/, "")).some((f) => f.includes("fewer than 2 rows"))).toBe(true);
  expect(fr(FRD.replace("FR-INBOX-01-2", "FR-INBOX-02-2")).some((f) => f.includes("does not belong"))).toBe(true);
});

test("every rule needs a positive and a negative or boundary example", () => {
  expect(fr(FRD.replace("| EX-2 | RULE-1 | boundary |", "| EX-2 | RULE-1 | positive |"))).toContain("FRD-01-a.md: RULE-1: no negative or boundary example");
  expect(fr(FRD.replace("| EX-1 | RULE-1 | positive |", "| EX-1 | RULE-1 | negative |"))).toContain("FRD-01-a.md: RULE-1: no positive example");
  expect(fr(FRD.replace("| EX-2 | RULE-1 | boundary |", "| EX-2 | RULE-7 | boundary |")).some((f) => f.includes("EX-2 cites RULE-7"))).toBe(true);
});

test("decision table, states and invariants hold an id or an explained n/a", () => {
  expect(fr(FRD.replace("DT-1 a b c", "later")).some((f) => f.includes("Decision table holds no"))).toBe(true);
  expect(fr(FRD.replace("n/a: no lifecycle", "n/a")).some((f) => f.includes("States holds no"))).toBe(true);
  expect(fr(FRD.replace("INV-1 holds", ""))).toHaveLength(1);
});

test("quality criteria need QC-1..QC-9, none empty or only a vague word", () => {
  expect(fr(FRD.replace("| QC-9 | c | n/a: no such concern |\n", ""))).toContain("FRD-01-a.md: QC-9 missing from Quality criteria");
  expect(fr(FRD.replace("| QC-4 | c | n/a: no such concern |", "| QC-4 | c | |"))).toContain("FRD-01-a.md: QC-4 is empty");
  expect(fr(FRD.replace("p95 under 200 ms, measured by the e2e run", "fast"))[0]).toContain("QC-1 is only");
  expect(fr(FRD.replace("| QC-5 | c | n/a: no such concern |", "| QC-5 | c | n/a |"))[0]).toContain("QC-5 says n/a without");
});

test("n/a needs a real reason: a placeholder fails, a reason passes, in DT/ST/INV and in QC", () => {
  expect(fr(FRD.replace("DT-1 a b c", "n/a: because x"))).toEqual([]);
  expect(fr(FRD.replace("DT-1 a b c", "n/a: <reason>"))).toContain('FRD-01-a.md: Decision table holds no DT-n row and no "n/a: <reason>"');
  expect(fr(FRD.replace("n/a: no lifecycle", "n/a: <reason>"))).toContain('FRD-01-a.md: States holds no ST-n row and no "n/a: <reason>"');
  expect(fr(FRD.replace("INV-1 holds", "n/a: because x"))).toEqual([]);
  expect(fr(FRD.replace("INV-1 holds", "later"))).toContain('FRD-01-a.md: Invariants holds no INV-n row and no "n/a: <reason>"');
  expect(fr(FRD.replace("| QC-5 | c | n/a: no such concern |", "| QC-5 | c | n/a: because x |"))).toEqual([]);
  expect(fr(FRD.replace("| QC-5 | c | n/a: no such concern |", "| QC-5 | c | n/a: <reason> |"))[0]).toContain("QC-5 says n/a without");
});

test("PRD, FRD, UX and TP need a valid Status line; spec needs a Last change line in its Summary", () => {
  const NS = "no Status line (Status: Draft, Status: Approved (YYYY-MM-DD) or Status: Superseded by <path> (YYYY-MM-DD))";
  expect(checkPrd(PRD.replace("Status: Draft", "Status: Aproved"), "INBOX", PRODUCT)).toContain(NS);
  expect(checkPrd(PRD.replace("Status: Draft", "Status: Approved (2026-11-20)"), "INBOX", PRODUCT)).toEqual([]);
  expect(fr(FRD.replace("Status: Draft", ""))).toContain("FRD-01-a.md: " + NS);
  expect(checkUx(slice(FRD, UX.replace("Status: Draft", "Status: Done"))).fails).toContain("UX-01-a.md: " + NS);
  expect(checkTp(TP.replace("Status: Draft", "Draft"), adrDir(true), FRS)).toContain(NS);
  expect(checkSpec(SPEC.replace("Status: Draft", "Status: Approved 2026"), FRD)).toContain(NS);
  expect(checkSpec(SPEC.replace("Last change: 2026-11-20, written\n", ""), FRD)).toContain('the Summary has no "Last change: YYYY-MM-DD, <what>" line');
});

test("an FRD missing a section or the PRD link fails", () => {
  expect(fr(FRD.replace("## Cross-cutting", "## Other"))).toContain("FRD-01-a.md: missing section: ## Cross-cutting");
  expect(fr(FRD.replace("../PRD.md", "x.md"))).toContain("FRD-01-a.md: does not link ../PRD.md");
});

const UX = "# UX-01: a\n\nStatus: Draft\n\n" + SUM + "\n[FRD-01](../frd/FRD-01-a.md)\n## Flows\n## Screens\n## States\n## Design system\n## Accessibility and language\n## Open questions\n";

test("a UX document with its sections and its FRD passes", () => expect(checkUx(slice(FRD, UX))).toEqual({ fails: [], files: 1 }));

test("a UX document missing a section or its FRD fails", () => {
  expect(checkUx(slice(FRD, UX.replace("## Screens", "## Other"))).fails).toContain("UX-01-a.md: missing section: ## Screens");
  const dir = slice(FRD, UX);
  writeFileSync(join(dir, "ux", "UX-02-b.md"), UX);
  expect(checkUx(dir).fails.some((f) => f.startsWith("UX-02-b.md: FRD-02 does not exist"))).toBe(true);
});

const TP =
  "# TP\n\nStatus: Draft\n\n" + SUM + "\n## Context\nFR-INBOX-01-1\n## Decisions\n### TD-1: storage\n- **Option A** files.\n- **Option B** a database.\n\nChosen: B, because x. ADR: ADR-001\n" + "## Architecture\n## Information\n## Interfaces and contracts\n## Threat model\n## Testing\n## Risks\n## Open questions\n";
const ADR = "# ADR-001: x\n\n## Status\nAccepted\n\n## Summary\ns\n## Context\n## Options considered\n## Decision\n## Consequences\n";

function adrDir(withFile: boolean) {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-adr-"));
  if (withFile) writeFileSync(join(dir, "ADR-001-storage.md"), ADR);
  return dir;
}
const FRS = new Set(["FR-INBOX-01-1"]);

test("a TP whose decisions have two options, a choice and an ADR file passes", () => expect(checkTp(TP, adrDir(true), FRS)).toEqual([]));

test("a TP decision may say ADR: none with a reason", () => expect(checkTp(TP.replace("ADR: ADR-001", "ADR: none: not significant"), adrDir(false), FRS)).toEqual([]));

test("a TP with one option, a missing ADR file, an unknown FR or a TBD fails", () => {
  const bad = TP.replace("- **Option B** a database.\n", "").replace("FR-INBOX-01-1", "FR-INBOX-01-9 TBD");
  const fails = checkTp(bad, adrDir(false), FRS);
  expect(fails).toContain("TD-1: fewer than 2 options (- **Option A** ...)");
  expect(fails.some((f) => f.includes("ADR-001 has no file"))).toBe(true);
  expect(fails).toContain("cites FR-INBOX-01-9, defined in no FRD");
  expect(fails).toContain("contains TBD or TODO");
});

test("a TP decision without Chosen, or with ADR none and no reason, fails", () => {
  expect(checkTp(TP.replace("Chosen:", "Picked:"), adrDir(true), FRS)).toContain('TD-1: no "Chosen:" line');
  expect(checkTp(TP.replace("ADR: ADR-001", "ADR: none"), adrDir(true), FRS)).toContain('TD-1: no "ADR: ADR-NNN" or "ADR: none: <reason>"');
  expect(checkTp(TP.replace("## Threat model", "## Other"), adrDir(true), FRS)).toContain("missing section: ## Threat model");
});

test("an ADR needs its sections and a valid status", () => {
  expect(checkAdr(ADR, "a")).toEqual([]);
  expect(checkAdr(ADR.replace("Accepted", "Maybe"), "a")).toContain("a: Status must be Proposed, Accepted, Superseded or Rejected");
  expect(checkAdr(ADR.replace("## Options considered", "## Other"), "a")).toContain("a: missing section: ## Options considered");
});

const FRD_ROWS = "| EX-1 | a | b |\n| EX-2 | c | d |\n";
const SPEC =
  "# Spec\n\nStatus: Draft\nRests on: ../frd/FRD-01-a.md\n\n" + SUM + "\n## Rows\nQuoted from: ../frd/FRD-01-a.md\n" + FRD_ROWS + "\n## Files\n| File | Change |\n|---|---|\n| a.ts | new |\n\n## Tests first\nEX-1, EX-2\n\n## Build\nb\n\n## Done when\n`bun test`\n\n## Out of scope\nn\n\n## Open questions\nNone\n";

// A project with the FRD rows on disk; returns the spec path.
function specAt(parent = FRD_ROWS + "other | row\n", files: Record<string, string> = {}) {
  const root = project("Status: Draft\n", parent, files);
  return join(root, "docs", "inbox", "specs", "SPEC-01-1-a.md");
}
const sp = (text: string, parent?: string) => {
  const p = specAt(parent);
  mkdirSync(join(p, ".."), { recursive: true });
  return checkSpec(text, p);
};

// covers: chain/FRD-02/EX-1
test("spec: a good small spec passes", () => expect(sp(SPEC)).toEqual([]));

// covers: chain/FRD-02/EX-2
// covers: chain/FRD-02/EX-3
test("spec: Rests on names an existing parent of a known kind", () => {
  expect(sp(SPEC.replace("Rests on: ../frd/FRD-01-a.md\n", ""))).toContain('no "Rests on: <path>" line in the first 20 lines');
  expect(sp(SPEC.replace("Rests on: ../frd/FRD-01-a.md", "Rests on: ../frd/FRD-09-a.md")).some((f) => f.includes("which does not exist"))).toBe(true);
  expect(sp(SPEC.replace("Rests on: ../frd/FRD-01-a.md", "Rests on: ../PRD.md").replace("Quoted from: ../frd/FRD-01-a.md\n", "")).some((f) => f.includes("a spec rests on an FRD"))).toBe(true);
  const reg = checkSpec(SPEC.replace("Rests on: ../frd/FRD-01-a.md", "Rests on: ../../CHECKS.md"), specAt(undefined, { "docs/CHECKS.md": "x\n" }));
  expect(reg.some((f) => f.includes("a spec rests on"))).toBe(false);
});

// covers: chain/FRD-02/EX-4
// covers: chain/FRD-02/EX-5
// covers: chain/FRD-02/EX-2
test("spec: a Rests on line after line 20 does not count, and an empty Rows fails", () => {
  const late = SPEC.replace("Rests on: ../frd/FRD-01-a.md\n", "").replace("## Summary", "\n".repeat(20) + "Rests on: ../frd/FRD-01-a.md\n## Summary");
  expect(sp(late)).toContain('no "Rests on: <path>" line in the first 20 lines');
  expect(sp(SPEC.replace(FRD_ROWS, "")).some((f) => f.includes("Rows holds no quoted row lines"))).toBe(true);
});

test("spec: quoted rows must appear verbatim, and Quoted from defaults to the parent", () => {
  expect(sp(SPEC.replace("Quoted from: ../frd/FRD-01-a.md\n", ""))).toEqual([]);
  expect(sp(SPEC.replace("| EX-2 | c | d |", "| EX-2 | c | changed |")).some((f) => f.includes("not found verbatim") && f.includes("EX-2"))).toBe(true);
  expect(sp(SPEC.replace("| EX-2 | c | d |", "| EX-2 | c | d |   "))).toEqual([]); // trailing space trimmed
  expect(sp(SPEC.replace("Quoted from: ../frd/FRD-01-a.md", "Quoted from: ../frd/none.md")).some((f) => f.includes("which does not exist"))).toBe(true);
});

// covers: chain/FRD-02/EX-6
test("spec: Tests first cites exactly the ids of Rows", () => {
  expect(sp(SPEC.replace("EX-1, EX-2", "EX-1"))).toContain("EX-2 is in Rows but Tests first does not cite it");
  expect(sp(SPEC.replace("EX-1, EX-2", "EX-1, EX-2, EX-3"))).toContain("EX-3 is in Tests first but not in Rows");
});

// covers: chain/FRD-02/EX-6
test("spec: document ids in Tests first are not row ids", () => {
  const t = SPEC.replace("EX-1, EX-2", "EX-1, EX-2; SPEC-01-2 and FRD-01, TP-01, ADR-001, REQ-1, UX-01, R-PICKUPS-1 are named in prose");
  expect(sp(t)).toEqual([]);
  expect(sp(t.replace("EX-1, EX-2;", "EX-1;"))).toContain("EX-2 is in Rows but Tests first does not cite it"); // a document id never stands in for a row id
  expect(sp(SPEC.replace("| EX-1 | a | b |", "| EX-1 | see SPEC-01-2 | b |"), FRD_ROWS.replace("| a |", "| see SPEC-01-2 |"))).toEqual([]); // nor does one in a later cell
});

// covers: chain/FRD-02/EX-9
// covers: chain/FRD-02/EX-10
// covers: chain/FRD-02/EX-11
test("spec: at most 3 Files rows and exactly one command in Done when", () => {
  expect(sp(SPEC.replace("| a.ts | new |", "| a.ts | new |\n| b.ts | new |\n| c.ts | new |"))).toEqual([]);
  expect(sp(SPEC.replace("| a.ts | new |", "| a.ts | new |\n| b.ts | new |\n| c.ts | new |\n| d.ts | new |")).some((f) => f.includes("Files lists 4 rows"))).toBe(true);
  expect(sp(SPEC.replace("`bun test`", "`bun test` and `bun run typecheck`"))).toContain("Done when must hold exactly one backticked command, found 2");
  expect(sp(SPEC.replace("`bun test`", "bun test"))).toContain("Done when must hold exactly one backticked command, found 0");
});

test("spec: needs Status, every section and no TBD", () => {
  expect(sp(SPEC.replace("Status: Draft", "Status: Done"))).toContain("no Status line (Status: Draft, Status: Approved (YYYY-MM-DD) or Status: Superseded by <path> (YYYY-MM-DD))");
  for (const h of ["Rows", "Files", "Tests first", "Build", "Done when", "Out of scope", "Open questions"]) expect(sp(SPEC.replace("## " + h, "## Other"))).toContain("missing section: ## " + h);
  expect(sp(SPEC.replace("\nb\n", "\nTBD\n"))).toContain("contains TBD or TODO");
  expect(sp(SPEC.replace("## Build", "### TD-1: x\n## Build")).some((f) => f.includes("makes a decision"))).toBe(true);
});

// covers: chain/FRD-02/EX-7
// covers: chain/FRD-02/EX-8
test("excerpt prints the rows of the ids and reports an unknown id", () => {
  expect(excerpt(FRD_ROWS + "- EX-10 bullet\n", ["EX-2", "EX-1"])).toEqual({ lines: ["| EX-2 | c | d |", "| EX-1 | a | b |"], missingIds: [] });
  expect(excerpt(FRD_ROWS, ["EX-1", "EX-3"])).toEqual({ lines: ["| EX-1 | a | b |"], missingIds: ["EX-3"] });
  expect(excerpt("- **EX-10** x\n", ["EX-1"]).missingIds).toEqual(["EX-1"]); // EX-1 is not EX-10
});

// covers: chain/FRD-02/EX-1
// covers: chain/FRD-02/EX-15
test("status: a spec rests on its Rests on path; a registry counts as approved", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const run = (spec: string, extra: Record<string, string> = {}) => chainStatus(project(ok, ok, { "docs/inbox/specs/SPEC-01-1-a.md": spec, ...extra })).fails;
  expect(run(ok + "Rests on: ../frd/FRD-01-a.md\n")).toEqual([]);
  expect(run(ok)).toEqual([expect.stringContaining('no "Rests on')]);
  expect(run(ok + "Rests on: ../tp/TP-01-a.md\n", { "docs/inbox/tp/TP-01-a.md": "Status: Draft\n" }).some((f) => f.includes("SPEC-01-1-a.md: approved, but") && f.includes("Draft"))).toBe(true);
  expect(run(ok + "Rests on: ../../CHECKS.md\n", { "docs/CHECKS.md": "x\n" })).toEqual([]);
  expect(run(ok + "Rests on: ../../CHECKS.md\n").some((f) => f.includes("does not exist"))).toBe(true);
});

// covers: chain/FRD-02/EX-12
// covers: chain/FRD-02/EX-13
// covers: chain/FRD-02/EX-1
test("status: a spec in a folder with no PRD, frd or tp rests on a registry", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const files = { "docs/ops/specs/SPEC-01-1-a.md": ok + "Rests on: ../../CHECKS.md\n", "docs/CHECKS.md": "x\n" };
  const { docs, fails } = chainStatus(project(ok, ok, files));
  expect(fails).toEqual([]);
  expect(docs.some((d) => d.kind === "SPEC" && d.approved)).toBe(true);
  delete (files as Record<string, string>)["docs/CHECKS.md"];
  expect(chainStatus(project(ok, ok, files)).fails.some((f) => f.includes("does not exist"))).toBe(true);
});

test("done runs the command of an approved spec and exits with its code; a draft is refused", () => {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-done-"));
  const spec = (status: string, cmd: string) => {
    const p = join(dir, "s.md");
    writeFileSync(p, "Status: " + status + "\n## Done when\n`" + cmd + "`\n");
    return p;
  };
  const cli = (...a: string[]) => {
    const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), ...a], { cwd: dir });
    return { code: r.exitCode, out: r.stdout.toString() };
  };
  expect(cli("done", spec("Approved (2026-11-18)", "bun -e 0")).code).toBe(0);
  // covers: chain/FRD-02/EX-22
  writeFileSync(join(dir, "a.txt"), "");
  writeFileSync(join(dir, "b.txt"), "");
  writeFileSync(join(dir, "n.ts"), "process.exit(process.argv.length - 2 === 2 ? 0 : 5);");
  expect(cli("done", spec("Approved (2026-11-18)", "bun n.ts *.txt")).code).toBe(0); // the shell expands the glob to two files
  expect(cli("done", spec("Approved (2026-11-18)", "bun n.ts *.md")).code).toBe(5); // one file: s.md
  expect(cli("done", spec("Approved (2026-11-18)", "bun -e process.exitCode=3")).code).toBe(3);
  const draft = cli("done", spec("Draft", "bun -e 0"));
  expect(draft.code).toBe(1);
  expect(draft.out).toContain("not approved");
  expect(cli("excerpt", join(dir, "s.md"), "X-1").code).toBe(1);
  const two = cli("done", spec("Approved (2026-11-18)", "bun -e 0`\n`bun -e 0"));
  expect(two.code).toBe(1); // two commands: nothing runs
  expect(two.out).toContain("exactly one");
});

test("summary: ## Summary in the first 20 lines with a Last change line inside it", () => {
  expect(checkSummary("# T\n\n" + SUM + "\n## Next\n")).toEqual([]);
  expect(checkSummary("# T\n\n" + SUM.replace("2026-11-20", "soon"))).toHaveLength(1);
  expect(checkSummary("# T\n\n## Summary\n\ns\n\n## Next\nLast change: 2026-11-20, late\n")).toHaveLength(1);
  expect(checkSummary("# ADR\n\n## Summary\n\nd\n", true)).toEqual([]);
  expect(checkSummary("# ADR\n", true)).toHaveLength(1);
  expect(checkSummary("# T\n" + "x\n".repeat(25) + SUM)).toEqual(["no ## Summary within the first 20 lines"]);
});

function project(prd: string, frd: string, extra: Record<string, string> = {}) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-status-"));
  mkdirSync(join(root, "docs", "inbox", "frd"), { recursive: true });
  mkdirSync(join(root, "docs", "research"), { recursive: true });
  writeFileSync(join(root, "docs", "PRODUCT.md"), "Status: Approved (2026-11-17)\n");
  writeFileSync(join(root, "docs", "research", "x.md"), "Status: Draft\n");
  writeFileSync(join(root, "docs", "inbox", "PRD.md"), prd);
  writeFileSync(join(root, "docs", "inbox", "frd", "FRD-01-a.md"), frd);
  for (const [p, t] of Object.entries(extra)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  return root;
}

test("status passes when each approval rests on an approved document, and research is not a slice", () => {
  const { docs, fails } = chainStatus(project("Status: Approved (2026-11-17)\n", "Status: Approved (2026-11-18)\n"));
  expect(fails).toEqual([]);
  expect(docs.map((d) => d.kind)).toEqual(["PRODUCT", "PRD", "FRD"]);
  expect(docs.filter((d) => d.approved).length).toBe(3);
});

test("status fails when a document is approved above a draft", () => {
  const { fails } = chainStatus(project("Status: Draft\n", "Status: Approved (2026-11-18)\n"));
  expect(fails.some((f) => f.includes("FRD-01-a.md: approved, but") && f.includes("Draft"))).toBe(true);
});

test("status fails on a chain document with no valid Status line", () => {
  const { fails } = chainStatus(project("Status: Aproved (2026-11-17)\n", "Status: Draft\n"));
  expect(fails.some((f) => f.includes("PRD.md") && f.includes("no Status line"))).toBe(true);
  expect(fails.some((f) => f.includes("FRD-01-a.md"))).toBe(false);
});

test("status fails on an approved document with an open question", () => {
  const ok = "Status: Approved (2026-11-17)\n";
  expect(chainStatus(project(ok, ok + "## Open questions\n<Q-n. none>\n")).fails).toEqual([]);
  const { fails } = chainStatus(project(ok, ok + "## Open questions\nQ-1 who pays?\n"));
  expect(fails.some((f) => f.includes("FRD-01-a.md") && f.includes("Open questions"))).toBe(true);
  expect(chainStatus(project(ok, "Status: Draft\n## Open questions\nQ-1 who pays?\n")).fails).toEqual([]);
});

test("status follows UX, TP, SPEC and ADR to the document each rests on", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const files = {
    "docs/inbox/ux/UX-01-a.md": ok,
    "docs/inbox/tp/TP-01-a.md": "Status: Draft\nADR-001\n",
    "docs/inbox/specs/SPEC-01-a.md": ok + "Rests on: ../tp/TP-01-a.md\n",
    "docs/adr/ADR-001-x.md": "## Status\nAccepted\n",
    "docs/requests/REQ-1-a.md": "Status: Open\n",
  };
  const { docs, fails } = chainStatus(project("Status: Approved (2026-11-17)\n", ok, files));
  expect(docs.map((d) => d.kind).sort()).toEqual(["ADR", "FRD", "PRD", "PRODUCT", "REQUEST", "SPEC", "TP", "UX"]);
  expect(fails.some((f) => f.includes("SPEC-01-a.md: approved, but") && f.includes("TP-01-a.md"))).toBe(true);
  expect(fails.some((f) => f.includes("ADR-001-x.md"))).toBe(false); // an ADR may be Accepted while its TP is a draft
  expect(fails.some((f) => f.includes("UX-01-a.md"))).toBe(false);
});

test("status: a TP-NN rests on the cross-cutting TP, and a TP cites only Accepted ADRs", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const run = (cross: string, adr: string) =>
    chainStatus(
      project(ok, ok, {
        "docs/tp/TP.md": cross,
        "docs/inbox/tp/TP-01-a.md": ok + "### TD-1: x\nADR: ADR-001\n",
        "docs/adr/ADR-001-x.md": "## Status\n" + adr + "\n",
      }),
    ).fails;
  expect(run(ok, "Accepted")).toEqual([]);
  expect(run("Status: Draft\n", "Accepted").some((f) => f.includes("TP-01-a.md: approved, but") && /[\\/]tp[\\/]TP\.md is still Draft/.test(f))).toBe(true);
  expect(run(ok, "Proposed").some((f) => f.includes("TP-01-a.md: approved, but ADR-001 is still Proposed"))).toBe(true);
});

// covers: chain/FRD-02/EX-14
// covers: chain/FRD-02/DT-1
// covers: chain/FRD-02/DT-2
// covers: chain/FRD-02/ST-1
// covers: chain/FRD-02/DT-3
// covers: chain/FRD-02/ST-1
test("a Superseded status line is a valid Status for PRD, FRD and spec checks, and not for a request", () => {
  const NS = "no Status line";
  const noStatus = (fails: string[]) => fails.some((f) => f.includes(NS));
  expect(noStatus(checkPrd(PRD.replace("Status: Draft", "Status: Superseded by ../PRD.md (2026-11-20)"), "INBOX", PRODUCT))).toBe(false);
  expect(noStatus(checkPrd(PRD.replace("Status: Draft", "Status: Superseded by ../PRD.md"), "INBOX", PRODUCT))).toBe(true); // no date
  expect(noStatus(checkFrds(slice(FRD.replace("Status: Draft", "Status: Superseded by ../PRD.md (2026-11-20)")), "INBOX").fails)).toBe(false);
  expect(noStatus(sp(SPEC.replace("Status: Draft", "Status: Superseded by ../PRD.md (2026-11-20)")))).toBe(false);
  expect(noStatus(sp(SPEC.replace("Status: Draft", "Status: Superseded")))).toBe(true);
  expect(docStatus("Status: Superseded by REQ-2-x.md (2026-11-20)", "REQUEST").status).toBe("missing");
});

test("a superseded document needs an existing target; approval above it fails", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const run = (frd: string, extra: Record<string, string> = {}) => chainStatus(project(ok, frd, extra)).fails;
  expect(docStatus("Status: Superseded by ../PRD.md (2026-11-20)\n", "FRD")).toEqual({ approved: false, status: "Superseded", by: "../PRD.md" });
  expect(docStatus("Status: Superseded by ../PRD.md\n", "FRD").status).toBe("missing");
  expect(docStatus("Status: Superseded by ../PRD.md (2026-11-20)\n", "ADR").status).toBe("missing");
  expect(run("Status: Superseded by ../PRD.md (2026-11-20)\n")).toEqual([]);
  expect(run("Status: Superseded by ../nope.md (2026-11-20)\n").some((f) => f.includes("FRD-01-a.md") && f.includes("does not exist"))).toBe(true);
  expect(run("Status: Superseded by ../PRD.md\n").some((f) => f.includes("no Status line"))).toBe(true);
  const fails = run("Status: Superseded by ../PRD.md (2026-11-20)\n", { "docs/inbox/ux/UX-01-a.md": ok });
  expect(fails.some((f) => f.includes("UX-01-a.md: approved, but") && f.includes("superseded by ../PRD.md"))).toBe(true);
});

// covers: chain/FRD-02/EX-23
test("status failures name both documents with forward slashes only", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const fails = chainStatus(project(ok, ok, { "docs/inbox/tp/TP-01-a.md": "Status: Superseded by ../PRD.md (2026-11-20)\n", "docs/inbox/specs/SPEC-01-1-a.md": ok + "Rests on: ../tp/TP-01-a.md\n" })).fails;
  const f = fails.find((x) => x.includes("SPEC-01-1-a.md"))!;
  expect(f).toContain("inbox/specs/SPEC-01-1-a.md");
  expect(f).toContain("inbox/tp/TP-01-a.md");
  expect(fails.join("\n")).not.toContain("\\");
});

// covers: chain/FRD-02/EX-24
test("a path typed with backslashes in a document resolves like one with slashes", () => {
  const p = specAt();
  expect(checkSpec(SPEC.replace("Rests on: ../frd/FRD-01-a.md", "Rests on: ..\\frd\\FRD-01-a.md").replace("Quoted from: ../frd/FRD-01-a.md", "Quoted from: ..\\frd\\FRD-01-a.md"), p)).toEqual([]);
  expect(checkSpec(SPEC.replace("Rests on: ../frd/FRD-01-a.md", "Rests on: ..\\frd\\FRD-09-a.md"), p).join("\n")).toContain("which does not exist");
  const ok = "Status: Approved (2026-11-18)\n";
  const f = chainStatus(project(ok, ok, { "docs/inbox/specs/SPEC-01-1-a.md": ok + "Rests on: ..\\tp\\TP-09-x.md\n" })).fails.join("\n");
  expect(f).toContain("does not exist");
  expect(f).not.toContain("\\");
});

test("a request status must be Open, Accepted, Rejected or Merged into REQ-n", () => {
  expect(docStatus("Status: Open", "REQUEST").status).toBe("Open");
  expect(docStatus("Status: Merged into REQ-3", "REQUEST").status).toBe("Merged into REQ-3");
  expect(docStatus("Status: Accepted", "REQUEST").approved).toBe(true);
  expect(docStatus("Status: Opne", "REQUEST").status).toBe("missing");
  expect(docStatus("Status: Open.", "REQUEST").status).toBe("missing");
  expect(docStatus("Status: Open until Friday", "REQUEST").status).toBe("missing");
  expect(docStatus("no status line", "REQUEST").status).toBe("missing");
});

test("approve, drift, status and clear work end to end from the command line", () => {
  const root = project("Status: Draft\n\n" + SUM, "Status: Draft\n\n" + SUM);
  const cli = (...a: string[]) => {
    const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), ...a], { cwd: root });
    return { code: r.exitCode, out: r.stdout.toString() };
  };
  const prd = "docs/inbox/PRD.md",
    product = "docs/PRODUCT.md";
  expect(cli("approve", product, ".", "--date", "2026-11-17").code).toBe(0);
  expect(cli("approve", prd, ".", "--date", "2026-11-17").code).toBe(0);
  expect(cli("approve", prd, ".", "--date", "17-11-2026").code).toBe(2);
  expect(cli("drift", ".").out).toContain("PASS drift");
  // The parent changes: the PRD is suspect and status says so.
  writeFileSync(join(root, product), readFileSync(join(root, product), "utf8") + "\nnew words\n");
  const s = cli("status", ".");
  expect(s.code).toBe(1);
  expect(s.out).toContain("drifted: docs/PRODUCT.md: edited after approval");
  expect(s.out).toContain("drifted: docs/inbox/PRD.md: suspect, ../PRODUCT.md changed");
  expect(cli("clear", prd, ".").code).toBe(0);
  expect(cli("history", prd).code).toBe(1); // not a git repository
  expect(cli("history", "docs/nope.md").code).toBe(2);
  expect(cli("trace", ".").code).toBe(2); // no test directory
});

// covers: chain/FRD-03/EX-1
// covers: chain/FRD-03/EX-2
// covers: chain/FRD-03/DT-2
// covers: chain/FRD-03/DT-3
test("format gate: a 0.3.0 spec passes with format 2 warnings under format 1 and fails under format 2", () => {
  const V1 = "# Spec\n\nStatus: Draft\n\n" + SUM + "\n## Context\nc\n## Files\nf\n## Interfaces\ni\n## Data\nd\n## Tasks\n### Task 1: a\n- **Tests first:** EX-1\n- **Done when:** ok\n## Out of scope\nn\n";
  const spec = "docs/inbox/specs/SPEC-01-1-a.md";
  const root = project("Status: Draft\n", "Status: Draft\n## Rules and examples\nEX-1\n", { [spec]: V1 });
  const cli = (...a: string[]) => {
    const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), ...a], { cwd: root });
    return { code: r.exitCode, out: r.stdout.toString() };
  };
  const st = cli("status", ".");
  const sc = cli("spec", spec);
  expect([st.code, sc.code]).toEqual([0, 0]);
  expect(st.out).toContain("WARN (format 2): ");
  expect(sc.out).toContain("WARN (format 2): ");
  expect(sc.out).not.toContain("FAIL");
  // the hook's document check passes and hands the warnings back
  const warns: string[] = [];
  expect(runDocChecks(root, spec, false, warns)).toEqual([]);
  expect(warns.join("\n")).toContain("WARN (format 2): ");
  // a format 1 failure still fails: the spec has lost its tasks
  writeFileSync(join(root, spec), V1.replace(/### Task 1[\s\S]*## Out/, "## Out"));
  expect(cli("spec", spec).code).toBe(1);
  // format 2: the small-spec rules count
  mkdirSync(join(root, ".scriptorium"));
  writeFileSync(join(root, ".scriptorium", "config.json"), '{"format": 2}');
  writeFileSync(join(root, spec), V1);
  const f2 = cli("spec", spec);
  expect(f2.code).toBe(1);
  expect(f2.out).toContain('no "Rests on: <path>" line');
  expect(f2.out).not.toContain("[format");
  expect(cli("status", ".").code).toBe(1);
});

// covers: chain/FRD-03/EX-19
test("EX-19: a small spec with no Tasks section passes under format 2; format 1 still asks for tasks", () => {
  const p = specAt();
  const root = join(p, "..", "..", "..", "..");
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, SPEC);
  const cli = () => {
    const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "spec", p], { cwd: root });
    return { code: r.exitCode, out: r.stdout.toString() };
  };
  expect(cli().code).toBe(1); // mutant: pin 1 runs the format 1 rules
  mkdirSync(join(root, ".scriptorium"));
  writeFileSync(join(root, ".scriptorium", "config.json"), '{"format": 2}');
  const r = cli();
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("Tasks");
});
