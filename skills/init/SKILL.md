---
name: init
description: Start the Scriptorium document chain in a project that has no product documents yet. Creates docs/PRODUCT.md, DECISIONS.md, GLOSSARY.md, INVARIANTS.md, CROSS-CUTTING.md and CHECKS.md from the templates. Use once per project, before any request or PRD.
---

# Start the chain

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

1. Stop if `docs/PRODUCT.md` exists: the chain has started. Run `/scriptorium:status` instead. If the project already has product or design documents, use `/scriptorium:adopt` and stop here.
2. Check that `bun --version` answers. The checks need [Bun](https://bun.sh). If not, tell the owner and stop.
3. Copy each template to a path that does not exist yet:

| Template | Becomes |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/templates/PRODUCT.md` | `docs/PRODUCT.md` |
| `${CLAUDE_PLUGIN_ROOT}/templates/DECISIONS.md` | `docs/DECISIONS.md` |
| `${CLAUDE_PLUGIN_ROOT}/templates/GLOSSARY.md` | `docs/GLOSSARY.md` |
| `${CLAUDE_PLUGIN_ROOT}/templates/INVARIANTS.md` | `docs/INVARIANTS.md` |
| `${CLAUDE_PLUGIN_ROOT}/templates/CROSS-CUTTING.md` | `docs/CROSS-CUTTING.md` |
| `${CLAUDE_PLUGIN_ROOT}/templates/CHECKS.md` | `docs/CHECKS.md` |

4. Fill `docs/PRODUCT.md` with the owner. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/PRODUCT.md`. Ask in batches, with a recommendation for each question:
   - **Problem** with evidence: numbers, sources, dates. "Users struggle" fails; "41 of 60 families missed a pickup in March (sign-in sheet)" passes.
   - **Users**: who, in one line each.
   - **Principles**: numbered, one or two sentences each. A principle that no decision could break says nothing ("be user-friendly").
   - **Use cases** UC-n: what the user does and gets. PRDs cite them by id.
   - **Scope** in this version and out of it, and the **slice map**: one folder `docs/<slice>/` per slice, with its use cases.
   - **Success criteria**, measurable.
5. Name no technology in PRODUCT. Technology waits for the TP.
6. Leave GLOSSARY, INVARIANTS, CROSS-CUTTING and CHECKS as templates until a term, a rule or a failure needs a row (`/scriptorium:glossary` writes terms). Rows in INVARIANTS and CHECKS must name an executable command, or the lint fails.
7. Record every owner answer in `docs/DECISIONS.md` the same day (`/scriptorium:decision`).

## Summary (D-24)

`## Summary` sits in the first 20 lines: what the product is, for whom, and the rules that matter most, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters. Agents often read only this part, so it must stand alone.

## Open questions block approval

Every point the owner has not settled becomes a Q-n in the Open questions section. A document with a Q-n is a draft. For each Q-n ask the owner, one question at a time, with your recommendation, and offer a choice: open a grilling session now (you ask, they answer, you record), or wait for the person who knows. Write each answer into the document and in `docs/DECISIONS.md` the same day, then delete the Q-n.

## Finish

Run the checks, show the owner the output and any Q-n left, then stop. Only the owner approves; you never write `Status: Approved` yourself. When the owner approves, update `Last change:`, then run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <this document>`. It writes the status line and the Approval record; never write them by hand. A later check that says `suspect` or `body changed since approval` goes back to the owner: they approve again, or run `check.ts clear <document>` when only a parent changed. `check.ts history <document>` prints its commits from git.

PRODUCT has no structural script check: the owner reads and approves it. Run:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary <file>
```

Then go on with `/scriptorium:request` and `/scriptorium:prd`, one slice at a time.
