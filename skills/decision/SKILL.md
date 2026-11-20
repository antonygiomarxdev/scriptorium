---
name: decision
description: Record an owner decision (D-n) or a design call (L-n) in docs/DECISIONS.md, absorb it into the document it governs, and archive it. Use whenever the owner decides something, and when DECISIONS.md grows.
argument-hint: <decision in one sentence>
---

# Decisions

Never overwrite an existing file; add rows. DECISIONS.md is an inbox, not a history (L-5): a decision is not finished until the document it governs says it. That document holds the current truth.

## Record

1. Add a row to `docs/DECISIONS.md` the same day: next free ID (`D-n` when the owner decided, `L-n` when you proposed a design and the owner approved it), the date, the decision in one sentence, and **Goes into**: the document that must absorb it (PRODUCT, a PRD, an FRD, a TP, an ADR, GLOSSARY). A row with an empty **Goes into** fails the lint. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/DECISIONS.md`.
2. Write the decision as a fact, with the reason when it is not obvious. Bad: "Discussed booking limits." Good: "A family books at most one pickup slot per week, so the food lasts until Friday."
3. Technical decisions between options are not recorded here: they go in a TP, and an ADR when architecturally significant.

## Absorb

When the document that governs the decision says it (the rule is in the PRD, the example in the FRD), move the row to the archive:

1. Append the row to `docs/decisions/YYYY-MM.md` (create it with a heading if the month has none), with the date it was absorbed and a link to the document.
2. Delete it from `docs/DECISIONS.md`.
3. A reverted decision moves to the archive too, struck through, with the reason.

Agents do not read `docs/decisions/` by default; the governing documents are the truth.

## Keep the inbox small

`docs/DECISIONS.md` has a line cap and every entry has a target document. When it nears the cap or an entry is older than the set age, absorb the oldest entries first: edit the target document, then archive the row. If an entry has no document to go into, the document is missing: write it, or ask the owner.

DECISIONS.md is a registry, not a chain document, so it has no approval and no open questions: an unclear answer is not a decision yet. Ask the owner (one question, with your recommendation) and record it only when answered.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```
