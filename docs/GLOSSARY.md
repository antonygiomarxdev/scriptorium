# Glossary

| Term | Meaning |
|---|---|
| Chain | The ordered documents a product is written in: PRODUCT, PRDs, FRDs, TPs, ADRs, specs. |
| Step | One document type in the chain. |
| Slice | An independent part of a product, with its own PRD and FRDs. |
| Gate | The rule that a document is approved only when its check passes, its questions are closed, and the document it rests on is approved. |
| Owner | The person who decides what the product is and approves its documents. |
| Short path | The route for a small change: a spec on an existing FRD, without a new PRD or FRD. |
| Mapping | Writing draft documents from existing code, to see what the product really does. |
| Gap | A difference between what a document says and what the code does. |
| Drift | An approved document whose upstream document changed after its approval. |
| Grilling | A session in which the agent asks the owner one question at a time, each with a recommended answer, until a document has no open question. |
| Run | One agent session working on the chain; each run logs its questions, rework and findings. |
