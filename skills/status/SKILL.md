---
name: status
description: Show every Scriptorium chain document in the project with its status, and fail on an approval that rests on a draft or on an approved document that still has an open question. Use to see what is next or waiting for the owner.
---

# Chain status

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .
```

It lists PRODUCT, requests, every slice's PRD, FRDs, UX, TPs and specs under `docs/<slice>/`, the cross-cutting TP and the ADRs. Reserved folders (`requests`, `tp`, `adr`, `retro`, `decisions`, `research`) are not slices.

Show the table. Then name the next step: the first draft whose base document is approved, and the skill that writes it (`/scriptorium:prd`, `/scriptorium:frd`, `/scriptorium:tp`, `/scriptorium:spec`). Read every Q-n in the Open questions of the draft you name: the owner must close them before it can be approved.

On `FAIL`, explain each failure. An approved document must rest on an approved one (PRD on PRODUCT, FRD on its PRD, UX and TP on their FRD, spec on the document its `Rests on:` line names, ADR on the TP that cites it), and an approved document has no Q-n left in its Open questions. A line `drifted:` means an approved document no longer matches its Approval record: "suspect" means a document it rests on changed, "edited after approval" means its own body did. Do not fix either yourself: the document goes back to the owner, who approves it again or runs `check.ts clear <document>` when only a parent changed. A document with `Status: Superseded by <path> (YYYY-MM-DD)` was replaced: status lists it, drift and trace skip it, and an approved document still resting on it fails until it rests on the replacement. Whether a spec is done is not a status line: `check.ts done <spec>` runs its Done when command. A `WARN` line names an approved document with no Approval record; offer to record one only if the owner confirms the document is still as approved.
