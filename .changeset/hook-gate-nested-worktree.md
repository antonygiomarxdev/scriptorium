---
"@antonygiomarxdev/scriptorium": patch
---

The edit gate takes a file's project from the file, not from the session folder, when the file sits in a nested git worktree (.claude/worktrees/NAME/) that git lists for the session's repository. Such a file is gated by that worktree's own specs, and its docs/ files are exempt. A nested folder that is not a registered worktree, or a failing git, leaves the session folder as the project.
