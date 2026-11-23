# SPEC-08-8: Status lists an ADR below the cutoff as legacy

Status: Approved (2026-11-21)
Approval: content DGIGCP5eCSi0; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

Status lists an ADR numbered at or below legacyAdrsThrough with the status "legacy" and never fails it for its status line; an ADR above the cutoff is checked as today.

Last change: 2026-11-21, first draft

## Rows

| EX-20 | RULE-2 | positive | The config says "legacyAdrsThrough": 28 and docs/adr/ADR-0012-x.md has no Status section, only the line "- **Estado:** Aceptada" | status runs | it lists ADR-0012 as legacy and reports no failure for it |
| EX-21 | RULE-2 | boundary | The same config and docs/adr/ADR-0029-x.md has no Status section | status runs | it fails with "ADR status \"missing\" is not Proposed, Accepted, Superseded or Rejected" for ADR-0029, as today |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | chainStatus gives an ADR at or below the cutoff the status "legacy" and skips the status-line failure for it |
| `test/check.test.ts` | Change | The EX-20 and EX-21 tests |

## Reuses
- `scripts/format.ts` `legacyAdrsThrough`: the cutoff, read from the project root that chainStatus already has.
- `scripts/check.ts` `adrNumber`: the ADR number from either file name.
- Precedent: the legacy branch of the tp command in scripts/check.ts.

## Tests first
EX-20, EX-21, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Only status changes; the tp command already refuses a cited legacy ADR that says it is not accepted. Not format-gated: it relaxes a check.

## Done when
`bun test test/check.test.ts`

## Out of scope
The tp command and the docs lint, which already exempt such an ADR.

## Open questions
None.
