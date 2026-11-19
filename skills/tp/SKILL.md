---
name: tp
description: Write or check a Technical Proposal and its ADRs. The cross-cutting TP (docs/tp/TP.md) comes after all FRDs; then 1..N TPs per FRD (src/<slice>/docs/tp/TP-NN-name.md), with an ADR for each chosen option. Use when moving from requirements to how they are built.
argument-hint: [cross | <slice dir name> <FRD number NN>]
---

# Technical Proposal and ADRs

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: `$ARGUMENTS`. Empty or `cross` means the cross-cutting TP. Otherwise a slice and an FRD number.

## Cross-cutting TP

1. Every FRD of every slice must be approved: run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .`. If not, stop and say which are waiting.
2. Copy `${CLAUDE_PLUGIN_ROOT}/templates/TP.md` to `docs/tp/TP.md`. Propose stack, storage, conventions and threat model, citing the FRs each decision serves.
3. For each chosen option, copy `${CLAUDE_PLUGIN_ROOT}/templates/ADR.md` to `docs/adr/ADR-NNN-name.md` (NNN three digits).
4. Check:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" tp docs/tp/TP.md docs/adr
```

## TP for one FRD

1. The FRD and the cross-cutting TP must be approved.
2. Copy `${CLAUDE_PLUGIN_ROOT}/templates/TP.md` to `src/<slice>/docs/tp/TP-NN-name.md`. Compare 1..N options; the chosen one gets an ADR in `src/<slice>/docs/adr/`.
3. Check:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" tp src/<slice>/docs/tp/TP-NN-name.md src/<slice>/docs/adr
```

## Review

A reviewer goes through "Reviewing a TP or ADR" in the `scriptorium` skill: hand-rolled code where a maintained library exists, alternatives rejected without a concrete reason, hidden single-user assumptions, numbers with no reason, out-of-date facts about tools.

Then stop. Show the owner the check output and the open questions, each with your recommendation. Only the owner approves (see the `scriptorium` skill, "Status and approval").
