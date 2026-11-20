# SPEC-01-1: Decide a booking

Status: Draft
Rests on: ../tp/TP-01-book-a-slot.md

## Summary

The pure rule that accepts or refuses a booking request, and the start of the week in the pantry's time zone. No database. First of four runs for FRD-01.

Last change: 2026-11-20, split from the single booking spec into one spec per agent run

## Rows
Quoted from: ../frd/FRD-01-book-a-slot.md

| DT-1 | no | yes | no | Book it |
| DT-2 | no | yes | yes | Refuse: "One booking per week" |
| DT-3 | no | no | no | Refuse: "This slot is full" |
| DT-4 | no | no | yes | Refuse: "One booking per week" |
| DT-5 | yes | any | any | Refuse: "This slot has started" |
| EX-1 | RULE-1 | positive | The Diaz family has no booking in the week of Monday 2026-11-23; Tuesday 10:00 has 5 places and 2 bookings | The family books Tuesday 2026-11-24 10:00 | The booking is confirmed and the slot shows 2 free places |
| EX-2 | RULE-1 | negative | The Diaz family holds a confirmed booking for Tuesday 2026-11-24 10:00 | It books Thursday 2026-11-26 14:00 | The booking is refused with "One booking per week" and Thursday's free places do not change |
| EX-3 | RULE-1 | boundary | The Diaz family holds a booking for Sunday 2026-11-22 18:00 | It books Monday 2026-11-23 09:00 | The booking is confirmed: Monday starts a new week |
| EX-7 | RULE-3 | positive | It is Wednesday 2026-11-25 09:59 and the Lin family has no booking that week | It books Wednesday 10:00 | The booking is confirmed |
| EX-8 | RULE-3 | boundary | It is Wednesday 2026-11-25 10:00 and the Lin family has no booking that week | It books Wednesday 10:00 | The booking is refused with "This slot has started" |
| ST-1 | No booking to Confirmed | Yes, when the decision table says "Book it" |
| ST-2 | Confirmed to Confirmed (a second booking in the week) | No |
| ST-3 | Cancelled to Confirmed | No: booking again creates a new booking |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `src/pickups/decide.ts` | Create | The decision of DT-1 to DT-5 |
| `src/pickups/week.ts` | Create | The week start in the pantry's time zone |

## Tests first
DT-1, DT-2, DT-3, DT-4, DT-5, EX-1, EX-2, EX-3, EX-7, EX-8, ST-1, ST-2, ST-3, in `test/decide.test.ts`, written without the code in view.

## Build
```ts
export type Refusal = "one-per-week" | "slot-full" | "slot-started";
export type Decision = { ok: true } | { ok: false; refusal: Refusal };
export function decide(input: { slotStartsAt: Date; freePlaces: number; hasBookingThisWeek: boolean; now: Date }): Decision;
export function weekStart(at: Date, zone: string): Date;
```

## Done when
`bun test test/decide.test.ts`

## Out of scope
The write that takes a place (SPEC-01-2), the messages (SPEC-01-3), the invariants (SPEC-01-4).

## Open questions
None.
