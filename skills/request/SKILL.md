---
name: request
description: Record why a change exists as docs/requests/REQ-n-name.md: who asked, what they said, the problem behind it. Use whenever someone asks for a feature or a change, even informally, before any PRD or spec.
argument-hint: <short-name>
---

# Request

Never overwrite an existing file. Number the new request one above the highest `REQ-n` in `docs/requests/`. A request rests on no other document, so nothing needs to be approved first.

1. Copy `${CLAUDE_PLUGIN_ROOT}/templates/REQUEST.md` to `docs/requests/REQ-<n>-$0.md` (lowercase, hyphens). Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/requests/REQ-1-book-a-pickup-slot.md`.
2. If the same ask already exists, do not open a second one: set the new one to `Merged into REQ-m` and add the new evidence to REQ-m.
3. Fill the sections from what the person actually said. Do not improve their words.

## How to write each section

- **Who asked and when**: a person or role, a date, a channel. Bad: "a user". Good: "Marta, pantry coordinator, 2026-11-12, in the volunteer chat".
- **What they said**: a quote, as close as possible. Bad: "wants better scheduling". Good: "> I spend Fridays phoning families to move their pickup."
- **The problem behind it**: what hurts today and how it is done now. The request is often a solution ("add a calendar"); write the problem under it ("pickups are moved by phone, 10 calls a week").
- **Evidence**: how many people, how often, what it costs. "Unknown" is allowed and stays visible; an invented number is not.
- **Decision**: accepted into which slice or FRD, or why rejected. A small change names the spec that answers it (the short path). Set `Status:` to `Accepted`, `Rejected` or `Merged into REQ-m` only after the owner decides.

## Summary (D-24)

`## Summary` sits in the first 20 lines: what is asked and why it matters, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters. Agents often read only this part, so it must stand alone.

## Finish

Show the owner the request and your recommendation, then stop. A request has no open questions and is never "Approved": only the owner sets `Status:` to `Accepted`, `Rejected` or `Merged into REQ-m`, and you update the `Last change:` line. Run:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary <file>
```

Then the request is cited by the PRD or FRD that answers it (`REQ-n` in its Why section).
