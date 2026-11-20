# SPEC-04-1: Who may edit a file

Status: Approved (2026-11-20)
Approval: content Ap-ZfnouvnvR; rests on ../frd/FRD-04-gate-before-code.md xBypaABgZJB7
Rests on: ../frd/FRD-04-gate-before-code.md

## Summary

The pure rule: given a project and a file, is it exempt, named by an approved spec or an accepted short path, or refused, and why.

Last change: 2026-11-20, first draft

## Rows

| EX-2 | RULE-1 | negative | No spec lists scripts/b.ts | the agent edits scripts/b.ts | it is refused with "scripts/b.ts: no approved spec names it in its Files table" and the way to write one |
| EX-3 | RULE-1 | negative | Only a draft spec lists scripts/a.ts | the agent edits scripts/a.ts | it is refused and names that spec as not approved |
| EX-4 | RULE-1 | positive | The agent edits test/a.test.ts or docs/x.md | the edit hook runs | the edit goes ahead with no spec |
| EX-5 | RULE-1 | positive | An accepted request holds the line "Short path: scripts/c.ts" | the agent edits scripts/c.ts | the edit goes ahead |
| EX-6 | RULE-1 | negative | An open request holds the line "Short path: scripts/c.ts" | the agent edits scripts/c.ts | it is refused |
| EX-7 | RULE-1 | negative | No spec lists package.json | the agent edits package.json | it is refused: configuration is gated like code |
| EX-8 | RULE-1 | positive | An approved spec lists "src/pickups/" in Files | the agent edits src/pickups/book.ts | the edit goes ahead: a row ending in a slash names the folder |
| DT-1 | yes | any | any | Allowed |
| DT-2 | no | no | any | Refused: no approved spec |
| DT-4 | no | yes | yes | Allowed |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/gate.ts` | Create | `gateFile(root, file)`: undefined when allowed, else the refusal text tagged format 2; Files rows read from every spec through the existing spec parser; a row ending in a slash names a folder |

## Tests first
EX-2, EX-3, EX-4, EX-5, EX-6, EX-7, EX-8, DT-1, DT-2, DT-4, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Reuse chainStatus for statuses, the changeset rule's exemption list for tests, and `typed` for the path. Approved means status Approved and no drift.

## Done when
`bun test test/gate.test.ts`

## Out of scope
Tests first (SPEC-04-2), the hook (SPEC-04-3), pre-commit (SPEC-04-3).

## Open questions
None.
