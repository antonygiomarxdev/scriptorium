# SPEC-02-3: Spec parent and quoted rows

Status: Approved (2026-11-20)
Approval: content 5tmrs0QAJ8_I; rests on ../frd/FRD-02-small-specs-states.md P51qy6LO9pYx
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

A spec names its parent with Rests on, its quoted rows are found verbatim, and its tests are exactly those rows.

Last change: 2026-11-20, first draft

## Rows

| EX-1 | RULE-1 | positive | A spec says "Rests on: ../../CHECKS.md" and that file exists | the check runs | the parent passes as approved |
| EX-2 | RULE-1 | negative | A spec has no Rests on line | the check runs | it fails with "no Rests on line" |
| EX-3 | RULE-1 | negative | A spec says "Rests on: ../tp/TP-09-x.md" and no such file exists | the check runs | it fails and names ../tp/TP-09-x.md |
| EX-4 | RULE-2 | positive | A spec quotes the EX-4 row of its FRD exactly | the check runs | the quote passes |
| EX-5 | RULE-2 | negative | A spec quotes the EX-4 row with "5 places" changed to "6 places" | the check runs | it fails with "quoted row not found" and names the row |
| EX-6 | RULE-2 | negative | Rows hold EX-4 and EX-5 and Tests first names EX-4 only | the check runs | it fails and names EX-5 |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | checkSpec and the spec parent in chainStatus |
| `scripts/hook-doc-check.ts` | Change | The spec check call |

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, EX-6, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
checkSpec reads the Rests on and Quoted from files relative to the spec; the old rule that one spec covers every FRD id goes.

## Done when
`bun test test/check.test.ts test/hooks.test.ts`

## Out of scope
Caps, excerpt and done (SPEC-02-4).

## Open questions
None.
