# REQ-11: A proof row per criterion, and a recorded failing run

Status: Accepted

## Summary

Scriptorium has the base of acceptance test-driven development: Given/When/Then examples with ids, blind tests written first, covers tags. Two practices are missing: the hand-over shows one proof row per criterion with its test, command and result, and each test is recorded failing before the code is written.

Last change: 2026-11-20, opened and accepted

## Who asked and when
The owner, 2026-11-20.

## What they said
> The other thing I don't know if we took into account: there was research saying that using ATDD improved rework a lot. (Translated from Spanish.) Then, on the proposal to add these two practices: Go ahead, yes.

## The problem behind it
"Done when" is one command for the whole spec. Nobody sees, per criterion, which test proves it and that it passed; and nothing shows a test failed before the code existed, so a test that passes on an empty build goes unnoticed.

## Evidence
A search on 2026-11-20 found no study that measures ATDD's effect on rework; Specification by Example (Adzic, 2011) reports it from team accounts only. In this repository on 2026-11-20, testers reported new tests that already passed before any code was written (three in task 114, three in task 119); nothing records which tests were seen failing.

## Decision
Accepted by the owner 2026-11-20 into the chain slice. The design (an FRD) goes to the owner before any spec. Rehearsal before hand-over and owner acceptance of delivered criteria wait for the rework measures to show a need.
