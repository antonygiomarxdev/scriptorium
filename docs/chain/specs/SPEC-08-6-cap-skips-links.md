# SPEC-08-6: The line cap leaves out the Links line

Status: Approved (2026-11-21)
Approval: content 0ntakjs1Kmli; rests on ../frd/FRD-08-adopted-documents-as-they-are.md WYJ57q40FnTn
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The line count the docs lint holds to a cap leaves out a header line starting with "Links:".

Last change: 2026-11-21, first draft

## Rows

| EX-16 | RULE-3 | boundary | A UX document of 150 lines, its cap, gets a "Links:" header line, so it has 151 lines | the docs lint runs | it reports no cap failure |
| EX-17 | RULE-3 | negative | A UX document of 150 lines with a "Links:" header line gets one more content line, so it has 152 lines | the docs lint runs | it fails "UX is 151 lines, over its cap of 150" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/lint-docs.ts` | Change | The line total held to the cap does not count a line starting with "Links:" |
| `test/lint-docs.test.ts` | Change | The EX-16 and EX-17 tests |

## Reuses
- `scripts/lint-docs.ts`: the cap check ("over its cap of") and its line total; count there, no second cap check.
- Precedent: SPEC-08-5-links-line.md.

## Tests first
EX-16, EX-17, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Only the cap total changes: the per-line checks still read the Links line. Not format-gated: it relaxes the cap by one header line.

## Done when
`bun test test/lint-docs.test.ts`

## Out of scope
Status, Approval and other header lines, which still count.

## Open questions
None.
