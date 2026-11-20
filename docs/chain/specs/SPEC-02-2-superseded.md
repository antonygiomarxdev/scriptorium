# SPEC-02-2: Superseded documents

Status: Approved (2026-11-20)
Approval: content TRMgRNCEpzc1; rests on ../frd/FRD-02-small-specs-states.md P51qy6LO9pYx
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

The Superseded status line: its replacement must exist, nothing approved rests on it, and drift and the coverage scan skip it.

Last change: 2026-11-20, first draft

## Rows

| EX-14 | RULE-5 | negative | A TP says "Status: Superseded by TP-04-new.md (2026-11-20)" and no TP-04-new.md exists | status runs | it fails and names TP-04-new.md |
| EX-15 | RULE-5 | negative | An approved spec rests on a superseded TP | status runs | it fails and names the superseded TP |
| EX-16 | RULE-5 | positive | An FRD is superseded and its examples have no tests | the coverage scan runs | it passes |
| DT-1 | no | any | Fail: the replacement does not exist |
| DT-2 | yes | yes | Fail: the approved document must rest on the replacement |
| DT-3 | yes | no | Pass; drift and coverage skip it |
| ST-1 | Approved to Superseded | Yes, naming the replacement |
| ST-2 | Superseded to Approved | No: write a new document |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | Status grammar, docStatus and chainStatus |
| `scripts/trace.ts` | Change | Skip superseded FRDs |

## Tests first
EX-14, EX-15, EX-16, DT-1, DT-2, DT-3, ST-1, ST-2, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
docStatus returns status "Superseded" and the replacement path; chainStatus fails rows DT-1 and DT-2.

## Done when
`bun test test/check.test.ts test/trace.test.ts test/drift.test.ts`

## Out of scope
Superseding ADRs and requests, which keep their own grammar.

## Open questions
None.
