# Rework queue

Status: Draft

## Summary

Open findings only, each with one cause from the list below (D-32). A finding leaves when its cause gets a proven prevention; git keeps the history. A cause found twice with no prevention blocks the project, and a finding of a prevented cause blocks too, because the prevention did not hold. FRD-01 of the metrics slice specifies the checks; until they are built, the lead applies them by hand.

Last change: 2026-11-20, reshaped from a growing log into a queue of open findings (D-32)

- Blocking today: C-1 (13 open), C-2 (2) and C-8 (2). None has a prevention.
- Build and review are the step for no finding: review found no change built against its spec.

## Causes

A new cause needs the owner. Prevention: a CHECK-n of the project's checks, with a replay of the failure it catches, and the date it shipped.

| ID | Step | Cause | Open | Prevention | Since |
|---|---|---|---|---|---|
| C-1 | FRD | An example is missing, usually a negative one: another id, folder or slice, an error, a value going the wrong way. | 13 | none | n/a |
| C-2 | Spec | A clause of a Files row's Holds column, or of the summary, has no row behind it. | 2 | none | n/a |
| C-3 | Spec | The Files table misses a file the change needs. | 1 | none | n/a |
| C-4 | Spec | The spec asks for behavior no row and no user needs. | 1 | none | n/a |
| C-5 | FRD | A row describes something a test cannot assert. | 1 | none | n/a |
| C-6 | Lead | The lead wrote text or code with no review against its source. | 1 | none | n/a |
| C-7 | Lead | One instruction says two opposite things. | 1 | none | n/a |
| C-8 | Team practice | A rule lives only in prose or in a message, so nothing enforces it. | 2 | none | n/a |
| C-9 | Check | Two checks apply the same rule differently. | 1 | none | n/a |
| C-10 | Check | A document error no check catches. | 1 | none | n/a |
| C-11 | CI | A workflow step runs in a case it should not. | 1 | none | n/a |
| C-12 | Test | A test fixture reads as a real tag or document to the repository's own checks. | 1 | none | n/a |

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
