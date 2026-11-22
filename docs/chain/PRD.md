# Chain PRD

Status: Approved (2026-11-22)
Approval: content ASR_OGQqlGDj; rests on ../PRODUCT.md F7LrvhspMBeq

## Summary

The chain slice is the core of Scriptorium: the documents of a product in order, the layout they live in, the checks that gate each one, the lint that keeps them short and honest, and the hooks that run all of it without the agent choosing to. It also shows the status of every document and what drifted. Not yet met today: R-CHAIN-6 in part (default caps are enforced; a project cannot lower them yet), R-CHAIN-12 (glossary in code and test names), R-CHAIN-15 (gate before code edits), R-CHAIN-18 (inbox age). R-CHAIN-30 to R-CHAIN-34 are being built. No question is open.

Last change: 2026-11-22, R-CHAIN-38 diagrams and R-CHAIN-39 specs checked against code (owner)

Part of [the product overview](../PRODUCT.md). States what, not how: name no technology.

## Why
No request is recorded for this slice yet. It answers the problem in section 1 of the product overview and the decisions it absorbs from [the decision inbox](../DECISIONS.md): D-1, D-3 to D-6, D-16, D-23 to D-28, L-5, L-7, L-9 and L-11 to L-14.

## Use cases
UC-1 (start a chain), UC-4 (write and check a step), UC-5 (make a small change) and UC-7 (see status and drift), all from the product overview.

## Requirements
- **R-CHAIN-1.** Every document type of the chain (product overview, PRD, FRD, UX, cross-cutting TP, TP, ADR, spec, request) has a template whose sections and ids match the decided model (D-27, L-7).
- **R-CHAIN-2.** Every document lives at the place its type fixes under `docs/`, and a slice folder cannot take a reserved name (D-16).
- **R-CHAIN-3.** Every document carries a status line, and only the owner moves it to Approved; an agent never writes an approval (D-6).
- **R-CHAIN-4.** A document can be approved only if the document it rests on is approved and its own open questions section holds no Q-n (D-3, principle 2).
- **R-CHAIN-5.** A TP can be approved only if the cross-cutting TP is approved and each ADR it cites is accepted. An ADR may be accepted before its TP is approved.
- **R-CHAIN-6.** Every document type has a line cap, and a document over its cap fails its check, except an ADR written before the project adopted the chain, numbered at or below the cutoff the project sets when it adopts; such an ADR is also not held to the ADR template, and a TP may cite it unless it says it is not accepted (D-5, principle 6, D-2 of an adopting project: existing documents are migrated as they are).
- **R-CHAIN-7.** Every chain document opens with a summary in its first 20 lines that ends with a "Last change" line carrying a date and what changed (D-24).
- **R-CHAIN-8.** A change that alters the body of a document without altering its summary fails review, unless the change states a reason for that document (L-11).
- **R-CHAIN-9.** An approval records a fingerprint of the document's own body and of each document it rests on, ignoring line endings, what a formatter changes (runs of spaces, blank lines, table padding), and a header line "Links:" that holds only links and the status, approval and last-change lines. A check fails an approved document whose body or whose parent no longer matches its record, until the owner approves it again or clears the parent change in a committed edit. Status lists each such document as drift (D-4, L-14, UC-7).
- **R-CHAIN-10.** Each document type has a check that passes good input and fails bad input, and a check states what it cannot see (principle 4).
- **R-CHAIN-11.** A lint fails documents on banned phrases, filler sections, text copied from an upstream document, references to documents that do not exist, and words the glossary bans (D-25, L-13, L-9).
- **R-CHAIN-12.** Glossary terms are used in code names and test names as the glossary spells them, and a banned synonym there fails a check (L-9).
- **R-CHAIN-13.** Status shows every document, its state, its parent, what drifted and what comes next, for the whole product or one slice (UC-7).
- **R-CHAIN-14.** A small change takes the short path: a spec resting on an existing FRD, with no new PRD or FRD (D-1, UC-5, principle 5).
- **R-CHAIN-15.** Code and configuration cannot be edited without an approved spec or a declared short path (test files excepted, D-30), and the gate does not depend on the agent choosing to run it (L-12, D-26).
- **R-CHAIN-16.** The checks run on three layers that do not depend on the agent: hooks inside the agent host, a hook at commit time, and a run on every pull request that nobody can skip (L-12).
- **R-CHAIN-17.** A project records its own rules in a checks register, each with an id, what it prevents, a command and a replay of the failure it catches, and a row with no command fails (L-12, D-26).
- **R-CHAIN-18.** The decision inbox stays short: an entry with no target document, or older than a set age, fails a check, and absorbed entries move to a monthly archive (D-23, L-5).
- **R-CHAIN-19.** Each document type has a skill that teaches how to write it well, with a complete worked example (D-27, UC-1, UC-4).
- **R-CHAIN-20.** The hooks never act in a project without a product overview, and they check only the documents that changed (L-12).
- **R-CHAIN-21.** The lint fails links and anchors that lead nowhere, and replay paths in the checks register that do not exist (L-13, L-12).
- **R-CHAIN-22.** The status line of each kind of document takes only its own values: requests Open, Accepted, Rejected or Merged into REQ-m; ADRs Proposed, Accepted, Superseded or Rejected; every other document Draft or Approved with a date (L-7).
- **R-CHAIN-23.** Tests name the example, state or invariant they cover with a tag. A check fails a tag that names an id no FRD defines, and an approved example, state or invariant that no test covers, unless a tag waives it with a stated reason (D-28, L-14).
- **R-CHAIN-24.** The history of a document is generated from git on request and never kept by hand in the document (D-28, L-14).
- **R-CHAIN-25.** No document carries a version number; git and release tags are the history (D-28).
- **R-CHAIN-26.** A spec is small enough for one agent run: it caps its lines and files, quotes the rows it builds verbatim from its parent, and has one done command, so a small model needs no other document (REQ-1, L-15).
- **R-CHAIN-27.** Work that is not product, such as CI, configuration, dependencies or a fix, uses the same spec, resting on a TP, an ADR, a registry row or an accepted request. A TP for such work rests on an accepted request or a registry instead of an FRD, and cites the ids of that request's Decision rows or of the registry rows (REQ-1, L-15, issue #2).
- **R-CHAIN-28.** A replaced document says what replaced it, and the checks stop demanding coverage and freshness from it; whether a spec is done is computed by running its done command, never written by hand (REQ-2, L-15).
- **R-CHAIN-29.** In a project that uses Changesets, a commit that changes code without a changeset fails (D-22, L-15).
- **R-CHAIN-30.** Each project pins the format of its rules in a folder of its own; a project with no pin keeps the oldest supported rules, and a pin newer than the tool is reported, never guessed (REQ-5, D-31, L-16).
- **R-CHAIN-31.** A rule newer than a project's pin only warns, in every hook, pre-commit and CI, and names the format that brings it (REQ-5, D-31, L-16).
- **R-CHAIN-32.** One command migrates a project to the next format: a dry run first, mechanical rewrites only, and the pin moves only when the next format passes; a skill does what needs judgment (REQ-5, L-16).
- **R-CHAIN-33.** The checks support the current and the previous format, and each released format has a frozen example that today's checks must pass under its own pin (REQ-5, D-31, L-16).
- **R-CHAIN-34.** The checks run outside the agent as a command-line tool a project pins by version, and the git hook is installed from a folder the project commits (REQ-5, D-15, L-16).
- **R-CHAIN-35.** Every spec names what it builds on: existing code by path and name, and a precedent spec, or why there is none; the check fails a name that does not exist, and review fails code that repeats existing code (REQ-7).
- **R-CHAIN-36.** Every open question names who answers it: the owner, with the reason only the owner can; research; or the lead. The owner is asked only the owner's questions, together, each with a recommendation (REQ-10, D-36).
- **R-CHAIN-37.** The checks pass on a fixture of a project that adopted the chain with its history, and a verbatim export of another tool has one place outside docs/, linked from the document that absorbed it (REQ-13).
- **R-CHAIN-38.** A TP's architecture, each UX flow, and the states of an FRD that has states are drawn as a Mermaid diagram that GitHub renders with no tool installed; one page of practices says which diagram fits which question and how to keep it small and readable, and the checks lint what text can show (REQ-15).
- **R-CHAIN-39.** Every path a spec names is a tracked file unless the spec creates it, and a call in one spec has the argument count its sibling spec declares (REQ-14).

## Principles honored
Principle 2 shapes R-CHAIN-4 and R-CHAIN-5: nothing is approved over an open question or an unapproved parent. Principle 3 shapes R-CHAIN-3: the owner alone approves. Principle 4 shapes R-CHAIN-10, R-CHAIN-15 and R-CHAIN-16: a rule counts only when a script enforces it. Principle 5 shapes R-CHAIN-14: a small change skips the full chain. Principle 6 shapes R-CHAIN-6 and R-CHAIN-7: short documents that start with what matters. Principle 7 shapes R-CHAIN-9, R-CHAIN-23 and R-CHAIN-24: drift is detected, coverage is scanned and history is read from git, none of it assumed.

## Non-goals
This slice does not adopt existing documents or map code (the adopt slice), does not manage open questions beyond the gate that blocks approval (the questions slice), does not record requests (the intake slice), does not define the UX document's own check beyond its template (the ux slice), does not log run metrics (D-7), or rework (L-6, L-10, D-33), which the metrics slice takes, and leaves the test model (L-8) to the spec step, and does not package or release the plugin (the package slice). It does not judge whether a document is good, only whether it is well formed and consistent.

## Dependencies
The product overview must be approved first. The questions, intake and ux slices supply the Q-n, REQ-n and UX documents that this slice only checks for shape and links. The package slice ships what this slice defines.

## Success criteria
- Scriptorium's own chain passes every check in this slice, and status reports no drift, by the 0.3.0 release.
- Every rule listed in the requirements above fails a prepared bad input in the check's own tests, and the same check passes a good input.
- Deputy's chain passes the same checks with no change to the checks.
- A change that edits a body and leaves its summary alone is stopped on the pull request in every case of a prepared set of ten such changes.
- Every approved example in Scriptorium's own FRDs has a test that names it, or a stated reason why not.

## Open questions
None. The five questions were answered by the owner on 2026-11-20 (D-29).
