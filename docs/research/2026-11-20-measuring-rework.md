# How large teams measure and lower rework

Status: Draft

## Summary

Which measures of rework hold up with tens of findings a month, how to classify causes so the numbers point at a step of the process, and what makes an improvement loop change the process instead of filling a log. Read 2026-11-20; [P] marks a primary source read, [S] a secondary summary not checked at its source.

Last change: 2026-11-20, first findings

- Measure per change, not counts: findings per reviewed change, first-pass yield, containment at the step of origin, and whether a fix held.
- Show a trend only on a control chart of 12 or more points, and act only on points outside its limits.
- A loop works when each action has one owner, a tracking id, a verifiable end state, preferably a check, and a recurrence check afterwards.

## Measures

- **DORA, 2024** [P] (dora.dev): change fail rate, and deployment rework rate, added in 2024: "percentage of deployments that are unplanned work to fix bugs". Per change, so it works at small volume. No benchmark numbers on the pages read.
- **DORA, 2025** [S] (RedMonk, 2025-12-18, quoting DORA): AI adoption "is currently associated with increasing instability"; AI amplifies existing strengths and weaknesses.
- **Defect removal efficiency and phase containment** [S] (Capers Jones): removed before delivery over all found; US average about 85%, best above 96%; requirements defects removed about 77%, coding defects about 95%. Containment per phase needs, for each finding, the phase that introduced it and the phase that found it.
- **First-pass yield and review rounds**: share of items that pass round 1, and rounds per item. Per item, fine at small numbers. No source read.
- **Code churn** [S] (GitClear 2025, 211M changed lines): churn 3.1% to 5.7%, refactoring share 25% to under 10%, 2020 to 2024. Correlation only.
- **Trends with few events** [S] (Wheeler, Quality Digest 2011): an individuals chart (XmR) works for counts unless the average per period is below 1; with rarer events chart the time between them. Use 12 or more points; flag a point outside the limits or a run of 8 on one side; ignore single-month moves.

## Classifying causes

- **IBM Orthogonal Defect Classification** [P] (Chillarege et al., IEEE TSE 1992): eight defect types; "the profile of the distributions provides the signatures of the process", and a departing type "points to the part of the process that is probably responsible". Classifying took about 4 minutes per defect against 1 hour of free-form analysis (Chillarege 2006).
- **CMMI Causal Analysis and Resolution** [P] (CMMI-DEV 1.3, SP 1.2): group outcomes by root cause; Pareto and fishbone as techniques.
- **What keeps a taxonomy useful**: few values, mutually exclusive, about what entered where, never about who; a separate "how found" field; an "other" value that is reviewed; frozen between reviews and changed only with a dated note.

## Loops that fail and loops that work

- **Google SRE Workbook, ch. 10** [P] (2018): "Without a formal tracking process, action items from postmortems are often forgotten, resulting in outages." Every action item has "an owner and a tracking number", a priority and "a verifiable end state"; "Improve" is too vague; "trying to change human behavior is less reliable than changing automated systems and processes". Treynor Sloss: "a postmortem without subsequent action is indistinguishable from no postmortem."
- **No rigorous study** of how many action items get done was found; the common "a third never done" figures are unsourced.
- **A fix held** only if the same class of finding stays at zero, or inside the chart's limits, over the next N changes.

## AI for improvement from defect data

- **Zalando, 2025** [P] (Kolesnikov, two years of AI postmortem analysis): manual review 15 to 20 minutes per postmortem, about 30 s with Claude Sonnet 4; small models hallucinated up to 40%; about 10% wrong attribution even with the larger model; humans sampled 100%, then 10 to 20% of the tags. One claimed result (about 25% fewer later datastore incidents) is the author's estimate.
- **No independent measured result** that AI-proposed process changes lower rework. AI fits summarising, tagging and spotting patterns, with humans sampling its tags and numbers taken from the data, not from the model.

## What it means here

The queue of D-32 already has cause classes and the recurrence check. It needs, per finding, the step that found it (to measure containment), a denominator of reviewed changes (to report rates, not counts), a chart of 12 or more points, and a loop of one action per top cause with one owner, a request id and a check as its end state.
