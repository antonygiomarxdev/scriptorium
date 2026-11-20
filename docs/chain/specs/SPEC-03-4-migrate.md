# SPEC-03-4: Migrate one format

Status: Approved (2026-11-20)
Approval: content U-Yrhu3PjPm-; rests on ../frd/FRD-03-formats-migrate-cli.md aIObYriuLtbi
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

A dry run that lists what fails under the next format and the rewrites it would make; with apply, the mechanical rewrites and the pin moved only when the next format passes.

Last change: 2026-11-20, first draft

## Rows

| EX-10 | RULE-3 | positive | A format 1 project has SPEC-01-x.md with no Rests on line and TP-01-x.md beside it | migrate runs without apply | it lists "add Rests on: ../tp/TP-01-x.md to SPEC-01-x.md" and no file changes |
| EX-11 | RULE-3 | positive | The only format 2 failure of a format 1 project is that missing Rests on line | migrate runs with apply | the line is written under the Status line, the pin becomes 2, and status passes under format 2 |
| EX-12 | RULE-3 | negative | A format 1 project also has a spec with three tasks | migrate runs with apply | the Rests on line is written, the pin stays 1, and the output lists the spec to split with the migrate skill |
| EX-13 | RULE-3 | boundary | The pin is 2 and the newest format is 2 | migrate runs | it prints "nothing to migrate: format 2 is the newest" and no file changes |
| ST-1 | Format 1 to format 2 by migrate when format 2 passes | Yes, and only the pin and the mechanical rewrites change |
| ST-2 | Format 2 to format 1 | No: migration is one-way |
| ST-3 | Format 1 to format 3 in one step | No: one format at a time |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/migrate.ts` | Create | `plan(root)` (failures under pin + 1 and rewrites), `apply(root)`; the 1 to 2 rewrite: a spec's Rests on from its TP sibling, written under its Status line |
| `scripts/check.ts` | Change | `migrate [root] [--apply]` in the CLI |

## Tests first
EX-10, EX-11, EX-12, EX-13, ST-1, ST-2, ST-3, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
One format per run; never lowers the pin; a dry run writes nothing.

## Done when
`bun test test/migrate.test.ts`

## Out of scope
Splitting a spec, which the migrate skill does.

## Open questions
None.
