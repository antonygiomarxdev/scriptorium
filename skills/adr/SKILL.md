---
name: adr
description: Write an Architecture Decision Record in docs/adr/ for a TP decision that is architecturally significant. Use only when a TP decision is hard to reverse, shared by slices, or changes a quality attribute.
argument-hint: <short-name>
---

# ADR

Never overwrite an existing file; a changed decision gets a new ADR that supersedes the old one. An ADR rests on the TP decision (TD-n) that cites it, so write the TP first (`/scriptorium:tp`). Not every TD-n needs one (D-13): if the decision is easy to reverse and affects one feature, write `ADR: none: <reason>` in the TP and stop.

1. Number it: next free `ADR-NNN` in `docs/adr/` (three digits). Copy `${CLAUDE_PLUGIN_ROOT}/templates/ADR.md` to `docs/adr/ADR-NNN-name.md`. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/adr/`.
2. Set `## Status` to `Proposed`. The owner moves it to `Accepted` (or `Rejected`); a later ADR moves it to `Superseded`, naming its successor.
3. Add the ADR id to the `ADR:` line of its TD-n in the TP, in the same change.

## How to write each section

- **Summary**: the decision in two lines. Bad: "We discussed storage." Good: "Bookings live in one SQLite file next to the app, because one site writes at most 20 times an hour."
- **Context**: the question, the forces, and the TD-n it comes from. Link the TP; do not copy it.
- **Options considered**: every option, with pros and cons as numbers or failure cases, and why each lost. Fails: an option rejected for "complexity" with no example.
- **Decision**: what was chosen, in one paragraph.
- **Consequences**: what gets easier, what gets harder, what to watch (and the signal that should reopen the decision).

An accepted ADR is not edited, so it has no `Last change:` line and no open questions: a Q-n means it is still a TP question. Keep it under the line cap.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" tp <the TP that cites it> docs/adr
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary docs/adr/ADR-NNN-name.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

The TP check also checks every ADR in the directory (sections, valid status). Then show the owner the ADR and stop: only the owner accepts it.
