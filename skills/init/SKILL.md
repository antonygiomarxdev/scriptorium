---
name: init
description: Start the Scriptorium document chain in the current project. Creates docs/PRODUCT.md, docs/DECISIONS.md and docs/GLOSSARY.md from the templates. Use once per project, before any PRD.
---

# Start the chain

Never overwrite an existing file. If it exists, read it and edit it in place; copy a template only to a path that does not exist yet.

1. Stop if `docs/PRODUCT.md` exists: the chain has started. Run `/scriptorium:status` instead. If the project has other product or design documents, use `/scriptorium:adopt`.
2. Check that `bun --version` answers. The checks need [Bun](https://bun.sh). If it does not, tell the owner and stop.
3. Copy these templates into the project:
   - `${CLAUDE_PLUGIN_ROOT}/templates/PRODUCT.md` to `docs/PRODUCT.md`
   - `${CLAUDE_PLUGIN_ROOT}/templates/DECISIONS.md` to `docs/DECISIONS.md`
   - `${CLAUDE_PLUGIN_ROOT}/templates/GLOSSARY.md` to `docs/GLOSSARY.md`
4. Fill `docs/PRODUCT.md` with the owner: problem, users, numbered principles, use cases UC-n, v1 scope, and the slice map. Ask in batches, with a recommendation for each question. Record every answer in `docs/DECISIONS.md` the same day.
5. Name no technology in PRODUCT. That waits for the TP.

PRODUCT has no script check: the owner reads and approves it. Then go on with `/scriptorium:prd`, one slice at a time.
