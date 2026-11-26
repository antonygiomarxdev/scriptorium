# REQ-31: Only the owner can approve

Status: Accepted

## Summary

The chain says agents write and review but never approve (D-6), yet nothing stops an agent from approving its own spec. Approval is a Status line and a hash with no secret, and docs/ is exempt from the gate. The owner accepted the need; the owner chose to enforce it through a pull request the owner merges (OA-3, D-38).

Last change: 2026-11-26, build picks recorded in D-40; before that the owner picked OA-3 (D-38), OA-2 and OA-4 not chosen

## Who asked and when
The owner, 2026-11-26, in session.

## What they said
> (Paraphrased.) An agent must not be able to approve a document. Only the owner approves, and the chain should enforce it instead of asking for it.

## The problem behind it
`approve` writes a Status line and a content hash (scripts/drift.ts:92-101). The hash holds no secret, so any process that can run the command or edit a document can produce a valid approval. scripts/gate.ts exempts docs/ from the gate, so the edit that approves a document is never judged. D-6 and the spec skill say "only the owner approves", but only as prose (cause C-8).

## Evidence
Rework R-101 (2026-11-26): an agent can approve its own spec. This run showed the shape of the risk: agents wrote specs, and approval depended on the lead and the owner doing the right thing. How often an agent has approved without the owner: unknown.

## Decision
- OA-1: Whatever is chosen, an approval by anyone but the owner is a failure of status, not a warning, from the format that adds it; projects on an earlier format get a warning until they migrate.
- OA-2 (not chosen): Approval is a commit signed by the owner. Status fails an approved document whose approving commit carries no signature from a key the project lists as the owner's. Cost: needs signing set up, and a key list in the project.
- OA-3 (chosen by the owner, D-38): Approval exists only in a pull request the owner merges. The approving change lands on the default branch through that merge, and status checks the merger. Cost: needs a host with pull requests; useless in a solo local repository.
- OA-4 (not chosen): The `approve` command refuses to run from an agent session. Cost: the command must tell it is in an agent session, and an agent can edit the Status line and hash by hand, so this alone stops only the honest path.
- OA-5: Whether an agent can tell it is one mattered only for OA-4, which was not chosen; the question is closed.
- OA-6: The owner picked OA-3 and recorded it as D-38; the build is an FRD and then specs.
- Draft: https://claude.ai/artifact/22jNEiSuJSepc2Y95M2vhH, version 1, OK 2026-11-26
- Draft: https://claude.ai/artifact/NJRPzKgQuPyxjHUkSv2XYU, version 1, OK 2026-11-26, D-40
