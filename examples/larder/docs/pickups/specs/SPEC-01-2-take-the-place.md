# SPEC-01-2: Take the place atomically

Status: Draft
Rests on: ../tp/TP-01-book-a-slot.md

## Summary

The write that takes a place: one conditional update and the booking insert in one transaction, so two families never get the last place. Second of four runs.

Last change: 2026-11-20, split from the single booking spec into one spec per agent run

## Rows
Quoted from: ../frd/FRD-01-book-a-slot.md

| EX-4 | RULE-2 | positive | Wednesday 2026-11-25 10:00 has 5 places and 4 bookings | The Okafor family books it | The booking is confirmed and the slot shows 0 free places and "Full" |
| EX-5 | RULE-2 | boundary | Wednesday 2026-11-25 10:00 has 5 places and 5 bookings | The Lin family tries to book it | The booking is refused with "This slot is full" and the slot keeps 5 bookings |
| EX-6 | RULE-2 | negative | Wednesday 2026-11-25 11:00 has 5 places and 4 bookings | The Okafor and Lin families choose it at the same moment | Exactly one booking is confirmed, the other family sees "This slot is full", and the slot holds 5 bookings |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `src/pickups/book.ts` | Create | The atomic write that takes a place |
| `db/001-slots-bookings.sql` | Create | The slot and booking tables and the unique index on (family_id, week_start) where state is confirmed |

## Tests first
EX-4, EX-5, EX-6 (EX-6 with 50 simultaneous requests), in `test/book.test.ts`.

## Build
```ts
export function book(db: Db, familyId: number, slotId: number, now: Date): Booking | Refusal;
```
It calls `decide` from SPEC-01-1.

## Done when
`bun test test/book.test.ts`

## Out of scope
Cancelling a booking (FRD-02).

## Open questions
None.
