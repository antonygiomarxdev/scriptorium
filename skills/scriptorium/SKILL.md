---
name: scriptorium
description: Write and check a product's document chain before any code (PRODUCT → PRD → FRDs → TP → ADRs → specs). Use when starting a product or feature, splitting it into slices, writing a PRD or FRD, or before moving from one document to the next.
---

# Scriptorium

Nothing moves to the next document until the current one passes its check and the owner has decided what only the owner can decide.

## The chain

| Step | Where | Holds | Check |
|---|---|---|---|
| Product | `docs/PRODUCT.md` | Problem, users, numbered principles, use cases UC-n, scope, slice map | Owner reads and approves |
| PRD | `src/<slice>/docs/PRD.md` | What the slice must do: R-SLICE-n, cites UC-n and principles | `check.ts prd` |
| FRDs | `src/<slice>/docs/frd/FRD-NN-name.md` | One feature each: FR-SLICE-NN-n, edge cases, Given/When/Then tests; together cover every R-SLICE-n | `check.ts frd` |
| TP | `src/<slice>/docs/tp/TP.md` | How: technology, conventions, threat model | not yet |
| ADRs | `docs/adr/` (cross-slice), `src/<slice>/docs/adr/` | One technical decision each | not yet |
| Specs | `src/<slice>/docs/specs/` | What a builder implements and tests | not yet |

PRD and FRDs name no technology: the TP chooses it. Owner decisions go in `docs/DECISIONS.md`; shared terms in `docs/GLOSSARY.md`. Templates are in this plugin's `templates/`.

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
