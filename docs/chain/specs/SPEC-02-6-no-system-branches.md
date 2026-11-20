# SPEC-02-6: No branch on the system

Status: Approved (2026-11-20)
Approval: content GjP9lZ7V5tRN; rests on ../frd/FRD-02-small-specs-states.md P51qy6LO9pYx
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

Every script converts paths through the one helper of SPEC-02-5, and a test keeps it that way: it fails on a platform test or a hand-made backslash replace anywhere else.

Last change: 2026-11-20, first draft

## Rows

| EX-25 | RULE-7 | negative | A script tests the operating system, or turns backslashes into slashes outside the one path helper | the tests run | they fail and name the script and line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | `rel` through `toPosix` |
| `scripts/lint-docs.ts` | Change | `rel` through `toPosix` |
| `scripts/pre-commit.ts` | Change | `rel` through `toPosix` |

## Tests first
EX-25, written before the code: a test reads every file in `scripts/` and fails, naming file and line, on `process.platform`, `os.platform`, `cmd /c`, or a backslash-to-slash replace outside `scripts/paths.ts`.

## Build
Replace each hand-made `replaceAll("\\", "/")` or `replace(/\\/g, "/")` with `toPosix`.

## Done when
`bun run test`

## Out of scope
Paths that git prints, which already use slashes.

## Open questions
None.
