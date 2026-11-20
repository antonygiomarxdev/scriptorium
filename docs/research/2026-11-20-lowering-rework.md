# Research: how teams that deliver with AI agents lower rework

Date: 2026-11-20. Three researcher agents (web sources), synthesized by the lead. Practice: what a team says it does. Evidence: measured. UNVERIFIED: seen only second-hand.

## Summary

Knowing where changes fail does not lower rework on its own. The teams that lowered it changed the review loop itself: deterministic checks before any AI review, a fixed list of what may fail a change, a cap on rounds, and every recurring finding turned into a check. An AI reviewer with open criteria finds something new every round, by design.

## The loop is part of the problem

- AI reviewers are not repeatable. Four LLMs reviewing the same 70 commits five times at temperature 0 gave different reviews (arXiv 2502.20747, 2025-02). LLM judges agreed with themselves on all three runs for at best 61.3% of items (arXiv 2510.27106, 2025-10).
- Anthropic's Claude Code team had the same loop: one PR went through more than 50 review rounds, and about 59% of the lines the reviewer flagged predated the change. After changing the loop, mean reviews to pass fell from 2.08 to 1.32, passing after one fix round rose from 65% to 78%, and PRs needing 5+ rounds fell from 8.9% to 1.5% (claude.dev/blog/solving-code-review-at-anthropic, 2026-10-15; changes shipped together, self-reported).
- Repair loops gain most in the first 3 to 4 rounds, and only when feedback comes from compilers and tests (arXiv 2607.05197, 2026-07).

## What the teams do

| Mechanism | Who | Evidence |
|---|---|---|
| Deterministic gates (lint, types, tests, checks) run before the change is handed over; no PR opens while one fails | Stripe, Spotify (stop hook), Shopify, Anthropic | Practice; Spotify's judge after the gates vetoes about 25%, half self-corrected (2025-12-09) |
| Cap the loop: Stripe two CI rounds, Anthropic three review rounds, then a human or a re-brief | Stripe (2026-02-09), Anthropic | Anthropic numbers above |
| Re-review only the new diff; never re-post a finding; findings on untouched code go to a backlog | Anthropic | Anthropic numbers above |
| Flag the class of a bug so the author fixes every instance | Anthropic | Practice |
| Several reviewers, post only findings most agree on; drop style | Anthropic | Majority of 3 raised judge accuracy; more than 3 did not help (arXiv 2510.27106) |
| A finding must be proven by a test or it is downgraded | Shopify (2026-07-29) | 30+ candidate findings in one audit all fell after validation |
| A recurring finding becomes a lint rule, structural test or type, with fix instructions in its message | Böckeler harness engineering (2026-04-02), OpenAI (UNVERIFIED) | Practice; no measured study |
| A scope judge blocks work beyond the brief (refactors, disabled tests) | Spotify | Scope creep was the most common veto |
| Review depth by risk: low-risk changes pass on gates alone | Meta RADAR, Anthropic | Meta: review time -35%, reverts one third (arXiv 2605.30208, 2026-05) |
| Small, verifiable tasks | Devin (4 to 8 hour tasks), DORA 2025 | Failed agent PRs are larger and fail CI (arXiv 2601.15195) |

## On briefs and implementers

- An implementer that writes its own tests verifies weakly (Stack Overflow blog 2026-11-13, informal data). Acceptance tests should come from the brief, written by someone else.
- "Do TDD" as an instruction raised regressions (9.94% vs 6.08%); giving the agent the map of which tests cover which code cut them to 1.82% (arXiv 2603.17973, small models). Context beats procedure.
- Briefs help with explicit inputs, outputs, edge cases and invariants, not with length (function-level studies only).
- Whether the monorepo's failures sit in briefs or implementation cannot be settled from outside. A test: give the same brief to two implementers; if both fail the same way, the brief is the problem.

## What this means for Scriptorium

The chain already holds what the loop lacks: approved acceptance criteria. Scriptorium can make review closed instead of open:

1. Gates first: a change is not handed over until its deterministic checks pass.
2. A FAIL must cite an acceptance criterion of the spec or a failed gate. Anything else is a non-blocking note or a new request.
3. Round 1 lists every finding; later rounds check only those and new defects in the changed lines.
4. At most three rounds, then the owner decides: re-brief, split or accept.
5. A finding class seen twice becomes a check, and the retro tracks whether it stopped recurring.
6. Acceptance tests come from the FRD, written before the implementer starts.
7. Measure the reviewer too: rerun it on an unchanged change; findings that do not repeat are reviewer noise.

## Open doubts

- No source publishes a first-pass rate for agent changes; 94% has no public benchmark.
- Anthropic's gains come from a bundle; no single mechanism is proven.
- No measured study ties "findings turned into checks" to lower rework.
- Several sources are vendor posts or abstracts.
