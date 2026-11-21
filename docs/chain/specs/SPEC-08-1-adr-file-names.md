# SPEC-08-1: An ADR is found as NNNN-name.md too

Status: Approved (2026-11-21)
Approval: content exNwY9Ng_jKL; rests on ../frd/FRD-08-adopted-documents-as-they-are.md rwGRMj9NyHJQ
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The TP check and the docs lint find an ADR file named ADR-NNNN-name.md or NNNN-name.md, so an adopting project keeps its file names.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | positive | A TP says "ADR: ADR-0021" and docs/adr/0021-baselines.md exists | the TP check runs | it passes |
| EX-2 | RULE-1 | negative | A TP says "ADR: ADR-0021" and only docs/adr/00210-x.md exists | the TP check runs | it fails with "ADR-0021 has no file" |
| EX-3 | RULE-1 | positive | docs/adr/0021-baselines.md is 90 lines and the config has no legacyAdrsThrough | the docs lint runs | it fails with "ADR is 90 lines, over its cap of 80" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | The ADR file match for a cited ADR-<id> accepts `ADR-<id>-*.md` and `<id>-*.md`, the dash after the id kept; the TP command's ADR file list takes both |
| `scripts/lint-docs.ts` | Change | The kind rule treats `adr/<digits>-*.md` as ADR, as it does `adr/ADR-*` |

## Reuses
- `scripts/check.ts`: the ADR file match SPEC-07-1 wrote; widen it, do not add a second one.
- `scripts/lint-docs.ts` `CAPS`: the ADR cap stays 80.
- Precedent: SPEC-07-1-tp-cites-its-parent.md, which read ADR ids whole.

## Tests first
EX-1, EX-2, EX-3, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
One pattern for both names, written once per file. Not a format-gated rule: it removes false failures.

## Done when
`bun test test/check.test.ts test/lint-docs.test.ts`

## Out of scope
The cap waiver (SPEC-08-2).

## Open questions
None.
