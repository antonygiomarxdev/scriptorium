---
"scriptorium": minor
---

Approval now records what a document said and what it rested on. `check.ts approve` writes an Approval line; `status`, the Stop hook, the pre-commit hook and CI fail an approved document whose body was edited or whose parent changed, until the owner approves again or runs `check.ts clear`. Tests carry `covers: slice/FRD-NN/ID` tags and `check.ts trace` fails dead tags and approved examples nobody tests. `check.ts history` prints a document's commits from git. The docs lint fails a document that carries a version number. Drift runs in the edit and stop hooks, pre-commit and CI; the trace scan runs in pre-commit and CI only, so unfinished tests do not block work in progress.
