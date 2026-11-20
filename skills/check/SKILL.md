---
name: check
description: Add a rule this project learned from a failure to docs/CHECKS.md, with the command that enforces it and the replay of the failure it catches. Use after any failure that should never happen twice, and when the retro asks for a prevention.
argument-hint: <what it prevents>
---

# Project check

A rule that exists only in prose does not count (D-26). A rule is a row in `docs/CHECKS.md` with a command that runs without the agent choosing to run it, and the replay of the failure it catches. A row with no command fails the lint. Never overwrite the file; add rows. Create it from `${CLAUDE_PLUGIN_ROOT}/templates/CHECKS.md` if it does not exist. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/CHECKS.md`.

## Steps

1. Name the failure in one sentence and the narrow class it belongs to. "Bad bookings" is too broad; "a booking accepted for a past date" is a class.
2. Write the replay first: the smallest fixture or mutant that reproduces the failure (a bad input file, a one-line mutation of the code). Keep it in the repository.
3. Write the check: a command that exits non-zero on the replay (a test, a lint rule, a script, a hook). Run it on the replay and show the failure. A check that has never failed is not proven.
4. Run it on the current project and show it passes.
5. Add the row: `CHECK-n` (next free), what it prevents, the command, and the replay (the path and the command that shows it fails).
6. Make it run on its own: wire the command into the pre-commit hook or CI, or the plugin hook. Say which. If you cannot, the rule is still prose: tell the owner.
7. If a retro entry asked for it, put `CHECK-n` in that entry's Prevention (see `/scriptorium:retro`).

## Good and bad rows

- Bad: "Prevents: mistakes. Command: review carefully." No command that fails, no replay.
- Good: "Prevents: a booking accepted for a past date. Command: `bun test test/booking-past.test.ts`. Replay: `test/fixtures/past-booking.json`, which the test must reject."

The registry has no Summary, no approval and no open questions. Then run:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```
