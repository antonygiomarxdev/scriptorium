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

On `FAIL`, explain each failure. An approved document must rest on an approved one (PRD on PRODUCT, FRD on its PRD, UX and TP on their FRD, spec on its TP, ADR on the TP that cites it), and an approved document has no Q-n left in its Open questions.
