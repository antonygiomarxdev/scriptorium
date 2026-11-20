# SPEC-03-10: The hook runs the local tool

Status: Approved (2026-11-20)
Approval: content cG89CaelsEGd; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

The hook never runs a package fetched by name: the name scriptorium on the public registry belongs to someone else. It runs $SCRIPTORIUM_CLI or the path install wrote, from the repository root, even when the commit starts in a subfolder. The package gets a scoped name.

Last change: 2026-11-20, first draft

## Rows

| EX-23 | RULE-4 | positive | install has run in a repository | a commit of a failing document is made from a subfolder | the hook runs from the repository root and blocks it |
| EX-25 | RULE-4 | negative | install has written the hook | the hook file is read | it runs $SCRIPTORIUM_CLI or the tool path in .scriptorium/local, never a package fetched by name, and with neither it fails with "run scriptorium install" |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/install.ts` | Change | Writes .scriptorium/local with the absolute path of this cli.ts and a .scriptorium/.gitignore that ignores it; the hook reads $SCRIPTORIUM_CLI, then that file, else fails with "run scriptorium install" |
| `package.json` | Change | name @antonygiomarxdev/scriptorium; still private |

## Tests first
EX-23, EX-25, written by a tester who has not seen the code; each test carries a covers tag with the slice, FRD and id.

## Build
The lead renames the package in the .changeset files, which teammates cannot edit. The hook stays a shell file, run by git.

## Done when
`bun test test/install.test.ts`

## Out of scope
Publishing the package, which needs the owner.

## Open questions
None.
