# FRD-09: Adoption with history is tested

Status: Approved (2026-11-21)
Approval: content ZUz9wr_iEtpE; rests on ../PRD.md CCI95Z47mmmD

## Summary

A fixture of a project that adopted the chain with its history sits in the tests, and status, the docs lint and the TP check must pass on it, run from another folder. The adopt skill keeps a verbatim export of another tool in archive/<tool>/ at the repo root and links to it from the document that absorbed it.

Last change: 2026-11-21, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
REQ-13: another adopting project found seven gaps in two days that no test caught; each came from history a new project does not have.

## Requirements covered
R-CHAIN-37, R-CHAIN-6, R-CHAIN-9.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-09-1 | always | The test suite shall run status, the docs lint and the TP check on the adopted-project fixture from a folder outside it, and fail on any failure. |
| FR-CHAIN-09-2 | always | The adopted-project fixture shall hold an ADR named NNNN-name.md below its legacy cutoff, an approved document padded by a formatter, a TP resting on an accepted request with Decision ids, and an archive outside docs/ linked from a Source line. |
| FR-CHAIN-09-3 | WHEN | WHEN the adopt skill keeps a verbatim export of another tool, it shall put it in archive/<tool>/ at the repo root and link to it from the document that absorbed it on a "Source:" line. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | What an adopter brings is a test case. | FR-CHAIN-09-1, FR-CHAIN-09-2 |
| RULE-2 | A verbatim export lives outside docs/, linked from the chain. | FR-CHAIN-09-3 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | The adopted-project fixture as committed | status, the docs lint and the TP check run on it from the repository root | each exits 0 |
| EX-2 | RULE-1 | negative | A copy of the fixture without legacyAdrsThrough in its config | the TP check runs on it | it fails on the legacy ADR with "missing section" |
| EX-3 | RULE-1 | negative | A copy of the fixture whose approved document gets one word changed | status runs on it | it fails with "body changed since approval" |
| EX-4 | RULE-2 | positive | The fixture holds archive/linear/plan.md with a banned phrase, and its FRD links to it on a Source line | the docs lint runs | it reports nothing for the archive and the link resolves |
| EX-5 | RULE-2 | negative | A copy of the fixture whose Source line links to archive/linear/missing.md | the docs lint runs | it fails with "link does not resolve" |
| EX-6 | RULE-2 | positive | The adopt skill text | it is read | it says a verbatim export goes to archive/<tool>/ at the repo root, outside docs/, linked on a Source line |

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: the fixture is static.

## Invariants
n/a: the repository keeps no invariants register yet; the rules are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | The fixture test runs in under 10 seconds. |
| QC-3 | Compatibility | The fixture passes on both CI systems. |
| QC-4 | Interaction capability | A failing fixture test prints the check output, asserted in EX-2, EX-3 and EX-5. |
| QC-5 | Reliability | n/a: a wrong result only fails a check or a report. |
| QC-6 | Security | n/a: it reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: nothing here is configured. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the fixture under test/fixtures/adopted and the adopt skill. Keeps nothing.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given The adopted-project fixture as committed, when status, the docs lint and the TP check run on it from the repository root, then each exits 0.
- **AC-2** (EX-2): Given A copy of the fixture without legacyAdrsThrough in its config, when the TP check runs on it, then it fails on the legacy ADR with "missing section".
- **AC-3** (EX-3): Given A copy of the fixture whose approved document gets one word changed, when status runs on it, then it fails with "body changed since approval".
- **AC-4** (EX-4): Given The fixture holds archive/linear/plan.md with a banned phrase, and its FRD links to it on a Source line, when the docs lint runs, then it reports nothing for the archive and the link resolves.
- **AC-5** (EX-5): Given A copy of the fixture whose Source line links to archive/linear/missing.md, when the docs lint runs, then it fails with "link does not resolve".
- **AC-6** (EX-6): Given The adopt skill text, when it is read, then it says a verbatim export goes to archive/<tool>/ at the repo root, outside docs/, linked on a Source line.
