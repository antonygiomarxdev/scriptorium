# REQ-23: Draw before you build

Status: Accepted

## Summary

REQ-15 made diagrams required where they carry the content, but nothing asks for a diagram of the code as it is, or of the change, before work starts. Add a "Draw before you build" section to the shared diagrams page: draw today, draw proposed, read the gaps. Recommended, not mandatory, with no new check. Spec, fix, adopt and review point to it.

Last change: 2026-11-26, accepted

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) Show the existing system and the proposed change as diagrams before building, so the gaps show up early. Mark what exists, what changes and what is new, using strokes only.

## The problem behind it
skills/scriptorium/diagrams.md says where a diagram is required (REQ-15) but says nothing about working on code that exists. The tp, ux, frd, prd and scriptorium skills link it; spec, fix, adopt and review do not. A builder finds a missing file or a reused helper late, as a review finding (cause C-13).

## Evidence
The research report on diagram guidance (task 8) found the page at 35 lines with no before-and-after practice and four skills with no link. How often a gap is found late: unknown.

## Decision
- DG-7: Diagrams are recommended before building, not mandatory; no new check fails a document for lacking one.
- DG-8: diagrams.md gains "Draw before you build": draw today, draw proposed (skipped for a greenfield project), read the gaps, a table of what to draw per document, and one worked example.
- DG-9: The spec, fix and adopt skills link that section; review adds one line: changed and new nodes match the Files table, existing nodes are not rewritten (C-13).
- DG-10: Existing, changed and new nodes differ by stroke only, with classDef: existing thin, changed dashed, new thick; no fills or colors. diagrams.md says so in place of "no styling". erDiagram and sequenceDiagram have no classes and use "(new)" or "(changed)" in the label.
- DG-11: Existing nodes are the ones the spec's Reuses section names.
- DG-12: A TP's Architecture may hold several Mermaid blocks (the check needs one). A whole-system map is split per slice or concern under the 250-line TP cap; the standing map of the system lives in ARCHITECTURE.md (REQ-27).
- DG-13: Each gap found becomes an Open question, a Files row or a Reuses entry.
