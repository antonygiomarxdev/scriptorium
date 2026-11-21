# FRD-05: Reuse before writing new

Status: Approved (2026-11-21)
Approval: content WBOgLz46SVBN; rests on ../PRD.md zIdfkERDCIVu

## Summary

Every spec gets a Reuses section: the existing code it builds on, by path and name, and a precedent spec, or "Nothing to reuse:" with a reason. The spec check fails a path or name that does not exist, a missing section, and a bare "nothing". Review fails new code that repeats existing code, as cause C-13 of the rework queue. It is a format 3 rule: a format 2 project only sees a warning.

Last change: 2026-11-20, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
REQ-7 ([request](../../requests/REQ-7-reuse-before-new.md)). On 2026-11-20 a builder copied a rule into a second file because the spec named only one; both copies remain.

## Requirements covered
R-CHAIN-35.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-05-1 | IF | IF a spec has no Reuses section THEN the spec check shall fail and say how to write one. |
| FR-CHAIN-05-2 | IF | IF a Reuses entry names a file that does not exist, or a name that file does not hold, THEN the spec check shall fail and name the entry. |
| FR-CHAIN-05-3 | IF | IF the Reuses section says there is nothing to reuse without a reason THEN the spec check shall fail. |
| FR-CHAIN-05-4 | IF | IF a Reuses precedent names a spec that does not exist THEN the spec check shall fail and name it. |
| FR-CHAIN-05-5 | WHEN | WHEN review finds new code that repeats existing code, the reviewer shall fail the change and log the finding with cause C-13. |
| FR-CHAIN-05-6 | IF | IF the project's pin is below format 3 THEN the spec check shall only warn. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | A spec says what it builds on before what it adds. | FR-CHAIN-05-1, FR-CHAIN-05-3 |
| RULE-2 | What it names must exist. | FR-CHAIN-05-2, FR-CHAIN-05-4 |
| RULE-3 | Repeating existing code fails review. | FR-CHAIN-05-5 |
| RULE-4 | The rule belongs to format 3. | FR-CHAIN-05-6 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-2 | positive | A spec's Reuses section has "`scripts/paths.ts` `typed`" and that file defines typed | the spec check runs | it passes |
| EX-2 | RULE-1 | negative | A spec has no Reuses section | the spec check runs | it fails with "no Reuses section: name the code and the precedent spec it builds on, or Nothing to reuse: <reason>" |
| EX-3 | RULE-2 | negative | A spec's Reuses section has "`scripts/nope.ts` `run`" and that file does not exist | the spec check runs | it fails with "Reuses: scripts/nope.ts does not exist" |
| EX-4 | RULE-2 | negative | A spec's Reuses section has "`scripts/paths.ts` `nothere`" | the spec check runs | it fails with "Reuses: nothere is not in scripts/paths.ts" |
| EX-5 | RULE-1 | positive | A spec's Reuses section says "Nothing to reuse: the first script that reads the host's notebook format" | the spec check runs | it passes |
| EX-6 | RULE-1 | negative | A spec's Reuses section says "Nothing to reuse." | the spec check runs | it fails with "Reuses: say why there is nothing to reuse" |
| EX-7 | RULE-2 | negative | A spec's Reuses section has "Precedent: SPEC-09-1-gone.md" and no such spec exists | the spec check runs | it fails with "Reuses: precedent SPEC-09-1-gone.md does not exist" |
| EX-8 | RULE-2 | boundary | A Reuses entry names a file in the test folder | the spec check runs | it passes: tests are code a spec can build on |
| EX-9 | RULE-3 | negative | A change adds a function whose body repeats one already in another file | review runs | it fails citing FR-CHAIN-05-5, and the rework queue gets a finding with cause C-13 |
| EX-10 | RULE-4 | positive | A format 2 project and a spec with no Reuses section | the spec check runs | it passes and prints "WARN (format 3):" with the EX-2 line |
| EX-11 | RULE-4 | negative | The same spec in a format 3 project | the spec check runs | it fails with the EX-2 line |
| EX-12 | RULE-3 | positive | A change calls the helper its Reuses section names instead of writing a new one | review runs | no finding of cause C-13 |

### Coverage waivers
uncovered: EX-12 a review step, checked by the review skill and the rework queue, not by a test.

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: the check keeps no state.

## Invariants
n/a: the repository keeps no invariants register yet; RULE-1 to RULE-4 are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples but the waived EX-12 pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | n/a: the check reads a few files per spec. |
| QC-3 | Compatibility | The examples pass on both CI systems, with paths written with either slash. |
| QC-4 | Interaction capability | Every failure names the entry and says what to write, asserted in EX-2, EX-3 and EX-6. |
| QC-5 | Reliability | n/a: a wrong result only fails a spec check. |
| QC-6 | Security | n/a: the check reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: the section is fixed. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the spec's Reuses section, the files and names it lists, the specs folder, the pin. Keeps nothing.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given A spec's Reuses section has "`scripts/paths.ts` `typed`" and that file defines typed, when the spec check runs, then it passes.
- **AC-2** (EX-2): Given A spec has no Reuses section, when the spec check runs, then it fails with "no Reuses section: name the code and the precedent spec it builds on, or Nothing to reuse: <reason>".
- **AC-3** (EX-3): Given A spec's Reuses section has "`scripts/nope.ts` `run`" and that file does not exist, when the spec check runs, then it fails with "Reuses: scripts/nope.ts does not exist".
- **AC-4** (EX-4): Given A spec's Reuses section has "`scripts/paths.ts` `nothere`", when the spec check runs, then it fails with "Reuses: nothere is not in scripts/paths.ts".
- **AC-5** (EX-5): Given A spec's Reuses section says "Nothing to reuse: the first script that reads the host's notebook format", when the spec check runs, then it passes.
- **AC-6** (EX-6): Given A spec's Reuses section says "Nothing to reuse.", when the spec check runs, then it fails with "Reuses: say why there is nothing to reuse".
- **AC-7** (EX-7): Given A spec's Reuses section has "Precedent: SPEC-09-1-gone.md" and no such spec exists, when the spec check runs, then it fails with "Reuses: precedent SPEC-09-1-gone.md does not exist".
- **AC-8** (EX-8): Given A Reuses entry names a file in the test folder, when the spec check runs, then it passes: tests are code a spec can build on.
- **AC-9** (EX-9): Given A change adds a function whose body repeats one already in another file, when review runs, then it fails citing FR-CHAIN-05-5, and the rework queue gets a finding with cause C-13.
- **AC-10** (EX-10): Given A format 2 project and a spec with no Reuses section, when the spec check runs, then it passes and prints "WARN (format 3):" with the EX-2 line.
- **AC-11** (EX-11): Given The same spec in a format 3 project, when the spec check runs, then it fails with the EX-2 line.
- **AC-12** (EX-12): Given A change calls the helper its Reuses section names instead of writing a new one, when review runs, then no finding of cause C-13.
