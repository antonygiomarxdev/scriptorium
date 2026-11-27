# REQ-33: Approve stamps the local day, not the UTC day

Status: Accepted

## Summary

`approve` writes the date of the approval in the Status line, and takes it from the UTC clock. In the evening at UTC-6 the stamp reads the next day, so an approval given on the 26th says the 27th and disagrees with the owner's decision rows, which use the local day. Make the default the local day of the machine, from one helper both commands share, and let `drift.ts approve` take `--date` as `check.ts approve` does. Not planned: a time zone setting.

Last change: 2026-11-26, accepted by the owner

## Who asked and when
An adopting project, 2026-11-26, reported by its session.

## What they said
> (Paraphrased.) Approving in the evening stamped tomorrow's date, which does not match the date the owner wrote in the decision row for the same approval.

## The problem behind it
scripts/check.ts:788 defaults the Status date to `new Date().toISOString().slice(0, 10)`, the UTC day. scripts/drift.ts:157 does the same, and its command line takes no `--date`. At UTC-6 from 18:00 on, the UTC day is already the next one. `--date` exists on `check.ts approve` only, so the drift.ts command has no way to correct the date.

## Evidence
One report from an adopting project; its owner works at UTC-6, so every approval after 18:00 local is off by one day. How many other users are east or west of UTC enough to see it: unknown.

## Decision
Accepted into FRD-01 (EX-33, EX-34), SPEC-01-1, owner 2026-11-26.

- LD-1: The default date of `approve` is the day on the machine's own clock, in its local time zone, in `YYYY-MM-DD`.
- LD-2: `check.ts approve` and `drift.ts approve` take that default from one helper, so the two cannot disagree.
- LD-3: `drift.ts approve` takes `--date YYYY-MM-DD`, as `check.ts approve` already does.
- LD-4: A time zone setting in the project configuration is out of scope; the machine's clock decides.
- LD-5: The fix is the short path of the fix skill: the failing example goes into FRD-01 under FR-CHAIN-01-2, and one small spec builds it.
