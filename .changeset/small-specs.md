---
"@antonygiomarxdev/scriptorium": minor
---

Specs are small: one agent run each, with a `Rests on:` parent, the rows it builds quoted verbatim (`check.ts excerpt` prints them, the check proves them), at most 80 lines and 3 files, tests first and one done command. `check.ts done <spec>` runs that command for an approved spec. Existing specs must be split into this format; the Larder example shows how.
