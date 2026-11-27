# REQ-22: A verdict for every prevention, and the two lenses named

Status: Accepted

## Summary

The rework queue proves a prevention by replaying the failure it catches, but it does not record whether the prevention lowered its cause afterwards, and preventions that ship together are credited together. Add a verdict per prevention (helped, hurt, no observed effect, confounded), taken from the findings after it shipped. Also name what Harness2 calls the two lenses: Scriptorium holds what a practitioner knows, puppeteering how the agent works.

Last change: 2026-11-27, the verdict is computed by the report, not written by hand (owner)

## Who asked and when
The owner, 2026-11-27, after the lead read google-research/harness2.

## What they said
> Yes, it would be excellent, it is just what is missing and how we can lower rework. (Translated from Spanish.)

## The problem behind it
A replay shows a check catches the old failure. It does not show that rework fell. When two template changes and a check ship in one release and C-1 drops, nothing says which one did it, so the next change copies all three.

## Evidence
- docs/metrics/rework.md: a prevention is "a CHECK-n of the project's checks, with a replay of the failure it catches, and the date it shipped"; no field for its effect.
- Harness2 (github.com/google-research/harness2, harness2/core/prompts.py): verdicts `helped|hurt|no observed effect|confounded`, with `confounded` preferred "whenever a candidate changed several components at once"; and two editors kept apart, INV ("how the agent WORKS") and DOM ("what a PRACTITIONER knows").
- [research/2026-11-27-uber-factory-and-harness2.md](../research/2026-11-27-uber-factory-and-harness2.md).

## Decision
Accepted.
- The rework report computes each prevention's verdict from the queue's history; nobody writes it by hand (owner, 2026-11-27). Specified in metrics FRD-04 (R-METRICS-10).
- Answered now: README.md says that Scriptorium is the practitioner's lens and puppeteering the agent's.

PRD row added when the owner approves metrics FRD-04, so the approved metrics PRD does not drift before then:
> R-METRICS-10. The rework report gives each prevention a verdict computed from the queue's history: helped, hurt, no observed effect, or confounded when the evidence cannot single it out; nobody writes it by hand (REQ-22).

Short path: `README.md`
