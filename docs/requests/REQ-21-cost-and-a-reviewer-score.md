# REQ-21: Cost per accepted change, and a score for the reviewer

Status: Open

## Summary

Scriptorium measures rework but not what a change costs, and it does not score the reviewer it relies on. Uber measures each agent per outcome (cost per merged PR, revert rate) and picks each agent's model on a benchmark of its own past work. Add cost per accepted spec and revert rate to the metrics, and use the returned changes in rework.md as a benchmark to score reviewer configurations.

Last change: 2026-11-27, opened from the Uber research

## Who asked and when
The owner, 2026-11-27, after reading Uber's post with the lead: "Dale" to registering the gaps it showed.

## What they said
> Look at this post, it is interesting because in part it is the process I follow. (Translated from Spanish.) Then, on the proposal to record it: go ahead. (Translated from Spanish.)

## The problem behind it
The chain claims to lower rework, and the metrics can show it, but nothing shows whether the whole chain costs less than building without documents. The reviewer decides what is accepted, and its model, prompt and round cap are chosen by judgment, not measured.

## Evidence
[research/2026-11-27-uber-factory-and-harness2.md](../research/2026-11-27-uber-factory-and-harness2.md): Uber's outcome metrics and uReview's benchmark (precision, recall, F1, cost per review on real PRs with known bugs). Here: docs/metrics/rework.md holds returned changes with their cause. Unknown: whether the harness exposes token cost per session to a hook.

## Decision
Open: for the owner. Proposed: a metrics FRD row for cost per accepted spec and revert rate; a rework-slice spec that replays rework rows against a reviewer configuration and reports precision and recall.
