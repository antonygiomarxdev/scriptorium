// The rework queue (FRD-01 of metrics): docs/metrics/rework.md holds the causes of rework and the open findings. Pure reads, no log.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cells } from "./lint-docs.ts"; // the table reading the CHECKS rules of lint-docs use

export const QUEUE = "docs/metrics/rework.md";
export type Cause = { id: string; step: string; prevention: string; since: string };
export type Finding = { id: string; date: string; change: string; cause: string };
export type Queue = { causes: Cause[]; findings: Finding[]; unreadable: string[] };

// A pipe inside a cell is not supported: it splits the cell, and the row is then reported as unreadable.
// undefined when the project has no rework queue. Rows start with "| C-" (cause) or "| R-" (finding); a row with too few cells is unreadable.
export function readQueue(root: string): Queue | undefined {
  const p = join(root, QUEUE);
  if (!existsSync(p)) return undefined;
  const q: Queue = { causes: [], findings: [], unreadable: [] };
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const isCause = /^\|\s*C-\d+\s*\|/.test(line);
    if (!isCause && !/^\|\s*R-\d+\s*\|/.test(line)) continue;
    const c = cells(line);
    if (isCause && c.length === 6) q.causes.push({ id: c[0]!, step: c[1]!, prevention: c[4]!, since: c[5]! });
    else if (!isCause && c.length === 5) q.findings.push({ id: c[0]!, date: c[1]!, change: c[2]!, cause: c[3]! });
    else q.unreadable.push(QUEUE + ": cannot read the row " + c[0] + " (" + c.length + " cells)");
  }
  return q;
}

// The Replay cell of each CHECKS.md row by id, read through the header row like the CHECKS rules of lint-docs (which also fail a row with no command).
function checkRows(root: string): Map<string, string> {
  const rows = new Map<string, string>();
  const p = join(root, "docs", "CHECKS.md");
  if (!existsSync(p)) return rows;
  let at = -1; // the Replay column of the header row; -1 when the table has none
  let header = false;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) {
      header = false;
      continue;
    }
    if (/^[\s:|-]+$/.test(line)) continue;
    const c = cells(line);
    if (!header) {
      header = true;
      at = c.indexOf("Replay");
    } else rows.set(c[0]!, c[at] ?? "");
  }
  return rows;
}

// RULE-1 to RULE-4: causes and findings agree, repeated causes get a prevention, a prevention is proven and holds. Tagged format 3.
export function reworkFails(root: string): string[] {
  const q = readQueue(root);
  if (!q) return [];
  const known = new Set(q.causes.map((c) => c.id));
  const fails = [...q.unreadable];
  for (const f of q.findings) {
    if (!f.cause) fails.push(f.id + ": no cause");
    else if (!known.has(f.cause)) fails.push(f.id + ": unknown cause " + f.cause);
  }
  const checks = checkRows(root);
  for (const c of q.causes) {
    const open = q.findings.filter((f) => f.cause === c.id);
    if (/^(none|)$/i.test(c.prevention)) {
      // DT-1, DT-2
      if (open.length >= 2) fails.push(c.id + " (" + c.step + ") found " + open.length + " times with no prevention: " + open.map((f) => f.id).join(", "));
      continue;
    }
    const check = checks.get(c.prevention);
    // DT-3: a prevention is proven when its row exists and has a replay
    if (check === undefined) fails.push(c.id + ": prevention " + c.prevention + " does not exist");
    else if (!check.trim()) fails.push(c.id + ": prevention " + c.prevention + " has no replay");
    else {
      const after = open.filter((f) => f.date >= c.since); // the same day counts as after
      if (after.length)
        fails.push(...after.map((f) => c.id + ": " + c.prevention + " did not prevent " + f.id)); // DT-4
      else fails.push(...open.map((f) => f.id + ": closed by " + c.prevention + ", remove it from the log")); // DT-5
    }
  }
  return fails.map((f) => "[format 3] " + f);
}
