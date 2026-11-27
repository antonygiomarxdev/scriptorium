# FRD-10: Specs checked against the code

Status: Approved (2026-11-22)
Approval: content _9JVArVmxyzY; rests on ../PRD.md OZpNPTgEi9vt

## Summary

The spec check fails a path a spec names that is not a tracked file of the repository, unless a Files row of the spec creates it, and a call in one spec's Build block whose argument count differs from the declaration of the same function, method or constructor in a sibling spec of the same folder.

Last change: 2026-11-22, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
[REQ-14](../../requests/REQ-14-specs-checked-against-code.md).

## Requirements covered
R-CHAIN-39.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-10-1 | IF | IF a path named in a spec's Files, Tests first or Done section is not a tracked file of the repository and no Files row of the spec marks it Create, THEN the spec check shall fail and name the path. |
| FR-CHAIN-10-2 | IF | IF a function, method or constructor declared in one spec's Build block is called in another spec's Build block in the same specs folder with a different number of arguments, THEN the spec check shall fail and name both specs and both counts. |
| FR-CHAIN-10-3 | WHERE | WHERE a project is pinned to a format before the one that adds these rules, the spec check shall print each such failure as a warning and pass. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | A spec names only files that exist or that it creates. | FR-CHAIN-10-1 |
| RULE-2 | Sibling specs agree on the arguments of what they share. | FR-CHAIN-10-2 |
| RULE-3 | A new rule warns until the project migrates. | FR-CHAIN-10-3 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | negative | A spec has the Files row "test/restore-record.test.ts, Change" and the tracked file is test/withdraw-restore-record.test.ts | the spec check runs | it fails with "test/restore-record.test.ts is not a tracked file" |
| EX-2 | RULE-1 | positive | A spec names test/new-thing.test.ts in Tests first and has the Files row "test/new-thing.test.ts, Create" | the spec check runs | it reports nothing for that path |
| EX-3 | RULE-1 | negative | A spec names test/old.test.ts only in its Done command, and no such file is tracked | the spec check runs | it fails with "test/old.test.ts is not a tracked file" |
| EX-4 | RULE-2 | negative | SPEC-01-48 declares "new RecordsReader(a, b, c, d)" in its Build block and SPEC-01-35 calls "new RecordsReader(x, y)" in its Build block | the spec check runs on SPEC-01-35 | it fails naming SPEC-01-48, SPEC-01-35, 4 and 2 |
| EX-5 | RULE-2 | positive | Both specs use RecordsReader with 4 arguments | the spec check runs | it reports nothing for RecordsReader |
| EX-6 | RULE-3 | boundary | The project is pinned to format 3 and a spec names a path that is not tracked | the spec check runs | it passes and prints the failure as a warning |
| EX-7 | RULE-3 | positive | The project is pinned to the format that adds these rules and every path its specs name is tracked or created | the spec check runs | it passes with no warning |

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
| QC-2 | Performance efficiency | The spec check on 130 specs takes under 5 s, measured in the tests. |
| QC-3 | Compatibility | n/a: it reads the repository only. |
| QC-4 | Interaction capability | Every failure names the spec, the path or the symbol, and the counts. |
| QC-5 | Reliability | n/a: a wrong result only fails a check or a report. |
| QC-6 | Security | n/a: it reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: nothing here is configured. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
A spec, its sections Files, Tests first, Done and Build, the tracked files of the repository, and the specs of the same folder.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given A spec has the Files row "test/restore-record.test.ts, Change" and the tracked file is test/withdraw-restore-record.test.ts, when the spec check runs, then it fails with "test/restore-record.test.ts is not a tracked file".
- **AC-2** (EX-2): Given A spec names test/new-thing.test.ts in Tests first and has the Files row "test/new-thing.test.ts, Create", when the spec check runs, then it reports nothing for that path.
- **AC-3** (EX-3): Given A spec names test/old.test.ts only in its Done command, and no such file is tracked, when the spec check runs, then it fails with "test/old.test.ts is not a tracked file".
- **AC-4** (EX-4): Given SPEC-01-48 declares "new RecordsReader(a, b, c, d)" in its Build block and SPEC-01-35 calls "new RecordsReader(x, y)" in its Build block, when the spec check runs on SPEC-01-35, then it fails naming SPEC-01-48, SPEC-01-35, 4 and 2.
- **AC-5** (EX-5): Given Both specs use RecordsReader with 4 arguments, when the spec check runs, then it reports nothing for RecordsReader.
- **AC-6** (EX-6): Given The project is pinned to format 3 and a spec names a path that is not tracked, when the spec check runs, then it passes and prints the failure as a warning.
- **AC-7** (EX-7): Given The project is pinned to the format that adds these rules and every path its specs name is tracked or created, when the spec check runs, then it passes with no warning.
