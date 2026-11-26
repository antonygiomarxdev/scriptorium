# REQ-27: A standing architecture document kept current

Status: Accepted

## Summary

The cross-cutting TP is a decision record approved once, and drift reads documents only, so nothing describes the system as it is now or notices when covered code changes. Add docs/ARCHITECTURE.md, a thin living map that links the decision records, with a check that its paths exist and a warning when covered code changes alone. Build after REQ-26 and REQ-29.

Last change: 2026-11-26, accepted

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) A living architecture description is missing. Keep it current. The owner chose a check that the paths exist and are tracked, a warning when covered code changes alone, and a question in review.

## The problem behind it
scripts/drift.ts:120-123 reads approved documents and never flags a TP when its code changes. The cross-cutting TP is approved once, so a living description would reopen it on every edit. Thoughtworks calls this architectural drift and answers it with fitness functions, conformance tests in the pipeline (https://www.thoughtworks.com/en-us/insights/articles/fitness-function-driven-development). arc42 gives a section layout for such a description (https://arc42.org/overview); C4 gives four levels (https://c4model.com/).

## Evidence
The research report on engineering-project gaps read those three sources and the drift code. No architecture document exists in the chain. Size of the problem in adopting projects: unknown.

## Decision
- AR-1: docs/ARCHITECTURE.md is a root kind ARCHITECTURE in scripts/kinds.ts, optional per project.
- AR-2: It is thin: it links CROSS-CUTTING, the TPs, the ADRs and the FRD quality criteria instead of copying them.
- AR-3: It holds a Covers table, block to paths, one row per building block.
- AR-4: The check fails a Covers row whose path does not exist or is not tracked by git.
- AR-5: At commit, a warning (not a failure) names a block when its covered code changes and ARCHITECTURE.md does not.
- AR-6: The review skill asks one question: does this change alter a block in Covers?
- AR-7: It has no Status line and no approval; it is reviewed in the pull request (as PR-4).
- AR-8: A boundary rule (what may call what) is a CHECKS or INVARIANTS row that a test enforces, a fitness function; the document cites the id and states no rule of its own.
