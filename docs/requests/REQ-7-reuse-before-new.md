# REQ-7: Reuse before writing new

Status: Accepted

## Summary

Agents write new code when something that does the job already exists, so code gets duplicated. Every spec must say what it builds on, existing code and a precedent, before it adds anything new, and review must fail a duplicate.

Last change: 2026-11-20, opened and accepted

## Who asked and when
The owner, 2026-11-20.

## What they said
> The issue of slop: AI always creates new things. The problem is that when things already exist, it often duplicates them. I had a tool installed called Ponytail for this. We don't necessarily have to use Ponytail, but each spec, and each of these kinds of things, should carry something like checking whether you are taking it from somewhere; it would also be good to have a precedent. (Translated from Spanish.)

## The problem behind it
A spec lists the files it creates or changes, never what it reuses. Nothing asks the builder to look for an existing helper first, and nothing fails a copy.

## Evidence
On 2026-11-20 a builder copied the `isTest` rule from `scripts/pre-commit.ts` into `scripts/gate.ts` because the spec named only gate.ts; both copies are in the code today.

## Decision
Accepted by the owner 2026-11-20 into the chain slice. The design goes to the owner before any spec.
