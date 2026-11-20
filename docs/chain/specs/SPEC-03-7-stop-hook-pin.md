# SPEC-03-7: The stop hook warns on an unknown pin

Status: Approved (2026-11-20)
Approval: content bhzF3UZRNx32; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

Records the stop hook change SPEC-03-1 needed and did not list: the stop hook spawns check.ts, which now exits 1 on an unknown pin, so the stop hook must turn that into a warning, not a block. Adds the test it lacks.

Last change: 2026-11-20, first draft

## Rows

| EX-3 | RULE-1 | negative | The config holds {"format": 9} and the tool knows formats up to 2 | the command-line tool and the edit hook run | the tool exits 1 with "this project uses format 9; this Scriptorium knows up to 2: update Scriptorium", and the hook passes with the same warning |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/hook-stop.ts` | Change | An unknown pin is a warning on stderr and exit 0 |

## Tests first
EX-3, written before the code: the stop hook in a project pinned to format 9 exits 0 and prints the update warning.

## Build
Already built under task 50; only the test is missing.

## Done when
`bun test test/hooks.test.ts`

## Out of scope
The edit hook, covered by SPEC-03-1.

## Open questions
None.
