# REQ-28: One entry document generated from status

Status: Accepted

## Summary

No document tells a newcomer what the project holds and where to start. Status already knows every chain document in order. Generate docs/INDEX.md from it with `status --index`, and fail CI when the committed index is stale. Build last, after REQ-26, REQ-29 and REQ-27, so the index lists their kinds.

Last change: 2026-11-26, accepted

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) The project needs one entry document. The owner chose generating it over writing it by hand.

## The problem behind it
chainStatus in scripts/check.ts lists every document with its status, but the list shows only in the terminal. HANDOFF.md is the entry point today and is kept by hand, so it drifts.

## Evidence
The research report on engineering-project gaps found no index in the chain. A hand-kept index goes stale; the owner chose generation to avoid that. Reader count: unknown.

## Decision
- IX-1: `bun scripts/check.ts status --index` writes docs/INDEX.md: one row per document, in chain order, with kind, path, status and its one-line summary.
- IX-2: It also lists the kinds of REQ-24, REQ-26 and REQ-27 when present: notes, process, ARCHITECTURE.
- IX-3: INDEX.md starts with a line saying it is generated and not to be edited by hand.
- IX-4: `status --index --check` exits 1 when the committed docs/INDEX.md differs from what would be generated; CI runs it.
- IX-5: The same input gives the same bytes: no timestamps, sorted by path within a kind.
- IX-6: A project without INDEX.md is not failed; the check runs only when the file exists, and init creates it on new projects.
