# How tools change their rules without breaking installed projects

Research for the question: when a Scriptorium release adds or tightens a rule, every installed project that passed yesterday fails today, in hooks that block the agent. How do mature tools avoid that? Gathered 2026-11-20. V = page fetched that day; U = from memory, not re-fetched: verify before citing in public.

## Per tool

| Tool | Where the version lives | Project that does not opt in | How a new rule arrives | Migration | Old formats kept |
|---|---|---|---|---|---|
| Rust editions ([guide](https://doc.rust-lang.org/edition-guide/editions/), V) | `edition` in Cargo.toml | Nothing changes: "existing crates won't use the changes unless they explicitly migrate" | Only in a new edition, about every 3 years; compatibility lints warn first (U) | `cargo fix --edition` rewrites, reports the rest (U) | All, forever, by one compiler; affordable because each edition is a thin delta |
| Go ([toolchains](https://go.dev/doc/toolchain), V) | `go` line in go.mod; missing means go 1.16 | Old behavior kept through GODEBUG defaults tied to the go line (U) | Gated by the go line | `go mod tidy`, `go fix`, manual bump (U) | A window of about 2 years (U). A toolchain older than the go line refuses the module (V) |
| ESLint ([deprecation](https://eslint.org/docs/latest/use/rule-deprecation), [v9 migration](https://eslint.org/docs/latest/use/migrate-to-9.0.0), V) | Package range and the shared config extended | Unchanged within a major | Changes to the recommended set only in a major | Guide, codemods, a config migrator (U) | Deprecated rules usable indefinitely (V). The flat-config switch ran two formats for about two years with no end date and split the ecosystem (U) |
| TypeScript (U) | tsconfig flags and the package version | Unchanged unless a flag is turned on | Behind a flag; the `strict` bundle gains members in minors, so users pin the version | None automatic | n/a |
| Terraform (U) | `required_version`, provider constraints, lock file; state has its own format version | Older Terraform refuses newer state | With the version | One-way state upgrade on apply | Mixed-version teams got forced upgrades (U) |
| Angular ([versions](https://angular.dev/reference/versions), V) | package.json | Unchanged until `ng update` | Per major | Schematics rewrite the project, one major at a time (U) | Active and LTS windows per major (V) |
| Biome ([CLI](https://biomejs.dev/reference/cli/), V), Prettier (U) | `$schema` URL and an exact package pin | Unchanged with an exact pin | Output may change in a minor (Prettier) | `biome migrate` rewrites the config; Prettier: reformat in one commit | n/a |
| Changesets, Doorstop, OpenFastTrack (U) | Config file; Doorstop per item | Old files stay readable | Majors | Weak evidence | Weak evidence |

## Patterns

1. The pin sits in a file the project owns and commits, never in the tool.
2. A missing pin means the oldest format, never the newest (Go, Rust).
3. The tool refuses a pin newer than itself, with a clear message (Go, Terraform).
4. No tool ships a new rule as a silent error in a minor: it arrives through the pin, a flag or a major.
5. Migration is a command that rewrites what is mechanical and reports the rest.
6. Failures seen in practice: two formats with no end date (ESLint flat config), and a one-way upgrade with no refusal for the older tool (Terraform).

## What it means for Scriptorium

Scriptorium has no pin: every plugin update changes every project's rules at once, and auto-update makes that silent. 0.4.0 as merged today would block every spec written for 0.3.0 (no `Rests on:`, over 80 lines, several tasks).

Proposal, for the owner to decide:

- **Pin.** A format number the project commits. Missing means format 1, the rules of 0.3.0. init and adopt write the current format. A plugin that meets a format newer than it knows says so and does not block.
- **New rules.** A rule of format N applies only under a pin of N or more. Under an older pin it may print a warning naming the rule and the migrate command, and never blocks a hook. A bug fix to an existing check applies to all pins and says so in its changeset. One switch per rule, no growing bundle.
- **Migration.** `check.ts migrate` (and a skill): dry run by default, lists what fails under the next format, rewrites only what is mechanical (a `Rests on:` inferred from the spec's TP), reports the rest (splitting a spec), and moves the pin only when the next format passes. One-way.
- **Support window.** The current and the previous format, the previous for at least two minor releases, its end date written in the changelog the day the new format ships.
- **Proof.** One frozen sample project per released format under the test fixtures, taken from its release tag; CI runs today's checks on each and demands the result its pin promises. Every new rule gets a third test beside "good passes" and "mutant fails": the same mutant under the older pin does not fail. Before a release, run the checks on this repository's own documents and on a private copy of the second adopter's.
- **Semver while 0.x.** Patch: a bug fix, no rule change for pinned projects. Minor: may add a format; existing pins keep passing; new projects get the new format. Changing what an existing pin means is not allowed.

## Not checked

TypeScript, Terraform, Changesets, Doorstop and OpenFastTrack pages were not re-fetched. No issue links were collected for the ESLint flat-config transition or the Terraform state upgrades.
