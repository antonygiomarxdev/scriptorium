---
name: ux
description: Write or check the UX document of one FRD (docs/<slice>/ux/UX-NN-name.md): flows, screens, states, the design-system components it reuses, changes or adds. Use after an FRD that touches the interface is approved, before its TP.
argument-hint: <slice folder name> <NN>
---

# UX for one FRD

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice $0, FRD number $1 (two digits). Ask for them if missing.

1. `docs/$0/frd/FRD-$1-*.md` must exist and be approved. If it is a draft, stop and say so. An FRD that touches no interface needs no UX document.
2. Copy `${CLAUDE_PLUGIN_ROOT}/templates/UX.md` to `docs/$0/ux/UX-$1-name.md` (same name as the FRD). Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/pickups/ux/`.
3. Fill it section by section (below), then run the checks and fix every failure.
4. Have an independent reviewer read it against the FRD.

## How to write each section

- **Flows**: one Mermaid flowchart per flow. Every step that is a system response cites its FR id; every branch the owner's examples cover cites its EX id. Bad: a flow with no ids, which no check can trace. Good: "Book slot (FR-PICKUPS-01-1) -> full? yes -> waitlist (EX-4)".
- **Screens**: a table, one row per screen: its purpose and the FR ids it shows. A screen no FR needs is scope creep; an FR with no screen and no "n/a" is a gap.
- **States**: for each screen, empty, loading, error, partial and success, each with what the user sees. Bad: "shows an error". Good: "Error: the text 'We could not load the slots. Try again.' and a Retry button; the list keeps the last slots it had."
- **Design system**: a table of components and tokens: reused, changed or new, and where. Prefer reuse; every "new" needs a reason. Use token names, not raw colors or pixel values.
- **Accessibility and language**: reading order, focus order, contrast, and text length in each language of `docs/CROSS-CUTTING.md`. Bad: "accessible". Good: "Focus moves to the confirmation message after booking; the Spanish label is 30% longer and wraps to two lines."
- **No technology**: name no framework or library.

## Summary (D-24)

`## Summary` sits in the first 20 lines: what the user sees and does, and what changes in the interface, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters.

## Open questions block approval

Every point the owner has not settled becomes a Q-n. A document with a Q-n is a draft. For each Q-n ask the owner, one question at a time, with your recommendation, and offer a choice: open a grilling session now, or wait for the person who knows. Write each answer into the document and in `docs/DECISIONS.md`, then delete the Q-n.

## Finish

Run the checks, show the owner the output and any Q-n left, then stop. Only the owner approves; you never write `Status: Approved` yourself. When the owner approves, update `Last change:`, then run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <this document>`. It writes the status line and the Approval record; never write them by hand. A later check that says `suspect` or `body changed since approval` goes back to the owner: they approve again, or run `check.ts clear <document>` when only a parent changed. `check.ts history <document>` prints its commits from git.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" ux docs/$0
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary docs/$0/ux/UX-$1-name.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

Then go on with `/scriptorium:tp`.
