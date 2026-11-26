# REQ-32: A built spec says it is built

Status: Accepted

## Summary

An approved spec that is built looks the same as an approved one still pending, so a reader cannot tell, and a built spec drifts when its parent changes. The owner accepted the need; the owner chose to compute it (BL-2) and to keep a built spec's quotes as history (BL-4), D-39.

Last change: 2026-11-26, build picks recorded in D-40; before that the owner picked BL-2 with BL-4 (D-39), BL-3 not chosen

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) A spec that is already built should say so, instead of looking like work to do, and a change to the document it quotes should not force its approval again.

## The problem behind it
Status shows a spec as approved whether or not its code exists. An adopting project split a built spec into new work that nobody needed, because nothing said it was done. In this repository SPEC-11-3 had to be re-approved after its FRD row changed, because a spec quotes the row verbatim and so a built spec is judged against a row that moved on (R-104). A hand-written "Built:" stamp can go stale: nothing checks it against the code.

## Evidence
An adopting project's question about how to mark a built spec; rework R-104; the answer here that a hand-written stamp can go stale. D-37 already treats a spec as "started" from its evidence. How often it recurs: unknown.

## Decision
- BL-1: Whatever is chosen, a built spec is never reported as pending, and a spec with no code is never reported as built.
- BL-2 (chosen by the owner, D-39): Status computes built, started or pending from the covers tags of the tests and the result of the Done when command, as D-37 already does for "started". Nothing is written by hand and nothing goes stale. Cost: status runs a command or reads test results.
- BL-3 (not chosen): `check.ts built <spec> <pr>` writes a stamp naming the pull request. Cost: a stamp can go stale, and someone must run it.
- BL-4 (chosen by the owner, D-39): A built spec keeps its quotes as history. Drift and the verbatim-quote check skip it, and a new spec carries the change. Cost: a built spec no longer follows its FRD, so a reader needs BL-2 or BL-3 to know which specs are history.
- BL-5: Format 3's Reuses section is not required of a spec built before format 3; migrate exempts those specs.
- BL-6: The owner picked BL-2 with BL-4 and recorded it as D-39; the build is an FRD and then specs.
- Draft: https://claude.ai/artifact/22jNEiSuJSepc2Y95M2vhH, version 1, OK 2026-11-26
- Draft: https://claude.ai/artifact/NJRPzKgQuPyxjHUkSv2XYU, version 1, OK 2026-11-26, D-40
