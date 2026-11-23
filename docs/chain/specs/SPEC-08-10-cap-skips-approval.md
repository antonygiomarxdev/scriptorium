# SPEC-08-10: The line cap leaves out the Approval line

Status: Approved (2026-11-22)
Approval: content CMytYoKPpBNv; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The line total the docs lint holds to a cap leaves out the first "Approval:" line above the first "## " heading, as it leaves out the Links line.

Last change: 2026-11-21, first draft

## Rows

| EX-24 | RULE-3 | boundary | A draft spec of 80 lines, its cap, is approved, and approve adds its "Approval:" line, so it has 81 lines | the docs lint runs | it reports no cap failure |
| EX-25 | RULE-3 | negative | An approved spec of 81 lines with its "Approval:" line gets one more content line | the docs lint runs | it fails "SPEC is 81 lines, over its cap of 80" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | A helper beside `linksLine` finds the first header line with a given key above the first "## " heading; `linksLine` uses it |
| `scripts/lint-docs.ts` | Change | The cap total also leaves out the header Approval line found by that helper |
| `test/lint-docs.test.ts` | Change | The EX-24 and EX-25 tests |

## Reuses
- `scripts/drift.ts` `linksLine`: the rule for the one header line; generalize it by key, no second rule.
- Precedent: SPEC-08-6-cap-skips-links.md, SPEC-08-7-links-header-only.md.

## Tests first
EX-24, EX-25, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The fingerprint already leaves out the Approval line; only the cap changes. Not format-gated: it relaxes the cap by one header line.

## Done when
`bun test test/lint-docs.test.ts test/drift.test.ts`

## Out of scope
The Status line, which a draft already has.

## Open questions
None.
