# SPEC-01-1: LF line endings

Status: Draft
Rests on: ../../requests/REQ-3-lf-line-endings.md

## Summary

The repository sets LF for every text file and tells editors the same; a test fails on any CRLF file in the index, so the rule holds on every machine whatever its git settings.

Last change: 2026-11-20, first draft

## Rows

- LF-1: every text file is stored and checked out with LF line endings on every system, set by the repository.
- LF-2: editors are told LF, UTF-8, a final newline and no trailing spaces, except in markdown, where two trailing spaces are a line break.
- LF-3: a test fails when any file in the index has CRLF line endings.

## Files
| Path | Create or change | Holds |
|---|---|---|
| `.gitattributes` | Create | `* text=auto eol=lf` |
| `.editorconfig` | Create | LF, UTF-8, final newline, trim trailing spaces except in markdown |

## Tests first
LF-1, LF-2, LF-3, written before the files: a test reads `git ls-files --eol` and fails naming every file whose index or attribute is CRLF, and checks that .gitattributes sets eol=lf and .editorconfig sets end_of_line = lf.

## Build
The two files, then `git add --renormalize .` so the index matches them.

## Done when
`bun test test/line-endings.test.ts`

## Out of scope
A code formatter for style (indentation, quotes): a separate request.

## Open questions
None.
