---
name: prd
description: Write or check the PRD of one slice (src/<slice>/docs/PRD.md), with requirements R-SLICE-n that cite PRODUCT use cases and principles. Use after PRODUCT is approved.
argument-hint: <slice dir name> <SLICE_ID>
---

# PRD for one slice

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice `$0`, slice ID `$1` (uppercase, for example `INBOX`). Ask for them if missing.

1. `docs/PRODUCT.md` must be approved. If it is a draft, stop and say so.
2. If `src/$0/docs/PRD.md` does not exist, copy `${CLAUDE_PLUGIN_ROOT}/templates/PRD.md` there.
3. Write what the slice must do, as testable requirements `R-$1-n`. Cite use cases `UC-n` and principles by number from PRODUCT. Name no technology.
4. Run the check and fix every failure:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" prd src/$0/docs/PRD.md $1
```

5. Have an independent reviewer read the PRD against PRODUCT. A passing check sees structure only.

Then stop. Show the owner the check output and the open questions, each with your recommendation. Only the owner approves (see the `scriptorium` skill, "Status and approval").
