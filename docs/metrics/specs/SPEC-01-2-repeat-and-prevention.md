# SPEC-01-2: A repeated cause blocks; a prevention must hold

Status: Approved (2026-11-20)
Approval: content s6f2QVCV8kYM; rests on ../frd/FRD-01-rework-queue.md LeMG8yiTCSTC
Rests on: ../frd/FRD-01-rework-queue.md

## Summary

reworkFails gains RULE-2 to RULE-4: a cause with two open findings and no prevention, an unproven prevention, a prevention that did not hold, and a closed finding still listed.

Last change: 2026-11-20, first draft

## Rows

| EX-4 | RULE-2 | positive | Cause C-1 has one open finding and no prevention | status runs | it passes |
| EX-5 | RULE-2 | negative | Cause C-1, step FRD, has open findings R-1 and R-2 and no prevention | status runs | it fails with "C-1 (FRD) found 2 times with no prevention: R-1, R-2" |
| EX-7 | RULE-2 | boundary | Cause C-2 is in the list with no findings and no prevention | status runs | it passes |
| EX-8 | RULE-3 | negative | Cause C-1 names prevention CHECK-4 and the project checks have no CHECK-4 | status runs | it fails with "C-1: prevention CHECK-4 does not exist" |
| EX-9 | RULE-3 | negative | Cause C-1 names CHECK-4, which has a command but no replay | status runs | it fails with "C-1: prevention CHECK-4 has no replay" |
| EX-10 | RULE-3 | negative | Cause C-1 has prevention CHECK-4 dated 2026-11-21 and finding R-7 of C-1 is dated 2026-11-22 | status runs | it fails with "C-1: CHECK-4 did not prevent R-7" |
| EX-11 | RULE-3 | boundary | The same prevention and finding R-7 dated 2026-11-21 | status runs | it fails with "C-1: CHECK-4 did not prevent R-7": the same day counts as after |
| EX-12 | RULE-4 | negative | Cause C-1 has prevention CHECK-4 dated 2026-11-21 and finding R-2 of C-1 is dated 2026-11-20 | status runs | it fails with "R-2: closed by CHECK-4, remove it from the log" |
| EX-16 | RULE-3 | positive | Cause C-1 has prevention CHECK-4 with a command and a replay, and no finding of C-1 is open | status runs | it passes |
| DT-1 | none | n/a | 0 or 1 | Pass |
| DT-2 | none | n/a | 2 or more | Fail: repeated with no prevention |
| DT-3 | named but missing or with no replay | any | any | Fail: unproven prevention |
| DT-4 | proven | 1 or more | any | Fail: the prevention did not hold |
| DT-5 | proven | 0 | 1 or more | Fail: remove the closed findings |
| DT-6 | proven | 0 | 0 | Pass |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/rework.ts` | Change | The decision table of FRD-01 per cause; a prevention CHECK-n is proven when the project's CHECKS.md has that row with a command and a replay |

## Reuses
- `scripts/lint-docs.ts`: the CHECKS rules already read the Command and Replay cells; read them the same way.
- Precedent: SPEC-01-1-read-the-queue.md.

## Tests first
EX-4, EX-5, EX-7, EX-8, EX-9, EX-10, EX-11, EX-12, EX-16, DT-1, DT-2, DT-3, DT-4, DT-5, DT-6, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Dates compare as YYYY-MM-DD strings; the same day counts as after (EX-11).

## Done when
`bun test test/rework.test.ts`

## Out of scope
Wiring into status and pre-commit (SPEC-01-3).

## Open questions
None.
