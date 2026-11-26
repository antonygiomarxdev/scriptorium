# REQ-22: The scan treats the rows of an approved FRD as pending until the FRD is built

Status: Accepted

## Summary

An FRD can only be approved when its examples are written, but `trace` fails every example, state and invariant of an approved FRD that has no `covers` tag, so an FRD cannot be approved before its build. The owner asks that an untagged row of an approved FRD be a NOTE while it is not built, and a failure once it is built.

Last change: 2026-11-25, opened and accepted

## Who asked and when
The owner, 2026-11-25, through the lead of a project that approves its FRDs before it builds them.

## What they said
The owner approved the change: approve first, build after, and let the scan fail only what is left once the build has happened. (Paraphrased.)

## The problem behind it
Approve-then-build is the order of the chain: documents first, tests next, code last. The scan fails "uncovered" for every row of an approved FRD from the day of approval, so a project that follows the order has a red check for the whole build, or waives every row, or delays the approval.

## Evidence
One project with several approved FRDs and no built code for most of them saw the scan fail on every row. Other projects: unknown.

## Decision
Accepted by the owner 2026-11-25; mechanism in D-37.
