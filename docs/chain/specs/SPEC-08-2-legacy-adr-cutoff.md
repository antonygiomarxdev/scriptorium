# SPEC-08-2: ADRs below the adoption cutoff are kept as they are

Status: Approved (2026-11-21)
Approval: content wRJOZCjwQxR5; rests on ../frd/FRD-08-adopted-documents-as-they-are.md RtuWFdihKJCj
Rests on: ../frd/FRD-08-adopted-documents-as-they-are.md

## Summary

The docs lint and the TP check leave alone an ADR numbered at or below "legacyAdrsThrough" in .scriptorium/config.json: no line cap, no template. A TP citing one fails only if a status line says it is not accepted. The cap waiver line built earlier is removed.

Last change: 2026-11-21, first draft

## Rows

| EX-4 | RULE-2 | positive | The config says "legacyAdrsThrough": 30 and docs/adr/0021-baselines.md is 200 lines with none of the ADR sections | the docs lint and the TP check run | neither reports anything for it |
| EX-5 | RULE-2 | negative | The same config and docs/adr/ADR-0031-x.md lacks its Summary section | the TP check runs | it fails with "missing section: ## Summary" for ADR-0031, as today |
| EX-6 | RULE-2 | negative | The same config and a TP cites ADR-0021, whose file has the line "Status: Superseded" | the TP check runs | it fails with "ADR-0021 is Superseded, not accepted" |
| EX-7 | RULE-2 | boundary | The config has no legacyAdrsThrough and docs/adr/0021-baselines.md is 200 lines | the docs lint runs | it fails with "ADR is 200 lines, over its cap of 80", as today |
| EX-11 | RULE-2 | negative | The config says "legacyAdrsThrough": "thirty" | the docs lint runs | it fails with "legacyAdrsThrough must be a whole number, the last ADR written before adoption" |


## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/format.ts` | Change | `legacyAdrsThrough(root)`: reads the number from the config beside docs/, as readFormat reads the pin; undefined when absent; a value that is not a whole number gives the EX-11 failure |
| `scripts/lint-docs.ts` | Change | An ADR whose number is at or below the cutoff gets no cap check; remove the `lint-ok cap` waiver and its two failures |
| `scripts/check.ts` | Change | The TP check skips the ADR template rules for an ADR at or below the cutoff; a cited one fails "ADR-<id> is <status>, not accepted" when a Status line says Proposed, Superseded or Rejected |

## Reuses
- `scripts/format.ts` `readFormat`, `CONFIG`: the config is read the same way; no second reader.
- `scripts/check.ts`: the ADR file match of SPEC-08-1.
- Precedent: SPEC-08-1-adr-file-names.md.

## Tests first
EX-4, EX-5, EX-6, EX-7, EX-11, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The ADR number is the digits of its file name. A status line is "Status: X" or the line after "## Status". The tests of the removed waiver (EX-4 to EX-7 of the earlier FRD-08, and the quoted-waiver test) are replaced by the tests of these rows. Not format-gated: it relaxes rules for a set the project names.

## Done when
`bun test test/lint-docs.test.ts test/check.test.ts test/format.test.ts`

## Out of scope
The adopt skill step that sets the cutoff (SPEC-08-4).

## Open questions
None.
