# SPEC-10-1: Every path a spec names is tracked or created

Status: Approved (2026-11-22)
Approval: content pss6Uva50lKN; rests on ../frd/FRD-10-specs-checked-against-code.md _9JVArVmxyzY
Rests on: ../frd/FRD-10-specs-checked-against-code.md

## Summary

The spec check fails a path in Files, Tests first or Done that is not a tracked file unless a Files row marks it Create; the rule is format 4, so Scriptorium learns format 4.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | negative | A spec has the Files row "test/restore-record.test.ts, Change" and the tracked file is test/withdraw-restore-record.test.ts | the spec check runs | it fails with "test/restore-record.test.ts is not a tracked file" |
| EX-2 | RULE-1 | positive | A spec names test/new-thing.test.ts in Tests first and has the Files row "test/new-thing.test.ts, Create" | the spec check runs | it reports nothing for that path |
| EX-3 | RULE-1 | negative | A spec names test/old.test.ts only in its Done command, and no such file is tracked | the spec check runs | it fails with "test/old.test.ts is not a tracked file" |
| EX-6 | RULE-3 | boundary | The project is pinned to format 3 and a spec names a path that is not tracked | the spec check runs | it passes and prints the failure as a warning |
| EX-7 | RULE-3 | positive | The project is pinned to the format that adds these rules and every path its specs name is tracked or created | the spec check runs | it passes with no warning |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | specFails collects the paths of Files, Tests first and Done, and fails each that git does not track and no Create row names, tagged "[format 4]" |
| `scripts/format.ts` | Change | NEWEST is 4 |
| `test/` | Change | The EX-1, EX-2, EX-3, EX-6 and EX-7 tests in check.test.ts, and the tests that name the newest format |

## Reuses
- `scripts/check.ts` `reusesFails`: how the spec check already resolves a path from the project root and fails a missing one.
- `scripts/format.ts` `gate`: a "[format n]" failure is a warning below the pin.
- Precedent: SPEC-05-1-reuses-check.md.

## Tests first
EX-1, EX-2, EX-3, EX-6, EX-7, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Tracked files come from one git ls-files call per spec check. Outside a git repository the rule reports nothing.

## Done when
`bun test test/check.test.ts test/format.test.ts`

## Out of scope
The Build block and the Reuses section, which SPEC-10-2 and SPEC-05-1 own.

## Open questions
None.
