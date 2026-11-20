---
name: adopt
description: Migrate a project that already has its own product or design documents (PRDs, requirements, RFCs, design docs, ADRs, specs, tickets in markdown) to the Scriptorium chain under docs/<slice>/. Reads and maps what exists, proposes a plan, and changes nothing until the owner approves it. Use instead of /scriptorium:init when the project already has documents.
argument-hint: [path to the existing docs, default: whole repo]
---

# Adopt Scriptorium in an existing project

Never overwrite or delete an existing file. Content that does not fit a template goes to that document's Open questions, never away. Do not move or restructure code.

The migrated documents follow the newest format: before writing any, run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/cli.ts" install`, which pins it in `.scriptorium/config.json` and installs the git hook. A project already on the chain at an older format is not adopted again: use `/scriptorium:migrate`.
The target layout, from `${CLAUDE_PLUGIN_ROOT}/templates/`:

```text
docs/PRODUCT.md  GLOSSARY.md  INVARIANTS.md  CROSS-CUTTING.md  CHECKS.md  DECISIONS.md
docs/requests/REQ-n-name.md      docs/tp/TP.md      docs/adr/ADR-NNN-name.md      docs/retro/RETRO.md
docs/<slice>/PRD.md  frd/FRD-NN-name.md  ux/UX-NN-name.md  tp/TP-NN-name.md  specs/SPEC-NN-k-name.md
```

## 1. Safe start

1. `git status` must be clean. If not, stop and ask the owner to commit or stash.
2. Create a branch: `git switch -c scriptorium-adopt`. All changes stay there until the owner merges.
3. Check that `bun --version` answers. The checks need Bun.

## 2. Inventory (read only)

Search `$ARGUMENTS` (the whole repo if empty) for process documents: `docs/`, `doc/`, `specs/`, `rfcs/`, `adr/`, `design/`, `.github/`, and any markdown with "requirement", "PRD", "spec", "RFC", "ADR", "design", "user story", "acceptance". Skip `node_modules`, build output and vendored code. Read each one.

Map every document to one chain step, using the templates as the target shape:

| Existing | Usually becomes |
|---|---|
| Vision, one-pager, README "why" | PRODUCT |
| Customer or stakeholder asks, feedback notes | REQ-n in `docs/requests/` |
| PRD, requirements, epics | PRD per slice |
| User stories, feature docs, tickets with acceptance criteria | FRD (behavior rows, rules with examples) |
| Wireframes, flow and screen notes | UX per FRD |
| Design doc, RFC, architecture | TP (cross-cutting, or per FRD) |
| ADR, decision log entries | ADR (architecturally significant only), or D-n / L-n in DECISIONS |
| Term lists, naming rules | GLOSSARY |
| Rules that must always hold, lint or CI rules | INVARIANTS, CROSS-CUTTING, CHECKS |
| Implementation plan, task breakdown | Spec |

Decide the slices with the owner. Each slice is a folder `docs/<slice>/`, whatever the code layout: in a monorepo, one slice per app or package that has its own users or behavior (`apps/`, `packages/`, backend, web, mobile). Propose a slice list with a short id each (the SLICE_ID in R-SLICE-n) and ask. Do not use reserved names: `requests`, `tp`, `adr`, `retro`, `decisions`, `research`.

## 3. Map from code, only if offered and accepted

Where a slice has behavior with no PRD or FRD, offer (never force) to read the code and write draft documents from it. If the owner says yes:

- Write draft FRDs and PRD requirements for what the code does. Mark each one *inferred* in its Open questions (Q-n) and keep it `Status: Draft`.
- Write the gap report: what the documents or the owner say against what the code does, one row each (document says, code does, which is right?). Never resolve a gap yourself; each row is a question for the owner.
- Never invent a requirement that neither a document nor the code supports.

## 4. Plan, then stop

Write `docs/scriptorium-adoption.md` with:

- One row per existing document: source path, target path, chain step, what is missing for the check (sections, ids, links, summary, status line), and the action: `git mv` and edit, rewrite into the template, split, merge, or keep outside the chain.
- The gaps: chain steps with no document, and the code-versus-document gap report if section 3 ran.
- Technology named in PRD or FRD material: where it moves in the TP.
- The questions only the owner can answer, each with your recommendation.

Show the plan and stop. Nothing is moved or edited until the owner approves it.

## 5. Migrate, step by step in chain order

PRODUCT (with GLOSSARY, INVARIANTS, CROSS-CUTTING, CHECKS when material exists), requests, then each PRD, FRDs, UX, TP and ADRs, then specs. For each document:

1. `git mv` it to the target path, so history follows. In the same first edit, write its status line (see section 6: `Status: Draft`; a request `Status: Open`; an ADR `## Status` then `Proposed`), so the checks and hooks see a valid document from the start. Then edit it into the template's sections. Keep the original wording; add, do not paraphrase away. Write the `## Summary` (five lines at most, ending with `Last change: YYYY-MM-DD, <what>`).
2. Give ids without changing meaning: `UC-n`, `R-SLICE-n`, FRD behavior rows `FR-SLICE-NN-n` in EARS form, `RULE-n` and `EX-n`, `TD-n`, `ADR-NNN`.
3. Put every open point in Open questions as Q-n.
4. Run the step's check and fix structure until it passes:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" prd docs/<slice>/PRD.md <SLICE_ID>
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" frd docs/<slice> <SLICE_ID>
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" ux docs/<slice>
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" tp docs/tp/TP.md docs/adr
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" spec docs/<slice>/specs/SPEC-NN-k-name.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary <document>
```

5. Record each mapping call you made in `docs/DECISIONS.md` as L-n.

## 6. Status lines

Every document starts as `Status: Draft`, except a request (`Status: Open`) and an ADR (`## Status` then `Proposed`). Never mark one approved yourself. Ask the owner which ones were already approved, accepted or rejected in the old process; for each one the owner confirms, run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <document> --date YYYY-MM-DD` with the date the owner gives, parents first. It writes the status line and the Approval record; never write them by hand. A document the owner does not confirm stays a draft. A request is set by hand to `Accepted`, `Rejected` or `Merged into REQ-m`, and an ADR to `Accepted`, `Superseded` or `Rejected`; neither has an Approval record. A document can be approved only if the one it rests on is, and only with no Q-n left. Then:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .
```

## 7. Report

Moved, rewritten, kept outside the chain, still failing, inferred requirements waiting for the owner, the gap report, and the `status` output. Do not commit unless the owner asks; if asked, one commit per chain step. Remove `docs/scriptorium-adoption.md` once the owner merges.
