# Cross-cutting concerns

Every FRD answers each row: applies (how) or "n/a: <reason>".

| ID | Concern | Rule | Check |
|---|---|---|---|
| CC-1 | Security | A family reads and changes only its own bookings; every request is checked against the signed-in family. | `bun test test/access.test.ts` sends each request as another family and expects "not found" |
| CC-2 | Privacy | A screen shows a family's name only to that family and to volunteers at the door; logs hold no names. | `bun test test/logs.test.ts` scans a day of logs for family names |
| CC-3 | Accessibility | Every action works by keyboard and screen reader; text contrast is at least 4.5 to 1. | `bun run a11y` runs the automated audit on every screen |
| CC-4 | Languages | Every message exists in English and Spanish; a family sees its own language. | `bun test test/messages.test.ts` fails when a key has no Spanish text |
| CC-5 | Performance budget | A screen shows its data in under 1 s at p95 on a mid-range phone with 200 slots. | `bun run perf` runs the budget test in the end-to-end suite |
