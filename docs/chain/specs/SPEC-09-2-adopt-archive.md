# SPEC-09-2: The adopt skill says where an export goes

Status: Approved (2026-11-21)
Approval: content OHsBVF8aa2JY; rests on ../frd/FRD-09-adoption-with-history.md ZUz9wr_iEtpE
Rests on: ../frd/FRD-09-adoption-with-history.md

## Summary

The adopt skill says a verbatim export of another tool goes to archive/<tool>/ at the repo root, outside docs/, linked on a Source line from the document that absorbed it.

Last change: 2026-11-21, first draft

## Rows

| EX-6 | RULE-2 | positive | The adopt skill text | it is read | it says a verbatim export goes to archive/<tool>/ at the repo root, outside docs/, linked on a Source line |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `skills/adopt/SKILL.md` | Change | One paragraph on verbatim exports: archive/<tool>/ at the repo root, not linted, not read by agents by default, linked on a "Source:" line |

## Reuses
- `skills/adopt/SKILL.md`: the paragraph on legacy ADRs added by SPEC-08-4 sits next to it.
- Precedent: SPEC-08-4-adopt-sets-cutoff.md.

## Tests first
EX-6, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Markdown only, by the lead.

## Done when
`bun test test/install.test.ts`

## Out of scope
The fixture (SPEC-09-1).

## Open questions
None.
