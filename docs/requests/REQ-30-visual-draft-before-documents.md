# REQ-30: Refine on a visual draft before the documents

Status: Accepted

## Summary

The owner decides a change by reading a stack of documents, which is slow and hides the shape of the change. Add a step before the documents: one visual draft page that shows today against proposed, the decisions to take and what gets built, refined until the owner says OK. The documents then start from that OK. Build order: REQ-24 first (it creates docs/notes/), then a draft template and a skill, each as a small spec.

Last change: 2026-11-26, accepted

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) Refining on a visual draft first was the best way to decide. Make it a step of the chain, with the draft kept in the repository.

## The problem behind it
A request goes straight to PRD, FRD and TP, and the owner meets the whole shape of the change only after the documents exist. Decisions are then taken against text, and a wrong direction costs documents. The risk of a draft is a second source of truth: if it stays editable after the documents exist, the two disagree and nobody knows which one holds.

## Evidence
The owner approved SPEC-11-4, SPEC-11-5 and FRD-11 from a visual draft, https://claude.ai/artifact/VTgGLHEdcMjYN8kjF6kS2m (version 1, commit 1b93f4e), and called it "the best". One case; how often a draft pays off elsewhere is unknown.

## Decision
- VD-1: A request that adds or changes a flow, a screen, a slice or the architecture gets a draft; a fix, an ops change and a short path do not.
- VD-2: The owner refines on a visual page: an HTML preview, published as an artifact where the host has the tool. The page's HTML is committed at docs/notes/drafts/REQ-n-name.html.
- VD-3: Where there is no artifact tool, a Markdown file with Mermaid at the same path, ending in .md, is the fallback. The OK records the commit and, for an artifact, its version.
- VD-4: The draft is refined until every decision row is answered and no Q-n is open.
- VD-5: Each decision is recorded as a DECISIONS row, plus one row "Draft of REQ-n approved". The request's Decision gains a `Draft:` line naming the path. The draft has no Status, no Approval record and no drift check.
- VD-6: The OK starts the documents, and each cites the D-n rows it rests on.
- VD-7: After the documents are approved, the draft moves to docs/notes/archive/ (REQ-24).
- VD-8: The documents win over the draft; the draft is never edited after the OK, to avoid a second source of truth.
- VD-9: A check that a request with a `Draft:` line names an existing file is deferred; no check is built now.
- VD-10: The draft has these sections: what changes (today against proposed), how it works, decisions to take (options, a recommendation and the owner's answer), what gets built, out of scope, open questions, and the OK record.
