# scriptorium

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
