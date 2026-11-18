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
| Cross-cutting TP | `docs/tp/TP.md` | Written after the FRDs, so technology never shapes requirements: stack, storage, conventions, threat model | `check.ts tp` |
| TPs per FRD | `src/<slice>/docs/tp/TP-NN-name.md` | 1..N proposals for one FRD, compared; one is chosen | not yet |
| ADRs | `docs/adr/` (cross-cutting), `src/<slice>/docs/adr/` | One decision each: which proposal won and why | `check.ts tp` (checks the ADRs it links) |
| Spec | `src/<slice>/docs/specs/SPEC-NN-name.md` | One per FRD: the concrete technical changes (files, interfaces, ordered ATDD tasks); decides nothing new | `templates/SPEC.md`, `check.ts spec <SPEC> <FRD>` |
| Implementation | code | ATDD: the FRD's acceptance criteria become executable tests first, then the code | not yet |

PRD and FRDs name no technology, and their Given/When/Then tests are acceptance criteria. A TP proposes; an ADR decides. Owner decisions go in `docs/DECISIONS.md`; shared terms in `docs/GLOSSARY.md`. Templates are in this plugin's `templates/`.

## Checks

Run from the project root, with the checks script from this plugin:

```bash
bun <plugin>/scripts/check.ts prd src/<slice>/docs/PRD.md <SLICE_ID>
bun <plugin>/scripts/check.ts frd src/<slice> <SLICE_ID>
bun <plugin>/scripts/check.ts tp docs/tp/TP.md docs/adr
```

Exit 0 passes. Exit 1 prints every failure.

## With a team

Run each step as an agent team, following [puppeteering](https://github.com/antonygiomarxdev/puppeteering): researchers write, an independent reviewer reviews against the step above, the lead verifies by re-running the check and asks the owner only what is the owner's to decide.

- Give each writer its slices in its spawn prompt and set each task's owner before spawning. Writers never claim other tasks.
- One file has one writer.
- After the per-slice reviews, run one cross-slice review over the whole step.
- Record every owner answer in `docs/DECISIONS.md` the same day.

## Reviewing a TP or ADR

The check only sees structure. A reviewer also looks for these, because the check passed on all of them in Deputy:

- **Hand-rolled where a maintained library exists** (phone numbers, dates and time zones, CSV, JWT, crypto, migrations). Name the library, and verify that it is maintained and runs on the project's runtime.
- **Alternatives rejected without a concrete reason.** "Adds a dependency", "large" or "complex" with no number or failure case is not a reason.
- **Hidden single-user assumptions:** one country, language, time zone, currency or number format, or an example from the FRD treated as the rule.
- **Numbers with no stated reason:** limits, timeouts, intervals, caps.
- **Facts about tools that may be out of date.** Check the current docs before rejecting an option for lacking a feature.

## Status and approval

Every chain document carries one status line. PRODUCT, PRD, FRD, TP and spec use `Status: Draft` or `Status: Approved (YYYY-MM-DD)`. ADRs use `## Status` followed by `Proposed`, `Accepted`, `Superseded` or `Rejected`.

Only the owner approves. Approval is the owner's approval of the document's pull request, or an explicit "approved" in the conversation. The lead then commits the status change, with the date, in that pull request and merges it. What is on the main branch is approved; what is not is a draft.

A document may be approved only when the document it rests on is approved: a PRD rests on PRODUCT, an FRD on its PRD, a TP per FRD on its FRD, a spec on its TP, and an ADR on the TP that cites it. Check it, and see what is still waiting:

```bash
bun <plugin>/scripts/check.ts status .
```
