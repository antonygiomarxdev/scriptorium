# REQ-3: LF line endings, fixed by the repository

Status: Accepted

## Summary

Nothing in the repository fixes line endings: no .gitattributes, no .editorconfig, and a contributor on Windows with core.autocrlf=true gets CRLF in the working tree. The owner asks for LF everywhere, set by the repository and checked, not left to each machine.

Last change: 2026-11-20, opened and accepted

## Who asked and when
The owner, 2026-11-20, while fixing paths that differ between Windows and Linux.

## What they said
> Also the LF thing, you should have the formatter set up right. (Translated from Spanish.)

## The problem behind it
Line endings depend on each machine's git settings. The fingerprint (FRD-01 EX-1) already ignores them, but other tools, diffs and the quoted-row check do not.

## Evidence
On 2026-11-20 every file in the index is LF, by chance: this machine has core.autocrlf=true and nothing in the repository sets it.

## Decision
Accepted by the owner 2026-11-20 as work that is not product (/scriptorium:ops):
- LF-1: every text file is stored and checked out with LF line endings on every system, set by the repository.
- LF-2: editors are told LF, UTF-8, a final newline and no trailing spaces, except in markdown, where two trailing spaces are a line break.
- LF-3: a test fails when any file in the index has CRLF line endings.
