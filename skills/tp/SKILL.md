---
name: tp
description: Write or check a Technical Proposal. The cross-cutting TP (docs/tp/TP.md) comes after all FRDs; then one TP per FRD (docs/<slice>/tp/TP-NN-name.md) comparing options. An ADR only for an architecturally significant decision. Use when moving from requirements to how they are built.
argument-hint: [cross | <slice> <FRD number NN>]
---

# Technical Proposal

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: `$ARGUMENTS`. Empty or `cross` means the cross-cutting TP. Otherwise a slice and an FRD number.

## What it rests on

- Cross-cutting TP: every FRD of every slice approved. Run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .`; if any FRD is a draft, stop and say which. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/tp/TP.md`.
- TP per FRD: that FRD (and its UX, if the interface changes) and the cross-cutting TP approved. Copy `${CLAUDE_PLUGIN_ROOT}/templates/TP.md` to `docs/<slice>/tp/TP-NN-name.md`, same name as the FRD. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/pickups/tp/`.

Status checks a TP only against its FRD. It does not yet check that the cross-cutting TP is approved, or that the ADRs a TP names are accepted. The owner confirms both; look at them yourself before you go on.

## How to write each section

- **Context**: what exists, which FR ids the FRD asks for, constraints, and facts with sources. Cite ids; never copy FRD text.
- **Decisions**: one `### TD-n: <question>` each, at least two options, each with cost and risk as a number or a failure case. Bad: "Option B is complex." Good: "Option B needs a second process, so a crash loses up to 30 s of bookings." Then `Chosen: <option>, because <reason>. ADR: ADR-NNN` or `ADR: none: <reason>`.
- **ADR only when architecturally significant** (D-13): hard to reverse, shared by several slices, or it changes a quality attribute. Choosing a date library is `none: not architecturally significant`. Choosing where bookings are stored is an ADR: copy `${CLAUDE_PLUGIN_ROOT}/templates/ADR.md` to `docs/adr/ADR-NNN-name.md` (three digits), and the TP names it.
- **Architecture**: a Mermaid diagram and the parts; see [diagrams](../scriptorium/diagrams.md).
- **Information**: what is stored, where, in what shape.
- **Interfaces and contracts**: what each part offers the others, and the contract test for each changed interface.
- **Threat model**: assets, who could attack, how, what stops it, what is accepted.
- **Testing**: how FRD ids become tests first; which gates run; mutation scope.
- **Risks**: each with an owner or a mitigation.

## Review

A reviewer goes through "Reviewing a TP or ADR" in the `scriptorium` skill: hand-rolled code where a maintained library exists, alternatives rejected without a concrete reason, hidden single-user assumptions, numbers with no reason, out-of-date facts about tools.

## Summary (D-24)

`## Summary` sits in the first 20 lines: the technical choices and why, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters.

## Open questions block approval

Every point the owner has not settled becomes a Q-n in the Open questions section. A document with a Q-n is a draft. For each Q-n ask the owner, one question at a time, with your recommendation, and offer a choice: open a grilling session now (you ask, they answer, you record), or wait for the person who knows. Write each answer into the document and in `docs/DECISIONS.md` the same day, then delete the Q-n.

## Finish

Run the checks, show the owner the output and any Q-n left, then stop. Only the owner approves; you never write `Status: Approved` yourself. When the owner approves, update `Last change:`, then run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <this document>`. It writes the status line and the Approval record; never write them by hand. A later check that says `suspect` or `body changed since approval` goes back to the owner: they approve again, or run `check.ts clear <document>` when only a parent changed.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" tp docs/tp/TP.md docs/adr
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" tp docs/<slice>/tp/TP-NN-name.md docs/adr
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary <file>
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

Then go on with `/scriptorium:spec`.
