# SPEC-08-9: A quoted row is compared with its cells trimmed

Status: Approved (2026-11-21)
Approval: content x5RPGZBqdlip; rests on ../frd/FRD-08-adopted-documents-as-they-are.md m4Xr-BfH5eG6
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The spec check finds a quoted row in its parent when every cell matches once the spaces around it are trimmed; the text inside each cell must still match exactly.

Last change: 2026-11-21, first draft

## Rows

| EX-22 | RULE-3 | positive | A spec quotes a row of its FRD, and a formatter has padded the cells of the FRD table, so the spaces around the cells differ | the spec check runs | it finds the quoted row |
| EX-23 | RULE-3 | negative | A spec quotes a row of its FRD with one word changed inside a cell | the spec check runs | it fails with "quoted row not found verbatim" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | The quoted-row lookup ("quoted row not found verbatim") compares rows cell by cell, each cell trimmed |
| `test/check.test.ts` | Change | The EX-22 and EX-23 tests |

## Reuses
- `scripts/check.ts` `cells`: splits a table row into its cells; use it on both rows, no second splitter.
- Precedent: SPEC-08-3-fingerprint-ignores-formatting.md, which leaves table padding out of the fingerprint.

## Tests first
EX-22, EX-23, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Only the spaces around a cell are trimmed; runs of spaces inside a cell still count. Not format-gated: it relaxes a check.

## Done when
`bun test test/check.test.ts`

## Out of scope
The fingerprint, which already ignores padding.

## Open questions
None.
