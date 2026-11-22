---
"@antonygiomarxdev/scriptorium": minor
---

The docs lint reads Mermaid blocks: a type GitHub does not render, a label with a bracket, a colon or HTML outside double quotes, HTML in any label, and a node named end in lowercase fail as format 4 rules (a warning for projects pinned below 4). A diagram over 15 nodes gets a warning; sequence diagrams are not counted.
