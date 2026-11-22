# SPEC-08-5: A Links line is not part of the approval

Status: Approved (2026-11-21)
Approval: content n7HJ0OpCgIMS; rests on ../frd/FRD-08-adopted-documents-as-they-are.md WYJ57q40FnTn
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The fingerprint leaves out a header line starting with "Links:", and the docs lint fails a Links line that holds anything but markdown links to https URLs.

Last change: 2026-11-21, first draft

## Rows

| EX-12 | RULE-3 | positive | An approved PRODUCT gets the header line "Links: [Asana](https://app.asana.com/1/1/project/2/task/3)" | status runs | it reports no drift |
| EX-13 | RULE-3 | positive | A Links line holds two links, the second to https://app.asana.com/0/2/3 | the docs lint runs | it reports nothing for that line |
| EX-14 | RULE-3 | negative | A Links line says "[Asana](https://app.asana.com/0/2/3) and a slot holds 10 families" | the docs lint runs | it fails with "Links line holds text that is not a link" |
| EX-15 | RULE-3 | negative | A Links line holds "[Asana](http://example.com/x)" | the docs lint runs | it fails with "Links line holds text that is not a link" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | The line filter that leaves out the status, approval and last-change lines also leaves out a line starting with "Links:", in both the new and the earlier normalize |
| `scripts/lint-docs.ts` | Change | A line starting with "Links:" whose rest, once every `[text](https://...)` is removed, is not empty of everything but commas and spaces fails "Links line holds text that is not a link" |
| `test/drift.test.ts` | Change | The EX-12 test |

## Reuses
- `scripts/drift.ts` `IGNORED`: the filter of the status, approval and last-change lines; add the Links line there, no second filter.
- `scripts/lint-docs.ts`: its per-line checks; the Links check sits with them.
- Precedent: SPEC-08-3-fingerprint-ignores-formatting.md.

## Tests first
EX-12, EX-13, EX-14, EX-15, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Leaving the line out of the earlier normalize too keeps every stored fingerprint matching when a Links line is added to an approved document. Not format-gated: it relaxes the fingerprint, and the lint rule rejects only a misused Links line.

## Done when
`bun test test/drift.test.ts test/lint-docs.test.ts`

## Out of scope
Any other header key.

## Open questions
None.
