---
"@antonygiomarxdev/scriptorium": patch
---

The approval fingerprint ignores runs of spaces, blank lines and table separator padding, so a formatter run at commit no longer invalidates an approval. Fingerprints written before still match.
