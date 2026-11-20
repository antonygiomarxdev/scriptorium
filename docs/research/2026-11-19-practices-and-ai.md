# Research: how large products document before code, and what changes with AI agents

Date: 2026-11-19. Three researcher agents (web sources), synthesized by the lead. Practice means what a company says it does; evidence means something measured. Items marked UNVERIFIED were seen only in secondary sources or search snippets.

## Summary

- Companies and the new AI tools converge on the same order Scriptorium uses: problem and users first, requirements without technology, a technical plan separate from them, one decision per ADR, small tasks checked by tests, a human gate on each artifact.
- Scriptorium is heavier than all of them. No company or tool found uses three technical layers (cross-cutting TP, a TP per FRD, ADRs) before a spec, and every one of them scales the process down for small changes. Scriptorium has no small path.
- Nothing measured shows that a full document chain beats plan mode plus tests. The best evidence supports two parts only: giving the agent product context, and resolving ambiguity before code.

## What converges

| Idea | Companies | AI-era tools |
|---|---|---|
| Problem before solution | Amazon PR/FAQ, HashiCorp PRD then RFC, Shape Up pitch | Spec Kit Specify then Plan, Kiro requirements then design |
| Requirements name no technology | ISO/IEC/IEEE 29148 (UNVERIFIED, secondary) | Spec Kit: "without technical stack choices" |
| Explicit non-goals | Google design docs, Shape Up no-gos | Osmani's "never" boundaries |
| One decision per record, immutable, superseded | Nygard 2011, AWS, UK GDS, Spotify | Instil: ADRs are the spec that outlives a change |
| Human review gate per artifact | Uber, Kubernetes KEPs, Oxide RFDs | Kiro review, OpenSpec plan before apply |
| Small tasks with tests as feedback | DO-178C requirements-based testing | Böckeler: guides need sensors; Anthropic: "give it a check to run" |
| Process scales with the change | Google mini design doc, Uber light template, Spotify lightweight ADRs | Kiro Quick Spec and bugfix spec, BMAD "process size scales with the work", OpenSpec "fluid not rigid" |

## Where Scriptorium differs

1. **No small path.** The strongest critique of spec-driven development is volume: Spec Kit produced about 1,300 lines for a date-display feature (Marmelab, 2025-11-12), Kiro turned a small bug into 4 user stories and 16 acceptance criteria (Böckeler, martinfowler.com, 2025-10-15). Thoughtworks Radar (2025-11-05) warns of "heavy up-front specification and big-bang releases".
2. **Three technical layers.** Google uses one design doc; Uber and HashiCorp one RFC; Spotify writes an RFC and records its outcome in an ADR. MADR already holds compared options (Considered Options, Pros and Cons) inside the ADR.
3. **Nothing handles drift.** Google, Oxide and GDS admit design docs drift; Instil (2026-06-19) and Böckeler name it as the main SDD failure. OpenSpec keeps a persistent spec and applies each change as a delta, then archives it (Thoughtworks moved it to Trial, 2026-11).
4. **Checks see structure, not ambiguity.** Kiro checks requirements for contradiction and ambiguity (secondary, 2026-05). Evidence below says ambiguity is what costs.
5. **No limit on length.** A study of AGENTS.md-style files found no gain in task success and over 20% more inference cost; unnecessary requirements make tasks harder (arXiv 2602.11988, 2026-02). Review burden is the most cited complaint (Böckeler, Spotify 2026-06-03).
6. **Approval rules are thin.** Kubernetes requires approvers distinct from authors; Oxide's own RFD 1 leaves the tie-break undefined. Scriptorium names the owner but says nothing about an agent approving its own document or an owner who does not answer.

## Evidence

- **Underspecification costs correctness.** Claude Sonnet 4.5 resolved 70.8% of tasks fully specified, 54.8% underspecified without clarification (arXiv 2603.26233, 2026-03, 500 tasks). Ambiguity dropped pass@1 by 7.8 to 19.8 points, and models almost never ask once there are two or more ambiguities (ClarifyCodeBench, arXiv 2607.00711, 2026-07). Interaction recovered about 80 to 89% of full-spec performance for Claude models (Ambig-SWE, arXiv 2502.13069, ICLR 2026).
- **Product context changes decisions.** Giving Claude Code product context raised compliance with product decisions from 46% to 95%; decisions not visible in code scored 0 to 33% without it (arXiv 2605.08112, 8 tasks, 41 decision points, preprint).
- **Tests in the prompt help small tasks, fragile at repo level.** TiCoder (arXiv 2404.10100) and MBPP+ results help; HumanEval+ and LiveCodeBench show no reliable gain (arXiv 2607.26244). Nothing measures Given/When/Then acceptance tests or ATDD in agentic repo work.
- **Early fixing is not proven 100x cheaper.** The 100x curve traces to unpublished IBM training notes (Bossavit; The Register 2021-07-22). 171 TSP projects showed no consistent delayed-issue effect (Menzies et al., arXiv 1609.04886).
- **AI amplifies existing practice.** DORA 2024: more AI adoption, better documentation quality, lower delivery stability. DORA 2025: AI is "an amplifier". Survey correlations, not causes.
- **Perceived speed is unreliable.** METR 2025: experienced developers were 19% slower with AI while believing they were 20% faster; the 2026 follow-up is inconclusive.
- **ADRs:** perceived as useful in one company study; no measured outcome found.

## Recommendations, for the owner to decide

| # | Change | Rests on |
|---|---|---|
| 1 | Add a size ladder: a bug or small change goes straight to a spec (or a short change note) resting on an existing FRD; only a new feature or slice goes through PRD and FRD. Skipping a step needs a written reason. | Convergence on scaling; Marmelab, Böckeler, Radar |
| 2 | Merge the TP per FRD into the ADR: the ADR holds the compared options (MADR). Keep the cross-cutting TP. | Google, Uber, HashiCorp, Spotify, MADR |
| 3 | Gate approval on resolved open questions: a document with an unanswered open question cannot be approved, and agents list questions instead of assuming. | Underspecification evidence |
| 4 | Add a drift check: flag an approved document whose upstream document changed after it was approved (git dates), and a superseded state. | Google, Oxide, GDS, Instil, OpenSpec |
| 5 | Add a length cap per document type, enforced by a check. | AGENTS.md study, review burden, HANDOFF line-cap item |
| 6 | Approval: the author (agent or person) never approves; record who approved. | Kubernetes KEPs, Uber |
| 7 | Add appetite (size budget) to PRODUCT or each PRD. | Shape Up, Amazon |
| 8 | Measure: log per run the questions asked, rework rounds and reviewer findings, so Scriptorium produces the evidence nobody has. | No head-to-head study exists |
| 9 | Make the spec template stack-neutral: no TypeScript, SQL or Deputy folder layout. | Requirements and plan separate; the stack comes from the TP |
| 10 | Never claim the chain speeds delivery or cites "100x"; claim only clarity before code. | Bossavit, Menzies, METR |

## Open doubts

- No controlled comparison of a document chain against plan mode plus tests exists. Scriptorium's core claim is untested.
- Most 2026 evidence is arXiv preprints, often single-author or small samples.
- No primary source found for Google PRDs, Stripe design reviews, or Meta and Amazon internal practice beyond Kiro. ISO 29148, IEC 62304 and DO-178C were read only through secondary sources.
- Whether agent reviewers add real checking or only more text for the owner to read.

## Main sources

- Amazon PR/FAQ: https://www.workingbackwards.com/concepts/working-backwards-pr-faq-process/ ; six-pagers: https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders
- Google design docs (Malte Ubl, 2020): https://www.industrialempathy.com/posts/design-docs-at-google/
- Uber RFCs: https://blog.pragmaticengineer.com/scaling-engineering-teams-via-writing-things-down-rfcs/
- Oxide RFD 1: https://rfd.shared.oxide.computer/rfd/0001
- HashiCorp PRD and RFC: https://www.hashicorp.com/en/how-hashicorp-works/articles/writing-practices-and-culture
- Kubernetes KEPs: https://github.com/kubernetes/enhancements/blob/master/keps/sig-architecture/0000-kep-process/README.md
- Nygard ADRs (2011-11-15): https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions ; MADR: https://adr.github.io/madr/ ; AWS: https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html ; UK GDS: https://gds-way.digital.cabinet-office.gov.uk/standards/architecture-decisions.html ; Spotify: https://engineering.atspotify.com/2020/4/when-should-i-write-an-architecture-decision-record
- Shape Up: https://basecamp.com/shapeup/1.5-chapter-06
- Spec Kit: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- Kiro: https://kiro.dev/docs/specs/
- OpenSpec: https://github.com/Fission-AI/OpenSpec ; Radar: https://www.thoughtworks.com/radar/tools/openspec
- BMAD: https://github.com/bmad-code-org/BMAD-METHOD
- Böckeler, SDD tools (2025-10-15): https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html ; harness engineering (2026-04-02): https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
- Thoughtworks Radar, SDD: https://www.thoughtworks.com/radar/techniques/spec-driven-development
- Marmelab critique: https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back.html ; Instil: https://instil.co/blog/spec-driven-development-is-dead-long-live-plan-mode
- GitHub, AGENTS.md from 2,500 repos: https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- Anthropic context engineering: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Stripe Minions: https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents ; Spotify Honk: https://engineering.atspotify.com/2026/6/code-with-claude-coding-is-no-longer-the-constraint
- Underspecification: https://arxiv.org/html/2603.26233 ; https://arxiv.org/html/2607.00711v2 ; https://arxiv.org/html/2502.13069v3
- Product context: https://arxiv.org/abs/2605.08112 ; context files: https://arxiv.org/abs/2602.11988
- Tests in prompts: https://arxiv.org/html/2404.10100 ; https://arxiv.org/html/2607.26244v1
- Defect cost: https://www.theregister.com/software/2021/07/22/everyone-cites-that-bugs-are-100x-more-expensive-to-fix-in-production-research-but-the-study-might-not-even-exist/1371906 ; https://arxiv.org/html/1609.04886
- METR: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ ; https://metr.substack.com/p/2026-02-24-uplift-update
- DORA: https://dora.dev/research/2024/dora-report/ ; https://dora.dev/dora-report-2025/
