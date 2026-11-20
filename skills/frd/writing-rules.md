# Writing rules for an FRD

Read by the `frd` skill. Sources: EARS (Mavin et al.), ISO/IEC 25010, specification by example.

## EARS: one sentence per behavior row

Every Behavior row has one pattern word in its Pattern cell and the word "shall" in its sentence.

| Pattern | Form | Example |
|---|---|---|
| WHEN | WHEN <event>, the system shall <response>. | WHEN a family books a slot, the system shall confirm it. |
| WHILE | WHILE <state>, the system shall <response>. | WHILE a slot is full, the system shall hide its Book button. |
| IF | IF <unwanted event> THEN the system shall <response>. | IF a family has booked this week THEN the system shall refuse a second booking. |
| WHERE | WHERE <option is present>, the system shall <response>. | WHERE a pantry offers delivery, the system shall show a delivery choice. |
| always | The system shall <response>. | The system shall always show the pickup time in the pantry's time zone. |

A row with more than three conditions goes in a decision table instead. One row, one behavior: split a sentence that holds "and then".

## Rules and examples: the oracle

A rule is a fact that holds in the feature. Examples are concrete: input and exact expected output, with real values. The owner approves them; tests come from them.

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | One booking per family per week. | FR-PICKUPS-01-2 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | the Diaz family has no booking in the week of 2026-11-23 | it books Tuesday 10:00 | the booking exists and Tuesday 10:00 has one place fewer |
| EX-2 | RULE-1 | negative | the Diaz family booked Tuesday 10:00 | it books Thursday 14:00 the same week | the booking is refused with "one booking per week" |
| EX-3 | RULE-1 | boundary | the Diaz family booked on Sunday 2026-11-22 | it books on Monday 2026-11-23 | the booking succeeds: the week starts on Monday |

Every rule has at least one positive and one negative or boundary example. Kind is one of positive, negative, boundary. Bad "Then": "it works", "an error is shown". Good: the exact message, count or state.

## Decision table: when conditions combine

Use one when a result depends on three or more conditions, or when a prose rule keeps growing "unless". One row per combination; every combination appears.

| ID | Member | Slot has room | Booked this week | Result |
|---|---|---|---|---|
| DT-1 | yes | yes | no | book |
| DT-2 | yes | yes | yes | refuse |
| DT-3 | yes | no | no | waitlist |

Write "n/a: only one condition decides" when it does not apply.

## States: when the thing has a lifecycle

Use a state table or a Mermaid stateDiagram when an object changes state over time (booking: requested, confirmed, collected, cancelled). Name the transitions that must not happen (collected back to confirmed) as their own ST rows. Ids: ST-n.

## Invariants

What must always hold: "free places never go below zero". Id INV-n, linked to `docs/INVARIANTS.md`, which names the executable check. Write "n/a: <reason>" when the feature adds none.

## Quality criteria (ISO/IEC 25010)

QC-1 Functional suitability, QC-2 Performance efficiency, QC-3 Compatibility, QC-4 Interaction capability, QC-5 Reliability, QC-6 Security, QC-7 Maintainability, QC-8 Flexibility, QC-9 Safety. Each row states metric, threshold and how it is measured.

| Bad | Good |
|---|---|
| Fast. | The slot list appears in under 1 s at p95 with 200 slots, measured in the end-to-end run. |
| Secure. | A family can read only its own bookings: a request for another family's booking returns not found, tested in EX-5. |
| n/a | n/a: the feature has no screen. |

## Acceptance criteria are generated

AC-n come from the examples, decision table and states: one per EX, per DT row, per ST cell, written as Given/When/Then from those rows. Do not write them by hand; a hand-written criterion drifts from its example.
