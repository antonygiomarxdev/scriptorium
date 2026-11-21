# SPEC-01-4: CI runs only what a change affects

Status: Approved (2026-11-21)
Approval: content oXc5v7hXlclP; rests on ../../requests/REQ-9-tests-on-changes-only.md w5IwVNw9adeK
Rests on: ../../requests/REQ-9-tests-on-changes-only.md

## Summary

A script turns the changed files of a push or pull request into the test files to run, reusing Bun's import graph and the script-to-test map of SPEC-01-3. CI runs those, skips tests for document-only changes, skips the Windows leg and the example chain when nothing they cover changed, and the nightly run on main covers the rest.

Last change: 2026-11-20, templates and skills count as product (L-20)

## Rows

- AFF-1: a pull request or push runs only the test files its changed files affect: those found by following imports from the changed files, plus those the committed map of SPEC-01-3 names for each changed script.
- AFF-2: a change to a file the map cannot place (package.json, the lockfile, tsconfig, a workflow, the map itself) runs the whole suite.
- AFF-3: a change with no code, test or configuration file runs no tests, no typecheck and no format check; the document checks still run. The markdown under templates/ and skills/ is product, not a document (L-20).
- AFF-4: the Windows leg runs only when a code, test or configuration file changed; the example chain runs only when scripts/ or examples/ changed.
- AFF-5: the whole suite runs once a night on main, with the mutation run, so a missed dependency shows within a day.
- AFF-6: if the plan cannot be computed (the script fails or prints nothing), CI runs the whole suite; CI takes "did code change" from the script, not from a second list in the workflow (L-19).

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/affected.ts` | Create | `plan(changed: string[])`: "all", "none", or the test files: the map's tests for each changed script plus the changed test files themselves; the import-graph part stays with `bun test --changed` |
| `.github/workflows/ci.yml` | Change | Computes the changed files against the base (pull request) or the previous commit (push), runs `bun test --changed=<base>` plus the plan's files, or the whole suite, or nothing; Windows leg and example chain gated on changed paths |
| `.github/workflows/mutation.yml` | Change | The nightly run also runs the whole suite |

## Tests first
AFF-1, AFF-2 and AFF-3 by unit tests of `plan()`: a changed hook script gives its mapped test file; a changed test file gives itself; package.json gives "all"; only README.md gives "none". AFF-2 also by plan(["test/fixtures/x.json"]) giving "all". AFF-4 and AFF-5 by a test that reads both workflow files. AFF-6 by a test that the workflow treats a failed or empty plan as "all" and takes the code-changed output from the script.

## Build
Reuse the map exported by `scripts/mutation.ts` (SPEC-01-3); do not keep a second map. The changed files come from `git diff --name-only <base>...HEAD`.

## Done when
`bun test test/affected.test.ts`

## Out of scope
Running affected tests in the local pre-commit hook.

## Open questions
None.
