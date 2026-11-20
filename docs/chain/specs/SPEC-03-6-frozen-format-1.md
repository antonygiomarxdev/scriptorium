# SPEC-03-6: Freeze format 1

Status: Approved (2026-11-20)
Approval: content qi7s1cOEbPnT; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

The Larder example as released in 0.3.0, frozen with no pin, must pass today's checks with warnings only.

Last change: 2026-11-20, first draft

## Rows

| EX-17 | RULE-5 | positive | The Larder example as released in 0.3.0, frozen with no pin | today's checks run on it | they pass, with warnings only |
| EX-18 | RULE-5 | negative | A format 2 rule is changed to fail under format 1 | the tests run | the frozen example's test fails |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `test/fixtures/format-1/` | Create | `examples/larder` from tag v0.3.0, exactly, with no .scriptorium folder |

## Tests first
EX-17, EX-18, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
Copy with `git archive v0.3.0 examples/larder`; a test runs status, the spec checks, the lint and the scan on it and expects exit 0.

## Done when
`bun test test/frozen-formats.test.ts`

## Out of scope
A fixture for format 2, written when format 3 ships.

## Open questions
None.
