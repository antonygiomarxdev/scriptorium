# FRD-12: Near misses for every behavior row

Status: Draft
Written by: lead (the session that coordinates this work)
Near misses by: near-miss writer (independent agent), 2026-11-27

## Summary

Every behavior row lists its near misses: for each trigger the row holds (a qualifier word, a list, a named section or file, a format, an input it reads, a number), the case that breaks only that trigger, its class, and the negative or boundary example that kills it. A row may cite a project-wide near miss from the cross-cutting register instead of repeating it. The table is written by an agent other than the FRD's author. The same table is required in a spec whose parent is a request, so the short path is held too. The FRD and spec checks find the triggers and fail one with no near miss. Nothing runs code.

Last change: 2026-11-27, v2 after the near-miss writer's review: quoted text holds no trigger, word forms, a boundary class, "or" for failure and absence, the pin date in the pin file

One feature of the [slice PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
[REQ-23](../../requests/REQ-23-near-misses-for-c1.md): C-1 has 49 open findings and no prevention ([research](../../research/2026-11-27-near-misses.md)). v1 read only the one-line rule texts; 12 of the 49 findings never passed through an FRD, and most qualifiers that slipped were not written as a qualifier word.

## Requirements covered
R-CHAIN-40.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-CHAIN-12-1 | IF | IF an FRD behavior row, or a row quoted by a spec whose parent is a request, holds a trigger of FR-CHAIN-12-2 and no Near misses row for that row id names the trigger, THEN the check of that document shall fail and name the row and the trigger. |
| FR-CHAIN-12-2 | always | Text in straight or curly double quotes or in backticks is named, not used, and shall hold no trigger; single quotes do not name. Outside it, the triggers shall always be: word, a whole word or phrase in any case from `only, each, every, any, all, inside, outside, within, before, after, same, other, except, unless, one of, at most, at least`; list, three or more items separated by commas with `or` or `and` before the last; scope, a word from `section, folder, file, path, directory`, singular or plural; variant, `format` followed by a number, or `pin` or `pinned`; input, a word from `read, reads, reading, run, runs, ran, call, calls, called`; boundary, a number in digits that is not part of an id (letters, a hyphen, then digits), a date such as 2026-12-01 counting as one number. |
| FR-CHAIN-12-3 | IF | IF a row holds the input trigger and its near misses lack a failure class or lack an absence class, THEN the check shall fail and name the row and each missing class. |
| FR-CHAIN-12-4 | IF | IF a Near misses row's Class, read in any case, is not one of scope, variant, failure, absence, enumeration, guard, boundary, or its Killed by cell is neither an example of the same document whose kind is negative or boundary nor a CC-n of the project's cross-cutting register with the same class, THEN the check shall fail and name the row and the cell; a CC-n cited when the register file is missing or cannot be read fails and names the file. |
| FR-CHAIN-12-5 | IF | IF a document with a Near misses table has no "Near misses by:" header line or no "Written by:" header line, or the two name the same writer once case and spaces are ignored, THEN the check shall fail and say which. |
| FR-CHAIN-12-6 | WHERE | WHERE a project is pinned below the format that adds these rules, the checks shall print these failures as warnings and pass. At that format they hold every document whose Status line shows an approval on or after the date the pin moved, which the migration writes into the project's pin file, and an older document from its next approval that changes its body; with no date in the pin file they hold every document, and a date that is not a valid YYYY-MM-DD fails the check and names the pin file. |
| FR-CHAIN-12-7 | always | The FRD and spec templates shall always hold the Near misses table and the "Written by:" and "Near misses by:" lines, the cross-cutting template shall hold a Class column, and the FRD skill shall always list the seven classes with their questions (`scope: does the same thing elsewhere behave the same?`, `variant: does another form of the same input?`, `failure: what if reading or running it fails?`, `absence: what if it is not there?`, `enumeration: every member, and one outside the list?`, `guard: does removing the check break a test?`, `boundary: what happens exactly at the edge?`) and say that another agent writes the table. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | Every trigger in a behavior row has its near miss, on the full path and on the short path. | FR-CHAIN-12-1, FR-CHAIN-12-2 |
| RULE-2 | A row that reads input names how that input can fail and be missing. | FR-CHAIN-12-3 |
| RULE-3 | A near miss names a known class and something that kills it. | FR-CHAIN-12-4 |
| RULE-4 | The author of the rows does not write their near misses. | FR-CHAIN-12-5 |
| RULE-5 | The rules hold from the pin move, and old documents when they change. | FR-CHAIN-12-6 |
| RULE-6 | The templates and the skill teach the table. | FR-CHAIN-12-7 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | negative | FR-X-1 reads "The ids come from the Decision section" and has no Near misses row | the FRD check runs | it fails with "FR-X-1: trigger scope (\"Decision section\") has no near miss" |
| EX-2 | RULE-1 | negative | FR-X-2 reads "the type is flowchart, graph, sequenceDiagram or classDiagram" and its only near miss is of class scope | the FRD check runs | it fails with "FR-X-2: trigger list has no near miss" |
| EX-3 | RULE-1 | negative | FR-X-3 reads "only the header line counts" and its only near miss names "header" | the FRD check runs | it fails with "FR-X-3: trigger word only has no near miss" |
| EX-4 | RULE-1 | negative | FR-X-4 reads "a project at format 3 fails" and has no variant near miss | the FRD check runs | it fails with "FR-X-4: trigger variant (format 3) has no near miss" |
| EX-5 | RULE-1 | positive | FR-X-1 with a scope row "the same id in another section", killed by EX-9, a negative example | the FRD check runs | it reports nothing for FR-X-1 |
| EX-6 | RULE-1 | boundary | FR-X-5 reads "Overall totals come first" | the FRD check runs | it reports no trigger for "all": a word inside another word is not one |
| EX-7 | RULE-1 | negative | A spec resting on a request quotes "- AF-2: CI runs only the changed tests" and has no Near misses table | the spec check runs | it fails with "AF-2: trigger word only has no near miss" |
| EX-8 | RULE-1 | boundary | A spec resting on an FRD quotes the same row and has no Near misses table | the spec check runs | it reports nothing about near misses: the FRD holds them |
| EX-9 | RULE-2 | negative | FR-X-6 reads "status reads the queue" and its near misses are of class scope only | the FRD check runs | it fails with "FR-X-6: input needs a failure and an absence near miss" |
| EX-10 | RULE-2 | positive | FR-X-6 with a failure row (the queue cannot be read) and an absence row (no queue file) | the FRD check runs | it reports nothing for FR-X-6 |
| EX-11 | RULE-3 | negative | A Near misses row has Class "edge" | the FRD check runs | it fails with "class edge is not one of scope, variant, failure, absence, enumeration, guard, boundary" |
| EX-12 | RULE-3 | negative | A Near misses row of FR-X-1 is killed by EX-5, a positive example | the FRD check runs | it fails with "FR-X-1: EX-5 is not a negative or boundary example" |
| EX-13 | RULE-3 | positive | A variant row of FR-X-4 is killed by CC-2, a cross-cutting row of class variant ("CRLF line endings") | the FRD check runs | it reports nothing for that row |
| EX-14 | RULE-3 | negative | A variant row is killed by CC-9, which the register does not hold | the FRD check runs | it fails with "CC-9 is not in the cross-cutting register" |
| EX-15 | RULE-4 | negative | An FRD with "Written by: researcher-1" and "Near misses by: researcher-1" | the FRD check runs | it fails with "the near misses are written by the author" |
| EX-16 | RULE-4 | positive | An FRD with "Written by: researcher-1" and "Near misses by: reviewer-1" | the FRD check runs | it reports nothing about the writer |
| EX-17 | RULE-4 | negative | An FRD with a Near misses table and no "Near misses by:" line | the FRD check runs | it fails with "no Near misses by line" |
| EX-18 | RULE-5 | boundary | A project pinned to format 4 and the FRD of EX-1 | the FRD check runs | it passes and prints "WARN (format 5):" with the EX-1 failure |
| EX-19 | RULE-5 | negative | The pin file holds format 5 and the date 2026-12-01, and the FRD of EX-1 was approved on 2026-12-02 | the FRD check runs | it fails with the EX-1 failure |
| EX-20 | RULE-5 | positive | The pin file holds format 5 and the date 2026-12-01, and an FRD approved on 2026-11-22 with no Near misses table, unchanged since | the FRD check runs | it passes with no warning about near misses |
| EX-21 | RULE-5 | negative | The FRD of EX-20 has its body changed and is approved again on 2026-12-03 | the FRD check runs | it fails with the EX-1 failure |
| EX-22 | RULE-6 | positive | The templates and the FRD skill as shipped | the template and skill tests run | the FRD and spec templates hold the Near misses header and the "Near misses by:" line, and the skill names the seven classes |
| EX-23 | RULE-6 | negative | A copy of the FRD skill with the line for "guard" removed | the template and skill tests run | they fail naming guard |
| EX-24 | RULE-1 | boundary | An FRD whose Summary reads "only the header line counts" and whose RULE-1 text reads "every id", with no trigger in any behavior row and no Near misses table | the FRD check runs | it reports nothing about near misses: a trigger outside the behavior rows is not one |
| EX-25 | RULE-1 | negative | A Near misses row for FR-X-2 names the trigger word only, and FR-X-3 reads "only the header line counts" and has no Near misses row | the FRD check runs | it fails with "FR-X-3: trigger word only has no near miss": a row for another id does not count |
| EX-26 | RULE-1 | negative | An FRD with FR-X-1 of EX-1 and no "## Near misses" section at all | the FRD check runs | it fails with the EX-1 failure |
| EX-27 | RULE-1 | negative | FR-X-7's Requirement cell holds an escaped pipe followed by the word only, and FR-X-7 has no Near misses row | the FRD check runs | it fails with "FR-X-7: trigger word only has no near miss": an escaped pipe does not end the cell |
| EX-28 | RULE-1 | negative | Rows FR-W-1 to FR-W-17, each holding a single trigger, one of the 17 words and phrases of FR-CHAIN-12-2, with no Near misses rows | the FRD check runs | it fails 17 times, each naming its row and its word |
| EX-29 | RULE-1 | negative | FR-X-3 reads "Only the header line counts" and FR-X-8 reads "AT LEAST two rows", with no Near misses rows | the FRD check runs | it fails with "FR-X-3: trigger word only has no near miss" and "FR-X-8: trigger word at least has no near miss" |
| EX-30 | RULE-1 | boundary | FR-X-9 reads "most rows are kept" and FR-X-10 reads "it is one row" | the FRD check runs | it reports no trigger for either: a part of "at most" or "one of" is not one |
| EX-31 | RULE-1 | boundary | FR-X-11 reads "flowchart or graph" and FR-X-12 reads "the types `flowchart`, `graph` and `pie`" | the FRD check runs | it reports no list trigger for either: two plain items are not a list, and items in backticks are named, not used |
| EX-32 | RULE-1 | negative | FR-L-1 reads "the change, the date and the count" and FR-L-2 reads "the change, the date, the count, or the cause", with no Near misses rows | the FRD check runs | it fails with "FR-L-1: trigger list has no near miss" and "FR-L-2: trigger list has no near miss" |
| EX-33 | RULE-1 | negative | Rows FR-S-1 "the Decision section", FR-S-2 "the reports folders", FR-S-3 "the queue file", FR-S-4 "the given paths" and FR-S-5 "two directories", with no Near misses rows | the FRD check runs | it fails 5 times with trigger scope, each naming its row and its word |
| EX-34 | RULE-1 | boundary | FR-X-13 reads "in the format the summary parses" | the FRD check runs | it reports no variant trigger: the word format with no number after it is not one |
| EX-35 | RULE-1 | negative | FR-X-14 reads "a lower pin warns" and FR-X-20 reads "a project pinned below", with no Near misses rows | the FRD check runs | it fails with "FR-X-14: trigger variant (pin) has no near miss" and "FR-X-20: trigger variant (pinned) has no near miss" |
| EX-36 | RULE-1 | negative | Rows FR-I-1 to FR-I-9, each holding one of read, reads, reading, run, runs, ran, call, calls and called as its single trigger, with no Near misses rows | the FRD check runs | it fails 9 times with "trigger input has no near miss", each naming its row |
| EX-37 | RULE-2 | negative | FR-X-6 reads "status reads the queue" and has a failure row and no absence row, and FR-X-15 reads "status reads the log" and has an absence row and no failure row | the FRD check runs | it fails with "FR-X-6: input has no absence near miss" and "FR-X-15: input has no failure near miss" |
| EX-38 | RULE-2 | negative | FR-X-6 of EX-9 has scope rows only, and FR-X-15 has a failure row and an absence row | the FRD check runs | it fails with "FR-X-6: input needs a failure and an absence near miss": the rows of FR-X-15 do not count for FR-X-6 |
| EX-39 | RULE-2 | boundary | FR-X-5 reads "The ids come from the Decision section" and has one scope row, killed by a negative example, and no failure or absence row | the FRD check runs | it reports nothing for FR-X-5: it holds no input trigger |
| EX-40 | RULE-3 | boundary | Seven Near misses rows of FR-X-1, of class Scope, VARIANT, failure, absence, enumeration, guard and boundary, four killed by a negative example and three by a boundary example | the FRD check runs | it reports nothing for those rows: the class is read in any case |
| EX-41 | RULE-3 | negative | Three Near misses rows of FR-X-1, killed by FRD-11/EX-3, a negative example of another FRD, by EX-90, which this FRD does not hold, and by an empty cell | the FRD check runs | it fails three times, naming FR-X-1 and the cells "FRD-11/EX-3", "EX-90" and the empty one |
| EX-42 | RULE-3 | negative | A scope row of FR-X-1 is killed by CC-2, a cross-cutting row of class variant | the FRD check runs | it fails with "FR-X-1: CC-2 is of class variant, not scope" |
| EX-43 | RULE-3 | negative | A variant row is killed by CC-2, and docs/CROSS-CUTTING.md cannot be read | the FRD check runs | it fails and names docs/CROSS-CUTTING.md |
| EX-44 | RULE-3 | negative | A variant row is killed by CC-2, and the project has no docs/CROSS-CUTTING.md | the FRD check runs | it fails and names docs/CROSS-CUTTING.md |
| EX-45 | RULE-4 | negative | An FRD with a Near misses table, no "Near misses by:" line in its header, and the line "Near misses by: reviewer-1" in the body of its Near misses section | the FRD check runs | it fails with "no Near misses by line": a body line is not the header line |
| EX-46 | RULE-4 | negative | An FRD with "Written by: researcher-1" and "Near misses by:  Researcher-1 " | the FRD check runs | it fails with "the near misses are written by the author": case and spaces do not make another writer |
| EX-47 | RULE-4 | negative | An FRD with a Near misses table, "Near misses by: reviewer-1" and no "Written by:" line | the FRD check runs | it fails with "no Written by line" |
| EX-48 | RULE-4 | boundary | An FRD with no Near misses table, no trigger in its behavior rows, and neither a "Written by:" nor a "Near misses by:" line | the FRD check runs | it reports nothing about the writer |
| EX-49 | RULE-5 | boundary | The pin file holds format 5 and the date 2026-12-01, and the FRD of EX-1 was approved on 2026-12-01 | the FRD check runs | it fails with the EX-1 failure: the day the pin moved counts |
| EX-50 | RULE-5 | negative | The pin file holds format 5 and the date 2026-12-01, and the spec of EX-7 was approved on 2026-12-02 | the spec check runs | it fails with the EX-7 failure |
| EX-51 | RULE-5 | boundary | The FRD of EX-20 is approved again on 2026-12-03 with only its Status line changed | the FRD check runs | it passes with no warning about near misses: its body did not change |
| EX-52 | RULE-6 | negative | Six copies: the FRD template and the spec template, each with one of the Near misses table, the "Written by:" line and the "Near misses by:" line removed | the template and skill tests run | they fail six times, each naming the template and the part removed |
| EX-53 | RULE-6 | negative | A copy of the cross-cutting template with its Class column removed | the template and skill tests run | they fail naming the cross-cutting template and Class |
| EX-54 | RULE-6 | negative | Seven copies of the FRD skill, each with the line for one of the seven classes removed | the template and skill tests run | they fail seven times, each naming its class |
| EX-55 | RULE-6 | negative | Seven copies of the FRD skill, each with the question of one class removed, and a copy with the sentence that another agent writes the table removed | the template and skill tests run | they fail eight times, naming each class whose question is gone and the writer sentence |
| EX-56 | RULE-1 | boundary | FR-X-18 holds the word only in double quotes and the word each in backticks, and names docs/metrics and hooks.json with no scope word | the FRD check runs | it reports no trigger for FR-X-18: quoted text is named, not used, and a path or file name is not a scope word |
| EX-57 | RULE-1 | negative | FR-X-19 holds the word only in single quotes and has no Near misses row | the FRD check runs | it fails with "FR-X-19: trigger word only has no near miss": only double quotes and backticks name a word |
| EX-58 | RULE-1 | negative | FR-X-16 reads "the last 10 reviews count" and FR-X-21 reads "from 2026-12-01 on", with no Near misses rows | the FRD check runs | it fails with "FR-X-16: trigger boundary (10) has no near miss" and "FR-X-21: trigger boundary (2026-12-01) has no near miss" |
| EX-59 | RULE-1 | boundary | FR-X-17 reads "ten reviews, as CHECK-9 says" | the FRD check runs | it reports no boundary trigger: a number in words, or the digits of an id, are not one |
| EX-60 | RULE-3 | boundary | A variant row of an FRD in docs/chain/frd is killed by CC-2, which the project's docs/CROSS-CUTTING.md holds with class variant, and the check runs from docs/chain | the FRD check runs | it reports nothing for that row: the register is the project's, not the folder's |
| EX-61 | RULE-4 | boundary | An FRD with "Written by: researcher-1" and "Near misses by: researcher-2" | the FRD check runs | it reports nothing about the writer: only case and spaces are ignored |
| EX-62 | RULE-5 | negative | The pin file holds format 5 and no date, and the FRD of EX-20 | the FRD check runs | it fails with the EX-1 failure: with no date every document is held |
| EX-63 | RULE-5 | negative | The pin file holds format 5 and the date 2026-12-01, written in a commit of 2026-12-05, and the FRD of EX-1 approved on 2026-12-02 | the FRD check runs | it fails with the EX-1 failure: the date in the pin file decides, not the commit's |
| EX-64 | RULE-6 | negative | A copy of the project with no FRD skill file, and one whose FRD skill file cannot be read | the template and skill tests run | they fail twice, each naming the skill file |

## Near misses
| Row | Trigger | Class | Near miss | Killed by |
|---|---|---|---|---|
| FR-CHAIN-12-1 | implicit: behavior row | scope | A trigger word in the Summary or a RULE text, not in a behavior row, made to need a near miss | EX-24 |
| FR-CHAIN-12-1 | implicit: for that row id | scope | A Near misses row for FR-X-2 names only, and is taken as covering FR-X-3, which holds only and has none | EX-25 |
| FR-CHAIN-12-1 | implicit: names the trigger | enumeration | The row has a Near misses row, but it names another of its triggers (header, not only) | EX-3 |
| FR-CHAIN-12-1 | implicit: spec whose parent is a request | scope | The same quoted row in a spec resting on an FRD, not on a request, made to need its own table | EX-8 |
| FR-CHAIN-12-2 | word only, each, every, any, all, inside, outside, within, before, after, same, other, except, unless | enumeration | A row whose single trigger is one of these words, a member no other example uses | EX-28 |
| FR-CHAIN-12-2 | word one of, at most | variant | One or most alone read as the phrase | EX-30 |
| FR-CHAIN-12-2 | word at least; implicit: in any case | variant | AT LEAST in capitals, or Only at the start of a sentence, not found | EX-29 |
| FR-CHAIN-12-2 | implicit: a whole word | variant | all inside Overall taken as a trigger | EX-6 |
| FR-CHAIN-12-2 | implicit: text in double quotes or backticks holds no trigger | scope | A word in double quotes or backticks, or a path or file name with no scope word, taken as a trigger as in v1 | EX-56 |
| FR-CHAIN-12-2 | implicit: double quotes | variant | A word in single quotes treated as named | EX-57 |
| FR-CHAIN-12-2 | list | variant | and, or a comma before or, before the last item | EX-32 |
| FR-CHAIN-12-2 | implicit: three or more items | boundary | Two plain items, or items in backticks, taken as a list | EX-31 |
| FR-CHAIN-12-2 | scope (section, folder, file, path, directory) | enumeration | A row whose single scope word is folders, file, paths or directories, plural forms included | EX-33 |
| FR-CHAIN-12-2 | variant (pin, pinned) | enumeration | A row whose single variant trigger is pin or pinned | EX-35 |
| FR-CHAIN-12-2 | implicit: format followed by a number | variant | The word format with no number after it taken as a trigger | EX-34 |
| FR-CHAIN-12-2 | input (read, reads, reading, run, runs, ran, call, calls, called) | enumeration | A row whose single input word is another form than reads, ran or called among them | EX-36 |
| FR-CHAIN-12-2 | input | failure | The Requirement cell holds an escaped pipe; a split at it drops the text after it, and the trigger there | EX-27 |
| FR-CHAIN-12-2 | input | absence | The FRD has no Near misses section at all, and the check passes or crashes instead of failing each trigger | EX-26 |
| FR-CHAIN-12-2 | implicit: boundary, a number written in digits | variant | A number or a date in digits, 10 or 2026-12-01, not found | EX-58 |
| FR-CHAIN-12-2 | implicit: a number written in digits | boundary | Ten in words, or the digits of an id such as CHECK-9, taken as a number | EX-59 |
| FR-CHAIN-12-3 | word each (each missing class) | enumeration | Both classes missing and only one named | EX-9 |
| FR-CHAIN-12-3 | implicit: lack a failure class or lack an absence class | absence | A failure row and no absence row, or the reverse, passed | EX-37 |
| FR-CHAIN-12-3 | implicit: its near misses | scope | Failure and absence rows of another row id counted for this one | EX-38 |
| FR-CHAIN-12-3 | implicit: holds the input trigger | guard | A row with no input trigger and no failure or absence row made to fail | EX-39 |
| FR-CHAIN-12-4 | word one of; list (the seven classes); input (read in any case) | enumeration | A valid class in another case, Scope or VARIANT, or the new member boundary, rejected | EX-40 |
| FR-CHAIN-12-4 | word one of | enumeration | A class outside the seven, edge, accepted | EX-11 |
| FR-CHAIN-12-4 | implicit: negative or boundary | enumeration | A row killed by a positive example accepted | EX-12 |
| FR-CHAIN-12-4 | word same (same document); implicit: its Killed by cell | scope | FRD-11/EX-3 matched by its EX number alone, EX-90 the FRD does not hold, or an empty cell, accepted | EX-41 |
| FR-CHAIN-12-4 | word same (same class) | enumeration | CC-2 of class variant accepted on a row of class scope | EX-42 |
| FR-CHAIN-12-4 | input (cannot be read) | failure | The register cannot be read, and the check crashes or does not name the file | EX-43 |
| FR-CHAIN-12-4 | input; scope (the register file is missing) | absence | There is no register file, and the check says only that CC-2 is not held, not naming the file | EX-44 |
| FR-CHAIN-12-4 | scope (file) | scope | The register looked up in the folder the check runs from, not in the project | EX-60 |
| FR-CHAIN-12-4 | implicit: a CC-n of the register | absence | CC-9, which the register does not hold, accepted | EX-14 |
| FR-CHAIN-12-5 | implicit: header line | scope | The Near misses by line in the body of the Near misses section, not in the header | EX-45 |
| FR-CHAIN-12-5 | implicit: no Near misses by header line | absence | A Near misses table and no such line anywhere | EX-17 |
| FR-CHAIN-12-5 | implicit: no Written by header line | absence | No Written by line, so nothing to compare, passed | EX-47 |
| FR-CHAIN-12-5 | word same; implicit: case and spaces are ignored | variant | The same writer with another case and spaces taken as another writer | EX-46 |
| FR-CHAIN-12-5 | implicit: case and spaces are ignored | boundary | Normalizing more than case and spaces, so researcher-2 counts as researcher-1 | EX-61 |
| FR-CHAIN-12-5 | implicit: a document with a Near misses table | guard | A document with no table and no trigger made to need the lines | EX-48 |
| FR-CHAIN-12-6 | word every (every document approved on or after) | enumeration | A spec resting on a request, not an FRD, left exempt | EX-50 |
| FR-CHAIN-12-6 | word every (with no date in the pin file) | absence | A pin file with no date, and old documents still exempt | EX-62 |
| FR-CHAIN-12-6 | word after (on or after) | boundary | Approved on the day the pin moved, not after it, left exempt | EX-49 |
| FR-CHAIN-12-6 | variant (pinned, pin) | variant | A project pinned at the format itself, 5, treated as below it | EX-19 |
| FR-CHAIN-12-6 | implicit: below the format, warnings and pass | guard | A project pinned below fails instead of warning | EX-18 |
| FR-CHAIN-12-6 | scope (file: the date in the pin file) | variant | The date of the commit that wrote the pin file used instead of the date written in it | EX-63 |
| FR-CHAIN-12-6 | implicit: from its next approval that changes its body | scope | Approved again with only its Status line changed, and held | EX-51 |
| FR-CHAIN-12-6 | implicit: an older document | guard | An older document whose body changed and was approved again stays exempt | EX-21 |
| FR-CHAIN-12-7 | word same, every, outside (in the questions) | enumeration | A class whose question is missing, for a class other than absence | EX-55 |
| FR-CHAIN-12-7 | input (reading) | failure | The FRD skill file cannot be read, and the tests crash or pass | EX-64 |
| FR-CHAIN-12-7 | input (reading) | absence | There is no FRD skill file, and the tests pass | EX-64 |
| FR-CHAIN-12-7 | implicit: both templates hold the table and the two lines | absence | One part missing from one template, the spec template included | EX-52 |
| FR-CHAIN-12-7 | implicit: the cross-cutting template's Class column | absence | The cross-cutting template without its Class column | EX-53 |
| FR-CHAIN-12-7 | implicit: the seven classes | enumeration | The line for a class other than guard, boundary included, removed | EX-54 |
| FR-CHAIN-12-7 | implicit: says that another agent writes the table | absence | The skill without that sentence | EX-55 |

### Coverage waivers
None.

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
| QC-2 | Performance efficiency | The near-miss rules add under 50 ms to the check of the longest FRD in this repository, measured in one test; no code under test is run. |
| QC-3 | Compatibility | n/a: the checks read one document at a time, as today. |
| QC-4 | Interaction capability | Every failure names the row, and the trigger, class, example or register row involved. |
| QC-5 | Reliability | A cross-cutting register that cannot be read fails the check and names the file. |
| QC-6 | Security | n/a: it reads files inside the project only. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | The triggers are fixed by FR-CHAIN-12-2; changing them needs an owner decision. |
| QC-9 | Safety | n/a: endangers nobody. |

## Cross-cutting
n/a until this FRD's specs create docs/CROSS-CUTTING.md; its first rows are the project-wide variants of the C-1 findings: CRLF line endings, a path outside the project, a run from another folder, a lower format pin.

## Information
An FRD's behavior rows and examples, or a spec's quoted rows when its parent is a request; the Near misses table (row, trigger, class, near miss, killed by); the "Written by:" and "Near misses by:" lines; the cross-cutting register (id, class, rule); the date the pin moved. Each example named in Killed by is covered by a test through the existing trace scan.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given FR-X-1 reads "The ids come from the Decision section" and has no Near misses row, when the FRD check runs, then it fails with "FR-X-1: trigger scope (\"Decision section\") has no near miss".
- **AC-2** (EX-2): Given FR-X-2 reads "the type is flowchart, graph, sequenceDiagram or classDiagram" and its only near miss is of class scope, when the FRD check runs, then it fails with "FR-X-2: trigger list has no near miss".
- **AC-3** (EX-3): Given FR-X-3 reads "only the header line counts" and its only near miss names "header", when the FRD check runs, then it fails with "FR-X-3: trigger word only has no near miss".
- **AC-4** (EX-4): Given FR-X-4 reads "a project at format 3 fails" and has no variant near miss, when the FRD check runs, then it fails with "FR-X-4: trigger variant (format 3) has no near miss".
- **AC-5** (EX-5): Given FR-X-1 with a scope row "the same id in another section", killed by EX-9, a negative example, when the FRD check runs, then it reports nothing for FR-X-1.
- **AC-6** (EX-6): Given FR-X-5 reads "Overall totals come first", when the FRD check runs, then it reports no trigger for "all": a word inside another word is not one.
- **AC-7** (EX-7): Given A spec resting on a request quotes "- AF-2: CI runs only the changed tests" and has no Near misses table, when the spec check runs, then it fails with "AF-2: trigger word only has no near miss".
- **AC-8** (EX-8): Given A spec resting on an FRD quotes the same row and has no Near misses table, when the spec check runs, then it reports nothing about near misses: the FRD holds them.
- **AC-9** (EX-9): Given FR-X-6 reads "status reads the queue" and its near misses are of class scope only, when the FRD check runs, then it fails with "FR-X-6: input needs a failure and an absence near miss".
- **AC-10** (EX-10): Given FR-X-6 with a failure row (the queue cannot be read) and an absence row (no queue file), when the FRD check runs, then it reports nothing for FR-X-6.
- **AC-11** (EX-11): Given A Near misses row has Class "edge", when the FRD check runs, then it fails with "class edge is not one of scope, variant, failure, absence, enumeration, guard, boundary".
- **AC-12** (EX-12): Given A Near misses row of FR-X-1 is killed by EX-5, a positive example, when the FRD check runs, then it fails with "FR-X-1: EX-5 is not a negative or boundary example".
- **AC-13** (EX-13): Given A variant row of FR-X-4 is killed by CC-2, a cross-cutting row of class variant ("CRLF line endings"), when the FRD check runs, then it reports nothing for that row.
- **AC-14** (EX-14): Given A variant row is killed by CC-9, which the register does not hold, when the FRD check runs, then it fails with "CC-9 is not in the cross-cutting register".
- **AC-15** (EX-15): Given An FRD with "Written by: researcher-1" and "Near misses by: researcher-1", when the FRD check runs, then it fails with "the near misses are written by the author".
- **AC-16** (EX-16): Given An FRD with "Written by: researcher-1" and "Near misses by: reviewer-1", when the FRD check runs, then it reports nothing about the writer.
- **AC-17** (EX-17): Given An FRD with a Near misses table and no "Near misses by:" line, when the FRD check runs, then it fails with "no Near misses by line".
- **AC-18** (EX-18): Given A project pinned to format 4 and the FRD of EX-1, when the FRD check runs, then it passes and prints "WARN (format 5):" with the EX-1 failure.
- **AC-19** (EX-19): Given The pin file holds format 5 and the date 2026-12-01, and the FRD of EX-1 was approved on 2026-12-02, when the FRD check runs, then it fails with the EX-1 failure.
- **AC-20** (EX-20): Given The pin file holds format 5 and the date 2026-12-01, and an FRD approved on 2026-11-22 with no Near misses table, unchanged since, when the FRD check runs, then it passes with no warning about near misses.
- **AC-21** (EX-21): Given The FRD of EX-20 has its body changed and is approved again on 2026-12-03, when the FRD check runs, then it fails with the EX-1 failure.
- **AC-22** (EX-22): Given The templates and the FRD skill as shipped, when the template and skill tests run, then the FRD and spec templates hold the Near misses header and the "Near misses by:" line, and the skill names the seven classes.
- **AC-23** (EX-23): Given A copy of the FRD skill with the line for "guard" removed, when the template and skill tests run, then they fail naming guard.
- **AC-24** (EX-24): Given An FRD whose Summary reads "only the header line counts" and whose RULE-1 text reads "every id", with no trigger in any behavior row and no Near misses table, when the FRD check runs, then it reports nothing about near misses: a trigger outside the behavior rows is not one.
- **AC-25** (EX-25): Given A Near misses row for FR-X-2 names the trigger word only, and FR-X-3 reads "only the header line counts" and has no Near misses row, when the FRD check runs, then it fails with "FR-X-3: trigger word only has no near miss": a row for another id does not count.
- **AC-26** (EX-26): Given An FRD with FR-X-1 of EX-1 and no "## Near misses" section at all, when the FRD check runs, then it fails with the EX-1 failure.
- **AC-27** (EX-27): Given FR-X-7's Requirement cell holds an escaped pipe followed by the word only, and FR-X-7 has no Near misses row, when the FRD check runs, then it fails with "FR-X-7: trigger word only has no near miss": an escaped pipe does not end the cell.
- **AC-28** (EX-28): Given Rows FR-W-1 to FR-W-17, each holding a single trigger, one of the 17 words and phrases of FR-CHAIN-12-2, with no Near misses rows, when the FRD check runs, then it fails 17 times, each naming its row and its word.
- **AC-29** (EX-29): Given FR-X-3 reads "Only the header line counts" and FR-X-8 reads "AT LEAST two rows", with no Near misses rows, when the FRD check runs, then it fails with "FR-X-3: trigger word only has no near miss" and "FR-X-8: trigger word at least has no near miss".
- **AC-30** (EX-30): Given FR-X-9 reads "most rows are kept" and FR-X-10 reads "it is one row", when the FRD check runs, then it reports no trigger for either: a part of "at most" or "one of" is not one.
- **AC-31** (EX-31): Given FR-X-11 reads "flowchart or graph" and FR-X-12 reads "the types `flowchart`, `graph` and `pie`", when the FRD check runs, then it reports no list trigger for either: two plain items are not a list, and items in backticks are named, not used.
- **AC-32** (EX-32): Given FR-L-1 reads "the change, the date and the count" and FR-L-2 reads "the change, the date, the count, or the cause", with no Near misses rows, when the FRD check runs, then it fails with "FR-L-1: trigger list has no near miss" and "FR-L-2: trigger list has no near miss".
- **AC-33** (EX-33): Given Rows FR-S-1 "the Decision section", FR-S-2 "the reports folders", FR-S-3 "the queue file", FR-S-4 "the given paths" and FR-S-5 "two directories", with no Near misses rows, when the FRD check runs, then it fails 5 times with trigger scope, each naming its row and its word.
- **AC-34** (EX-34): Given FR-X-13 reads "in the format the summary parses", when the FRD check runs, then it reports no variant trigger: the word format with no number after it is not one.
- **AC-35** (EX-35): Given FR-X-14 reads "a lower pin warns" and FR-X-20 reads "a project pinned below", with no Near misses rows, when the FRD check runs, then it fails with "FR-X-14: trigger variant (pin) has no near miss" and "FR-X-20: trigger variant (pinned) has no near miss".
- **AC-36** (EX-36): Given Rows FR-I-1 to FR-I-9, each holding one of read, reads, reading, run, runs, ran, call, calls and called as its single trigger, with no Near misses rows, when the FRD check runs, then it fails 9 times with "trigger input has no near miss", each naming its row.
- **AC-37** (EX-37): Given FR-X-6 reads "status reads the queue" and has a failure row and no absence row, and FR-X-15 reads "status reads the log" and has an absence row and no failure row, when the FRD check runs, then it fails with "FR-X-6: input has no absence near miss" and "FR-X-15: input has no failure near miss".
- **AC-38** (EX-38): Given FR-X-6 of EX-9 has scope rows only, and FR-X-15 has a failure row and an absence row, when the FRD check runs, then it fails with "FR-X-6: input needs a failure and an absence near miss": the rows of FR-X-15 do not count for FR-X-6.
- **AC-39** (EX-39): Given FR-X-5 reads "The ids come from the Decision section" and has one scope row, killed by a negative example, and no failure or absence row, when the FRD check runs, then it reports nothing for FR-X-5: it holds no input trigger.
- **AC-40** (EX-40): Given Seven Near misses rows of FR-X-1, of class Scope, VARIANT, failure, absence, enumeration, guard and boundary, four killed by a negative example and three by a boundary example, when the FRD check runs, then it reports nothing for those rows: the class is read in any case.
- **AC-41** (EX-41): Given Three Near misses rows of FR-X-1, killed by FRD-11/EX-3, a negative example of another FRD, by EX-90, which this FRD does not hold, and by an empty cell, when the FRD check runs, then it fails three times, naming FR-X-1 and the cells "FRD-11/EX-3", "EX-90" and the empty one.
- **AC-42** (EX-42): Given A scope row of FR-X-1 is killed by CC-2, a cross-cutting row of class variant, when the FRD check runs, then it fails with "FR-X-1: CC-2 is of class variant, not scope".
- **AC-43** (EX-43): Given A variant row is killed by CC-2, and docs/CROSS-CUTTING.md cannot be read, when the FRD check runs, then it fails and names docs/CROSS-CUTTING.md.
- **AC-44** (EX-44): Given A variant row is killed by CC-2, and the project has no docs/CROSS-CUTTING.md, when the FRD check runs, then it fails and names docs/CROSS-CUTTING.md.
- **AC-45** (EX-45): Given An FRD with a Near misses table, no "Near misses by:" line in its header, and the line "Near misses by: reviewer-1" in the body of its Near misses section, when the FRD check runs, then it fails with "no Near misses by line": a body line is not the header line.
- **AC-46** (EX-46): Given An FRD with "Written by: researcher-1" and "Near misses by:  Researcher-1 ", when the FRD check runs, then it fails with "the near misses are written by the author": case and spaces do not make another writer.
- **AC-47** (EX-47): Given An FRD with a Near misses table, "Near misses by: reviewer-1" and no "Written by:" line, when the FRD check runs, then it fails with "no Written by line".
- **AC-48** (EX-48): Given An FRD with no Near misses table, no trigger in its behavior rows, and neither a "Written by:" nor a "Near misses by:" line, when the FRD check runs, then it reports nothing about the writer.
- **AC-49** (EX-49): Given The pin file holds format 5 and the date 2026-12-01, and the FRD of EX-1 was approved on 2026-12-01, when the FRD check runs, then it fails with the EX-1 failure: the day the pin moved counts.
- **AC-50** (EX-50): Given The pin file holds format 5 and the date 2026-12-01, and the spec of EX-7 was approved on 2026-12-02, when the spec check runs, then it fails with the EX-7 failure.
- **AC-51** (EX-51): Given The FRD of EX-20 is approved again on 2026-12-03 with only its Status line changed, when the FRD check runs, then it passes with no warning about near misses: its body did not change.
- **AC-52** (EX-52): Given Six copies: the FRD template and the spec template, each with one of the Near misses table, the "Written by:" line and the "Near misses by:" line removed, when the template and skill tests run, then they fail six times, each naming the template and the part removed.
- **AC-53** (EX-53): Given A copy of the cross-cutting template with its Class column removed, when the template and skill tests run, then they fail naming the cross-cutting template and Class.
- **AC-54** (EX-54): Given Seven copies of the FRD skill, each with the line for one of the seven classes removed, when the template and skill tests run, then they fail seven times, each naming its class.
- **AC-55** (EX-55): Given Seven copies of the FRD skill, each with the question of one class removed, and a copy with the sentence that another agent writes the table removed, when the template and skill tests run, then they fail eight times, naming each class whose question is gone and the writer sentence.
- **AC-56** (EX-56): Given FR-X-18 holds the word only in double quotes and the word each in backticks, and names docs/metrics and hooks.json with no scope word, when the FRD check runs, then it reports no trigger for FR-X-18: quoted text is named, not used, and a path or file name is not a scope word.
- **AC-57** (EX-57): Given FR-X-19 holds the word only in single quotes and has no Near misses row, when the FRD check runs, then it fails with "FR-X-19: trigger word only has no near miss": only double quotes and backticks name a word.
- **AC-58** (EX-58): Given FR-X-16 reads "the last 10 reviews count" and FR-X-21 reads "from 2026-12-01 on", with no Near misses rows, when the FRD check runs, then it fails with "FR-X-16: trigger boundary (10) has no near miss" and "FR-X-21: trigger boundary (2026-12-01) has no near miss".
- **AC-59** (EX-59): Given FR-X-17 reads "ten reviews, as CHECK-9 says", when the FRD check runs, then it reports no boundary trigger: a number in words, or the digits of an id, are not one.
- **AC-60** (EX-60): Given A variant row of an FRD in docs/chain/frd is killed by CC-2, which the project's docs/CROSS-CUTTING.md holds with class variant, and the check runs from docs/chain, when the FRD check runs, then it reports nothing for that row: the register is the project's, not the folder's.
- **AC-61** (EX-61): Given An FRD with "Written by: researcher-1" and "Near misses by: researcher-2", when the FRD check runs, then it reports nothing about the writer: only case and spaces are ignored.
- **AC-62** (EX-62): Given The pin file holds format 5 and no date, and the FRD of EX-20, when the FRD check runs, then it fails with the EX-1 failure: with no date every document is held.
- **AC-63** (EX-63): Given The pin file holds format 5 and the date 2026-12-01, written in a commit of 2026-12-05, and the FRD of EX-1 approved on 2026-12-02, when the FRD check runs, then it fails with the EX-1 failure: the date in the pin file decides, not the commit's.
- **AC-64** (EX-64): Given A copy of the project with no FRD skill file, and one whose FRD skill file cannot be read, when the template and skill tests run, then they fail twice, each naming the skill file.
