# SPEC-01-3: Status, pre-commit and the rework command

Status: Approved (2026-11-20)
Approval: content p1JINZZfCkw9; rests on ../frd/FRD-01-rework-queue.md LeMG8yiTCSTC
Rests on: ../frd/FRD-01-rework-queue.md

## Summary

status and pre-commit run reworkFails through the format gate; `scriptorium rework` prints the open findings per cause and per step.

Last change: 2026-11-20, first draft

## Rows

| EX-6 | RULE-2 | negative | The same log, and a commit stages any file | pre-commit runs | it is blocked with the same line |
| EX-14 | RULE-5 | positive | The log has C-1 with 2 open findings at step FRD and C-2 with 1 at step spec | the rework report runs | it prints "C-1 (FRD): 2", "C-2 (spec): 1", "FRD: 2", "spec: 1" and "open: 3" |
| EX-15 | RULE-6 | positive | A format 2 project with the log of EX-5 | status runs | it passes and prints "WARN (format 3):" with the EX-5 line |
| EX-17 | RULE-5 | boundary | The log lists causes and no open findings | the rework report runs | it prints "open: 0" |
| EX-18 | RULE-6 | negative | A format 3 project with the log of EX-5 | status runs | it fails with the EX-5 line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | `status` adds reworkFails(root) through gate() |
| `scripts/pre-commit.ts` | Change | Fails a commit while reworkFails is not empty, through gate() |
| `scripts/cli.ts` | Change | `rework [root]` prints "C-n (step): count" per cause with findings, "step: count" per step, and "open: N" |

## Reuses
- `scripts/rework.ts` `readQueue`, `reworkFails` (SPEC-01-1, SPEC-01-2).
- `scripts/format.ts` `gate`, `readFormat`.
- Precedent: SPEC-03-3-gate-other-rules.md, which wired format-gated rules into status and pre-commit.

## Tests first
EX-6, EX-14, EX-15, EX-17, EX-18, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The report prints from readQueue only; it computes nothing a check does not.

## Done when
`bun test test/rework.test.ts test/cli.test.ts test/hooks.test.ts`

## Out of scope
History over time and the rework skill (metrics FRD-02).

## Open questions
None.
