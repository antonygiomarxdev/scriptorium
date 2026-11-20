---
name: invariant
description: Add or check a row of docs/INVARIANTS.md: a rule that must always hold across the product, with the executable check that enforces it. Use when an FRD states an INV-n or when a failure shows a rule nothing enforced.
argument-hint: <rule in one sentence>
---

# An invariant

An invariant is what must always hold across the product: "free places never go below zero", "no booking without a member". A row in prose only fails (D-26): every row names a check that runs without anyone choosing to run it.

Never overwrite an existing file. If `docs/INVARIANTS.md` exists, read it and add a row; copy `${CLAUDE_PLUGIN_ROOT}/templates/INVARIANTS.md` only when it does not exist. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/INVARIANTS.md`.

Argument: $ARGUMENTS is the rule. Ask for it if missing.

1. Read `docs/INVARIANTS.md` and `docs/GLOSSARY.md`. Stop if a row already says it; edit that row instead.
2. Add the row: next ID (`INV-n`), the rule, the FRD that owns it (`FRD-NN` of its slice), and the check.
3. Make the check real: a test, a property test or a lint that exists and runs in the gates. If it does not exist yet, write it first, or keep the row out until it does.
4. The owner FRD lists the `INV-n` in its Invariants section, and its spec has a task with that id in "Tests first:".

## How to write a row

- **Rule**: one sentence, testable, no "usually". Bad: "Bookings should be consistent." Good: "A slot's free places are never below 0 and never above its capacity."
- **Owner FRD**: the one FRD that answers for it. Other FRDs cite the id.
- **Check**: a command or test name that can fail. Bad: "reviewed by the team". Good: "`bun test test/slots.invariant.test.ts` (property test over 1,000 random booking sequences)".
- A rule that has exceptions is not an invariant: write it as an FRD rule with examples instead.

## Summary (D-24)

`## Summary` sits in the first 20 lines and ends with `Last change: YYYY-MM-DD, <what>`. Update it when you add or change a row.

## Finish

Show the owner the new row and its check running (the failing mutant too, if you wrote the check now), then stop. A registry has no Status: the owner reviews the new row in the pull request.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

The lint fails a row with an empty Check cell.
