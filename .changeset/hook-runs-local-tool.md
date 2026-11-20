---
"@antonygiomarxdev/scriptorium": patch
---

The git hook no longer runs `bunx scriptorium`: that name on npm belongs to another project, so the hook could download and run someone else's code. It now runs `$SCRIPTORIUM_CLI`, or the path `install` writes to the untracked `.scriptorium/local`, and fails with "run scriptorium install" when it has neither. The package is renamed `@antonygiomarxdev/scriptorium`.
