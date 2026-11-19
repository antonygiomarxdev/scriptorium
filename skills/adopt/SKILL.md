---
name: adopt
description: Migrate a project that already has its own product or design documents (PRDs, requirements, RFCs, design docs, ADRs, specs, tickets in markdown) to the Scriptorium chain. Reads and maps what exists, proposes a plan, and changes nothing until the owner approves it. Use instead of /scriptorium:init when the project already has documents.
argument-hint: [path to the existing docs, default: whole repo]
---

# Adopt Scriptorium in an existing project

Never overwrite or delete an existing file. Content that does not fit a template goes to that document's Open questions, never away. Do not move or restructure code.

## 1. Safe start

1. `git status` must be clean. If not, stop and ask the owner to commit or stash.
2. Create a branch: `git switch -c scriptorium-adopt`. All changes stay there until the owner merges.
3. Check that `bun --version` answers. The checks need Bun.

## 2. Inventory (read only)

Search `$ARGUMENTS` (the whole repo if empty) for process documents: `docs/`, `doc/`, `specs/`, `rfcs/`, `adr/`, `design/`, `.github/`, and any markdown with "requirement", "PRD", "spec", "RFC", "ADR", "design", "user story", "acceptance". Skip `node_modules`, build output and vendored code. Read each one.

Map every document to one chain step, using the templates in `${CLAUDE_PLUGIN_ROOT}/templates/` as the target shape:

| Existing | Usually becomes |
|---|---|
| Vision, one-pager, README "why" | PRODUCT |
| PRD, requirements, epics | PRD per slice |
| User stories, feature docs, tickets with acceptance criteria | FRD |
| Design doc, RFC, architecture | TP (cross-cutting or per FRD) |
| ADR, decision log entries | ADR, or D-n / L-n in DECISIONS |
| Implementation plan, task breakdown | Spec |

Decide the slices with the owner: the chain puts each slice's documents in `src/<slice>/docs/`. If the code is not split that way (monorepo, `packages/`, `apps/`), propose a slice list and ask; the status check only finds slices under `src/`.

## 3. Plan, then stop

Write `docs/scriptorium-adoption.md` with:

- One row per existing document: source path, target path, chain step, what is missing for the check (sections, IDs, links, status line), and the action: `git mv` and edit, rewrite into the template, split, merge, or keep outside the chain.
- The gaps: chain steps with no document. Never invent requirements to fill them. A requirement read from code, not from a document, is marked *inferred* and stays Draft until the owner confirms it.
- Technology named in PRD or FRD material: where it moves in the TP.
- The questions only the owner can answer, each with your recommendation.

Show the plan and stop. Nothing is moved or edited until the owner approves it.

## 4. Migrate, step by step in chain order

PRODUCT, then each PRD, then FRDs, then TP and ADRs, then specs. For each document:

1. `git mv` it to the target path, so history follows. Then edit it into the template's sections. Keep the original wording; add, do not paraphrase away.
2. Give IDs without changing meaning: `UC-n`, `R-SLICE-n`, bold `**FR-SLICE-NN-n.**`, `TD-n`, `ADR-NNN`.
3. Run the step's check (see the `scriptorium` skill) and fix structure until it passes.
4. Record each mapping call you made in `docs/DECISIONS.md` as L-n.

## 5. Status lines

Every document starts as `Status: Draft`. Never mark one approved yourself. Ask the owner which ones were already approved in the old process; for each one the owner confirms, write `Status: Approved (YYYY-MM-DD)` with the date the owner gives. A document can be approved only if the one it rests on is. Then:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .
```

## 6. Report

Moved, rewritten, kept outside the chain, still failing, inferred requirements waiting for the owner, and the `status` output. Do not commit unless the owner asks; if asked, one commit per chain step. Remove `docs/scriptorium-adoption.md` once the owner merges.
