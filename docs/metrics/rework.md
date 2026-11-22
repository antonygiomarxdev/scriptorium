# Rework queue

Status: Draft

## Summary

Open findings only, each with one cause from the list below (D-32). A finding leaves when its cause gets a proven prevention; git keeps the history. A cause found twice with no prevention blocks the project, and a finding of a prevented cause blocks too, because the prevention did not hold. FRD-01 of the metrics slice specifies the checks; until they are built, the lead applies them by hand.

Last change: 2026-11-20, reshaped from a growing log into a queue of open findings (D-32)

- Blocking today: C-1 (13 open), C-2 (2), C-8 (2) and C-9 (2). None has a prevention.
- Build and review are the step for no finding: review found no change built against its spec.

## Causes

A new cause needs the owner. Prevention: a CHECK-n of the project's checks, with a replay of the failure it catches, and the date it shipped.

| ID | Step | Cause | Open | Prevention | Since |
|---|---|---|---|---|---|
| C-1 | FRD | An example is missing, usually a negative one: another id, folder or slice, an error, a value going the wrong way. | 24 | none | n/a |
| C-2 | Spec | A clause of a Files row's Holds column, or of the summary, has no row behind it. | 4 | none | n/a |
| C-3 | Spec | The Files table misses a file the change needs. | 3 | none | n/a |
| C-4 | Spec | The spec asks for behavior no row and no user needs. | 3 | none | n/a |
| C-5 | FRD | A row describes something a test cannot assert. | 2 | none | n/a |
| C-6 | Lead | The lead wrote text or code with no review against its source. | 2 | none | n/a |
| C-7 | Lead | One instruction says two opposite things. | 1 | none | n/a |
| C-8 | Team practice | A rule lives only in prose or in a message, so nothing enforces it. | 2 | none | n/a |
| C-9 | Check | Two checks apply the same rule differently. | 2 | none | n/a |
| C-10 | Check | A document error no check catches. | 3 | none | n/a |
| C-11 | CI | A workflow step runs in a case it should not. | 1 | none | n/a |
| C-12 | Test | A test fixture reads as a real tag or document to the repository's own checks. | 2 | none | n/a |
| C-13 | Build | New code repeats code that already exists in the project (REQ-7). | 3 | none | n/a |
| C-14 | Ask | The owner was asked a question that research or the lead could answer (REQ-10). | 1 | none | n/a |

## Open findings

| ID | Date | Change | Cause | Finding |
|---|---|---|---|---|
| R-1 | 2026-11-20 | SPEC-03-1 | C-3 | The builder changed scripts/hook-stop.ts, which the spec's Files table did not list; the change was needed. |
| R-2 | 2026-11-20 | SPEC-03-2 | C-1 | Format 1 spec rules running under format 2 broke no test. |
| R-3 | 2026-11-20 | SPEC-03-3 | C-1 | The dead tag failure lost its format tag and no test failed. |
| R-4 | 2026-11-20 | SPEC-03-4 | C-1 | The migrate dry run listed spec and status failures only, not lint or coverage. |
| R-5 | 2026-11-20 | SPEC-03-4 | C-1 | The CRLF branch of the rewrite had no test. |
| R-6 | 2026-11-20 | SPEC-03-5 | C-1 | The hook ran `bunx scriptorium`; that name on npm is another person's package, and a test run downloaded and ran it on the owner's machine. |
| R-7 | 2026-11-20 | SPEC-03-5 | C-1 | Removing the hook's cd to the root broke no test. |
| R-8 | 2026-11-20 | SPEC-03-5 | C-1 | Reading the pin from the current folder instead of the document's project broke no test. |
| R-9 | 2026-11-20 | SPEC-03-6 | C-5 | The EX-18 test checks a proxy, not what the row says. |
| R-10 | 2026-11-20 | SPEC-04-1 | C-1 | Removing the drift check broke no test: a spec changed after approval still unlocked its files. |
| R-11 | 2026-11-20 | SPEC-04-2 | C-1 | A covers tag matched by id alone: FRD-02/EX-4 counted for FRD-01/EX-4. |
| R-12 | 2026-11-20 | SPEC-04-3 | C-1 | A hook error that allowed the edit broke no test. |
| R-13 | 2026-11-20 | SPEC-04-3 | C-1 | NotebookEdit and the hook entry in hooks.json had no test. |
| R-14 | 2026-11-20 | SPEC-04-3 | C-1 | Pre-commit skipped .scriptorium/, so lowering the pin through a shell would switch the gate off. |
| R-15 | 2026-11-20 | SPEC-04-4 | C-2 | A covers tag from another slice counted. |
| R-16 | 2026-11-20 | SPEC-03-9 | C-2 | Removing coverage from the migrate dry run broke no test. |
| R-17 | 2026-11-20 | SPEC-03-11 | C-4 | Mapping only .md paths to their project broke no test, even with a test for a folder argument. |
| R-18 | 2026-11-20 | SPEC-03-12 | C-6 | The readme and skills said `bunx scriptorium`, and said the gate was not built. |
| R-19 | 2026-11-20 | SPEC-04-3 | C-7 | The builder changed gate.ts outside the spec's Files table. |
| R-20 | 2026-11-20 | FRD-03, FRD-04 | C-8 | Builders kept working through a written pause and took blocked tasks. |
| R-21 | 2026-11-20 | FRD-02, FRD-03 | C-8 | The lead fixed code and wrote configuration with no spec; builders built specs still in Draft. |
| R-22 | 2026-11-20 | PRD | C-9 | status read "None. Q-1 to Q-5 were answered" as an open question; approve did not. |
| R-23 | 2026-11-20 | PRODUCT | C-10 | Text after the closing fence broke the product diagram. |
| R-24 | 2026-11-20 | Release | C-11 | The version workflow published v0.4.0 from the version branch before its merge. |
| R-25 | 2026-11-20 | SPEC-04-4 | C-1 | The edit hook counts a covers tag with no slice for any slice's FRD of that number; only the later coverage scan reports it as ambiguous. |
| R-26 | 2026-11-20 | SPEC-04-4 | C-12 | A test fixture held the text of a covers tag for another slice; the repository's coverage scan read it as a dead tag and blocked the commit. |
| R-27 | 2026-11-20 | Metrics FRD-01 | C-9 | approve accepted the FRD, then the coverage scan blocked every commit because its examples had no tests yet; the FRD went back to Draft until its tests exist. |
| R-28 | 2026-11-20 | SPEC-04-1 | C-13 | The builder copied the isTest rule from scripts/pre-commit.ts into scripts/gate.ts; both copies remain. |
| R-29 | 2026-11-20 | Chain FRD-05 | C-9 | A draft FRD that needs a new PRD requirement cannot sit in the repository: the PRD edit breaks its approval and the FRD alone fails the stop hook, so there is no place for a proposed amendment while the owner decides. |
| R-30 | 2026-11-20 | Another project, FRD approval | C-14 | Before an approval the owner was asked a domain fact with published sources; it was researched only after the owner said so. |
| R-31 | 2026-11-20 | Ops SPEC-01-3 | C-1 | No example for a mutation run that fails to start: an "or true" after each run made a broken night look clean (now MUT-6). |
| R-32 | 2026-11-20 | Ops SPEC-01-3 | C-1 | Three mutants of scripts/mutation.ts survived: the script filter, a mapped test file that does not exist, and the merge of several reports. |
| R-33 | 2026-11-20 | Ops SPEC-01-4 | C-3 | The Files table missed scripts/mutation.ts, which needed a map entry for scripts/affected.ts. |
| R-34 | 2026-11-20 | Ops SPEC-01-4 | C-1 | A changed test fixture ran alone instead of the whole suite; no example covered a fixture. |
| R-35 | 2026-11-20 | Ops SPEC-01-4 | C-13 | ci.yml repeats in a grep the rule of scripts/affected.ts for what a document is. |
| R-36 | 2026-11-20 | Ops SPEC-01-4 | C-1 | No example for the plan script failing: CI then ran only bun test --changed and the failure went unseen (now AFF-6). |
| R-37 | 2026-11-20 | SPEC-05-1 | C-1 | Two mutants survived: the format 3 tag dropped from Reuses failures other than a missing section, and specFails tagging twice; no example at pin 2 has a missing file. |
| R-38 | 2026-11-20 | SPEC-05-1 | C-1 | QC-6 says the check reads files inside the project only, but no example covers a path outside it, and "../../x" is read as given. |
| R-39 | 2026-11-20 | Metrics SPEC-01-3 | C-12 | The EX-6 test staged a file the FRD-04 gate blocks, so it failed for the wrong reason. |
| R-40 | 2026-11-20 | Metrics SPEC-01-3 | C-3 | The Files table missed scripts/mutation.ts again: every new script needs an entry in its map. |
| R-41 | 2026-11-20 | SPEC-05-2 | C-5 | Nothing tests the template and skill text: deleting the Reuses section or the C-13 sentence passes the whole suite. |
| R-42 | 2026-11-21 | SPEC-06-2 | C-6 | The lead changed five templates and missed PRODUCT.md; the text test found it. |
| R-43 | 2026-11-21 | SPEC-05-2, SPEC-06-2 | C-2 | The review-skill clause of each Files table had no quoted row, and Done when did not run the text tests. |
| R-44 | 2026-11-21 | Ops SPEC-01-3 | C-1 | The MUT-6 test matched strings anywhere in the workflow: three of four mutants survived; and a failed job loses its incremental cache (MUT-4). |
| R-45 | 2026-11-21 | Ops SPEC-01-4 | C-1 | The "or plan=all" fallback never fired behind a pipe, and the AFF-6 test accepted that dead line: removing the working -z guards survived. |
| R-46 | 2026-11-21 | Metrics SPEC-01-1 | C-2 | Build says an unreadable table fails with the file name (QC-5), but no row or test covers it; three mutants survived. |
| R-47 | 2026-11-21 | Metrics SPEC-01-1 | C-13 | scripts/rework.ts writes its own table-cell and CHECKS.md readers beside the ones in scripts/lint-docs.ts, against its Reuses section. |
| R-48 | 2026-11-21 | Metrics SPEC-01-2 | C-4 | The build added behavior no row asks for: "n/a" and "-" as no prevention, several causes per finding, and a "no command" failure; the mutants that remove them survived. |
| R-49 | 2026-11-21 | SPEC-06-1 | C-1 | Four mutants survived: the UX and TP calls of the answerer rule, the file name in folder checks, and a placeholder accepted as the owner reason; no example covers them. |
| R-50 | 2026-11-21 | Metrics SPEC-01-3 | C-4 | The EX-6 test stages a document, so it cannot show that the pre-commit rework gate blocks a commit with no document; and the report added a no-queue message and a "?" step no row asks for; four mutants survived. |
| R-51 | 2026-11-21 | Metrics SPEC-01-1 | C-10 | The Reuses section named docStatus and gate, which the build does not use; the check only proves the names exist, not that the code uses them. |
| R-52 | 2026-11-21 | SPEC-06-1 | C-1 | Two mutants survived: the answerer is not anchored right after the Q-n id, and the check may read the whole document instead of the Open questions section; no example covers either. |
| R-53 | 2026-11-21 | Metrics SPEC-01-3 | C-1 | Four mutants survived: pre-commit ignoring the pin or dropping its format 2 warning, the report crashing on an unknown cause, and the root argument of rework ignored; no example covers pre-commit under format 2. |
| R-54 | 2026-11-21 | FRD-05, FRD-06 | C-10 | The coverage waivers were written as prose, not "uncovered: EX-n reason", so the scan ignored them and blocked the commit; approval did not catch the wrong form. |
| R-55 | 2026-11-21 | SPEC-07-1 | C-1 | Ids were read from the whole request, not only its Decision section, and no test failed: no example has an id outside the Decision. |
| R-56 | 2026-11-21 | SPEC-07-1 | C-1 | An ADR-0029 file matcher without the trailing dash would also match ADR-00290-x.md, and no test failed. |
| R-57 | 2026-11-21 | SPEC-07-1 | C-1 | A Rests on path to a missing file falls back to the FR-id rule silently; no example says what should happen. |
| R-58 | 2026-11-21 | SPEC-07-1 | C-1 | With no Rests on line, a TP that cites no FR id is no longer reported, and no test failed: EX-6 tests only a wrong FR id. |
| R-59 | 2026-11-21 | SPEC-07-2 | C-2 | The approve refusal of a request that is not accepted is needed by EX-8, but the Files text names only chainStatus. |
| R-60 | 2026-11-21 | metrics SPEC-01-2 | C-12 | The rework report test checks only that C-9 is absent, so an extra "?: 1" line for an unknown cause passes. |
| R-61 | 2026-11-21 | SPEC-07-3 | C-1 | Status with a TP resting on a registry was not tested: removing the registry half of the parent test in chainStatus fails nothing, since EX-15 uses a request. |
| R-62 | 2026-11-21 | SPEC-07-3 | C-13 | "Is this parent a request or a registry" is written twice in scripts/check.ts, in parentIds and in chainStatus. |
| R-63 | 2026-11-21 | SPEC-08-3 | C-2 | scripts/history.ts compares fingerprints too, but the Files row named only drift.ts; the builder found it. |
| R-64 | 2026-11-21 | FRD-08 | C-5 | The cap waiver was designed from one report (lint) without replaying the TP check, which also holds legacy ADRs to the template; the waiver was replaced by a cutoff. |
| R-65 | 2026-11-21 | SPEC-08-2 | C-12 | The bad-cutoff failure was tagged format 3 against the spec, and the EX-11 test used only pin 3, so the tag passed every test. |
| R-66 | 2026-11-21 | SPEC-08-2 | C-13 | The ADR number pattern is written three times and the cited-file match twice, against "one pattern, written once per file". |
| R-67 | 2026-11-21 | SPEC-01-5 of ops | C-6 | The larder rework queue was never written: the gate refused the write inside a longer script, the error was not read, and status passes with no queue, so the commit shipped without it. |
| R-68 | 2026-11-21 | SPEC-09-1 | C-1 | approve run with a path from another folder records no parent fingerprint and passes, so status then fails the document as suspect; found while building the adopted fixture. |
| R-69 | 2026-11-21 | SPEC-02-1 | C-1 | No example for a queue file deleted at a commit, for author and committer dates that differ, or for weeks whose events arrive out of order; each mutant survives. |
| R-70 | 2026-11-21 | chain FRD-09 | C-1 | clear from another folder, a path with docs twice, and a path with no docs folder are untested for the project-root fix. |
| R-71 | 2026-11-21 | chain FRD-09 | C-13 | "The project root above docs/" is written three times: projectOf, splitDocPath and reusesFails. |
| R-72 | 2026-11-21 | SPEC-08-5 | C-1 | No example for a body line that holds "Links:" in the middle, for a link URL with spaces, or for an empty link text; each mutant survives. |
| R-73 | 2026-11-21 | chain FRD-08 | C-1 | The Links line is left out of the fingerprint and any link text passes the lint, so a sentence written as link text can be added after approval with no drift. |
| R-74 | 2026-11-21 | SPEC-08-5 | C-1 | The rows say a header line, but the fingerprint and the cap leave out every line starting with "Links:" anywhere; 400 body Links lines pass the cap, and no example puts a Links line in the body. |
| R-75 | 2026-11-21 | SPEC-08-7 | C-1 | No example for a document with no "## " heading, or for a "##x" line, around the Links rule; each mutant survives. |
| R-76 | 2026-11-21 | chain FRD-08 | C-1 | FR-CHAIN-08-3 exempted legacy ADRs in the docs lint and the TP check but not in status, so renaming them to ADR-NNNN made status fail all 26 of another project. |
| R-77 | 2026-11-21 | SPEC-08-8 | C-1 | "legacy" was added to the status list for every ADR, so an ADR above the cutoff passes status by writing "legacy" by hand; no example had a hand-written legacy status. |
| R-78 | 2026-11-22 | SPEC-08-9 | C-1 | No example changes only the case of a word in a quoted row, or pins that a bullet row is compared as written; both mutants survive. |
| R-79 | 2026-11-22 | a909ad5 | C-1 | CI on main was red for eight pushes: a test wrote to the parent of the temp folder, which is / on Linux, and the lead pushed without reading the CI result of any push. |
| R-80 | 2026-11-22 | chain FRD-01 | C-1 | The fingerprint leaves out every line starting with "Approval: " or "Status: ", not only the header ones, so body text on such a line is not covered by the approval; no example puts one in the body. |
| R-81 | 2026-11-22 | SPEC-08-11 | C-1 | A builder edited scripts/ in the checkout that adopting projects run in their hooks; a half-done drift.ts edit failed 157 and 184 approved documents there until the lead restored it. Builds now run in a separate worktree. |
| R-82 | 2026-11-22 | SPEC-08-11 | C-1 | No example uses a bold "**Status:**" line or "Approval:" with no space in the fingerprint rule; both mutants survive, and the cap and the fingerprint define the Approval line slightly differently. |
| R-83 | 2026-11-22 | SPEC-11-3 | C-1 | The spec says the page holds renderable syntax and cited ids, but no row or test pins those rules; removing any of them passes. |
| R-84 | 2026-11-22 | SPEC-11-2 | C-1 | The build allowed fifteen Mermaid types where FR-CHAIN-11-2 allows six, and passed because EX-4 tested only one type outside the list. |
| R-85 | 2026-11-22 | SPEC-10-2 | C-1 | No example has a default, optional, rest or generic parameter, so the argument count check fails correct specs that use them. |
| R-86 | 2026-11-22 | SPEC-08-8 | C-1 | Status marks every legacy ADR approved before it reads its status line, so a spec resting on a superseded legacy ADR passes; no example had one. |
| R-87 | 2026-11-22 | SPEC-01-6 | C-1 | Eleven of twelve workflow mutants survive: the tests read for words, and RL-2 accepts any "exit 0". A failed tag after the version commit leaves that version untagged forever. |
| R-88 | 2026-11-22 | SPEC-11-1 | C-1 | The build let a Mermaid block replace the ST rows in States, which no row says; a test pinned the loosening. |
