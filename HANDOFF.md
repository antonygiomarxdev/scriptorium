# Handoff

The product now lives in its own chain: [docs/PRODUCT.md](docs/PRODUCT.md), [docs/DECISIONS.md](docs/DECISIONS.md), [docs/GLOSSARY.md](docs/GLOSSARY.md) and [docs/research/](docs/research/). Read those first.

## Next, in order

1. The `chain` slice: folder layout under `docs/` (D-16) and the templates of the decided model (L-7 to L-11), then the checks.
2. Move the checks from `src/<slice>/docs/` to `docs/<slice>/`.
3. The other slices: intake, ux, questions, adopt, metrics, package.
4. Absorb each decision into the document it governs (L-5), so DECISIONS.md stays an inbox.

## What the Deputy run taught about team runs

- Two teammates told to "take the lowest free task" claimed the same task three times. Name each writer's slices in its spawn prompt, set the owner before spawning, forbid claiming.
- Re-running the check, not reading the report, caught every collision.
- Structural checks passed while reviewers still found contradictions between slices: keep the cross-slice review.
- Ask the owner in batches, with a recommendation for each question.
