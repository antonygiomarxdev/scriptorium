---
name: ops
description: Run work that is not product - CI, pipelines, build and lint configuration, dependencies, environment files, refactors - as small specs resting on a TP, an ADR, a CHECKS row or an accepted request. Use for CI/CD work, a red pipeline, a configuration change, a dependency bump or a refactor, and for an agent that keeps CI green.
argument-hint: <what to change, or the failing job>
---

# Work that is not product (REQ-1, L-15)

Same small spec, different parent. Configuration is gated like code (D-30): an agent that edits a workflow or a lint setting can turn a check off, so every such edit needs a spec.

## Pick the parent

| Work | Rests on | Rows quoted | Done when |
|---|---|---|---|
| A red CI job | the CHECKS row the job enforces, or an accepted request | the CHECK-n row, or the failing step and its error in the request | that job's command, green |
| A configuration change (strict mode, lint rule, runtime version) | the cross-cutting TP `docs/tp/TP.md` or an ADR | the decision row | typecheck, build or lint |
| A dependency bump, a refactor | an accepted request (a chore) | the request's reason and files | tests and typecheck |
| A failure seen twice | first `/scriptorium:retro`, which adds a CHECK-n | that CHECK-n | its replay |

When nothing says why the configuration is the way it is, write the decision first: a TP row, or an ADR when it is hard to reverse.

## Steps

1. Record the request (`/scriptorium:request`) unless a CHECKS row, TP or ADR already says what must hold.
2. Write the spec with `/scriptorium:spec` in `docs/ops/specs/` (or a folder named for the area, such as `docs/ci/specs/`), resting on that parent.
3. Done when is one command that reproduces the job locally: the same command CI runs, not "CI is green".
4. Never weaken a check to make it pass: removing a step, lowering a threshold, skipping a test or adding an ignore is a change to the CHECKS row or the TP, and the owner approves it.

## An agent that keeps CI green

Each red run is one small spec of a fix: the failing job is the row, its command is Done when. The agent never edits a workflow without a spec. A failure class seen twice goes to `/scriptorium:retro` and becomes a CHECKS row, so the next agent cannot break it the same way.

## Releases

Every change a user would notice adds a changeset (`bunx changeset`); a change no user notices adds `bunx changeset --empty`. Where `.changeset/config.json` exists, pre-commit fails a commit that changes code without one (L-15).
