# SPEC-01-3: Nightly mutation testing with an issue

Status: Approved (2026-11-20)
Approval: content EHF5PZ33meVq; rests on ../../requests/REQ-8-nightly-mutation.md FvsMWNLxxHHW
Rests on: ../../requests/REQ-8-nightly-mutation.md

## Summary

A scheduled workflow runs StrykerJS with its command runner on main every night. A script maps each source file to its own test files, runs the tool file by file, and turns the survivors into one issue labeled mutation. Nothing runs it locally.

Last change: 2026-11-20, MUT-6 after review (L-18)

## Rows

- MUT-1: mutation testing runs only in CI, every night on main and on manual dispatch; no project script, hook or check runs it on a developer machine, and the tool is installed in the job, not in the project's dependencies.
- MUT-2: each script's mutants run only that script's own test files, from a committed map; a script missing from the map is reported as unmapped.
- MUT-3: the survivors of a run go into one issue labeled mutation, grouped by file with line and mutator; if an issue labeled mutation is already open, the run comments on it instead of opening another; a run with no survivors opens nothing.
- MUT-4: the run reuses the verdicts of unchanged mutants from the previous run, cached between runs.
- MUT-5: the tool is pinned to an exact version from its verified publisher.
- MUT-6: a file whose mutation run fails or writes no report fails the job, and the issue lists it under "Run failed for:" (L-18).

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/mutation.ts` | Create | The map from each scripts/*.ts file to its test files; `unmapped()`; `summary(report)` turns the tool's JSON report into the issue body, grouped by file, with line and mutator, or undefined when nothing survived |
| `.github/workflows/mutation.yml` | Create | cron at 09:00 UTC (03:00 in UTC-6) and workflow_dispatch, on main only; installs @stryker-mutator/core@10.1.1 in the job; runs each mapped file with its tests, incremental file cached; creates or comments on the open mutation issue with gh |
| `package.json` | Change, only if needed | No mutation dependency and no script that runs it |

## Tests first
MUT-2 and MUT-3 by unit tests of `scripts/mutation.ts`: an unmapped script is reported; the list of real scripts is not empty; every mapped test file exists; the summary command merges several reports; a report with survivors gives a body grouped by file with line and mutator; a report with none gives undefined. MUT-1, MUT-4 and MUT-5 by a test that reads the workflow file: schedule and dispatch only, the exact pinned version, the cache step, and no mutation entry in package.json. MUT-6 by a test that the workflow records a failed or missing report per file, writes "Run failed for:" and exits non-zero.

## Build
StrykerJS core with `testRunner: "command"` and `coverageAnalysis: "off"`; `--mutate <file>` and `commandRunner.command: "bun test <its tests>"` per file; `--incremental`. The issue step uses `gh issue list --label mutation --state open` to decide between create and comment.

## Done when
`bun test test/mutation.test.ts`

## Out of scope
A mutation gate on pull requests; the rework queue rows for survivors, which triage adds.

## Open questions
None.
