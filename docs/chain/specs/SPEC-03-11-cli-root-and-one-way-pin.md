# SPEC-03-11: The CLI reads the document's project, and the pin only goes up

Status: Approved (2026-11-20)
Approval: content 1-rh95fQ424x; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

A subcommand given a document reads the pin of that document's project, wherever it runs from. Pre-commit blocks a staged pin lower than HEAD's.

Last change: 2026-11-20, first draft

## Rows

| EX-24 | RULE-5 | negative | A project pinned to format 9, and the tool started from another folder | the spec command runs on a document of that project | it exits 1 with the update message |
| EX-26 | RULE-3 | negative | HEAD pins format 2 and a commit stages .scriptorium/config.json pinning format 1 | pre-commit runs | it is blocked: migration is one-way |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/cli.ts` | Change | Every path argument maps to its project root, not only .md paths |
| `scripts/pre-commit.ts` | Change | A staged .scriptorium/config.json with a lower format than HEAD's fails the commit |

## Tests first
EX-24, EX-26, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Read HEAD's pin with git show HEAD:.scriptorium/config.json through the runtime with arguments; no HEAD pin means format 1.

## Done when
`bun test test/cli.test.ts test/hooks.test.ts`

## Out of scope
Downgrades made outside git.

## Open questions
None.
