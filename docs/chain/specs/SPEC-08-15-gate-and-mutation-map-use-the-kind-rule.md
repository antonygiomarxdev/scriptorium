# SPEC-08-15: The gate uses the one kind rule, and the rule is in the mutation map

Status: Approved (2026-11-23)
Approval: content wMGKg6ebkFCS; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The gate reads the FRD a spec rests on only when kindOf gives it the kind FRD, so it asks for no tests from a file the other checks do not take as an FRD. scripts/kinds.ts gets its entry in the mutation map, which every script needs.

Last change: 2026-11-23, first draft

## Rows

| EX-35 | RULE-4 | negative | The files docs/adr/ADR-21-x.md, docs/adr/ADR-0021.md, docs/requests/REQ-notes.md, docs/notes/0021-x.md and docs/chain/frd/FRD-1-x.md | status, the edit hook, the docs lint, trace and the gate read them | none treats any of them as a chain document: status does not list it, the hook runs no check on it, the lint gives it no kind, trace reads no FRD from it and the gate asks for no tests from it |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/gate.ts` | Change | `untested` reads the FRD a spec rests on only when `kindOf` gives it the kind FRD |
| `scripts/mutation.ts` | Change | The map entry for scripts/kinds.ts, with the test files that test it |
| `test/gate.test.ts` | Change | The gate half of the EX-35 test |

## Reuses
- `scripts/kinds.ts` `kindOf`: the rule SPEC-08-12 wrote.
- `scripts/mutation.ts` `MAP`: the test "every script in the repository is in the map" fails a script with no entry (rework R-33, R-40).
- Precedent: SPEC-08-14-trace-uses-the-kind-rule.md, which moved trace to the rule.

## Tests first
EX-35, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The FRD id still comes from the file name, as `/^FRD-\d+/` reads it today, once `kindOf` has said the file is an FRD.

## Done when
`bun test test/gate.test.ts test/mutation.test.ts`

## Out of scope
FRD ids read from covers tags, which are ids and not file names; scripts/migrate.ts, whose format 1 rules are frozen (SPEC-03-6).

## Open questions
None.
