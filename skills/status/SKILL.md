---
name: status
description: Show every Scriptorium chain document in the project with its status, and fail on an approval that rests on a draft. Use to see what is next or waiting for the owner.
---

# Chain status

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" status .
```

Show the table. Then name the next step: the first draft whose base document is approved, and the skill that writes it (`/scriptorium:prd`, `/scriptorium:frd`, `/scriptorium:tp`, `/scriptorium:spec`). On `FAIL`, explain each failure: an approved document must rest on an approved one.
