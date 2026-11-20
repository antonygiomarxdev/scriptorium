import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, renameSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fingerprint } from "../scripts/drift.ts";
import { history } from "../scripts/history.ts";

const body = (extra: string) => "# PRD\n\n## Requirements\n- **R-CHAIN-1.** The system shall work.\n- **R-CHAIN-2.** The system shall stay.\n" + extra;

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "history-"));
  const g = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8" });
  g("init", "-q");
  g("config", "user.email", "t@example.com");
  g("config", "user.name", "T");
  g("config", "commit.gpgsign", "false");
  const commit = (date: string, msg: string) => {
    g("add", "-A");
    execFileSync("git", ["commit", "-q", "-m", msg], { cwd: dir, env: { ...process.env, GIT_AUTHOR_DATE: date + "T12:00:00", GIT_COMMITTER_DATE: date + "T12:00:00" } });
  };
  return { dir, doc: join(dir, "PRD.md"), g, commit };
}
const approvedText = (b: string) => "Status: Approved (2026-11-20)\nApproval: content " + fingerprint(b) + "\n" + b;

// covers: chain/FRD-01/EX-18
test("FRD-01/EX-18: one line per commit, newest first, with date, short id and subject; no file changes", () => {
  const r = repo();
  writeFileSync(r.doc, "Status: Draft\n" + body(""));
  r.commit("2026-11-18", "docs: draft");
  writeFileSync(r.doc, "Status: Draft\n" + body("Note.\n"));
  r.commit("2026-11-20", "docs: approve");
  const before = readFileSync(r.doc, "utf8");
  const out = history(r.doc);
  expect(out).toHaveLength(2);
  expect(out[0]).toMatch(/^2026-11-20 [0-9a-f]{7,} docs: approve$/);
  expect(out[1]).toMatch(/^2026-11-18 [0-9a-f]{7,} docs: draft$/);
  expect(readFileSync(r.doc, "utf8")).toBe(before);
  expect(r.g("status", "--short")).toBe("");
});

// covers: chain/FRD-01/EX-19
test("FRD-01/EX-19: a document never committed prints no history and exits 0", () => {
  const r = repo();
  writeFileSync(r.doc, "Status: Draft\n" + body(""));
  expect(history(r.doc)).toEqual(["no history: not committed yet"]);
  const p = spawnSync("bun", [join(import.meta.dir, "../scripts/history.ts"), r.doc], { encoding: "utf8" });
  expect(p.status).toBe(0);
  expect(p.stdout.trim()).toBe("no history: not committed yet");
});

// covers: chain/FRD-01/EX-18
test("FRD-01/EX-18: the approval commit is found and ids changed since are grouped by id", () => {
  const r = repo();
  const v1 = body("");
  writeFileSync(r.doc, "Status: Draft\n" + v1);
  r.commit("2026-11-18", "docs: draft");
  writeFileSync(r.doc, approvedText(v1));
  r.commit("2026-11-20", "docs: approve");
  const v2 = v1.replace("shall work", "should work").replace("stay.\n", "stay.\n- **R-CHAIN-3.** New.\n");
  writeFileSync(r.doc, approvedText(v1).replace(v1, v2));
  r.commit("2026-11-22", "docs: edit");
  const out = history(r.doc);
  expect(out.filter((l) => /^\d{4}/.test(l))).toHaveLength(3);
  expect(out.join("\n")).toMatch(/approved at [0-9a-f]+ \(2026-11-20\)/);
  expect(out.slice(out.indexOf("changed since approval:") + 1)).toEqual(["  R-CHAIN-1: changed", "  R-CHAIN-3: added"]);
});

// covers: chain/FRD-01/EX-18
test("FRD-01/EX-18: a removed id is reported; an unchanged body reports no id", () => {
  const r = repo();
  const v1 = body("");
  writeFileSync(r.doc, approvedText(v1));
  r.commit("2026-11-20", "docs: approve");
  expect(history(r.doc).at(-1)).toBe("no id changed since approval");
  writeFileSync(r.doc, approvedText(v1).replace(v1, v1.replace("- **R-CHAIN-2.** The system shall stay.\n", "")));
  expect(history(r.doc).at(-1)).toBe("  R-CHAIN-2: removed");
});

// covers: chain/FRD-01/EX-18
test("FRD-01/EX-18: history follows a rename", () => {
  const r = repo();
  writeFileSync(r.doc, "Status: Draft\n" + body(""));
  r.commit("2026-11-18", "docs: draft");
  renameSync(r.doc, join(r.dir, "PRD2.md"));
  r.commit("2026-11-19", "docs: rename");
  expect(history(join(r.dir, "PRD2.md"))).toHaveLength(2);
});

// covers: chain/FRD-01/EX-18
test("FRD-01/EX-18: an Approval line that matches no commit is reported, the log still prints", () => {
  const r = repo();
  writeFileSync(r.doc, "Status: Approved (2026-11-20)\nApproval: content AAAAAAAAAAAA\n" + body(""));
  r.commit("2026-11-20", "docs: approve");
  const out = history(r.doc);
  expect(out[0]).toMatch(/docs: approve$/);
  expect(out[1]).toContain("approval commit not found");
});

test("usage: no argument or a missing file exits 2", () => {
  const s = join(import.meta.dir, "../scripts/history.ts");
  expect(spawnSync("bun", [s], { encoding: "utf8" }).status).toBe(2);
  expect(spawnSync("bun", [s, "nope.md"], { encoding: "utf8" }).status).toBe(2);
});
