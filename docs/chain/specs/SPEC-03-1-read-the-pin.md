# SPEC-03-1: Read the pin

Status: Approved (2026-11-20)
Approval: content PKCimoSfm15g; rests on ../frd/FRD-03-formats-migrate-cli.md aIObYriuLtbi
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

Read the project's format from .scriptorium/config.json beside docs/, format 1 when missing; report a pin the tool does not know or cannot read.

Last change: 2026-11-20, first draft

## Rows

| EX-3 | RULE-1 | negative | The config holds {"format": 9} and the tool knows formats up to 2 | the command-line tool and the edit hook run | the tool exits 1 with "this project uses format 9; this Scriptorium knows up to 2: update Scriptorium", and the hook passes with the same warning |
| EX-4 | RULE-1 | negative | The config holds {"format": "two"} | the command-line tool runs | it exits 1 and names .scriptorium/config.json |
| DT-1 | yes | any | Command-line tool exits 1, hooks warn: update Scriptorium |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/format.ts` | Create | `NEWEST`, `readFormat(root)` (1 when missing, an error for a bad file), `gate(failures, pin)` splitting tagged failures into fails and `WARN (format N):` warnings |
| `scripts/check.ts` | Change | The CLI exits 1 on an unknown or bad pin |
| `scripts/hook-doc-check.ts` | Change | The hooks warn on an unknown pin and pass |

## Tests first
EX-3, EX-4, DT-1, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
A failure is tagged with the format that introduced it; untagged failures are format 1. Reading the pin uses the project root the checks already find (the folder holding docs/).

## Done when
`bun test test/format.test.ts test/hooks.test.ts`

## Out of scope
Tagging the rules themselves (SPEC-03-2, SPEC-03-3).

## Open questions
None.
