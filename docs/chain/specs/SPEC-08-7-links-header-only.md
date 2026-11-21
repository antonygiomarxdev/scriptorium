# SPEC-08-7: Only the first Links line of the header is left out

Status: Approved (2026-11-21)
Approval: content GjMgHtsOPeD1; rests on ../frd/FRD-08-adopted-documents-as-they-are.md aNNKSmp8IORy
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The fingerprint and the line cap leave out only the first line starting with "Links:" above the first "## " heading; a Links line in the body or a second one in the header is counted and fingerprinted like any line.

Last change: 2026-11-21, first draft

## Rows

| EX-18 | RULE-3 | negative | An approved PRODUCT gets "Links: [Asana](https://app.asana.com/0/2/3)" as a line below its first "## " heading | status runs, and the docs lint runs on a copy at its cap | status reports "body changed since approval", and the line counts toward the cap |
| EX-19 | RULE-3 | negative | An approved PRODUCT has one Links line in its header and gets a second one there | status runs | it reports "body changed since approval" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | `IGNORED` keeps the Last change line; the first Links line above the first "## " heading is dropped once, in both the new and the earlier normalize |
| `scripts/lint-docs.ts` | Change | The cap total leaves out the same one line, using the same rule as drift.ts |
| `test/drift.test.ts` | Change | The EX-18 and EX-19 tests |

## Reuses
- `scripts/drift.ts` `IGNORED` and the normalize it feeds: the one place that decides which line is left out; export a helper there and call it from the cap total, no second rule.
- Precedent: SPEC-08-5-links-line.md, SPEC-08-6-cap-skips-links.md.

## Tests first
EX-18, EX-19, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
A document approved with one Links line in its header keeps its fingerprint, since that line was left out before and still is. Not format-gated.

## Done when
`bun test test/drift.test.ts test/lint-docs.test.ts`

## Out of scope
The Last change line, the link text.

## Open questions
None.
