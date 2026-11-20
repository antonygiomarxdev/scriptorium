---
name: review
description: Review an implementation against its FRD with a closed review: gates first, every FAIL cites an acceptance criterion or a failed gate, at most three rounds, nothing beyond the FRD. Use when code for a spec is ready for review.
argument-hint: <slice> <FRD number NN>
---

# Closed review (L-6)

An open review never converges: a reviewer run twice on the same diff finds new things. This review is closed. It judges the change against the approved FRD and spec, not against taste.

Arguments: slice `$0`, FRD number `$1`. The FRD and the spec `docs/$0/specs/SPEC-$1-*.md` must be approved; if not, stop. Review in a fresh context, as a reviewer who did not write the code.

## Before round 1: gates

Run the gates the spec names (tests, typecheck, `bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .`, `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .`, the mutation gate on changed lines). If a gate fails, stop: the verdict is FAIL citing that gate, and the author fixes it before anyone reads the code.

## Round 1: list every finding

Read the diff against the FRD. Every finding has:

| Field | Content |
|---|---|
| Location | `file:line` |
| Cites | the AC-n or EX-n it breaks, or the failed gate. No citation, no FAIL: a finding that cites nothing is a note, and it does not block |
| Problem and fix | one line each |
| Step | the chain step that should have caught it: request, PRD, FRD, UX, TP, spec, code, test or gate |
| Cause | why it got through, in one phrase (ambiguous FRD row, missing example, test written after code, no gate) |

Also fail anything beyond the FRD (L-13): code, files or behavior with no FR, EX, DT, ST or INV behind it. Warn when additions far exceed deletions with no stated reason.

List all findings in round 1. Do not hold any back for later.

## Rounds 2 and 3

Check only the round 1 findings, and new defects in lines changed since the last round. Do not reopen what passed. A reviewer who finds a new class of issue in untouched code writes it as a note for the retro, not a FAIL.

## Stop rule

At most three rounds. If findings remain after round 3, stop and give the owner the open findings and your recommendation; the owner decides.

## Output

A verdict (PASS or FAIL), the findings table, the rounds used, and the log: one row per finding with Step and Cause, kept with the pull request. A class seen twice goes to `/scriptorium:retro`. A reviewer is measured too: if re-running you on the unchanged change gives different FAILs, report that as noise.
