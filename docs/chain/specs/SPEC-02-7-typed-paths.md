# SPEC-02-7: The other scripts and typed paths

Status: Draft
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

Records the three scripts SPEC-02-6 left out but the EX-25 scan covers, and fixes a regression it caused: a path a person typed (a "Summary unchanged" waiver) must match with either slash on every system, through a helper in scripts/paths.ts, not toPosix.

Last change: 2026-11-20, first draft

## Rows

| EX-24 | RULE-7 | positive | A spec says "Rests on: ..\tp\TP-01-x.md" and that file exists | the check runs on Windows and on Linux | the parent resolves on both |
| EX-25 | RULE-7 | negative | A script tests the operating system, or turns backslashes into slashes outside the one path helper | the tests run | they fail and name the script and line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/paths.ts` | Change | `typed(p)`: a path a person typed, backslashes read as slashes; `fromDoc` uses it |
| `scripts/summary-diff.ts` | Change | Waiver targets through `typed` |
| `scripts/hook-doc-check.ts` | Change | Paths through `toPosix` |

## Tests first
EX-24, EX-25, written before the code: a waiver naming `docs\\chain\\PRD.md` matches `docs/chain/PRD.md` on Windows and Linux.

## Build
`typed` lives in `scripts/paths.ts`, the only file the EX-25 scan spares.

## Done when
`bun run test`

## Out of scope
The changes to scripts/check.ts, made under SPEC-02-5.

## Open questions
None.
