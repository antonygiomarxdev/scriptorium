import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkPrd, checkFrds } from "../scripts/check.ts";

const PRODUCT = `# P
## 4. Principles
1. One.
2. Two.
## 5. Use cases
| UC-1 | a |
| UC-2 | b |
`;

const PRD = `# Inbox PRD
See [product](../../../docs/PRODUCT.md).
## Purpose
x
## Use cases
UC-1
## Requirements
R-INBOX-1 a. R-INBOX-2 b. R-INBOX-3 c.
## Principles honored
principle 2 holds.
## Out of scope
## Dependencies
## Acceptance criteria
## Open questions
`;

const FRD = `# a
[PRD](../PRD.md)
## Summary
## Requirements covered
R-INBOX-1, R-INBOX-2, R-INBOX-3
## Behavior
FR-INBOX-01-1 x. FR-INBOX-01-2 y.
## Edge cases
## Information
## Acceptance tests
- Given a, When b, Then c.
- Given d, When e, Then f.
## Open questions
`;

test("a good PRD passes", () => expect(checkPrd(PRD, "INBOX", PRODUCT)).toEqual([]));

test("a PRD citing an unknown principle, an unknown use case or a technology fails", () => {
  const bad = PRD.replace("principle 2", "principle 3").replace("UC-1", "UC-9").replace("x\n", "stored in SQLite\n");
  const fails = checkPrd(bad, "INBOX", PRODUCT);
  expect(fails).toContain("unknown principle 3");
  expect(fails).toContain("unknown use case UC-9");
  expect(fails.some((f) => f.includes("SQLite"))).toBe(true);
});

function slice(frd: string) {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-"));
  mkdirSync(join(dir, "docs", "frd"), { recursive: true });
  writeFileSync(join(dir, "docs", "PRD.md"), PRD);
  writeFileSync(join(dir, "docs", "frd", "FRD-01-a.md"), frd);
  return dir;
}

test("FRDs that cover every PRD requirement pass", () => expect(checkFrds(slice(FRD), "INBOX").fails).toEqual([]));

test("an uncovered requirement, a requirement not in the PRD and a technology fail", () => {
  const { fails } = checkFrds(slice(FRD.replace("R-INBOX-3", "R-INBOX-9 as JSON")), "INBOX");
  expect(fails).toContain("PRD requirement R-INBOX-3 is covered by no FRD");
  expect(fails).toContain("FRD-01-a.md: cites R-INBOX-9, not in the PRD");
  expect(fails.some((f) => f.includes("JSON"))).toBe(true);
});
