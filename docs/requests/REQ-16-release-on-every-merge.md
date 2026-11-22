# REQ-16: A release on every change that carries a changeset

Status: Accepted

## Summary

Releases wait for someone to merge the Version Packages pull request, and nobody did for a week, so finished work did not reach users. Every push to main that carries a changeset should version, tag and release by itself, with no pull request to merge.

Last change: 2026-11-22, opened and accepted

## Who asked and when
The owner, 2026-11-22.

## What they said
> I do not see why we do not send it, if in the end... in theory we go with continuous delivery, continuous integration. And later, on the proposal to release on every push: approved. (Translated from Spanish.)

## The problem behind it
version.yml keeps a pull request open while changesets are pending, and releases only after it is merged. The pull request is opened with the workflow token, so no check runs on it (issue #4), and nothing reminds anyone to merge it.

## Evidence
Pull request #6 stayed open from 2026-11-20 to 2026-11-22 while 13 changesets piled up, among them the removal of the retro skill, which users kept seeing.

## Decision
- RL-1: On a push to main that carries changesets, after CI passes on that push, the workflow runs the version step, commits the version and changelog to main, tags it and creates the GitHub release; no Version Packages pull request is opened.
- RL-2: A push with no changeset releases nothing.
- RL-3: Publishing to npm stays out of scope until the owner asks for it.
