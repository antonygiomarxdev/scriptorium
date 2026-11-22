---
"@antonygiomarxdev/scriptorium": patch
---

The approval fingerprint leaves out only the header Status and Approval lines. A body line that starts with "Status:" or "Approval:" is now covered by the approval, so text on it can no longer change unseen. Documents with those lines only in the header keep their fingerprints.
