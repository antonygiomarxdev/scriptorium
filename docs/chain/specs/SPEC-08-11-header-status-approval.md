# SPEC-08-11: Only the header Status and Approval lines are left out

Status: Approved (2026-11-22)
Approval: content _GSXZ9olPO_b; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The fingerprint leaves out only the first Status line and the first Approval line above the first "## " heading; a body line that starts with those words is fingerprinted like any line.

Last change: 2026-11-21, first draft

## Rows

| EX-26 | RULE-3 | negative | An approved FRD gets the line "Approval: the owner agreed to 10 places" below its first "## " heading | status runs | it reports "body changed since approval" |
| EX-27 | RULE-3 | positive | An FRD approved before this change, with its Status and Approval lines in the header and none in the body | status runs | it reports no drift |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/drift.ts` | Change | The normalizers drop the header Status and Approval lines through `headerLine`, not every line that matches the STATUS and APPROVAL patterns |
| `test/drift.test.ts` | Change | The EX-26 and EX-27 tests |

## Reuses
- `scripts/drift.ts` `headerLine`: the rule for one header line by key; use it for Status and Approval, no second rule.
- Precedent: SPEC-08-7-links-header-only.md, SPEC-08-10-cap-skips-approval.md.

## Tests first
EX-26, EX-27, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Applies to both the new and the earlier normalize, so a document with no Status or Approval line in its body keeps its fingerprint. A document that has one in its body drifts once and needs approving again. Not format-gated.

## Done when
`bun test test/drift.test.ts`

## Out of scope
The Last change line.

## Open questions
None.
