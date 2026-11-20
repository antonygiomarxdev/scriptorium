---
name: spec
description: Write or check the spec for one FRD (docs/<slice>/specs/SPEC-NN-name.md): files, interfaces and ordered tests-first tasks that cover every example, decision row, state and invariant of the FRD. Decides nothing new. Use after the FRD's TP is approved.
argument-hint: <slice> <FRD number NN>
---

# Spec for one FRD

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice `$0`, FRD number `$1`. Ask for them if missing. A small change that already rests on an existing FRD takes this path too (short path, D-1): the spec cites the request it answers.

1. The FRD `docs/$0/frd/FRD-$1-*.md` and its TP `docs/$0/tp/TP-$1-*.md` must be approved, and every ADR the TP names accepted. If not, stop and say which. Status checks a spec only against its TP: it does not yet check that the ADRs the TP names are accepted, or that the cross-cutting TP is approved. Look at both yourself.
2. Copy `${CLAUDE_PLUGIN_ROOT}/templates/SPEC.md` to `docs/$0/specs/SPEC-$1-<name>.md`, same name as the FRD. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/pickups/specs/`.
3. Fill it, run the checks, and fix every failure.

## How to write each section

- **Context**: links to the FRD, the UX and the TP, and what already exists that this builds on.
- **Files**: every path that is created or changed, and what it holds. Nothing outside the FRD's scope: a file with no FR, EX, DT, ST or INV behind it does not belong (L-13). If you need one, the FRD or the TP is missing something; go back.
- **Interfaces**: the exact types and signatures, as code in the project's language.
- **Data**: schema or migration, or `None`.
- **Tasks**: ordered `### Task n: <name>`, each with three lines:
  - `**Tests first:**` the FRD ids the task proves: every EX-n, DT-n, ST-n and INV-n the FRD defines appears in some task's line. Bad: "tests for booking". Good: "EX-1, EX-2, DT-3".
  - `**Build:**` the code that makes them pass.
  - `**Done when:**` the command and its result. Bad: "works". Good: `bun test test/booking.test.ts` passes, 0 fail.
- **Out of scope**: what a reader might expect here and will not get.

## Tests are written first, blind (L-8)

- The tests come from the FRD ids, in a step where the implementation is not in view: the author reads the FRD, not the code. A test written after the code copies its faults.
- Hold out some examples: keep a few EX rows out of the implementer's brief and run them only at the gate.
- Every test asserts something. A test with no assertion fails the review.
- The mutation gate runs on the changed lines only, with a threshold that rises; a surviving mutant is a missing test, not noise.
- Property tests for each INV-n.

## A spec decides nothing new

A missing decision goes back to the TP, and to an ADR when significant. A spec with `### TD-` or `- **Option` lines fails the check. No `TBD` or `TODO`.

## Summary (D-24)

`## Summary` sits in the first 20 lines: what gets built and in what order, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters.

## Open questions block approval

Every point the owner has not settled becomes a Q-n in the Open questions section. A document with a Q-n is a draft. For each Q-n ask the owner, one question at a time, with your recommendation, and offer a choice: open a grilling session now (you ask, they answer, you record), or wait for the person who knows. Write each answer into the document and in `docs/DECISIONS.md` the same day, then delete the Q-n.

## Finish

Run the checks, show the owner the output and any Q-n left, then stop. Only the owner approves; you never write `Status: Approved` yourself. When the owner approves, update `Last change:`, then run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <this document>`. It writes the status line and the Approval record; never write them by hand. A later check that says `suspect` or `body changed since approval` goes back to the owner: they approve again, or run `check.ts clear <document>` when only a parent changed.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" spec docs/$0/specs/SPEC-$1-<name>.md docs/$0/frd/FRD-$1-<name>.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary docs/$0/specs/SPEC-$1-<name>.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

After approval, implementation follows the tasks in order: test first, then code. Review it with `/scriptorium:review`.
