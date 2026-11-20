# FRD-01: The rework queue

Status: Draft

## Summary

The rework log is a queue of open findings, each with one cause from a fixed list. A cause found twice with no proven prevention fails status and pre-commit. A finding of a prevented cause fails too, because its prevention did not hold. Findings of a prevented cause dated before the prevention must leave the log. One command prints the open findings per cause and per step. Under format 1 the rules only warn.

Last change: 2026-11-20, first draft

One feature of the [metrics PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
REQ-6, with D-32 in [the decision inbox](../../DECISIONS.md).

## Requirements covered
R-METRICS-1, R-METRICS-2, R-METRICS-3, R-METRICS-4, R-METRICS-5, R-METRICS-6, R-METRICS-7.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-METRICS-01-1 | IF | IF a finding names no cause, or a cause that is not in the list of causes, THEN status shall fail and name the finding. |
| FR-METRICS-01-2 | IF | IF a cause has two or more open findings and no prevention THEN status and pre-commit shall fail, naming the cause, its step and its findings. |
| FR-METRICS-01-3 | IF | IF a cause's prevention names a project check that does not exist or has no replay THEN status shall fail and name the cause. |
| FR-METRICS-01-4 | IF | IF a finding of a cause with a prevention is dated on or after the prevention's date THEN status shall fail and name the prevention that did not hold. |
| FR-METRICS-01-5 | IF | IF a finding of a cause with a prevention is dated before the prevention THEN status shall fail and say to remove that finding from the log. |
| FR-METRICS-01-6 | WHEN | WHEN the rework report runs, the system shall print each cause with its open findings and each step with its open findings, one line each. |
| FR-METRICS-01-7 | IF | IF the project's pin is format 1 THEN these rules shall only warn. |
| FR-METRICS-01-8 | IF | IF the project has no rework log THEN status shall check nothing about rework. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | Every finding names one known cause. | FR-METRICS-01-1 |
| RULE-2 | A cause found twice with no prevention blocks. | FR-METRICS-01-2 |
| RULE-3 | A prevention is a project check with a replay, and it must hold. | FR-METRICS-01-3, FR-METRICS-01-4 |
| RULE-4 | The log holds only open findings. | FR-METRICS-01-5, FR-METRICS-01-8 |
| RULE-5 | The totals come from one command. | FR-METRICS-01-6 |
| RULE-6 | The rules belong to format 2. | FR-METRICS-01-7 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | negative | Finding R-1 has an empty Cause cell | status runs | it fails with "R-1: no cause" |
| EX-2 | RULE-1 | negative | Finding R-1 names C-9 and the list of causes has C-1 to C-3 | status runs | it fails with "R-1: unknown cause C-9" |
| EX-3 | RULE-1 | positive | Finding R-1 names C-1 and the list has C-1 | status runs | it passes |
| EX-4 | RULE-2 | positive | Cause C-1 has one open finding and no prevention | status runs | it passes |
| EX-5 | RULE-2 | negative | Cause C-1, step FRD, has open findings R-1 and R-2 and no prevention | status runs | it fails with "C-1 (FRD) found 2 times with no prevention: R-1, R-2" |
| EX-6 | RULE-2 | negative | The same log, and a commit stages any file | pre-commit runs | it is blocked with the same line |
| EX-7 | RULE-2 | boundary | Cause C-2 is in the list with no findings and no prevention | status runs | it passes |
| EX-8 | RULE-3 | negative | Cause C-1 names prevention CHECK-4 and the project checks have no CHECK-4 | status runs | it fails with "C-1: prevention CHECK-4 does not exist" |
| EX-9 | RULE-3 | negative | Cause C-1 names CHECK-4, which has a command but no replay | status runs | it fails with "C-1: prevention CHECK-4 has no replay" |
| EX-10 | RULE-3 | negative | Cause C-1 has prevention CHECK-4 dated 2026-11-21 and finding R-7 of C-1 is dated 2026-11-22 | status runs | it fails with "C-1: CHECK-4 did not prevent R-7" |
| EX-11 | RULE-3 | boundary | The same prevention and finding R-7 dated 2026-11-21 | status runs | it fails with "C-1: CHECK-4 did not prevent R-7": the same day counts as after |
| EX-12 | RULE-4 | negative | Cause C-1 has prevention CHECK-4 dated 2026-11-21 and finding R-2 of C-1 is dated 2026-11-20 | status runs | it fails with "R-2: closed by CHECK-4, remove it from the log" |
| EX-13 | RULE-4 | positive | A project has no docs/metrics/rework.md | status runs | it reports nothing about rework |
| EX-14 | RULE-5 | positive | The log has C-1 with 2 open findings at step FRD and C-2 with 1 at step spec | the rework report runs | it prints "C-1 (FRD): 2", "C-2 (spec): 1", "FRD: 2", "spec: 1" and "open: 3" |
| EX-15 | RULE-6 | positive | A format 1 project with the log of EX-5 | status runs | it passes and prints "WARN (format 2):" with the EX-5 line |
| EX-16 | RULE-3 | positive | Cause C-1 has prevention CHECK-4 with a command and a replay, and no finding of C-1 is open | status runs | it passes |
| EX-17 | RULE-5 | boundary | The log lists causes and no open findings | the rework report runs | it prints "open: 0" |
| EX-18 | RULE-6 | negative | A format 2 project with the log of EX-5 | status runs | it fails with the EX-5 line |

### Coverage waivers
None.

## Decision table
What status does with one cause. The first row that matches wins.

| ID | Prevention | Open findings dated on or after it | Open findings in all | Result |
|---|---|---|---|---|
| DT-1 | none | n/a | 0 or 1 | Pass |
| DT-2 | none | n/a | 2 or more | Fail: repeated with no prevention |
| DT-3 | named but missing or with no replay | any | any | Fail: unproven prevention |
| DT-4 | proven | 1 or more | any | Fail: the prevention did not hold |
| DT-5 | proven | 0 | 1 or more | Fail: remove the closed findings |
| DT-6 | proven | 0 | 0 | Pass |

## States
n/a: a finding has no lifecycle in the log; it is open while listed and leaves when closed.

## Invariants
n/a: the repository keeps no invariants register yet; RULE-1 to RULE-6 are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All 18 examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | The rework rules add under 200 ms to status on this repository, measured in one test. |
| QC-3 | Compatibility | The examples pass on both CI systems. |
| QC-4 | Interaction capability | Every failure names the cause, its step and the findings or prevention involved, asserted in EX-5, EX-10 and EX-12. |
| QC-5 | Reliability | A log the check cannot read fails status and names the file. |
| QC-6 | Security | n/a: the log holds no secrets and runs no code. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | The repetition threshold is 2, fixed by D-32; changing it needs an owner decision. |
| QC-9 | Safety | n/a: a wrong result blocks a commit and endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the list of causes (id, step, cause, prevention, prevention date) and the open findings (id, date, change, cause, finding) in docs/metrics/rework.md; the project checks and their replays; the pin. Keeps nothing.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given Finding R-1 has an empty Cause cell, when status runs, then it fails with "R-1: no cause".
- **AC-2** (EX-2): Given Finding R-1 names C-9 and the list of causes has C-1 to C-3, when status runs, then it fails with "R-1: unknown cause C-9".
- **AC-3** (EX-3): Given Finding R-1 names C-1 and the list has C-1, when status runs, then it passes.
- **AC-4** (EX-4): Given Cause C-1 has one open finding and no prevention, when status runs, then it passes.
- **AC-5** (EX-5): Given Cause C-1, step FRD, has open findings R-1 and R-2 and no prevention, when status runs, then it fails with "C-1 (FRD) found 2 times with no prevention: R-1, R-2".
- **AC-6** (EX-6): Given The same log, and a commit stages any file, when pre-commit runs, then it is blocked with the same line.
- **AC-7** (EX-7): Given Cause C-2 is in the list with no findings and no prevention, when status runs, then it passes.
- **AC-8** (EX-8): Given Cause C-1 names prevention CHECK-4 and the project checks have no CHECK-4, when status runs, then it fails with "C-1: prevention CHECK-4 does not exist".
- **AC-9** (EX-9): Given Cause C-1 names CHECK-4, which has a command but no replay, when status runs, then it fails with "C-1: prevention CHECK-4 has no replay".
- **AC-10** (EX-10): Given Cause C-1 has prevention CHECK-4 dated 2026-11-21 and finding R-7 of C-1 is dated 2026-11-22, when status runs, then it fails with "C-1: CHECK-4 did not prevent R-7".
- **AC-11** (EX-11): Given The same prevention and finding R-7 dated 2026-11-21, when status runs, then it fails with "C-1: CHECK-4 did not prevent R-7": the same day counts as after.
- **AC-12** (EX-12): Given Cause C-1 has prevention CHECK-4 dated 2026-11-21 and finding R-2 of C-1 is dated 2026-11-20, when status runs, then it fails with "R-2: closed by CHECK-4, remove it from the log".
- **AC-13** (EX-13): Given A project has no docs/metrics/rework.md, when status runs, then it reports nothing about rework.
- **AC-14** (EX-14): Given The log has C-1 with 2 open findings at step FRD and C-2 with 1 at step spec, when the rework report runs, then it prints "C-1 (FRD): 2", "C-2 (spec): 1", "FRD: 2", "spec: 1" and "open: 3".
- **AC-15** (EX-15): Given A format 1 project with the log of EX-5, when status runs, then it passes and prints "WARN (format 2):" with the EX-5 line.
- **AC-16** (EX-16): Given Cause C-1 has prevention CHECK-4 with a command and a replay, and no finding of C-1 is open, when status runs, then it passes.
- **AC-17** (EX-17): Given The log lists causes and no open findings, when the rework report runs, then it prints "open: 0".
- **AC-18** (EX-18): Given A format 2 project with the log of EX-5, when status runs, then it fails with the EX-5 line.
- **AC-19** (DT-1): Given prevention: none, open findings dated on or after it: n/a, open findings in all: 0 or 1, when status runs, then the result is: pass.
- **AC-20** (DT-2): Given prevention: none, open findings dated on or after it: n/a, open findings in all: 2 or more, when status runs, then the result is: fail: repeated with no prevention.
- **AC-21** (DT-3): Given prevention: named but missing or with no replay, open findings dated on or after it: any, open findings in all: any, when status runs, then the result is: fail: unproven prevention.
- **AC-22** (DT-4): Given prevention: proven, open findings dated on or after it: 1 or more, open findings in all: any, when status runs, then the result is: fail: the prevention did not hold.
- **AC-23** (DT-5): Given prevention: proven, open findings dated on or after it: 0, open findings in all: 1 or more, when status runs, then the result is: fail: remove the closed findings.
- **AC-24** (DT-6): Given prevention: proven, open findings dated on or after it: 0, open findings in all: 0, when status runs, then the result is: pass.
