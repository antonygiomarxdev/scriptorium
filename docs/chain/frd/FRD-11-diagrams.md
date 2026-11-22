# FRD-11: Diagrams where they explain

Status: Draft

## Summary

A TP draws its architecture, a UX document draws each flow, and an FRD with states draws them, each as a Mermaid block that GitHub renders with no tool installed. One page of practices says which diagram answers which question and how to keep it readable, and the checks lint what text can show.

Last change: 2026-11-22, first draft

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
[REQ-15](../../requests/REQ-15-diagrams-where-they-explain.md).

## Requirements covered
R-CHAIN-38.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-11-1 | IF | IF a TP's Architecture section, a UX document's Flows section, or an FRD's States section that is not "n/a: <reason>" holds no Mermaid block, THEN its check shall fail and name the section. |
| FR-CHAIN-11-2 | IF | IF a Mermaid block opens with a diagram type other than flowchart, graph, sequenceDiagram, stateDiagram-v2, erDiagram or classDiagram, THEN the docs lint shall fail and name the type. |
| FR-CHAIN-11-3 | IF | IF a Mermaid label holds an HTML tag, or a node label holds one of ( ) [ ] { } : without double quotes around it, or a node is named "end" in lowercase, THEN the docs lint shall fail and name the line. |
| FR-CHAIN-11-4 | WHEN | WHEN a Mermaid block has more than 15 nodes, the docs lint shall warn and name it, and not fail. |
| FR-CHAIN-11-5 | always | The skills for PRODUCT, PRD, FRD, UX and TP shall always link the page of diagram practices, which keeps a diagram optional in PRODUCT and PRD. |
| FR-CHAIN-11-6 | WHERE | WHERE a project is pinned to a format before the one that adds these rules, the checks shall print each failure as a warning and pass. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | A diagram is required where it carries the content. | FR-CHAIN-11-1, FR-CHAIN-11-5 |
| RULE-2 | A diagram renders on GitHub with nothing installed. | FR-CHAIN-11-2, FR-CHAIN-11-3 |
| RULE-3 | A diagram stays small. | FR-CHAIN-11-4 |
| RULE-4 | A new rule warns until the project migrates. | FR-CHAIN-11-6 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | negative | A TP whose Architecture section is two paragraphs of prose | the TP check runs | it fails with "Architecture has no Mermaid block" |
| EX-2 | RULE-1 | positive | An FRD whose States section says "n/a: nothing here keeps state." | the FRD check runs | it reports nothing for States |
| EX-3 | RULE-1 | negative | A UX document whose Flows section lists steps as bullets | the UX check runs | it fails with "Flows has no Mermaid block" |
| EX-4 | RULE-2 | negative | A TP draws its architecture with "architecture-beta" | the docs lint runs | it fails with "Mermaid type architecture-beta is not one GitHub is known to render" |
| EX-5 | RULE-2 | negative | A flowchart node reads A[Book (slot)] | the docs lint runs | it fails naming the line and asking for double quotes |
| EX-6 | RULE-2 | positive | A flowchart node reads A["Book (slot)"] | the docs lint runs | it reports nothing for that line |
| EX-7 | RULE-3 | boundary | A flowchart with 16 nodes | the docs lint runs | it warns "16 nodes, keep a diagram at 15 or fewer" and passes |
| EX-8 | RULE-4 | boundary | A project pinned to format 3 and a TP with no Mermaid block | the TP check runs | it passes and prints the failure as a warning |
| EX-9 | RULE-3 | positive | A sequenceDiagram with 6 participants and 9 messages | the docs lint runs | it reports nothing for that block |
| EX-10 | RULE-4 | positive | A project pinned to the format that adds these rules and a TP whose Architecture holds a quoted flowchart | the TP check runs | it passes with no warning |

## Decision table
n/a: each rule is one condition; the examples cover them.

## States
n/a: nothing here keeps state.

## Invariants
n/a: the repository keeps no invariants register yet; the rules are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | n/a: the checks read one document at a time, as today. |
| QC-3 | Compatibility | Every diagram the rules accept renders on github.com, checked once by hand on the README and the larder example. |
| QC-4 | Interaction capability | Every failure names the document, the section or the line, and what to write instead. |
| QC-5 | Reliability | n/a: a wrong result only fails a check or a report. |
| QC-6 | Security | n/a: it reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | n/a: nothing here is configured. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
A Mermaid block, its diagram type, its node labels and node count, and the section that holds it.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given A TP whose Architecture section is two paragraphs of prose, when the TP check runs, then it fails with "Architecture has no Mermaid block".
- **AC-2** (EX-2): Given An FRD whose States section says "n/a: nothing here keeps state.", when the FRD check runs, then it reports nothing for States.
- **AC-3** (EX-3): Given A UX document whose Flows section lists steps as bullets, when the UX check runs, then it fails with "Flows has no Mermaid block".
- **AC-4** (EX-4): Given A TP draws its architecture with "architecture-beta", when the docs lint runs, then it fails with "Mermaid type architecture-beta is not one GitHub is known to render".
- **AC-5** (EX-5): Given A flowchart node reads A[Book (slot)], when the docs lint runs, then it fails naming the line and asking for double quotes.
- **AC-6** (EX-6): Given A flowchart node reads A["Book (slot)"], when the docs lint runs, then it reports nothing for that line.
- **AC-7** (EX-7): Given A flowchart with 16 nodes, when the docs lint runs, then it warns "16 nodes, keep a diagram at 15 or fewer" and passes.
- **AC-8** (EX-8): Given A project pinned to format 3 and a TP with no Mermaid block, when the TP check runs, then it passes and prints the failure as a warning.
- **AC-9** (EX-9): Given A sequenceDiagram with 6 participants and 9 messages, when the docs lint runs, then it reports nothing for that block.
- **AC-10** (EX-10): Given A project pinned to the format that adds these rules and a TP whose Architecture holds a quoted flowchart, when the TP check runs, then it passes with no warning.
