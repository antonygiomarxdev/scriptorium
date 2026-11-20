# REQ-4: One code formatter, checked

Status: Accepted

## Summary

Code style is whatever each author typed. The owner asks for a formatter set up properly and a general format of the code. Markdown stays out: reformatting an approved document changes its body and fails drift, and quoted rows must stay byte for byte.

Last change: 2026-11-20, opened and accepted

## Who asked and when
The owner, 2026-11-20, after line endings were fixed (REQ-3).

## What they said
> Go ahead, and do a general format. (Translated from Spanish.)

## The problem behind it
No formatter is configured, so style drifts between authors and agents, and a diff carries style noise.

## Evidence
On 2026-11-20 the repository has no formatter configuration and no format step in CI.

## Decision
Accepted by the owner 2026-11-20 as work that is not product (/scriptorium:ops):
- FMT-1: one formatter formats every TypeScript and JSON file, with LF and the indentation the code already uses; it never touches markdown.
- FMT-2: a script formats the code and another checks it, and CI fails on unformatted code.
- FMT-3: the whole code base is formatted once, in a commit of its own that changes no behavior.
