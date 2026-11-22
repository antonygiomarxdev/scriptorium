# SPEC-08-3: The approval fingerprint ignores formatting

Status: Approved (2026-11-21)
Approval: content Cyhd4oSU3zz-; rests on ../frd/FRD-08-adopted-documents-as-they-are.md YzEJUOZeq0Sq
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The fingerprint ignores runs of spaces, blank lines and table separator padding, and a stored fingerprint of the earlier form is still accepted, so no approved document goes stale.

Last change: 2026-11-21, history also accepts the earlier fingerprint (builder report)

## Rows

| EX-8 | RULE-3 | positive | An approved spec whose tables a formatter pads, with spaces added around the dashes of each separator row | status runs | it reports no drift |
| EX-9 | RULE-3 | negative | An approved spec where one word of a row changes | status runs | it fails with "body changed since approval" |
| EX-10 | RULE-3 | positive | A document approved before this change, with no change since | status runs | it reports no drift |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | normalize also collapses runs of spaces, drops blank lines and writes each table separator row as one form; every place that compares a stored fingerprint accepts the earlier normalize too; approve writes the new one |
| `scripts/history.ts` | Change | The search for the approval commit accepts a stored fingerprint of either form, through the same compare as drift |

## Reuses
- `scripts/drift.ts` `normalize`, `fingerprint`: change the one normalizer; keep the earlier one as the fallback compare.
- Precedent: SPEC-07-2-tp-parent-in-approve.md, which kept old callers working.

## Tests first
EX-8, EX-9, EX-10, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Keep the earlier normalize as a named function used only by the compare. Not format-gated: no document goes stale (EX-10).

## Done when
`bun test test/drift.test.ts test/check.test.ts`

## Out of scope
Any other formatter change, such as emphasis markers or wrapping.

## Open questions
None.
