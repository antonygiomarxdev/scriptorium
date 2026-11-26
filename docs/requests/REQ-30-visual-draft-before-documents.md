# REQ-30: Refine on a visual draft before the documents

Status: Accepted

## Summary

The owner decides a change by reading a stack of documents, which is slow and hides the shape of the change. Add a step before the documents: one visual draft page that shows today against proposed, the decisions to take and what gets built, refined until the owner says OK. The documents then start from that OK. The draft is an artifact referenced by link, never a file in the project. Build order: a draft template and a skill, each as a small spec; nothing depends on REQ-24.

Last change: 2026-11-26, accepted; amended the same day: the draft is an artifact referenced by link, no file is committed

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) Refining on a visual draft first was the best way to decide. Make it a step of the chain. Drafts must not live in the project, so no linter rule or chain check applies to them and nobody takes them for project files.

## The problem behind it
A request goes straight to PRD, FRD and TP, and the owner meets the whole shape of the change only after the documents exist. Decisions are then taken against text, and a wrong direction costs documents. The risk of a draft is a second source of truth: if it stays editable after the documents exist, the two disagree and nobody knows which one holds.

## Evidence
The owner approved SPEC-11-4, SPEC-11-5 and FRD-11 from a visual draft, https://claude.ai/artifact/VTgGLHEdcMjYN8kjF6kS2m (version 1, commit 1b93f4e), and called it "the best". One case; how often a draft pays off elsewhere is unknown.

## Decision
- VD-1: A request that adds or changes a flow, a screen, a slice or the architecture gets a draft; a fix, an ops change and a short path do not.
- VD-2: The owner refines on a visual page, an artifact, made by whoever writes the draft. No HTML or Markdown copy of it is committed, and no folder of the project holds drafts.
- VD-3: The request's `Draft:` line records the artifact link, its version and the date of the OK. Recording it is recommended, not mandatory. Where the host has no artifact tool, any shared visual page serves, and nothing is committed.
- VD-4: The draft is refined until every decision row is answered and no Q-n is open.
- VD-5: Each decision is recorded as a DECISIONS row, plus one row "Draft of REQ-n approved". The draft has no Status, no Approval record and no drift check, because it is not a document of the project.
- VD-6: The OK starts the documents, and each cites the D-n rows it rests on.
- VD-7: Nothing is archived: the draft is not in the project, and the approved documents carry the decisions.
- VD-8: The documents win over the draft; the draft is never edited after the OK, to avoid a second source of truth.
- VD-9: A check on the `Draft:` line is deferred, and since the link is optional and outside the project, none is planned.
- VD-10: The draft has these sections: what changes (today against proposed), how it works, decisions to take (options, a recommendation and the owner's answer), what gets built, out of scope, open questions, and the OK record.
