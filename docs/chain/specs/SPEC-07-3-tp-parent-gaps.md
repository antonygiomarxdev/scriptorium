# SPEC-07-3: A TP needs only what it rests on

Status: Approved (2026-11-21)
Approval: content Ep_pp-uCgOn_; rests on ../frd/FRD-07-tp-on-request.md iWE6ErQcSy7r
Rests on: ../frd/FRD-07-tp-on-request.md

## Summary

Status stops asking a TP on a request or registry for the cross-cutting TP; a Rests on path that does not exist fails the TP check; approve on a request says how a request is accepted; and the four gaps review found get their tests.

Last change: 2026-11-21, first draft

## Rows

| EX-11 | RULE-1 | negative | REQ-6 has "- CI-3: ..." under Context, outside its Decision, and the TP cites CI-3 | the TP check runs | it fails with "cites CI-3, not in REQ-6's Decision" |
| EX-12 | RULE-3 | negative | A TP says "ADR: ADR-0029" and only docs/adr/ADR-00290-x.md exists | the TP check runs | it fails with "ADR-0029 has no file" |
| EX-13 | RULE-1 | negative | A TP says "Rests on: ../../requests/REQ-9-x.md" and that file does not exist | the TP check runs | it fails with "rests on ../../requests/REQ-9-x.md, which does not exist" |
| EX-14 | RULE-1 | negative | A TP with no Rests on line cites no FR id | the TP check runs | it fails with "cites no FR id", as today |
| EX-15 | RULE-2 | positive | An approved TP rests on an accepted REQ-6 and the project has no docs/tp/TP.md | status runs | it reports no failure for that TP |
| EX-16 | RULE-2 | boundary | An approved TP with no Rests on line and the project has no docs/tp/TP.md | status runs | it fails because the cross-cutting TP does not exist, as today |
| EX-17 | RULE-2 | negative | An accepted REQ-6 | approve runs on REQ-6 | it fails with "the owner accepts a request on its Status line; approve is for chain documents" and changes nothing |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | In chainStatus, a TP whose Rests on is a request or a registry gets no cross-cutting TP parent; with no Rests on or an FRD parent, it keeps it. checkTp fails a Rests on file that does not exist and reads ids only inside the request's Decision section. The ADR file match keeps the dash after the id. The approve command refuses a request with the EX-17 message before writing |

## Reuses
- `scripts/check.ts` `restsOn`, `fromDoc`: the parent is read as in SPEC-07-1 and SPEC-07-2.
- `scripts/check.ts` `section`: reads the Decision section.
- Precedent: SPEC-07-2-tp-parent-in-approve.md, which made chainStatus read the Rests on line.

## Tests first
EX-11, EX-12, EX-13, EX-14, EX-15, EX-16, EX-17, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Change only the TP branch of chainStatus, checkTp and the approve branch of the CLI. No new resolver. Not a format-gated rule: it removes a false failure, and EX-13 and EX-17 turn silent mistakes into messages.

## Done when
`bun test test/check.test.ts`

## Out of scope
Refusing every parent that is not approved at approve time, for any document kind: status catches those today.

## Open questions
None.
