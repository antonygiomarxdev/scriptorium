---
name: frd
description: Write or check the FRDs of one slice (src/<slice>/docs/frd/FRD-NN-name.md): one feature each, with FR ids, edge cases and Given/When/Then acceptance tests, covering every PRD requirement. Use after the slice PRD is approved.
argument-hint: <slice dir name> <SLICE_ID>
---

# FRDs for one slice

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

Arguments: slice `$0`, slice ID `$1`. Ask for them if missing.

1. `src/$0/docs/PRD.md` must be approved. If it is a draft, stop and say so.
2. Split the PRD into features. For each, copy `${CLAUDE_PLUGIN_ROOT}/templates/FRD.md` to `src/$0/docs/frd/FRD-NN-name.md` (NN two digits, name in kebab-case).
3. Each FRD: cites the `R-$1-n` it covers, defines at least 2 `FR-$1-NN-n` in bold, lists edge cases, and has at least 2 Given/When/Then acceptance tests. Name no technology. Together the FRDs cover every PRD requirement.
4. Run the check and fix every failure:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" frd src/$0 $1
```

5. Have an independent reviewer read the FRDs against the PRD. When every slice has FRDs, run one cross-slice review for contradictions between slices: the check cannot see those.

Then stop. Show the owner the check output and the open questions, each with your recommendation. Only the owner approves (see the `scriptorium` skill, "Status and approval").
