---
"scriptorium": minor
---

Rules hold without the agent choosing to run them: plugin hooks check a document after each edit and run the status and lint before the agent stops, a git pre-commit script runs the same checks on staged documents, and CI runs them on every pull request.
