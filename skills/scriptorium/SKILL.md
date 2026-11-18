---
name: scriptorium
description: Write and check a product's document chain before any code (PRODUCT → PRDs → FRDs → cross-cutting TP → TPs per FRD → specs → implementation with ATDD). Use when starting a product or feature, splitting it into slices, writing a PRD or FRD, or before moving from one document to the next.
---

# Scriptorium

Nothing moves to the next document until the current one passes its check and the owner has decided what only the owner can decide.

## The chain

| Step | Where | Holds | Check |
|---|---|---|---|
| Product | `docs/PRODUCT.md` | Problem, users, numbered principles, use cases UC-n, scope, slice map | Owner reads and approves |
| PRD | `src/<slice>/docs/PRD.md` | What the slice must do: R-SLICE-n, cites UC-n and principles | `check.ts prd` |
| FRDs | `src/<slice>/docs/frd/FRD-NN-name.md` | One feature each: FR-SLICE-NN-n, edge cases, Given/When/Then tests; together cover every R-SLICE-n | `check.ts frd` |
| Cross-cutting TP | `docs/tp/TP.md` | Written after the FRDs, so technology never shapes requirements: stack, storage, conventions, threat model | not yet |
| TPs per FRD | `src/<slice>/docs/tp/TP-NN-name.md` | 1..N proposals for one FRD, compared; one is chosen | not yet |
| ADRs | `docs/adr/` (cross-cutting), `src/<slice>/docs/adr/` | One decision each: which proposal won and why | not yet |
| Spec | `src/<slice>/docs/specs/SPEC-NN-name.md` | One per FRD: the concrete technical changes (files, interfaces, tasks) | not yet |
| Implementation | code | ATDD: the FRD's acceptance criteria become executable tests first, then the code | not yet |

PRD and FRDs name no technology, and their Given/When/Then tests are acceptance criteria. A TP proposes; an ADR decides. Owner decisions go in `docs/DECISIONS.md`; shared terms in `docs/GLOSSARY.md`. Templates are in this plugin's `templates/`.

## Checks

Run from the project root, with the checks script from this plugin:

```bash
bun <plugin>/scripts/check.ts prd src/<slice>/docs/PRD.md <SLICE_ID>
bun <plugin>/scripts/check.ts frd src/<slice> <SLICE_ID>
```

Exit 0 passes. Exit 1 prints every failure.

## With a team

Run each step as an agent team, following [puppeteering](https://github.com/antonygiomarxdev/puppeteering): researchers write, an independent reviewer reviews against the step above, the lead verifies by re-running the check and asks the owner only what is the owner's to decide.

- Give each writer its slices in its spawn prompt and set each task's owner before spawning. Writers never claim other tasks.
- One file has one writer.
- After the per-slice reviews, run one cross-slice review over the whole step.
- Record every owner answer in `docs/DECISIONS.md` the same day.
