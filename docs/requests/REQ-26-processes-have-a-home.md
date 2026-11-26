# REQ-26: Engineering processes and runbooks have a home

Status: Accepted

## Summary

How a team releases, rolls back or answers an incident lives today in CLAUDE.md and HANDOFF.md, written by hand, with no template and no owner. Reserve docs/process/ with a template for processes and runbooks, so each names its owner, when it runs, its steps and the check that holds it. Build order: REQ-26, REQ-29, REQ-27, REQ-28.

Last change: 2026-11-26, accepted; runbooks added as a kind of process

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) Engineering processes need their own place, and the chain should tell a project where they go.

## The problem behind it
Process lives in CLAUDE.md and HANDOFF.md by hand. skills/adopt/SKILL.md:63 has no target for runbooks. Without a home a process goes stale unseen, and a rule inside it that no check holds reads as a promise nothing keeps.

## Evidence
This repository keeps its release and review process in CLAUDE.md and HANDOFF.md. An adopting project has runbooks with no place in the chain (REQ-24). How often a process goes stale: unknown.

## Decision
- PR-1: docs/process/ is reserved; a file docs/process/<name>.md is a new kind PROCESS in scripts/kinds.ts.
- PR-2: templates/PROCESS.md has these sections: Process, Kind, Owner, When, Steps, Check, Last change. Kind reads `process` or `runbook`.
- PR-3: The check fails a process missing a section, with no numbered step under Steps, or with Check empty or Kind other than the two values.
- PR-4: A process has no Status line and no approval; it is reviewed in the pull request that changes it.
- PR-5: A rule in a process that needs holding becomes a CHECKS or INVARIANTS row, and Check cites its id (D-26). Otherwise Check reads "none: <why>".
- PR-6: Relation to REQ-24: docs/notes/ holds what is read, docs/process/ holds what is done.
- PR-7: For a runbook, Check is the final verification command: the command whose success shows the runbook worked.
- PR-8: A new format rule: projects on an earlier format get a warning, not a failure, until they migrate.
