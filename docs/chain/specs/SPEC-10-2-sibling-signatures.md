# SPEC-10-2: Sibling specs agree on argument counts

Status: Approved (2026-11-22)
Approval: content RidBcOfSbGgo; rests on ../frd/FRD-10-specs-checked-against-code.md _9JVArVmxyzY
Rests on: ../frd/FRD-10-specs-checked-against-code.md

## Summary

The spec check compares each call in a spec's Build block with the declaration of the same function, method or constructor in a sibling spec of the same folder, and fails a different argument count.

Last change: 2026-11-21, first draft

## Rows

| EX-4 | RULE-2 | negative | SPEC-01-48 declares "new RecordsReader(a, b, c, d)" in its Build block and SPEC-01-35 calls "new RecordsReader(x, y)" in its Build block | the spec check runs on SPEC-01-35 | it fails naming SPEC-01-48, SPEC-01-35, 4 and 2 |
| EX-5 | RULE-2 | positive | Both specs use RecordsReader with 4 arguments | the spec check runs | it reports nothing for RecordsReader |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/check.ts` | Change | A reader of declarations and calls in the code blocks of a Build section, and the comparison across the specs of the same folder, tagged "[format 4]" |
| `test/check.test.ts` | Change | The EX-4 and EX-5 tests |

## Reuses
- `scripts/check.ts` `specFails`: the per-spec check this comparison joins.
- `scripts/check.ts` `cells`: not needed; the Build block is read as code fences.
- Precedent: SPEC-10-1-tracked-paths.md.

## Tests first
EX-4, EX-5, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
A declaration is "function name(", "name(" after a class member, or "constructor(" inside "class Name"; a call is "name(" or "new Name(". Arguments are counted at the top nesting level. A name declared twice with different counts is left out.

## Done when
`bun test test/check.test.ts`

## Out of scope
Types of arguments; only the count is compared.

## Open questions
None.
