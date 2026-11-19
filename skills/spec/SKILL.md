---
name: spec
description: Write or check the spec for one FRD (src/<slice>/docs/specs/SPEC-NN-name.md): the concrete technical changes and ordered tests-first (ATDD) tasks that cover every FR. Decides nothing new. Use after the FRD's TP and ADR are approved.
argument-hint: <slice dir name> <FRD number NN>
---

# Spec for one FRD

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice `$0`, FRD number `$1`. Ask for them if missing.

1. The FRD `src/$0/docs/frd/FRD-$1-*.md` and its TP `src/$0/docs/tp/TP-$1-*.md` must be approved, with an accepted ADR. If not, stop and say which.
2. Copy `${CLAUDE_PLUGIN_ROOT}/templates/SPEC.md` to `src/$0/docs/specs/SPEC-$1-<name>.md`, same name as the FRD.
3. List the files and interfaces that change, then ordered tasks. Each task starts with the executable acceptance test from the FRD (ATDD), then the code. Every FR of the FRD is covered by a task.
4. A spec decides nothing new. A missing decision goes back to the TP and an ADR.
5. Check:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" spec src/$0/docs/specs/SPEC-$1-<name>.md src/$0/docs/frd/FRD-$1-<name>.md
```

Then stop. Show the owner the check output and the open questions, each with your recommendation. Only the owner approves (see the `scriptorium` skill, "Status and approval"). After approval, implementation follows the tasks in order: test first, then code.
