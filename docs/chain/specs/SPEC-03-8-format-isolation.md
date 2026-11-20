# SPEC-03-8: Formats stay apart

Status: Approved (2026-11-20)
Approval: content XWPaiS6XQm7t; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

Proves that format 1 spec rules never run under format 2 and that a dead tag only warns under format 1. Likely tests only.

Last change: 2026-11-20, first draft

## Rows

| EX-19 | RULE-2 | positive | A format 2 project has a small spec with no ## Tasks section | the spec check runs | it passes: format 1 spec rules do not run under format 2 |
| EX-20 | RULE-2 | positive | A format 1 project has a test tag for an id its FRD does not hold | the coverage scan runs | it passes and prints "WARN (format 2): dead tag" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change, only if a test fails | specFails runs the format 1 spec check under pin 1 only |
| `scripts/trace.ts` | Change, only if a test fails | The dead tag failure is tagged format 2 |

## Tests first
EX-19, EX-20, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Run the new tests first; change code only for a test that fails.

## Done when
`bun test test/check.test.ts test/trace.test.ts`

## Out of scope
Other format 2 rules, covered by SPEC-03-3.

## Open questions
None.
