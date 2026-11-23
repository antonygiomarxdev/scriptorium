# Metrics PRD

Status: Approved (2026-11-21)
Approval: content JwxEpZqGsLDf; rests on ../PRODUCT.md WYQLLUQoIF4u

## Summary

Rework must go down, and the chain must show which step lets it through. Every finding that sends work back is queued with one cause from a fixed list. A cause that repeats with no proven prevention blocks the project until someone writes one, and a prevention that fails blocks again. The queue only holds open findings, so it shrinks when the process improves and grows when it does not.

Last change: 2026-11-21, rework history and the rework skill (R-METRICS-8, R-METRICS-9; REQ-12, D-33)

Part of [the product overview](../PRODUCT.md). States what, not how: name no technology.

## Why
REQ-6 ([request](../requests/REQ-6-rework-at-a-glance.md)), with D-32 in [the decision inbox](../DECISIONS.md). An append-only log of findings, kept elsewhere, grew without changing the process, and the same failures came back.

## Use cases
UC-8, UC-12.

## Requirements
- **R-METRICS-1.** Every finding names one cause from the project's fixed list of causes; a finding with no cause or an unknown cause fails the check.
- **R-METRICS-2.** A cause with two or more open findings and no prevention fails status and pre-commit, naming the cause and the step to fix.
- **R-METRICS-3.** A prevention is a project check with a replay of the failure it catches; a cause whose prevention is missing or unproven fails.
- **R-METRICS-4.** A finding of a cause that already has a prevention, dated after it, fails, naming the prevention that did not hold.
- **R-METRICS-5.** The log holds only open findings: a finding of a cause with a prevention, dated before it, must be removed, and the check says so.
- **R-METRICS-6.** One command prints the open findings per cause and per step, so nobody counts by hand.
- **R-METRICS-7.** Under a project pin below the format that introduced these rules, they only warn.
- **R-METRICS-8.** One command rebuilds every finding the queue ever held from its history, with the date each opened and closed, and prints them by week, by change and by cause, so the trend shows although closed findings leave the queue (REQ-12, D-33).
- **R-METRICS-9.** A skill takes the cause with the most open findings, reads its findings and their history, and writes a request for the owner: the evidence, the step that let the findings through, a proposed prevention with its replay, and how the owner will see it worked. It writes nothing else (REQ-12, D-33).

## Principles honored
Principle 4: the loop is enforced by checks, not by memory. Principle 8: the queue measures the process. Principle 6: the log stays short because closed findings leave it.

## Non-goals
Scoring people. Counting time. Keeping closed findings in the log; git keeps them.

## Dependencies
The project checks register (CHECKS) and its replays; the status check and pre-commit.

## Success criteria
- The queue's open count falls between runs once preventions ship.
- No cause reaches two open findings without the check failing.
- A prevented cause that comes back is reported the day it comes back.

## Open questions
None.
