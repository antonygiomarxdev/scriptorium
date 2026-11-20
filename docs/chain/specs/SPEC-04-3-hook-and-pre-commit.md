# SPEC-04-3: The edit hook and pre-commit

Status: Approved (2026-11-20)
Approval: content shlTqeHU2ynu; rests on ../frd/FRD-04-gate-before-code.md xBypaABgZJB7
Rests on: ../frd/FRD-04-gate-before-code.md

## Summary

A PreToolUse hook runs gateFile before every edit and refuses with its text; pre-commit runs it on staged files; a format 1 project only warns.

Last change: 2026-11-20, first draft

## Rows

| EX-9 | RULE-1 | negative | A commit stages scripts/b.ts and no approved spec lists it | pre-commit runs | it fails and names scripts/b.ts |
| EX-12 | RULE-3 | positive | A format 1 project and no spec lists scripts/b.ts | the agent edits scripts/b.ts | the edit goes ahead and prints "WARN (format 2):" with the refusal text |
| EX-13 | RULE-3 | boundary | A project has no docs/PRODUCT.md | the agent edits any file | the hook does nothing |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/hook-gate.ts` | Create | Reads the edited path from the host's JSON on stdin; exit 2 with the refusal, exit 0 when allowed or not a chain project; a hook error refuses |
| `hooks/hooks.json` | Change | A PreToolUse entry for Edit, Write, MultiEdit and NotebookEdit |
| `scripts/pre-commit.ts` | Change | gateFile on every staged file through gate() with the pin |

## Tests first
EX-9, EX-12, EX-13, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Under format 1 the refusal prints as a warning and the edit goes ahead.

## Done when
`bun test test/gate.test.ts test/hooks.test.ts`

## Out of scope
Edits made through a shell, which only pre-commit and CI see.

## Open questions
None.
