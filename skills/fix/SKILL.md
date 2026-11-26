---
name: fix
description: Take a bug or a small change through the short path - an accepted request, a failing example in the FRD, and one small spec a small agent finishes. Use for any bug report or small change to behavior that already has an FRD.
argument-hint: <what is wrong>
---

# A fix is a small spec (D-1, L-15)

A fix uses the same format as any other work: one small spec, tests first, one done command. No PRD, no new FRD.

1. **Record why.** `/scriptorium:request` writes the request: who saw what, the words they used. The owner accepts it.
2. **Find the row.** On code that exists, draw the path of the bug first; see [diagrams](../scriptorium/diagrams.md).
   Then search the FRDs for the example, decision row, state or invariant the bug breaks.
   - A row already forbids the behavior: the code is wrong. Go to step 3 with that row.
   - No row covers it: the FRD was missing an example. Add the EX-n to the FRD as a draft change (`/scriptorium:frd`), positive or negative, and the owner approves the FRD again. A bug that becomes an example cannot come back.
   - No FRD covers the behavior at all: offer to map it from the code (`/scriptorium:adopt`); never force it.
3. **Write one small spec** with `/scriptorium:spec`: `Rests on:` the FRD, the broken row under Rows, the failing test first, then the fix. The test must fail before the fix and pass after it.
4. **Hand it over** and review it with `/scriptorium:review`.
5. **Second time?** Queue the finding in `docs/metrics/rework.md` with its cause. A cause found twice with no prevention blocks; `/scriptorium:rework` turns it into a plan for a CHECKS row.

Not a fix: a change in what the product should do. That is a request for a PRD or FRD change.
