# SPEC-01-3: Say it in two languages

Status: Draft
Rests on: ../tp/TP-01-book-a-slot.md

## Summary

The confirmation and every refusal, in English and Spanish, with the slot's day and time. Third of four runs.

Last change: 2026-11-20, split from the single booking spec into one spec per agent run

## Rows
Quoted from: ../frd/FRD-01-book-a-slot.md

| EX-9 | RULE-4 | positive | The Perez family uses Spanish and has no booking that week | It books Wednesday 2026-11-25 10:00 | The message reads "Reserva confirmada: miércoles 25 de noviembre, 10:00" |
| EX-10 | RULE-4 | negative | The Perez family uses Spanish and holds a booking for that week | It books another slot | The message reads "Solo una reserva por semana" and no English text appears |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `src/pickups/messages.ts` | Create | The English and Spanish messages |

## Tests first
EX-9, EX-10, in `test/messages.test.ts`.

## Build
```ts
export function message(refusal: Refusal | "confirmed", language: "en" | "es", slot?: Date): string;
```

## Done when
`bun test test/messages.test.ts`

## Out of scope
The screens (UX-01 gets its own spec when its design is approved).

## Open questions
None.
