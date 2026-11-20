---
"scriptorium": minor
---

Tests carry `covers: slice/FRD-NN/ID` tags, and `check.ts trace` fails dead tags and approved examples, states or invariants nobody tests unless the FRD waives them with a reason. It runs in pre-commit and CI only, so unfinished tests do not block work in progress.
