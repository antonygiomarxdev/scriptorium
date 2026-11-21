<!-- Links are relative to where this document lives once copied (docs/<slice>/...), not to templates/. -->
# FRD-NN: <feature>

Status: Draft

## Summary

<What the feature does, for whom, and the rules that matter most. Five lines at most. Kept current: a change that matters anywhere below shows here.>

Last change: <YYYY-MM-DD, what changed>

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids. A diagram goes wherever a flow or a state machine exists.

## Why
<REQ-n.>

## Requirements covered
<R-<SLICE>-n.>

## Behavior
One sentence per row, in EARS form: WHEN <event>, WHILE <state>, IF <unwanted> THEN, WHERE <option>, or always. More than three conditions: use the decision table.

| ID | Pattern | Requirement |
|---|---|---|
| FR-<SLICE>-NN-1 | WHEN | WHEN <event>, the system shall <response>. |

## Rules and examples
The examples are the oracle: concrete input and expected output, approved by the owner. Every rule has at least one positive and one negative or boundary example.

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | <rule> | FR-<SLICE>-NN-1 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | <state> | <action> | <exact result> |
| EX-2 | RULE-1 | negative | <state> | <action> | <exact result> |

## Decision table
<DT-n rows, one per combination of conditions; or "n/a: <reason>".>

## States
<ST-n: states and transitions, including the ones that must not happen (Mermaid stateDiagram); or "n/a: <reason>".>

## Invariants
<INV-n: what must always hold, linked to INVARIANTS.md; or "n/a: <reason>".>

## Quality criteria
Each row measurable (metric, threshold, how measured) or "n/a: <reason>". "Fast", "secure" or "easy" fail.

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | |
| QC-2 | Performance efficiency | |
| QC-3 | Compatibility | |
| QC-4 | Interaction capability | |
| QC-5 | Reliability | |
| QC-6 | Security | |
| QC-7 | Maintainability | |
| QC-8 | Flexibility | |
| QC-9 | Safety | |

## Cross-cutting
<Each row of CROSS-CUTTING.md: CC-n applies (how) or "n/a: <reason>".>

## Information
<Fields the feature reads and keeps. No formats, no storage choice.>

## Open questions
<Q-n (Owner: <why only the owner can answer>), Q-n (Research) or Q-n (Lead). Research and Lead questions are answered by the team, as a D-n with its source or an L-n, before the owner is asked. Must be empty to approve.>

## Acceptance criteria
<Generated from the examples, decision table and states: AC-n, Given/When/Then, one per EX, DT row and ST cell. Never written by hand.>
