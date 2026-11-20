#!/usr/bin/env bun
// Traceability scan (L-14): "covers: [slice/]FRD-NN/ID" tags in test files against the ids FRDs define.
//   bun scripts/trace.ts <docs root> <test dir>...     exit 0 pass, 1 fail ("FAIL <reason>"), 2 usage or unreadable path
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type Tag = { file: string; slice?: string; frd: string; id: string };

const ROW = /^\|\s*((?:EX|DT|ST|INV)-\d+)\s*\|/;
const WAIVER = /^\s*(?:[-*]\s+)?uncovered:\s*((?:EX|DT|ST|INV)-\d+)\b[ \t]*(.*)$/;
const TAG = /covers:\s*(?:([a-z][\w-]*)\/)?(FRD-\d+)\/((?:EX|DT|ST|INV)-\d+)\b/g;

// EX, DT, ST and INV ids defined as table rows.
export function frdIds(text: string): string[] {
  const ids: string[] = [];
  for (const line of text.split(/\r?\n/)) { const m = ROW.exec(line); if (m) ids.push(m[1]!); }
  return ids;
}

// id -> reason ("" when the waiver gives none). The waiver is a line of the FRD: "uncovered: EX-3 <reason>".
export function waivers(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) { const m = WAIVER.exec(line); if (m) out[m[1]!] = m[2]!.trim(); }
  return out;
}

function walk(dir: string, out: string[]): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (statSync(p).size < 1_000_000) out.push(p); // shortcut: binary files are read as text and simply match nothing
  }
}

export function scanTags(...dirs: string[]): Tag[] {
  const files: string[] = [];
  for (const d of dirs) walk(d, files);
  const tags: Tag[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(TAG)) tags.push({ file, slice: m[1], frd: m[2]!, id: m[3]! });
  }
  return tags;
}

type Frd = { slice: string; frd: string; path: string; approved: boolean; ids: string[]; waive: Record<string, string> };

function loadFrds(docsRoot: string): Frd[] {
  const out: Frd[] = [];
  for (const s of readdirSync(docsRoot, { withFileTypes: true })) {
    const dir = join(docsRoot, s.name, "frd");
    if (!s.isDirectory() || !existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const m = /^(FRD-\d+)-.*\.md$/.exec(f);
      if (!m) continue;
      const path = join(dir, f), text = readFileSync(path, "utf8");
      out.push({ slice: s.name, frd: m[1]!, path, approved: /^Status:\s*Approved/m.test(text), ids: frdIds(text), waive: waivers(text) });
    }
  }
  return out;
}

// fails break the run; notes (DT ids nobody tags) are reported only.
export function traceFails(docsRoot: string, testDirs: string[]): { fails: string[]; notes: string[] } {
  const frds = loadFrds(docsRoot), fails: string[] = [], notes: string[] = [];
  const covered = new Set<Frd>(), hit = new Set<string>();
  for (const t of scanTags(...testDirs)) {
    const name = (t.slice ? t.slice + "/" : "") + t.frd + "/" + t.id, at = " in " + t.file;
    const cands = frds.filter((f) => f.frd === t.frd && (!t.slice || f.slice === t.slice));
    if (cands.length > 1) { fails.push("ambiguous tag " + name + at + ": write " + cands.map((c) => c.slice + "/" + t.frd + "/" + t.id).join(" or ")); continue; }
    const f = cands[0];
    if (!f || !f.ids.includes(t.id)) { fails.push("dead tag " + name + at); continue; }
    covered.add(f); hit.add(f.path + "|" + t.id);
  }
  for (const f of frds) {
    const name = (id: string) => f.frd + "/" + id;
    for (const [id, why] of Object.entries(f.waive)) {
      if (!f.ids.includes(id)) fails.push("waiver for an id the FRD does not define: " + name(id));
      else if (!why) fails.push("waiver without a reason: " + name(id));
    }
    for (const id of f.ids) {
      if (hit.has(f.path + "|" + id) || f.waive[id] !== undefined) continue;
      if (id.startsWith("DT-")) notes.push("untagged: " + name(id) + " (" + relative(docsRoot, f.path) + ")");
      else if (f.approved) fails.push("uncovered: " + name(id) + " (" + relative(docsRoot, f.path) + ")");
    }
  }
  return { fails, notes };
}

if (import.meta.main) {
  const [root, ...dirs] = process.argv.slice(2);
  if (!root || !dirs.length || ![root, ...dirs].every((p) => existsSync(p))) {
    console.error("usage: bun scripts/trace.ts <docs root> <test dir>... (every path must exist)");
    process.exit(2);
  }
  const { fails, notes } = traceFails(root, dirs);
  for (const n of notes) console.log("NOTE " + n);
  for (const f of fails) console.log("FAIL " + f);
  process.exit(fails.length ? 1 : 0);
}
