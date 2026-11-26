import { test, expect } from "bun:test";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDocChecks, checksFor } from "../scripts/hook-doc-check.ts";
import { lintFile, CAPS } from "../scripts/lint-docs.ts";
import { traceFails } from "../scripts/trace.ts";
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

const DIAGRAM = '```mermaid\nflowchart LR\n  A["start"] --> B["finish"]\n```\n';
const UX_BARE = "# UX-01: a\n\nStatus: Draft\n\n" + SUM + "\n[FRD-01](../frd/FRD-01-a.md)\n## Flows\n## Screens\n## States\n## Design system\n## Accessibility and language\n## Open questions\n";
const UX = UX_BARE.replace("## Flows\n", "## Flows\n" + DIAGRAM); // a UX document with its diagram: it passes the diagram rule

test("a UX document with its sections and its FRD passes", () => expect(checkUx(slice(FRD, UX))).toEqual({ fails: [], files: 1 }));

test("a UX document missing a section or its FRD fails", () => {
  expect(checkUx(slice(FRD, UX.replace("## Screens", "## Other"))).fails).toContain("UX-01-a.md: missing section: ## Screens");
  const dir = slice(FRD, UX);
  writeFileSync(join(dir, "ux", "UX-02-b.md"), UX);
  expect(checkUx(dir).fails.some((f) => f.startsWith("UX-02-b.md: FRD-02 does not exist"))).toBe(true);
});

const TP_BARE =
  "# TP\n\nStatus: Draft\n\n" + SUM + "\n## Context\nFR-INBOX-01-1\n## Decisions\n### TD-1: storage\n- **Option A** files.\n- **Option B** a database.\n\nChosen: B, because x. ADR: ADR-001\n" + "## Architecture\n## Information\n## Interfaces and contracts\n## Threat model\n## Testing\n## Risks\n## Open questions\n";
const TP = TP_BARE.replace("## Architecture\n", "## Architecture\n" + DIAGRAM); // a TP with its diagram
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
  "# Spec\n\nStatus: Draft\nRests on: ../frd/FRD-01-a.md\n\n" +
  SUM +
  "\n## Rows\nQuoted from: ../frd/FRD-01-a.md\n" +
  FRD_ROWS +
  "\n## Files\n| File | Change |\n|---|---|\n| a.ts | new |\n\n## Reuses\nNothing to reuse: the fixture builds on nothing\n\n## Tests first\nEX-1, EX-2\n\n## Build\nb\n\n## Done when\n`bun test`\n\n## Out of scope\nn\n\n## Open questions\nNone\n";

// A project with the FRD rows on disk; returns the spec path.
function specAt(parent = FRD_ROWS + "other | row\n", files: Record<string, string> = {}, base = tmpdir()) {
  const root = project("Status: Draft\n", parent, files, base);
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

function project(prd: string, frd: string, extra: Record<string, string> = {}, base = tmpdir()) {
  const root = mkdtempSync(join(base, "scriptorium-status-"));
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

// Reuses section: the spec check through the CLI, so the project's pin decides how a failure counts.
function reuses(body: string | undefined, pin?: number, files: Record<string, string> = {}, base = tmpdir()) {
  const p = specAt(undefined, { "scripts/paths.ts": "export const typed = (p: string) => p;\n", "docs/inbox/specs/SPEC-03-2-gate-spec-rules.md": "Status: Draft\n", ...files }, base);
  const root = join(p, "..", "..", "..", "..");
  const text = body === undefined ? SPEC.replace("## Reuses\nNothing to reuse: the fixture builds on nothing\n\n", "") : SPEC.replace("Nothing to reuse: the fixture builds on nothing\n", body + "\n");
  writeFileSync(p, text);
  if (pin) {
    mkdirSync(join(root, ".scriptorium"), { recursive: true });
    writeFileSync(join(root, ".scriptorium", "config.json"), JSON.stringify({ format: pin }));
  }
  const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "spec", p], { cwd: root });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
}
const ok = (r: { code: number | null; out: string }) => {
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("Reuses");
};
const bad = (r: { code: number | null; out: string }, line: string) => {
  expect(r.code).toBe(1);
  expect(r.out).toContain(line);
};
const NO_SECTION = "no Reuses section: name the code and the precedent spec it builds on, or Nothing to reuse: <reason>";

// covers: chain/FRD-05/EX-1
test("EX-1: a Reuses entry naming a file and a name it defines passes", () => ok(reuses("- `scripts/paths.ts` `typed`: reads a path", 3)));

// covers: chain/FRD-05/EX-2
test("EX-2: a spec with no Reuses section fails in a format 3 project", () => bad(reuses(undefined, 3), NO_SECTION));

// covers: chain/FRD-05/EX-3
test("EX-3: a Reuses file that does not exist fails", () => bad(reuses("- `scripts/nope.ts` `run`: x", 3), "Reuses: scripts/nope.ts does not exist"));

// covers: chain/FRD-05/EX-4
test("EX-4: a Reuses name the file does not hold fails, and a longer word does not stand in for it", () => {
  bad(reuses("- `scripts/paths.ts` `nothere`: x", 3), "Reuses: nothere is not in scripts/paths.ts");
  bad(reuses("- `scripts/paths.ts` `type`: x", 3), "Reuses: type is not in scripts/paths.ts"); // whole word only: "typed" holds "type"
});

// covers: chain/FRD-05/EX-5
test("EX-5: Nothing to reuse with a reason passes", () => ok(reuses("Nothing to reuse: the first script that reads the host's notebook format", 3)));

// covers: chain/FRD-05/EX-6
test("EX-6: Nothing to reuse with no reason fails", () => bad(reuses("Nothing to reuse.", 3), "Reuses: say why there is nothing to reuse"));

// covers: chain/FRD-05/EX-7
test("EX-7: a precedent spec that does not exist fails, one that exists passes", () => {
  bad(reuses("- Precedent: SPEC-09-1-gone.md", 3), "Reuses: precedent SPEC-09-1-gone.md does not exist");
  ok(reuses("- Precedent: SPEC-03-2-gate-spec-rules.md, which added rules", 3));
});

// covers: chain/FRD-05/EX-8
test("EX-8: a Reuses entry naming a file in the test folder passes", () => ok(reuses("- `test/helper.ts` `fixture`: shared", 3, { "test/helper.ts": "export const fixture = 1;\n" })));

// covers: chain/FRD-05/EX-10
test("EX-10: a format 2 project with no Reuses section passes and prints the format 3 warning", () => {
  const r = reuses(undefined, 2);
  expect(r.code).toBe(0);
  expect(r.out).toContain("WARN (format 3): ");
  expect(r.out).toContain(NO_SECTION);
});

// covers: chain/FRD-05/EX-11
test("EX-11: the same spec in a format 3 project fails with the same line, and a spec with Reuses passes", () => {
  const r = reuses(undefined, 3);
  bad(r, NO_SECTION);
  expect(r.out).not.toContain("WARN (format 3)");
  ok(reuses("Nothing to reuse: x", 3)); // mutant: with the section it passes
});

// Answerer rule: documents with Q-n lines, checked through the CLI so the project's pin decides fail or warn.
function qroot(pin: number | undefined, docs: { prd?: string; frd?: string } = {}) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-answerer-"));
  mkdirSync(join(root, "docs", "inbox", "frd"), { recursive: true });
  writeFileSync(join(root, "docs", "PRODUCT.md"), PRODUCT);
  writeFileSync(join(root, "docs", "inbox", "PRD.md"), docs.prd ?? PRD);
  writeFileSync(join(root, "docs", "inbox", "frd", "FRD-01-a.md"), docs.frd ?? FRD);
  if (pin) {
    mkdirSync(join(root, ".scriptorium"));
    writeFileSync(join(root, ".scriptorium", "config.json"), JSON.stringify({ format: pin }));
  }
  return root;
}
const cliIn = (root: string, ...a: string[]) => {
  const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), ...a], { cwd: root });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
};
const withQ = (doc: string, q: string) => doc.replace(/## Open questions\n(None\.?\n)?/, "## Open questions\n" + q + "\n");
const frdCheck = (q: string, pin = 3) => cliIn(qroot(pin, { frd: withQ(FRD, q) }), "frd", "docs/inbox", "INBOX");
const prdCheck = (q: string, pin = 3) => cliIn(qroot(pin, { prd: withQ(PRD, q) }), "prd", "docs/inbox/PRD.md", "INBOX", "--product", "docs/PRODUCT.md");
const OWNER_LINE = "Q-1: say who answers it: (Owner: <reason>), (Research) or (Lead)";

// covers: chain/FRD-06/EX-1
test("EX-1: an FRD question answered by Research passes", () => {
  const r = frdCheck("- Q-1 (Research): where the 42-day limit comes from");
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("say who answers");
});

// covers: chain/FRD-06/EX-2
test("EX-2: an FRD question with no answerer fails with the line", () => {
  const r = frdCheck("- Q-1: where the limit comes from");
  expect(r.code).toBe(1);
  expect(r.out).toContain(OWNER_LINE);
});

// covers: chain/FRD-06/EX-3
test("EX-3: a PRD question for the owner with a reason passes", () => {
  const r = prdCheck("- Q-2 (Owner: a product goal): the adoption target");
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("say who");
});

// covers: chain/FRD-06/EX-4
test("EX-4: a PRD question for the owner with no reason fails", () => {
  const r = prdCheck("- Q-2 (Owner): the adoption target");
  expect(r.code).toBe(1);
  expect(r.out).toContain("Q-2: say why only the owner can answer it");
});

// covers: chain/FRD-06/EX-5
test("EX-5: a spec question answered by the lead passes, and one with no answerer fails", () => {
  const spec = (q: string) => {
    const p = specAt();
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, SPEC.replace("## Open questions\nNone\n", "## Open questions\n" + q + "\n"));
    const root = join(p, "..", "..", "..", "..");
    mkdirSync(join(root, ".scriptorium"), { recursive: true });
    writeFileSync(join(root, ".scriptorium", "config.json"), '{"format": 3}');
    return cliIn(root, "spec", p);
  };
  const good = spec("- Q-3 (Lead): which file holds the map");
  expect(good.code).toBe(0);
  expect(good.out).not.toContain("say who answers");
  const bad = spec("- Q-3: which file holds the map"); // mutant: no answerer
  expect(bad.code).toBe(1);
  expect(bad.out).toContain("Q-3: say who answers it: (Owner: <reason>), (Research) or (Lead)");
});

// covers: chain/FRD-06/EX-6
test("EX-6: an Open questions section that says None passes", () => {
  for (const none of ["None.", "None"]) {
    const r = frdCheck(none);
    expect(r.code).toBe(0);
    expect(r.out).not.toContain("say who");
  }
});

// covers: chain/FRD-06/EX-9
test("EX-9: under format 2 the missing answerer passes and prints the format 3 warning", () => {
  const r = frdCheck("- Q-1: where the limit comes from", 2);
  expect(r.code).toBe(0);
  expect(r.out).toContain("WARN (format 3): ");
  expect(r.out).toContain(OWNER_LINE);
});

// covers: chain/FRD-06/EX-10
test("EX-10: the same FRD under format 3 fails with the line and no warning", () => {
  const r = frdCheck("- Q-1: where the limit comes from", 3);
  expect(r.code).toBe(1);
  expect(r.out).toContain(OWNER_LINE);
  expect(r.out).not.toContain("WARN (format 3): ");
});

// covers: chain/FRD-06/EX-2
test("EX-2: a bare question line with no bullet and no answerer fails too", () => {
  const r = frdCheck("Q-1 who pays?", 3);
  expect(r.code).toBe(1);
  expect(r.out).toContain(OWNER_LINE);
  expect(frdCheck("Q-1 (Lead): who pays?", 3).code).toBe(0); // mutant: with an answerer it passes
});

// covers: chain/FRD-05/EX-10
test("EX-10: at pin 2 a Reuses entry naming a missing file passes with one format 3 warning tag on its line", () => {
  const r = reuses("- `scripts/nope.ts` `run`: x", 2);
  expect(r.code).toBe(0);
  const line = r.out.split("\n").find((l) => l.includes("scripts/nope.ts does not exist"));
  expect(line).toBeDefined();
  expect(line?.split("WARN (format 3): ").length).toBe(2); // exactly one tag
  expect(line?.trim().startsWith("WARN (format 3): ")).toBe(true); // the tag leads the line
  expect(r.out).not.toContain("WARN (format 2)");
  expect(r.out).not.toContain("[format");
});

// covers: chain/FRD-05/EX-3
test("EX-3: a Reuses path that leaves the project fails even when the file exists there", () => {
  const name = "outside-" + Math.random().toString(36).slice(2) + ".ts";
  // the project root sits one folder inside the fresh folder "outer", so two folders above it is "outer": writable on every system
  const outer = mkdtempSync(join(tmpdir(), "scriptorium-outer-"));
  const inner = join(outer, "inner");
  mkdirSync(inner);
  const outside = join(outer, name);
  writeFileSync(outside, "export const x = 1;\n");
  try {
    expect(existsSync(outside)).toBe(true);
    bad(reuses("- `../../" + name + "` `x`: x", 3, {}, inner), "Reuses: ../../" + name + " does not exist");
  } finally {
    rmSync(outer, { recursive: true, force: true });
  }
});

// covers: chain/FRD-05/EX-2
test("EX-2: a Reuses entry with no bullet still says what to write", () => {
  const r = reuses("`scripts/paths.ts` `typed`: reads a path", 3);
  expect(r.code).toBe(1);
  expect(r.out).toContain("Reuses section has no valid entry, write one of: - `path` `name`, Nothing to reuse: <reason>, Precedent: SPEC-....md");
  expect(r.out).not.toContain("no Reuses section"); // the section is there, so it is not called absent
});

// issue 13
test("a Reuses entry naming a directory fails without a throw", () => {
  const r = reuses("- `scripts` `typed`: a folder", 3);
  bad(r, "Reuses: scripts is a directory, name a file");
  expect(r.out).not.toContain("EISDIR");
});

function uxTpRoot(pin: number, q: string) {
  const root = qroot(pin);
  mkdirSync(join(root, "docs", "inbox", "ux"), { recursive: true });
  mkdirSync(join(root, "docs", "inbox", "tp"), { recursive: true });
  mkdirSync(join(root, "docs", "adr"), { recursive: true });
  writeFileSync(join(root, "docs", "inbox", "ux", "UX-01-a.md"), withQ(UX, q));
  writeFileSync(join(root, "docs", "inbox", "tp", "TP-01-a.md"), withQ(TP, q));
  writeFileSync(join(root, "docs", "adr", "ADR-001-storage.md"), ADR);
  return root;
}
const uxCheck = (q: string, pin = 3) => cliIn(uxTpRoot(pin, q), "ux", "docs/inbox");
const tpCheck = (q: string, pin = 3) => cliIn(uxTpRoot(pin, q), "tp", "docs/inbox/tp/TP-01-a.md", "docs/adr", "--root", "docs");

// covers: chain/FRD-06/EX-2
test("EX-2: a UX question with no answerer fails with the line, naming the file", () => {
  const r = uxCheck("- Q-1: where the limit comes from");
  expect(r.code).toBe(1);
  expect(r.out.split("\n").some((l) => l.includes("UX-01-a.md: " + OWNER_LINE))).toBe(true);
  expect(uxCheck("- Q-1 (Lead): where the limit comes from").code).toBe(0); // mutant: with an answerer it passes
});

// covers: chain/FRD-06/EX-2
test("EX-2: a TP question with no answerer fails with the line", () => {
  const r = tpCheck("- Q-1: where the limit comes from");
  expect(r.code).toBe(1);
  expect(r.out).toContain(OWNER_LINE);
  expect(tpCheck("- Q-1 (Lead): where the limit comes from").code).toBe(0); // mutant: with an answerer it passes
});

// covers: chain/FRD-06/EX-2
test("EX-2: in a folder check the line starts with the file name", () => {
  const r = frdCheck("- Q-1: where the limit comes from");
  expect(r.out.split("\n").some((l) => l.includes("FRD-01-a.md: " + OWNER_LINE))).toBe(true);
});

// covers: chain/FRD-06/EX-4
test("EX-4: the literal (Owner: <reason>) is not a reason", () => {
  const r = prdCheck("- Q-2 (Owner: <reason>): the adoption target");
  expect(r.code).toBe(1);
  expect(r.out).toContain("Q-2: say why only the owner can answer it");
  expect(prdCheck("- Q-2 (Owner: a product goal): the adoption target").code).toBe(0); // mutant: a real reason passes
});

// covers: chain/FRD-06/EX-2
test("EX-2: an answerer after other words, not right after the id, does not count", () => {
  const r = frdCheck("- Q-1 who pays (Lead)", 3);
  expect(r.code).toBe(1);
  expect(r.out).toContain(OWNER_LINE);
  expect(frdCheck("- Q-1 (Lead) who pays", 3).code).toBe(0); // mutant: right after the id it passes
});

// covers: chain/FRD-06/EX-6
test("EX-6: a Q-n mentioned outside the Open questions section does not need an answerer", () => {
  const frd = withQ(FRD, "None.").replace("## Why\nREQ-1", "## Why\nREQ-1, and Q-3 was answered in D-12");
  expect(frd).toContain("Q-3 was answered");
  const r = cliIn(qroot(3, { frd }), "frd", "docs/inbox", "INBOX");
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("say who answers");
});

// A TP in a project: its Rests on line, its parent document and the ADR files, checked through the CLI.
const REQ6 = (decision: string) => "# REQ-6: x\n\nStatus: Accepted\n\n" + SUM + "\n## Decision\n" + decision + "\n";
const REGISTRY = "# Checks\n\n| ID | Prevents | Command | Replay |\n|---|---|---|---|\n| CHECK-1 | x | `bun test` | `test/x.ts` |\n| CHECK-2 | y | `bun test` | `test/y.ts` |\n";
function tpIn(opts: { rests?: string; cites: string; adr?: string; adrFile?: string; files?: Record<string, string> }) {
  const root = qroot(undefined);
  let tp = TP.replace("FR-INBOX-01-1", opts.cites);
  if (opts.rests) tp = tp.replace("Status: Draft\n", "Status: Draft\nRests on: " + opts.rests + "\n");
  if (opts.adr) tp = tp.replace("ADR: ADR-001", "ADR: " + opts.adr);
  const all: Record<string, string> = { "docs/inbox/tp/TP-01-a.md": tp, ["docs/adr/" + (opts.adrFile ?? "ADR-001-storage.md")]: ADR, ...opts.files };
  for (const [p, t] of Object.entries(all)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  return cliIn(root, "tp", "docs/inbox/tp/TP-01-a.md", "docs/adr", "--root", "docs");
}
const ON_REQ = "../../requests/REQ-6-ci.md";
const req6 = (decision: string) => ({ "docs/requests/REQ-6-ci.md": REQ6(decision) });

// covers: chain/FRD-07/EX-1
test("EX-1: a TP resting on a request cites an id of its Decision and passes", () => {
  const r = tpIn({ rests: ON_REQ, cites: "CI-1", files: req6("- CI-1: use a cache\n- CI-2: pin the tool") });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("cites no FR id");
});

// covers: chain/FRD-07/EX-2
test("EX-2: a TP resting on a request that cites none of its ids fails", () => {
  const r = tpIn({ rests: ON_REQ, cites: "nothing of the request", files: req6("- CI-1: use a cache\n- CI-2: pin the tool") });
  expect(r.code).toBe(1);
  expect(r.out).toContain("cites no id of REQ-6's Decision");
});

// covers: chain/FRD-07/EX-3
test("EX-3: a TP citing an id the request's Decision does not define fails", () => {
  const r = tpIn({ rests: ON_REQ, cites: "CI-1 and CI-9", files: req6("- CI-1: use a cache\n- CI-2: pin the tool") });
  expect(r.code).toBe(1);
  expect(r.out).toContain("cites CI-9, not in REQ-6's Decision");
  expect(r.out).not.toContain("cites CI-1,"); // CI-1 is defined
});

// covers: chain/FRD-07/EX-4
test("EX-4: a request whose Decision is prose with no ids fails, telling how to give ids", () => {
  const r = tpIn({ rests: ON_REQ, cites: "CI-1", files: req6("We decided to use a cache and to pin the tool.") });
  expect(r.code).toBe(1);
  expect(r.out).toContain("REQ-6: give each decision an id (CI-1, CI-2) so the TP can cite it");
});

// covers: chain/FRD-07/EX-5
test("EX-5: a TP resting on docs/CHECKS.md cites one of its rows and passes", () => {
  const r = tpIn({ rests: "../../CHECKS.md", cites: "CHECK-2", files: { "docs/CHECKS.md": REGISTRY } });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("cites no");
  expect(tpIn({ rests: "../../CHECKS.md", cites: "CHECK-9", files: { "docs/CHECKS.md": REGISTRY } }).code).toBe(1); // mutant: a row the registry lacks fails
});

// covers: chain/FRD-07/EX-6
test("EX-6: a TP with no Rests on line is checked against FR ids as before", () => {
  expect(tpIn({ cites: "FR-INBOX-01-1" }).code).toBe(0);
  const bad = tpIn({ cites: "FR-INBOX-01-9" });
  expect(bad.code).toBe(1);
  expect(bad.out).toContain("cites FR-INBOX-01-9, defined in no FRD");
});

// covers: chain/FRD-07/EX-9
test("EX-9: an ADR with four digits and its file passes", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0029", adrFile: "ADR-0029-ci.md" });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("has no file");
});

// covers: chain/FRD-07/EX-10
test("EX-10: an ADR id with no file fails with the id whole", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0029" });
  expect(r.code).toBe(1);
  expect(r.out).toContain("ADR-0029 has no file");
  expect(r.out).not.toContain("ADR-002 has no file");
});

// A TP resting on a request, approved through the CLI: approve records the request as the parent.
function tpOnRequest(reqStatus: string) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-approve-"));
  mkdirSync(join(root, "docs", "requests"), { recursive: true });
  mkdirSync(join(root, "docs", "inbox", "tp"), { recursive: true });
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Draft\n");
  writeFileSync(join(root, "docs", "requests", "REQ-6-ci.md"), "# REQ-6: x\n\nStatus: " + reqStatus + "\n\n" + SUM + "\n## Decision\n- CI-1: use a cache\n");
  writeFileSync(join(root, "docs", "inbox", "tp", "TP-01-a.md"), TP.replace("Status: Draft\n", "Status: Draft\nRests on: ../../requests/REQ-6-ci.md\n").replace("FR-INBOX-01-1", "CI-1"));
  return root;
}

// covers: chain/FRD-07/EX-7
test("EX-7: approve on a TP resting on an accepted request records the request as the parent and passes", () => {
  const root = tpOnRequest("Accepted");
  const r = cliIn(root, "approve", "docs/inbox/tp/TP-01-a.md", ".");
  expect(r.code).toBe(0);
  const text = readFileSync(join(root, "docs", "inbox", "tp", "TP-01-a.md"), "utf8");
  expect(text).toContain("Status: Approved");
  expect(text).toMatch(/Approval: content \S+; rests on \.\.\/\.\.\/requests\/REQ-6-ci\.md \S+/);
});

// covers: chain/FRD-07/EX-8
test("EX-8: approve on a TP resting on a request that is still Open fails", () => {
  const root = tpOnRequest("Open");
  const r = cliIn(root, "approve", "docs/inbox/tp/TP-01-a.md", ".");
  expect(r.code).toBe(1);
  expect(r.out).toContain("REQ-6");
  expect(r.out).toMatch(/accepted/i);
  expect(readFileSync(join(root, "docs", "inbox", "tp", "TP-01-a.md"), "utf8")).not.toContain("Status: Approved"); // nothing was approved
});

// covers: chain/FRD-07/EX-11
test("EX-11: an id defined outside the request's Decision section does not count", () => {
  const req = "# REQ-6: x\n\nStatus: Accepted\n\n" + SUM + "\n## Context\n- CI-3: only background\n## Decision\n- CI-1: use a cache\n- CI-2: pin the tool\n";
  const r = tpIn({ rests: ON_REQ, cites: "CI-3", files: { "docs/requests/REQ-6-ci.md": req } });
  expect(r.code).toBe(1);
  expect(r.out).toContain("cites CI-3, not in REQ-6's Decision");
});

// covers: chain/FRD-07/EX-12
test("EX-12: an ADR file whose id only starts with the cited id does not match", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0029", adrFile: "ADR-00290-x.md" });
  expect(r.code).toBe(1);
  expect(r.out).toContain("ADR-0029 has no file");
});

// covers: chain/FRD-07/EX-13
test("EX-13: a Rests on path that does not exist fails and names the path", () => {
  const r = tpIn({ rests: "../../requests/REQ-9-x.md", cites: "CI-1" });
  expect(r.code).toBe(1);
  expect(r.out).toContain("rests on ../../requests/REQ-9-x.md, which does not exist");
});

// covers: chain/FRD-07/EX-14
test("EX-14: a TP with no Rests on line that cites no FR id still fails", () => {
  const r = tpIn({ cites: "nothing at all" });
  expect(r.code).toBe(1);
  expect(r.out).toContain("cites no FR id");
});

// covers: chain/FRD-07/EX-15
test("EX-15: status asks no cross-cutting TP of an approved TP resting on an accepted request", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const { fails } = chainStatus(project(ok, ok, { "docs/requests/REQ-6-ci.md": "Status: Accepted\n", "docs/inbox/tp/TP-01-a.md": ok + "Rests on: ../../requests/REQ-6-ci.md\n" }));
  expect(fails.filter((f) => f.includes("TP-01-a.md"))).toEqual([]);
});

// covers: chain/FRD-07/EX-16
test("EX-16: status still asks the cross-cutting TP of an approved TP with no Rests on line", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const { fails } = chainStatus(project(ok, ok, { "docs/inbox/tp/TP-01-a.md": ok }));
  expect(fails.some((f) => f.includes("TP-01-a.md") && /TP\.md/.test(f) && f.includes("does not exist"))).toBe(true);
});

// covers: chain/FRD-07/EX-17
test("EX-17: approve on a request fails, says the owner accepts it on its Status line, and changes nothing", () => {
  const root = tpOnRequest("Accepted");
  const path = join(root, "docs", "requests", "REQ-6-ci.md");
  const before = readFileSync(path, "utf8");
  const r = cliIn(root, "approve", "docs/requests/REQ-6-ci.md", ".");
  expect(r.code).toBe(1);
  expect(r.out).toContain("the owner accepts a request on its Status line; approve is for chain documents");
  expect(readFileSync(path, "utf8")).toBe(before);
});

// covers: chain/FRD-08/EX-1
test("EX-1: an ADR file named NNNN-name.md is found for ADR-NNNN", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0021", adrFile: "0021-baselines.md" });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("has no file");
});

// covers: chain/FRD-08/EX-2
test("EX-2: a file whose number only starts with the cited number is not the ADR", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0021", adrFile: "00210-x.md" });
  expect(r.code).toBe(1);
  expect(r.out).toContain("ADR-0021 has no file");
});

const CUTOFF = '{"format":3,"legacyAdrsThrough":30}';
const legacyAdr = (extra: string) => "# ADR-0021: baselines\n\n" + extra + "just a long note\n".repeat(200);

// covers: chain/FRD-08/EX-4
test("EX-4: the TP check reports nothing for a cited ADR at or below the cutoff with no ADR sections", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0021", files: { "docs/adr/0021-baselines.md": legacyAdr(""), ".scriptorium/config.json": CUTOFF } });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("0021");
});

// covers: chain/FRD-08/EX-5
test("EX-5: an ADR above the cutoff still needs its template sections", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0031", adrFile: "ADR-0031-x.md", files: { ".scriptorium/config.json": CUTOFF } });
  const noSummary = ADR.replace("## Summary\ns\n", "");
  const bad = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0031", adrFile: "ADR-0031-x.md", files: { "docs/adr/ADR-0031-x.md": noSummary, ".scriptorium/config.json": CUTOFF } });
  expect(r.code).toBe(0); // mutant: with its Summary the ADR passes
  expect(bad.code).toBe(1);
  expect(bad.out).toContain("ADR-0031");
  expect(bad.out).toContain("missing section: ## Summary");
});

// covers: chain/FRD-08/EX-6
test("EX-6: a cited legacy ADR whose status line says it is not accepted fails with its status", () => {
  const cite = (text: string) => tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0021", files: { "docs/adr/0021-baselines.md": text, ".scriptorium/config.json": CUTOFF } });
  const sup = cite(legacyAdr("Status: Superseded\n\n"));
  expect(sup.code).toBe(1);
  expect(sup.out).toContain("ADR-0021 is Superseded, not accepted");
  const prop = cite(legacyAdr("## Status\nProposed\n\n"));
  expect(prop.out).toContain("ADR-0021 is Proposed, not accepted");
  expect(cite(legacyAdr("Status: Accepted\n\n")).code).toBe(0); // mutant: accepted passes
  expect(cite(legacyAdr("")).code).toBe(0); // no status line counts as accepted
});

// covers: chain/FRD-08/EX-4
test("EX-4: a cited ADR numbered exactly at the cutoff is exempt from the template", () => {
  const r = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0030", files: { "docs/adr/0030-x.md": legacyAdr(""), ".scriptorium/config.json": CUTOFF } });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("0030");
});

// covers: chain/FRD-08/EX-6
test("EX-6: the not accepted line is only for a legacy ADR, and only for the cited file", () => {
  // above the cutoff: the template rules apply as today, with no "not accepted" line
  const above = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0031", adrFile: "ADR-0031-x.md", files: { "docs/adr/ADR-0031-x.md": ADR.replace("## Status\nAccepted", "## Status\nSuperseded"), ".scriptorium/config.json": CUTOFF } });
  expect(above.out).not.toContain("not accepted");
  // ADR-0021 is cited and only 00210-x.md exists: that file is not ADR-0021, so its status counts for nothing
  const other = tpIn({ cites: "FR-INBOX-01-1", adr: "ADR-0021", files: { "docs/adr/00210-x.md": legacyAdr("Status: Superseded\n\n"), ".scriptorium/config.json": CUTOFF } });
  expect(other.code).toBe(1);
  expect(other.out).toContain("ADR-0021 has no file");
  expect(other.out).not.toContain("not accepted");
});

// covers: chain/FRD-08/EX-4
test("EX-4: the TP check reads the cutoff from the project of the TP, not from the folder it runs in", () => {
  const build = (config?: string) => {
    const root = qroot(undefined);
    const files: Record<string, string> = {
      "docs/inbox/tp/TP-01-a.md": TP.replace("ADR: ADR-001", "ADR: ADR-0021"),
      "docs/adr/0021-x.md": legacyAdr(""),
      ...(config ? { ".scriptorium/config.json": config } : {}),
    };
    for (const [p, t] of Object.entries(files)) {
      mkdirSync(join(root, p, ".."), { recursive: true });
      writeFileSync(join(root, p), t);
    }
    return root;
  };
  const run = (root: string, cwd: string) => {
    const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "tp", join(root, "docs", "inbox", "tp", "TP-01-a.md"), join(root, "docs", "adr"), "--root", join(root, "docs")], { cwd });
    return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
  };
  const repoRoot = join(import.meta.dir, "..");
  const elsewhere = mkdtempSync(join(tmpdir(), "scriptorium-elsewhere-"));
  for (const cwd of [repoRoot, elsewhere]) {
    const ok = run(build(CUTOFF), cwd);
    expect(ok.code).toBe(0);
    expect(ok.out).not.toContain("0021");
  }
  const noCutoff = run(build(), repoRoot); // mutant: with no cutoff in the project the bare ADR fails
  expect(noCutoff.code).toBe(1);
  expect(noCutoff.out).toContain("0021");
});

// covers: chain/FRD-08/EX-20
test("EX-20: status lists an ADR at or below the cutoff as legacy and does not fail it for its status line", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const adr12 = "# ADR 12\n\n- **Estado:** Aceptada\n";
  const run = (config?: string) => chainStatus(project(ok, ok, { "docs/adr/ADR-0012-x.md": adr12, ...(config ? { ".scriptorium/config.json": config } : {}) }));
  const { docs, fails } = run('{"format":3,"legacyAdrsThrough":28}');
  expect(docs.find((d) => d.path.includes("ADR-0012"))?.status).toBe("legacy");
  expect(fails.filter((f) => f.includes("ADR-0012"))).toEqual([]);
  const none = run('{"format":3}'); // mutant: with no cutoff it still fails, as today
  expect(none.fails.some((f) => f.includes("ADR-0012") && f.includes('ADR status "missing" is not Proposed, Accepted, Superseded or Rejected'))).toBe(true);
  expect(none.docs.find((d) => d.path.includes("ADR-0012"))?.status).toBe("missing");
});

// covers: chain/FRD-08/EX-21
test("EX-21: an ADR above the cutoff with no Status section still fails as today, and at the cutoff it is legacy", () => {
  const ok = "Status: Approved (2026-11-18)\n";
  const config = '{"format":3,"legacyAdrsThrough":28}';
  const { docs, fails } = chainStatus(project(ok, ok, { "docs/adr/ADR-0029-x.md": "# ADR 29\n", "docs/adr/ADR-0028-x.md": "# ADR 28\n", ".scriptorium/config.json": config }));
  expect(fails.some((f) => f.includes("ADR-0029") && f.includes('ADR status "missing" is not Proposed, Accepted, Superseded or Rejected'))).toBe(true);
  expect(docs.find((d) => d.path.includes("ADR-0029"))?.status).toBe("missing");
  expect(docs.find((d) => d.path.includes("ADR-0028"))?.status).toBe("legacy"); // the cutoff itself is legacy
  expect(fails.filter((f) => f.includes("ADR-0028"))).toEqual([]);
  expect(docs.find((d) => d.path.includes("ADR-0028"))?.approved).toBe(true); // a legacy ADR counts as accepted for what rests on it
  // a hand-written "legacy" status is not a way around the cutoff: above it, it fails
  const hand = (n: string) => "# ADR " + n + "\n\n## Status\nlegacy\n";
  const typed = chainStatus(project(ok, ok, { "docs/adr/ADR-0029-x.md": hand("29"), "docs/adr/ADR-0028-x.md": hand("28"), ".scriptorium/config.json": config }));
  expect(typed.fails.some((f) => f.includes("ADR-0029") && f.includes("ADR status") && f.includes("legacy"))).toBe(true);
  expect(typed.docs.find((d) => d.path.includes("ADR-0028"))?.status).toBe("legacy");
  expect(typed.fails.filter((f) => f.includes("ADR-0028"))).toEqual([]);
});

// covers: chain/FRD-08/EX-22
test("EX-22: a quoted row is found when only the spaces around its cells differ, in either direction", () => {
  expect(sp(SPEC, "|  EX-1  |   a |b  |\n| EX-2   | c |  d |\n")).toEqual([]); // the parent is padded, the spec is not
  const padded = SPEC.replace("| EX-1 | a | b |", "|  EX-1 |   a   | b  |").replace("| EX-2 | c | d |", "|EX-2|c|d|");
  expect(padded).not.toBe(SPEC);
  expect(sp(padded)).toEqual([]); // the spec is padded or tight, the parent is not
  expect(sp(SPEC, "| EX-1 | a | b |\n| EX-2 | c | d |\n")).toEqual([]); // mutant: identical rows still pass
});

// covers: chain/FRD-08/EX-23
test("EX-23: a quoted row whose cell text differs inside still fails, even by one extra space between words", () => {
  const parent = "| EX-1 | a | b |\n| EX-2 | c d | e |\n";
  const quoted = (cell: string) => SPEC.replace("| EX-2 | c | d |", "| EX-2 | " + cell + " | e |");
  expect(sp(quoted("c d"), parent)).toEqual([]); // the same text passes
  for (const cell of ["c  d", "c x", "d c", "cd"]) {
    const fails = sp(quoted(cell), parent);
    expect([cell, fails.some((f) => f.includes("not found verbatim") && f.includes("EX-2"))]).toEqual([cell, true]);
  }
});

// A spec in a git repository: the files git tracks, the spec's Files table, its Tests first line and its Done command are the cases.
function trackedSpec(opts: { files: string; testsFirst?: string; done?: string; tracked: string[]; pin?: number }) {
  const p = specAt(undefined, { "scripts/paths.ts": "export const typed = 1;\n" });
  const root = join(p, "..", "..", "..", "..");
  let text = SPEC.replace("| File | Change |\n|---|---|\n| a.ts | new |", "| Path | Create or change | Holds |\n|---|---|---|\n" + opts.files);
  if (opts.testsFirst) text = text.replace("EX-1, EX-2\n\n## Build", "EX-1, EX-2, " + opts.testsFirst + "\n\n## Build");
  if (opts.done) text = text.replace("`bun test`", opts.done);
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, text);
  for (const f of opts.tracked) {
    mkdirSync(join(root, f, ".."), { recursive: true });
    writeFileSync(join(root, f), "x\n");
  }
  if (opts.pin) {
    mkdirSync(join(root, ".scriptorium"), { recursive: true });
    writeFileSync(join(root, ".scriptorium", "config.json"), JSON.stringify({ format: opts.pin }));
  }
  const g = (...a: string[]) => Bun.spawnSync(["git", ...a], { cwd: root });
  g("init", "-q");
  g("add", "-A"); // everything written so far is tracked, except the files this call leaves untracked below
  const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "spec", p], { cwd: root });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
}

// covers: chain/FRD-10/EX-1
test("EX-1: a Files row naming a path that is not tracked fails, even when a file with a similar name is", () => {
  const r = trackedSpec({ files: "| `test/restore-record.test.ts` | Change | x |", tracked: ["test/withdraw-restore-record.test.ts"], pin: 4 });
  expect(r.code).toBe(1);
  expect(r.out).toContain("test/restore-record.test.ts is not a tracked file");
  expect(trackedSpec({ files: "| `test/withdraw-restore-record.test.ts` | Change | x |", tracked: ["test/withdraw-restore-record.test.ts"], pin: 4 }).code).toBe(0); // mutant: a tracked path passes
});

// covers: chain/FRD-10/EX-2
test("EX-2: a path named in Tests first with a Create row in Files reports nothing", () => {
  const r = trackedSpec({ files: "| `test/new-thing.test.ts` | Create | x |", testsFirst: "test/new-thing.test.ts", tracked: [], pin: 4 });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("test/new-thing.test.ts");
  const noCreate = trackedSpec({ files: "| `test/new-thing.test.ts` | Change | x |", testsFirst: "test/new-thing.test.ts", tracked: [], pin: 4 }); // mutant: Change is not Create
  expect(noCreate.code).toBe(1);
  expect(noCreate.out).toContain("test/new-thing.test.ts is not a tracked file");
});

// covers: chain/FRD-10/EX-3
test("EX-3: a path named only in the Done command that is not tracked fails", () => {
  const r = trackedSpec({ files: "| `scripts/paths.ts` | Change | x |", done: "`bun test test/old.test.ts`", tracked: ["scripts/paths.ts"], pin: 4 });
  expect(r.code).toBe(1);
  expect(r.out).toContain("test/old.test.ts is not a tracked file");
});

// covers: chain/FRD-10/EX-6
test("EX-6: under format 3 an untracked path is a warning, not a failure", () => {
  const r = trackedSpec({ files: "| `test/restore-record.test.ts` | Change | x |", tracked: [], pin: 3 });
  expect(r.code).toBe(0);
  expect(r.out).toContain("WARN (format 4): ");
  expect(r.out).toContain("test/restore-record.test.ts is not a tracked file");
});

// covers: chain/FRD-10/EX-7
test("EX-7: under format 4, a spec whose paths are all tracked or created passes with no warning", () => {
  const r = trackedSpec({ files: "| `scripts/paths.ts` | Change | x |\n| `test/made.test.ts` | Create | x |", testsFirst: "test/made.test.ts", done: "`bun test test/made.test.ts scripts/paths.ts`", tracked: ["scripts/paths.ts"], pin: 4 });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("WARN");
  expect(r.out).not.toContain("not a tracked file");
});

// Two sibling specs in one folder, each with a code block in its Build section; the check runs on the second one.
function siblings(declaring: string, calling: string, pin = 4) {
  const first = specAt(undefined, { "a.ts": "export {};\n" });
  const root = join(first, "..", "..", "..", "..");
  const dir = join(first, "..");
  mkdirSync(dir, { recursive: true });
  const build = (code: string) => SPEC.replace("## Build\nb\n", "## Build\n```ts\n" + code + "\n```\n");
  writeFileSync(join(dir, "SPEC-01-48-reader.md"), build(declaring));
  const second = join(dir, "SPEC-01-35-user.md");
  writeFileSync(second, build(calling));
  mkdirSync(join(root, ".scriptorium"), { recursive: true });
  writeFileSync(join(root, ".scriptorium", "config.json"), JSON.stringify({ format: pin }));
  const g = (...a: string[]) => Bun.spawnSync(["git", ...a], { cwd: root });
  g("init", "-q");
  g("add", "-A"); // a.ts and the specs are tracked, so the tracked-path rule has nothing to say
  const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "spec", second], { cwd: root });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
}
const DECLARES = "class RecordsReader {\n  constructor(a, b, c, d) {}\n}";

// covers: chain/FRD-10/EX-4
test("EX-4: a call whose argument count differs from the sibling's declaration fails, naming both specs and both counts", () => {
  const r = siblings(DECLARES, "const reader = new RecordsReader(x, y);");
  expect(r.code).toBe(1);
  const line = r.out.split("\n").find((l) => l.includes("RecordsReader")) as string;
  expect(line).toBeDefined();
  expect(line).toContain("SPEC-01-48");
  expect(line).toContain("SPEC-01-35");
  expect(line).toMatch(/\b4\b/);
  expect(line).toMatch(/\b2\b/);
});

// covers: chain/FRD-10/EX-5
test("EX-5: both specs use the same argument count: nothing is reported for it", () => {
  const r = siblings(DECLARES, "const reader = new RecordsReader(w, x, y, z);");
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("RecordsReader");
  const nested = siblings(DECLARES, "const reader = new RecordsReader(f(1, 2), [3, 4], { k: 5, j: 6 }, z);"); // arguments are counted at the top level
  expect(nested.code).toBe(0);
  expect(nested.out).not.toContain("RecordsReader");
});

// Diagram rule: a TP, UX or FRD whose Architecture, Flows or States has no Mermaid block, through the CLI with a pin file.
const MERMAID = '```mermaid\nflowchart LR\n  A["quoted label"] --> B["next step"]\n```\n';
const TP_PATH = "docs/inbox/tp/TP-01-a.md";
const tpWith = (architecture: string, pin: number) => tpIn({ cites: "FR-INBOX-01-1", files: { [TP_PATH]: TP_BARE.replace("## Architecture\n", "## Architecture\n" + architecture), ".scriptorium/config.json": JSON.stringify({ format: pin }) } });
const PROSE = "The reader sits in front of the store.\n\nThe store keeps the records.\n";

// covers: chain/FRD-11/EX-1
test("EX-1: a TP whose Architecture is prose fails with no Mermaid block", () => {
  const r = tpWith(PROSE, 4);
  expect(r.code).toBe(1);
  expect(r.out).toContain("Architecture has no Mermaid block");
});

// covers: chain/FRD-11/EX-8
test("EX-8: under format 3 a TP with no Mermaid block passes and prints the failure as a warning", () => {
  const r = tpWith(PROSE, 3);
  expect(r.code).toBe(0);
  expect(r.out).toContain("WARN (format 4): ");
  expect(r.out).toContain("Architecture has no Mermaid block");
});

// covers: chain/FRD-11/EX-10
test("EX-10: under format 4 a TP whose Architecture holds a quoted flowchart passes with no warning", () => {
  const r = tpWith(MERMAID, 4);
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("WARN");
  expect(r.out).not.toContain("Mermaid");
});

// covers: chain/FRD-11/EX-2
test("EX-2: an FRD whose States says n/a reports nothing for States; prose in States fails", () => {
  const frd = (states: string) => cliIn(qroot(4, { frd: FRD.replace("## States\nn/a: no lifecycle\n", "## States\n" + states) }), "frd", "docs/inbox", "INBOX");
  const ok = frd("n/a: nothing here keeps state.\n");
  expect(ok.code).toBe(0);
  expect(ok.out).not.toContain("States");
  const prose = frd("The record is open, then closed.\n"); // mutant: a States section of prose needs a diagram
  expect(prose.code).toBe(1);
  expect(prose.out).toContain("States has no Mermaid block");
  // a diagram does not replace the ST rows: States still needs an ST-n row or n/a
  const onlyDiagram = frd(MERMAID);
  expect(onlyDiagram.code).toBe(1);
  expect(onlyDiagram.out).toContain('States holds no ST-n row and no "n/a: <reason>"');
  expect(onlyDiagram.out).not.toContain("Mermaid block"); // the block is there, it is the row that is missing
  expect(frd("ST-1 open to closed\n" + MERMAID).code).toBe(0); // a row and a block pass
});

// covers: chain/FRD-11/EX-3
test("EX-3: a UX document whose Flows lists steps as bullets fails with no Mermaid block", () => {
  const ux = (flows: string) => {
    const root = uxTpRoot(4, "None.");
    writeFileSync(join(root, "docs", "inbox", "ux", "UX-01-a.md"), UX_BARE.replace("## Flows\n", "## Flows\n" + flows));
    return cliIn(root, "ux", "docs/inbox");
  };
  const r = ux("- the reader opens the page\n- the reader picks a slot\n");
  expect(r.code).toBe(1);
  expect(r.out).toContain("UX-01-a.md: Flows has no Mermaid block"); // the failure names the file
  expect(ux(MERMAID).code).toBe(0); // mutant: a Mermaid block passes
});

// covers: chain/FRD-10/EX-1
test("EX-1: a path named only in Tests first that is not tracked fails", () => {
  const r = trackedSpec({ files: "| `scripts/paths.ts` | Change | x |", testsFirst: "test/only-here.test.ts", tracked: ["scripts/paths.ts"], pin: 4 });
  expect(r.code).toBe(1);
  expect(r.out).toContain("test/only-here.test.ts is not a tracked file");
  const ok = trackedSpec({ files: "| `scripts/paths.ts` | Change | x |", testsFirst: "test/only-here.test.ts", tracked: ["scripts/paths.ts", "test/only-here.test.ts"], pin: 4 }); // mutant: tracked, it passes
  expect(ok.code).toBe(0);
});

// covers: chain/FRD-10/EX-1
test("EX-1: a path that is only the start of a tracked file's name fails", () => {
  const r = trackedSpec({ files: "| `test/a` | Change | x |", tracked: ["test/ab.test.ts"], pin: 4 });
  expect(r.code).toBe(1);
  expect(r.out).toContain("test/a is not a tracked file");
});

// covers: chain/FRD-10/EX-2
test("EX-2: a folder written without a trailing slash passes when git tracks a file under it", () => {
  const r = trackedSpec({ files: "| `examples/larder` | Change | x |", tracked: ["examples/larder/docs/PRODUCT.md"], pin: 4 });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("not a tracked file");
  const none = trackedSpec({ files: "| `examples/pantry` | Change | x |", tracked: ["examples/larder/docs/PRODUCT.md"], pin: 4 }); // mutant: a folder with nothing tracked fails
  expect(none.code).toBe(1);
  expect(none.out).toContain("examples/pantry is not a tracked file");
});

// covers: chain/FRD-10/EX-1
test("EX-1: placeholders such as chain/FRD-08/EX-n. and docs/<slice>/specs/ are not read as paths", () => {
  const r = trackedSpec({ files: "| `scripts/paths.ts` | Change | reads docs/<slice>/specs/ and writes tags like chain/FRD-08/EX-n. |", testsFirst: "tags chain/FRD-08/EX-n. in tests", tracked: ["scripts/paths.ts"], pin: 4 });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("not a tracked file");
  expect(r.out).not.toContain("EX-n");
  expect(r.out).not.toContain("<slice>");
});

const quiet = (name: string, r: { code: number | null; out: string }) => {
  expect([name, r.code]).toEqual([name, 0]);
  expect([name, new RegExp("\\b" + name + "\\b").test(r.out)]).toEqual([name, false]);
};

// covers: chain/FRD-10/EX-5
test("EX-5: optional, default, rest and generic parameters do not make a call a mismatch", () => {
  quiet("load", siblings("function load(a, b = 1) {}", "load(x);")); // a default parameter may be left out
  quiet("load", siblings("function load(a, b?: number) {}", "load(x);")); // so may an optional one
  quiet("load", siblings("function load(...xs) {}", "load(a, b, c);")); // a rest parameter takes any count
  quiet("load", siblings("function load(m: Map<string, number>) {}", "load(m);")); // the comma in a type is not a separator
  quiet("load", siblings("function load(a, b = 1) {}", "load(x, y);")); // and the full count still passes
});

// covers: chain/FRD-10/EX-4
test("EX-4: a plain function called with fewer arguments fails, and no arguments count as zero", () => {
  const few = siblings("function f(a, b) {}", "f(x);");
  expect(few.code).toBe(1);
  const line = few.out.split("\n").find((l) => /\bf\b/.test(l)) as string;
  expect(line).toBeDefined();
  expect(line).toMatch(/\b2\b/);
  expect(line).toMatch(/\b1\b/);
  const none = siblings("function f(a) {}", "f();");
  expect(none.code).toBe(1);
  const noneLine = none.out.split("\n").find((l) => /\bf\b/.test(l)) as string;
  expect(noneLine).toMatch(/\b1\b/);
  expect(noneLine).toMatch(/\b0\b/);
  quiet("f", siblings("function f() {}", "f();")); // mutant: zero and zero agree
});

// covers: chain/FRD-10/EX-5
test("EX-5: a comma inside a string is not a separator", () => {
  // one spec run holds both quote styles; one more run holds the mutant side, so the test spawns twice
  quiet("g", siblings("function g(a) {}", "g(\"one, two\");\ng('one, two');"));
  const two = siblings("function g(a, b) {}", 'g("one, two");'); // mutant: the string is one argument, so 2 against 1 still fails
  expect(two.code).toBe(1);
  expect(two.out).toMatch(/\bg\b/);
});

// covers: chain/FRD-10/EX-5
test("EX-5: a spec is not compared with itself", () => {
  quiet("f", siblings("const unrelated = 1;", "function f(a, b) {}\nf(x);"));
});

// covers: chain/FRD-10/EX-4
test("EX-4: under format 3 the mismatch is a warning and the check passes", () => {
  const r = siblings(DECLARES, "const reader = new RecordsReader(x, y);", 3);
  expect(r.code).toBe(0);
  const line = r.out.split("\n").find((l) => l.includes("RecordsReader")) as string;
  expect(line).toContain("WARN (format 4): ");
  expect(line).toContain("SPEC-01-48");
  expect(line).toContain("SPEC-01-35");
});

// covers: chain/FRD-11/EX-1
test("EX-1: a mermaid fence that is not at the start of a line, or is a longer word, is not a Mermaid block", () => {
  const flow = "\n  flowchart LR\n  A --> B\n```\n";
  const inline = tpWith("Text before ```mermaid" + flow, 4);
  expect(inline.code).toBe(1);
  expect(inline.out).toContain("Architecture has no Mermaid block");
  const longer = tpWith("```mermaidx" + flow, 4);
  expect(longer.code).toBe(1);
  expect(longer.out).toContain("Architecture has no Mermaid block");
  const indented = tpWith("  ```mermaid" + flow, 4); // a fence a few spaces in is still a fence
  expect(indented.out).not.toContain("Architecture has no Mermaid block");
});

// covers: chain/FRD-11/EX-3
test("EX-3: a document with no Flows section gets the missing-section failure only, not also no Mermaid block", () => {
  const root = uxTpRoot(4, "None.");
  writeFileSync(join(root, "docs", "inbox", "ux", "UX-01-a.md"), UX_BARE.replace("## Flows\n", ""));
  const r = cliIn(root, "ux", "docs/inbox");
  expect(r.code).toBe(1);
  expect(r.out).toContain("missing section: ## Flows");
  expect(r.out).not.toContain("Mermaid");
  const tp = tpIn({ cites: "FR-INBOX-01-1", files: { [TP_PATH]: TP_BARE.replace("## Architecture\n", ""), ".scriptorium/config.json": '{"format":4}' } });
  expect(tp.code).toBe(1);
  expect(tp.out).toContain("missing section: ## Architecture");
  expect(tp.out).not.toContain("Mermaid");
});

// covers: chain/FRD-11/EX-3
test("EX-3: checkUx called on a folder, and checkTp called on a text, apply the diagram rule", () => {
  const ux = checkUx(slice(FRD, UX_BARE)).fails;
  expect(ux.some((f) => f.includes("Flows has no Mermaid block"))).toBe(true);
  const withBlock = checkUx(slice(FRD, UX_BARE.replace("## Flows\n", "## Flows\n" + MERMAID))).fails;
  expect(withBlock.some((f) => f.includes("Mermaid"))).toBe(false);
  const tp = checkTp(TP_BARE, adrDir(true), FRS);
  expect(tp.some((f) => f.includes("Architecture has no Mermaid block"))).toBe(true);
  expect(checkTp(TP_BARE.replace("## Architecture\n", "## Architecture\n" + MERMAID), adrDir(true), FRS).some((f) => f.includes("Mermaid"))).toBe(false);
});

// covers: chain/FRD-10/EX-2
test("EX-2: a folder written with a trailing slash passes when git tracks a file under it", () => {
  const r = trackedSpec({ files: "| `examples/larder/` | Change | x |", tracked: ["examples/larder/docs/PRODUCT.md"], pin: 4 });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("not a tracked file");
  const none = trackedSpec({ files: "| `examples/pantry/` | Change | x |", tracked: ["examples/larder/docs/PRODUCT.md"], pin: 4 }); // mutant: a folder with nothing tracked under it fails
  expect(none.code).toBe(1);
  expect(none.out).toContain("examples/pantry/ is not a tracked file");
});

// covers: chain/FRD-10/EX-1
test("EX-1: a Files row whose path cell holds a placeholder with < or > is not read as a path", () => {
  const r = trackedSpec({ files: "| `docs/<slice>/specs/` | Change | x |\n| `scripts/paths.ts` | Change | x |", tracked: ["scripts/paths.ts"], pin: 4 });
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("not a tracked file");
  expect(r.out).not.toContain("<slice>");
  const real = trackedSpec({ files: "| `docs/other/specs/` | Change | x |\n| `scripts/paths.ts` | Change | x |", tracked: ["scripts/paths.ts"], pin: 4 }); // mutant: a real untracked folder still fails
  expect(real.code).toBe(1);
  expect(real.out).toContain("docs/other/specs/ is not a tracked file");
});

// The kind of a document, read from its path by one rule (FR-CHAIN-08-15). A project of files under docs/, the config beside it.
function kindProject(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-kind-"));
  for (const [p, t] of Object.entries(files)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  return root;
}
const ADR_OK = "# ADR-0021: x\n\n## Status\nAccepted\n\n## Summary\n\nA summary.\n\n## Context\nc\n## Options considered\no\n## Decision\nd\n## Consequences\nc\n";
const ADR_NO_SUMMARY = ADR_OK.replace("## Summary\n\nA summary.\n\n", "");
const CUT30 = '{"format":4,"legacyAdrsThrough":30}';
const summaryOf = (rel: string, text: string, config?: string) => {
  const root = kindProject({ ["docs/" + rel]: text, ...(config ? { ".scriptorium/config.json": config } : {}) });
  return cliIn(root, "summary", join(root, "docs", rel));
};

// covers: chain/FRD-08/EX-28
test("EX-28: the summary check does not ask an accepted ADR-NNNN-name.md for a Last change line", () => {
  const r = summaryOf("adr/ADR-0021-x.md", ADR_OK);
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("Last change");
  expect(summaryOf("chain/frd/FRD-01-x.md", ADR_OK).code).toBe(1); // mutant: a document that is not an ADR still needs its Last change line
});

// covers: chain/FRD-08/EX-29
test("EX-29: the same ADR saved as ADR-001-x.md and as 0021-x.md passes the summary check too", () => {
  for (const rel of ["adr/ADR-001-x.md", "adr/0021-x.md"]) {
    const r = summaryOf(rel, ADR_OK);
    expect([rel, r.code, r.out.includes("Last change")]).toEqual([rel, 0, false]);
  }
});

// covers: chain/FRD-08/EX-30
test("EX-30: with no cutoff an ADR without a Summary section fails the summary check", () => {
  const r = summaryOf("adr/ADR-0031-x.md", ADR_NO_SUMMARY);
  expect(r.code).toBe(1);
  expect(r.out).toContain("no ## Summary within the first 20 lines");
});

// covers: chain/FRD-08/EX-31
test("EX-31: an ADR at or below the cutoff without a Summary reports nothing, and one above it still fails", () => {
  const r = summaryOf("adr/ADR-0021-x.md", ADR_NO_SUMMARY, CUT30);
  expect(r.code).toBe(0);
  expect(r.out).not.toContain("Summary");
  const above = summaryOf("adr/ADR-0031-x.md", ADR_NO_SUMMARY, CUT30);
  expect(above.code).toBe(1);
  expect(above.out).toContain("no ## Summary within the first 20 lines");
});

// covers: chain/FRD-08/EX-32
test("EX-32: status lists docs/adr/0031-x.md with the kind ADR and the status Accepted", () => {
  const root = kindProject({ "docs/PRODUCT.md": "Status: Approved (2026-11-17)\n", "docs/adr/0031-x.md": ADR_OK });
  const entry = chainStatus(root).docs.find((d) => d.path.replace(/\\/g, "/").endsWith("docs/adr/0031-x.md"));
  expect(entry).toBeDefined();
  expect(entry?.kind).toBe("ADR");
  expect(entry?.status).toBe("Accepted");
});

// covers: chain/FRD-08/EX-34
test("EX-34: an FRD numbered 100 and its spec are listed by status, checked by the hook and traced", () => {
  const frd = "# FRD-100: x\n\nStatus: Approved (2026-11-21)\n\n| Example | Rule |\n|---|---|\n| EX-1 | a |\n";
  const specText = "Status: Draft\nRests on: ../frd/FRD-100-x.md\n";
  const root = kindProject({ ".scriptorium/config.json": '{"format":2}', "docs/PRODUCT.md": "Status: Approved (2026-11-17)\n", "docs/chain/PRD.md": "Status: Approved (2026-11-17)\n", "docs/chain/frd/FRD-100-x.md": frd, "docs/chain/specs/SPEC-100-1-x.md": specText, "test/a.test.ts": "// nothing\n" });
  const docs = chainStatus(root).docs;
  const kindOfPath = (name: string) => docs.find((d) => d.path.replace(/\\/g, "/").endsWith(name))?.kind;
  expect(kindOfPath("frd/FRD-100-x.md")).toBe("FRD");
  expect(kindOfPath("specs/SPEC-100-1-x.md")).toBe("SPEC");
  const first = (rel: string) => checksFor(root, rel).map((x) => x.args?.[0]);
  expect(first("docs/chain/frd/FRD-100-x.md")).toContain("frd");
  expect(first("docs/chain/specs/SPEC-100-1-x.md")).toContain("spec");
  const fails = traceFails(join(root, "docs"), [join(root, "test")]).fails;
  expect(fails.some((f) => f.includes("FRD-100/EX-1"))).toBe(true);
  writeFileSync(join(root, "test", "a.test.ts"), "// " + "cov" + "ers: chain/FRD-100/EX-1\n");
  expect(traceFails(join(root, "docs"), [join(root, "test")]).fails).toEqual([]); // mutant: with its tag it is covered
});

// The paths no chain document has: EX-35 and the near misses of FR-CHAIN-08-15.
const NOT_CHAIN = ["adr/ADR-21-x.md", "adr/ADR-0021.md", "requests/REQ-notes.md", "notes/0021-x.md", "chain/frd/FRD-1-x.md"];

// covers: chain/FRD-08/EX-35
test("EX-35: a file with a near-miss name is no chain document to status, the hook, the lint, trace or the summary check", () => {
  const files: Record<string, string> = { ".scriptorium/config.json": '{"format":2}', "docs/PRODUCT.md": "Status: Approved (2026-11-17)\n", "test/a.test.ts": "// nothing\n" }; // pin 2: an FRD read by trace with an uncovered example is a failure
  for (const p of NOT_CHAIN) files["docs/" + p] = p.includes("FRD-1-x") ? "# FRD-1: x\n\nStatus: Approved (2026-11-21)\n\n| Example | Rule |\n|---|---|\n| EX-1 | a |\n" : "Status: Draft\n";
  const root = kindProject(files);
  const docs = chainStatus(root).docs.map((d) => d.path.replace(/\\/g, "/"));
  for (const p of NOT_CHAIN) {
    expect([p, docs.some((d) => d.endsWith("docs/" + p))]).toEqual([p, false]); // status does not list it
    expect([p, checksFor(root, "docs/" + p)]).toEqual([p, []]); // the hook runs no check on it
    const lint = lintFile(p, "## A\n" + "x\n".repeat(1000), [], []);
    expect([p, lint.some((f) => f.reason.includes("over its cap"))]).toEqual([p, false]); // the lint gives it no kind, so no cap
  }
  const traced = traceFails(join(root, "docs"), [join(root, "test")]);
  expect(traced.fails).toEqual([]); // trace reads no FRD from FRD-1-x.md
  expect(traced.warnings).toEqual([]);
  // mutant: the same file with a two-digit number is an FRD, and its uncovered example is a failure
  const real = kindProject({ ...files, "docs/chain/frd/FRD-01-x.md": files["docs/chain/frd/FRD-1-x.md"] as string });
  expect(traceFails(join(real, "docs"), [join(real, "test")]).fails.some((f) => f.includes("FRD-01/EX-1"))).toBe(true);
});

// covers: chain/FRD-08/EX-36
test("EX-36: the shared rule, status, the edit hook, the docs lint and the summary check give the same kind to every path", async () => {
  const { kindOf } = await import("../scripts/kinds.ts");
  const PATHS: [string, string | undefined][] = [
    ["PRODUCT.md", "PRODUCT"],
    ["DECISIONS.md", "DECISIONS"],
    ["chain/PRD.md", "PRD"],
    ["chain/frd/FRD-01-a.md", "FRD"],
    ["chain/frd/FRD-100-a.md", "FRD"],
    ["chain/ux/UX-01-a.md", "UX"],
    ["chain/ux/UX-100-a.md", "UX"],
    ["tp/TP.md", "TP"],
    ["chain/tp/TP-01-a.md", "TP"],
    ["chain/tp/TP-100-a.md", "TP"],
    ["adr/ADR-001-a.md", "ADR"],
    ["adr/ADR-0021-a.md", "ADR"],
    ["adr/0021-a.md", "ADR"],
    ["adr/021-a.md", "ADR"],
    ["chain/specs/SPEC-01-1-a.md", "SPEC"],
    ["chain/specs/SPEC-100-1-a.md", "SPEC"],
    ["requests/REQ-1-a.md", "REQUEST"],
    ["research/a.md", undefined],
    ["tp/PRD.md", undefined], // a PRD name in a folder that is no slice: the reserved folders hold no slice
    ["adr/PRD.md", undefined],
    ["requests/PRD.md", undefined],
    ...NOT_CHAIN.map((p): [string, undefined] => [p, undefined]),
  ];
  const STATUS_KINDS = ["PRODUCT", "PRD", "FRD", "UX", "TP", "SPEC", "ADR", "REQUEST"];
  const HOOK_CHECK: Record<string, string> = { PRD: "prd", FRD: "frd", UX: "ux", TP: "tp", SPEC: "spec", PRODUCT: "summary", ADR: "summary", REQUEST: "summary" };
  const files: Record<string, string> = {};
  for (const [p] of PATHS) files["docs/" + p] = ADR_OK; // the text of an ADR with no Last change line, so the summary check tells an ADR from the rest by the path alone
  const root = kindProject(files);
  // the summary check on every path at once: one spawn each, in parallel, so the test stays well under its time limit
  const summaries = await Promise.all(
    PATHS.map(async ([p]) => {
      const proc = Bun.spawn([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "summary", join(root, "docs", p)], { stdout: "pipe", stderr: "pipe" });
      return [p, await proc.exited] as const;
    }),
  );
  const summaryCode = new Map(summaries);
  const docs = chainStatus(root).docs.map((d) => ({ path: d.path.replace(/\\/g, "/"), kind: d.kind }));
  const bad: string[] = [];
  for (const [p, kind] of PATHS) {
    if (kindOf(p) !== kind) bad.push(p + ": kindOf gave " + kindOf(p) + ", expected " + kind);
    const listed = docs.find((d) => d.path.endsWith("docs/" + p));
    const statusKind = listed?.kind;
    if (statusKind !== (kind && STATUS_KINDS.includes(kind) ? kind : undefined)) bad.push(p + ": status gave " + statusKind);
    const hook = checksFor(root, "docs/" + p).map((x) => x.args?.[0]);
    const wantHook = kind ? HOOK_CHECK[kind] : undefined;
    if (hook[0] !== wantHook || (wantHook === undefined && hook.length > 0)) bad.push(p + ": the hook ran " + JSON.stringify(hook));
    const lint = lintFile(p, "## A\n" + "x\n".repeat(1000), [], []).find((f) => f.reason.includes("over its cap"));
    const lintKind = lint?.reason.split(" ")[0];
    if (lintKind !== (kind && kind in CAPS ? kind : undefined)) bad.push(p + ": the lint gave " + lintKind);
    // the summary check asks an ADR for no Last change line and every other kind for one
    const isAdr = summaryCode.get(p) === 0;
    if (isAdr !== (kind === "ADR")) bad.push(p + ": the summary check " + (isAdr ? "took" : "did not take") + " it as an ADR");
  }
  expect(bad).toEqual([]);
}, 30000);

// covers: chain/FRD-08/EX-37
test("EX-37: a file under research, retro or decisions is no chain document, whatever its name", async () => {
  const { kindOf } = await import("../scripts/kinds.ts");
  const PATHS = ["research/PRD.md", "research/frd/FRD-01-a.md", "retro/specs/SPEC-01-1-a.md", "decisions/adr/ADR-001-a.md"];
  const files: Record<string, string> = { "docs/PRODUCT.md": "Status: Approved (2026-11-17)\n" };
  for (const p of PATHS) files["docs/" + p] = ADR_OK;
  const root = kindProject(files);
  const listed = chainStatus(root).docs.map((d) => d.path.replace(/\\/g, "/"));
  for (const p of PATHS) {
    expect([p, kindOf(p)]).toEqual([p, undefined]); // the shared rule
    expect([p, listed.some((d) => d.endsWith("docs/" + p))]).toEqual([p, false]); // status
    expect([p, checksFor(root, "docs/" + p)]).toEqual([p, []]); // the edit hook
    const lint = lintFile(p, "## A\n" + "x\n".repeat(1000), [], []);
    expect([p, lint.some((f) => f.reason.includes("over its cap"))]).toEqual([p, false]); // the docs lint gives it no kind, so no cap
  }
  // mutant: the same names outside those folders are chain documents
  for (const p of ["chain/PRD.md", "chain/frd/FRD-01-a.md", "chain/specs/SPEC-01-1-a.md", "adr/ADR-001-a.md"]) expect([p, kindOf(p) !== undefined]).toEqual([p, true]);
});
