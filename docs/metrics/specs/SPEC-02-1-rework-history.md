# SPEC-02-1: scriptorium rework history

Status: Approved (2026-11-21)
Approval: content O5E2GGd878fO; rests on ../frd/FRD-02-rework-history.md Vt8WN98uvCSd
Rests on: ../frd/FRD-02-rework-history.md

## Summary

scripts/rework.ts rebuilds findings from the git log of the queue file; scriptorium rework history [root] prints them per week, change and cause.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | positive | R-1 is added in a commit of Tuesday 2026-11-17 and removed in a commit of Monday 2026-11-23 | the history command runs | it lists R-1 opened 2026-11-17 and closed 2026-11-23 |
| EX-2 | RULE-1 | boundary | R-1 is added and its Finding text is edited in a later commit | the history command runs | it lists R-1 once, opened at the first commit |
| EX-3 | RULE-1 | negative | R-2 is added, removed, and added again under the same id | the history command runs | it lists R-2 twice: one closed, one open |
| EX-4 | RULE-2 | positive | Two findings opened in the week of 2026-11-16, one of them closed in the week of 2026-11-23 | the history command runs | it prints "2026-11-16: opened 2, closed 0, open 2" and "2026-11-23: opened 0, closed 1, open 1" |
| EX-5 | RULE-2 | positive | Findings of changes SPEC-01-1 (2) and SPEC-01-2 (1), causes C-1 (2) and C-3 (1) | the history command runs | it prints "SPEC-01-1: 2", "SPEC-01-2: 1", "C-1: 2" and "C-3: 1" |
| EX-6 | RULE-2 | boundary | A project with no docs/metrics/rework.md | the history command runs | it prints "no rework queue" and exits 0 |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/rework.ts` | Change | `reworkHistory(root)`: reads `git log -p` of docs/metrics/rework.md, opens a finding at the commit that adds its row and closes it at the commit that removes it; a row whose text only changes keeps one finding; returns findings with id, change, cause, opened and closed dates |
| `scripts/cli.ts` | Change | `rework history [root]` prints per ISO week (Monday) "<monday>: opened N, closed N, open N", then "<change>: N" and "<cause>: N"; "no rework queue" and exit 0 when there is none |
| `test/rework.test.ts` | Change | The tests, on a temp git repository with dated commits |

## Reuses
- `scripts/rework.ts` `readQueue`: parses a queue text; history parses each version with it.
- `scripts/history.ts`: how it walks git log for one file.
- Precedent: SPEC-01-3-status-pre-commit-report.md, which added the rework report.

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, EX-6, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Commits are dated with GIT_AUTHOR_DATE and GIT_COMMITTER_DATE in the tests.

## Done when
`bun test test/rework.test.ts test/cli.test.ts`

## Out of scope
The rework skill (SPEC-03-1).

## Open questions
None.
