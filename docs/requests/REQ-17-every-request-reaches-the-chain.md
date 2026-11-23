# REQ-17: Every accepted request reaches the chain

Status: Accepted

## Summary

An accepted request can stay cited by nothing: no PRD requirement, TP or spec names it, and the owner's goal is lost without any check failing. Status should fail an accepted request that nothing cites, and the request skill should record each goal of the owner as its own Decision line, so each one can be traced.

Last change: 2026-11-22, opened and accepted

## Who asked and when
Another project adopting the chain, 2026-11-22; accepted by the owner on 2026-11-22.

## What they said
> Do it, but they must be corrections that correct, not ones that only get past the problem. (Translated from Spanish.)

## The problem behind it
The request is where the reason behind a change is kept (UC-10). Today the chain checks that a spec or TP resting on a request names an accepted one, but nothing checks the other way: an accepted request whose Decision lines no document carries forward passes status. A request with several goals in one paragraph cannot be traced goal by goal.

## Evidence
In the other project, an accepted request held goals that no requirement covered. They were found by reading, not by a check. How often this happens across this repository's 16 requests is unknown until the check runs.

## Decision
- PV-1: Status fails an accepted request that no PRD requirement, FRD, TP, ADR or spec cites by its id.
- PV-2: The request skill writes each goal of the owner as one Decision line with its own id, and a document that answers a goal cites that id.
