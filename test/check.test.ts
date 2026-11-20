import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { docStatus, checkPrd, checkFrds, checkUx, checkTp, checkAdr, checkSpec, checkSummary, chainStatus } from "../scripts/check.ts";

const SUM = "## Summary\n\ns\n\nLast change: 2026-11-20, written\n";

const PRODUCT = "# P\n## 4. Principles\n1. One.\n2. Two.\n## 5. Use cases\n| UC-1 | a |\n| UC-2 | b |\n";

const PRD = "# Inbox PRD\n\nStatus: Draft\n\n" + SUM + "\nSee [product](../PRODUCT.md).\n" +
  "## Why\nREQ-1\n## Use cases\nUC-1\n## Requirements\nR-INBOX-1 a. R-INBOX-2 b. R-INBOX-3 c.\n" +
  "## Principles honored\nprinciple 2 holds.\n## Non-goals\n## Dependencies\n## Success criteria\n## Open questions\n";

const QC = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "| QC-" + i + " | c | " + (i === 1 ? "p95 under 200 ms, measured by the e2e run" : "n/a: no such concern") + " |").join("\n");
const FRD = "# FRD-01: a\n\nStatus: Draft\n\n" + SUM + "\n[PRD](../PRD.md)\n" +
  "## Why\nREQ-1\n## Requirements covered\nR-INBOX-1, R-INBOX-2, R-INBOX-3\n" +
  "## Behavior\n| ID | Pattern | Requirement |\n|---|---|---|\n" +
  "| FR-INBOX-01-1 | WHEN | WHEN a, the system shall b. |\n| FR-INBOX-01-2 | always | The system shall always c. |\n" +
  "## Rules and examples\n| Rule | Text | Covers |\n|---|---|---|\n| RULE-1 | r | FR-INBOX-01-1 |\n\n" +
  "| Example | Rule | Kind | Given | When | Then |\n|---|---|---|---|---|---|\n" +
  "| EX-1 | RULE-1 | positive | g | w | t |\n| EX-2 | RULE-1 | boundary | g | w | t |\n" +
  "## Decision table\nDT-1 a b c\n## States\nn/a: no lifecycle\n## Invariants\nINV-1 holds\n" +
  "## Quality criteria\n| ID | Characteristic | Criterion |\n|---|---|---|\n" + QC + "\n" +
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
  expect(fr(FRD.replace("DT-1 a b c", 'n/a: <reason>'))).toContain('FRD-01-a.md: Decision table holds no DT-n row and no "n/a: <reason>"');
  expect(fr(FRD.replace("n/a: no lifecycle", "n/a: <reason>"))).toContain('FRD-01-a.md: States holds no ST-n row and no "n/a: <reason>"');
  expect(fr(FRD.replace("INV-1 holds", "n/a: because x"))).toEqual([]);
  expect(fr(FRD.replace("INV-1 holds", "later"))).toContain('FRD-01-a.md: Invariants holds no INV-n row and no "n/a: <reason>"');
  expect(fr(FRD.replace("| QC-5 | c | n/a: no such concern |", "| QC-5 | c | n/a: because x |"))).toEqual([]);
  expect(fr(FRD.replace("| QC-5 | c | n/a: no such concern |", "| QC-5 | c | n/a: <reason> |"))[0]).toContain("QC-5 says n/a without");
});

test("PRD, FRD, UX and TP need a valid Status line; spec needs a Last change line in its Summary", () => {
  const NS = "no Status line (Status: Draft or Status: Approved (YYYY-MM-DD))";
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

const TP = "# TP\n\nStatus: Draft\n\n" + SUM + "\n## Context\nFR-INBOX-01-1\n## Decisions\n### TD-1: storage\n- **Option A** files.\n- **Option B** a database.\n\nChosen: B, because x. ADR: ADR-001\n" +
  "## Architecture\n## Information\n## Interfaces and contracts\n## Threat model\n## Testing\n## Risks\n## Open questions\n";
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

const SPEC = "# Spec\n\nStatus: Draft\n\n" + SUM + "\n## Context\nc\n## Files\nf\n## Interfaces\ni\n## Data\nNone\n## Tasks\n### Task 1: a\n" +
  "- **Tests first:** EX-1, EX-2, DT-1, INV-1\n- **Build:** b\n- **Done when:** bun test\n## Out of scope\nn\n";
// The FRD above defines EX-1, EX-2, DT-1 and INV-1; its States section is n/a.

test("spec: tests-first tasks cover every id the FRD defines and decide nothing", () => {
  expect(checkSpec(SPEC, FRD)).toEqual([]);
  expect(checkSpec(SPEC.replace("EX-2, ", ""), FRD)).toContain("EX-2 has no task whose Tests first line cites it");
  expect(checkSpec(SPEC.replace("DT-1, ", ""), FRD)).toContain("DT-1 has no task whose Tests first line cites it");
  expect(checkSpec(SPEC.replace(", INV-1", "").replace("- **Build:**", "- **Build:** INV-1"), FRD)).toContain("INV-1 has no task whose Tests first line cites it");
  expect(checkSpec(SPEC.replace("## Out of scope", "### TD-1: x\n## Out of scope"), FRD).some((f) => f.includes("makes a decision"))).toBe(true);
});

test("spec: ST ids of the FRD must be tested too", () => {
  const frd = FRD.replace("n/a: no lifecycle", "ST-1 open to closed");
  expect(checkSpec(SPEC, frd)).toContain("ST-1 has no task whose Tests first line cites it");
  expect(checkSpec(SPEC.replace("INV-1", "INV-1, ST-1"), frd)).toEqual([]);
});

test("spec: needs Status, sections, Done when and no TBD", () => {
  expect(checkSpec(SPEC.replace("Status: Draft", "Status: Done"), FRD)).toContain("no Status line (Status: Draft or Status: Approved (YYYY-MM-DD))");
  expect(checkSpec(SPEC.replace("## Data", "## Other"), FRD)).toContain("missing section: ## Data");
  expect(checkSpec(SPEC.replace("- **Done when:** bun test\n", ""), FRD)).toContain('Task 1: no "Done when:" line');
  expect(checkSpec(SPEC.replace("- **Tests first:**", "- **Tests:**"), FRD)).toContain('Task 1: no "Tests first:" line');
  expect(checkSpec(SPEC.replace("None", "TBD"), FRD)).toContain("contains TBD or TODO");
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
    "docs/inbox/specs/SPEC-01-a.md": ok,
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
  const run = (cross: string, adr: string) => chainStatus(project(ok, ok, {
    "docs/tp/TP.md": cross,
    "docs/inbox/tp/TP-01-a.md": ok + "### TD-1: x\nADR: ADR-001\n",
    "docs/adr/ADR-001-x.md": "## Status\n" + adr + "\n",
  })).fails;
  expect(run(ok, "Accepted")).toEqual([]);
  expect(run("Status: Draft\n", "Accepted").some((f) => f.includes("TP-01-a.md: approved, but") && /[\\/]tp[\\/]TP\.md is still Draft/.test(f))).toBe(true);
  expect(run(ok, "Proposed").some((f) => f.includes("TP-01-a.md: approved, but ADR-001 is still Proposed"))).toBe(true);
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
