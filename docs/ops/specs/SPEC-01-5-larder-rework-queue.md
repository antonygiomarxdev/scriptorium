# SPEC-01-5: The larder example uses the rework queue

Status: Approved (2026-11-21)
Approval: content 6ppnj10dwQBw; rests on ../../requests/REQ-12-retro-gives-way-to-rework.md 083hxwQzcZIO
Rests on: ../../requests/REQ-12-retro-gives-way-to-rework.md

## Summary

The larder example drops its RETRO entry: CHECK-1 cites rework cause C-1, the replay fixture says so, and the example gets a rework queue whose C-1 names CHECK-1.

Last change: 2026-11-21, first draft

## Rows

- RW-2: The larder example keeps its CHECK-1 with a rework queue whose cause C-1 names CHECK-1 as its prevention.

## Files
| Path | Create or change | Holds |
|---|---|---|
| `examples/larder/docs/CHECKS.md` | Change | CHECK-1 cites rework cause C-1 instead of RETRO-1 |
| `examples/larder/test/fixtures/started-slot.fixture.ts` | Change | The comments name C-1 and docs/metrics/rework.md |
| `examples/larder/docs/metrics/rework.md` | Create | A queue with cause C-1, prevention CHECK-1 since 2026-11-18, no open finding |

## Reuses
- `docs/metrics/rework.md`: the queue format, copied.
- Precedent: SPEC-05-2-reuses-in-template-and-review.md, which changed text the example shows.

## Tests first
RW-2: bun scripts/cli.ts rework examples/larder prints "open: 0" and status of the example passes.

## Build
Text only, by the lead.

## Done when
`bun scripts/check.ts status examples/larder`

## Out of scope
The rework skill and history (RW-3, through the metrics PRD).

## Open questions
None.
