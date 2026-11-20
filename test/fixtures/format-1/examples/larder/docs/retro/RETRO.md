# Retro

Open entries only. An entry closes when its prevention exists and the replay of the original failure fails it; closed entries move to `retro/YYYY-MM.md`.

## RETRO-1: A booking was accepted after its slot had started

- **Seen:** 2026-11-18, review round 1 of the booking change.
- **Step that should have caught it:** FRD
- **Class:** booking-accepted-for-started-slot
- **Recurrence:** 1
- **Prevention:** CHECK-1, and the rule FR-PICKUPS-01-7 with EX-8 in FRD-01.
- **Replay:** `test/fixtures/started-slot.fixture.ts` books a slot one minute after its start; `bun test test/started-slot.test.ts` fails when the booking is accepted.
- **Status:** open
