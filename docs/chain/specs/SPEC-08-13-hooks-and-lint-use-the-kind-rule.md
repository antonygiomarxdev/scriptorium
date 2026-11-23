# SPEC-08-13: The hooks and the docs lint use the one kind rule

Status: Approved (2026-11-23)
Approval: content giNEjPxFkupa; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The edit hook and the docs lint take the kind of a document from kindOf in scripts/kinds.ts, so an NNNN-name.md ADR is checked on edit and no two of them disagree on any path.

Last change: 2026-11-22, first draft

## Rows

| EX-33 | RULE-4 | negative | An agent edits docs/adr/0031-x.md, which has no Summary section, and the config has no legacyAdrsThrough | the edit hook runs | it fails with "no ## Summary within the first 20 lines" |
| EX-36 | RULE-4 | positive | One path for each kind and each name form, and the paths of EX-35 | the kind of each path is read by the shared rule, by status, by the edit hook and by the docs lint | all four give the same kind, or none, for every path |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/hook-doc-check.ts` | Change | `checksFor` picks the checks of a path by `kindOf`, with no name pattern of its own |
| `scripts/lint-docs.ts` | Change | `docKind` removed; its callers use `kindOf` |
| `test/` | Change | The EX-33 and EX-36 tests |

## Reuses
- `scripts/kinds.ts` `kindOf`: the rule SPEC-08-12 wrote.
- `scripts/hook-doc-check.ts` `checksFor`: the checks per kind stay as they are; only the kind test changes.
- Precedent: SPEC-04-3-hook-and-pre-commit.md, which wrote checksFor.

## Tests first
EX-33, EX-36, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id. EX-36 builds its paths from every kind and every name form, and compares kindOf, status, checksFor and the lint kind on each.

## Build
`checksFor(root, rel)` calls `kindOf(rel.slice("docs/".length))` and maps the kind to its checks. The stop hook and pre-commit use checksFor, so they follow.

## Done when
`bun test test/hooks.test.ts test/lint-docs.test.ts`

## Out of scope
Trace and the gate (SPEC-08-14).

## Open questions
None.
