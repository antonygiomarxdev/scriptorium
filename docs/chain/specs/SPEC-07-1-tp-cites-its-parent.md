# SPEC-07-1: The TP check reads what the TP rests on

Status: Approved (2026-11-21)
Approval: content b_xjt-gfxaDb; rests on ../frd/FRD-07-tp-on-request.md iWE6ErQcSy7r
Rests on: ../frd/FRD-07-tp-on-request.md

## Summary

checkTp reads the TP's Rests on line: a request gives the Decision ids to cite, a registry gives its row ids, no line keeps the FR-id rule; ADR ids are read whole.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | positive | A TP rests on an accepted REQ-6 whose Decision has "- CI-1: ..." and the TP cites CI-1 | the TP check runs | it passes with no "cites no FR id" line |
| EX-2 | RULE-1 | negative | The same TP cites no id of REQ-6 | the TP check runs | it fails with "cites no id of REQ-6's Decision" |
| EX-3 | RULE-1 | negative | The TP cites CI-9 and REQ-6's Decision defines CI-1 and CI-2 | the TP check runs | it fails with "cites CI-9, not in REQ-6's Decision" |
| EX-4 | RULE-1 | negative | REQ-6's Decision is prose with no ids | the TP check runs | it fails with "REQ-6: give each decision an id (CI-1, CI-2) so the TP can cite it" |
| EX-5 | RULE-1 | positive | A TP rests on docs/CHECKS.md and cites CHECK-2, a row of it | the TP check runs | it passes |
| EX-6 | RULE-1 | boundary | A TP with no Rests on line cites FR-CHAIN-01-1 | the TP check runs | it is checked against FR ids as today and passes |
| EX-9 | RULE-3 | positive | A TP says "ADR: ADR-0029" and docs/adr/ADR-0029-ci.md exists | the TP check runs | it passes |
| EX-10 | RULE-3 | negative | A TP says "ADR: ADR-0029" and no ADR-0029 file exists | the TP check runs | it fails with "ADR-0029 has no file", the id whole |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | checkTp takes the TP's path: with a Rests on request, the ids are the "- ID-n:" lines of its Decision section; with a registry, the first cell of its table rows; without, FR ids as today. `ADR-\d{3,}`; an ADR file matches `ADR-<id>-*.md` |

## Reuses
- `scripts/check.ts` `restsOn`: reads the Rests on line, as checkSpec does.
- `scripts/check.ts` `section`: reads the Decision section.
- Precedent: SPEC-02-3-spec-parent-and-quotes.md, which made the spec check read its parent.

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, EX-6, EX-9, EX-10, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The tp command passes the TP path so the parent resolves relative to it. Not a format-gated rule: it fixes false failures.

## Done when
`bun test test/check.test.ts`

## Out of scope
Approval and status (SPEC-07-2).

## Open questions
None.
