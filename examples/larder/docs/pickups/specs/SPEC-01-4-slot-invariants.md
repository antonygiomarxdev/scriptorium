# SPEC-01-4: Prove the slot invariants

Status: Draft
Rests on: ../../INVARIANTS.md

## Summary

Property tests for the three invariants a booking must never break, over 1,000 random booking and cancel sequences. Rests on the invariants registry, not on the TP. Last of four runs.

Last change: 2026-11-20, split from the single booking spec into one spec per agent run

## Rows
| INV-1 | A slot's confirmed bookings never exceed its places. | FRD-01 | `bun test test/slot.invariant.test.ts`: property test, 1,000 random booking and cancel sequences |
| INV-2 | A family has at most one confirmed booking in any week. | FRD-01 | `bun test test/week.invariant.test.ts`: property test over 1,000 random sequences |
| INV-3 | A slot's free places equal its places minus its confirmed bookings. | FRD-01 | `bun test test/slot.invariant.test.ts`: asserted after every step of the property test |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `test/slot.invariant.test.ts` | Create | INV-1 and INV-3 |
| `test/week.invariant.test.ts` | Create | INV-2 |

## Tests first
INV-1, INV-2, INV-3, as property tests against `book` from SPEC-01-2.

## Build
Only the property tests; a failing property is a bug in SPEC-01-2, fixed there.

## Done when
`bun test test/slot.invariant.test.ts test/week.invariant.test.ts`

## Out of scope
The invariants of cancelling (FRD-02).

## Open questions
None.
