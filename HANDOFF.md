# Handoff

For the next session that works on Scriptorium. Read it, then delete or shorten it once its content lives in the product documents.

## Where this came from

On 2026-11-17 the owner ran Deputy (a WhatsApp helper for small businesses, https://github.com/antonygiomarxdev/deputy) through a document chain with an agent team, before writing any code:

1. `docs/PRODUCT.md`: problem, users, 8 numbered principles, use cases UC-1..UC-7, v1 scope, slice map (7 slices, one folder each under `src/`).
2. One PRD per slice, in `src/<slice>/docs/PRD.md`, with requirements R-SLICE-n, checked by a script.
3. 24 FRDs across the slices, in `src/<slice>/docs/frd/`, checked for full coverage of the PRD requirements.
4. An independent reviewer per step, then one cross-slice review. Each round found real defects (for example a rule that would have let the agent answer over the owner).
5. Owner decisions recorded in `docs/DECISIONS.md` (D-n, and L-n for the lead's design calls), terms in `docs/GLOSSARY.md`.

Deputy's TP, ADRs and specs are not written yet. They are the next steps there, and the first real use of those steps here.

## What the owner wants

- A layer **above** spec-driven development. SDD is the last layer (specs to code). The gap is everything before it: product, requirements, technical proposal, decisions. The owner does not want an SDD framework; learning from them is fine.
- Packaged as a Claude Code plugin: skill, role agents, and hooks that run the checks.
- It works with [puppeteering](https://github.com/antonygiomarxdev/puppeteering), which supersedes the owner's earlier project Mill (https://github.com/antonygiomarxdev/mill, to be archived with a pointer here). Puppeteering is how the team runs; Scriptorium is what the team writes.
- Name: Scriptorium, the room where monks wrote texts in strict order before a book existed.

## What exists (v0.1.0)

- `scripts/check.ts`: `prd` and `frd` checks, generalized from the Deputy run. Valid use cases and the number of principles are read from the project's `PRODUCT.md`. Tested in `test/check.test.ts` (good input passes, mutants fail); all 7 Deputy slices pass it.
- `templates/`: PRODUCT, PRD, FRD, DECISIONS, GLOSSARY.
- `skills/scriptorium/SKILL.md` and `.claude-plugin/plugin.json`.

## Next, in order

1. Write Scriptorium's own `docs/PRODUCT.md` with the chain itself, then PRDs for its slices (for example: checks, templates, plugin, team run). Use the tool on itself.
2. TP and ADR checks and templates, built while Deputy's TP is written, so they come from a real run.
3. Hooks: a `TaskCompleted` hook that runs the check named in the task; role agents (researcher, reviewer) with the briefs that worked (see below).
4. Make the technology word list configurable per project (marked `shortcut:` in `check.ts`).
5. Archive Mill with a pointer here, once the owner confirms.

## What the Deputy run taught (also reported on puppeteering issue #5)

- Two teammates of one role, told to "take the lowest free task", claimed the same task and overwrote one file, three times. Fix that worked: name each writer's slices in its spawn prompt, set the owner before spawning, forbid claiming. Zero collisions after that.
- Re-running the check, not reading the report, caught every collision.
- A check must state what it cannot see. Structural checks passed while reviewers still found contradictions between slices: keep the cross-slice review.
- Ask the owner in batches, with a recommendation for each question.

## Input from the Gauntlet retro (2026-11-17, another project of the owner)

The owner's Gauntlet project measured rework after agents started writing code: PRs passing review in round 1 fell from 43.6 % to 24.8 %, and 43 % of builder defects came from something the brief did not say. Its actionables are inputs for the specs step here:

- **ATDD belongs to implementation.** The FRDs' Given/When/Then tests are acceptance criteria; ATDD turns them into executable tests before the code. Owner decision, 2026-11-17: the chain is PRODUCT → PRDs → FRDs → cross-cutting TP (after the FRDs) → 1..N TPs per FRD (an ADR records the chosen one) → one spec per FRD → implementation with ATDD.
- **Rules arrive by themselves.** When a spec or brief is built, a script inserts the exact rules for the files it touches. A brief without that section is refused.
- **The builder lists what it assumed.** The reviewer checks each assumption; a report without the section is refused.
- **One row per changed branch,** with the mutant and the test that kills it.
- **Agent guides have a line cap** (for example 150), enforced by a check. Logs are history, never instructions.
- **Facts in a PR are generated,** never typed by hand.
