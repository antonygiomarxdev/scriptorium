# SPEC-03-2: Gate the small spec rules

Status: Approved (2026-11-20)
Approval: content 3-PgKmLtR_iZ; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

Tag the small spec rules as format 2 and keep the format 1 spec check, so a 0.3.0 spec passes with warnings until its project migrates.

Last change: 2026-11-20, first draft

## Rows

| EX-1 | RULE-1 | positive | A project has no .scriptorium folder and a spec with no Rests on line and three tasks | status and the spec check run | they pass and print "WARN (format 2):" lines for the spec |
| EX-2 | RULE-1 | negative | The same project has .scriptorium/config.json holding {"format": 2} | the spec check runs | it fails with the missing Rests on line |
| DT-2 | no | no | Failure |
| DT-3 | no | yes | Warning naming the rule's format |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | checkSpec and the missing Rests on in chainStatus tagged format 2; the format 1 spec check (one spec per FRD, tasks covering every FRD id) restored from the 0.3.0 tag and used under format 1 |
| `scripts/hook-doc-check.ts` | Change | The spec check through `gate` with the project's pin |

## Tests first
EX-1, EX-2, DT-2, DT-3, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
Under format 1 run both: the format 1 check counts, the format 2 failures print as warnings. Under format 2 only the format 2 check runs.

## Done when
`bun test test/check.test.ts test/hooks.test.ts`

## Out of scope
The coverage scan, the lint and pre-commit (SPEC-03-3).

## Open questions
None.
