---
name: glossary
description: Add or change terms in docs/GLOSSARY.md: one word per thing, with the words to avoid. Use when a new domain term appears, when two words name one thing, or when the lint reports an avoided word.
argument-hint: <term>
---

# Glossary

Never overwrite an existing file; add rows. `docs/GLOSSARY.md` must exist (`/scriptorium:init` creates it). A glossary rests on no other document. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/GLOSSARY.md`.

1. Search the documents and code for the term and for what else people call it. Two words for one thing is the bug this file prevents.
2. Add one row: **Term**, **Meaning**, **Avoid**.
3. If the owner has not chosen between two words, ask (one question, with your recommendation). Record the answer in `docs/DECISIONS.md` (`/scriptorium:decision`).
4. Replace the avoided words in the documents. Do not edit code or tests; list the places and ask the owner.

## How to write a row

- **Term**: the word to use, exactly as it will appear. One row per concept.
- **Meaning**: one sentence that tells it apart from its neighbors. Bad: "A booking." Good: "A reserved time slot for one family to collect a food parcel."
- **Avoid**: the synonyms the project must not use for this thing, comma separated. Every word here fails the check when it appears in a document under `docs/` (code and test names are not checked yet), so list only words that mean this and nothing else. "Order" is a poor Avoid for "Booking" if the product also has real orders.
- Terms that are plain English and cannot be confused do not need a row.

The glossary is a registry: no approval, no open questions. An unsettled word is a decision for the owner, not a Q-n in this file.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```
