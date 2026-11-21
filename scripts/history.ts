#!/usr/bin/env bun
// History of a document, read from git (L-14 part 3, FRD-01). Writes no file.
//   bun scripts/history.ts <doc>     exit 0 printed, 1 git failed, 2 usage or no such file
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { same } from "./drift.ts";

export type Commit = { date: string; sha: string; subject: string; path: string };

const git = (cwd: string, ...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// Commits that touched the file, newest first; path is the file's name in that commit (renames followed).
export function commits(doc: string): Commit[] {
  const cwd = dirname(resolve(doc));
  let out: string;
  try {
    out = git(cwd, "log", "--follow", "--name-only", "--format=%x01%as|%h|%s", "--", basename(doc));
  } catch (e) {
    if (/does not have any commits/.test(String((e as { stderr?: string }).stderr))) return [];
    throw e;
  }
  return out
    .split("\x01")
    .filter(Boolean)
    .map((b) => {
      const [head, ...rest] = b.split("\n");
      const [date, sha, ...s] = head.split("|");
      return { date, sha, subject: s.join("|"), path: rest.find((l) => l.trim())?.trim() ?? "" };
    });
}

// Oldest commit whose body fingerprint equals the recorded content hash; among those, the first that holds the Approval line itself
// (a draft with the same body comes earlier, but it was not the approval).
export function approvalCommit(doc: string, cs: Commit[], hash: string): Commit | undefined {
  const cwd = dirname(resolve(doc));
  const hits = [...cs]
    .reverse()
    .map((c) => ({ c, t: git(cwd, "show", c.sha + ":" + c.path) }))
    .filter((x) => same(hash, x.t));
  return (hits.find((x) => x.t.includes("Approval: content " + hash)) ?? hits[0])?.c;
}

const ID = /^\s*(?:\|\s*|- \*\*)((?:FR-[A-Z0-9]+-\d+-\d+|R-[A-Z0-9]+-\d+|EX-\d+|RULE-\d+|DT-\d+|ST-\d+|INV-\d+|QC-\d+))\b/;

// id -> its line, for lines that start with an id (table first cell or bold list item).
const byId = (text: string) => {
  const m = new Map<string, string>();
  for (const l of text.split(/\r?\n/)) {
    const id = ID.exec(l)?.[1];
    if (id && !m.has(id)) m.set(id, l.trim().replace(/\s+/g, " "));
  }
  return m;
};

export function changedIds(before: string, after: string): string[] {
  const a = byId(before),
    b = byId(after);
  const out: string[] = [];
  for (const [id, l] of b) out.push(...(!a.has(id) ? [id + ": added"] : a.get(id) !== l ? [id + ": changed"] : []));
  for (const id of a.keys()) if (!b.has(id)) out.push(id + ": removed");
  const key = (s: string) => s.split(":")[0];
  return out.sort((x, y) => key(x).localeCompare(key(y), undefined, { numeric: true }));
}

export function history(doc: string): string[] {
  const cwd = dirname(resolve(doc));
  const cs = commits(doc);
  if (!cs.length) return ["no history: not committed yet"];
  const out = cs.map((c) => c.date + " " + c.sha + " " + c.subject);
  const text = readFileSync(doc, "utf8");
  const hash = /^Approval: content (\S+?)(?:;|$)/m.exec(text)?.[1];
  if (!hash) return out;
  const ap = approvalCommit(doc, cs, hash);
  if (!ap) return [...out, "approval commit not found: no commit holds a body with fingerprint " + hash];
  out.push("approved at " + ap.sha + " (" + ap.date + ")");
  const ch = changedIds(git(cwd, "show", ap.sha + ":" + ap.path), text);
  out.push(ch.length ? "changed since approval:" : "no id changed since approval", ...ch.map((c) => "  " + c));
  return out;
}

if (import.meta.main) {
  const doc = process.argv[2];
  if (!doc || !existsSync(doc)) {
    console.error("usage: bun scripts/history.ts <doc>");
    process.exit(2);
  }
  try {
    console.log(history(doc).join("\n"));
  } catch (e) {
    console.error("history failed: " + ((e as { stderr?: string }).stderr || (e as Error).message).trim());
    process.exit(1);
  }
}
