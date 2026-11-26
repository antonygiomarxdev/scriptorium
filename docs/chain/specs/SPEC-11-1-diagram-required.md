# SPEC-11-1: A diagram is required where it carries the content

Status: Approved (2026-11-22)
Approval: content wFAyGbWzQWZa; rests on ../frd/FRD-11-diagrams.md qfR-j-oUKtrv
Rests on: ../frd/FRD-11-diagrams.md

## Summary

The TP, UX and FRD checks fail an Architecture, Flows or States section with no Mermaid block, unless States says n/a; the rule is format 4.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | negative | A TP whose Architecture section is two paragraphs of prose | the TP check runs | it fails with "Architecture has no Mermaid block" |
| EX-2 | RULE-1 | positive | An FRD whose States section says "n/a: nothing here keeps state." | the FRD check runs | it reports nothing for States |
| EX-3 | RULE-1 | negative | A UX document whose Flows section lists steps as bullets | the UX check runs | it fails with "Flows has no Mermaid block" |
| EX-8 | RULE-4 | boundary | A project pinned to format 3 and a TP with no Mermaid block | the TP check runs | it passes and prints the failure as a warning |
| EX-10 | RULE-4 | positive | A project pinned to the format that adds these rules and a TP whose Architecture holds a quoted flowchart | the TP check runs | it passes with no warning |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | The tp, ux and frd checks look for a fenced mermaid block in Architecture, Flows and States, tagged "[format 4]" |
| `test/check.test.ts` | Change | The EX-1, EX-2, EX-3, EX-8 and EX-10 tests |

## Reuses
- `scripts/check.ts` `section`: reads one section of a document.
- `scripts/format.ts` `gate`: the format 4 warning below the pin.
- Precedent: SPEC-10-1-tracked-paths.md.

## Tests first
EX-1, EX-2, EX-3, EX-8, EX-10, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
A Mermaid block is a fence opening with three backticks and the word mermaid. The States n/a test is the one the FRD check already uses.

## Done when
`bun test test/check.test.ts`

## Out of scope
What is inside the block, which SPEC-11-2 lints.

## Open questions
None.
