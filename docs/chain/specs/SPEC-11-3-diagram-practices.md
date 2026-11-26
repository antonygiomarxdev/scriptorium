# SPEC-11-3: One page of diagram practices, linked from the skills

Status: Approved (2026-11-26)
Approval: content Wx7Au6X19Myl; rests on ../frd/FRD-11-diagrams.md qfR-j-oUKtrv
Rests on: ../frd/FRD-11-diagrams.md

## Summary

skills/scriptorium/diagrams.md holds the diagram practices, and the tp, ux, frd, prd and scriptorium skills link it; PRODUCT and PRD keep a diagram optional.

Last change: 2026-11-22, first draft

## Rows

| FR-CHAIN-11-5 | always | The skills for PRODUCT, PRD, FRD, UX, TP, spec, fix and adopt shall always link the page of diagram practices, which keeps a diagram optional in PRODUCT and PRD. Example: the spec skill links it at "Write each spec". |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `skills/scriptorium/diagrams.md` | Create | Where a diagram is required, which type answers which question, size, renderable syntax, cited ids |
| `skills/` | Change | The tp, ux, frd (writing-rules), prd and scriptorium skills link diagrams.md |
| `test/install.test.ts` | Change | A test that the page exists, names the five types and the 15-node limit, and that each of the five skills links it |

## Reuses
- `test/install.test.ts`: its skill text tests, such as the rework skill ones.
- Precedent: SPEC-09-2-adopt-archive.md.

## Tests first
FR-CHAIN-11-5, written by a tester who has not seen the code; the test carries the covers tag chain/FRD-11/FR-CHAIN-11-5.

## Build
The markdown is written by the lead; the tester writes the test from the spec alone.

## Done when
`bun test test/install.test.ts`

## Out of scope
The checks themselves, which SPEC-11-1 and SPEC-11-2 build.

## Open questions
None.
