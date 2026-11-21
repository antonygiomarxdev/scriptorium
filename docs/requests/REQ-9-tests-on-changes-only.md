# REQ-9: CI runs only what a change affects

Status: Accepted

## Summary

Every push and pull request runs the whole suite on two systems, whatever changed. The owner asks that pipelines run only when there are changes, and only on what they affect.

Last change: 2026-11-20, templates and skills count as product (L-20)

## Who asked and when
The owner, 2026-11-20.

## What they said
> Be careful with the tests, and let's optimize the pipelines and how tests run, because I don't want us running everything. It should run only when there are changes, and on the changes. There is no point running everything. (Translated from Spanish.)

## The problem behind it
The CI workflow runs all 175 tests, the typecheck, the format check, every document check and the example chain, on Linux and Windows, for a change to one line of a document.

## Evidence
[Research](../research/2026-11-20-mutation-and-affected-tests.md): `bun test --changed` ran 2 of 16 test files for a change to scripts/gate.ts and none for a change to README.md; it misses tests that spawn a script or read a file, such as the hook tests.

## Decision
Accepted by the owner 2026-11-20 as work that is not product (/scriptorium:ops), D-35:
- AFF-1: a pull request or push runs only the test files its changed files affect: those found by following imports from the changed files, plus those the committed map of SPEC-01-3 names for each changed script.
- AFF-2: a change to a file the map cannot place (package.json, the lockfile, tsconfig, a workflow, the map itself) runs the whole suite.
- AFF-3: a change with no code, test or configuration file runs no tests, no typecheck and no format check; the document checks still run. The markdown under templates/ and skills/ is product, not a document (L-20).
- AFF-4: the Windows leg runs only when a code, test or configuration file changed; the example chain runs only when scripts/ or examples/ changed.
- AFF-5: the whole suite runs once a night on main, with the mutation run, so a missed dependency shows within a day.
- AFF-6: if the plan cannot be computed (the script fails or prints nothing), CI runs the whole suite; CI takes "did code change" from the script, not from a second list in the workflow (L-19).
