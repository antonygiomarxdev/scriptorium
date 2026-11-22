# SPEC-11-2: The docs lint keeps a diagram renderable and small

Status: Approved (2026-11-22)
Approval: content qb6hcg7pEk2h; rests on ../frd/FRD-11-diagrams.md rh70IXLPkBx4
Rests on: ../frd/FRD-11-diagrams.md

## Summary

The docs lint fails a Mermaid block whose type GitHub is not known to render, a label with HTML or unquoted ( ) [ ] { } :, and a node named end in lowercase, and warns above 15 nodes.

Last change: 2026-11-21, first draft

## Rows

| EX-4 | RULE-2 | negative | A TP draws its architecture with "architecture-beta" | the docs lint runs | it fails with "Mermaid type architecture-beta is not one GitHub is known to render" |
| EX-5 | RULE-2 | negative | A flowchart node reads A[Book (slot)] | the docs lint runs | it fails naming the line and asking for double quotes |
| EX-6 | RULE-2 | positive | A flowchart node reads A["Book (slot)"] | the docs lint runs | it reports nothing for that line |
| EX-7 | RULE-3 | boundary | A flowchart with 16 nodes | the docs lint runs | it warns "16 nodes, keep a diagram at 15 or fewer" and passes |
| EX-9 | RULE-3 | positive | A sequenceDiagram with 6 participants and 9 messages | the docs lint runs | it reports nothing for that block |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/lint-docs.ts` | Change | A Mermaid block reader: its type, its node labels and its node count; failures tagged "[format 4]" and a warning for size |
| `test/lint-docs.test.ts` | Change | The EX-4, EX-5, EX-6, EX-7 and EX-9 tests |

## Reuses
- `scripts/lint-docs.ts` `CAPS`: the per-document checks the Mermaid check sits with.
- Precedent: SPEC-11-1-diagram-required.md.

## Tests first
EX-4, EX-5, EX-6, EX-7, EX-9, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Allowed types: flowchart, graph, sequenceDiagram, stateDiagram-v2, erDiagram, classDiagram. A node label is the text in [ ], ( ), { } after a node id; quoted labels pass. Nodes are counted as distinct ids.

## Done when
`bun test test/lint-docs.test.ts`

## Out of scope
Rendering the diagram: no tool is installed.

## Open questions
None.
