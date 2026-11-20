# Mutation gate and affected tests on Bun

Status: Draft

## Summary

Which tool can fail a change for surviving mutants on Bun, run only on the changed lines, and how to run only the tests a change affects. Tried on a scratch copy of this repository (Bun 1.4.4, Node 24.22, native Windows), 2026-11-20.

Last change: 2026-11-20, first findings

- StrykerJS core with its built-in command runner works on Bun; the only Bun plugin fails on Windows.
- Stryker mutates line ranges, so a gate can feed it the hunks of the diff; each mutant must run only its file's tests or it takes hours.
- `bun test --changed` runs only the affected test files, but cannot see tests that spawn a script or read a file.

## Mutation testing

- **@stryker-mutator/core 10.1.1**: published by the project's GitHub Actions trusted publisher, maintainers nicojs and simondel, repository stryker-mutator/stryker-js; needs Node 22 or later. Install adds 167 packages, about 204 MB.
- **No official Bun runner.** The packages `@stryker-mutator/bun-runner` and `stryker-bun-runner` do not exist. A third-party plugin, `@hughescr/stryker-bun-runner` 1.6.0 (one maintainer, created 2026-01-16), fails on native Windows: "cannot determine the current user id (process.getuid is unavailable)". Linux was not tried.
- **Command runner works.** Config: `testRunner: "command"`, `commandRunner.command: "bun test test/gate.test.ts"`, `mutate: ["scripts/gate.ts"]`, `coverageAnalysis: "off"`. On `scripts/gate.ts` (65 lines): 166 mutants, 122 killed, 44 survived, score 73.49, 26 s. Survivors print as `[Survived] StringLiteral scripts/gate.ts:62:30` with the changed line; JSON in `reports/mutation/mutation.json`.
- **Threshold**: `--thresholds.break 90` exits 1 with "Final mutation score 46.15 under breaking threshold 50".
- **Changed lines only**: no `--since`, but `--mutate scripts/gate.ts:60-64` ran 13 mutants in 5.7 s, so the hunks of `git diff -U0` map to ranges.
- **Incremental**: `--incremental` reran an unchanged file in 3.9 s against 27.8 s.
- **Cost**: with coverage analysis off each mutant runs the whole command. The full suite (29 s) on 166 mutants would take about 80 minutes; the file's own test (0.6 s) keeps it in seconds. The gate needs a map from each script to its test files.
- **Noise**: mutants of message text survive when tests do not assert the text.

## Affected tests

- **Built in**: `bun test --changed[=<commit>]` runs the test files that import a changed file, against HEAD by default. An edit to `scripts/gate.ts` ran 2 of 16 files (37 tests); `scripts/paths.ts` 9 of 16; `README.md` none.
- **Blind spot**: it follows imports only. An edit to `scripts/hook-gate.ts`, which tests run with `Bun.spawnSync`, ran 0 tests; so does a document the tests read from disk. Jest `--findRelatedTests` and Vitest `--changed` have the same blind spot.
- **Staged only**: no flag; staged and unstaged edits both count.

## What it means here

A mutation gate on the diff is feasible: changed hunks to `--mutate` ranges, each file with its own test command, a break threshold, run in CI. The same script-to-test map fixes the blind spot of `--changed` for spawned scripts, and CI keeps the full suite.
