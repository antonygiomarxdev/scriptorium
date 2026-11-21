# SPEC-07-2: Approval rests a TP on its Rests on document

Status: Approved (2026-11-21)
Approval: content pJTFrnOVFVmL; rests on ../frd/FRD-07-tp-on-request.md ziLURA7EnfYa
Rests on: ../frd/FRD-07-tp-on-request.md

## Summary

chainStatus gives a TP with a Rests on line that document as its parent, so approve records it and status checks it is accepted.

Last change: 2026-11-21, first draft

## Rows

| EX-7 | RULE-2 | positive | An accepted REQ-6 and a TP resting on it | approve runs on the TP | it records REQ-6 as the parent and passes |
| EX-8 | RULE-2 | negative | A TP rests on REQ-6, which is still Open | approve runs on the TP | it fails because REQ-6 is not accepted |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | In chainStatus, a TP whose text has a Rests on line rests on that file; otherwise on the FRD of its number, as today |

## Reuses
- `scripts/check.ts` `restsOn`: the same reader the spec rows of chainStatus use.
- Precedent: SPEC-02-3-spec-parent-and-quotes.md.

## Tests first
EX-7, EX-8, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
Reuse the spec branch of chainStatus that already resolves Rests on; no second resolver.

## Done when
`bun test test/check.test.ts`

## Out of scope
The TP check itself (SPEC-07-1).

## Open questions
None.
