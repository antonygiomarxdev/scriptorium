---
name: frd
description: Write or check the FRDs of one slice (docs/<slice>/frd/FRD-NN-name.md): one feature each, with EARS behavior rows, rules with owner-approved examples, decision and state tables, measurable quality criteria. Use after the slice PRD is approved.
argument-hint: <slice folder name> <SLICE_ID>
---

# FRDs for one slice

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice $0, slice ID $1 (for example PICKUPS). Ask for them if missing.

1. `docs/$0/PRD.md` must be approved. If it is a draft, stop and say so.
2. Split the PRD into features, one FRD each. Copy `${CLAUDE_PLUGIN_ROOT}/templates/FRD.md` to `docs/$0/frd/FRD-NN-name.md` (NN two digits, name in kebab-case). Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/pickups/frd/`.
3. Fill it section by section (below). Together the FRDs cover every PRD requirement.
4. Run the checks and fix every failure.
5. Have an independent reviewer read the FRDs against the PRD. When every slice has FRDs, run one cross-slice review for contradictions: the check cannot see those.

The patterns, tables and examples are in `${CLAUDE_PLUGIN_ROOT}/skills/frd/writing-rules.md`. Read it before you write.

## How to write each section

- **Why**: the REQ-n it answers.
- **Requirements covered**: R-$1-n from the PRD, by id. Do not copy their text (the lint fails on copied sentences).
- **Behavior**: one sentence per row, in EARS form, with an id `FR-$1-NN-n`. Bad: "The system handles bookings well." Good: "WHEN a family books a slot, the system shall confirm it and reduce the slot's free places by one."
- **Rules and examples**: each rule is a fact the owner can check. Every rule has at least one positive and one negative or boundary example, with exact values. The examples are the oracle: the owner approves them, and tests come from them. Give each rule a negative example for every input that could pass for a valid one (another id, another folder, an error, a value going the wrong way): a missing example of this kind is the most frequent cause in `docs/metrics/rework.md`.
- **Decision table**, **States**, **Invariants**: ids, or "n/a: <reason>". A bare "n/a" fails.
- **Quality criteria**: QC-1 to QC-9, each measurable (metric, threshold, how measured) or "n/a: <reason>". "Fast", "secure", "easy" fail.
- **Cross-cutting**: answer every row of `docs/CROSS-CUTTING.md`: CC-n applies (how) or "n/a: <reason>".
- **Information**: the fields the feature reads and keeps. No formats, no storage choice.
- **Acceptance criteria**: generated from the examples, decision table and states: AC-n, one per EX, DT row and ST cell. Never write them by hand.
- **No technology**: no database, language, protocol or file format. That belongs in the TP.

## Why the ids matter

Tests are written later, from these ids, by someone who has not seen the code (L-8). The spec cites every EX, DT, ST and INV in a task's "Tests first:" line; the check fails when one is left out. An example with a vague "Then" cannot become a test: write the exact result.

## Summary (D-24)

`## Summary` sits in the first 20 lines: what the feature does, for whom, and the rules that matter most, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters.

## Open questions block approval

Every point the owner has not settled becomes a Q-n. A document with a Q-n is a draft. For each Q-n ask the owner, one question at a time, with your recommendation, and offer a choice: open a grilling session now, or wait for the person who knows. Write each answer into the document and in `docs/DECISIONS.md`, then delete the Q-n.

## Finish

Run the checks, show the owner the output and any Q-n left, then stop. Only the owner approves; you never write `Status: Approved` yourself. When the owner approves, update `Last change:`, then run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <this document>`. It writes the status line and the Approval record; never write them by hand. A later check that says `suspect` or `body changed since approval` goes back to the owner: they approve again, or run `check.ts clear <document>` when only a parent changed.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" frd docs/$0 $1
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary docs/$0/frd/FRD-NN-name.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

Then go on with `/scriptorium:ux` for each FRD that touches the interface, and `/scriptorium:tp`.
