---
name: review
description: Review the work of one small spec with a closed review - gates first, every FAIL cites a quoted row or a failed gate, a file outside the spec fails, at most three rounds. Use when the code for a spec is ready for review, for product work, fixes and CI or configuration alike.
argument-hint: <path to the spec>
---

# Closed review (L-6)

An open review never converges: a reviewer run twice on the same diff finds new things. This review is closed. It judges the change against one approved spec, not against taste. The spec is enough: its Rows are the acceptance criteria, its Files are the scope, its Done when is the gate. A small model can review it.

Argument: the spec `$0`. It must be approved; if not, stop. Review in a fresh context, as a reviewer who did not write the code.

## Before round 1: gates

Run the spec's Done when (`bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" done $0`), then the project gates (tests, typecheck, `bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .`, `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .`, the mutation gate on changed lines). If a gate fails, stop: the verdict is FAIL citing that gate, and the author fixes it before anyone reads the code.

## Round 1: list every finding

Read the diff against the spec. A changed file not in its Files table (test files aside) is a FAIL. Every finding has:

| Field | Content |
|---|---|
| Location | `file:line` |
| Cites | the quoted row (EX-n, DT-n, ST-n, INV-n, CHECK-n) it breaks, or the failed gate. No citation, no FAIL: a finding that cites nothing is a note, and it does not block |
| Problem and fix | one line each |
| Step | the chain step that should have caught it: request, PRD, FRD, UX, TP, spec, code, test or gate |
| Cause | why it got through, in one phrase (ambiguous FRD row, missing example, test written after code, no gate) |

Map every clause of the Files table's "Holds" column to a row. A clause with no row is a finding against the spec, Step: spec, not a defect in the code. Add every finding to the open findings of `docs/metrics/rework.md`, one row each, naming one cause from its list; a cause not on the list goes to the owner, never a new row of its own.

Also fail anything beyond the spec (L-13): code, files or behavior no quoted row asks for. Warn when additions far exceed deletions with no stated reason.

List all findings in round 1. Do not hold any back for later.

## Rounds 2 and 3

Check only the round 1 findings, and new defects in lines changed since the last round. Do not reopen what passed. A reviewer who finds a new class of issue in untouched code writes it as a note for the retro, not a FAIL.

## Stop rule

At most three rounds. If findings remain after round 3, stop and give the owner the open findings and your recommendation; the owner decides.

## Output

A verdict (PASS or FAIL), the findings table, the rounds used, and the log: one row per finding with Step and Cause, kept with the pull request. A class seen twice goes to `/scriptorium:retro`. A reviewer is measured too: if re-running you on the unchanged change gives different FAILs, report that as noise.
