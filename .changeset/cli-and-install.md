---
"@antonygiomarxdev/scriptorium": minor
---

A `scriptorium` command runs every check outside Claude Code (`scriptorium status`, `lint`, `trace`, `migrate`, `install`, `pre-commit`), so CI and other agents can pin it by version. `scriptorium install` keeps the git hook in the committed `.scriptorium/` folder.
