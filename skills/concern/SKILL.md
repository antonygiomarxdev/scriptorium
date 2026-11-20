---
name: concern
description: Add or check a row of docs/CROSS-CUTTING.md: a concern every FRD must answer (security, privacy, accessibility, languages, performance budget), with its rule and check. Use when a new concern applies to every feature.
argument-hint: <concern name>
---

# A cross-cutting concern

A cross-cutting concern applies to every feature, so it is written once and every FRD answers it: "CC-n applies (how)" or "n/a: <reason>". The template ships five rows: security, privacy, accessibility, languages, performance budget.

Never overwrite an existing file. If `docs/CROSS-CUTTING.md` exists, read it and add a row; copy `${CLAUDE_PLUGIN_ROOT}/templates/CROSS-CUTTING.md` only when it does not exist. Worked example: `${CLAUDE_PLUGIN_ROOT}/examples/larder/docs/CROSS-CUTTING.md`.

Argument: $ARGUMENTS is the concern. Ask for it if missing.

1. Read `docs/CROSS-CUTTING.md`. Stop if a row already covers it.
2. Add the row: next ID (`CC-n`), the concern, the rule, the check. Fill the Rule and Check of the template's five rows too: an empty Rule fails the lint.
3. Add the answer to every existing FRD's Cross-cutting section, and ask the owner before you write an "n/a".

## How to write a row

- **Concern**: one word or phrase the whole team uses (`docs/GLOSSARY.md`).
- **Rule**: what every feature must do. Bad: "Be secure." Good: "A family reads and changes only its own records; every request is checked against the signed-in family."
- **Check**: the test or lint that fails when a feature breaks the rule. Bad: "ask in review". Good: "`bun test test/access.test.ts` runs one request per route as another family and expects not found."
- Do not repeat the rule inside FRDs. An FRD says "CC-1 applies: bookings" and cites the id.
- A concern only one slice has belongs in that slice's PRD, not here.

## Summary (D-24)

`## Summary` sits in the first 20 lines and ends with `Last change: YYYY-MM-DD, <what>`. Update it when you add or change a row.

## Finish

Show the owner the new row and the FRDs that now answer it, then stop. A registry has no Status: the owner reviews the new row in the pull request.

## Checks

```bash
bun "${CLAUDE_PLUGIN_ROOT}/scripts/lint-docs.ts" .
```

The lint fails a row with an empty Rule cell.
