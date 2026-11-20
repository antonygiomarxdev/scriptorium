# SPEC-03-9: Migrate lists every failure and keeps line endings

Status: Approved (2026-11-20)
Approval: content gQ9IugjhNq6l; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

The dry run lists failures of every format 2 rule, lint and coverage included, and a rewrite keeps the file's line endings.

Last change: 2026-11-20, first draft

## Rows

| EX-21 | RULE-3 | positive | A format 1 project whose only format 2 failure is the line "Version: 1.2" in a document | migrate runs without apply | it lists that line among what fails under format 2 |
| EX-22 | RULE-3 | boundary | SPEC-01-x.md has CRLF line endings, no Rests on line, and TP-01-x.md beside it | migrate runs with apply | the Rests on line is written ending in CRLF |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/migrate.ts` | Change | The plan gathers lint, coverage and spec failures under the next format; rewrites keep CRLF |

## Tests first
EX-21, EX-22, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Reuse lintDocs and traceFails with the next pin; do not copy their rules.

## Done when
`bun test test/migrate.test.ts`

## Out of scope
The pre-commit changeset rule, which needs a commit to check.

## Open questions
None.
