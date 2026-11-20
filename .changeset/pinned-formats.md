---
"scriptorium": minor
---

Each project pins the format of its rules in `.scriptorium/config.json`; a project with no pin keeps the rules of 0.3.0, so this update breaks nobody. Rules of a newer format print `WARN (format N): ...` until the project migrates with `scriptorium migrate` or `/scriptorium:migrate`. Format 2 holds the small spec rules, the coverage scan, the version-line lint and the changeset rule.
