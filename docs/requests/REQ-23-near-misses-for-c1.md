# REQ-23: Near misses in the FRD, the prevention for C-1

Status: Accepted

## Summary

C-1, an FRD rule with no negative example for one of its qualifiers, has 49 open findings and no prevention: the largest source of rework. Each FRD rule gets a near-miss table, written with the FRD: each qualifier of the rule, its class, the near miss that breaks only it, and the example that kills it. A check holds the table to the rule's words. No code is run; mutants stay in the nightly CI job.

Last change: 2026-11-27, FRD-12 approved; the pin moves once it is built

## Who asked and when
The owner, 2026-11-27, choosing what prevents C-1 after the lead proposed mutants at the done gate.

## What they said
> I don't know how, research it, but running mutants doesn't fit: that already happened with a project and it broke my PC every time it decided to run them. (Translated from Spanish.) Then, on the near-miss proposal: yes, go ahead. (Translated from Spanish.)

## The problem behind it
The FRD check requires one negative or boundary example per rule, and that is met on paper. The examples miss the near miss of one qualifier, the build drops the qualifier, every test passes, and the reviewer finds it by writing a mutant.

## Evidence
[research/2026-11-27-near-misses.md](../research/2026-11-27-near-misses.md): the 49 findings in six classes (scope, variant, failure, absence, enumeration, guard), and the category-partition method.

## Decision
Accepted. Chain FRD-12 (R-CHAIN-40), approved by the owner 2026-11-27 in its second version (it stays Draft in the repository until its tests land, because an approved FRD needs a test or a waiver for every example; then the same content is approved), specifies the table and its check; its replay runs the check on the FRDs behind R-55, R-74 and R-84. The owner moves the project's pin to the format that adds it once it is built. C-1's prevention row names the CHECK-n that ships it, and REQ-22's verdict reports its effect.
