# FRD-03: The rework skill plans the heaviest cause

Status: Approved (2026-11-21)
Approval: content Giy4Vq0uPy1r; rests on ../PRD.md AS4Wm8Y4l9CR

## Summary

The /scriptorium:rework skill takes the cause with the most open findings, reads its findings and their history, and writes one request for the owner with the evidence, the step that let them through, a proposed prevention with its replay, and how the owner will see it worked. It edits nothing else.

Last change: 2026-11-21, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
REQ-6 asked for an improvement plan; D-33 makes it a skill that writes a request, and REQ-12 removes the retro it replaces.

## Requirements covered
R-METRICS-9.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-METRICS-03-1 | WHEN | WHEN the skill runs, it shall pick the cause with the most open findings, and on a tie the cause of the earliest step of the chain. |
| FR-METRICS-03-2 | WHEN | WHEN it has a cause, it shall write one request with sections for the evidence (finding ids, counts, the weekly trend), the step, a proposed prevention with its replay, and how the owner will see it worked. |
| FR-METRICS-03-3 | IF | IF the cause already has a prevention that did not hold THEN the request shall be about why the prevention failed, naming it. |
| FR-METRICS-03-4 | IF | IF the queue has no open finding THEN the skill shall say there is nothing to plan and write nothing. |
| FR-METRICS-03-5 | always | The skill shall write only the request: it never edits checks, templates, the queue or the cause list. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | The heaviest cause first. | FR-METRICS-03-1, FR-METRICS-03-4 |
| RULE-2 | The plan is a request the owner accepts. | FR-METRICS-03-2, FR-METRICS-03-3, FR-METRICS-03-5 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | C-1 has 24 open findings and C-2 has 6 | the skill runs | it plans C-1 |
| EX-2 | RULE-1 | boundary | C-2 (Spec) and C-5 (FRD) have 3 open findings each | the skill runs | it plans C-5, because FRD comes before Spec in the chain |
| EX-3 | RULE-1 | negative | The queue has no open finding | the skill runs | it says there is nothing to plan and writes no request |
| EX-4 | RULE-2 | positive | C-1 is the heaviest cause | the skill runs | it writes docs/requests/REQ-n with Evidence, Step, Prevention and replay, and How we will see it worked |
| EX-5 | RULE-2 | negative | C-1 has prevention CHECK-3 and a finding dated after it | the skill runs | the request is about why CHECK-3 did not hold |
| EX-6 | RULE-2 | negative | The skill has run | the diff is read | only the new request file changed |

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: nothing here keeps state.

## Invariants
n/a: the repository keeps no invariants register yet; the rules are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | n/a: the skill reads the queue and its history once. |
| QC-3 | Compatibility | n/a: the skill is text the agent follows. |
| QC-4 | Interaction capability | The request names the cause, the counts and the prevention in its summary, asserted in EX-4. |
| QC-5 | Reliability | n/a: a wrong result only fails a check or a report. |
| QC-6 | Security | n/a: it reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: nothing here is configured. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the queue, its history (FRD-02) and the project research notes. Writes: one request.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given C-1 has 24 open findings and C-2 has 6, when the skill runs, then it plans C-1.
- **AC-2** (EX-2): Given C-2 (Spec) and C-5 (FRD) have 3 open findings each, when the skill runs, then it plans C-5, because FRD comes before Spec in the chain.
- **AC-3** (EX-3): Given The queue has no open finding, when the skill runs, then it says there is nothing to plan and writes no request.
- **AC-4** (EX-4): Given C-1 is the heaviest cause, when the skill runs, then it writes docs/requests/REQ-n with Evidence, Step, Prevention and replay, and How we will see it worked.
- **AC-5** (EX-5): Given C-1 has prevention CHECK-3 and a finding dated after it, when the skill runs, then the request is about why CHECK-3 did not hold.
- **AC-6** (EX-6): Given The skill has run, when the diff is read, then only the new request file changed.
