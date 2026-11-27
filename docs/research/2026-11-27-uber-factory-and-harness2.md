# Research: Uber's software factory and Google's Harness2

Date: 2026-11-27. Read by the lead. Uber: the owner's PDF of the post, read in full. Harness2: web search summaries only, marked UNVERIFIED; the paper (arXiv 2610.14224) and the repository were not opened because the session's network did not allow those hosts.

## Summary

Both are about the harness around a model, not the model itself. Uber cuts cost: a cheaper model for subagents, a context graph, cost always visible, and each managed agent measured on a benchmark of its own past work. Harness2 improves results: for each task it tries two edited harnesses against the current one and keeps only what the evidence supports, then writes lessons to a library that later tasks consult. Both match parts of Scriptorium and puppeteering, and both point at what is not measured here yet: cost per accepted change, and a score for the reviewer.

## Uber: "Running a Software Factory Efficiently at Uber Scale" (2026-08-27)

| Claim | Evidence |
|---|---|
| "More than 70% of pull requests are attributed to local or cloud agents"; over 3,600 agent skills, more than 30K skill executions a day | Self-reported |
| Feb to Aug 2026: weekly active users 7x, weekly agent requests 9.4x; total AI spend "relatively stabilized since April" | Self-reported, Figure 1 |
| Model held fixed Feb to Jul: cost per 1,000 requests down almost 34% from peak; cost per session down 52% from its June peak | Self-reported, Figure 2 |
| "The primary model handles task decomposition and evaluation while subagents execute the work." The subagent default model is "the most impactful lever" | Practice |
| Each managed agent picks its model on "a benchmark out of the agent's real work". uReview's benchmark: real PRs with known bugs graded easy, medium, hard; scored on precision, recall, F1, cost per review, latency, noise | Practice; Figure 5 |
| Managed agents are measured per outcome: cost per merged PR, per review, per alert; quality by revert rate, F1, MTTR | Practice |
| Defaults: compaction at 400k tokens; reasoning effort Medium; 1-hour prompt cache for interactive sessions, 5 minutes for subagents | Practice |
| Tool schemas loaded on demand (tool search, MCP tools as CLI commands): 100+ preloaded tools cost about 50K-70K tokens per turn. Batching tool calls in a script cut tokens by more than 50% even on one-row queries | Measured, 5 queries |
| "An ungrounded agent fails slowly rather than cheaply." A context graph (24M nodes, 80M edges): grounded, 38 s; ungrounded, 20 minutes, 2 subagents, 3 errors, wrong answer | One example |
| A live cost counter in the status line; nudges at 50/80/100% of expected spend; a session analyzer that flags 16 anti-patterns with their cost | Practice |
| Next: "record papercuts from agent skill executions and auto-generate skill updates" | Planned |
| "The core strategic shift is moving from interactive developer workflows to fully managed agents" | Position |

## Harness2 (Google Research, 2026-10) — UNVERIFIED

- Improves the harness (prompts, guardrails, memory, skills, tools) and never the weights.
- Per task, Propose, Probe, Compose: the current harness runs the task once as a reference; two editors each edit a copy (one changes how the agent works, one adds domain knowledge); both candidates run the same task under matched settings and are compared with the reference; a composer keeps the edits the evidence supports, merges or revises them, or keeps the current harness.
- Across tasks, a reflector writes lessons to a library: an executable harness and an EXPERIENCE.md with the situation, the lesson and the evidence. Weak evidence writes nothing. Each task starts from the base harness; only the library carries forward.
- Reported: one step improved GLM-5 and Gemini 3.5 Flash by up to 11.5 points on WorkBuddy-Bench, 4.5 on JobBench and 11.8 on LAB's partial pass rate; more recursion budget gave more. No cost figures found.

## What it means here

| Finding | Here today | Gap |
|---|---|---|
| Decompose on a strong model, execute on a cheaper one | puppeteering roles: Opus lead, Sonnet teammates, Haiku ops | None |
| Context before code is the strongest lever | Scriptorium's chain | Uber's graph is generated from code; the chain holds why and what was decided. They complement |
| Cost visible all the time | puppet-monitor shows agents and alerts | No cost |
| Outcome-denominated cost and revert rate | metrics: first-pass rate, rework rounds | No cost per accepted spec, no revert rate |
| A benchmark of the agent's own past work | rework.md holds returned changes with known causes | Not used to score reviewer configurations |
| Keep a change only if a run proves it (Harness2 Compose; Uber's benchmarks) | A rework prevention must be proven by replay | Lessons in puppeteering's LESSONS.md need no replay |
| A lesson records situation, lesson and evidence; weak evidence writes nothing | LESSONS.md entries; rework rows | No required evidence field in LESSONS.md |

## Sources

- Uber, "Running a Software Factory Efficiently at Uber Scale", uber.com/us/en/blog/efficient-software-factory/, 2026-08-27 (PDF supplied by the owner).
- Harness2: github.com/google-research/harness2; arXiv 2610.14224 (not opened). Summaries: datacamp.com/tutorial/google-harness-2-tutorial, i-scoop.eu/harness2-google/, harness2.app/docs/tutorial, themenonlab.blog (Harness²: up to 11.8 points), layer3labs.io/guides/harness2-explained.
