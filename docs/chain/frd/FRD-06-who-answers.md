# FRD-06: Who answers an open question

Status: Approved (2026-11-21)
Approval: content JFJj2H12kMt8; rests on ../PRD.md ZXf8DR0qTJHf

## Summary

Each Q-n line in an Open questions section names who answers it: `(Owner: <reason>)`, `(Research)` or `(Lead)`. The check fails a question with no answerer and an owner question with no reason. The skills research and decide before asking, and ask the owner only the owner's questions, in one message, each with a recommendation. A question asked of the owner that research could answer is rework cause C-14. A format 3 rule.

Last change: 2026-11-20, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
REQ-10 ([request](../../requests/REQ-10-who-answers.md)). On 2026-11-20 an owner was asked a domain fact with published sources before an approval.

## Requirements covered
R-CHAIN-36.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-06-1 | IF | IF a Q-n line in an Open questions section names no answerer THEN the document check shall fail and show the three forms. |
| FR-CHAIN-06-2 | IF | IF a Q-n line names the owner without a reason THEN the document check shall fail. |
| FR-CHAIN-06-3 | WHEN | WHEN a document has Research or Lead questions, the team shall answer them, as a D-n with its source or an L-n, before the owner is asked to approve. |
| FR-CHAIN-06-4 | WHEN | WHEN the owner is asked, the message shall hold only the Owner questions, all of them, each with a recommendation. |
| FR-CHAIN-06-5 | IF | IF the project's pin is below format 3 THEN the document check shall only warn. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | Every open question says who answers it. | FR-CHAIN-06-1, FR-CHAIN-06-2 |
| RULE-2 | The team answers what it can before asking the owner. | FR-CHAIN-06-3, FR-CHAIN-06-4 |
| RULE-3 | The rule belongs to format 3. | FR-CHAIN-06-5 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | A draft FRD has "- Q-1 (Research): where the 42-day limit comes from" | the document check runs | it passes |
| EX-2 | RULE-1 | negative | A draft FRD has "- Q-1: where the limit comes from" | the document check runs | it fails with "Q-1: say who answers it: (Owner: <reason>), (Research) or (Lead)" |
| EX-3 | RULE-1 | positive | A draft PRD has "- Q-2 (Owner: a product goal): the adoption target" | the document check runs | it passes |
| EX-4 | RULE-1 | negative | A draft PRD has "- Q-2 (Owner): the adoption target" | the document check runs | it fails with "Q-2: say why only the owner can answer it" |
| EX-5 | RULE-1 | positive | A draft spec has "- Q-3 (Lead): which file holds the map" | the document check runs | it passes |
| EX-6 | RULE-1 | boundary | A document's Open questions section says "None." | the document check runs | it passes |
| EX-7 | RULE-2 | negative | An FRD holds a Research question and the owner is asked to approve it | review of the session runs | the rework queue gets a finding with cause C-14 |
| EX-8 | RULE-2 | positive | An FRD holds two Owner questions and no others | the owner is asked | one message holds both, each with a recommendation |
| EX-9 | RULE-3 | positive | A format 2 project and the FRD of EX-2 | the document check runs | it passes and prints "WARN (format 3):" with the EX-2 line |
| EX-10 | RULE-3 | negative | The same FRD in a format 3 project | the document check runs | it fails with the EX-2 line |

### Coverage waivers
uncovered: EX-8 a step of the skills, checked by review, not by a test.

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: the check keeps no state.

## Invariants
n/a: the repository keeps no invariants register yet; RULE-1 to RULE-3 are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples but the waived EX-8 pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | n/a: the check reads one section per document. |
| QC-3 | Compatibility | The examples pass on both CI systems. |
| QC-4 | Interaction capability | Every failure names the question and shows what to write, asserted in EX-2 and EX-4. |
| QC-5 | Reliability | n/a: a wrong result only fails a document check. |
| QC-6 | Security | n/a: the check reads documents inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: the three answerers are fixed. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the Open questions section of each chain document, the pin. Keeps nothing.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given A draft FRD has "- Q-1 (Research): where the 42-day limit comes from", when the document check runs, then it passes.
- **AC-2** (EX-2): Given A draft FRD has "- Q-1: where the limit comes from", when the document check runs, then it fails with "Q-1: say who answers it: (Owner: <reason>), (Research) or (Lead)".
- **AC-3** (EX-3): Given A draft PRD has "- Q-2 (Owner: a product goal): the adoption target", when the document check runs, then it passes.
- **AC-4** (EX-4): Given A draft PRD has "- Q-2 (Owner): the adoption target", when the document check runs, then it fails with "Q-2: say why only the owner can answer it".
- **AC-5** (EX-5): Given A draft spec has "- Q-3 (Lead): which file holds the map", when the document check runs, then it passes.
- **AC-6** (EX-6): Given A document's Open questions section says "None.", when the document check runs, then it passes.
- **AC-7** (EX-7): Given An FRD holds a Research question and the owner is asked to approve it, when review of the session runs, then the rework queue gets a finding with cause C-14.
- **AC-8** (EX-8): Given An FRD holds two Owner questions and no others, when the owner is asked, then one message holds both, each with a recommendation.
- **AC-9** (EX-9): Given A format 2 project and the FRD of EX-2, when the document check runs, then it passes and prints "WARN (format 3):" with the EX-2 line.
- **AC-10** (EX-10): Given The same FRD in a format 3 project, when the document check runs, then it fails with the EX-2 line.
