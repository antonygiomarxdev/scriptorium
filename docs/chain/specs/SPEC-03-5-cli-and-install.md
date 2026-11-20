# SPEC-03-5: Command-line tool and install

Status: Approved (2026-11-20)
Approval: content sh_FiEw8VOkT; rests on ../frd/FRD-03-formats-migrate-cli.md qE3unsi9mr_h
Rests on: ../frd/FRD-03-formats-migrate-cli.md

## Summary

A scriptorium command with the same subcommands and output as the scripts, and install, which writes the hook into .scriptorium and points git at it, or the newest pin in a project with no chain yet.

Last change: 2026-11-20, first draft

## Rows

| EX-5 | RULE-1 | positive | A folder has no docs and no .scriptorium folder | install runs, as the init skill does first | .scriptorium/config.json holds the newest format |
| EX-14 | RULE-4 | positive | A repository has no hooks path set | install runs | .scriptorium/pre-commit exists, git's hooks path is .scriptorium, and a commit of a failing document is blocked |
| EX-15 | RULE-4 | negative | Git's hooks path is .husky | install runs | it refuses, changes nothing, and prints the line to add to the hook in .husky |
| EX-16 | RULE-5 | positive | A project root without the plugin | the status command of the command-line tool runs | its output and exit code equal those of the status script |

## Files
| Path | Create or change | Holds |
|---|---|---|
| `scripts/cli.ts` | Create | Dispatch to check.ts, lint-docs.ts, trace.ts, migrate.ts, pre-commit.ts and install |
| `scripts/install.ts` | Create | Write .scriptorium/pre-commit, set core.hooksPath, refuse when it points elsewhere; write the newest pin when no docs and no config exist |
| `package.json` | Change | `bin: {"scriptorium": "scripts/cli.ts"}` and the files to publish; still private |

## Tests first
EX-5, EX-14, EX-15, EX-16, written before the code; each test carries a covers tag with the slice, FRD and id.

## Build
Every subcommand reads the pin from the project root of the path it is given, not from the current folder. Install runs git through the runtime with arguments, never a shell string. The hook file calls the CLI with the root it sits beside.

## Done when
`bun test test/cli.test.ts test/install.test.ts`

## Out of scope
Publishing the package, which waits for the owner.

## Open questions
None.
