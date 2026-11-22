---
"@antonygiomarxdev/scriptorium": minor
---

Releases happen by themselves: after CI passes on a push to main that carries changesets, the version workflow versions, commits, tags and creates the GitHub release. No Version Packages pull request is opened. A version that was committed but never tagged is tagged by the next run. Nothing is published to npm.
