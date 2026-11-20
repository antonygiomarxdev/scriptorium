# SPEC-02-1: Require a changeset in pre-commit

Status: Draft
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

The pre-commit rule that fails a code change staged without a changeset, only where the project uses Changesets.

Last change: 2026-11-20, first draft

## Rows

| EX-17 | RULE-6 | negative | The project has a changesets configuration and a commit stages scripts/check.ts only | pre-commit runs | it fails and says to add a changeset |
| EX-18 | RULE-6 | positive | The same commit also stages a new changeset file | pre-commit runs | it passes |
| EX-19 | RULE-6 | boundary | A commit stages only documents and tests | pre-commit runs | it passes without a changeset |
| EX-20 | RULE-6 | boundary | The project has no changesets configuration | pre-commit runs on a code change | the rule does not apply |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/pre-commit.ts` | Change | The changeset rule on the staged path |

## Tests first
EX-17, EX-18, EX-19, EX-20, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
An exported pure function from the staged paths and whether a changesets configuration exists to a list of failures, called on the staged path only.

## Done when
`bun test test/hooks.test.ts`

## Out of scope
Checking the bump type of the changeset.

## Open questions
None.
