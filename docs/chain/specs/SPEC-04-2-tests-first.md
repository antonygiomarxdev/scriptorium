# SPEC-04-2: Tests before code

Status: Approved (2026-11-20)
Approval: content 5hwcPDO1sfZa; rests on ../frd/FRD-04-gate-before-code.md 5qbSw4IYjIsG
Rests on: ../frd/FRD-04-gate-before-code.md

## Summary

An approved spec's FRD rows must all have a covers tag before any file it lists can be edited.

Last change: 2026-11-20, first draft

## Rows

| EX-1 | RULE-2 | positive | An approved spec lists scripts/a.ts in Files and every row it quotes has a test | the agent edits scripts/a.ts | the edit goes ahead |
| EX-10 | RULE-2 | negative | An approved spec lists scripts/a.ts and quotes FRD-01 EX-4, and no test carries a covers tag for EX-4 | the agent edits scripts/a.ts | it is refused with "write the tests first: FRD-01/EX-4" |
| EX-11 | RULE-2 | boundary | An approved spec quotes rows from a request, not an FRD | the agent edits a file it lists | the edit goes ahead: only FRD rows have covers tags |
| DT-3 | no | yes | no | Refused: tests first |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/gate.ts` | Change | `gateFile` also refuses while a quoted FRD row has no covers tag, naming the rows |

## Tests first
EX-1, EX-10, EX-11, DT-3, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The covers tags come from the trace scan of the test folders; rows quoted from a request or a registry are skipped.

## Done when
`bun test test/gate.test.ts`

## Out of scope
Tags for request and registry rows, which the scan does not read yet.

## Open questions
None.
