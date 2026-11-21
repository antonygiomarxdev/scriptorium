# SPEC-08-4: Adoption sets the legacy ADR cutoff

Status: Approved (2026-11-21)
Approval: content ppOUBNjRkm0g; rests on ../frd/FRD-08-adopted-documents-as-they-are.md aCtZe4cVXhD4
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The adopt skill keeps existing ADR files and names, and writes "legacyAdrsThrough" in .scriptorium/config.json as the highest existing ADR number, so new ADRs follow the template and old ones stay as they are.

Last change: 2026-11-21, first draft

## Rows

| EX-4 | RULE-2 | positive | The config says "legacyAdrsThrough": 30 and docs/adr/0021-baselines.md is 200 lines with none of the ADR sections | the docs lint and the TP check run | neither reports anything for it |
| EX-7 | RULE-2 | boundary | The config has no legacyAdrsThrough and docs/adr/0021-baselines.md is 200 lines | the docs lint runs | it fails with "ADR is 200 lines, over its cap of 80", as today |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `skills/adopt/SKILL.md` | Change | In the ADR step: keep the existing files and names (NNNN-name.md is read), do not rewrite an accepted ADR, and set "legacyAdrsThrough" to the highest existing number; new ADRs are ADR-NNNN-name.md from the template |

## Reuses
- `skills/adopt/SKILL.md`: its ADR row and its migration order; the step is added there.
- Precedent: SPEC-06-2-skills-ask-less.md, which changed skill text.

## Tests first
EX-4, EX-7, written by a tester who has not seen the change; the skill test checks the text names legacyAdrsThrough and the highest existing number; covers tags chain/FRD-08/EX-n.

## Build
Markdown only, edited by the lead.

## Done when
`bun test test/install.test.ts`

## Out of scope
The checks themselves (SPEC-08-2).

## Open questions
None.
