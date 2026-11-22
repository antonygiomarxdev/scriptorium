# REQ-14: A spec is checked against the code it names

Status: Accepted

## Summary

A spec can name a file that does not exist or call a constructor with fewer arguments than a sibling spec declares, and nothing fails until a builder hits it. The spec check should fail an existing path that is not a tracked file, and a call in one spec's Build block whose argument count differs from the declaration in a sibling spec.

Last change: 2026-11-22, opened and accepted

## Who asked and when
Another project adopting the chain, 2026-11-22; accepted by the owner the same day.

## What they said
> Do it, there is no problem. (Translated from Spanish.)

## The problem behind it
Reuses names are checked against their files, but other paths in a spec are not: a Files row marked Change, a test in Tests first, a file in Done. Specs written in parallel declare and call the same function, and nothing compares them.

## Evidence
Four findings of another project: a spec changed a test file whose real name had a prefix, in Files and in Tests first; a spec declared a constructor with four arguments and a sibling spec called it with two; two more of the same kinds. Line numbers were considered and dropped: they move on every edit and would fail specs that are still right.

## Decision
- CC-1: Every path a spec names, in Files, Tests first or Done, is a tracked file of the repository, unless a Files row marks it Create.
- CC-2: A function, method or constructor declared in one spec's Build block, called in another spec's Build block in the same specs folder with a different argument count, fails the spec check.
