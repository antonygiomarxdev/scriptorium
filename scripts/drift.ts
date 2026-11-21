#!/usr/bin/env bun
// Drift: a document's fingerprint, the Approval record written on approval, and the check against it (FRD-01, L-14).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { chainStatus } from "./check.ts";
import { toPosix } from "./paths.ts";

const STATUS = /^\**Status:?\**\s*(Draft|Approved)/i;
const APPROVAL = /^Approval: /;
const IGNORED = (l: string) => STATUS.test(l) || APPROVAL.test(l) || /^(Last change|Links):/.test(l); // header lines that may change after approval

// The form fingerprints had before FRD-08: kept so a document approved then still matches until it is approved again.
export function normalizeV1(text: string): string {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => !IGNORED(l))
    .join("\n")
    .trim();
}

// Formatting is not drift: runs of spaces collapse, blank lines drop and a table separator row has one form, besides the V1 rules.
export function normalize(text: string): string {
  return normalizeV1(text)
    .split("\n")
    .map((l) => l.replace(/ {2,}/g, " "))
    .filter((l) => l.trim() !== "")
    .map((l) =>
      /^\s*\|[\s:|-]*-[\s:|-]*\|\s*$/.test(l)
        ? "|" +
          l
            .trim()
            .slice(1, -1)
            .split("|")
            .map(() => "---")
            .join("|") +
          "|"
        : l,
    )
    .join("\n");
}

const hash = (s: string): string => createHash("sha256").update(s).digest("base64url").slice(0, 12);
export const fingerprint = (text: string): string => hash(normalize(text));
export const fingerprintV1 = (text: string): string => hash(normalizeV1(text));
// A stored fingerprint matches the text under either normalizer.
export const same = (stored: string | undefined, text: string): boolean => stored === fingerprint(text) || stored === fingerprintV1(text);

const read = (p: string) => readFileSync(p, "utf8");
const rel = (from: string, to: string) => toPosix(relative(dirname(from), to));

// The documents a document rests on, as chainStatus sees them (existing files only).
export function parents(docPath: string, root: string): string[] {
  const d = chainStatus(root).docs.find((x) => resolve(x.path) === resolve(docPath));
  return [d?.parent, ...(d?.also ?? [])].filter((p): p is string => !!p && existsSync(p));
}

type Record = { content: string; parents: Map<string, string> };

function parseApproval(line: string | undefined): Record | undefined {
  if (!line || !APPROVAL.test(line)) return undefined;
  const [first, ...rest] = line.slice("Approval: ".length).trim().split(/;\s*/);
  const content = first.match(/^content (\S+)$/)?.[1];
  if (!content) return undefined;
  const ps = new Map<string, string>();
  for (const r of rest) {
    const m = r.match(/^rests on (\S+) (\S+)$/);
    if (m) ps.set(m[1], m[2]);
  }
  return { content, parents: ps };
}

const record = (content: string, ps: [string, string][]) => "Approval: content " + content + ps.map(([p, h]) => "; rests on " + p + " " + h).join("");
const parentHashes = (docPath: string, root: string): [string, string][] => parents(docPath, root).map((p) => [rel(docPath, p), fingerprint(read(p))]);

function lines(text: string) {
  return { eol: text.includes("\r\n") ? "\r\n" : "\n", ls: text.split(/\r?\n/) };
}

export function approve(docPath: string, root: string, date: string): void {
  const { eol, ls } = lines(read(docPath));
  const i = ls.findIndex((l) => STATUS.test(l));
  if (i < 0) throw new Error("no Status line");
  const text = read(docPath);
  const hasRec = APPROVAL.test(ls[i + 1] ?? "");
  const d = chainStatus(root).docs.find((x) => resolve(x.path) === resolve(docPath));
  if (d?.parent && !existsSync(d.parent)) throw new Error("the document it rests on does not exist: " + d.parent);
  ls.splice(i, hasRec ? 2 : 1, "Status: Approved (" + date + ")", record(fingerprint(text), parentHashes(docPath, root)));
  writeFileSync(docPath, ls.join(eol));
}

// Refuses (throws, file untouched) for a draft, a missing record or an edited body; else rewrites only the parent hashes.
export function clear(docPath: string, root: string): void {
  const text = read(docPath);
  const { eol, ls } = lines(text);
  const i = ls.findIndex((l) => STATUS.test(l));
  if (i < 0 || !/Approved/i.test(ls[i])) throw new Error("not approved: nothing to clear");
  const rec = parseApproval(ls[i + 1]);
  if (!rec) throw new Error("approval record missing: approve it");
  if (!same(rec.content, text)) throw new Error("body changed since approval: approve it again");
  ls[i + 1] = record(rec.content, parentHashes(docPath, root));
  writeFileSync(docPath, ls.join(eol));
}

export type Drift = { path: string; cause: "missing" | "body" | "parent"; parent?: string };

// Every approved document (not ADR or request) checked against its record. First matching row of the decision table wins.
export function driftReport(root: string): Drift[] {
  const out: Drift[] = [];
  for (const d of chainStatus(root).docs) {
    if (!d.approved || d.kind === "ADR" || d.kind === "REQUEST") continue;
    const text = read(d.path);
    const { ls } = lines(text);
    const rec = parseApproval(ls[ls.findIndex((l) => STATUS.test(l)) + 1]);
    if (!rec) {
      out.push({ path: d.path, cause: "missing" });
      continue;
    }
    if (!same(rec.content, text)) {
      out.push({ path: d.path, cause: "body" });
      continue;
    }
    const bad = parents(d.path, root).find((p) => !same(rec.parents.get(rel(d.path, p)), read(p)));
    if (bad) out.push({ path: d.path, cause: "parent", parent: rel(d.path, bad) });
  }
  return out;
}

// A missing record is a warning only, so projects approved before records existed keep passing.
export function driftFails(root: string): { fails: string[]; warnings: string[] } {
  const r = driftReport(root);
  return {
    fails: r.filter((x) => x.cause !== "missing").map((x) => x.path + ": " + (x.cause === "body" ? "body changed since approval: approve it again" : "suspect: " + x.parent + " changed since approval: clear or approve it again")),
    warnings: r.filter((x) => x.cause === "missing").map((x) => x.path + ": approved without an Approval line; approve it again to record one"),
  };
}

if (import.meta.main) {
  const [cmd, path, root = process.cwd()] = process.argv.slice(2);
  if (!["approve", "clear", "check"].includes(cmd ?? "") || !path) {
    console.error("usage: bun scripts/drift.ts approve|clear|check <path> [root]");
    process.exit(2);
  }
  try {
    if (cmd === "approve") approve(path, root, new Date().toISOString().slice(0, 10));
    else if (cmd === "clear") clear(path, root);
    else {
      const { fails, warnings } = driftFails(root);
      const mine = (m: string) => resolve(m.split(": ")[0]) === resolve(path);
      for (const w of warnings.filter(mine)) console.log("warning: " + w);
      const f = fails.filter(mine);
      f.forEach((m) => console.error(m));
      process.exit(f.length ? 1 : 0);
    }
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
