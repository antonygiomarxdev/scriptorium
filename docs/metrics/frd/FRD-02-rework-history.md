# FRD-02: Rework history

Status: Approved (2026-11-21)
Approval: content Vt8WN98uvCSd; rests on ../PRD.md JwxEpZqGsLDf

## Summary

One command rebuilds every finding the rework queue ever held from the git history of the queue file, with the date each opened and closed, and prints the findings opened, closed and open at the end of each week, then per change and per cause.

Last change: 2026-11-21, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
REQ-6 and REQ-12: the queue holds only open findings, so whether rework goes up or down is invisible without its history (D-33).

## Requirements covered
R-METRICS-8.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-METRICS-02-1 | WHEN | WHEN the history command runs, it shall rebuild each finding from the commits that changed the queue file: the commit that added its row opens it and the commit that removed its row closes it. |
| FR-METRICS-02-2 | WHEN | WHEN it prints, it shall show per week (Monday to Sunday) the findings opened, closed and open at the end of the week, then the totals per change and per cause. |
| FR-METRICS-02-3 | IF | IF a finding row only changes its text THEN the history shall keep one finding, opened at the first commit. |
| FR-METRICS-02-4 | IF | IF the project has no queue file or its history holds no finding THEN the command shall say so and exit 0. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | Git is the log; the queue holds only what is open. | FR-METRICS-02-1, FR-METRICS-02-3 |
| RULE-2 | The trend is read per week. | FR-METRICS-02-2, FR-METRICS-02-4 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | R-1 is added in a commit of Tuesday 2026-11-17 and removed in a commit of Monday 2026-11-23 | the history command runs | it lists R-1 opened 2026-11-17 and closed 2026-11-23 |
| EX-2 | RULE-1 | boundary | R-1 is added and its Finding text is edited in a later commit | the history command runs | it lists R-1 once, opened at the first commit |
| EX-3 | RULE-1 | negative | R-2 is added, removed, and added again under the same id | the history command runs | it lists R-2 twice: one closed, one open |
| EX-4 | RULE-2 | positive | Two findings opened in the week of 2026-11-16, one of them closed in the week of 2026-11-23 | the history command runs | it prints "2026-11-16: opened 2, closed 0, open 2" and "2026-11-23: opened 0, closed 1, open 1" |
| EX-5 | RULE-2 | positive | Findings of changes SPEC-01-1 (2) and SPEC-01-2 (1), causes C-1 (2) and C-3 (1) | the history command runs | it prints "SPEC-01-1: 2", "SPEC-01-2: 1", "C-1: 2" and "C-3: 1" |
| EX-6 | RULE-2 | boundary | A project with no docs/metrics/rework.md | the history command runs | it prints "no rework queue" and exits 0 |

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: the command reads history and keeps nothing.

## Invariants
n/a: the repository keeps no invariants register yet; the rules are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | The command reads one file's history: 500 commits in under 5 seconds. |
| QC-3 | Compatibility | The examples pass on both CI systems. |
| QC-4 | Interaction capability | Every line names a week, change or cause with its counts, asserted in EX-4 and EX-5. |
| QC-5 | Reliability | n/a: a wrong result only fails a check or a report. |
| QC-6 | Security | n/a: it reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: nothing here is configured. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the git history of docs/metrics/rework.md. Keeps nothing.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given R-1 is added in a commit of Tuesday 2026-11-17 and removed in a commit of Monday 2026-11-23, when the history command runs, then it lists R-1 opened 2026-11-17 and closed 2026-11-23.
- **AC-2** (EX-2): Given R-1 is added and its Finding text is edited in a later commit, when the history command runs, then it lists R-1 once, opened at the first commit.
- **AC-3** (EX-3): Given R-2 is added, removed, and added again under the same id, when the history command runs, then it lists R-2 twice: one closed, one open.
- **AC-4** (EX-4): Given Two findings opened in the week of 2026-11-16, one of them closed in the week of 2026-11-23, when the history command runs, then it prints "2026-11-16: opened 2, closed 0, open 2" and "2026-11-23: opened 0, closed 1, open 1".
- **AC-5** (EX-5): Given Findings of changes SPEC-01-1 (2) and SPEC-01-2 (1), causes C-1 (2) and C-3 (1), when the history command runs, then it prints "SPEC-01-1: 2", "SPEC-01-2: 1", "C-1: 2" and "C-3: 1".
- **AC-6** (EX-6): Given A project with no docs/metrics/rework.md, when the history command runs, then it prints "no rework queue" and exits 0.
