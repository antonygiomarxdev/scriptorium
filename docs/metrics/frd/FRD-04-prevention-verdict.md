# FRD-04: A verdict for every prevention

Status: Draft
Written by: lead (the session that coordinates this work)
Near misses by: near-miss writer (independent agent), 2026-11-27

## Summary

The rework report gives each cause that has a prevention one verdict, computed and never written by hand, from two signals that do not depend on one another: findings of the cause per review logged, and surviving mutants per night from the nightly job's reports, which run in CI only. Every review logs a row, clean ones too, so a queue that stops being fed shows. Signals that disagree, too few reviews since, or a prevention that names more than one check give confounded. Status fails a finding whose cause was moved without a reason, and a cause table that keeps a count by hand.

Last change: 2026-11-27, v2 after the near-miss writer's review: the review window defined, Reviews rows without counts, which files are reports, several checks by id, moves against the first cause

One feature of the [metrics PRD](../PRD.md). No technology names. Every row has an id; tests, specs and review findings cite the ids.

## Why
[REQ-22](../../requests/REQ-22-a-verdict-for-every-prevention.md). v1 counted findings per week, so a quiet week read as helped; the queue got 41, 36, 13 and 1 findings on four days and none since, so reviewer effort alone would decide the verdict; the cause table says C-1 has 24 open findings where the check counts 49.

## Requirements covered
R-METRICS-10.

## Behavior

| ID | Pattern | Requirement |
|---|---|---|
| FR-METRICS-04-1 | IF | IF the queue has no Reviews table THEN status shall warn; IF a Reviews row has an empty change, or a date that is not a real calendar date written YYYY-MM-DD, THEN status shall fail and name the row by its number in the table. A Reviews row is one review of a change: the change and the review's date, clean reviews included. |
| FR-METRICS-04-2 | IF | IF an approved spec has a test tagged with one of its rows and the Reviews table has no row for it, THEN status shall warn and name the spec. |
| FR-METRICS-04-3 | WHEN | WHEN the rework report runs, it shall print one line per cause with a prevention, its date empty or not: the cause, the prevention, the verdict, and each signal's numbers before and since the prevention's date. |
| FR-METRICS-04-4 | always | The review signal shall always be: reviews ordered by date, and by their row order within one date; before, the last 10 reviews dated before the prevention's date, or all of them when there are fewer; since, the reviews dated on or after it; a finding counts on the side of its change's first review, by its own date when its change has no review, and not at all when that review falls in neither window; the rate is the cause's findings on a side divided by that side's reviews. |
| FR-METRICS-04-5 | WHERE | WHERE the report is given a folder of the nightly job's mutation reports, the nightly signal shall be the mean surviving mutants per night before the prevention's date and since it; a report is a file directly in the folder, its extension .json in any case, its name starting with its night as YYYY-MM-DD; reports of one night are summed into that night; another file or an unreadable report is named and left out, a folder that does not exist fails the report, and fewer than 3 nights on a side drops the nightly signal. |
| FR-METRICS-04-6 | always | A signal's verdict shall always be helped when its rate since is at most half its rate before and the rate before is above 0, hurt when its rate since is above its rate before, and no observed effect otherwise. |
| FR-METRICS-04-7 | IF | IF the prevention cell holds more than one distinct CHECK-n id, its date is empty or after the report's date, fewer than 5 reviews lie on either side, or the two signals give different verdicts, THEN the verdict shall be confounded; with one signal, the verdict is that signal's, marked "one signal". |
| FR-METRICS-04-8 | IF | IF a finding's cause differs from the first cause it had in the queue's history and its text holds no "moved from C-n:" naming that first cause exactly as the causes table writes it and followed by a reason, THEN status shall fail and name the finding; a project with no history reports no moved finding. |
| FR-METRICS-04-9 | IF | IF a column header of the causes table starts with "Open" in any case once spaces are trimmed, THEN status shall fail and say the report prints the counts. Counts written in prose are not checked. |
| FR-METRICS-04-10 | IF | IF the queue has no history to read, a project outside a git repository included, THEN the report shall print "no history: no verdict" once and no verdict line. |

## Rules and examples

| Rule | Text | Covers |
|---|---|---|
| RULE-1 | Every review is logged, clean ones too, so silence shows. | FR-METRICS-04-1, FR-METRICS-04-2 |
| RULE-2 | Each prevention gets one computed verdict from rates, not counts. | FR-METRICS-04-3, FR-METRICS-04-4, FR-METRICS-04-6, FR-METRICS-04-10 |
| RULE-3 | A second signal that reviewer effort cannot move checks the first. | FR-METRICS-04-5, FR-METRICS-04-7 |
| RULE-4 | The numbers cannot be moved by hand. | FR-METRICS-04-8, FR-METRICS-04-9 |

| Example | Rule | Kind | Given | When | Then |
|---|---|---|---|---|---|
| EX-1 | RULE-1 | negative | SPEC-08-12 is approved, test/kinds.test.ts carries a covers tag of one of its rows, and the Reviews table has no SPEC-08-12 row | status runs | it warns "SPEC-08-12 was built and has no review row" |
| EX-2 | RULE-1 | positive | The same spec with a Reviews row "SPEC-08-12, 2026-11-23" | status runs | it reports nothing about SPEC-08-12 |
| EX-3 | RULE-1 | boundary | An approved spec with no test tagged with its rows and no Reviews row | status runs | it reports nothing: it is not built yet |
| EX-4 | RULE-2 | positive | C-1, prevention CHECK-9 since 2026-12-01; 8 C-1 findings in the 10 reviews before; 1 in the 10 since | the rework report runs | it prints "C-1 CHECK-9: helped, one signal (reviews: before 0.8 per review over 10, since 0.1 over 10)" |
| EX-5 | RULE-2 | negative | The same counts, but 6 of the reviews since were logged in one week and 4 the week after | the rework report runs | it prints the same rates: weeks do not enter the rate |
| EX-6 | RULE-2 | negative | C-1, CHECK-9 since 2026-12-01; a C-1 finding dated 2026-11-30, whose change has no review, added to the queue in a commit of 2026-12-02 | the rework report runs | it counts that finding before: the finding's date decides, not the commit's |
| EX-7 | RULE-2 | negative | 4 C-1 findings in the 10 reviews before, 4 in the 10 since | the rework report runs | it prints no observed effect |
| EX-8 | RULE-2 | negative | 2 C-1 findings in the 10 reviews before, 6 in the 10 since | the rework report runs | it prints hurt |
| EX-9 | RULE-2 | boundary | 4 C-1 findings in the 10 reviews before, 2 in the 10 since | the rework report runs | it prints helped: exactly half counts |
| EX-10 | RULE-2 | boundary | 0 C-1 findings before and 0 since | the rework report runs | it prints no observed effect: nothing to improve on is not helped |
| EX-11 | RULE-2 | negative | A project whose queue file is in no commit | the rework report runs | it prints "no history: no verdict" once and no verdict line |
| EX-12 | RULE-3 | positive | The counts of EX-4, and nightly reports with a mean of 12 survivors over 5 nights before and 3 over 4 nights since | the rework report runs with the reports folder | it prints "C-1 CHECK-9: helped (reviews: 0.8 to 0.1; nightly: 12 to 3)" |
| EX-13 | RULE-3 | negative | The counts of EX-4, and nightly means of 12 before and 12 since | the rework report runs with the reports folder | it prints confounded: the signals disagree |
| EX-14 | RULE-3 | boundary | The counts of EX-4, and nightly reports for 2 nights since | the rework report runs with the reports folder | it ignores the nightly signal and prints "helped, one signal" |
| EX-15 | RULE-3 | negative | The counts of EX-4, but only 4 reviews logged since | the rework report runs | it prints confounded |
| EX-16 | RULE-3 | negative | Prevention "CHECK-9, CHECK-10" and the counts of EX-4 | the rework report runs | it prints confounded |
| EX-17 | RULE-4 | negative | R-55 had cause C-1 at an earlier commit and has C-2 now, with no "moved from" text | status runs | it fails with "R-55: cause moved from C-1 with no reason" |
| EX-18 | RULE-4 | positive | R-55 has C-2 and its text holds "moved from C-1: the spec, not the FRD, missed it" | status runs | it reports nothing about R-55 |
| EX-19 | RULE-4 | negative | The causes table has a column "Open" | status runs | it fails with "the causes table keeps counts by hand; the rework report prints them" |
| EX-20 | RULE-1 | negative | A Reviews row with an empty change and the date 2026-11-23, the second row of the table | status runs | it fails with "Reviews row 2: empty change" |
| EX-21 | RULE-2 | boundary | C-1, CHECK-9 since 2026-12-01; 4 C-1 findings in the 10 reviews before; 10 clean reviews since, with no C-1 finding | the rework report runs | it prints "C-1 CHECK-9: helped, one signal (reviews: before 0.4 per review over 10, since 0 over 10)": clean reviews count |
| EX-22 | RULE-2 | boundary | The counts of EX-4, where two of the 10 reviews since are of SPEC-08-12, dated 2026-12-02 and 2026-12-04 | the rework report runs | it prints the line of EX-4: each review is one row, not each change |
| EX-23 | RULE-1 | boundary | SPEC-08-12 is a Draft, test/kinds.test.ts carries a covers tag of one of its rows, and the Reviews table has no SPEC-08-12 row | status runs | it reports nothing about SPEC-08-12: only an approved spec is checked |
| EX-24 | RULE-1 | negative | SPEC-08-1 is approved, a test carries a covers tag of one of its rows, and the Reviews table holds a SPEC-08-12 row and no SPEC-08-1 row | status runs | it warns "SPEC-08-1 was built and has no review row" |
| EX-25 | RULE-1 | boundary | SPEC-08-12 is approved, the only covers tag in the tests is of a row of SPEC-08-1, and the Reviews table has no SPEC-08-12 row | status runs | it reports nothing about SPEC-08-12: a tag of another spec does not build it |
| EX-26 | RULE-1 | negative | A queue with no Reviews table | status runs | it warns "the queue has no Reviews table" and does not fail |
| EX-27 | RULE-2 | negative | The counts of EX-13 | the rework report runs with the reports folder | it prints "C-1 CHECK-9: confounded (reviews: 0.8 to 0.1; nightly: 12 to 12)": a confounded line keeps the prevention and each signal's numbers |
| EX-28 | RULE-2 | boundary | C-1 with prevention CHECK-9 since 2026-12-01 and the counts of EX-4, and C-2 with prevention "none" | the rework report runs | it prints one verdict line, for C-1, and none for C-2 |
| EX-29 | RULE-2 | negative | A project whose folder is not a git repository | the rework report runs | it prints "no history: no verdict" once and no verdict line |
| EX-30 | RULE-2 | boundary | C-1, CHECK-9 since 2026-12-01; a Reviews row dated 2026-12-01 with a C-1 finding of its change, and a nightly report 2026-12-01.json | the rework report runs with the reports folder | it counts the review, the finding and the night since: the prevention's own date is on the since side |
| EX-31 | RULE-2 | negative | C-1, CHECK-9 since 2026-12-01; 12 reviews before, 5 C-1 findings of changes reviewed in the 2 oldest of them and 2 of changes reviewed in the last 10; 1 C-1 finding in the 10 since | the rework report runs | it prints "before 0.2 per review over 10": only the last 10 reviews before count |
| EX-32 | RULE-2 | negative | The counts of EX-4, and 5 C-2 findings in the 10 reviews since | the rework report runs | it prints the line of EX-4 for C-1: findings of another cause do not enter its rate |
| EX-33 | RULE-3 | boundary | The counts of EX-4, and nightly reports with a mean of 12 survivors over 3 nights before and 3 over 3 nights since | the rework report runs with the reports folder | it prints "C-1 CHECK-9: helped (reviews: 0.8 to 0.1; nightly: 12 to 3)": 3 nights each is enough |
| EX-34 | RULE-3 | boundary | The counts of EX-4, and nightly reports for 2 nights before and 4 since | the rework report runs with the reports folder | it ignores the nightly signal and prints "helped, one signal" |
| EX-35 | RULE-3 | negative | The reports of EX-12, and one more report of a night since that cannot be read | the rework report runs with the reports folder | it names that report, leaves it out, and prints the line of EX-12 |
| EX-36 | RULE-3 | negative | The counts of EX-4, and a reports folder holding only README.md and nightly-2026-12-02.json | the rework report runs with the reports folder | it names both as not mutation reports and prints "helped, one signal" |
| EX-37 | RULE-3 | negative | The counts of EX-4, and a reports folder path that does not exist | the rework report runs with that folder | it fails and names the folder |
| EX-38 | RULE-2 | negative | 0 C-1 findings in the 10 reviews before, 3 in the 10 since | the rework report runs | it prints hurt: a rate before of 0 stops helped, not hurt |
| EX-39 | RULE-2 | negative | 4 C-1 findings in the 10 reviews before, 3 in the 10 since | the rework report runs | it prints no observed effect: lower but above half is not helped |
| EX-40 | RULE-3 | negative | Prevention "CHECK-9 and CHECK-10" and the counts of EX-4 | the rework report runs | it prints confounded |
| EX-41 | RULE-3 | boundary | C-1, CHECK-9 since 2026-12-01; 8 C-1 findings in the 10 reviews before, 0 in exactly 5 reviews since | the rework report runs | it prints "helped, one signal": 5 reviews since are enough |
| EX-42 | RULE-4 | negative | R-55 had cause C-1 at an earlier commit and has C-2 now, and its text ends with "moved from C-1:" | status runs | it fails with "R-55: cause moved from C-1 with no reason" |
| EX-43 | RULE-4 | negative | R-55 had cause C-1 at an earlier commit and has C-2 now with no "moved from" text, and the text of R-56 holds "moved from C-1: the spec missed it" | status runs | it fails with "R-55: cause moved from C-1 with no reason" |
| EX-44 | RULE-4 | negative | R-55 had cause C-1 three commits ago and C-2 from two commits ago, the last commit changed only R-60, and R-55's text holds no "moved from" | status runs | it fails with "R-55: cause moved from C-1 with no reason": the first cause decides, not the last commit |
| EX-45 | RULE-4 | boundary | R-90 was added in the last commit with cause C-2 and no "moved from" text | status runs | it reports nothing about R-90: a new finding had no earlier cause |
| EX-46 | RULE-4 | boundary | A project whose folder is not a git repository, and R-55 with cause C-2 and no "moved from" text | status runs | it reports nothing about R-55: with no history, no cause moved |
| EX-47 | RULE-4 | negative | The causes table has a column "Open findings" | status runs | it fails with "the causes table keeps counts by hand; the rework report prints them" |
| EX-48 | RULE-4 | boundary | The Reviews table has a column "Open" and the causes table has none | status runs | it reports nothing about counts by hand: only the causes table is checked |
| EX-49 | RULE-2 | negative | C-1 and C-2, each with a prevention, and a queue file in no commit | the rework report runs | it prints "no history: no verdict" once and no verdict line |
| EX-50 | RULE-1 | negative | A Reviews row "SPEC-08-12, 23/11/2026" | status runs | it fails with "Reviews row SPEC-08-12: 23/11/2026 is not YYYY-MM-DD" |
| EX-51 | RULE-2 | boundary | C-1, CHECK-9 since 2026-12-01; 6 reviews before with 3 C-1 findings; 1 C-1 finding in the 10 since | the rework report runs | it prints "before 0.5 per review over 6": fewer than 10 reviews before are all used |
| EX-52 | RULE-2 | negative | C-1, CHECK-9 since 2026-12-01; a C-1 finding dated 2026-11-28 of change SPEC-08-12, whose review is dated 2026-12-02 | the rework report runs | it counts that finding since: its change's review decides, not its own date |
| EX-53 | RULE-3 | boundary | Prevention "CHECK-9 (the near-miss check)" and the counts of EX-4 | the rework report runs | it prints "helped, one signal": one CHECK-n id is one check |
| EX-54 | RULE-3 | negative | The counts of EX-4 with an empty since cell for C-1, and again with since 2027-01-01 for a report run on 2026-12-10 | the rework report runs | it prints confounded both times |
| EX-55 | RULE-3 | negative | C-1, CHECK-9 since 2026-12-01; only 4 reviews before, with 3 C-1 findings, and 10 since with 1 | the rework report runs | it prints confounded: fewer than 5 reviews lie before |
| EX-56 | RULE-4 | negative | R-55 had cause C-1 first, then C-2, and has C-3 now, and its text holds "moved from C-2: the spec missed it" | status runs | it fails with "R-55: cause moved from C-1 with no reason": the move must name the first cause |
| EX-57 | RULE-4 | boundary | R-55 had cause C-1 first, then C-2, and has C-1 again now, with no "moved from" text | status runs | it reports nothing about R-55: its cause is its first cause |
| EX-58 | RULE-4 | boundary | A cause of the causes table whose text starts with "Open questions" | status runs | it reports nothing about counts by hand: only a column header counts |

## Near misses
| Row | Trigger | Class | Near miss | Killed by |
|---|---|---|---|---|
| FR-METRICS-04-1 | implicit: no Reviews table, status warns | absence | A queue with no Reviews table failing status, or passing it silently | EX-26 |
| FR-METRICS-04-1 | implicit: an empty change | absence | A Reviews row with an empty change accepted | EX-20 |
| FR-METRICS-04-1 | implicit: a date that is not YYYY-MM-DD | variant | A date written 23/11/2026 accepted | EX-50 |
| FR-METRICS-04-1 | implicit: clean reviews included | enumeration | Reviews with no finding left out of the reviews logged, so 10 clean reviews since read as 0 and give confounded | EX-21 |
| FR-METRICS-04-1 | implicit: one review of a change | scope | Two reviews of the same change counted as one review | EX-22 |
| FR-METRICS-04-2 | word one of | scope | The only covers tag is of a row of SPEC-08-1, whose id is a prefix, and is taken as building SPEC-08-12 | EX-25 |
| FR-METRICS-04-2 | implicit: an approved spec | enumeration | A Draft spec with a tagged test and no Reviews row warned | EX-23 |
| FR-METRICS-04-2 | implicit: no row for it | scope | A Reviews row of SPEC-08-12 taken as the row of SPEC-08-1 by prefix | EX-24 |
| FR-METRICS-04-2 | implicit: has a test tagged | absence | An approved spec with no tagged test warned | EX-3 |
| FR-METRICS-04-3 | input (runs) | failure | The history cannot be read: the folder is not a git repository | EX-29 |
| FR-METRICS-04-3 | input (runs) | absence | The queue file is in no commit | EX-11 |
| FR-METRICS-04-3 | word each; list (the cause, the prevention, the verdict, and each signal's numbers) | absence | A confounded line drops the prevention or the nightly numbers | EX-27 |
| FR-METRICS-04-3 | word before | boundary | A review, finding or night dated on the prevention's own date put on the before side | EX-30 |
| FR-METRICS-04-3 | implicit: one line per cause with a prevention | enumeration | A cause whose prevention is none gets a line | EX-28 |
| FR-METRICS-04-4 | boundary (10); word before | boundary | The 11th and 12th reviews before, and their findings, counted | EX-31 |
| FR-METRICS-04-4 | word all (all of them when there are fewer) | boundary | With 6 reviews before, the rate taken over 10, or none given | EX-51 |
| FR-METRICS-04-4 | word after (on or after it) | boundary | A review dated on the prevention's date put before | EX-30 |
| FR-METRICS-04-4 | implicit: on the side of its change's review | scope | A finding placed by its own date although its change was reviewed on the other side | EX-52 |
| FR-METRICS-04-4 | implicit: by its own date when its change has no review | variant | The date of the commit that added the finding used instead of its own date | EX-6 |
| FR-METRICS-04-4 | implicit: divided by that side's reviews | variant | Rates per week instead of per review | EX-5 |
| FR-METRICS-04-4 | implicit: the cause's findings | scope | Findings of C-2 in the same reviews counted for C-1 | EX-32 |
| FR-METRICS-04-5 | scope (folder, file) | scope | A file in the folder that is not a .json report, README.md, read as a night | EX-36 |
| FR-METRICS-04-5 | implicit: a name that starts with its night as YYYY-MM-DD | variant | nightly-2026-12-02.json, whose name does not start with the date, read as a night | EX-36 |
| FR-METRICS-04-5 | word before | boundary | A night named for the prevention's own date put on the before side | EX-30 |
| FR-METRICS-04-5 | boundary (3) | boundary | Exactly 3 nights on each side treated as too few | EX-33 |
| FR-METRICS-04-5 | implicit: on a side (before) | scope | Only 2 nights before, not since, and the nightly signal kept | EX-34 |
| FR-METRICS-04-5 | implicit: on a side (since) | boundary | Only 2 nights since and the nightly signal kept | EX-14 |
| FR-METRICS-04-5 | list (another file or an unreadable report, a missing folder, and fewer than 3 nights) | failure | A report that cannot be read crashes the report or drops the whole signal | EX-35 |
| FR-METRICS-04-5 | implicit: a folder that does not exist | absence | The given folder does not exist, and the report silently gives one signal | EX-37 |
| FR-METRICS-04-6 | word at most | boundary | Exactly half treated as not helped | EX-9 |
| FR-METRICS-04-6 | boundary (0) | boundary | 0 before and 0 since read as helped | EX-10 |
| FR-METRICS-04-6 | implicit: the rate before is above 0, for helped only | scope | The above-0 condition applied to hurt as well, so 0 before and 3 since read as no observed effect | EX-38 |
| FR-METRICS-04-6 | implicit: above its rate before | boundary | Equal rates read as hurt | EX-7 |
| FR-METRICS-04-6 | list (helped, hurt, no observed effect) | enumeration | A rate since lower than before but above half read as helped | EX-39 |
| FR-METRICS-04-7 | list (several ids, empty or later date, fewer than 5 reviews, different verdicts) | enumeration | Signals that disagree, the last member, not giving confounded | EX-13 |
| FR-METRICS-04-7 | implicit: more than one CHECK-n id | variant | Two ids written CHECK-9 and CHECK-10, with no comma, taken as one | EX-40 |
| FR-METRICS-04-7 | implicit: more than one CHECK-n id | scope | Other text in the prevention cell counted as a second check | EX-53 |
| FR-METRICS-04-7 | word after (its date is empty or after the report's date) | absence | An empty since cell, or a date after the report's, given a verdict | EX-54 |
| FR-METRICS-04-7 | boundary (5) | boundary | Exactly 5 reviews since treated as too few | EX-41 |
| FR-METRICS-04-7 | implicit: on either side | scope | Only 4 reviews before, not since, and a verdict given | EX-55 |
| FR-METRICS-04-7 | implicit: fewer than 5 since | enumeration | 4 reviews since treated as enough | EX-15 |
| FR-METRICS-04-7 | implicit: the first row that matches wins | guard | The one-signal row tried before the several-checks row, so two checks give helped, one signal | EX-16 |
| FR-METRICS-04-7 | implicit: marked one signal | absence | A one-signal verdict printed with no mark | EX-14 |
| FR-METRICS-04-8 | scope (moved from in its text) | scope | The moved from text of another finding, R-56, accepted for R-55 | EX-43 |
| FR-METRICS-04-8 | implicit: followed by a reason | absence | moved from C-1: with nothing after it accepted | EX-42 |
| FR-METRICS-04-8 | implicit: naming that first cause | scope | A move naming the last cause, C-2, not the first, C-1, accepted | EX-56 |
| FR-METRICS-04-8 | implicit: the first cause in the queue's history | scope | Only the last commit compared, so a move two commits back is missed | EX-44 |
| FR-METRICS-04-8 | implicit: differs from the first cause | boundary | A cause moved away and back to its first cause failed as moved | EX-57 |
| FR-METRICS-04-8 | implicit: the first cause of a new finding | absence | A finding new in the last commit failed as moved | EX-45 |
| FR-METRICS-04-8 | implicit: a project with no history | failure | No git repository: every finding failed as moved, or a crash | EX-46 |
| FR-METRICS-04-9 | implicit: a header that starts with Open | variant | The header Open findings, not Open alone, passed | EX-47 |
| FR-METRICS-04-9 | implicit: a column header | scope | A cause whose text starts with Open questions failed | EX-58 |
| FR-METRICS-04-9 | implicit: of the causes table | scope | A column Open in the Reviews table failed | EX-48 |
| FR-METRICS-04-10 | input (read); implicit: a project outside a git repository | failure | The folder is not a git repository, and the report crashes | EX-29 |
| FR-METRICS-04-10 | input (read) | absence | The queue file is in no commit | EX-11 |
| FR-METRICS-04-10 | implicit: once | enumeration | Two causes with a prevention print the line twice | EX-49 |

### Coverage waivers
None.

## Decision table
The verdict of one prevention. The first row that matches wins.

| ID | Prevention cell | Date | Reviews on each side | Signals | Result |
|---|---|---|---|---|---|
| DT-1 | 2 or more distinct CHECK-n ids | any | any | any | confounded |
| DT-2 | 1 CHECK-n id | empty or after the report's date | any | any | confounded |
| DT-3 | 1 CHECK-n id | on or before the report's date | fewer than 5 on either side | any | confounded |
| DT-4 | 1 CHECK-n id | on or before the report's date | 5 or more on both | two, with different verdicts | confounded |
| DT-5 | 1 CHECK-n id | on or before the report's date | 5 or more on both | two, with the same verdict | that verdict |
| DT-6 | 1 CHECK-n id | on or before the report's date | 5 or more on both | the review signal only | its verdict, marked one signal |

## States
n/a: a verdict is computed on each run and stored nowhere.

## Invariants
n/a: the repository keeps no invariants register yet; the rules are covered by the examples.

## Quality criteria

| ID | Characteristic (ISO/IEC 25010) | Criterion |
|---|---|---|
| QC-1 | Functional suitability | All examples pass, and the scan reports 0 uncovered ids of this FRD. |
| QC-2 | Performance efficiency | The verdicts reuse the one history the report already reads, and read the mutation reports already on disk; nothing here runs a mutant. |
| QC-3 | Compatibility | The nightly signal reads the reports the existing nightly job writes, in the format the mutation summary already parses. |
| QC-4 | Interaction capability | Each verdict line carries the numbers it rests on, asserted in EX-4 and EX-12. |
| QC-5 | Reliability | A mutation report that cannot be read is named and left out, and the other reports still count. |
| QC-6 | Security | n/a: the log holds no secrets and runs no code. |
| QC-7 | Maintainability | The scan reports 0 dead tags and 0 uncovered ids for this FRD at approval. |
| QC-8 | Flexibility | The 10 reviews before, the 5 reviews since, the 3 nights and the one-half threshold are fixed here; changing them needs an owner decision. |
| QC-9 | Safety | n/a: a report endangers nobody. |

## Cross-cutting
n/a: the repository keeps no cross-cutting register yet.

## Information
Reads: the causes (id, prevention, since), the findings (id, date, change, cause, text), the Reviews table (change, date, findings) and the queue's history, from docs/metrics/rework.md and its git history; the approved specs and the tests' covers tags; optionally a folder of the nightly job's mutation reports. Not covered here: a builder adding behavior no row asks for (C-4), and team-practice rework in puppeteering, which has no queue.

## Open questions
None.

## Acceptance criteria
Generated from the examples, decision table and states; never edited by hand.

- **AC-1** (EX-1): Given SPEC-08-12 is approved, test/kinds.test.ts carries a covers tag of one of its rows, and the Reviews table has no SPEC-08-12 row, when status runs, then it warns "SPEC-08-12 was built and has no review row".
- **AC-2** (EX-2): Given The same spec with a Reviews row "SPEC-08-12, 2026-11-23", when status runs, then it reports nothing about SPEC-08-12.
- **AC-3** (EX-3): Given An approved spec with no test tagged with its rows and no Reviews row, when status runs, then it reports nothing: it is not built yet.
- **AC-4** (EX-4): Given C-1, prevention CHECK-9 since 2026-12-01; 8 C-1 findings in the 10 reviews before; 1 in the 10 since, when the rework report runs, then it prints "C-1 CHECK-9: helped, one signal (reviews: before 0.8 per review over 10, since 0.1 over 10)".
- **AC-5** (EX-5): Given The same counts, but 6 of the reviews since were logged in one week and 4 the week after, when the rework report runs, then it prints the same rates: weeks do not enter the rate.
- **AC-6** (EX-6): Given C-1, CHECK-9 since 2026-12-01; a C-1 finding dated 2026-11-30, whose change has no review, added to the queue in a commit of 2026-12-02, when the rework report runs, then it counts that finding before: the finding's date decides, not the commit's.
- **AC-7** (EX-7): Given 4 C-1 findings in the 10 reviews before, 4 in the 10 since, when the rework report runs, then it prints no observed effect.
- **AC-8** (EX-8): Given 2 C-1 findings in the 10 reviews before, 6 in the 10 since, when the rework report runs, then it prints hurt.
- **AC-9** (EX-9): Given 4 C-1 findings in the 10 reviews before, 2 in the 10 since, when the rework report runs, then it prints helped: exactly half counts.
- **AC-10** (EX-10): Given 0 C-1 findings before and 0 since, when the rework report runs, then it prints no observed effect: nothing to improve on is not helped.
- **AC-11** (EX-11): Given A project whose queue file is in no commit, when the rework report runs, then it prints "no history: no verdict" once and no verdict line.
- **AC-12** (EX-12): Given The counts of EX-4, and nightly reports with a mean of 12 survivors over 5 nights before and 3 over 4 nights since, when the rework report runs with the reports folder, then it prints "C-1 CHECK-9: helped (reviews: 0.8 to 0.1; nightly: 12 to 3)".
- **AC-13** (EX-13): Given The counts of EX-4, and nightly means of 12 before and 12 since, when the rework report runs with the reports folder, then it prints confounded: the signals disagree.
- **AC-14** (EX-14): Given The counts of EX-4, and nightly reports for 2 nights since, when the rework report runs with the reports folder, then it ignores the nightly signal and prints "helped, one signal".
- **AC-15** (EX-15): Given The counts of EX-4, but only 4 reviews logged since, when the rework report runs, then it prints confounded.
- **AC-16** (EX-16): Given Prevention "CHECK-9, CHECK-10" and the counts of EX-4, when the rework report runs, then it prints confounded.
- **AC-17** (EX-17): Given R-55 had cause C-1 at an earlier commit and has C-2 now, with no "moved from" text, when status runs, then it fails with "R-55: cause moved from C-1 with no reason".
- **AC-18** (EX-18): Given R-55 has C-2 and its text holds "moved from C-1: the spec, not the FRD, missed it", when status runs, then it reports nothing about R-55.
- **AC-19** (EX-19): Given The causes table has a column "Open", when status runs, then it fails with "the causes table keeps counts by hand; the rework report prints them".
- **AC-20** (EX-20): Given A Reviews row with an empty change and the date 2026-11-23, the second row of the table, when status runs, then it fails with "Reviews row 2: empty change".
- **AC-21** (EX-21): Given C-1, CHECK-9 since 2026-12-01; 4 C-1 findings in the 10 reviews before; 10 clean reviews since, with no C-1 finding, when the rework report runs, then it prints "C-1 CHECK-9: helped, one signal (reviews: before 0.4 per review over 10, since 0 over 10)": clean reviews count.
- **AC-22** (EX-22): Given The counts of EX-4, where two of the 10 reviews since are of SPEC-08-12, dated 2026-12-02 and 2026-12-04, when the rework report runs, then it prints the line of EX-4: each review is one row, not each change.
- **AC-23** (EX-23): Given SPEC-08-12 is a Draft, test/kinds.test.ts carries a covers tag of one of its rows, and the Reviews table has no SPEC-08-12 row, when status runs, then it reports nothing about SPEC-08-12: only an approved spec is checked.
- **AC-24** (EX-24): Given SPEC-08-1 is approved, a test carries a covers tag of one of its rows, and the Reviews table holds a SPEC-08-12 row and no SPEC-08-1 row, when status runs, then it warns "SPEC-08-1 was built and has no review row".
- **AC-25** (EX-25): Given SPEC-08-12 is approved, the only covers tag in the tests is of a row of SPEC-08-1, and the Reviews table has no SPEC-08-12 row, when status runs, then it reports nothing about SPEC-08-12: a tag of another spec does not build it.
- **AC-26** (EX-26): Given A queue with no Reviews table, when status runs, then it warns "the queue has no Reviews table" and does not fail.
- **AC-27** (EX-27): Given The counts of EX-13, when the rework report runs with the reports folder, then it prints "C-1 CHECK-9: confounded (reviews: 0.8 to 0.1; nightly: 12 to 12)": a confounded line keeps the prevention and each signal's numbers.
- **AC-28** (EX-28): Given C-1 with prevention CHECK-9 since 2026-12-01 and the counts of EX-4, and C-2 with prevention "none", when the rework report runs, then it prints one verdict line, for C-1, and none for C-2.
- **AC-29** (EX-29): Given A project whose folder is not a git repository, when the rework report runs, then it prints "no history: no verdict" once and no verdict line.
- **AC-30** (EX-30): Given C-1, CHECK-9 since 2026-12-01; a Reviews row dated 2026-12-01 with a C-1 finding of its change, and a nightly report 2026-12-01.json, when the rework report runs with the reports folder, then it counts the review, the finding and the night since: the prevention's own date is on the since side.
- **AC-31** (EX-31): Given C-1, CHECK-9 since 2026-12-01; 12 reviews before, 5 C-1 findings of changes reviewed in the 2 oldest of them and 2 of changes reviewed in the last 10; 1 C-1 finding in the 10 since, when the rework report runs, then it prints "before 0.2 per review over 10": only the last 10 reviews before count.
- **AC-32** (EX-32): Given The counts of EX-4, and 5 C-2 findings in the 10 reviews since, when the rework report runs, then it prints the line of EX-4 for C-1: findings of another cause do not enter its rate.
- **AC-33** (EX-33): Given The counts of EX-4, and nightly reports with a mean of 12 survivors over 3 nights before and 3 over 3 nights since, when the rework report runs with the reports folder, then it prints "C-1 CHECK-9: helped (reviews: 0.8 to 0.1; nightly: 12 to 3)": 3 nights each is enough.
- **AC-34** (EX-34): Given The counts of EX-4, and nightly reports for 2 nights before and 4 since, when the rework report runs with the reports folder, then it ignores the nightly signal and prints "helped, one signal".
- **AC-35** (EX-35): Given The reports of EX-12, and one more report of a night since that cannot be read, when the rework report runs with the reports folder, then it names that report, leaves it out, and prints the line of EX-12.
- **AC-36** (EX-36): Given The counts of EX-4, and a reports folder holding only README.md and nightly-2026-12-02.json, when the rework report runs with the reports folder, then it names both as not mutation reports and prints "helped, one signal".
- **AC-37** (EX-37): Given The counts of EX-4, and a reports folder path that does not exist, when the rework report runs with that folder, then it fails and names the folder.
- **AC-38** (EX-38): Given 0 C-1 findings in the 10 reviews before, 3 in the 10 since, when the rework report runs, then it prints hurt: a rate before of 0 stops helped, not hurt.
- **AC-39** (EX-39): Given 4 C-1 findings in the 10 reviews before, 3 in the 10 since, when the rework report runs, then it prints no observed effect: lower but above half is not helped.
- **AC-40** (EX-40): Given Prevention "CHECK-9 and CHECK-10" and the counts of EX-4, when the rework report runs, then it prints confounded.
- **AC-41** (EX-41): Given C-1, CHECK-9 since 2026-12-01; 8 C-1 findings in the 10 reviews before, 0 in exactly 5 reviews since, when the rework report runs, then it prints "helped, one signal": 5 reviews since are enough.
- **AC-42** (EX-42): Given R-55 had cause C-1 at an earlier commit and has C-2 now, and its text ends with "moved from C-1:", when status runs, then it fails with "R-55: cause moved from C-1 with no reason".
- **AC-43** (EX-43): Given R-55 had cause C-1 at an earlier commit and has C-2 now with no "moved from" text, and the text of R-56 holds "moved from C-1: the spec missed it", when status runs, then it fails with "R-55: cause moved from C-1 with no reason".
- **AC-44** (EX-44): Given R-55 had cause C-1 three commits ago and C-2 from two commits ago, the last commit changed only R-60, and R-55's text holds no "moved from", when status runs, then it fails with "R-55: cause moved from C-1 with no reason": the first cause decides, not the last commit.
- **AC-45** (EX-45): Given R-90 was added in the last commit with cause C-2 and no "moved from" text, when status runs, then it reports nothing about R-90: a new finding had no earlier cause.
- **AC-46** (EX-46): Given A project whose folder is not a git repository, and R-55 with cause C-2 and no "moved from" text, when status runs, then it reports nothing about R-55: with no history, no cause moved.
- **AC-47** (EX-47): Given The causes table has a column "Open findings", when status runs, then it fails with "the causes table keeps counts by hand; the rework report prints them".
- **AC-48** (EX-48): Given The Reviews table has a column "Open" and the causes table has none, when status runs, then it reports nothing about counts by hand: only the causes table is checked.
- **AC-49** (EX-49): Given C-1 and C-2, each with a prevention, and a queue file in no commit, when the rework report runs, then it prints "no history: no verdict" once and no verdict line.
- **AC-50** (EX-50): Given A Reviews row "SPEC-08-12, 23/11/2026", when status runs, then it fails with "Reviews row SPEC-08-12: 23/11/2026 is not YYYY-MM-DD".
- **AC-51** (EX-51): Given C-1, CHECK-9 since 2026-12-01; 6 reviews before with 3 C-1 findings; 1 C-1 finding in the 10 since, when the rework report runs, then it prints "before 0.5 per review over 6": fewer than 10 reviews before are all used.
- **AC-52** (EX-52): Given C-1, CHECK-9 since 2026-12-01; a C-1 finding dated 2026-11-28 of change SPEC-08-12, whose review is dated 2026-12-02, when the rework report runs, then it counts that finding since: its change's review decides, not its own date.
- **AC-53** (EX-53): Given Prevention "CHECK-9 (the near-miss check)" and the counts of EX-4, when the rework report runs, then it prints "helped, one signal": one CHECK-n id is one check.
- **AC-54** (EX-54): Given The counts of EX-4 with an empty since cell for C-1, and again with since 2027-01-01 for a report run on 2026-12-10, when the rework report runs, then it prints confounded both times.
- **AC-55** (EX-55): Given C-1, CHECK-9 since 2026-12-01; only 4 reviews before, with 3 C-1 findings, and 10 since with 1, when the rework report runs, then it prints confounded: fewer than 5 reviews lie before.
- **AC-56** (EX-56): Given R-55 had cause C-1 first, then C-2, and has C-3 now, and its text holds "moved from C-2: the spec missed it", when status runs, then it fails with "R-55: cause moved from C-1 with no reason": the move must name the first cause.
- **AC-57** (EX-57): Given R-55 had cause C-1 first, then C-2, and has C-1 again now, with no "moved from" text, when status runs, then it reports nothing about R-55: its cause is its first cause.
- **AC-58** (EX-58): Given A cause of the causes table whose text starts with "Open questions", when status runs, then it reports nothing about counts by hand: only a column header counts.
- **AC-59** (DT-1): Given prevention cell: 2 or more distinct CHECK-n ids, date: any, reviews on each side: any, signals: any, when the rework report runs, then the verdict is: confounded.
- **AC-60** (DT-2): Given prevention cell: 1 CHECK-n id, date: empty or after the report's date, reviews on each side: any, signals: any, when the rework report runs, then the verdict is: confounded.
- **AC-61** (DT-3): Given prevention cell: 1 CHECK-n id, date: on or before the report's date, reviews on each side: fewer than 5 on either side, signals: any, when the rework report runs, then the verdict is: confounded.
- **AC-62** (DT-4): Given prevention cell: 1 CHECK-n id, date: on or before the report's date, reviews on each side: 5 or more on both, signals: two, with different verdicts, when the rework report runs, then the verdict is: confounded.
- **AC-63** (DT-5): Given prevention cell: 1 CHECK-n id, date: on or before the report's date, reviews on each side: 5 or more on both, signals: two, with the same verdict, when the rework report runs, then the verdict is: that verdict.
- **AC-64** (DT-6): Given prevention cell: 1 CHECK-n id, date: on or before the report's date, reviews on each side: 5 or more on both, signals: the review signal only, when the rework report runs, then the verdict is: its verdict, marked one signal.
