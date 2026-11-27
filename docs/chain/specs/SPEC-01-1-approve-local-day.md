# SPEC-01-1: Approve stamps the local day

Status: Approved (2026-11-26)
Approval: content aCGjLGVmJZXc; rests on ../frd/FRD-01-drift-trace-history.md ARVnO3EuD2Rz
Rests on: ../frd/FRD-01-drift-trace-history.md

## Summary

Both `approve` commands take their default date from one helper that reads the machine's local day, and `drift.ts approve` takes `--date` as `check.ts approve` does. It answers REQ-33; a time zone setting is not built.

Last change: 2026-11-26, first draft

One spec is one agent run: at most 80 lines, 3 files and one done command. Too big: split it into another spec, never add context. A spec decides nothing new.

## Rows

| EX-33 | RULE-2 | negative | The machine's clock reads 20:00 on 2026-11-26 at UTC-6, which is 02:00 on 2026-11-27 in UTC, and a PRD in draft rests on ../PRODUCT.md | the owner approves it with no date given | line 1 reads "Status: Approved (2026-11-26)", the local day, not the UTC day |
| EX-34 | RULE-2 | positive | A PRD in draft rests on ../PRODUCT.md and the clock reads 2026-11-27 | the owner approves it with the date 2026-11-20 given, by either command | line 1 reads "Status: Approved (2026-11-20)" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | One exported helper that returns the machine's local day as YYYY-MM-DD, and `approve` on its command line taking `--date` and defaulting to that helper (EX-33, EX-34) |
| `scripts/check.ts` | Change | `approve` defaulting its date to that helper instead of the UTC day (EX-33, EX-34) |
| `test/drift.test.ts` | Change | The EX-33 and EX-34 tests, run with the time zone set six hours behind UTC in a child process (EX-33, EX-34) |
| `test/check.test.ts` | Change | The EX-33 test of the check.ts default date, in the same child process and time zone (EX-33) |

## Reuses
- `scripts/drift.ts` `approve`: the function both commands already call; only the default date changes.
- `scripts/check.ts` `opt`: how `--date` is already read; `drift.ts` reads it the same way.
- Precedent: SPEC-11-3-diagram-practices.md, a small spec on this chain.

## Tests first
EX-33, EX-34, written before the code, without it in view. The test of EX-33 runs the command in a child process with the time zone set six hours behind UTC and the clock set to 02:00 UTC on 2026-11-27, and fails before the fix because the line reads 2026-11-27.

## Build
One exported function in `scripts/drift.ts` that reads the local year, month and day from the machine's clock; both commands call it for the default date. No new setting.

## Done when
`bun test test/drift.test.ts test/check.test.ts`

## Out of scope
A time zone key in the project configuration (REQ-33). Dates that other scripts write, such as the weekly buckets of the rework report.

## Open questions
None.
