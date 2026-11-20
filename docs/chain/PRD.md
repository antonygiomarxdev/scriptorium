# Chain PRD

Status: Draft

## Summary

The chain slice is the core of Scriptorium: the documents of a product in order, the layout they live in, the checks that gate each one, the lint that keeps them short and honest, and the hooks that run all of it without the agent choosing to. It also shows the status of every document and what drifted. Not yet met today: R-CHAIN-6 (caps exist; their values wait on Q-1), R-CHAIN-9 (drift), R-CHAIN-12 (glossary in code and test names), R-CHAIN-15 (gate before code edits), R-CHAIN-18 (inbox age). Five questions wait for the owner.

Last change: 2026-11-20, review fixes: Why trimmed, 3 requirements added, R-CHAIN-5 corrected, unmet list; caps exist, values open

Part of [the product overview](../PRODUCT.md). States what, not how: name no technology.

## Why
No request is recorded for this slice yet. It answers the problem in section 1 of the product overview and the decisions it absorbs from [the decision inbox](../DECISIONS.md): D-1, D-3 to D-6, D-16, D-23 to D-27, L-5, L-7, L-9 and L-11 to L-13.

## Use cases
UC-1 (start a chain), UC-4 (write and check a step), UC-5 (make a small change) and UC-7 (see status and drift), all from the product overview.

## Requirements
- **R-CHAIN-1.** Every document type of the chain (product overview, PRD, FRD, UX, cross-cutting TP, TP, ADR, spec, request, retro) has a template whose sections and ids match the decided model (D-27, L-7).
- **R-CHAIN-2.** Every document lives at the place its type fixes under `docs/`, and a slice folder cannot take a reserved name (D-16).
- **R-CHAIN-3.** Every document carries a status line, and only the owner moves it to Approved; an agent never writes an approval (D-6).
- **R-CHAIN-4.** A document can be approved only if the document it rests on is approved and its own open questions section holds no Q-n (D-3, principle 2).
- **R-CHAIN-5.** A TP can be approved only if the cross-cutting TP is approved and each ADR it cites is accepted. An ADR may be accepted before its TP is approved.
- **R-CHAIN-6.** Every document type has a line cap, and a document over its cap fails its check (D-5, principle 6).
- **R-CHAIN-7.** Every chain document opens with a summary in its first 20 lines that ends with a "Last change" line carrying a date and what changed (D-24).
- **R-CHAIN-8.** A change that alters the body of a document without altering its summary fails review, unless the change states a reason for that document (L-11).
- **R-CHAIN-9.** A check fails an approved document whose upstream document changed after the approval, and status lists it as drift (D-4, UC-7).
- **R-CHAIN-10.** Each document type has a check that passes good input and fails bad input, and a check states what it cannot see (principle 4).
- **R-CHAIN-11.** A lint fails documents on banned phrases, filler sections, text copied from an upstream document, references to documents that do not exist, and words the glossary bans (D-25, L-13, L-9).
- **R-CHAIN-12.** Glossary terms are used in code names and test names as the glossary spells them, and a banned synonym there fails a check (L-9).
- **R-CHAIN-13.** Status shows every document, its state, its parent, what drifted and what comes next, for the whole product or one slice (UC-7).
- **R-CHAIN-14.** A small change takes the short path: a spec resting on an existing FRD, with no new PRD or FRD (D-1, UC-5, principle 5).
- **R-CHAIN-15.** Code cannot be edited without an approved spec or a declared short path, and the gate does not depend on the agent choosing to run it (L-12, D-26).
- **R-CHAIN-16.** The checks run on three layers that do not depend on the agent: hooks inside the agent host, a hook at commit time, and a run on every pull request that nobody can skip (L-12).
- **R-CHAIN-17.** A project records its own rules in a checks register, each with an id, what it prevents, a command and a replay of the failure it catches, and a row with no command fails (L-12, D-26).
- **R-CHAIN-18.** The decision inbox stays short: an entry with no target document, or older than a set age, fails a check, and absorbed entries move to a monthly archive (D-23, L-5).
- **R-CHAIN-19.** Each document type has a skill that teaches how to write it well, with a complete worked example (D-27, UC-1, UC-4).
- **R-CHAIN-20.** The hooks never act in a project without a product overview, and they check only the documents that changed (L-12).
- **R-CHAIN-21.** The lint fails links and anchors that lead nowhere, and replay paths in the checks register that do not exist (L-13, L-12).
- **R-CHAIN-22.** The status line of each kind of document takes only its own values: requests Open, Accepted, Rejected or Merged into REQ-m; ADRs Proposed, Accepted, Superseded or Rejected; every other document Draft or Approved with a date (L-7).

## Principles honored
Principle 2 shapes R-CHAIN-4 and R-CHAIN-5: nothing is approved over an open question or an unapproved parent. Principle 3 shapes R-CHAIN-3: the owner alone approves. Principle 4 shapes R-CHAIN-10, R-CHAIN-15 and R-CHAIN-16: a rule counts only when a script enforces it. Principle 5 shapes R-CHAIN-14: a small change skips the full chain. Principle 6 shapes R-CHAIN-6 and R-CHAIN-7: short documents that start with what matters. Principle 7 shapes R-CHAIN-9: drift is detected, not assumed.

## Non-goals
This slice does not adopt existing documents or map code (the adopt slice), does not manage open questions beyond the gate that blocks approval (the questions slice), does not record requests (the intake slice), does not define the UX document's own check beyond its template (the ux slice), does not log run metrics (D-7), rework or the retro (L-6, L-10), which the metrics slice takes, and leaves the test model (L-8) to the spec step, and does not package or release the plugin (the package slice). It does not judge whether a document is good, only whether it is well formed and consistent.

## Dependencies
The product overview must be approved first. The questions, intake and ux slices supply the Q-n, REQ-n and UX documents that this slice only checks for shape and links. The package slice ships what this slice defines.

## Success criteria
- Scriptorium's own chain passes every check in this slice, and status reports no drift, by the 0.3.0 release.
- Every rule listed in the requirements above fails a prepared bad input in the check's own tests, and the same check passes a good input.
- Deputy's chain passes the same checks with no change to the checks.
- A change that edits a body and leaves its summary alone is stopped on the pull request in every case of a prepared set of ten such changes.

## Open questions
- **Q-1.** What line cap does each document type get? Recommendation: PRD 120, FRD 200, TP 200, ADR 100, spec 150, request 40, retro 150, decision inbox 150.
- **Q-2.** How old may an inbox decision be before it fails? Recommendation: 30 days.
- **Q-3.** May a project set stricter caps than the defaults, or are the caps fixed? Recommendation: stricter allowed, looser never.
- **Q-4.** Does the gate before code edits (R-CHAIN-15) apply to every file outside `docs/`, or only to a list of source folders the project names? Recommendation: every file outside `docs/`, tests and configuration excepted.
- **Q-5.** When a pull request states a reason to leave a summary unchanged (R-CHAIN-8), who approves the reason? Recommendation: the owner, in the pull request review.
