# REQ-5: Updates that break nobody

Status: Accepted

## Summary

A plugin update changes every project's rules at once: 0.4.0 as built would block every spec written for 0.3.0, and auto-update makes that silent. The owner asks for a format each project pins in its own folder, a migrate command, and a command-line tool, so that today's users migrate once with Claude and every later format migrates with one command.

Last change: 2026-11-20, opened and accepted

## Who asked and when
The owner, 2026-11-20, before merging the 0.4.0 release.

## What they said
> How do we make sure that someone who has it installed doesn't get everything broken when we update a format?

> It should have its own place. Apart from these scripts, is a CLI worth it? It should be something inside .scriptorium, or a .scriptorium file or something.

> Yes, and a migrate and so on. I think whoever uses it now, let Claude migrate, but once this is done, with one command we're set. (Translated from Spanish.)

## The problem behind it
Nothing records which rules a project was written for. A new rule fails yesterday's documents in hooks that block the agent, in pre-commit and in CI. Outside Claude Code the checks need a clone of this repository, so another agent or a CI job cannot run them, and the git hook must be installed by hand in a folder git does not commit.

## Evidence
On 2026-11-20 the unmerged 0.4.0 fails every spec of the 0.3.0 format (no `Rests on:`, several tasks, over 80 lines), and this repository itself had no pre-commit hook installed. [Research](../research/2026-11-20-rule-evolution.md) on how Rust, Go, ESLint, Terraform, Angular and Biome avoid this.

## Decision
Accepted by the owner 2026-11-20 into the chain slice; owner decisions in D-31, mechanism in L-16.
