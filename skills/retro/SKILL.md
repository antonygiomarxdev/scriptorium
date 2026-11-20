---
name: retro
description: Turn a failure into a prevention that is proven by replaying the failure: open a RETRO-n entry in docs/retro/RETRO.md, find the chain step that should have caught it, add the prevention, and close the entry only when the replay fails against it. Use after a returned change, a recurring review finding or a production failure.
argument-hint: <what failed>
---

# Retro (L-10)

A lesson in prose is not a lesson. An entry closes only when a prevention exists and the replay of the original failure now fails against it. Never overwrite the file; add entries. Create `docs/retro/RETRO.md` from `${CLAUDE_PLUGIN_ROOT}/templates/RETRO.md` if it does not exist. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/retro/RETRO.md`.

## Open an entry

Copy the block of the template under the next free `RETRO-n` and fill every field:

- **Seen**: the date and where (the pull request, the review round, the incident).
- **Step that should have caught it**: request, PRD, FRD, UX, TP, spec, code, test or gate. Take it from the review log when there is one. Ask "which earlier document, if it had said X, would have stopped this?"; the answer is usually earlier than the code.
- **Class**: a narrow slug. "booking-accepted-for-past-date" is a class; "validation" is not. A broad class is split into narrow ones before it is opened.
- **Recurrence**: how many times this class has been seen. Search the open entries and `docs/retro/` archives first. A class seen again reopens its closed entry, raises the count, and moves the fix one step earlier in the chain.
- **Prevention**: `CHECK-n` in `docs/CHECKS.md` (write it with `/scriptorium:check`), a test, a lint rule, a hook, or a template field. "Be more careful" is not a prevention.
- **Replay**: the fixture or mutant of the original failure, and the command that shows the prevention fails on it.
- **Status**: `open`.

## Close an entry

1. Run the replay command now and show that the prevention fails on the original failure.
2. Run the check on the project and show it passes.
3. Move the whole entry to `docs/retro/YYYY-MM.md` (the month it closed) with the closing date, and delete it from `docs/retro/RETRO.md`. The log holds open entries only, so agents read only what is still live.

If the replay does not fail, the prevention does not work: the entry stays open.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

Show the owner the entry and the replay output. The owner decides whether the prevention is enough.
