# Scriptorium: product overview

Status: Draft

## Summary

Scriptorium makes a project write down what it is building, and why, before an agent writes the code: product, requirements, features, technical choices and specs, each checked by a script and approved by its owner before the next. It is the layer above spec-driven development. It works with any coding agent, starting with Claude Code, and it measures its own effect instead of claiming it.

- Most important rule: nothing moves on while a question is open (principle 2).
- Small changes take a short path; the full chain is for new features and slices (principle 5).
- Every rule that can be checked is a script, and every check says what it cannot see (principle 4).
- Review is closed: a change fails only against an approved acceptance criterion or a failed gate, and every recurring failure becomes a proven check (D-19, L-6, L-10).

Last change: 2026-11-20, the model is decided (D-1 to D-24, L-2 to L-11); templates and checks are next.

What every slice shares. Product decisions: [DECISIONS.md](DECISIONS.md). Terms: [GLOSSARY.md](GLOSSARY.md). Research: [research/](research/).

## 1. Problem

Coding agents write code faster than anyone can say what the code should do. The gap is before the spec: what the product is, who it serves, what each part must do, and which technical choices were made and why.

- Agents rarely ask when a task is ambiguous; with the task underspecified, one model's resolve rate fell from 70.8% to 54.8% (arXiv 2603.26233). Given the product's context, compliance with product decisions rose from 46% to 95% (arXiv 2605.08112).
- Spec-driven tools answer this with heavy up-front documents: about 1,300 lines for a date display, 16 acceptance criteria for a small bug. Reviewers drown and specs drift from the code (Böckeler 2025, Thoughtworks Radar 2025, Instil 2026).
- Owners often believe they know how their product works, and the code says otherwise. Nothing shows them the difference.
- In the owner's Gauntlet project, 43% of builder defects came from something the brief did not say. In a production monorepo of about 8,500 files (backend, web, landing, mobile), 94% of changes are returned at least once by a reviewer (owner-reported, 2026-11-20).
- Requests arrive informally ("users do this elsewhere and we cannot", "add this option"). The reason behind a change is lost before the change is built.

## 2. Product

Templates, checks run by script (Bun), and one skill per step in the open SKILL.md format, so any agent that reads skills can run the chain. The Claude Code plugin is the first package.

```mermaid
flowchart LR
  P[PRODUCT] --> PRD[PRD per slice] --> FRD[FRDs] --> CTP[Cross-cutting TP] --> TP[TP per FRD] --> S[Spec per FRD] --> C[Code, tests first]
  TP -. architecturally significant .-> ADR[ADR]
  CTP -.-> ADR
  Q{{Open questions closed?}} -.gate.- PRD & FRD & TP & S
  SP[Small change] --> S
  R[Request: who and why] --> PRD
  R --> SP
  FRD --> UX[UX, when the interface changes] --> TP
  C --> RV{Accepted first time?}
  RV -- no: log step and cause --> M[(Rework log)] --> RT[Retro: fix templates and checks]
``` It starts a chain in a new project, adopts the documents an existing project already has, maps undocumented code into draft documents, and shows the status of every document. It runs with one owner and agents, or with an agent team.

## 3. Users

- **The owner**: decides what the product is and approves its documents. Often a solo developer who writes and approves their own documents.
- **Agents**: write documents, review them against the step above, and build from approved specs. They never approve.
- **Teams** using an agent team practice such as puppeteering: Scriptorium is what they write; the team practice is how they run.

## 4. Principles

1. **What before how.** Product, PRD and FRDs name no technology; technical choices start at the TP, after the FRDs.
2. **Nothing moves on open.** A document with an open question cannot be approved. An unclear answer leads to a grilling session or to waiting for the person who knows.
3. **The owner decides.** Only the owner approves; agents write and review.
4. **Checks over trust.** Every rule that can be checked is a script that passes or fails; a check states what it cannot see, and a reviewer covers the rest.
5. **Size follows the change.** A small change takes the short path; the full chain is for new features and slices.
6. **Short and front-loaded.** Every document starts with its summary and stays under its line cap.
7. **Documents follow the product.** Drift is detected, and existing code can be mapped into documents to show the gaps between belief and implementation.
8. **Measure, do not claim.** Runs log their questions, rework and findings. Scriptorium claims only what it has measured.
9. **Stands alone.** Works in any project and stack; templates carry nothing from one project.
10. **Any agent.** Nothing in the chain depends on one agent host; a host gets a thin package around the same templates, checks and skills.
11. **Show it.** A diagram goes wherever it explains faster than text.

## 5. Use cases

| ID | Name | Description |
|---|---|---|
| UC-1 | Start a chain | The owner starts a new product and writes its PRODUCT with an agent. |
| UC-2 | Adopt existing documents | The owner has PRDs, RFCs or ADRs in another shape; an agent maps them to the chain and migrates them after the owner approves a plan. |
| UC-3 | Map existing code | The owner has code with no documents; an agent drafts them from the code and lists the gaps between what the owner believes and what the code does. |
| UC-4 | Write and check a step | An agent writes a PRD, FRD, the cross-cutting TP, a TP per FRD, an ADR when a choice is architecturally significant, or a spec; its check passes; a reviewer reads it against the step above. |
| UC-5 | Make a small change | A bug or small change goes through the short path, resting on an existing FRD. |
| UC-6 | Close open questions | The agent grills the owner one question at a time with a recommendation, or the document waits for someone else. |
| UC-7 | See status and drift | The owner sees every document, its status, what drifted and what is next. |
| UC-8 | Read run metrics | The owner sees the first-pass rate, rework rounds and findings per change and over time. |
| UC-10 | Record a request | Someone asks for a change, informally; the agent records who asked, what they said and the problem behind it, and the change cites it. |
| UC-11 | Design the interface | For a change that touches the interface, an agent writes its flows, screens, states and design-system components before the technical proposal. |
| UC-12 | Find where the chain fails | Every returned change logs where its problems should have been caught; a retro turns the most frequent failures into changes to templates and checks. |
| UC-9 | Install and update | A user installs Scriptorium in their agent and receives each release automatically. |

## 6. Scope

v1: UC-1 to UC-12, for one product per repository, on Claude Code only (D-20). Skills stay in the open SKILL.md format so other agents can come later.

Out of v1: a web UI, multi-product repositories, team permissions beyond one owner.

## 7. Slice map

| Slice | Folder | Covers | Use cases |
|---|---|---|---|
| chain | `docs/chain/` | Templates and checks for every step, the gate, status and drift | UC-1, UC-4, UC-5, UC-7 |
| adopt | `docs/adopt/` | Adopting documents and mapping code, with the gap report | UC-2, UC-3 |
| questions | `docs/questions/` | Open questions, grilling, waiting on someone | UC-6 |
| intake | `docs/intake/` | Requests and the reason behind each change | UC-10 |
| ux | `docs/ux/` | The UX document and its check | UC-11 |
| metrics | `docs/metrics/` | The rework log, its report and the retro | UC-8, UC-12 |
| package | `docs/package/` | Packaging for each agent host, releases and versions | UC-9 |

## 8. Success criteria

- Scriptorium's own chain passes every check, and its status shows no drift.
- Deputy's chain passes the same checks without changes to the checks.
- The owner's production monorepo is restructured to the chain with `/scriptorium:adopt` and passes its checks.
- Every run logs its metrics, and the owner can compare runs.
- A release reaches an installed plugin with no manual step.

## 9. Constraints and facts

| Fact | Effect | Verified |
|---|---|---|
| Claude Code substitutes `${CLAUDE_PLUGIN_ROOT}` in skill bodies | Skills run the checks from the installed plugin | code.claude.com plugins reference, 2026-11-19 |
| A pinned `version` keeps users on it until it changes; auto-update is off by default for third-party marketplaces | Releases must bump the version; users must turn auto-update on | code.claude.com plugin loading, 2026-11-19 |
| Claude Code's Read tool reads up to 2000 lines by default, but agents often read only part of a file or a search hit | Summary first, and a line cap | Read tool description, 2026-11-20 |
| The checks run on Bun | Bun is required on the machine | scripts/check.ts |
| The checks look for slices under `src/<slice>/docs/` today | They must move to `docs/<slice>/` (D-16) | scripts/check.ts |
| SKILL.md is an open standard (agentskills.io, Dec 2025), read by Codex, Copilot and Gemini CLI, with different skill folders per host | Skills port; their install path differs per host | Secondary sources, 2026-11-20; check each host's docs |
| `${CLAUDE_PLUGIN_ROOT}` exists only in Claude Code | Skills need another way to find the checks on other hosts | code.claude.com plugins reference |

## 10. Open questions

None open. The rework model was answered by L-6 to L-10.
