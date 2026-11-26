# SPEC-11-5: The adopt and review skills link "Draw before you build"

Status: Approved (2026-11-26)
Approval: content vEPaI28N8jGK; rests on ../../requests/REQ-23-draw-before-you-build.md RYynaZYes5Au
Rests on: ../../requests/REQ-23-draw-before-you-build.md

## Summary

The adopt skill links the section "Draw before you build" before it maps documents, and the review skill gains one line on changed, new and existing nodes (FR-CHAIN-11-5 names adopt). SPEC-11-4 builds the section.

Last change: 2026-11-26, first draft

One spec is one agent run: at most 80 lines, 3 files and one done command. Too big: split it into another spec, never add context. A spec decides nothing new.

## Rows

- DG-9: The spec, fix and adopt skills link that section; review adds one line: changed and new nodes match the Files table, existing nodes are not rewritten (C-13).

## Files
| Path | Create or change | Holds |
|---|---|---|
| `skills/adopt/SKILL.md` | Change | A link to the section, at "Inventory", before the mapping table (DG-9) |
| `skills/review/SKILL.md` | Change | One line: changed and new nodes match the Files table, existing nodes are not rewritten, a mismatch is logged with cause C-13, with a link to the section (DG-9) |
| `test/install.test.ts` | Change | The list of skill files that must link diagrams.md gains the adopt skill and the review skill (DG-9) |

## Reuses
- `skills/review/SKILL.md` `C-13`: the cause the new line logs against; no new cause is added.
- Precedent: SPEC-11-3-diagram-practices.md, which added the links of the other skills.

## Tests first
DG-9, written before the text, without it in view. The link test is the one at test/install.test.ts:209, whose list gains the adopt and review skills; the docs lint on both skills covers the rest.

## Build
The markdown, written by the builder from the saved patch draw-before-you-build.patch; the test edit is two strings added to an existing list. No new check.

## Done when
`bun test test/install.test.ts`

## Out of scope
The page itself and the spec and fix links, which SPEC-11-4 builds.

## Open questions
None.
