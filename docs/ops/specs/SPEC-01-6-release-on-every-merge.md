# SPEC-01-6: A release on every change that carries a changeset

Status: Approved (2026-11-22)
Approval: content nmVYK1RhjYzF; rests on ../../requests/REQ-16-release-on-every-merge.md OxvSQXeuUw2n
Rests on: ../../requests/REQ-16-release-on-every-merge.md

## Summary

version.yml runs after CI passes on a push to main. With changesets pending it versions, commits to main, tags and creates the GitHub release itself; with none it does nothing. No pull request is opened.

Last change: 2026-11-22, first draft

## Rows

- RL-1: On a push to main that carries changesets, after CI passes on that push, the workflow runs the version step, commits the version and changelog to main, tags it and creates the GitHub release; no Version Packages pull request is opened.
- RL-2: A push with no changeset releases nothing.
- RL-3: Publishing to npm stays out of scope until the owner asks for it.

## Files
| Path | Create or change | Holds |
|---|---|---|
| `.github/workflows/version.yml` | Change | Triggered by a successful CI run on main; versions, commits, tags and releases when changesets are pending |
| `test/version.test.ts` | Change | Tests that read the workflow: it waits for CI, opens no pull request, tags only with changesets, and never runs npm publish |

## Reuses
- `.github/workflows/version.yml`: its tag-and-release step, kept as it is.
- `test/version.test.ts`: its tests of the version workflow.
- Precedent: SPEC-01-4-tests-on-changes-only.md.

## Tests first
RL-1, RL-2, RL-3, written by a tester who has not seen the workflow; each test carries a covers tag ops/REQ-16/RL-n.

## Build
Trigger on workflow_run of CI, completed, on main, and run only when it succeeded. The commit made with the workflow token starts no workflow, so it cannot loop. The tag step stays as it is.

## Done when
`bun test test/version.test.ts`

## Out of scope
npm publishing (RL-3).

## Open questions
None.
