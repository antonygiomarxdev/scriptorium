# Spec: Book a slot

Status: Draft

## Summary

Three tasks build the booking: the pure rule that decides a request, the atomic write that takes a place, and the messages in two languages. Each task writes its tests first from the FRD ids. Cancelling is a separate spec.

Last change: 2026-11-19, three tasks covering every FRD id

One per FRD: `docs/pickups/specs/SPEC-01-book-a-slot.md`, resting on [TP-01](../tp/TP-01-book-a-slot.md). A spec decides nothing new: a missing decision goes back to the TP.

## Context
Builds on [FRD-01](../frd/FRD-01-book-a-slot.md), [UX-01](../ux/UX-01-book-a-slot.md) and the choices of [TP-01](../tp/TP-01-book-a-slot.md): one conditional update, times in UTC. The slot and booking tables are new.

## Files

| Path | Create or change | Holds |
|---|---|---|
| `src/pickups/decide.ts` | Create | The pure decision of the table DT-1 to DT-5 |
| `src/pickups/book.ts` | Create | The atomic write that takes a place |
| `src/pickups/messages.ts` | Create | The English and Spanish messages |
| `src/pickups/week.ts` | Create | The week start in the pantry's time zone |
| `db/001-slots-bookings.sql` | Create | The slot and booking tables and the unique index |

## Interfaces

```ts
export type Refusal = "one-per-week" | "slot-full" | "slot-started";
export type Decision = { ok: true } | { ok: false; refusal: Refusal };
export function decide(input: { slotStartsAt: Date; freePlaces: number; hasBookingThisWeek: boolean; now: Date }): Decision;
export function weekStart(at: Date, zone: string): Date;
export function book(db: Db, familyId: number, slotId: number, now: Date): Booking | Refusal;
export function message(refusal: Refusal | "confirmed", language: "en" | "es", slot?: Date): string;
```

## Data
New tables `slot(id, starts_at, places, free_places)` and `booking(id, family_id, slot_id, week_start, state)`, with a unique index on (family_id, week_start) where state is confirmed.

## Tasks
### Task 1: Decide a booking
- **Tests first:** DT-1, DT-2, DT-3, DT-4, DT-5, EX-1, EX-2, EX-3, EX-7, EX-8, ST-1, ST-2, ST-3 (written without the code in view).
- **Build:** `decide` and `weekStart` as pure functions, no database.
- **Done when:** `bun test test/decide.test.ts` passes and the mutant that changes `<=` to `<` in the started check fails it.

### Task 2: Take the place atomically
- **Tests first:** EX-4, EX-5, EX-6, INV-1, INV-2, INV-3 (EX-6 with 50 simultaneous requests; the INV ids as property tests).
- **Build:** `book`: one conditional update and the booking insert in one transaction; the migration file.
- **Done when:** `bun test test/book.test.ts test/slot.invariant.test.ts` passes.

### Task 3: Say it in two languages
- **Tests first:** EX-9, EX-10 (every refusal has an English and a Spanish text).
- **Build:** `message` and the confirmation text with the slot's day and time.
- **Done when:** `bun test test/messages.test.ts` passes and the access test of CC-1 still passes.

## Open questions
None.

## Out of scope
Cancelling a booking (FRD-02), reminders, and the screens themselves (UX-01 has its own spec when its design is approved).
