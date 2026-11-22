---
"@antonygiomarxdev/scriptorium": patch
---

Status lists an ADR at or below legacyAdrsThrough as "legacy" and never fails it for its status line; an ADR above the cutoff that writes "legacy" by hand still fails. The spec check compares a quoted table row cell by cell with each cell trimmed, so a formatter that pads a table no longer breaks it; the text inside a cell must still match exactly.
