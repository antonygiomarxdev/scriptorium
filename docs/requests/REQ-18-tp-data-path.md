# REQ-18: Every TP shows its data path

Status: Accepted

## Summary

A TP can describe a change in prose and leave out where the data goes, hop by hop, so a builder meets a file or service that does not exist. Every TP should carry a Data path sequence diagram in which each hop names a tracked file, or one the TP marks new.

Last change: 2026-11-22, opened and accepted

## Who asked and when
Another project adopting the chain, 2026-11-22; accepted by the owner on 2026-11-22.

## What they said
> Do it, but they must be corrections that correct, not ones that only get past the problem. (Translated from Spanish.)

## The problem behind it
Format 4 requires a diagram in a TP's Architecture (FRD-11), but any diagram passes, and its boxes are not checked against the code. A spec checked against tracked files (FRD-10) inherits a wrong path from the TP above it.

## Evidence
In the other project, specs named files that did not exist, and the error came from the TP. The four findings behind REQ-14 are of the same kind.

## Decision
- DP-1: Every TP has a "Data path" section with a Mermaid sequenceDiagram, or "n/a: <reason>" for a TP that moves no data.
- DP-2: Each participant of that diagram names a tracked file or folder, or one the TP lists as new; any other participant fails the TP check.
