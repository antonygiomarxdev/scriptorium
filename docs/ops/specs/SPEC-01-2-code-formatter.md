# SPEC-01-2: Code formatter

Status: Draft
Rests on: ../../requests/REQ-4-code-formatter.md

## Summary

Biome formats TypeScript and JSON, never markdown; `format` and `format:check` scripts, a CI step, and one general format of the code in a commit of its own.

Last change: 2026-11-20, first draft

## Rows

- FMT-1: one formatter formats every TypeScript and JSON file, with LF and the indentation the code already uses; it never touches markdown.
- FMT-2: a script formats the code and another checks it, and CI fails on unformatted code.
- FMT-3: the whole code base is formatted once, in a commit of its own that changes no behavior.

## Files
| Path | Create or change | Holds |
|---|---|---|
| `biome.json` | Create | Formatter only (linter off), spaces, width 2, LF, double quotes, a line width that keeps today's long lines; markdown, CHANGELOG and node_modules ignored |
| `package.json` | Change | Biome as a pinned dev dependency; `format` and `format:check` scripts |
| `.github/workflows/ci.yml` | Change | A `bun run format:check` step |

## Tests first
FMT-1, FMT-2, FMT-3, before the configuration: `bun run format:check` must fail on a TypeScript file with wrong indentation and pass on a markdown file with any layout.

## Build
Install, configure, then run `bun run format` once over the repository. The files it rewrites are its output, not hand edits; the lockfile changes with the install. Then `bun run test` and `bun run typecheck` prove no behavior changed.

## Done when
`bun run format:check && bun run test && bun run typecheck`

## Out of scope
Lint rules; markdown formatting.

## Open questions
None.
