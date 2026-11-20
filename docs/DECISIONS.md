# Decisions

Product decisions by the owner (D-n) and design decisions by the lead (L-n). Technical decisions go in ADRs. Research behind them: [research/2026-11-19-practices-and-ai.md](research/2026-11-19-practices-and-ai.md).

| ID | Date | Decision |
|---|---|---|
| D-1 | 2026-11-20 | The chain has a short path: a bug or small change goes to a spec resting on an existing FRD; only a new feature or slice goes through PRD and FRD. |
| D-2 | 2026-11-20 | When a change touches functionality with no PRD or FRD, the agent offers (never forces) to map it from the existing code into draft documents, and reports the gaps between what the owner believes and what the code does. |
| D-3 | 2026-11-20 | Nothing advances with an open question. When an answer is unclear, the agent asks whether to open a grilling session now or wait for someone else, and the document stays a draft until it is closed. |
| D-4 | 2026-11-20 | A check flags an approved document whose upstream document changed after it was approved. |
| D-5 | 2026-11-20 | Every document type has a line cap enforced by a check, and starts with a short summary of what matters most, because agents often read only the start of a file. |
| D-6 | 2026-11-20 | The owner may write and approve their own documents (solo work is the normal case). Agents write and review; they never approve. |
| D-7 | 2026-11-20 | Every run logs the questions asked, rework rounds and review findings. Scriptorium measures its own effect instead of claiming it. |
| D-8 | 2026-11-20 | Scriptorium is a standalone, complete product: it works in any project and stack, with no dependency on Deputy or puppeteering, and its templates carry nothing from one project. |
| D-9 | 2026-11-20 | Scriptorium uses its own chain, is documented as a first-class open source repository, and versioning is critical. |
| D-10 | 2026-11-20 | ~~No TP per FRD: the ADR holds the compared options.~~ Superseded by D-13: the lead misread the owner. |
| D-11 | 2026-11-20 | No time or cost estimates: they are rarely met. A change's size class only picks its path (D-1); the run metrics (D-7) record what it really took. |
| D-12 | 2026-11-20 | The owner's second product, a production monorepo of about 8,500 files (backend, web, landing, mobile) with a similar process, is being restructured to the chain Scriptorium defines; it is the second real project after Deputy. |
| D-13 | 2026-11-20 | One TP per FRD, holding the compared options and the choice; its spec rests on it. The cross-cutting TP stays. An ADR is written only for an architecturally significant decision, not for every TP choice. |
| D-14 | 2026-11-20 | Diagrams (Mermaid) wherever they add value: in the documents, the templates and the skills. |
| D-15 | 2026-11-20 | Scriptorium works with any coding agent. Claude Code is the first host, not the only one: templates, checks and skills must not depend on it. |
| D-16 | 2026-11-20 | Every chain document lives under `docs/`, never under `src/`: `docs/<slice>/PRD.md`, `docs/<slice>/frd/`, `docs/<slice>/tp/`, `docs/<slice>/specs/`. |
| D-17 | 2026-11-20 | Every change records why it exists: who asked, what they said, and the problem behind it, even when the request arrives informally. |
| D-18 | 2026-11-20 | A UX document is part of the chain when a change touches the interface: flows, screens, states, and the design-system components it reuses, changes or adds. |
| D-19 | 2026-11-20 | Measuring rework is required: how many rounds each change takes before it is accepted, and at which step of the chain each returned problem should have been caught, so the chain itself can be improved. In that monorepo, 94% of changes are returned at least once. |
| L-2 | 2026-11-20 | Proposed design for D-17: a short request note `docs/requests/REQ-n-name.md` that FRDs and specs cite. Approved by the owner 2026-11-20. |
| L-3 | 2026-11-20 | Proposed design for D-18: `docs/<slice>/ux/UX-NN-name.md`, one per FRD that touches the interface, written after the FRD and before its TP. Approved by the owner 2026-11-20. |
| L-4 | 2026-11-20 | ~~Generalize the monorepo's review model.~~ Withdrawn by D-21. |
| D-20 | 2026-11-20 | v1 ships for Claude Code only; other agents come later. Only the owner uses it today. |
| D-21 | 2026-11-20 | The monorepo's review model gives data but has not lowered rework; Scriptorium must not copy it. The rework design waits for research on how teams that deliver with AI actually lower rework. |
| D-22 | 2026-11-20 | Versions are managed with Changesets, as in the owner's monorepo. |
| D-23 | 2026-11-20 | The decision record must not grow without bound: in that monorepo the decision log reached 2,649 lines and 207 entries, and nobody can tell what stands. |
| L-5 | 2026-11-20 | Proposed design for D-23: a decision is not finished until it is absorbed into the document it governs (PRODUCT, a PRD, an FRD, a TP, an ADR); that document holds the current truth. DECISIONS.md is only the inbox of decisions not yet absorbed, with a line cap and a check that fails on an entry with no target document or older than a set age. Absorbed and reverted decisions move to a monthly archive (`docs/decisions/YYYY-MM.md`) that agents do not read by default. Approved by the owner 2026-11-20. |
| L-6 | 2026-11-20 | Proposed design for D-19 and D-21 ([research](research/2026-11-20-lowering-rework.md)): closed review. Gates pass before hand-over; a FAIL must cite an acceptance criterion or a failed gate; round 1 lists every finding and later rounds check only those and new defects in changed lines; at most three rounds, then the owner decides; a finding class seen twice becomes a check; acceptance tests come from the FRD before implementation; reviewer noise is measured by re-running it on an unchanged change. Approved by the owner 2026-11-20. |
| L-7 | 2026-11-20 | Proposed FRD model: one template with id'd rows (EARS behavior, rules with positive and negative examples as the owner-approved oracle, decision and state tables, invariants, ISO 25010 quality criteria, cross-cutting rows, open questions, generated acceptance criteria and trace). See [research](research/2026-11-20-templates-tests-consistency.md). Approved by the owner 2026-11-20. |
| L-8 | 2026-11-20 | Proposed test model: tests from FRD ids before code, in a step without the implementation; held-out examples; trace check both ways; no assertion-free tests; mutation gate on changed lines with a rising threshold; property tests for invariants. Approved by the owner 2026-11-20. |
| L-9 | 2026-11-20 | Proposed consistency model: glossary with banned synonyms, invariants catalog with executable checks, cross-cutting registry answered by every FRD, contract tests between slices, design tokens checked, rules that cannot have exceptions as hooks. Approved by the owner 2026-11-20. |
| L-10 | 2026-11-20 | Proposed retro model: an entry closes only with a prevention artifact and a replay of the original failure that the artifact now catches; broad classes are split; a recurrence reopens the entry and moves the fix up the chain; the log holds open entries only. Approved by the owner 2026-11-20. |
| D-24 | 2026-11-20 | Every chain document starts with a summary of what matters most, and the summary is always current: a change that matters anywhere in the document shows in its summary. |
| L-11 | 2026-11-20 | Proposed mechanism for D-24: the summary sits in the first 20 lines and ends with a "Last change" line (date and what changed). A check fails when a document's body changed in a pull request but its summary did not, unless the pull request says `Summary unchanged: <reason>` for that document. Approved by the owner 2026-11-20. |
| L-1 | 2026-11-20 | ~~release-please~~ Superseded by D-22: semver in `.claude-plugin/plugin.json`, bumped by Changesets. |
