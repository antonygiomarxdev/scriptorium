# Research: preventing the missing negative example (C-1) without running mutants

Date: 2026-11-27. Read by the lead: the 49 open C-1 findings in docs/metrics/rework.md, and web sources. Constraint from the owner: no mutation run on a developer machine; it broke the owner's computer in another project.

## Summary

Nearly every C-1 finding is one pattern: a rule carries a qualifier ("only in the Decision section", "inside the project", "format 3", "one of six types") and no example breaks that qualifier alone, so a build that drops it passes every test. The gap is born in the FRD, and the reviewer finds it one round late by writing mutants by hand. The fix belongs where the gap is born: for each qualifier of a rule, write the near miss that breaks only it, and name the example that kills it. This is the category-partition method applied to rule text, and needs no execution.

## The 49 findings, by class

| Class | The near miss nobody wrote | Findings |
|---|---|---|
| scope | the same thing in another section, folder, slice or with another prefix | R-8, R-11, R-25, R-38, R-52, R-55, R-56, R-68, R-70, R-74, R-80 |
| variant | another format pin, line ending, case, bold, spacing, an optional parameter | R-2, R-3, R-5, R-37, R-53, R-75, R-78, R-82, R-85 |
| failure | the command fails, the file is missing, the run does not start | R-12, R-31, R-36, R-57, R-87 |
| absence | no line, no heading, an empty field, a deleted file | R-58, R-69, R-72 |
| enumeration | only one member of a list tested | R-13, R-49, R-61, R-77, R-84, R-86 |
| guard | removing a check or a step breaks nothing | R-7, R-10, R-14 |

The other findings (R-4, R-6, R-32, R-34, R-44, R-45, R-73, R-76, R-79, R-81, R-83, R-88) mix classes or are process failures filed under C-1.

## What the sources say

- Category-partition (Ostrand and Balcer, CACM 1988): from the specification, list each parameter's categories and the choices that should behave differently, mark error and single choices, and derive test frames. It works on the specification, before code. Its effect on fault detection is "relatively unknown" for selection criteria (Labiche 2026, arXiv 2601.12559): practice, not a measured result.
- Specification-level wrong readings with LLMs: SpecRL (arXiv 2604.05820) has a model propose plausible wrong outputs aimed at boundaries and corner cases; GPT-5 generated positive and negative instances that exposed wrong human-written Alloy specifications (arXiv 2510.23350). Neither is exactly this; both point at writing the near misses from the rule.
- Predictive mutation testing (Zhang et al., ISSTA 2016) predicts mutant results without running them, but needs a trained model and execution history: out of reach here.
- Running mutants (SWE-Mutation, arXiv 2605.22175; the project's own nightly job) finds the gaps after the code exists, at CPU cost. Kept as the nightly CI job only.

## What it means here

A near-miss table per FRD rule: the qualifier, its class, the near miss, and the negative or boundary example that kills it. A check finds qualifier words in each rule and fails a word with no row; it cannot judge whether the near miss is the one that matters, so the FRD reviewer reads the table. The verdict of REQ-22 then shows whether C-1 findings fall after it ships.

## Sources
- Ostrand, Balcer, "The category-partition method for specifying and generating functional tests", CACM 31(6), 1988.
- arXiv 2601.12559 (Labiche 2026); arXiv 2604.05820 (SpecRL); arXiv 2510.23350 (Alloy validation); arXiv 2605.22175 (SWE-Mutation); Zhang et al., "Predictive Mutation Testing", ISSTA 2016.
