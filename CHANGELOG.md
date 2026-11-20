# scriptorium

## 0.4.0

### Minor Changes

- 57fc949: Where `.changeset/config.json` exists, the pre-commit hook fails a commit that changes code without a changeset; `bunx changeset --empty` marks a change no user notices.
- d6329f5: A `scriptorium` command runs every check outside Claude Code (`scriptorium status`, `lint`, `trace`, `migrate`, `install`, `pre-commit`), so CI and other agents can pin it by version. `scriptorium install` keeps the git hook in the committed `.scriptorium/` folder.
- 8fd8435: Approval records what a document said and what it rested on. `check.ts approve` writes an Approval line; `status`, the edit and Stop hooks, the pre-commit hook and CI fail an approved document whose body was edited or whose parent changed, until the owner approves again or runs `check.ts clear`.
- d115f85: New skills `/scriptorium:fix` (a bug or small change as one small spec on an FRD) and `/scriptorium:ops` (CI, configuration, dependencies and refactors as small specs on a TP, ADR, CHECKS row or request). `/scriptorium:review` reviews one spec's work: its rows are the criteria and its files the scope.
- 349da26: An agent can no longer edit code or configuration unless an approved spec names the file and the spec's FRD rows already have tests. The same rule runs on staged files in pre-commit. Format 1 projects only get a warning.
- 8fd8435: `check.ts history <doc>` prints a document's commits from git, the commit that approved it and the ids changed since.
- 8fd8435: The docs lint fails a document that carries a version number; git and release tags are the history.
- d6329f5: Each project pins the format of its rules in `.scriptorium/config.json`; a project with no pin keeps the rules of 0.3.0, so this update breaks nobody. Rules of a newer format print `WARN (format N): ...` until the project migrates with `scriptorium migrate` or `/scriptorium:migrate`. Format 2 holds the small spec rules, the coverage scan, the version-line lint and the changeset rule.
- 57fc949: Specs are small: one agent run each, with a `Rests on:` parent, the rows it builds quoted verbatim (`check.ts excerpt` prints them, the check proves them), at most 80 lines and 3 files, tests first and one done command. `check.ts done <spec>` runs that command for an approved spec. Existing specs must be split into this format; the Larder example shows how.
- 57fc949: Every chain document may be `Status: Superseded by <path> (YYYY-MM-DD)`: status lists it, drift and trace skip it, and an approved document still resting on it fails.
- 8fd8435: Tests carry `covers: slice/FRD-NN/ID` tags, and `check.ts trace` fails dead tags and approved examples, states or invariants nobody tests unless the FRD waives them with a reason. It runs in pre-commit and CI only, so unfinished tests do not block work in progress.

### Patch Changes

- c4bfa25: The edit hook reads the document path it is given with either slash, so a Windows path is recognised on every system.
- f9da579: The git hook no longer runs `bunx scriptorium`: that name on npm belongs to another project, so the hook could download and run someone else's code. It now runs `$SCRIPTORIUM_CLI`, or the path `install` writes to the untracked `.scriptorium/local`, and fails with "run scriptorium install" when it has neither. The package is renamed `@antonygiomarxdev/scriptorium`.
- 3fd8447: The migrate dry run lists every failure under the next format, lint and coverage included, so applying it never moves the pin past an unlisted failure.
- 3fd8447: Pre-commit blocks a commit that lowers the format pin, which would switch newer rules off. The edit gate refuses a test tag from another slice, and refuses an edit when the hook itself fails.
- 8fd8435: The release workflow tags and publishes only after the Version Packages pull request is merged, never from its branch.
- 8fd8435: `check.ts trace` scans files and slices in sorted order, so its output is the same on Windows and Linux.
- 3eb5965: The skills explain why the process runs in its order, each step with the evidence behind it, and the FRD, spec and review skills ask for the negative examples and Holds rows whose absence caused most review findings.

## 0.3.0

### Minor Changes

- effa6a6: CI fails a pull request that changes a chain document's body but not its Summary, unless the PR body says "Summary unchanged: <file or all>, <reason>".

### Patch Changes

- ab673fe: Checks: a TP is approved only when the cross-cutting TP and every ADR it cites are; lint fails dead link anchors and Replay paths that do not exist.

## 0.2.0

### Minor Changes

- 4286a2c: Checks follow the new layout and templates: `prd`, `frd`, `ux`, `tp`, `spec`, `status` and `summary`. FRDs are checked for EARS rows, examples per rule and quality criteria; specs for the ids their tasks test first; `status` for open questions under an approval.
- eafd945: Add one skill per chain step (init, prd, frd, tp, spec, status), an adopt skill that maps a project's existing documents to the chain and migrates them only after the owner approves the plan, and a marketplace manifest so the plugin installs from GitHub. Skills never overwrite an existing file.
- 22a4906: One skill per document type (request, PRD, FRD, UX, TP, ADR, spec, decision, glossary, invariant, concern, check, review, retro), each with a worked example; adopt migrates into docs/<slice>/ with the new templates.
- 8ae044f: Rules hold without the agent choosing to run them: plugin hooks check a document after each edit and run the status and lint before the agent stops, a git pre-commit script runs the same checks on staged documents, and CI runs them on every pull request.
- 5d1a8fe: New `scripts/lint-docs.ts`: fails documents that use banned phrases, link to missing files, hold filler sections, pass their line cap, leave a registry cell empty or copy a sentence from the PRD or PRODUCT.
- d48aa57: New templates and layout under docs/: every document opens with a kept-current summary; FRDs carry EARS behavior, rules with positive and negative examples, decision tables, states, invariants and measurable quality criteria; new REQUEST, UX, INVARIANTS, CROSS-CUTTING, CHECKS and RETRO templates.

### Patch Changes

- 9f99303: `check.ts status .` shows each document's full path instead of cutting its first letter.
