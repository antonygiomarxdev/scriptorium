# Research: Uber's software factory and Google's Harness2

Date: 2026-11-27. Read by the lead. Uber: the owner's PDF of the post, read in full. Harness2: its repository, read in the code; the paper was not opened.

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

## Harness2 (Google Research, 2026-10)

Read from the repository github.com/google-research/harness2 (commit 6868817, 2026-11-01): README.md, harness2/core/prompts.py, library.py, recursion.py. The paper (arXiv 2610.14224) was not opened.

- A harness has eight editable components: system prompt, guardrails, memory, tool guidance, subagents, skills, scripts, plugins. Weights never change.
- Per task, Propose, Probe, Compose, "without ground-truth feedback": base rollouts; two editors each edit a copy, INV ("how the agent WORKS": procedure, tools, completion) and DOM ("what a PRACTITIONER knows"), each told to stay out of the other's dimension; every candidate runs once; a composer merges, adopts one, or keeps the base. "KEEP_BASE is a real answer, not a failure. Adaptation that the evidence does not argue for is a regression."
- Cost: "Each mode schedules 4k rollouts and 3k improvement stages" per task (recursion.py); k = 1 is 4 rollouts and 3 model stages.
- Weighing: "A defect in 1/k is noise"; one rollout per candidate is weak evidence; "an edit earns its place when a SPECIFIC MOMENT in a trajectory shows the mechanism". The composer writes one line per decision: kept, revised or dropped, the edit, the evidence.
- Selection is blind: candidates are anonymous and shuffled, and "picking an output from an unmodified harness is a completely valid and expected outcome".
- The reflector writes a ledger row per changed component with a verdict: helped, hurt, no observed effect, confounded ("prefer it" when several components changed at once or one rollout is all there is). Then at most one lesson: cue (the shape of situation), lesson (an operation on a named component), evidence (the rows it rests on), confidence. "A lesson resting only on confounded rows is a guess"; with no contrast, it writes NO_ENTRY.
- The library is per domain: the whole adopted harness plus EXPERIENCE.md, read before the next task in that domain, never a summary. Library components are copied and their facts re-verified: "an earlier task's mapping or threshold is a hypothesis here".
- Encoding: a skill with a trigger "costs nothing until that situation arises"; always-on memory "is paid for on every run -- so if you add some, cut some".
- Facts over procedure: write the verified workspace fact itself, labelled; "a guessed fact is worse than none".
- Reported: one step improved GLM-5 and Gemini 3.5 Flash by up to 11.5 points on WorkBuddy-Bench, 4.5 on JobBench and 11.8 on LAB's partial pass rate (README; self-reported).

## What it means here

| Finding | Here today | Gap |
|---|---|---|
| Decompose on a strong model, execute on a cheaper one | puppeteering roles: Opus lead, Sonnet teammates, Haiku ops | None |
| Context before code is the strongest lever | Scriptorium's chain | Uber's graph is generated from code; the chain holds why and what was decided. They complement |
| Cost visible all the time | puppet-monitor shows agents and alerts | No cost |
| Outcome-denominated cost and revert rate | metrics: first-pass rate, rework rounds | No cost per accepted spec, no revert rate |
| A benchmark of the agent's own past work | rework.md holds returned changes with known causes | Not used to score reviewer configurations |
| Keep a change only if a run proves it (Harness2 Compose; Uber's benchmarks) | A rework prevention must be proven by replay | Lessons in puppeteering's LESSONS.md need no replay |
| Each change gets a verdict; "confounded" when several changed at once | Rework rows name a cause | No verdict per change; changes shipped together are credited together |
| Two lenses kept apart: how the agent works, what a practitioner knows | puppeteering is the first, Scriptorium the second | Not said anywhere |
| A lesson records situation, lesson and evidence; weak evidence writes nothing | LESSONS.md entries; rework rows | No required evidence field in LESSONS.md |

## Sources

- Uber, "Running a Software Factory Efficiently at Uber Scale", uber.com/us/en/blog/efficient-software-factory/, 2026-08-27 (PDF supplied by the owner).
- Harness2: github.com/google-research/harness2 at 6868817; arXiv 2610.14224 (not opened).
