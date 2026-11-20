# SPEC-02-4: Spec caps, excerpt and done

Status: Approved (2026-11-20)
Approval: content b6nUgEA0FdiO; rests on ../frd/FRD-02-small-specs-states.md P51qy6LO9pYx
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

A spec fits one run (80 lines, 3 files, one command); excerpt prints rows for quoting; done runs the command of an approved spec.

Last change: 2026-11-20, first draft

## Rows

| EX-7 | RULE-2 | positive | An FRD defines EX-4 and EX-5 | excerpt is asked for EX-5 and EX-4 | the EX-5 row prints, then the EX-4 row, byte for byte |
| EX-8 | RULE-2 | negative | An FRD defines no EX-9 | excerpt is asked for EX-9 | it fails and names EX-9 |
| EX-9 | RULE-3 | positive | A spec has 80 lines and 3 rows in Files | the check runs | it passes |
| EX-10 | RULE-3 | negative | A spec has 4 rows in Files | the check runs | it fails with "4 files, over 3" |
| EX-11 | RULE-3 | negative | A spec's Done when holds two commands | the check runs | it fails with "Done when needs exactly one command" |
| EX-12 | RULE-4 | positive | An approved spec's Done when is a command that exits 0 | done runs | it exits 0 |
| EX-13 | RULE-4 | negative | A spec is a draft | done runs | it fails with "not approved" and the command does not run |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | Caps in checkSpec, the excerpt and done commands |
| `scripts/lint-docs.ts` | Change | SPEC cap 80; the copy check skips Rows |

## Tests first
EX-7, EX-8, EX-9, EX-10, EX-11, EX-12, EX-13, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
`check.ts excerpt <file> <ID>...` and `check.ts done <spec>`; done runs the command through the shell in the current folder.

## Done when
`bun test test/check.test.ts test/lint-docs.test.ts`

## Out of scope
Running done from a hook: no hook runs it.

## Open questions
None.
