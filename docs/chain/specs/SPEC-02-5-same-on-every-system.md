# SPEC-02-5: One path helper, same output everywhere

Status: Draft
Rests on: ../frd/FRD-02-small-specs-states.md

## Summary

A fix: the coverage scan and status print backslash paths on Windows, a path typed with backslashes does not resolve on Linux, and done picks a shell by system. One helper module fixes all three with what the runtime already gives; no branch on the system.

Last change: 2026-11-20, first draft

## Rows

| EX-21 | RULE-7 | negative | On Windows, approved FRD-02 in slice chain has an example no test tags | the coverage scan runs | the failure names chain/frd/FRD-02-small-specs-states.md with forward slashes and no backslash |
| EX-22 | RULE-7 | positive | On Windows, an approved spec's Done when is "bun test test/*.test.ts" | done runs | the glob expands as it does on Linux and the command exits 0 |
| EX-23 | RULE-7 | negative | On Windows, an approved spec rests on a superseded TP | status runs | the failure names both documents with forward slashes |
| EX-24 | RULE-7 | positive | A spec says "Rests on: ..\tp\TP-01-x.md" and that file exists | the check runs on Windows and on Linux | the parent resolves on both |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/paths.ts` | Create | `toPosix(p)`: split on `path.sep`, join with `/`; `fromDoc(docPath, p)`: join a path typed in a document to its folder, backslashes read as slashes |
| `scripts/trace.ts` | Change | Paths in failures and notes through `toPosix` |
| `scripts/check.ts` | Change | Paths in status failures through `toPosix`; Rests on, Quoted from and Superseded by through `fromDoc`; done runs the command with the runtime's own shell |

## Tests first
EX-21, EX-22, EX-23, EX-24, written before the code. Each output assertion checks that no backslash appears, so the Windows CI run fails without the fix.

## Build
Only `node:path` (`sep`, `join`, `dirname`) and the runtime shell (`Bun.$` with the command as raw text). No `process.platform`, no `cmd /c`, no `sh -c`.

## Done when
`bun run test`

## Out of scope
The other scripts that still convert paths by hand (SPEC-02-6).

## Open questions
None.
