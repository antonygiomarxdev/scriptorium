# Scriptorium

Write the product before the code.

Spec-driven development starts at the spec. Scriptorium is the layer above it: what the product is, what each part must do, how it will be built and why, and only then the specs. Each document rests on the one before, and a check stops you from moving on until it holds.

```
PRODUCT → PRDs → FRDs → cross-cutting TP → TPs per FRD → specs → code (ATDD)
                         └── ADRs record each choice ──┘
```

| Document | Says |
|---|---|
| **Product** | The problem, the users, numbered principles, use cases, scope, and the slices |
| **PRD** (per slice) | What the slice must do, as testable requirements |
| **FRDs** (per feature) | Behavior, edge cases and acceptance tests; together they cover every PRD requirement |
| **Cross-cutting TP** | How the whole product is built: technology, storage, conventions, threat model. Written after the FRDs |
| **TPs per FRD** | One or more proposals for one feature, compared |
| **ADRs** | One decision each: which proposal won and why |
| **Spec** (per FRD) | The concrete technical changes a builder makes |
| **Code** | Built with ATDD: the FRD's acceptance criteria become tests first |

PRDs and FRDs name no technology. Owner decisions are kept in a decision log, and shared terms in a glossary.

It is built to run with agent teams, following [puppeteering](https://github.com/antonygiomarxdev/puppeteering): agents write and review each step, and the person who owns the product decides.

## Status

Early. Working today: the PRD and FRD checks, the templates, and a Claude Code plugin with one skill. The TP, ADR and spec checks are next. First used on [Deputy](https://github.com/antonygiomarxdev/deputy).

## Use

As a Claude Code plugin, from this repository. Or run the checks directly with [Bun](https://bun.sh):

```bash
bun scripts/check.ts prd src/inbox/docs/PRD.md INBOX
bun scripts/check.ts frd src/inbox INBOX
```

Exit 0 passes. Exit 1 prints every failure, for example:

```
FAIL FRD-01-summary.md: cites R-INBOX-9, not in the PRD
FAIL PRD requirement R-INBOX-3 is covered by no FRD
```

Templates for every document are in [`templates/`](templates/).

## Develop

```bash
bun install
bun test
bun run typecheck
```

## License

MIT
