---
name: rework
description: Turn the heaviest cause of the rework queue into an improvement plan, written as one request for the owner, with the evidence, the step that let the findings through, a proposed prevention with its replay, and how the owner will see it worked. Use when a cause blocks, when the queue grows, or on a regular review of rework.
---

# Rework plan (FRD-03 of the metrics slice, D-33)

The rework queue (`docs/metrics/rework.md`) holds open findings, each with one cause. This skill picks one cause and writes one plan for it as a request. The owner accepts or rejects the request; the prevention is built afterwards as small specs.

## Pick the cause

1. Run `scriptorium rework` for the open findings per cause and per step, and `scriptorium rework history` for the weekly trend.
2. Take the cause with the most open findings.
3. On a tie, take the cause of the earliest step in the chain: request, PRD, FRD before UX, TP, spec, build, test, check, review, lead, team practice and CI.
4. If the queue has no open finding, say there is nothing to plan and write nothing: no open finding means no request.

## Read the evidence

Read every open finding of that cause, and its history: how many opened and closed per week, which changes they came from. Read the project's research notes in `docs/research/` before proposing anything.

If the cause already names a prevention (a CHECK-n) and a finding is dated after it, the prevention did not hold. Then the plan is about why that CHECK-n failed, not a new one beside it.

## Write the request

Write one file, `docs/requests/REQ-n-<name>.md`, from the request template, with Status: Open and these parts:

- **Evidence:** the finding ids, the open count, and the weekly trend from the history.
- **Step:** the step of the chain that should have caught them, and why it did not.
- **Prevention and replay:** the proposed CHECK-n (see `/scriptorium:check`): what it runs, and the replay of one real finding it must catch.
- **How we will see it worked:** the open count of the cause falls, and no finding of it is dated after the prevention's Since date.

Never edit checks, templates, the queue or the cause list: the skill writes only the request. A new cause or a change to the cause list is the owner's decision.
