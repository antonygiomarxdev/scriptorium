# FRD-07: A TP that rests on a request or a registry

Status: Approved (2026-11-21)
Approval: content iWE6ErQcSy7r; rests on ../PRD.md zIdfkERDCIVu

## Summary

A TP whose "Rests on:" line names an accepted request or a registry is checked against that parent: it must cite the ids of the request's Decision rows, or of the registry rows, instead of FR ids, and approval rests on that parent instead of an FRD of the same number. An ADR cited with four or more digits is read whole.

Last change: 2026-11-21, status does not require the cross-cutting TP for a TP on a request or registry; a missing parent fails; approve on a request says how requests are accepted; four missing examples from review

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
Issue #2: a TP for CI resting on an accepted request failed with "cites no FR id", and its approval could not be recorded because approval looked for an FRD that does not exist. Issue #3: a cited ADR with a four-digit id was cut to three digits and reported missing.

## Requirements covered
R-CHAIN-27, R-CHAIN-5.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-07-1 | WHEN | WHEN a TP's Rests on line names a request, the TP check shall require at least one id of that request's Decision rows and no FR id. |
| FR-CHAIN-07-2 | IF | IF such a TP cites an id that the request's Decision does not define THEN the TP check shall fail and name it. |
| FR-CHAIN-07-3 | IF | IF the request's Decision defines no ids THEN the TP check shall fail and say how to add them. |
| FR-CHAIN-07-4 | WHEN | WHEN a TP's Rests on line names a registry, the TP check shall require ids of that registry's rows. |
| FR-CHAIN-07-5 | WHEN | WHEN a TP has a Rests on line, approval and status shall rest it on that document, not on an FRD of the same number. |
| FR-CHAIN-07-6 | WHEN | WHEN a TP cites an ADR, the check shall read every digit of its id and find its file. |
| FR-CHAIN-07-7 | WHEN | WHEN a TP rests on a request or a registry, status shall not require the cross-cutting TP. |
| FR-CHAIN-07-8 | IF | IF a TP's Rests on file does not exist THEN the TP check shall fail and name the path. |
| FR-CHAIN-07-9 | WHEN | WHEN approve runs on a request, it shall fail and say that the owner accepts a request on its Status line. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | A TP cites the ids of what it rests on. | FR-CHAIN-07-1, FR-CHAIN-07-2, FR-CHAIN-07-3, FR-CHAIN-07-4, FR-CHAIN-07-8 |
| RULE-2 | Approval rests a TP on its Rests on document, and on nothing it does not name. | FR-CHAIN-07-5, FR-CHAIN-07-7, FR-CHAIN-07-9 |
| RULE-3 | An ADR id is read whole. | FR-CHAIN-07-6 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | A TP rests on an accepted REQ-6 whose Decision has "- CI-1: ..." and the TP cites CI-1 | the TP check runs | it passes with no "cites no FR id" line |
| EX-2 | RULE-1 | negative | The same TP cites no id of REQ-6 | the TP check runs | it fails with "cites no id of REQ-6's Decision" |
| EX-3 | RULE-1 | negative | The TP cites CI-9 and REQ-6's Decision defines CI-1 and CI-2 | the TP check runs | it fails with "cites CI-9, not in REQ-6's Decision" |
| EX-4 | RULE-1 | negative | REQ-6's Decision is prose with no ids | the TP check runs | it fails with "REQ-6: give each decision an id (CI-1, CI-2) so the TP can cite it" |
| EX-5 | RULE-1 | positive | A TP rests on docs/CHECKS.md and cites CHECK-2, a row of it | the TP check runs | it passes |
| EX-6 | RULE-1 | boundary | A TP with no Rests on line cites FR-CHAIN-01-1 | the TP check runs | it is checked against FR ids as today and passes |
| EX-7 | RULE-2 | positive | An accepted REQ-6 and a TP resting on it | approve runs on the TP | it records REQ-6 as the parent and passes |
| EX-8 | RULE-2 | negative | A TP rests on REQ-6, which is still Open | approve runs on the TP | it fails because REQ-6 is not accepted |
| EX-9 | RULE-3 | positive | A TP says "ADR: ADR-0029" and docs/adr/ADR-0029-ci.md exists | the TP check runs | it passes |
| EX-10 | RULE-3 | negative | A TP says "ADR: ADR-0029" and no ADR-0029 file exists | the TP check runs | it fails with "ADR-0029 has no file", the id whole |
| EX-11 | RULE-1 | negative | REQ-6 has "- CI-3: ..." under Context, outside its Decision, and the TP cites CI-3 | the TP check runs | it fails with "cites CI-3, not in REQ-6's Decision" |
| EX-12 | RULE-3 | negative | A TP says "ADR: ADR-0029" and only docs/adr/ADR-00290-x.md exists | the TP check runs | it fails with "ADR-0029 has no file" |
| EX-13 | RULE-1 | negative | A TP says "Rests on: ../../requests/REQ-9-x.md" and that file does not exist | the TP check runs | it fails with "rests on ../../requests/REQ-9-x.md, which does not exist" |
| EX-14 | RULE-1 | negative | A TP with no Rests on line cites no FR id | the TP check runs | it fails with "cites no FR id", as today |
| EX-15 | RULE-2 | positive | An approved TP rests on an accepted REQ-6 and the project has no docs/tp/TP.md | status runs | it reports no failure for that TP |
| EX-16 | RULE-2 | boundary | An approved TP with no Rests on line and the project has no docs/tp/TP.md | status runs | it fails because the cross-cutting TP does not exist, as today |
| EX-17 | RULE-2 | negative | An accepted REQ-6 | approve runs on REQ-6 | it fails with "the owner accepts a request on its Status line; approve is for chain documents" and changes nothing |

## Decision table
n/a: each rule is one condition per parent kind; the examples cover them.

## States
n/a: the check keeps no state.

## Invariants
n/a: the repository keeps no invariants register yet; RULE-1 to RULE-3 are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | n/a: the check reads one parent per TP. |
| QC-3 | Compatibility | The examples pass on both CI systems, with either slash in the Rests on line. |
| QC-4 | Interaction capability | Every failure names the id or the parent and says what to write, asserted in EX-2, EX-3 and EX-4. |
| QC-5 | Reliability | n/a: a wrong result only fails a document check. |
| QC-6 | Security | n/a: the check reads documents inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: the parent kinds are fixed. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the TP, the document its Rests on line names, the ADR folder. Keeps nothing.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given A TP rests on an accepted REQ-6 whose Decision has "- CI-1: ..." and the TP cites CI-1, when the TP check runs, then it passes with no "cites no FR id" line.
- **AC-2** (EX-2): Given The same TP cites no id of REQ-6, when the TP check runs, then it fails with "cites no id of REQ-6's Decision".
- **AC-3** (EX-3): Given The TP cites CI-9 and REQ-6's Decision defines CI-1 and CI-2, when the TP check runs, then it fails with "cites CI-9, not in REQ-6's Decision".
- **AC-4** (EX-4): Given REQ-6's Decision is prose with no ids, when the TP check runs, then it fails with "REQ-6: give each decision an id (CI-1, CI-2) so the TP can cite it".
- **AC-5** (EX-5): Given A TP rests on docs/CHECKS.md and cites CHECK-2, a row of it, when the TP check runs, then it passes.
- **AC-6** (EX-6): Given A TP with no Rests on line cites FR-CHAIN-01-1, when the TP check runs, then it is checked against FR ids as today and passes.
- **AC-7** (EX-7): Given An accepted REQ-6 and a TP resting on it, when approve runs on the TP, then it records REQ-6 as the parent and passes.
- **AC-8** (EX-8): Given A TP rests on REQ-6, which is still Open, when approve runs on the TP, then it fails because REQ-6 is not accepted.
- **AC-9** (EX-9): Given A TP says "ADR: ADR-0029" and docs/adr/ADR-0029-ci.md exists, when the TP check runs, then it passes.
- **AC-10** (EX-10): Given A TP says "ADR: ADR-0029" and no ADR-0029 file exists, when the TP check runs, then it fails with "ADR-0029 has no file", the id whole.
- **AC-11** (EX-11): Given REQ-6 has "- CI-3: ..." under Context, outside its Decision, and the TP cites CI-3, when the TP check runs, then it fails with "cites CI-3, not in REQ-6's Decision".
- **AC-12** (EX-12): Given A TP says "ADR: ADR-0029" and only docs/adr/ADR-00290-x.md exists, when the TP check runs, then it fails with "ADR-0029 has no file".
- **AC-13** (EX-13): Given A TP says "Rests on: ../../requests/REQ-9-x.md" and that file does not exist, when the TP check runs, then it fails with "rests on ../../requests/REQ-9-x.md, which does not exist".
- **AC-14** (EX-14): Given A TP with no Rests on line cites no FR id, when the TP check runs, then it fails with "cites no FR id", as today.
- **AC-15** (EX-15): Given An approved TP rests on an accepted REQ-6 and the project has no docs/tp/TP.md, when status runs, then it reports no failure for that TP.
- **AC-16** (EX-16): Given An approved TP with no Rests on line and the project has no docs/tp/TP.md, when status runs, then it fails because the cross-cutting TP does not exist, as today.
- **AC-17** (EX-17): Given An accepted REQ-6, when approve runs on REQ-6, then it fails with "the owner accepts a request on its Status line; approve is for chain documents" and changes nothing.
