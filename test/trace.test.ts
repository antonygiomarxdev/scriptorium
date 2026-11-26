import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { frdIds, waivers, scanTags, traceFails } from "../scripts/trace.ts";

// Tags are built here so this file's own fixtures are not scanned as real tags.
const cov = (...s: string[]) => s.map((x) => "cov" + "ers: " + x).join("\n");
const waive = (s: string) => "uncovered: " + s;

const frdText = (status: string, rows: string, extra = "") => "# FRD-01: x\n\nStatus: " + status + "\n\n| Example | Rule |\n|---|---|\n" + rows + "\n\n" + extra + "\n";

// One slice "chain" with FRD-01 defining the given rows; tests dir holds the given files.
function fixture(status: string, rows: string, tests: Record<string, string>, extra = "", more: Record<string, string> = {}, pin = true) {
  const root = mkdtempSync(join(tmpdir(), "trace-"));
  const docs = join(root, "docs"),
    t = join(root, "test");
  mkdirSync(join(docs, "chain", "frd"), { recursive: true });
  mkdirSync(t);
  if (pin) mkdirSync(join(root, ".scriptorium")), writeFileSync(join(root, ".scriptorium", "config.json"), '{"format":2}');
  writeFileSync(join(docs, "chain", "frd", "FRD-01-x.md"), frdText(status, rows, extra));
  for (const [p, c] of Object.entries(more)) {
    mkdirSync(dirname(join(docs, p)), { recursive: true }), writeFileSync(join(docs, p), c);
  }
  for (const [n, c] of Object.entries(tests)) writeFileSync(join(t, n), c);
  return { docs, t };
}
const run = (f: { docs: string; t: string }) => traceFails(f.docs, [f.t]);
const ROWS = "| EX-1 | a |\n| EX-2 | b |";
const APPROVED = "Approved (2026-11-21)";
// D-37: an Approved spec that rests on FRD-01 and quotes the given rows.
const spec = (status: string, rows: string, rests = "../frd/FRD-01-x.md") => "# SPEC-01-1: x\n\nStatus: " + status + "\nRests on: " + rests + "\n\n## Summary\n\nx\n\n## Rows\n\n" + rows + "\n\n## Files\n";
const QUOTE = (rows: string, status = APPROVED) => ({ "chain/specs/SPEC-01-1-x.md": spec(status, rows) });

test("ids come from the rows of EX, DT, ST and INV tables only", () => {
  const t = "| EX-1 | a |\n| RULE-1 | b |\n| DT-2 | c |\n| ST-3 | d |\n| INV-4 | e |\n- **AC-1** (EX-9): text\nEX-7 in prose";
  expect(frdIds(t)).toEqual(["EX-1", "DT-2", "ST-3", "INV-4"]);
});

test("waivers: a line of the FRD gives id and reason; a table cell quoting one is not a waiver", () => {
  const t = "- " + waive("EX-3 needs a real clock") + "\n" + waive("EX-4") + "\n| EX-5 | " + waive("EX-6 no") + " |";
  expect(waivers(t)).toEqual({ "EX-3": "needs a real clock", "EX-4": "" });
});

test("scanTags reads tags in any file, with or without the slice, several per line", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": "// " + cov("FRD-01/EX-1") + " and " + "cov" + "ers: chain/FRD-01/EX-2", "b.py": "# " + cov("FRD-01/DT-1") });
  expect(scanTags(f.t).map((x) => [x.slice, x.frd, x.id])).toEqual([
    [undefined, "FRD-01", "EX-1"],
    ["chain", "FRD-01", "EX-2"],
    [undefined, "FRD-01", "DT-1"],
  ]);
});

// covers: chain/FRD-01/EX-13
test("EX-13: every defined example tagged passes", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") });
  expect(run(f).fails).toEqual([]);
});

// covers: chain/FRD-01/EX-14
test("EX-14: a tag for an id no FRD defines fails as dead and names the file", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2", "FRD-01/EX-9"), "b.ts": cov("FRD-07/EX-1") });
  const fails = run(f).fails;
  expect(fails.some((x) => x.startsWith("dead tag FRD-01/EX-9") && x.includes("a.ts"))).toBe(true);
  expect(fails.some((x) => x.startsWith("dead tag FRD-07/EX-1") && x.includes("b.ts"))).toBe(true);
  expect(fails.length).toBe(2);
});

// covers: chain/FRD-01/EX-15
test("EX-15: an approved example with no tag fails as uncovered; a draft FRD does not", () => {
  const tests = { "a.ts": cov("FRD-01/EX-1") };
  expect(run(fixture(APPROVED, ROWS, tests, "", QUOTE(ROWS))).fails.map((x) => x.split(" (")[0])).toEqual(["uncovered: FRD-01/EX-2"]);
  expect(run(fixture("Draft", ROWS, tests)).fails).toEqual([]);
});

// covers: chain/FRD-01/EX-16
test("EX-16: a waiver with a reason in the FRD passes", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1") }, "- " + waive("EX-2 needs a real clock"));
  expect(run(f).fails).toEqual([]);
});

// covers: chain/FRD-01/EX-17
test("EX-17: a waiver with no reason fails", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1") }, "- " + waive("EX-2"));
  expect(run(f).fails).toEqual(["waiver without a reason: FRD-01/EX-2"]);
});

// covers: chain/FRD-01/EX-22
// covers: chain/FRD-01/EX-23
test("EX-22, EX-23: a short tag is ambiguous when two slices share the FRD number; a prefixed tag resolves", () => {
  const more = { "other/frd/FRD-01-y.md": frdText(APPROVED, "| EX-1 | z |") };
  const tests = { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") };
  const amb = run(fixture(APPROVED, ROWS, tests, "", more)).fails;
  expect(amb.some((x) => x.includes("write chain/FRD-01/EX-1 or other/FRD-01/EX-1"))).toBe(true);
  expect(amb.filter((x) => x.startsWith("ambiguous tag FRD-01/EX-1")).length).toBe(1);
  const ok = fixture(APPROVED, ROWS, { "a.ts": cov("chain/FRD-01/EX-1", "chain/FRD-01/EX-2", "other/FRD-01/EX-1") }, "", more);
  expect(run(ok).fails).toEqual([]);
  expect(run(fixture(APPROVED, ROWS, { "a.ts": cov("nope/FRD-01/EX-1", "FRD-01/EX-2") })).fails.some((x) => x.startsWith("dead tag nope/FRD-01/EX-1"))).toBe(true);
});

// covers: chain/FRD-02/EX-16
// covers: chain/FRD-02/DT-3
test("a superseded FRD is skipped: no coverage demanded, its tags are not dead, nothing is noted", () => {
  const rows = ROWS + "\n| DT-1 | c |";
  const live = fixture(APPROVED, rows, { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") });
  expect(run(live).fails).toEqual([]);
  const sup = fixture("Superseded by ../PRD.md (2026-11-21)", rows, { "a.ts": cov("FRD-01/EX-9") });
  expect(run(sup)).toEqual({ fails: [], notes: [], warnings: [] });
  const mutant = fixture("Draft", rows, { "a.ts": cov("FRD-01/EX-9") });
  expect(run(mutant).fails.some((f) => f.includes("dead tag"))).toBe(true);
});

// covers: chain/FRD-02/EX-21
test("failures name paths with forward slashes only", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-9") }, "", QUOTE(ROWS));
  const out = run(f);
  expect(out.fails.length).toBeGreaterThan(1);
  expect(out.fails.some((x) => x.includes("chain/frd/FRD-01-x.md"))).toBe(true);
  expect(out.fails.join("\n")).not.toContain("\\");
  expect(run(fixture(APPROVED, ROWS + "\n| DT-1 | c |", { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") })).notes.join("")).not.toContain("\\");
});

test("DT ids are reported, never failed", () => {
  const f = fixture(APPROVED, ROWS + "\n| DT-1 | c |", { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") });
  const r = run(f);
  expect(r.fails).toEqual([]);
  expect(r.notes.some((n) => n.includes("FRD-01/DT-1"))).toBe(true);
});

test("mutant: deleting a tag or renaming an id turns a pass into a fail", () => {
  const good = { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") };
  expect(run(fixture(APPROVED, ROWS, good)).fails).toEqual([]);
  expect(run(fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1") }, "", QUOTE(ROWS))).fails.length).toBe(1);
  const renamed = "| EX-1 | a |\n| EX-3 | b |";
  expect(run(fixture(APPROVED, renamed, good, "", QUOTE(renamed))).fails.length).toBe(2); // EX-2 dead, EX-3 uncovered
});

test("CLI: exit 0 on pass, 1 on fail, 2 on usage", async () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") });
  const code = async (...a: string[]) => await Bun.spawn(["bun", "scripts/trace.ts", ...a], { stdout: "ignore", stderr: "ignore" }).exited;
  expect(await code(f.docs, f.t)).toBe(0);
  const bad = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1") }, "", QUOTE(ROWS)); // the spec is started (EX-1 tagged) and EX-2 is untagged
  expect(await code(bad.docs, bad.t)).toBe(1);
  const pending = fixture(APPROVED, ROWS, {}, "", QUOTE(ROWS)); // the spec is not started: no tag at all
  expect(await code(pending.docs, pending.t)).toBe(0);
  expect(await code(f.docs)).toBe(2);
  expect(await code(f.docs, join(f.t, "missing"))).toBe(2);
});

test("a waiver naming an id the FRD does not define fails", () => {
  const f = fixture(APPROVED, ROWS, { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2") }, "- " + waive("EX-9 no such example"));
  expect(run(f).fails).toEqual(["waiver for an id the FRD does not define: FRD-01/EX-9"]);
});

// D-37: approve first, build after. An untagged row fails only when an Approved spec that quotes it is started.
const ROWS4 = "| EX-1 | a |\n| EX-2 | b |\n| EX-3 | c |\n| EX-4 | d |";

test("D-37: with no tag at all, every row of an approved FRD is a pending note, even when specs quote it", () => {
  const r = run(fixture(APPROVED, ROWS4 + "\n| ST-1 | e |\n| INV-1 | f |", {}, "", QUOTE(ROWS4)));
  expect(r.fails).toEqual([]);
  expect(r.notes.map((n) => n.split(" (")[0])).toEqual(["pending: FRD-01/EX-1", "pending: FRD-01/EX-2", "pending: FRD-01/EX-3", "pending: FRD-01/EX-4", "pending: FRD-01/ST-1", "pending: FRD-01/INV-1"]);
  expect(r.notes[0]).toContain("no started Approved spec quotes it");
});

test("D-37: once one row of a spec is tagged, its other untagged rows fail; the rows of no started spec stay pending", () => {
  const more = QUOTE("| EX-1 | a |\n| EX-2 | b |");
  const r = run(fixture(APPROVED, ROWS4, { "a.ts": cov("FRD-01/EX-1") }, "", more));
  expect(r.fails.map((x) => x.split(" (")[0])).toEqual(["uncovered: FRD-01/EX-2"]);
  expect(r.notes.map((n) => n.split(" (")[0])).toEqual(["pending: FRD-01/EX-3", "pending: FRD-01/EX-4"]);
});

test("D-37: a spec that quotes one row alone is never started by that row, and a tag on a row it does not quote starts nothing", () => {
  const r = run(fixture(APPROVED, ROWS4, { "a.ts": cov("FRD-01/EX-1") }, "", QUOTE("| EX-2 | b |")));
  expect(r.fails).toEqual([]);
  expect(r.notes.length).toBe(3);
});

test("D-37: a row quoted by two specs fails when either is started", () => {
  const more = { ...QUOTE("| EX-1 | a |\n| EX-2 | b |"), "chain/specs/SPEC-01-2-y.md": spec(APPROVED, "| EX-2 | b |\n| EX-3 | c |") };
  const r = run(fixture(APPROVED, ROWS4, { "a.ts": cov("FRD-01/EX-3") }, "", more));
  expect(r.fails.map((x) => x.split(" (")[0])).toEqual(["uncovered: FRD-01/EX-2"]);
});

test("D-37: a Draft spec, a Superseded spec and a spec resting on a TP are never started", () => {
  const more = {
    "chain/specs/SPEC-01-1-x.md": spec("Draft", "| EX-1 | a |\n| EX-2 | b |"),
    "chain/specs/SPEC-01-2-y.md": spec("Superseded by ../specs/SPEC-01-1-x.md (2026-11-25)", "| EX-1 | a |\n| EX-3 | c |"),
    "chain/specs/SPEC-01-3-z.md": spec(APPROVED, "| EX-1 | a |\n| EX-4 | d |", "../tp/TP-01-x.md"),
  };
  const r = run(fixture(APPROVED, ROWS4, { "a.ts": cov("FRD-01/EX-1") }, "", more));
  expect(r.fails).toEqual([]);
  expect(r.notes.length).toBe(3);
});

test("D-37: a waiver silences a row of a started spec, a bad waiver still fails, and a draft or superseded FRD has no pending notes", () => {
  const more = QUOTE("| EX-1 | a |\n| EX-2 | b |");
  const tagged = { "a.ts": cov("FRD-01/EX-1") };
  expect(run(fixture(APPROVED, ROWS4, tagged, "- " + waive("EX-2 needs a real clock"), more)).fails).toEqual([]);
  expect(run(fixture(APPROVED, ROWS4, tagged, "- " + waive("EX-2"), more)).fails).toEqual(["waiver without a reason: FRD-01/EX-2"]);
  expect(run(fixture("Draft", ROWS4, {}, "", more)).notes).toEqual([]);
  expect(run(fixture("Superseded by ../x.md (2026-11-25)", ROWS4, {}, "", more)).notes).toEqual([]);
});

test("D-37: a dead tag, or a tag for another FRD, does not start a spec", () => {
  const more = QUOTE("| EX-1 | a |\n| EX-2 | b |");
  const dead = run(fixture(APPROVED, ROWS4, { "a.ts": cov("FRD-01/EX-9") }, "", more));
  expect(dead.fails.some((x) => x.includes("dead tag FRD-01/EX-9"))).toBe(true);
  expect(dead.fails.some((x) => x.includes("uncovered"))).toBe(false);
  const other = run(fixture(APPROVED, ROWS4, { "a.ts": cov("FRD-02/EX-1") }, "", { ...more, "chain/frd/FRD-02-y.md": frdText(APPROVED, "| EX-1 | z |") }));
  expect(other.fails.some((x) => x.includes("FRD-01/EX"))).toBe(false);
});

// covers: chain/FRD-03/EX-8
test("EX-8: an uncovered example only warns under format 1 and fails under format 2", () => {
  const tests = { "a.ts": cov("FRD-01/EX-1") };
  const r = run(fixture(APPROVED, ROWS, tests, "", QUOTE(ROWS), false));
  expect(r.fails).toEqual([]);
  expect(r.warnings.map((x) => x.replace(/ \(chain.*/, ""))).toEqual(["WARN (format 2): uncovered: FRD-01/EX-2"]);
  expect(run(fixture(APPROVED, ROWS, tests, "", QUOTE(ROWS))).fails.length).toBe(1);
});

// covers: chain/FRD-03/EX-20
test("EX-20: a dead tag only warns under format 1 and fails under format 2", () => {
  const tests = { "a.ts": cov("FRD-01/EX-1", "FRD-01/EX-2", "FRD-01/EX-9") };
  const r = run(fixture(APPROVED, ROWS, tests, "", {}, false));
  expect(r.fails).toEqual([]);
  expect(r.warnings.join("\n")).toContain("WARN (format 2): dead tag");
  expect(run(fixture(APPROVED, ROWS, tests)).fails.length).toBe(1);
});
