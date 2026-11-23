# SPEC-08-12: One rule reads the kind of a document from its path

Status: Approved (2026-11-23)
Approval: content 1AZnGUtQwDmZ; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

A new scripts/kinds.ts holds the one rule that reads the kind of a chain document from its path. The summary command and status use it, so an accepted ADR-NNNN-name.md is not asked for a Last change line, and an NNNN-name.md ADR shows in status.

Last change: 2026-11-23, EX-37: no kind under the research, retro and decisions folders (review)

## Rows

| EX-28 | RULE-4 | positive | docs/adr/ADR-0021-x.md is an accepted ADR with a Summary section and no Last change line | the summary check runs on it | it passes |
| EX-29 | RULE-4 | boundary | The same ADR is saved as docs/adr/ADR-001-x.md and as docs/adr/0021-x.md | the summary check runs on each | both pass |
| EX-30 | RULE-4 | negative | The config has no legacyAdrsThrough and docs/adr/ADR-0031-x.md has no Summary section | the summary check runs on it | it fails with "no ## Summary within the first 20 lines" |
| EX-31 | RULE-4 | positive | The config says "legacyAdrsThrough": 30 and docs/adr/ADR-0021-x.md has no Summary section | the summary check runs on it | it reports nothing |
| EX-32 | RULE-4 | positive | The config has no legacyAdrsThrough and docs/adr/0031-x.md has the ADR sections with "## Status" followed by "Accepted" | status runs | it lists docs/adr/0031-x.md with the kind ADR and the status Accepted |
| EX-37 | RULE-4 | negative | The files docs/research/PRD.md, docs/research/frd/FRD-01-a.md, docs/retro/specs/SPEC-01-1-a.md and docs/decisions/adr/ADR-001-a.md | status, the edit hook and the docs lint read them | none treats any of them as a chain document, as status already skips the research, retro and decisions folders |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/kinds.ts` | Create | `kindOf(rel)`, the kind of a path relative to docs/, moved from `docKind` in scripts/lint-docs.ts with the patterns of FR-CHAIN-08-15, and `ADR_NAME` |
| `scripts/check.ts` | Change | The summary command, the status listing and the ADR file match take their patterns from scripts/kinds.ts; the summary command reports nothing for an ADR at or below the cutoff |
| `test/` | Change | The EX-28 to EX-32 and EX-37 tests, in check.test.ts or a new kinds.test.ts |

## Reuses
- `scripts/check.ts` `RESERVED`: the folders status skips, which the rule skips too (EX-37).
- `scripts/lint-docs.ts` `lintFile`: the lint kind came from a function there that returned a kind from a path; it moved into the rule, it was not copied.
- `scripts/check.ts` `ADR_FILE` and `adrNumber`: the ADR name and number from either file name.
- `scripts/format.ts` `legacyAdrsThrough`: the cutoff.
- Precedent: SPEC-08-1-adr-file-names.md, which widened the ADR match and wrote one pattern per file.

## Tests first
EX-28, EX-29, EX-30, EX-31, EX-32, EX-37, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
```ts
export type Kind = "PRODUCT" | "DECISIONS" | "INVARIANTS" | "CHECKS" | "CROSS-CUTTING" | "REQUEST" | "ADR" | "TP" | "PRD" | "FRD" | "UX" | "SPEC";
export const ADR_NAME = /^(ADR-)?\d{3,}-[a-z0-9-]+\.md$/;
export function kindOf(rel: string): Kind | undefined;
```
`rel` uses forward slashes, relative to docs/. scripts/lint-docs.ts re-exports `kindOf` as `docKind` until SPEC-08-13. Not format-gated: it removes false failures.

## Done when
`bun test test/check.test.ts test/lint-docs.test.ts`

## Out of scope
The hooks and the docs lint (SPEC-08-13); trace and the gate (SPEC-08-14).

## Open questions
None.
