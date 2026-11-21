# SPEC-NN-k: <what this run builds>

Status: Draft
Rests on: <relative path to the FRD, TP, ADR, accepted request, or docs/CHECKS.md, INVARIANTS.md or CROSS-CUTTING.md>

## Summary

<What this one agent run builds, in three lines at most. Kept current: a change that matters anywhere below shows here.>

Last change: <YYYY-MM-DD, what changed>

One spec is one agent run: at most 80 lines, 3 files and one done command. Too big: split it into another spec, never add context. A spec decides nothing new.

## Rows
Quoted from: <relative path; leave out when it is the Rests on document>

<The rows this spec builds, printed by `check.ts excerpt <file> <ID>...`, never retyped.>

## Files
| Path | Create or change | Holds |
|---|---|---|

## Reuses
<What this spec builds on, found by searching the code first. One of:>
- `<path>` `<name>`: <why it is used>
- Precedent: <SPEC-NN-k-name.md>, <what it did that this one repeats>
Nothing to reuse: <why nothing in the project does this job>

## Tests first
<The ids of the Rows above, every one and no other, written as tests before the code, without the implementation in view.>

## Build
<The code that makes those tests pass: the exact types and signatures, as code in the project's language.>

## Done when
`<one command>`

## Out of scope
<What a reader might expect here and will not get, and the spec that has it.>

## Open questions
<Q-n (Owner: <why only the owner can answer>), Q-n (Research) or Q-n (Lead). Research and Lead questions are answered by the team, as a D-n with its source or an L-n, before the owner is asked. Must be empty to approve.>
