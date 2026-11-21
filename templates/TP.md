# Technical Proposal: <scope>

Status: Draft

## Summary

<The technical choices and why. Five lines at most. Kept current: a change that matters anywhere below shows here.>

Last change: <YYYY-MM-DD, what changed>

Cross-cutting (`docs/tp/TP.md`, written after the FRDs) or one per FRD (`docs/<slice>/tp/TP-NN-name.md`). A TP compares options and records the choice; an ADR is written only for an architecturally significant decision.

## Context
<What exists, what the FRD asks (FR ids), constraints and facts with sources.>

## Decisions
### TD-1: <question>
- **Option A** <what, cost, risk, with numbers or a failure case>.
- **Option B** <what, cost, risk>.

Chosen: <option>, because <reason>. ADR: <ADR-NNN, or "none: not architecturally significant">.

## Architecture
<Mermaid diagram and the parts.>

## Information
<What is stored, where, in what shape.>

## Interfaces and contracts
<What each part offers the others; the contract test for each changed interface.>

## Threat model
<Assets, who could attack, how, what stops it, what is accepted.>

## Testing
<How the FRD ids become tests first; which gates run; mutation scope.>

## Risks

## Open questions
<Q-n (Owner: <why only the owner can answer>), Q-n (Research) or Q-n (Lead). Research and Lead questions are answered by the team, as a D-n with its source or an L-n, before the owner is asked. Must be empty to approve.>
