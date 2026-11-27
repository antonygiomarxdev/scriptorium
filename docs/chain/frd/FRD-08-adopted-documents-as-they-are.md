# FRD-08: Adopted documents checked as they are

Status: Approved (2026-11-23)
Approval: content RtuWFdihKJCj; rests on ../PRD.md CCI95Z47mmmD

## Summary

A project that adopts the chain keeps its existing ADR file names and its accepted ADRs as they are, and a formatter run at commit does not invalidate an approval. An ADR file may be named NNNN-name.md or ADR-NNNN-name.md, an ADR numbered at or below the cutoff set at adoption is not held to the ADR line cap or template, and the approval fingerprint ignores spacing, blank lines and table padding.

Last change: 2026-11-22, every check reads a document's kind from its path by one rule, so an accepted ADR-NNNN-name.md is not asked for a Last change line (RULE-4, EX-28 to EX-37; owner)

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
Issue #3 and reports from another adopting project: renaming 26 accepted ADRs touched 70 files and forced unrelated cleanups; 16 accepted ADRs are over the 80-line cap and none of the legacy ADRs has the template sections, and accepted decisions must not be rewritten; a formatter that pads tables at commit made every approval fail with "body changed since approval".

## Requirements covered
R-CHAIN-5, R-CHAIN-6, R-CHAIN-9.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-08-1 | WHEN | WHEN a document cites ADR-NNNN, the checks shall find its file as ADR-NNNN-name.md or NNNN-name.md in the ADR folder. |
| FR-CHAIN-08-2 | WHEN | WHEN an ADR file is named NNNN-name.md, the docs lint shall check it as an ADR. |
| FR-CHAIN-08-3 | WHERE | WHERE an ADR's number is at or below the "legacyAdrsThrough" number in the project's Scriptorium config, the docs lint, the TP check and status shall not apply the ADR line cap or the ADR template to it. |
| FR-CHAIN-08-4 | IF | IF a TP cites such an ADR and a status line in it says Proposed, Superseded or Rejected THEN the TP check shall fail and name its status; with no status line, it counts as accepted. |
| FR-CHAIN-08-7 | IF | IF "legacyAdrsThrough" is set and is not a whole number THEN the checks shall fail and say what to write. |
| FR-CHAIN-08-8 | WHEN | WHEN the fingerprint of a document is computed, it shall leave out the first line that starts with "Links:" above the first "## " heading, and only that one, as it leaves out the status, approval and last-change lines. |
| FR-CHAIN-08-9 | IF | IF a "Links:" line holds anything but markdown links to https URLs, separated by commas or spaces, THEN the docs lint shall fail and name it. |
| FR-CHAIN-08-10 | always | The line cap of a document shall always leave out the same one Links line the fingerprint leaves out, and count every other line. |
| FR-CHAIN-08-11 | WHERE | WHERE an ADR's number is at or below the cutoff, status shall list it with the status "legacy" and shall not fail it for its status line. |
| FR-CHAIN-08-12 | WHEN | WHEN the spec check looks for a quoted row in the parent, it shall compare the row cell by cell with the spaces around each cell trimmed, and the text inside each cell exactly. |
| FR-CHAIN-08-13 | always | The line cap of a document shall always leave out its first "Approval:" line above the first "## " heading, which approve writes, so approving never takes a document over its cap. |
| FR-CHAIN-08-14 | WHEN | WHEN the fingerprint of a document is computed, it shall leave out only the first "Status:" line and the first "Approval:" line above the first "## " heading, and fingerprint every other line that starts with those words. |
| FR-CHAIN-08-5 | WHEN | WHEN the fingerprint of a document is computed, it shall ignore runs of spaces, blank lines and the dashes, colons and padding of a table separator row. |
| FR-CHAIN-08-6 | WHEN | WHEN a document was approved with the earlier fingerprint, the checks shall accept that fingerprint until it is approved again. |
| FR-CHAIN-08-15 | always | The checks, the hooks, the docs lint and trace shall always read the kind of a document from its path by one shared rule: an ADR is ADR-NNN-name.md or NNN-name.md in the ADR folder, with three or more digits; an FRD, UX, TP or spec number has two or more digits; a request is REQ-N-name.md in the requests folder. |
| FR-CHAIN-08-16 | WHEN | WHEN the summary check runs on an ADR under either name, it shall not ask for a Last change line, and it shall report nothing for an ADR at or below the cutoff. |
| FR-CHAIN-08-17 | WHEN | WHEN an ADR file is named NNN-name.md, status and the hooks shall check it as an ADR, as the docs lint and the TP check do. |
| FR-CHAIN-08-18 | always | The shared rule shall always give no kind to a file under the research, retro or decisions folder, whatever its name. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | An ADR is found under either name. | FR-CHAIN-08-1, FR-CHAIN-08-2 |
| RULE-2 | An ADR written before adoption is kept as it is, below a cutoff the project sets. | FR-CHAIN-08-3, FR-CHAIN-08-4, FR-CHAIN-08-7, FR-CHAIN-08-11 |
| RULE-3 | Formatting and links are not a change. | FR-CHAIN-08-5, FR-CHAIN-08-6, FR-CHAIN-08-8, FR-CHAIN-08-9, FR-CHAIN-08-10, FR-CHAIN-08-12, FR-CHAIN-08-13, FR-CHAIN-08-14 |
| RULE-4 | Every check reads the kind of a document from its path the same way. | FR-CHAIN-08-15, FR-CHAIN-08-16, FR-CHAIN-08-17, FR-CHAIN-08-18 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | positive | A TP says "ADR: ADR-0021" and docs/adr/0021-baselines.md exists | the TP check runs | it passes |
| EX-2 | RULE-1 | negative | A TP says "ADR: ADR-0021" and only docs/adr/00210-x.md exists | the TP check runs | it fails with "ADR-0021 has no file" |
| EX-3 | RULE-1 | positive | docs/adr/0021-baselines.md is 90 lines and the config has no legacyAdrsThrough | the docs lint runs | it fails with "ADR is 90 lines, over its cap of 80" |
| EX-4 | RULE-2 | positive | The config says "legacyAdrsThrough": 30 and docs/adr/0021-baselines.md is 200 lines with none of the ADR sections | the docs lint and the TP check run | neither reports anything for it |
| EX-5 | RULE-2 | negative | The same config and docs/adr/ADR-0031-x.md lacks its Summary section | the TP check runs | it fails with "missing section: ## Summary" for ADR-0031, as today |
| EX-6 | RULE-2 | negative | The same config and a TP cites ADR-0021, whose file has the line "Status: Superseded" | the TP check runs | it fails with "ADR-0021 is Superseded, not accepted" |
| EX-7 | RULE-2 | boundary | The config has no legacyAdrsThrough and docs/adr/0021-baselines.md is 200 lines | the docs lint runs | it fails with "ADR is 200 lines, over its cap of 80", as today |
| EX-11 | RULE-2 | negative | The config says "legacyAdrsThrough": "thirty" | the docs lint runs | it fails with "legacyAdrsThrough must be a whole number, the last ADR written before adoption" |
| EX-12 | RULE-3 | positive | An approved PRODUCT gets the header line "Links: [Asana](https://app.asana.com/1/1/project/2/task/3)" | status runs | it reports no drift |
| EX-13 | RULE-3 | positive | A Links line holds two links, the second to https://app.asana.com/0/2/3 | the docs lint runs | it reports nothing for that line |
| EX-14 | RULE-3 | negative | A Links line says "[Asana](https://app.asana.com/0/2/3) and a slot holds 10 families" | the docs lint runs | it fails with "Links line holds text that is not a link" |
| EX-15 | RULE-3 | negative | A Links line holds "[Asana](http://example.com/x)" | the docs lint runs | it fails with "Links line holds text that is not a link" |
| EX-16 | RULE-3 | boundary | A UX document of 150 lines, its cap, gets a "Links:" header line, so it has 151 lines | the docs lint runs | it reports no cap failure |
| EX-17 | RULE-3 | negative | A UX document of 150 lines with a "Links:" header line gets one more content line, so it has 152 lines | the docs lint runs | it fails "UX is 151 lines, over its cap of 150" |
| EX-18 | RULE-3 | negative | An approved PRODUCT gets "Links: [Asana](https://app.asana.com/0/2/3)" as a line below its first "## " heading | status runs, and the docs lint runs on a copy at its cap | status reports "body changed since approval", and the line counts toward the cap |
| EX-19 | RULE-3 | negative | An approved PRODUCT has one Links line in its header and gets a second one there | status runs | it reports "body changed since approval" |
| EX-20 | RULE-2 | positive | The config says "legacyAdrsThrough": 28 and docs/adr/ADR-0012-x.md has no Status section, only the line "- **Estado:** Aceptada" | status runs | it lists ADR-0012 as legacy and reports no failure for it |
| EX-21 | RULE-2 | boundary | The same config and docs/adr/ADR-0029-x.md has no Status section | status runs | it fails with "ADR status \"missing\" is not Proposed, Accepted, Superseded or Rejected" for ADR-0029, as today |
| EX-22 | RULE-3 | positive | A spec quotes a row of its FRD, and a formatter has padded the cells of the FRD table, so the spaces around the cells differ | the spec check runs | it finds the quoted row |
| EX-23 | RULE-3 | negative | A spec quotes a row of its FRD with one word changed inside a cell | the spec check runs | it fails with "quoted row not found verbatim" |
| EX-24 | RULE-3 | boundary | A draft spec of 80 lines, its cap, is approved, and approve adds its "Approval:" line, so it has 81 lines | the docs lint runs | it reports no cap failure |
| EX-25 | RULE-3 | negative | An approved spec of 81 lines with its "Approval:" line gets one more content line | the docs lint runs | it fails "SPEC is 81 lines, over its cap of 80" |
| EX-26 | RULE-3 | negative | An approved FRD gets the line "Approval: the owner agreed to 10 places" below its first "## " heading | status runs | it reports "body changed since approval" |
| EX-27 | RULE-3 | positive | An FRD approved before this change, with its Status and Approval lines in the header and none in the body | status runs | it reports no drift |
| EX-8 | RULE-3 | positive | An approved spec whose tables a formatter pads, with spaces added around the dashes of each separator row | status runs | it reports no drift |
| EX-9 | RULE-3 | negative | An approved spec where one word of a row changes | status runs | it fails with "body changed since approval" |
| EX-10 | RULE-3 | positive | A document approved before this change, with no change since | status runs | it reports no drift |
| EX-28 | RULE-4 | positive | docs/adr/ADR-0021-x.md is an accepted ADR with a Summary section and no Last change line | the summary check runs on it | it passes |
| EX-29 | RULE-4 | boundary | The same ADR is saved as docs/adr/ADR-001-x.md and as docs/adr/0021-x.md | the summary check runs on each | both pass |
| EX-30 | RULE-4 | negative | The config has no legacyAdrsThrough and docs/adr/ADR-0031-x.md has no Summary section | the summary check runs on it | it fails with "no ## Summary within the first 20 lines" |
| EX-31 | RULE-4 | positive | The config says "legacyAdrsThrough": 30 and docs/adr/ADR-0021-x.md has no Summary section | the summary check runs on it | it reports nothing |
| EX-32 | RULE-4 | positive | The config has no legacyAdrsThrough and docs/adr/0031-x.md has the ADR sections with "## Status" followed by "Accepted" | status runs | it lists docs/adr/0031-x.md with the kind ADR and the status Accepted |
| EX-33 | RULE-4 | negative | An agent edits docs/adr/0031-x.md, which has no Summary section, and the config has no legacyAdrsThrough | the edit hook runs | it fails with "no ## Summary within the first 20 lines" |
| EX-34 | RULE-4 | positive | docs/chain/frd/FRD-100-x.md is an FRD with EX-1, and docs/chain/specs/SPEC-100-1-x.md rests on it | status, the edit hook and trace run | status lists them with the kinds FRD and SPEC, the hook runs the FRD and spec checks on them, and trace reports EX-1 of FRD-100 |
| EX-35 | RULE-4 | negative | The files docs/adr/ADR-21-x.md, docs/adr/ADR-0021.md, docs/requests/REQ-notes.md, docs/notes/0021-x.md and docs/chain/frd/FRD-1-x.md | status, the edit hook, the docs lint, trace and the gate read them | none treats any of them as a chain document: status does not list it, the hook runs no check on it, the lint gives it no kind, trace reads no FRD from it and the gate asks for no tests from it |
| EX-36 | RULE-4 | positive | One path for each kind and each name form, and the paths of EX-35 | the kind of each path is read by the shared rule, by status, by the edit hook and by the docs lint | all four give the same kind, or none, for every path |
| EX-37 | RULE-4 | negative | The files docs/research/PRD.md, docs/research/frd/FRD-01-a.md, docs/retro/specs/SPEC-01-1-a.md and docs/decisions/adr/ADR-001-a.md | status, the edit hook and the docs lint read them | none treats any of them as a chain document, as status already skips the research, retro and decisions folders |

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: the checks keep no state.

## Invariants
n/a: the repository keeps no invariants register yet; RULE-1 to RULE-4 are covered by the examples, and EX-36 holds RULE-4 for every path.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | n/a: one more file pattern and one more normalizing pass per document. |
| QC-3 | Compatibility | Every document approved before this change still passes status with no new approval (EX-10). |
| QC-4 | Interaction capability | Every failure names the file and says what to write, asserted in EX-2, EX-6 and EX-11. |
| QC-5 | Reliability | n/a: a wrong result only fails a document check. |
| QC-6 | Security | n/a: the checks read documents inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | One number in the config, set by adoption; the two file names are fixed. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: documents, the ADR folder, stored fingerprints. Keeps nothing new.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given A TP says "ADR: ADR-0021" and docs/adr/0021-baselines.md exists, when the TP check runs, then it passes.
- **AC-2** (EX-2): Given A TP says "ADR: ADR-0021" and only docs/adr/00210-x.md exists, when the TP check runs, then it fails with "ADR-0021 has no file".
- **AC-3** (EX-3): Given docs/adr/0021-baselines.md is 90 lines and the config has no legacyAdrsThrough, when the docs lint runs, then it fails with "ADR is 90 lines, over its cap of 80".
- **AC-4** (EX-4): Given The config says "legacyAdrsThrough": 30 and docs/adr/0021-baselines.md is 200 lines with none of the ADR sections, when the docs lint and the TP check run, then neither reports anything for it.
- **AC-5** (EX-5): Given The same config and docs/adr/ADR-0031-x.md lacks its Summary section, when the TP check runs, then it fails with "missing section: ## Summary" for ADR-0031, as today.
- **AC-6** (EX-6): Given The same config and a TP cites ADR-0021, whose file has the line "Status: Superseded", when the TP check runs, then it fails with "ADR-0021 is Superseded, not accepted".
- **AC-7** (EX-7): Given The config has no legacyAdrsThrough and docs/adr/0021-baselines.md is 200 lines, when the docs lint runs, then it fails with "ADR is 200 lines, over its cap of 80", as today.
- **AC-8** (EX-11): Given The config says "legacyAdrsThrough": "thirty", when the docs lint runs, then it fails with "legacyAdrsThrough must be a whole number, the last ADR written before adoption".
- **AC-9** (EX-12): Given An approved PRODUCT gets the header line "Links: [Asana](https://app.asana.com/1/1/project/2/task/3)", when status runs, then it reports no drift.
- **AC-10** (EX-13): Given A Links line holds two links, the second to https://app.asana.com/0/2/3, when the docs lint runs, then it reports nothing for that line.
- **AC-11** (EX-14): Given A Links line says "[Asana](https://app.asana.com/0/2/3) and a slot holds 10 families", when the docs lint runs, then it fails with "Links line holds text that is not a link".
- **AC-12** (EX-15): Given A Links line holds "[Asana](http://example.com/x)", when the docs lint runs, then it fails with "Links line holds text that is not a link".
- **AC-13** (EX-16): Given A UX document of 150 lines, its cap, gets a "Links:" header line, so it has 151 lines, when the docs lint runs, then it reports no cap failure.
- **AC-14** (EX-17): Given A UX document of 150 lines with a "Links:" header line gets one more content line, so it has 152 lines, when the docs lint runs, then it fails "UX is 151 lines, over its cap of 150".
- **AC-15** (EX-18): Given An approved PRODUCT gets "Links: [Asana](https://app.asana.com/0/2/3)" as a line below its first "## " heading, when status runs, and the docs lint runs on a copy at its cap, then status reports "body changed since approval", and the line counts toward the cap.
- **AC-16** (EX-19): Given An approved PRODUCT has one Links line in its header and gets a second one there, when status runs, then it reports "body changed since approval".
- **AC-17** (EX-20): Given The config says "legacyAdrsThrough": 28 and docs/adr/ADR-0012-x.md has no Status section, only the line "- **Estado:** Aceptada", when status runs, then it lists ADR-0012 as legacy and reports no failure for it.
- **AC-18** (EX-21): Given The same config and docs/adr/ADR-0029-x.md has no Status section, when status runs, then it fails with "ADR status \"missing\" is not Proposed, Accepted, Superseded or Rejected" for ADR-0029, as today.
- **AC-19** (EX-22): Given A spec quotes a row of its FRD, and a formatter has padded the cells of the FRD table, so the spaces around the cells differ, when the spec check runs, then it finds the quoted row.
- **AC-20** (EX-23): Given A spec quotes a row of its FRD with one word changed inside a cell, when the spec check runs, then it fails with "quoted row not found verbatim".
- **AC-21** (EX-24): Given A draft spec of 80 lines, its cap, is approved, and approve adds its "Approval:" line, so it has 81 lines, when the docs lint runs, then it reports no cap failure.
- **AC-22** (EX-25): Given An approved spec of 81 lines with its "Approval:" line gets one more content line, when the docs lint runs, then it fails "SPEC is 81 lines, over its cap of 80".
- **AC-23** (EX-26): Given An approved FRD gets the line "Approval: the owner agreed to 10 places" below its first "## " heading, when status runs, then it reports "body changed since approval".
- **AC-24** (EX-27): Given An FRD approved before this change, with its Status and Approval lines in the header and none in the body, when status runs, then it reports no drift.
- **AC-25** (EX-8): Given An approved spec whose tables a formatter pads, with spaces added around the dashes of each separator row, when status runs, then it reports no drift.
- **AC-26** (EX-9): Given An approved spec where one word of a row changes, when status runs, then it fails with "body changed since approval".
- **AC-27** (EX-10): Given A document approved before this change, with no change since, when status runs, then it reports no drift.
- **AC-28** (EX-28): Given docs/adr/ADR-0021-x.md is an accepted ADR with a Summary section and no Last change line, when the summary check runs on it, then it passes.
- **AC-29** (EX-29): Given The same ADR is saved as docs/adr/ADR-001-x.md and as docs/adr/0021-x.md, when the summary check runs on each, then both pass.
- **AC-30** (EX-30): Given The config has no legacyAdrsThrough and docs/adr/ADR-0031-x.md has no Summary section, when the summary check runs on it, then it fails with "no ## Summary within the first 20 lines".
- **AC-31** (EX-31): Given The config says "legacyAdrsThrough": 30 and docs/adr/ADR-0021-x.md has no Summary section, when the summary check runs on it, then it reports nothing.
- **AC-32** (EX-32): Given The config has no legacyAdrsThrough and docs/adr/0031-x.md has the ADR sections with "## Status" followed by "Accepted", when status runs, then it lists docs/adr/0031-x.md with the kind ADR and the status Accepted.
- **AC-33** (EX-33): Given An agent edits docs/adr/0031-x.md, which has no Summary section, and the config has no legacyAdrsThrough, when the edit hook runs, then it fails with "no ## Summary within the first 20 lines".
- **AC-34** (EX-34): Given docs/chain/frd/FRD-100-x.md is an FRD with EX-1, and docs/chain/specs/SPEC-100-1-x.md rests on it, when status, the edit hook and trace run, then status lists them with the kinds FRD and SPEC, the hook runs the FRD and spec checks on them, and trace reports EX-1 of FRD-100.
- **AC-35** (EX-35): Given The files docs/adr/ADR-21-x.md, docs/adr/ADR-0021.md, docs/requests/REQ-notes.md, docs/notes/0021-x.md and docs/chain/frd/FRD-1-x.md, when status, the edit hook, the docs lint, trace and the gate read them, then none treats any of them as a chain document: status does not list it, the hook runs no check on it, the lint gives it no kind, trace reads no FRD from it and the gate asks for no tests from it.
- **AC-36** (EX-36): Given One path for each kind and each name form, and the paths of EX-35, when the kind of each path is read by the shared rule, by status, by the edit hook and by the docs lint, then all four give the same kind, or none, for every path.
- **AC-37** (EX-37): Given The files docs/research/PRD.md, docs/research/frd/FRD-01-a.md, docs/retro/specs/SPEC-01-1-a.md and docs/decisions/adr/ADR-001-a.md, when status, the edit hook and the docs lint read them, then none treats any of them as a chain document, as status already skips the research, retro and decisions folders.
