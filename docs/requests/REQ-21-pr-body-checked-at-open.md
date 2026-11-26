# REQ-21: The pull-request body is checked when the pull request opens

Status: Open

## Summary

A project's pull-request body rules can be found first at the merge gate, after CI, which costs a round trip on every defect. One body lint should run at open, on every edit of the body and at merge, from one function, so the two cannot disagree. A project adds its own body rules in config. Scriptorium's own rule, the Summary waiver, moves into the same lint.

Last change: 2026-11-23, opened

## Who asked and when
Another project adopting the chain, 2026-11-23, by a session message; filed as issue #12.

## What they said
> PR-body rules found only at the merge gate. Four failures on two PRs (governing-decision line format, a generated facts block, its codegraph list, a «Decisions taken» line) were caught by the final ready/merge check, after CI.

## The problem behind it
Scriptorium has one body rule today: scripts/summary-diff.ts reads the "Summary unchanged:" waiver, in CI only. CI runs on opened, synchronize and reopened, not on edited, so a fixed body waits for a new push. The other project's four rules are its own; Scriptorium has no place for a project's body rules and no command an agent runs before `gh pr create`.

## Evidence
Four defects on two pull requests in one project, on 2026-11-23, each found after CI.

## Decision
Proposed, for the owner:
- PB-1: `scriptorium pr-body <file>` lints a body file; the agent runs it before `gh pr create --body-file <file>`, and the review and ops skills say so.
- PB-2: CI runs the same command on opened, edited, synchronize and reopened, with the body of the event.
- PB-3: `.scriptorium/config.json` may list a project's body rules as `{"name", "pattern", "required"}`: a required line that is missing fails, and a line that starts like a rule but does not match its pattern fails. The other project's four rules become config, not code.
- PB-4: The "Summary unchanged:" waiver of summary-diff.ts is read by the same function, so there is one body reader.
- PB-5: No hook on `gh pr create`: the body can come from a heredoc, a file not yet written or --fill, so a hook would pass or refuse at random.
