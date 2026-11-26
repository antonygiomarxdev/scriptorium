# REQ-20: The product board agrees with the chain's approvals

Status: Open

## Summary

A board task can stay in a design stage after the owner approved its UX or FRD, and a lead who trusts the board orders work that is already approved. Status should read a board export that CI or a person saves to a file. It should flag an approved document whose linked task still sits in a design stage. Approve should print the board move it expects. No check calls the network.

Last change: 2026-11-23, opened

## Who asked and when
Another project adopting the chain, 2026-11-23, by a session message; filed as issue #11.

## What they said
> Board contradicts the chain. A UX document was Approved two days earlier, but the product-board task stayed in its «Design» column; the lead trusted the board and ordered a redesign the owner had already approved.

## The problem behind it
The chain and the board hold the same state twice, and nothing checks that they agree. A document can already point to a task with its "Links:" line (FRD-08 RULE-3), but nothing reads the task's stage. Approve changes only the document.

## Evidence
One redesign ordered of approved work, in one project, on 2026-11-23. How often it happens elsewhere is unknown.

## Decision
Proposed, for the owner:
- BD-1: The task of a document is the first link of its "Links:" line; no new header line.
- BD-2: `.scriptorium/config.json` names a board export file and the stages that count as design, for example `"board": {"export": "board.json", "designStages": ["Design", "Definition"]}`. The export is a JSON list of `{url, stage}`. No board tool is named in code.
- BD-3: Status flags an approved UX or FRD whose task is in the export and sits in a design stage. It warns when the export is older than the newest approval it judges.
- BD-4: Approve prints "move <task> out of <stage>" when the export shows the task in a design stage. Moving the task stays with the person or a CI step, since it needs the board's credentials.
- BD-5: Without a "board" key nothing changes, and the rule only warns under an older format pin.
