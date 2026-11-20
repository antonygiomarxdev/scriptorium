---
name: prd
description: Write or check the PRD of one slice (docs/<slice>/PRD.md), with requirements R-SLICE-n that cite PRODUCT use cases and principles. Use after PRODUCT is approved and a request is accepted into a new slice.
argument-hint: <slice folder name> <SLICE_ID>
---

# PRD for one slice

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice `$0`, slice ID `$1` (uppercase, for example `PICKUPS`). Ask for them if missing. The folder must not be a reserved name (`requests`, `tp`, `adr`, `retro`, `decisions`, `research`).

1. `docs/PRODUCT.md` must be approved. If it is a draft, stop and say so.
2. If `docs/$0/PRD.md` does not exist, copy `${CLAUDE_PLUGIN_ROOT}/templates/PRD.md` there. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/pickups/PRD.md`.
3. Fill it, then run the checks below and fix every failure.
4. Have an independent reviewer read the PRD against PRODUCT. A passing check sees structure only.

## How to write each section

- **Why**: the REQ-n it answers. No request, no PRD.
- **Use cases**: UC-n from PRODUCT, by id. Do not restate them.
- **Requirements**: `**R-$1-n.**`, one testable requirement each, at least three. Test: could someone write a pass or fail check for it without asking you? Bad: "Booking is easy." Good: "**R-PICKUPS-2.** A family can book one pickup slot per week."
- **Principles honored**: "principle N" and how it shapes this slice. Do not restate the principle.
- **Non-goals**: what this slice deliberately does not do. Fails when empty: every slice excludes something.
- **Dependencies**: other slices or outside systems, by name.
- **Success criteria**: measurable, checked after release. Bad: "families are happier". Good: "missed pickups fall below 10% within two months".
- **No technology**: no database, language, protocol or file format. "Stores records in SQLite" belongs in the TP; "keeps a record of each booking" belongs here.

## Summary (D-24)

`## Summary` sits in the first 20 lines: what the slice must do and why, five lines at most, ending with `Last change: YYYY-MM-DD, <what>`. Rewrite it whenever anything below changes in a way that matters. Agents often read only this part, so it must stand alone.

## Open questions block approval

Every point the owner has not settled becomes a Q-n in the Open questions section. A document with a Q-n is a draft. For each Q-n ask the owner, one question at a time, with your recommendation, and offer a choice: open a grilling session now (you ask, they answer, you record), or wait for the person who knows. Write each answer into the document and in `docs/DECISIONS.md` the same day, then delete the Q-n.

## Finish

Run the checks, show the owner the output and any Q-n left, then stop. Only the owner approves; you never write `Status: Approved` yourself. When the owner approves, set `Status: Approved (YYYY-MM-DD)` with their date and update the `Last change:` line.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" prd docs/$0/PRD.md $1
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" summary docs/$0/PRD.md
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

Then go on with `/scriptorium:frd`, one feature at a time.
