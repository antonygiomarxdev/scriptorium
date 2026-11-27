# SPEC-04-5: The edit hook fails closed and covers notebooks

Status: Approved (2026-11-20)
Approval: content _zpw-QixHSHt; rests on ../frd/FRD-04-gate-before-code.md uL6Edt_koZHn
Rests on: ../frd/FRD-04-gate-before-code.md

## Summary

A hook error refuses the edit; NotebookEdit is gated; the plugin's hook configuration runs the edit hook for every editing tool.

Last change: 2026-11-20, first draft

## Rows

| EX-16 | RULE-1 | negative | The host sends the edit hook input it cannot parse | the edit hook runs | it exits 2 and says why: an error never allows an edit |
| EX-17 | RULE-1 | negative | No spec lists notes/a.ipynb | the agent edits notes/a.ipynb with NotebookEdit | it is refused |
| EX-18 | RULE-1 | positive | The plugin is installed | its hook configuration is read | a PreToolUse entry runs the edit hook for Edit, Write, MultiEdit and NotebookEdit |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/hook-gate.ts` | Change | Unparsable input or any error exits 2 with the reason; notebook_path is read |
| `hooks/hooks.json` | Change, only if a test fails | The PreToolUse entry and its matcher |

## Tests first
EX-16, EX-17, EX-18, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
EX-18 reads hooks/hooks.json in a test.

## Done when
`bun test test/hooks.test.ts`

## Out of scope
Edits through a shell.

## Open questions
None.
