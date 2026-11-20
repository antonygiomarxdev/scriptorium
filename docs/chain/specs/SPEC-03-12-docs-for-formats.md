# SPEC-03-12: Skills and readme for formats

Status: Approved (2026-11-20)
Approval: content FRokS7w4eC-M; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

Records the readme, skill and example changes already written for FRD-03: init and adopt run install, the migrate skill, the formats section, and the example pinned to format 2.

Last change: 2026-11-20, first draft

## Rows

| EX-5 | RULE-1 | positive | A folder has no docs and no .scriptorium folder | install runs, as the init skill does first | .scriptorium/config.json holds the newest format |
| EX-17 | RULE-5 | positive | The Larder example as released in 0.3.0, frozen with no pin | today's checks run on it | they pass, with warnings only |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `README.md` | Change | Migrate row, "Outside Claude Code", "Updates never break a project"; the hook runs the local tool |
| `skills/` | Change | init and adopt run install; the new migrate skill; the scriptorium skill's formats section |
| `examples/larder/.scriptorium/` | Create | config.json pinning format 2 |

## Tests first
EX-5, EX-17, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Already written by the lead; review against FRD-03 and fix any text that says bunx scriptorium.

## Done when
`bun test test/install.test.ts test/frozen-formats.test.ts`

## Out of scope
Code changes.

## Open questions
None.
