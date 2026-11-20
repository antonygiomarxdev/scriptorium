---
"scriptorium": minor
---

Approval records what a document said and what it rested on. `check.ts approve` writes an Approval line; `status`, the edit and Stop hooks, the pre-commit hook and CI fail an approved document whose body was edited or whose parent changed, until the owner approves again or runs `check.ts clear`.
