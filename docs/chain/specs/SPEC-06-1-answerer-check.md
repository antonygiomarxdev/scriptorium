# SPEC-06-1: The check reads who answers each question

Status: Approved (2026-11-21)
Approval: content k7gxJJ6KEdJU; rests on ../frd/FRD-06-who-answers.md JFJj2H12kMt8
Rests on: ../frd/FRD-06-who-answers.md

## Summary

One function checks the Q-n lines of an Open questions section, run by the PRD, FRD, UX, TP and spec checks, tagged format 3.

Last change: 2026-11-21, Files and Reuses match the build

## Rows

| EX-1 | RULE-1 | positive | A draft FRD has "- Q-1 (Research): where the 42-day limit comes from" | the document check runs | it passes |
| EX-2 | RULE-1 | negative | A draft FRD has "- Q-1: where the limit comes from" | the document check runs | it fails with "Q-1: say who answers it: (Owner: <reason>), (Research) or (Lead)" |
| EX-3 | RULE-1 | positive | A draft PRD has "- Q-2 (Owner: a product goal): the adoption target" | the document check runs | it passes |
| EX-4 | RULE-1 | negative | A draft PRD has "- Q-2 (Owner): the adoption target" | the document check runs | it fails with "Q-2: say why only the owner can answer it" |
| EX-5 | RULE-1 | positive | A draft spec has "- Q-3 (Lead): which file holds the map" | the document check runs | it passes |
| EX-6 | RULE-1 | boundary | A document's Open questions section says "None." | the document check runs | it passes |
| EX-9 | RULE-3 | positive | A format 2 project and the FRD of EX-2 | the document check runs | it passes and prints "WARN (format 3):" with the EX-2 line |
| EX-10 | RULE-3 | negative | The same FRD in a format 3 project | the document check runs | it fails with the EX-2 line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | `answererFails(text, prefix)`: prefix is the file name a folder check puts first; each "Q-n" line in the Open questions section needs "(Owner: <reason>)", "(Research)" or "(Lead)" after its id; failures tagged "[format 3] "; called from checkPrd, checkFrd, checkUx, checkTp and checkSpec |

## Reuses
- `scripts/check.ts` `section`: reads the Open questions section, as the status rule at line 392 does.
- The "[format 3] " tag written as reusesFails writes it (SPEC-05-1).
- Precedent: SPEC-05-1-reuses-check.md, the other format 3 rule in checkSpec.

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, EX-6, EX-9, EX-10, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
One function, called from each check; no copy per document kind.

## Done when
`bun test test/check.test.ts`

## Out of scope
The skill steps (SPEC-06-2).

## Open questions
None.
