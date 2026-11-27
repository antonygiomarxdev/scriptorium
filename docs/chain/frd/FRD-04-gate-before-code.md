# FRD-04: The gate before code edits

Status: Approved (2026-11-26)
Approval: content uL6Edt_koZHn; rests on ../PRD.md CCI95Z47mmmD

## Summary

An agent cannot edit code or configuration unless an approved spec names the file in its Files table, or an accepted request declares it as a short path, and every row that spec quotes from an FRD already has a test. The same rule runs on staged files in pre-commit, for edits made without the agent's tools. Tests and documents are outside the gate. It is a format 2 rule: a format 1 project only sees a warning. A built spec authorizes no edit; that refusal is a format 6 rule.

Last change: 2026-11-26, draft for the owner: a built spec, every row tagged in a test committed on the default branch, authorizes no edit, and a started spec does (4A, D-41; FR-CHAIN-04-7, FR-CHAIN-04-8, RULE-4, RULE-5, EX-19 to EX-25; D-39, D-40); before that 2026-11-20, EX-14 to EX-18 from the review: drift, wrong FRD tag, hook error, notebooks, hook entry

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
R-CHAIN-15, with L-12, D-29 Q-4 and D-30 in [the decision inbox](../../DECISIONS.md). On 2026-11-20 the lead and two builders each edited code outside an approved spec, and the builders kept working through a written pause: a rule in prose did not hold.

## Requirements covered
R-CHAIN-15, R-CHAIN-28.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-04-1 | IF | IF an agent is about to edit a file outside the documents and the tests, and no approved spec names it in its Files table and no accepted request declares it as a short path, THEN the edit hook shall refuse the edit and say how to get one. |
| FR-CHAIN-04-2 | IF | IF the only spec that names the file is not approved THEN the edit hook shall refuse the edit and name the spec. |
| FR-CHAIN-04-3 | IF | IF the approved spec that names the file quotes FRD rows that no test covers yet THEN the edit hook shall refuse the edit and name those rows. |
| FR-CHAIN-04-4 | WHEN | WHEN a commit stages a file outside the documents and the tests, the pre-commit check shall fail it unless an approved spec or an accepted request's short path names it. |
| FR-CHAIN-04-5 | always | Configuration files shall be gated like code; test files, documents and the changesets folder shall not. |
| FR-CHAIN-04-6 | IF | IF the project's pin is format 1 THEN the gate shall only warn. |
| FR-CHAIN-04-7 | IF | IF an edit touches a file that only a built spec names, meaning every row it quotes carries a covers tag in a test already committed on the default branch, THEN the gate shall refuse it and say to write a new spec or a fix; a spec whose tags are only in uncommitted tests or only on a branch other than the default branch is started, and the gate shall allow its files once every row it quotes has a test (FR-CHAIN-04-3). |
| FR-CHAIN-04-8 | WHERE | WHERE a project is pinned to a format before 6, the gate shall print the refusal of FR-CHAIN-04-7 as a warning and allow the edit. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | A file outside documents and tests is edited only under an approved spec that names it, or an accepted request's short path. | FR-CHAIN-04-1, FR-CHAIN-04-2, FR-CHAIN-04-4, FR-CHAIN-04-5 |
| RULE-2 | The tests come first: no code edit while a quoted FRD row has no test. | FR-CHAIN-04-3 |
| RULE-3 | The gate is a format 2 rule. | FR-CHAIN-04-6 |
| RULE-4 | A built spec, with every quoted row tagged in a test committed on the default branch, authorizes no edit; a started spec does, once every row it quotes has a test (FR-CHAIN-04-3), so the tests-first build can edit; a new spec or a fix carries any change to built code. | FR-CHAIN-04-7 |
| RULE-5 | The refusal of a built spec is a format 6 rule. | FR-CHAIN-04-8 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-2 | positive | An approved spec lists scripts/a.ts in Files and every row it quotes has a test | the agent edits scripts/a.ts | the edit goes ahead |
| EX-2 | RULE-1 | negative | No spec lists scripts/b.ts | the agent edits scripts/b.ts | it is refused with "scripts/b.ts: no approved spec names it in its Files table" and the way to write one |
| EX-3 | RULE-1 | negative | Only a draft spec lists scripts/a.ts | the agent edits scripts/a.ts | it is refused and names that spec as not approved |
| EX-4 | RULE-1 | positive | The agent edits test/a.test.ts or docs/x.md | the edit hook runs | the edit goes ahead with no spec |
| EX-5 | RULE-1 | positive | An accepted request holds the line "Short path: scripts/c.ts" | the agent edits scripts/c.ts | the edit goes ahead |
| EX-6 | RULE-1 | negative | An open request holds the line "Short path: scripts/c.ts" | the agent edits scripts/c.ts | it is refused |
| EX-7 | RULE-1 | negative | No spec lists package.json | the agent edits package.json | it is refused: configuration is gated like code |
| EX-8 | RULE-1 | positive | An approved spec lists "src/pickups/" in Files | the agent edits src/pickups/book.ts | the edit goes ahead: a row ending in a slash names the folder |
| EX-9 | RULE-1 | negative | A commit stages scripts/b.ts and no approved spec lists it | pre-commit runs | it fails and names scripts/b.ts |
| EX-10 | RULE-2 | negative | An approved spec lists scripts/a.ts and quotes FRD-01 EX-4, and no test carries a covers tag for EX-4 | the agent edits scripts/a.ts | it is refused with "write the tests first: FRD-01/EX-4" |
| EX-11 | RULE-2 | boundary | An approved spec quotes rows from a request, not an FRD | the agent edits a file it lists | the edit goes ahead: only FRD rows have covers tags |
| EX-12 | RULE-3 | positive | A format 1 project and no spec lists scripts/b.ts | the agent edits scripts/b.ts | the edit goes ahead and prints "WARN (format 2):" with the refusal text |
| EX-13 | RULE-3 | boundary | A project has no docs/PRODUCT.md | the agent edits any file | the hook does nothing |
| EX-14 | RULE-1 | negative | An approved spec lists scripts/a.ts but changed after its approval | the agent edits scripts/a.ts | it is refused: a drifted spec does not count as approved |
| EX-15 | RULE-2 | negative | An approved spec quotes FRD-01 EX-4 and the only test tag is for FRD-02 EX-4 | the agent edits a file it lists | it is refused with "write the tests first: FRD-01/EX-4" |
| EX-16 | RULE-1 | negative | The host sends the edit hook input it cannot parse | the edit hook runs | it exits 2 and says why: an error never allows an edit |
| EX-17 | RULE-1 | negative | No spec lists notes/a.ipynb | the agent edits notes/a.ipynb with NotebookEdit | it is refused |
| EX-18 | RULE-1 | positive | The plugin is installed | its hook configuration is read | a PreToolUse entry runs the edit hook for Edit, Write, MultiEdit and NotebookEdit |
| EX-19 | RULE-4 | negative | The only spec that names scripts/check.ts is built: every row it quotes is tagged in a test committed on the default branch | the agent edits scripts/check.ts | it is refused with "scripts/check.ts: only a built spec names it" and says to write a new spec or a fix |
| EX-23 | RULE-4 | positive | The only spec that names scripts/check.ts quotes EX-1 and EX-2, and their tags are only in a test file that is not committed | the agent edits scripts/check.ts | the edit goes ahead: the spec is started, not built |
| EX-24 | RULE-4 | positive | The only spec that names scripts/check.ts quotes EX-1 and EX-2, and their tags are committed only on a branch other than the default branch, and that branch is checked out | the agent edits scripts/check.ts | the edit goes ahead: the spec is started, not built |
| EX-25 | RULE-2 | negative | The only spec that names scripts/check.ts quotes EX-1 and EX-2, and only EX-1 is tagged, in a test committed on the default branch | the agent edits scripts/check.ts | it is refused with "write the tests first: EX-2" by FR-CHAIN-04-3, and the spec is started, not built |
| EX-20 | RULE-4 | positive | A built spec and an approved spec that is not built both name scripts/check.ts | the agent edits scripts/check.ts | the edit goes ahead |
| EX-21 | RULE-5 | boundary | The project is pinned to format 5 and the only spec that names scripts/check.ts is built | the agent edits scripts/check.ts | the edit goes ahead and prints "WARN (format 6):" with the refusal text |
| EX-22 | RULE-5 | positive | The project is pinned to format 5 and an approved spec that is not built names scripts/check.ts | the agent edits scripts/check.ts | the edit goes ahead with no warning |

### Coverage waivers
None.

## Decision table
What the edit hook does with a file. The first row that matches wins.

| ID | Inside documents or tests | Named by an approved spec or an accepted short path | Its quoted FRD rows all tested | Result |
|---|---|---|---|---|
| DT-1 | yes | any | any | Allowed |
| DT-2 | no | no | any | Refused: no approved spec |
| DT-3 | no | yes | no | Refused: tests first |
| DT-4 | no | yes | yes | Allowed |

## States
n/a: the gate keeps no state; it reads the documents and tests on every edit.

## Invariants
n/a: the repository keeps no invariants register yet; RULE-1 to RULE-5 are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All 25 examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | The edit hook answers in under 500 ms on this repository, measured in one test. |
| QC-3 | Compatibility | The examples pass on both CI systems, with paths given with either slash. |
| QC-4 | Interaction capability | Every refusal names the file, the reason and the skill that unblocks it, asserted in EX-2, EX-3 and EX-10. |
| QC-5 | Reliability | A hook error, such as unreadable input, refuses the edit and says why, never allows it silently. |
| QC-6 | Security | The gate cannot see edits made through a shell; pre-commit and CI run the same rule on staged files, asserted in EX-9. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: the exemptions are fixed. |
| QC-9 | Safety | n/a: a wrong result delays an edit and endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the edited path the agent host gives, every spec's status and Files table, every request's status and Short path line, the covers tags in the tests, the pin. Keeps nothing. Exempt: docs/, .changeset/, test folders and test files (the same list as the changeset rule).

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given An approved spec lists scripts/a.ts in Files and every row it quotes has a test, when the agent edits scripts/a.ts, then the edit goes ahead.
- **AC-2** (EX-2): Given No spec lists scripts/b.ts, when the agent edits scripts/b.ts, then it is refused with "scripts/b.ts: no approved spec names it in its Files table" and the way to write one.
- **AC-3** (EX-3): Given Only a draft spec lists scripts/a.ts, when the agent edits scripts/a.ts, then it is refused and names that spec as not approved.
- **AC-4** (EX-4): Given The agent edits test/a.test.ts or docs/x.md, when the edit hook runs, then the edit goes ahead with no spec.
- **AC-5** (EX-5): Given An accepted request holds the line "Short path: scripts/c.ts", when the agent edits scripts/c.ts, then the edit goes ahead.
- **AC-6** (EX-6): Given An open request holds the line "Short path: scripts/c.ts", when the agent edits scripts/c.ts, then it is refused.
- **AC-7** (EX-7): Given No spec lists package.json, when the agent edits package.json, then it is refused: configuration is gated like code.
- **AC-8** (EX-8): Given An approved spec lists "src/pickups/" in Files, when the agent edits src/pickups/book.ts, then the edit goes ahead: a row ending in a slash names the folder.
- **AC-9** (EX-9): Given A commit stages scripts/b.ts and no approved spec lists it, when pre-commit runs, then it fails and names scripts/b.ts.
- **AC-10** (EX-10): Given An approved spec lists scripts/a.ts and quotes FRD-01 EX-4, and no test carries a covers tag for EX-4, when the agent edits scripts/a.ts, then it is refused with "write the tests first: FRD-01/EX-4".
- **AC-11** (EX-11): Given An approved spec quotes rows from a request, not an FRD, when the agent edits a file it lists, then the edit goes ahead: only FRD rows have covers tags.
- **AC-12** (EX-12): Given A format 1 project and no spec lists scripts/b.ts, when the agent edits scripts/b.ts, then the edit goes ahead and prints "WARN (format 2):" with the refusal text.
- **AC-13** (EX-13): Given A project has no docs/PRODUCT.md, when the agent edits any file, then the hook does nothing.
- **AC-14** (EX-14): Given An approved spec lists scripts/a.ts but changed after its approval, when the agent edits scripts/a.ts, then it is refused: a drifted spec does not count as approved.
- **AC-15** (EX-15): Given An approved spec quotes FRD-01 EX-4 and the only test tag is for FRD-02 EX-4, when the agent edits a file it lists, then it is refused with "write the tests first: FRD-01/EX-4".
- **AC-16** (EX-16): Given The host sends the edit hook input it cannot parse, when the edit hook runs, then it exits 2 and says why: an error never allows an edit.
- **AC-17** (EX-17): Given No spec lists notes/a.ipynb, when the agent edits notes/a.ipynb with NotebookEdit, then it is refused.
- **AC-18** (EX-18): Given The plugin is installed, when its hook configuration is read, then a PreToolUse entry runs the edit hook for Edit, Write, MultiEdit and NotebookEdit.
- **AC-19** (DT-1): Given a file inside documents or tests: yes, named by an approved spec or short path: any, its quoted FRD rows all tested: any, when the edit hook runs, then the result is: allowed.
- **AC-20** (DT-2): Given a file inside documents or tests: no, named by an approved spec or short path: no, its quoted FRD rows all tested: any, when the edit hook runs, then the result is: refused: no approved spec.
- **AC-21** (DT-3): Given a file inside documents or tests: no, named by an approved spec or short path: yes, its quoted FRD rows all tested: no, when the edit hook runs, then the result is: refused: tests first.
- **AC-22** (DT-4): Given a file inside documents or tests: no, named by an approved spec or short path: yes, its quoted FRD rows all tested: yes, when the edit hook runs, then the result is: allowed.
- **AC-23** (EX-19): Given The only spec that names scripts/check.ts is built: every row it quotes is tagged in a test committed on the default branch, when the agent edits scripts/check.ts, then it is refused with "scripts/check.ts: only a built spec names it" and says to write a new spec or a fix.
- **AC-24** (EX-20): Given A built spec and an approved spec that is not built both name scripts/check.ts, when the agent edits scripts/check.ts, then the edit goes ahead.
- **AC-25** (EX-21): Given The project is pinned to format 5 and the only spec that names scripts/check.ts is built, when the agent edits scripts/check.ts, then the edit goes ahead and prints "WARN (format 6):" with the refusal text.
- **AC-26** (EX-22): Given The project is pinned to format 5 and an approved spec that is not built names scripts/check.ts, when the agent edits scripts/check.ts, then the edit goes ahead with no warning.
- **AC-27** (EX-23): Given The only spec that names scripts/check.ts quotes EX-1 and EX-2, and their tags are only in a test file that is not committed, when the agent edits scripts/check.ts, then the edit goes ahead: the spec is started, not built.
- **AC-28** (EX-24): Given The only spec that names scripts/check.ts quotes EX-1 and EX-2, and their tags are committed only on a branch other than the default branch, and that branch is checked out, when the agent edits scripts/check.ts, then the edit goes ahead: the spec is started, not built.
- **AC-29** (EX-25): Given The only spec that names scripts/check.ts quotes EX-1 and EX-2, and only EX-1 is tagged, in a test committed on the default branch, when the agent edits scripts/check.ts, then it is refused with "write the tests first: EX-2" by FR-CHAIN-04-3, and the spec is started, not built.
