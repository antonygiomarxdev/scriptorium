# REQ-25: Adopt says where long prose and unchecked rules go

Status: Accepted

## Summary

Adopt maps existing documents to chain steps but does not say where product prose longer than the caps goes, where a rule with no check goes, or where long cross-cutting guidance goes. Give each a named target in the adopt skill, so a plan row never ends in "somewhere".

Last change: 2026-11-26, accepted

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) When a project adopts the chain, its long documents do not fit. Say where each kind of content goes, and do not stretch the caps.

## The problem behind it
PRODUCT is capped at 250 lines and a PRD at 150 (scripts/lint-docs.ts:13). Adoption plans row source documents to targets, but a 600-line product document, a rule nobody checks and a long guide to error handling have no stated target. skills/invariant/SKILL.md and D-26 say a rule with no check is not an invariant, so INVARIANTS is the wrong place for it.

## Evidence
The research report on an adopting project's out-of-chain documents found five content kinds with no home named in adopt/SKILL.md. Cost: unknown; each unplaced document stalls the plan for an owner question.

## Decision
- AS-1: Product prose past the PRODUCT cap is split by slice: what one slice owns goes to that slice's PRD or UX document; nothing is trimmed without a row saying what was dropped.
- AS-2: A domain explainer goes to GLOSSARY, one term per entry.
- AS-3: A rule with no check is not an invariant (D-26). It goes to PRODUCT section 4 (principles) or to an FRD rule; adopt does not copy it to INVARIANTS.
- AS-4: Long cross-cutting guidance goes to the cross-cutting TP (D-13), one rule row per rule; prose that is not a rule goes to docs/notes/ (REQ-24).
- AS-5: Roadmap, status, brand and design kit go to docs/notes/ (REQ-24); runbooks and processes go to docs/process/ (REQ-26).
- AS-6: Per-surface overlays are deferred; adopt says so in one line instead of inventing a home.
- AS-7: The adoption plan names one of the targets above in each row.
