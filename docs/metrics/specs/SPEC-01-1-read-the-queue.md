# SPEC-01-1: Read the queue and its causes

Status: Approved (2026-11-21)
Approval: content vYtsHvAjGFXN; rests on ../frd/FRD-01-rework-queue.md LeMG8yiTCSTC
Rests on: ../frd/FRD-01-rework-queue.md

## Summary

A pure function reads docs/metrics/rework.md: the causes table and the open findings, and fails a finding with no cause or an unknown one. No log, no rework checks.

Last change: 2026-11-21, Reuses names what the build uses

## Rows

| EX-1 | RULE-1 | negative | Finding R-1 has an empty Cause cell | status runs | it fails with "R-1: no cause" |
| EX-2 | RULE-1 | negative | Finding R-1 names C-9 and the list of causes has C-1 to C-3 | status runs | it fails with "R-1: unknown cause C-9" |
| EX-3 | RULE-1 | positive | Finding R-1 names C-1 and the list has C-1 | status runs | it passes |
| EX-13 | RULE-4 | positive | A project has no docs/metrics/rework.md | status runs | it reports nothing about rework |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/rework.ts` | Create | `readQueue(root)`: causes (id, step, prevention, since) and findings (id, date, change, cause); undefined when the file does not exist; `reworkFails(root)`: the RULE-1 failures, tagged "[format 3] " |

## Reuses
- `scripts/lint-docs.ts` `cells`: reads a table row's cells, as the document lint does.
- Precedent: SPEC-04-1-who-may-edit.md, a pure rule in its own file.

## Tests first
EX-1, EX-2, EX-3, EX-13, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Rows are markdown table rows starting with "| C-" and "| R-". A table it cannot read fails with the file name (QC-5).

## Done when
`bun test test/rework.test.ts`

## Out of scope
Repetition and prevention (SPEC-01-2); status and pre-commit wiring (SPEC-01-3).

## Open questions
None.
