# REQ-19: ADRs are kept one decision each, and their links checked both ways

Status: Accepted

## Summary

A legacy ADR whose Status line says Superseded still shows as approved, so documents resting on it pass. An ADR can also hold a numbered list of decisions, amend or supersede another without the other saying so, and state a rule that nothing enforces. ADRs should hold one decision each, show their real status, link both ways, and name what enforces them.

Last change: 2026-11-22, opened and accepted

## Who asked and when
Another project adopting the chain, 2026-11-22, while splitting its ADRs; accepted by the owner on 2026-11-22.

## What they said
> Do it, but they must be corrections that correct, not ones that only get past the problem. (Translated from Spanish.)

## The problem behind it
Status reads a legacy ADR as approved before it reads its Status line (rework R-86). The ADR template has no field for amends or supersedes, so a link is written on one side only. An ADR with ten numbered decisions cannot be superseded in part. Nothing says which check enforces a decision, and an ADR that no TP cites is not found.

## Evidence
The other project splits a few ADRs with several decisions each into one ADR per decision; it needed a line form for a carried decision and for supersedes, and found the R-86 case on the way. Its owner approved the split with "Supersedes:" and "Enforced by:" lines.

## Decision
- AD-1: A legacy ADR whose Status says Superseded shows as Superseded, and a document that rests on it fails, as for any superseded ADR.
- AD-2: An ADR says `Supersedes: ADR-n` or `Amends: ADR-n, decision k`; the ADR named says `Superseded by ADR-m (date)` or `Amended by ADR-m: decision k (date)`; a link on one side only fails.
- AD-3: An ADR holds one decision; a numbered list of decisions fails, except in a legacy ADR.
- AD-4: An ADR says `Enforced by: CHECK-n` or `Enforced by: none: <reason>`.
- AD-5: An accepted ADR that no TP cites fails, unless its Status says it was carried from another ADR.
- AD-6: The product's brand gets a home in the chain, named when this request reaches a PRD.
