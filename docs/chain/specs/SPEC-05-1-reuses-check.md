# SPEC-05-1: The spec check reads the Reuses section

Status: Approved (2026-11-20)
Approval: content asPgdlpMb-ht; rests on ../frd/FRD-05-reuse-before-new.md WBOgLz46SVBN
Rests on: ../frd/FRD-05-reuse-before-new.md

## Summary

checkSpec gains the Reuses rules, tagged format 3, and format 3 becomes the newest format.

Last change: 2026-11-20, first draft

## Rows

| EX-1 | RULE-2 | positive | A spec's Reuses section has "`scripts/paths.ts` `typed`" and that file defines typed | the spec check runs | it passes |
| EX-2 | RULE-1 | negative | A spec has no Reuses section | the spec check runs | it fails with "no Reuses section: name the code and the precedent spec it builds on, or Nothing to reuse: <reason>" |
| EX-3 | RULE-2 | negative | A spec's Reuses section has "`scripts/nope.ts` `run`" and that file does not exist | the spec check runs | it fails with "Reuses: scripts/nope.ts does not exist" |
| EX-4 | RULE-2 | negative | A spec's Reuses section has "`scripts/paths.ts` `nothere`" | the spec check runs | it fails with "Reuses: nothere is not in scripts/paths.ts" |
| EX-5 | RULE-1 | positive | A spec's Reuses section says "Nothing to reuse: the first script that reads the host's notebook format" | the spec check runs | it passes |
| EX-6 | RULE-1 | negative | A spec's Reuses section says "Nothing to reuse." | the spec check runs | it fails with "Reuses: say why there is nothing to reuse" |
| EX-7 | RULE-2 | negative | A spec's Reuses section has "Precedent: SPEC-09-1-gone.md" and no such spec exists | the spec check runs | it fails with "Reuses: precedent SPEC-09-1-gone.md does not exist" |
| EX-8 | RULE-2 | boundary | A Reuses entry names a file in the test folder | the spec check runs | it passes: tests are code a spec can build on |
| EX-10 | RULE-4 | positive | A format 2 project and a spec with no Reuses section | the spec check runs | it passes and prints "WARN (format 3):" with the EX-2 line |
| EX-11 | RULE-4 | negative | The same spec in a format 3 project | the spec check runs | it fails with the EX-2 line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | checkSpec reads `## Reuses`: each backticked path exists under the project root and holds the backticked name after it; a `Precedent:` spec exists in a specs folder; "Nothing to reuse:" needs text after it; failures tagged "[format 3] " |
| `scripts/format.ts` | Change | NEWEST is 3 |

## Reuses
- `scripts/format.ts` `gate`: tags a failure with its format, as SPEC-03-2 did for format 2.
- `scripts/paths.ts` `typed`: reads a listed path with either slash.
- Precedent: SPEC-03-2-gate-spec-rules.md, which added format 2 rules to checkSpec.

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, EX-6, EX-7, EX-8, EX-10, EX-11, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
A name is found when the file text contains it as a whole word. Existing tests that assume NEWEST is 2 change with the tester, not the builder.

## Done when
`bun test test/check.test.ts test/format.test.ts`

## Out of scope
The review rule (SPEC-05-2); migrating this repository to format 3.

## Open questions
None.
