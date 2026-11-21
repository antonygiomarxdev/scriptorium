import { test, expect } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readQueue, reworkFails } from "../scripts/rework.ts";

// A project with docs/metrics/rework.md built from cause rows and finding rows, and optionally a checks table.
const cause = (id: string, step = "FRD", prevention = "none", since = "n/a") => "| " + id + " | " + step + " | some cause | 0 | " + prevention + " | " + since + " |";
const finding = (id: string, cs: string, date = "2026-11-20") => "| " + id + " | " + date + " | SPEC-01-1 | " + cs + " | what happened |";
const queue = (causes: string[], findings: string[]) =>
  "# Rework queue\n\nStatus: Draft\n\n## Causes\n\n| ID | Step | Cause | Open | Prevention | Since |\n|---|---|---|---|---|---|\n" + causes.join("\n") + "\n\n## Open findings\n\n| ID | Date | Change | Cause | Finding |\n|---|---|---|---|---|\n" + findings.join("\n") + "\n";
const checks = (...rows: string[]) => "# Checks\n\n| ID | Prevents | Command | Replay |\n|---|---|---|---|\n" + rows.join("\n") + "\n";
const PROVEN = "| CHECK-4 | x | `bun test` | `test/x.ts` |";
const NO_REPLAY = "| CHECK-4 | x | `bun test` |  |";

function project(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-rework-"));
  for (const [p, t] of Object.entries({ "docs/PRODUCT.md": "# P\n\nStatus: Draft\n", ...files })) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  return root;
}
const rework = (log: string, extra: Record<string, string> = {}) => project({ "docs/metrics/rework.md": log, ...extra });
const fails = (root: string) => reworkFails(root).join("\n");
const cli = (root: string, ...a: string[]) => {
  const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), ...a], { cwd: root });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
};

// covers: metrics/FRD-01/EX-1
test("EX-1: a finding with an empty Cause cell fails", () => {
  expect(fails(rework(queue([cause("C-1")], [finding("R-1", "")])))).toContain("R-1: no cause");
});

// covers: metrics/FRD-01/EX-2
test("EX-2: a finding naming a cause not in the list fails", () => {
  expect(fails(rework(queue([cause("C-1"), cause("C-2"), cause("C-3")], [finding("R-1", "C-9")])))).toContain("R-1: unknown cause C-9");
});

// covers: metrics/FRD-01/EX-3
test("EX-3: a finding naming a listed cause passes, and the queue reads back", () => {
  const root = rework(queue([cause("C-1")], [finding("R-1", "C-1")]));
  expect(reworkFails(root)).toEqual([]);
  const q = readQueue(root);
  expect(q).toBeDefined();
  expect(JSON.stringify(q)).toContain("R-1");
  expect(JSON.stringify(q)).toContain("C-1");
});

// covers: metrics/FRD-01/EX-13
test("EX-13: a project with no rework.md reports nothing about rework", () => {
  const root = project({});
  expect(readQueue(root)).toBeUndefined();
  expect(reworkFails(root)).toEqual([]);
  const r = cli(root, "status", ".");
  expect(r.code).toBe(0);
  expect(r.out.toLowerCase()).not.toContain("rework");
});

// covers: metrics/FRD-01/EX-4
// covers: metrics/FRD-01/EX-7
// covers: metrics/FRD-01/DT-1
test("EX-4, EX-7, DT-1: a cause with one open finding, or none, and no prevention passes", () => {
  expect(reworkFails(rework(queue([cause("C-1")], [finding("R-1", "C-1")])))).toEqual([]);
  expect(reworkFails(rework(queue([cause("C-1"), cause("C-2")], [finding("R-1", "C-1")])))).toEqual([]); // C-2 has none
  expect(reworkFails(rework(queue([cause("C-1")], [])))).toEqual([]);
});

// covers: metrics/FRD-01/EX-5
// covers: metrics/FRD-01/DT-2
test("EX-5, DT-2: two open findings of a cause with no prevention fail, naming both", () => {
  const r = fails(rework(queue([cause("C-1", "FRD")], [finding("R-1", "C-1"), finding("R-2", "C-1")])));
  expect(r).toContain("C-1 (FRD) found 2 times with no prevention: R-1, R-2");
});

// covers: metrics/FRD-01/EX-8
// covers: metrics/FRD-01/DT-3
test("EX-8, DT-3: a prevention the project checks do not hold fails", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], []);
  expect(fails(rework(log, { "docs/CHECKS.md": checks("| CHECK-1 | x | `bun test` | `test/x.ts` |") }))).toContain("C-1: prevention CHECK-4 does not exist");
  expect(fails(rework(log))).toContain("C-1: prevention CHECK-4 does not exist"); // no checks file at all
});

// covers: metrics/FRD-01/EX-9
// covers: metrics/FRD-01/DT-3
test("EX-9, DT-3: a prevention with a command but no replay fails", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], []);
  expect(fails(rework(log, { "docs/CHECKS.md": checks(NO_REPLAY) }))).toContain("C-1: prevention CHECK-4 has no replay");
});

// covers: metrics/FRD-01/EX-10
// covers: metrics/FRD-01/DT-4
test("EX-10, DT-4: a finding dated after the prevention shipped says it did not hold", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], [finding("R-7", "C-1", "2026-11-22")]);
  expect(fails(rework(log, { "docs/CHECKS.md": checks(PROVEN) }))).toContain("C-1: CHECK-4 did not prevent R-7");
});

// covers: metrics/FRD-01/EX-11
test("EX-11: a finding dated the same day as the prevention counts as after", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], [finding("R-7", "C-1", "2026-11-21")]);
  expect(fails(rework(log, { "docs/CHECKS.md": checks(PROVEN) }))).toContain("C-1: CHECK-4 did not prevent R-7");
});

// covers: metrics/FRD-01/EX-12
// covers: metrics/FRD-01/DT-5
test("EX-12, DT-5: a finding dated before the prevention is closed and must leave the log", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], [finding("R-2", "C-1", "2026-11-20")]);
  const r = fails(rework(log, { "docs/CHECKS.md": checks(PROVEN) }));
  expect(r).toContain("R-2: closed by CHECK-4, remove it from the log");
  expect(r).not.toContain("did not prevent");
});

// covers: metrics/FRD-01/EX-16
// covers: metrics/FRD-01/DT-6
test("EX-16, DT-6: a proven prevention and no open finding of the cause passes", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], []);
  expect(reworkFails(rework(log, { "docs/CHECKS.md": checks(PROVEN) }))).toEqual([]);
});

const LOG_EX5 = queue([cause("C-1", "FRD")], [finding("R-1", "C-1"), finding("R-2", "C-1")]);
const PIN = (n: number) => ({ ".scriptorium/config.json": JSON.stringify({ format: n }) });

// covers: metrics/FRD-01/EX-15
test("EX-15: status under format 2 passes and prints the failure as a warning", () => {
  const r = cli(rework(LOG_EX5, PIN(2)), "status", ".");
  expect(r.code).toBe(0);
  expect(r.out).toContain("WARN (format 3): ");
  expect(r.out).toContain("C-1 (FRD) found 2 times with no prevention: R-1, R-2");
});

// covers: metrics/FRD-01/EX-18
test("EX-18: status under format 3 fails with the line", () => {
  const r = cli(rework(LOG_EX5, PIN(3)), "status", ".");
  expect(r.code).toBe(1);
  expect(r.out).toContain("C-1 (FRD) found 2 times with no prevention: R-1, R-2");
  expect(r.out).not.toContain("WARN (format 3): C-1");
});

// covers: metrics/FRD-01/EX-1
test("EX-1, QC-5: a finding row with 4 cells, or one with 6, fails naming the file and the row", () => {
  for (const row of ["| R-1 | 2026-11-20 | SPEC-01-1 | C-1 |", "| R-1 | 2026-11-20 | SPEC-01-1 | C-1 | what | extra |"]) {
    const r = fails(rework(queue([cause("C-1")], [row])));
    expect(r).toContain("docs/metrics/rework.md");
    expect(r).toContain("R-1");
  }
  expect(reworkFails(rework(queue([cause("C-1")], [finding("R-1", "C-1")])))).toEqual([]); // mutant: a whole row is fine
});

// covers: metrics/FRD-01/EX-1
test("EX-1, QC-5: a cause row with 5 cells, or one with 7, fails naming the file and the row", () => {
  for (const row of ["| C-1 | FRD | some cause | 0 | none |", "| C-1 | FRD | some cause | 0 | none | n/a | extra |"]) {
    const r = fails(rework(queue([row], [])));
    expect(r).toContain("docs/metrics/rework.md");
    expect(r).toContain("C-1");
  }
  expect(reworkFails(rework(queue([cause("C-1")], [])))).toEqual([]); // mutant: a whole row is fine
});

// covers: metrics/FRD-01/EX-9
test("EX-9: a CHECKS.md table with no Replay column says the prevention has no replay", () => {
  const log = queue([cause("C-1", "FRD", "CHECK-4", "2026-11-21")], []);
  const noColumn = "# Checks\n\n| ID | Prevents | Command |\n|---|---|---|\n| CHECK-4 | x | `bun test` |\n";
  expect(fails(rework(log, { "docs/CHECKS.md": noColumn }))).toContain("C-1: prevention CHECK-4 has no replay");
  expect(reworkFails(rework(log, { "docs/CHECKS.md": checks(PROVEN) }))).toEqual([]); // mutant: with the column and a replay it passes
});
