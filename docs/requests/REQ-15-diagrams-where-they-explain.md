# REQ-15: Diagrams where they explain faster than text

Status: Accepted

## Summary

The templates ask for Mermaid diagrams in four places, but no check holds a document to them, so documents ship without them. Require a Mermaid block where a diagram carries the content: the architecture of a TP, each flow of a UX document, and the states of an FRD that has states.

Last change: 2026-11-22, accepted, with a page of diagram practices

## Who asked and when
The owner, 2026-11-22.

## What they said
> Add Mermaid diagrams when they are needed to understand better, because I feel that is missing. It has to go somewhere, in the skills or wherever, but it has to be done. (Translated from Spanish.) On accepting it: yes, but we must also put the best practices for these diagrams somewhere. (Translated from Spanish.)

## The problem behind it
templates/TP.md, templates/UX.md and templates/FRD.md ask for a Mermaid diagram, and the tp and ux skills say so, but scripts/ never reads a Mermaid block. A TP whose Architecture section is prose passes.

## Evidence
grep finds "mermaid" in 4 templates and 4 skills and in no script.

## Decision
- DG-1: The TP check fails a TP whose Architecture section has no Mermaid block.
- DG-2: The UX check fails a UX document whose Flows section has no Mermaid flowchart.
- DG-3: The FRD check fails an FRD whose States section is not "n/a: <reason>" and has no Mermaid stateDiagram.
- DG-4: PRODUCT and PRD keep a diagram optional, "when it explains faster than text", as the skills say now.
- DG-6: One page of diagram practices, skills/scriptorium/diagrams.md, which the tp, ux, frd, prd and product skills link: which diagram type fits which question, a size limit, labels that cite row ids, the text saying the same thing, no styling, and only syntax that GitHub renders, with no CLI or browser download.
- DG-5: A new format rule: projects on an earlier format get a warning, not a failure, until they migrate.
