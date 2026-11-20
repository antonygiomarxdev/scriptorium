# SPEC-03-3: Gate the other format 2 rules

Status: Approved (2026-11-20)
Approval: content SOZGuM3pnZfL; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

The changeset rule, the coverage scan and the version-line lint are format 2: under format 1 they warn.

Last change: 2026-11-20, first draft

## Rows

| EX-6 | RULE-2 | positive | A format 1 project uses Changesets and a commit stages scripts/a.ts with no changeset | pre-commit runs | it passes and prints "WARN (format 2): Changeset missing" |
| EX-7 | RULE-2 | negative | The same commit in a format 2 project | pre-commit runs | it is blocked |
| EX-8 | RULE-2 | positive | A format 1 project has an approved FRD whose example no test tags | the coverage scan runs | it passes and prints "WARN (format 2): uncovered" for that example |
| EX-9 | RULE-2 | positive | A format 1 project has a document with the line "Version: 1.2" | the lint runs | it passes and prints a "WARN (format 2):" line naming the line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/pre-commit.ts` | Change | The changeset rule through `gate` |
| `scripts/trace.ts` | Change | Uncovered and dead tags through `gate` |
| `scripts/lint-docs.ts` | Change | The version-line rule through `gate` |

## Tests first
EX-6, EX-7, EX-8, EX-9, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
Each rule tags its failures with format 2 and each script passes them through `gate` with the pin of the project it checks.

## Done when
`bun test test/hooks.test.ts test/trace.test.ts test/lint-docs.test.ts`

## Out of scope
Drift and Superseded, allowed in every format.

## Open questions
None.
