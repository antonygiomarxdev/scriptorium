# REQ-12: The retro gives way to the rework queue

Status: Accepted

## Summary

D-33 says the rework skill replaces the retro, but the retro skill, its template, its example and every mention of it stayed. Remove what contradicts the rework queue, point every mention at the queue, and add the rework skill and its history as D-33 describes.

Last change: 2026-11-21, opened and accepted

## Who asked and when
The owner, 2026-11-21.

## What they said
> Then delete what is not consistent, and add what it is supposed to be now. (Translated from Spanish.)

## The problem behind it
Two ways to learn from a failure were documented: RETRO entries and the rework queue. Agents and readers could follow either; only the queue is checked.

## Evidence
A search on 2026-11-21 found the retro in 10 skills, the README, PRODUCT, R-CHAIN-1, DECISIONS and the larder example, while docs/metrics/rework.md is the only one the checks read.

## Decision
- RW-1: Delete the retro skill, templates/RETRO.md and the example's docs/retro; every mention points at the rework queue instead. "retro" stays a reserved folder name, so an old project's docs/retro is not read as a slice.
- RW-2: The larder example keeps its CHECK-1 with a rework queue whose cause C-1 names CHECK-1 as its prevention.
- RW-3: Add scriptorium rework history and the /scriptorium:rework skill (D-33) through the metrics PRD and its FRDs.
