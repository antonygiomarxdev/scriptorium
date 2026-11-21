# REQ-8: Mutation testing at night, on main, with an issue

Status: Accepted

## Summary

Surviving mutants are how most review findings were found, so mutation testing becomes the prevention for missing examples (cause C-1 of the rework queue). It is too heavy for a developer machine: it runs at night in CI on main, and what it finds becomes an issue that is then worked through the chain.

Last change: 2026-11-20, MUT-6 after review (L-18)

## Who asked and when
The owner, 2026-11-20.

## What they said
> Be careful with mutations: I left mutations running only at night, on main. What it finds becomes an issue, and then it gets handled. If it runs locally it blows up my PC. (Translated from Spanish.)

## The problem behind it
Reviewers ran mutants by hand on copies, and a full run takes minutes to hours: every mutant runs a test command. Nothing ran them on their own, and nothing turned a survivor into tracked work.

## Evidence
[Research](../research/2026-11-20-mutation-and-affected-tests.md): StrykerJS's command runner works on Bun; one 65-line file gave 166 mutants in 26 s with its own test file; with the whole suite per mutant it would take about 80 minutes. The rework queue holds 13 open findings of cause C-1, most found by mutants.

## Decision
Accepted by the owner 2026-11-20 as work that is not product (/scriptorium:ops), D-34:
- MUT-1: mutation testing runs only in CI, every night on main and on manual dispatch; no project script, hook or check runs it on a developer machine, and the tool is installed in the job, not in the project's dependencies.
- MUT-2: each script's mutants run only that script's own test files, from a committed map; a script missing from the map is reported as unmapped.
- MUT-3: the survivors of a run go into one issue labeled mutation, grouped by file with line and mutator; if an issue labeled mutation is already open, the run comments on it instead of opening another; a run with no survivors opens nothing.
- MUT-4: the run reuses the verdicts of unchanged mutants from the previous run, cached between runs.
- MUT-5: the tool is pinned to an exact version from its verified publisher.
- MUT-6: a file whose mutation run fails or writes no report fails the job, and the issue lists it under "Run failed for:" (L-18).
