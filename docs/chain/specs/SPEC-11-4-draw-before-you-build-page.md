# SPEC-11-4: The diagrams page gains "Draw before you build", and spec and fix link it

Status: Draft
Rests on: ../../requests/REQ-23-draw-before-you-build.md

## Summary

skills/scriptorium/diagrams.md gains the section "Draw before you build" and its stroke-only styling, and the spec and fix skills link it (FR-CHAIN-11-5 names them). SPEC-11-5 does the same for adopt and review.

Last change: 2026-11-26, first draft

One spec is one agent run: at most 80 lines, 3 files and one done command. Too big: split it into another spec, never add context. A spec decides nothing new.

## Rows

- DG-8: diagrams.md gains "Draw before you build": draw today, draw proposed (skipped for a greenfield project), read the gaps, a table of what to draw per document, and one worked example.
- DG-9: The spec, fix and adopt skills link that section; review adds one line: changed and new nodes match the Files table, existing nodes are not rewritten (C-13).
- DG-10: Existing, changed and new nodes differ by stroke only, with classDef: existing thin, changed dashed, new thick; no fills or colors. diagrams.md says so in place of "no styling". erDiagram and sequenceDiagram have no classes and use "(new)" or "(changed)" in the label.
- DG-11: Existing nodes are the ones the spec's Reuses section names.
- DG-13: Each gap found becomes an Open question, a Files row or a Reuses entry.

## Files
| Path | Create or change | Holds |
|---|---|---|
| `skills/scriptorium/diagrams.md` | Change | The section "Draw before you build" (DG-8, DG-13), the stroke-only classes and the label form (DG-10), existing nodes as Reuses names them (DG-11), and one worked example that passes the docs lint |
| `skills/spec/SKILL.md` | Change | A link to the section, at "Write each spec" (DG-9) |
| `skills/fix/SKILL.md` | Change | A link to the section, at "Find the row" (DG-9) |
| `test/install.test.ts` | Change | The list of skill files that must link diagrams.md gains the spec skill and the fix skill (DG-9) |

## Reuses
- `scripts/lint-docs.ts` `mermaidFindings`: the worked example must pass it, so the spec builds no new check.
- Precedent: SPEC-11-3-diagram-practices.md, which created the page and the links to it.

## Tests first
DG-8, DG-9, DG-10, DG-11, DG-13, written before the text, without it in view. The link test is the one at test/install.test.ts:209, whose list gains the spec and fix skills; the docs lint on the page covers the rest.

## Build
The markdown, written by the lead from the saved patch draw-before-you-build.patch; the test edit is two strings added to an existing list. No new check.

## Done when
`bun test test/install.test.ts`

## Out of scope
The adopt and review links, which SPEC-11-5 builds. A check that fails a document with no diagram beyond FR-CHAIN-11-1 (DG-7).

## Open questions
None.
