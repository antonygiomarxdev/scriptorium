# SPEC-08-14: Trace uses the one kind rule

Status: Approved (2026-11-23)
Approval: content xqN6-HdwgpLz; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

Trace reads an FRD from its file name through scripts/kinds.ts, so an FRD numbered 100 is traced and a file the other checks do not take as an FRD is not read as one.

Last change: 2026-11-23, the gate moves to SPEC-08-15, so the mutation map fits in a spec

## Rows

| EX-34 | RULE-4 | positive | docs/chain/frd/FRD-100-x.md is an FRD with EX-1, and docs/chain/specs/SPEC-100-1-x.md rests on it | status, the edit hook and trace run | status lists them with the kinds FRD and SPEC, the hook runs the FRD and spec checks on them, and trace reports EX-1 of FRD-100 |
| EX-35 | RULE-4 | negative | The files docs/adr/ADR-21-x.md, docs/adr/ADR-0021.md, docs/requests/REQ-notes.md, docs/notes/0021-x.md and docs/chain/frd/FRD-1-x.md | status, the edit hook, the docs lint, trace and the gate read them | none treats any of them as a chain document: status does not list it, the hook runs no check on it, the lint gives it no kind, trace reads no FRD from it and the gate asks for no tests from it |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/trace.ts` | Change | `loadFrds` keeps the FRD files that `kindOf` gives the kind FRD |
| `test/` | Change | The EX-34 and EX-35 tests of status, the hook, the lint and trace |

## Reuses
- `scripts/kinds.ts` `kindOf`: the rule SPEC-08-12 wrote.
- Precedent: SPEC-08-13-hooks-and-lint-use-the-kind-rule.md, which moved the hooks to it.

## Tests first
EX-34, EX-35, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The FRD id still comes from the file name, as `/^FRD-\d+/` reads it today, once `kindOf` has said the file is an FRD.

## Done when
`bun test test/trace.test.ts test/check.test.ts test/hooks.test.ts test/lint-docs.test.ts`

## Out of scope
The gate (SPEC-08-15). FRD ids read from covers tags, which are ids and not file names; scripts/migrate.ts, whose format 1 rules are frozen (SPEC-03-6).

## Open questions
None.
