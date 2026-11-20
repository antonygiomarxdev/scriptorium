# SPEC-04-4: A drifted spec or another FRD's tag does not count

Status: Approved (2026-11-20)
Approval: content Ktje-2MM4OSH; rests on ../frd/FRD-04-gate-before-code.md 5qbSw4IYjIsG
Rests on: ../frd/FRD-04-gate-before-code.md

## Summary

A spec changed after approval does not unlock its files, and a covers tag counts only for its own FRD.

Last change: 2026-11-20, first draft

## Rows

| EX-14 | RULE-1 | negative | An approved spec lists scripts/a.ts but changed after its approval | the agent edits scripts/a.ts | it is refused: a drifted spec does not count as approved |
| EX-15 | RULE-2 | negative | An approved spec quotes FRD-01 EX-4 and the only test tag is for FRD-02 EX-4 | the agent edits a file it lists | it is refused with "write the tests first: FRD-01/EX-4" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/gate.ts` | Change, only if a test fails | Approved means no drift; a tag matches slice, FRD number and id |

## Tests first
EX-14, EX-15, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Run the new tests first; change code only for a test that fails.

## Done when
`bun test test/gate.test.ts`

## Out of scope
The hook, SPEC-04-5.

## Open questions
None.
