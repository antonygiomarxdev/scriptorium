# Technical Proposal: CI checks

Status: Approved (2026-11-21)
Approval: content pCUN-arbQqS2; rests on ../../requests/REQ-2-ci-checks.md fj4pCXo-E6aP
Rests on: ../../requests/REQ-2-ci-checks.md

## Summary

One CI job runs status and the docs lint (CI-1), another runs the tests (CI-2). Exports keep their plain file (ADR-0003) and data stays in the file database (ADR-0006).

Last change: 2024-05-12, first draft

## Context
REQ-2 asks for CI-1 and CI-2. The project keeps ADR-0003 from before it adopted the chain.

## Decisions
### TD-1: Where the checks run
- **Option A** one job for checks and tests: one runner, but a slow test hides a failing check for 10 minutes.
- **Option B** two jobs: twice the setup, each result visible on its own.

Chosen: Option B, because a failing check shows in under a minute. ADR: ADR-0006

### TD-2: Export format in CI artifacts
- **Option A** the plain file of ADR-0003: the printer reads it.
- **Option B** a spreadsheet: the printer cannot read it.

Chosen: Option A, because the printer reads nothing else. ADR: ADR-0003

## Architecture
Two jobs on each pull request: checks, tests.

## Information
Nothing is stored; the jobs read the repository.

## Interfaces and contracts
Each job exits non-zero on a failure; the contract test is the job itself.

## Threat model
Asset: the main branch. A change could skip the checks; both jobs are required before merge.

## Testing
CI-1 and CI-2 are proven by a pull request with a failing check that cannot merge.

## Risks
A slow runner delays merges.

## Open questions
None.
