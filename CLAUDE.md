# Developing Scriptorium

Scriptorium is a checked document chain (PRODUCT → PRD → FRDs → TP → ADRs → specs) packaged as a Claude Code plugin. Read [HANDOFF.md](HANDOFF.md) first.

- Runtime and test runner: Bun. No build step. `bun test` and `bun run typecheck` before each commit.
- Checks live in `scripts/check.ts`. Every new check gets a test where good input passes and a mutant fails.
- Use Scriptorium on itself: its own product documents follow the chain.
- Team runs follow [puppeteering](https://github.com/antonygiomarxdev/puppeteering). Findings about team practice go there as field-report issues.
- Commits: Conventional Commits, small. No `Co-Authored-By` or other attribution lines, in commits or pull requests.
- English for code, docs and commits.
