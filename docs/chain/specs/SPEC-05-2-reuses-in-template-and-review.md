# SPEC-05-2: The template and the skills ask for reuse

Status: Approved (2026-11-21)
Approval: content EAENjTC0opnt; rests on ../frd/FRD-05-reuse-before-new.md WBOgLz46SVBN
Rests on: ../frd/FRD-05-reuse-before-new.md

## Summary

The spec template gets a Reuses section; the spec skill tells the writer to search before naming new code; the review skill fails duplicated code as cause C-13.

Last change: 2026-11-21, quotes EX-9 for the review clause; Done when runs the text tests

## Rows

| EX-5 | RULE-1 | positive | A spec's Reuses section says "Nothing to reuse: the first script that reads the host's notebook format" | the spec check runs | it passes |
| EX-9 | RULE-3 | negative | A change adds a function whose body repeats one already in another file | review runs | it fails citing FR-CHAIN-05-5, and the rework queue gets a finding with cause C-13 |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `templates/SPEC.md` | Change | A `## Reuses` section between Files and Tests first, with the three allowed forms |
| `skills/spec/SKILL.md` | Change | Before Files: search the code for what already does the job and list it under Reuses |
| `skills/review/SKILL.md` | Change | Fail new code that repeats existing code; log it with cause C-13 |

## Reuses
- `templates/SPEC.md`: the section goes into the existing template, not a new one.
- Precedent: SPEC-02-4-caps-excerpt-done.md, which changed the template and the spec skill together.

## Tests first
EX-5, EX-9, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Text only. The template passes the spec check once filled in.

## Done when
`bun test test/check.test.ts test/text.test.ts`

## Out of scope
The check itself (SPEC-05-1).

## Open questions
None.
