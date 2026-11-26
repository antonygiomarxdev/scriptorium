# REQ-29: Incidents feed the rework queue

Status: Accepted

## Summary

A production incident teaches the same lesson as a rework finding, but nothing in the chain records it or forces a prevention. Treat an incident as a finding in the rework queue, require a prevention with a command and a replay, write the postmortem as a blameless request, and tell adopt where community health files go. Build after REQ-26.

Last change: 2026-11-26, accepted

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) Incidents need to reach the chain the way rework does, and the community files a project already has need a place.

## The problem behind it
The rework queue (D-32) holds findings with a cause and blocks until a prevention exists, but its findings come only from review. An incident has no entry point, so its follow-up is a note that nothing checks. CONTRIBUTING, SECURITY, SUPPORT and CODE_OF_CONDUCT have no target in skills/adopt/SKILL.md.

## Evidence
The research report on engineering-project gaps found no incident path in the chain. Google SRE practice writes postmortems blameless (https://sre.google/sre-book/postmortem-culture/). GitHub reads community health files from the repo root, docs/ or .github/ (https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file). Incident count in adopting projects: unknown.

## Decision
- IN-1: An incident is a finding in docs/metrics/rework.md with a cause from the fixed list. Findings are 5-cell `| R-n |` table rows today (scripts/rework.ts:27); the row gains a sixth column, Source, with `incident` for a production incident and `agent` as the default.
- IN-2: Its follow-up is a prevention with a command and a replay of the failure, the same rule as for any finding (D-32); an incident with no prevention blocks like a cause found twice.
- IN-3: The postmortem is written as a request under docs/requests/, blameless: it names causes and checks, never a person. Its Decision rows are the prevention.
- IN-4: Adopt maps CONTRIBUTING, SECURITY, SUPPORT and CODE_OF_CONDUCT to the repo root or .github/, where GitHub finds them, or to docs/notes/ (REQ-24); it never moves them into a slice.
- IN-5: The rework check will accept the Source column with `incident` or `agent` and reject any other value; scripts/rework.ts has no Source handling today.
