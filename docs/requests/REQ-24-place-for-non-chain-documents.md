# REQ-24: A place for documents that are not chain documents

Status: Accepted

## Summary

An adopting project has documents that are not product requirements: a roadmap, status pages, brand and a design kit. The adopt skill says "keep outside the chain" and names no place, and any folder under docs/ reads as a slice. Give them a named home that the chain and its checks leave alone, and delete or archive stale pages with a recorded decision.

Last change: 2026-11-26, accepted; reference docs, user docs and dependency or license inventory are out of scope

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) A project that adopts the chain has many documents that are not chain documents. Say where they go, and do not leave stale ones lying around.

## The problem behind it
skills/adopt/SKILL.md:63 lists "keep outside the chain" as an action with no target. scripts/kinds.ts:28 treats any docs/ folder not in RESERVED as a slice, so a docs/roadmap/ folder reads as a slice without a PRD. scripts/lint-docs.ts lints every .md under docs/, so a page that is not a chain document is held to chain rules it was never written for.

## Evidence
One adopting project holds roadmap, status, brand and design-kit pages with no home in the chain; the research report for this request found no target named in adopt, kinds or lint. How many projects hit this: unknown.

## Decision
- NC-1: docs/notes/ is reserved: kindOf returns no kind for anything under it, and a slice folder is never named notes.
- NC-2: lint-docs applies only its universal rules under docs/notes/ (links resolve, LF endings); caps and chain sections do not apply.
- NC-3: The adopt skill's "keep outside the chain" action names docs/notes/ as the target, one row per moved page in the adoption plan.
- NC-4: A stale page is deleted, or moved to docs/notes/archive/, with a D-n or L-n row saying why; git keeps the history.
- NC-5: Processes and runbooks are the exception: they get docs/process/ (REQ-26), a kind with a template.
- NC-6: Per-surface overlays (one document per client app or surface) are deferred: no concept is added now, and adopt says so in one line.
- NC-7: Out of scope: reference and user documentation, and dependency or license inventory. Neither is a chain document or a note, and this request adds no place for them.
