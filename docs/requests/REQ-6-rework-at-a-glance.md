# REQ-6: Rework at a glance

Status: Accepted

## Summary

The owner wants to see how much work was sent back, and which step of the chain let it through, without reading many documents. Every finding goes in one log with the step where it should have been caught, and one command prints the totals.

Last change: 2026-11-20, opened and accepted

## Who asked and when
The owner, 2026-11-20, after the FRD-03 and FRD-04 runs.

## What they said
> The idea is that with this we bring rework down. If we are writing better specs, we should not have rework problems. The code review should be based on the specs and not invent things. If something is well defined, fine; if not, find which part of the process is failing. There should be an easy way to find the rework, not analyzing a pile of documents to find out how much there is. (Translated from Spanish.)

> And how will you measure it? I would like a document where you run a command and it picks up every finding with its date, so you can see rework by task over time and clearly whether it goes down or up; and with AI make an improvement plan, a command like scriptorium rework improve, that finds the gaps causing rework and helps fix them, all based on documentation, patterns and well-researched practice from large teams that suffer this kind of problem. (Translated from Spanish, 2026-11-20.)

> I don't mind how it is done; what matters is that what I want improves. It is very annoying that we build a tool to improve something, and that tool has those problems, and on top of that the tool everyone is supposed to use does not even use itself. (Translated from Spanish, 2026-11-20.)

## The problem behind it
Findings lived in review messages and in the conversation. Nothing counted them by step, so nobody could say whether better specs lowered rework, or which step to fix next.

## Evidence
[The rework log](../metrics/rework.md): 24 findings on 2026-11-20, 17 of them at the FRD or the spec, none at the build step.

## Short path
Short path: skills/scriptorium/SKILL.md
Short path: skills/frd/SKILL.md
Short path: skills/spec/SKILL.md
Short path: skills/review/SKILL.md

## Decision
Accepted by the owner 2026-11-20 into the metrics slice; owner decisions in D-32, mechanism in L-17. The log is a queue of open findings with a fixed list of causes; a repeated cause with no prevention blocks (FRD-01 of the metrics slice). Until its checks are built, the lead applies them by hand.
