---
"@antonygiomarxdev/scriptorium": patch
---

A Reuses entry that names a directory now fails with "is a directory, name a file" instead of crashing with EISDIR. A Reuses section with no valid entry now says so and lists the three entry forms; "no Reuses section" is kept for a spec that has none.
