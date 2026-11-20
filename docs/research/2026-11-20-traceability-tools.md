# Research: drift, traceability and history in existing tools

Date: 2026-11-20. One researcher agent read official docs and source code; no tool was run. UNVERIFIED marks what it could not confirm.

## Summary

Doorstop stores the parent's content hash in each child link and flags a "suspect link" when the parent changes; a person clears it explicitly. OpenFastTrack traces ids from specs into code and tests with comment tags and fails ids without coverage. log4brains and StrictDoc derive dates and diffs from git. Spec Kit and Kiro check coverage with an agent prompt, not a deterministic script, and detect no drift. Scriptorium adapts: a parent hash at approval (drift), `covers:` tags in tests (traceability), history generated from git, and no version numbers in documents (D-28).

Last change: 2026-11-20, first version

## Findings

| Tool | Mechanism | Source |
|---|---|---|
| Doorstop | Fingerprint: SHA256 (URL-safe base64) over uid, text, refs and link ids. Each child link stores `{parent: parentStamp}`; a mismatch is a suspect link (warning). `doorstop review` stores the item's own stamp in `reviewed`; `doorstop clear` rewrites link stamps, a human act recorded as a git diff. | github.com/doorstop-dev/doorstop: docs/reference/item.md, docs/cli/validation.md, doorstop/core/item.py |
| StrictDoc | Declared grammar (UID, STATUS, STATEMENT, RELATIONS...). Diff and changelog between two git revisions; machine ids (MID) survive moves. `@relation` markers in code (syntax UNVERIFIED). ReqIF import and export. | strictdoc.readthedocs.io |
| OpenFastTrack | Ids `type~name~revision`; code tags `// [impl->dsn~x~1]`; needed coverage types `>>impl,test`. Coverage computation and exit codes UNVERIFIED. | github.com/itsallcode/openfasttrace, doc/user_guide/reference |
| sphinx-needs | Typed needs and links with allowed target types; status as an enum; warnings via filters. No hashing or suspect links found. | sphinx-needs configuration docs |
| adr-tools, log4brains | adr-tools writes date and status into the file and links supersession both ways. log4brains parses the Status line and takes creation and edit dates from git (needs full history in CI). | adr-tools `adr-new`; log4brains packages/core/src/adr/domain/Adr.ts |
| Spec Kit, Kiro | spec, plan and tasks files; `/speckit.analyze` maps every requirement to a task by agent prompt (non-deterministic); Kiro has a review button. No hash, no approval record, no drift. | github.com/github/spec-kit; kiro.dev docs |
| Regulated practice | UNVERIFIED (standards paywalled): a revision record holds id, revision, date, author, reviewer, approver, change and reason (ISO 13485 4.2.4). Git can supply who, when, what and a hash; approval needs its own recorded act (signed commit or pull-request review). | background knowledge |

## What Scriptorium should build

1. **Drift (R-CHAIN-9).** On approval, record the hash of the parent's normalized body and of the document's own body. The check recomputes both: a parent mismatch makes the document suspect; an own-body mismatch means it was edited after approval. Clearing is an explicit, committed act. Hash normative content only: the status line and the Summary's "Last change" line are excluded, or approving a parent would make every child suspect. Normalize line endings and trailing whitespace first (Windows).
2. **Traceability (L-8).** Tests carry `covers: FRD-NN/EX-n` tags. A scan fails a tag naming an id that does not exist, and an approved EX, ST or INV with no tag, unless the FRD marks it `uncovered: <reason>`. No per-id revision numbers at first; the drift hash covers staleness.
3. **History.** Generated from git (`git log --follow`), never kept by hand. The approval commit is found by searching history for the commit whose normalized body hash equals the recorded one. "What changed since approval" is the diff from that commit, grouped by id.

## Open doubts

OpenFastTrack's coverage rules, StrictDoc's `@relation` syntax and Kiro's approval flow were not confirmed. Hash normalization decides how noisy drift detection is; it needs tests on Windows and Linux.
