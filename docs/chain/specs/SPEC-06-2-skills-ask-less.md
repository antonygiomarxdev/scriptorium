# SPEC-06-2: The skills research before asking

Status: Approved (2026-11-21)
Approval: content iIcPUyr959JP; rests on ../frd/FRD-06-who-answers.md JFJj2H12kMt8
Rests on: ../frd/FRD-06-who-answers.md

## Summary

The templates show the three forms; the shared scriptorium skill, which every document skill reads, tells the agent to close Research and Lead questions first and to ask the owner once, with a recommendation each; the review skill logs cause C-14.

Last change: 2026-11-21, quotes EX-7 for the review clause; Done when runs the text tests

## Rows

| EX-1 | RULE-1 | positive | A draft FRD has "- Q-1 (Research): where the 42-day limit comes from" | the document check runs | it passes |
| EX-7 | RULE-2 | negative | An FRD holds a Research question and the owner is asked to approve it | review of the session runs | the rework queue gets a finding with cause C-14 |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `templates/` | Change | Every template's Open questions section shows the three forms |
| `skills/scriptorium/SKILL.md` | Change | A rule: research and decide first; ask the owner only Owner questions, together, each with a recommendation |
| `skills/review/SKILL.md` | Change | Log a question asked of the owner that research could answer with cause C-14 |

## Reuses
- `skills/scriptorium/SKILL.md`: the rule goes into the shared skill every other skill reads, not into each skill.
- Precedent: SPEC-05-2-reuses-in-template-and-review.md, which changed the template and the review skill together.

## Tests first
EX-1, EX-7, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Text only. Each filled template passes the check.

## Done when
`bun test test/check.test.ts test/text.test.ts`

## Out of scope
The check (SPEC-06-1).

## Open questions
None.
