# SPEC-03-1: The /scriptorium:rework skill

Status: Approved (2026-11-21)
Approval: content 6nlpinrvClDH; rests on ../frd/FRD-03-rework-skill.md Giy4Vq0uPy1r
Rests on: ../frd/FRD-03-rework-skill.md

## Summary

skills/rework/SKILL.md tells the agent how to pick the heaviest cause, read its findings and history, and write one request for the owner, and nothing else.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | positive | C-1 has 24 open findings and C-2 has 6 | the skill runs | it plans C-1 |
| EX-2 | RULE-1 | boundary | C-2 (Spec) and C-5 (FRD) have 3 open findings each | the skill runs | it plans C-5, because FRD comes before Spec in the chain |
| EX-3 | RULE-1 | negative | The queue has no open finding | the skill runs | it says there is nothing to plan and writes no request |
| EX-4 | RULE-2 | positive | C-1 is the heaviest cause | the skill runs | it writes docs/requests/REQ-n with Evidence, Step, Prevention and replay, and How we will see it worked |
| EX-5 | RULE-2 | negative | C-1 has prevention CHECK-3 and a finding dated after it | the skill runs | the request is about why CHECK-3 did not hold |
| EX-6 | RULE-2 | negative | The skill has run | the diff is read | only the new request file changed |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `skills/rework/SKILL.md` | Create | The skill: pick the cause with most open findings, earliest step on a tie; read `scriptorium rework` and `rework history`; write docs/requests/REQ-n with Evidence, Step, Prevention and replay, How we will see it worked; a failed prevention makes the request about why it failed; no open finding: say so and write nothing; never edit checks, templates, the queue or the cause list |
| `test/install.test.ts` | Change | The skill text names each rule above |

## Reuses
- `skills/check/SKILL.md`: how a CHECK-n with its replay is written; the plan proposes one.
- `templates/REQUEST.md`: the request the skill writes.
- Precedent: SPEC-06-2-skills-ask-less.md, which wrote skill text with tests.

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, EX-6, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Markdown by the lead; the tester writes the text test. The first run on this repository's queue is the acceptance: its request goes to the owner.

## Done when
`bun test test/install.test.ts`

## Out of scope
The history command (SPEC-02-1).

## Open questions
None.
