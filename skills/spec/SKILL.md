---
name: spec
description: Write or check small specs (docs/<folder>/specs/SPEC-NN-k-name.md), each one agent run that a small model finishes from start to end - the rows it builds quoted from its parent, at most 3 files, tests first, one done command. Splits an FRD or TP into several specs. Decides nothing new. Use after a TP is approved, and for fixes, CI, configuration and chores through /scriptorium:fix and /scriptorium:ops.
argument-hint: <folder> <NN> [parent document]
---

# Small specs (REQ-1, L-15)

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

A spec is what an agent is handed, and the only thing it reads. No brief: a brief retold by the lead loses meaning, sets the wrong goal and goes stale. A spec quotes its rows verbatim, the check proves the quote, and drift marks it suspect when its parent changes.

## 1. Check the parent

Arguments: folder `$0` (a slice, or any folder under `docs/` such as `ci`), number `$1`, and the parent when it is not the TP `docs/$0/tp/TP-$1-*.md`. The parent must be approved (an FRD, a TP, an ADR), accepted (a request), or a registry (`docs/CHECKS.md`, `docs/INVARIANTS.md`, `docs/CROSS-CUTTING.md`). If not, stop and say which.

## 2. Split

List every id the parent defines that this work must build (EX, DT, ST, INV for an FRD; FR or a decision for a TP; a CHECK-n, INV-n or CC-n row). Group them into runs, in dependency order:

- One run builds one thing a test can prove alone: a pure rule, one write, one screen state, one CI job.
- At most 3 files per run; test files do not count.
- The spec, rows included, fits in 80 lines.
- The specs of one parent together cover every id; `check.ts trace` proves it on the tests.

A strong model splits; a small model runs each spec. If a run does not fit, split it again. Never give a small agent more context instead.

## 3. Write each spec

On code that exists, draw today and proposed first and read the gaps; see [diagrams](../scriptorium/diagrams.md) ("Draw before you build"). Existing nodes are what Reuses names.

Copy `${CLAUDE_PLUGIN_ROOT}/templates/SPEC.md` to `docs/$0/specs/SPEC-$1-<k>-<name>.md`, k = 1, 2, 3 in build order. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/pickups/specs/`.

- **Rests on**: the relative path of the parent.
- **Rows**: print them, never retype them:
  ```bash
  bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" excerpt docs/$0/frd/FRD-$1-<name>.md EX-4 EX-5 INV-1
  ```
  Rows from a document other than the parent (the FRD under a TP) go under a `Quoted from:` line.
- **Reuses**: before writing Files, search the code for what already does the job: a helper, a check, a pattern, a spec that did the same. List each as `path` `name`, the precedent as "Precedent: SPEC-...md", or write "Nothing to reuse:" with the reason. The check fails a path or name that does not exist (FRD-05, a format 3 rule). New code that repeats existing code fails review as cause C-13.
- **Files**: each path created or changed, at most 3. A file no row needs does not belong (L-13). Every clause in a row's "Holds" column needs a row in Rows that tests it; a clause with none is the second most frequent cause in `docs/metrics/rework.md`.
- **Tests first**: exactly the ids in Rows. Bad: "tests for booking". Good: "EX-4, EX-5, INV-1, written before the code, without it in view".
- **Build**: the code that makes them pass, with exact signatures.
- **Done when**: one command in backticks. Bad: "works". Good: `bun test test/book.test.ts`.
- **Out of scope**: what the next spec builds.

## Tests are written first, blind (L-8)

The tests come from the rows, without the implementation in view. Every test asserts something and carries `covers: <slice>/FRD-NN/<ID>`. A surviving mutant is a missing test. Property tests for each INV-n.

## A spec decides nothing new

A missing decision goes back to the TP, and to an ADR when significant. `### TD-` or `- **Option` lines fail. No `TBD` or `TODO`.

## Handing it over

Give the agent the path of one approved spec, nothing else. It reports the output of the done command; whoever handed it over runs the command again. A question goes back as a Q-n in the spec, and the spec waits. `check.ts done <spec>` runs the command for an approved spec: that is what Done means.

## Open questions, approval

A Q-n blocks approval: ask the owner, one question at a time, with your recommendation. Only the owner approves; then run `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" approve <spec>`. A replaced spec gets `Status: Superseded by <relative path> (YYYY-MM-DD)`.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" spec docs/$0/specs/SPEC-$1-<k>-<name>.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary docs/$0/specs/SPEC-$1-<k>-<name>.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

After approval, the work is reviewed with `/scriptorium:review`.
