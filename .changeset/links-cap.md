---
"@antonygiomarxdev/scriptorium": patch
---

The line cap leaves out the Links line, as the fingerprint does. Both now leave out only the first "Links:" line above the first "## " heading: a Links line in the body, or a second one in the header, is counted and fingerprinted like any line, so it can no longer hide a change or pad past the cap.
