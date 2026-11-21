# SPEC-09-1: The checks pass on an adopted project

Status: Approved (2026-11-21)
Approval: content BCMEIitonWeW; rests on ../frd/FRD-09-adoption-with-history.md ZUz9wr_iEtpE
Rests on: ../frd/FRD-09-adoption-with-history.md

## Summary

A fixture of an adopted project under test/fixtures/adopted, and one test that runs status, the docs lint and the TP check on it from another folder, plus mutated copies that must fail.

Last change: 2026-11-21, first draft

## Rows

| EX-1 | RULE-1 | positive | The adopted-project fixture as committed | status, the docs lint and the TP check run on it from the repository root | each exits 0 |
| EX-2 | RULE-1 | negative | A copy of the fixture without legacyAdrsThrough in its config | the TP check runs on it | it fails on the legacy ADR with "missing section" |
| EX-3 | RULE-1 | negative | A copy of the fixture whose approved document gets one word changed | status runs on it | it fails with "body changed since approval" |
| EX-4 | RULE-2 | positive | The fixture holds archive/linear/plan.md with a banned phrase, and its FRD links to it on a Source line | the docs lint runs | it reports nothing for the archive and the link resolves |
| EX-5 | RULE-2 | negative | A copy of the fixture whose Source line links to archive/linear/missing.md | the docs lint runs | it fails with "link does not resolve" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `test/fixtures/adopted/` | Create | The fixture: docs/ with PRODUCT, a slice PRD and FRD, docs/adr/0003-x.md below "legacyAdrsThrough": 5 and docs/adr/ADR-0006-x.md, an accepted REQ with Decision ids and a TP resting on it, an approved document whose tables are padded, .scriptorium/config.json, and archive/linear/plan.md linked from the FRD on a Source line. The lead writes its markdown |
| `test/adopted.test.ts` | Create | Runs the three checks on the fixture from the repository root, then on copies in a temp folder with one change each |

## Reuses
- `test/check.test.ts`: its helpers that run a check in a temp project.
- `examples/larder`: the shape of a small project, copied where it fits.
- Precedent: SPEC-08-2-legacy-adr-cutoff.md, whose tests built such projects one case at a time.

## Tests first
EX-1, EX-2, EX-3, EX-4, EX-5, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The tester writes the test; the lead writes the fixture markdown the test names. Each later adoption gap adds a file or a copy case here.

## Done when
`bun test test/adopted.test.ts`

## Out of scope
The adopt skill text (SPEC-09-2).

## Open questions
None.
