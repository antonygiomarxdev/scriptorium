# REQ-20: The README shows what Scriptorium does at a glance

Status: Accepted

## Summary

The README opened with nine document types and their acronyms before it showed what using Scriptorium looks like, and its relation to puppeteering sat in one line under Status. Show it with diagrams instead: before and after, one step as a sequence, the states of a document, the rework loop, and how it pairs with puppeteering. A quick start of three commands comes before the chain.

Last change: 2026-11-26, accepted and answered in the README

## Who asked and when
The owner, 2026-11-26, in a session that reviewed scriptorium and puppeteering together.

## What they said
> Honestly I feel it is not clear from the start what both do, and combined they are better, but it should be understood at a glance. (Translated from Spanish.) Then: I want more diagrams, so the process and what is done is more visual; improve the READMEs. (Translated from Spanish.)

## The problem behind it
A reader met PRD, FRD, TP, ADR and UX before any example of a run. The acronyms were not expanded. Nothing said what the owner does and what the agent does at each step, and the pairing with puppeteering was one sentence: "works alongside puppeteering for agent teams, and does not need it".

## Evidence
One owner. The README had one diagram (the chain) and no quick start before the chain table.

## Decision
Small change, answered in README.md: a before and after flowchart, a quick start, a sequence of one step, a state diagram of a document, a rework flowchart, a "Short for" column in the chain table, and a section "With Puppeteering" with a flowchart and a table. Puppeteering's README gets the same section (its REQ-13). Every diagram follows skills/scriptorium/diagrams.md: no styling, syntax GitHub renders.

Short path: `README.md`
