# REQ-13: Adoption with history is tested, and its archive has a place

Status: Accepted

## Summary

A project that adopts the chain with years of history found seven gaps in two days that no test caught. Keep a fixture of an adopted project that the checks must pass, add each new adoption gap to it, and tell adopters where a verbatim copy of an outside tool's documents goes.

Last change: 2026-11-21, opened and accepted

## Who asked and when
The owner, 2026-11-21.

## What they said
> It is worth analysing what they mention, because they are raising their hand; it may cause problems in the future. And then: Go ahead, I see no problem. (Translated from Spanish.)

## The problem behind it
Scriptorium was tested on new projects. An adopting project brings ADRs named by another tool, accepted documents that predate the templates, a formatter that runs at commit, CI work resting on requests, and exports from other tools. Each broke a check, and each was found by the adopter, not by a test.

## Evidence
Between 2026-11-20 and 2026-11-21 another project adopting the chain reported: a TP on a request (#2, #5), status asking that TP for the cross-cutting TP, ADR file names (#3), legacy ADRs over the cap and without the template, the formatter changing approval fingerprints, the cutoff read from the working folder, and nowhere to keep 71 exported documents.

## Decision
- AD-1: A fixture of an adopted project lives in the tests; status, lint and the TP check must pass on it, run from another folder, and each adoption gap found later adds a case to it.
- AD-2: The adopt skill keeps a verbatim export of another tool in archive/<tool>/ at the repo root, outside docs/, and the chain document that absorbed it links to it on a "Source:" line.
