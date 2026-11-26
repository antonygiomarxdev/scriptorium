#!/usr/bin/env bun
// Scriptorium checks. Exit 0 when the document passes, 1 when it fails (every failure printed), 2 on bad usage.
//   bun scripts/check.ts prd <docs/slice/PRD.md> <SLICE_ID> [--product docs/PRODUCT.md]
//   bun scripts/check.ts frd <docs/slice> <SLICE_ID>
//   bun scripts/check.ts ux <docs/slice>
//   bun scripts/check.ts tp <TP.md> <adr dir> [--root docs]
//   bun scripts/check.ts spec <SPEC.md>
//   bun scripts/check.ts excerpt <file> <ID>...   print the rows of a file that a spec quotes
//   bun scripts/check.ts done <SPEC.md>           run the command of Done when, if the spec is approved
//   bun scripts/check.ts status [root]
//   bun scripts/check.ts summary <file>
//   bun scripts/check.ts approve <doc> [root] [--date YYYY-MM-DD]   write Status and the Approval record (default: today)
//   bun scripts/check.ts clear <doc> [root]        rewrite the parent fingerprints of a suspect document
//   bun scripts/check.ts drift [root]              fail an approved document whose body or parent changed since approval
//   bun scripts/check.ts trace [root] [test dir]...  covers tags against the ids the FRDs define (default test dir: test)
//   bun scripts/check.ts history <doc>             one line per commit, from git
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fromDoc, isTest, toPosix, typed } from "./paths.ts";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { approve, clear, driftReport, driftFails } from "./drift.ts";
import { traceFails } from "./trace.ts";
import { history } from "./history.ts";
import { ADR_NAME, docNumber, kindOf, RESERVED } from "./kinds.ts";
import { cells } from "./lint-docs.ts";
import { reworkFails } from "./rework.ts";
import { gate, legacyAdrsThrough, pinProblem, readFormat } from "./format.ts";

// A PRD or FRD says what, not how: these names belong in the Technical Proposal.
// shortcut: fixed list, make it configurable per project when a project needs other words.
const TECH = /\b(Bun|Node(\.js)?|TypeScript|Python|SQLite|Postgres|MySQL|Redis|JSONL?|CSV|YAML|HTTP|REST|GraphQL|HMAC|npm|endpoint|webhook handler|MCP tool)\b/;
// Folders under docs/ that are not slices.
export { RESERVED }; // the one list lives in kinds.ts, next to the rule that uses it
const VAGUE = /^(fast|quick|secure|easy|simple|robust|user-friendly|good|nice)\.?$/i;

const STATUS = /^\**Status:?\**\s*(Draft\b|Approved \(\d{4}-\d{2}-\d{2}\)|Superseded by \S.*? \(\d{4}-\d{2}-\d{2}\))/im;
const SUPERSEDED = /^\**Status:?\**\s*Superseded by (\S.*?) \(\d{4}-\d{2}-\d{2}\)\s*$/im;
const NO_STATUS = "no Status line (Status: Draft, Status: Approved (YYYY-MM-DD) or Status: Superseded by <path> (YYYY-MM-DD))";

const missing = (text: string, heads: string[]) => heads.filter((h) => !new RegExp("^## .*" + h, "mi").test(text)).map((h) => "missing section: ## " + h);

// Body of the "## <head>" section, up to the next "## " heading.
function section(text: string, head: string): string | undefined {
  const m = new RegExp("^## .*" + head + ".*$", "mi").exec(text);
  if (!m) return undefined;
  const rest = text.slice(m.index + m[0].length);
  return rest.split(/^## /m)[0];
}

// Table rows of a section as arrays of trimmed cells.
const rows = (body: string) =>
  body
    .split("\n")
    .filter((l) => /^\s*\|/.test(l))
    .map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim()),
    );

const idsIn = (text: string, re: RegExp) => new Set([...text.matchAll(re)].map((m) => m[0]));
const FR_ANY = /\bFR-[A-Z0-9]+-\d{2}-\d+\b/g;

// Format 4: a section that carries a diagram holds a fenced Mermaid block. prefix names the file in a folder check.
function diagramFails(text: string, head: string, prefix = ""): string[] {
  const body = section(text, head);
  return body !== undefined && !/^\s*```mermaid\b/m.test(body) ? ["[format 4] " + prefix + head + " has no Mermaid block"] : [];
}

// Format 3: each Q-n line of Open questions says who answers it: (Owner: <reason>), (Research) or (Lead). prefix names the file in a folder check.
export function answererFails(text: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const l of (section(text, "Open questions") ?? "").split(/\r?\n/)) {
    const q = /\b(Q-\d+)\b(.*)$/.exec(l); // any line with a Q-n id is a question, as the status rule reads it
    if (!q) continue;
    const who = /^\s*\(\s*(Owner|Research|Lead)\s*(?::([^)]*))?\)/.exec(q[2]!);
    if (!who) out.push(q[1] + ": say who answers it: (Owner: <reason>), (Research) or (Lead)");
    else if (who[1] === "Owner" && !who[2]?.trim().replace(/^<.*>$/, "")) out.push(q[1] + ": say why only the owner can answer it");
  }
  return out.map((m) => "[format 3] " + prefix + m);
}

export function checkPrd(text: string, slice: string, product: string): string[] {
  const fails = STATUS.test(text) ? [] : [NO_STATUS];
  fails.push(...missing(text, ["Summary", "Why", "Use cases", "Requirements", "Principles", "Non-goals", "Dependencies", "Success criteria", "Open questions"]));
  const reqs = new Set([...text.matchAll(new RegExp("\\bR-" + slice + "-(\\d+)\\b", "g"))].map((m) => m[1]));
  if (reqs.size < 3) fails.push("fewer than 3 requirement IDs like R-" + slice + "-1");

  const ucs = new Set([...product.matchAll(/\bUC-(\d+)\b/g)].map((m) => m[1]));
  const cited = [...text.matchAll(/\bUC-(\d+)\b/g)].map((m) => m[1]);
  for (const u of cited) if (!ucs.has(u)) fails.push("unknown use case UC-" + u);
  if (!cited.length) fails.push("cites no use case UC-n");

  const principles = countPrinciples(product);
  const cp = [...text.matchAll(/principle\s+(\d+)/gi)].map((m) => +m[1]);
  for (const p of cp) if (p < 1 || p > principles) fails.push("unknown principle " + p);
  if (!cp.length) fails.push("cites no principle by number");

  if (!/\.\.\/PRODUCT\.md/.test(text)) fails.push("does not link ../PRODUCT.md");
  const t = text.match(TECH);
  if (t) fails.push('technology named in a PRD: "' + t[0] + '" (move to the TP)');
  return [...fails, ...answererFails(text)];
}

const EARS = /\b(WHEN|WHILE|IF|WHERE|always)\b/;

// One FRD. nn is the number in its file name; prdReqs the requirement ids of its PRD.
export function checkFrd(s: string, f: string, slice: string, nn: string, prdReqs: Set<string>): { fails: string[]; covered: string[] } {
  const fails = missing(s, ["Summary", "Why", "Requirements covered", "Behavior", "Rules and examples", "Decision table", "States", "Invariants", "Quality criteria", "Cross-cutting", "Information", "Open questions", "Acceptance criteria"]).map((x) => f + ": " + x);
  const fail = (m: string) => fails.push(f + ": " + m);
  if (!STATUS.test(s)) fail(NO_STATUS);
  if (!/\.\.\/PRD\.md/.test(s)) fail("does not link ../PRD.md");
  const cites = [...s.matchAll(new RegExp("\\bR-" + slice + "-(\\d+)\\b", "g"))].map((m) => "R-" + slice + "-" + m[1]);
  if (!cites.length) fail("cites no R-" + slice + "-n");
  const covered: string[] = [];
  for (const r of cites) prdReqs.has(r) ? covered.push(r) : fail("cites " + r + ", not in the PRD");

  // Behavior: one EARS row per FR id.
  const prefix = "FR-" + slice + "-" + nn + "-";
  const beh = rows(section(s, "Behavior") ?? "").filter((c) => /^FR-/.test(c[0]));
  if (beh.length < 2) fail("fewer than 2 rows " + prefix + "n in the Behavior table");
  for (const c of beh) {
    if (!c[0].startsWith(prefix)) fail(c[0] + " does not belong to this FRD (expected " + prefix + "n)");
    if (!EARS.test(c[1] ?? "")) fail(c[0] + ": Pattern is not WHEN, WHILE, IF, WHERE or always");
    if (!/\bshall\b/.test(c.slice(2).join("|"))) fail(c[0] + ': requirement has no "shall"');
  }

  // Rules and examples: every rule has a positive and a negative or boundary example.
  const re = section(s, "Rules and examples") ?? "";
  const rules = rows(re)
    .filter((c) => /^RULE-\d+$/.test(c[0]))
    .map((c) => c[0]);
  const exs = rows(re).filter((c) => /^EX-\d+$/.test(c[0]));
  if (!rules.length) fail("no RULE-n in Rules and examples");
  for (const e of exs) if (!rules.includes(e[1])) fail(e[0] + " cites " + e[1] + ", not a rule of this FRD");
  for (const r of rules) {
    const kinds = exs.filter((e) => e[1] === r).map((e) => (e[2] ?? "").toLowerCase());
    if (!kinds.includes("positive")) fail(r + ": no positive example");
    if (!kinds.some((k) => k === "negative" || k === "boundary")) fail(r + ": no negative or boundary example");
  }

  // Decision table, States, Invariants: ids, or an explained n/a.
  for (const [head, tag] of [
    ["Decision table", "DT"],
    ["States", "ST"],
    ["Invariants", "INV"],
  ] as const) {
    const id = new RegExp("\\b" + tag + "-\\d+\\b");
    const b = section(s, head);
    if (b !== undefined && !id.test(b) && !/n\/a:\s*[^<\s]/i.test(b)) fail(head + " holds no " + tag + '-n row and no "n/a: <reason>"');
  }

  // Quality criteria: QC-1..QC-9, each measurable or an explained n/a.
  const qc = new Map(
    rows(section(s, "Quality criteria") ?? "")
      .filter((c) => /^QC-\d$/.test(c[0]))
      .map((c) => [c[0], c.slice(2).join("|").trim()]),
  );
  for (let i = 1; i <= 9; i++) {
    const v = qc.get("QC-" + i);
    if (v === undefined) fail("QC-" + i + " missing from Quality criteria");
    else if (!v) fail("QC-" + i + " is empty");
    else if (VAGUE.test(v)) fail("QC-" + i + ' is only "' + v + '": give a metric, a threshold and how it is measured');
    else if (/^n\/a/i.test(v) && !/^n\/a:\s*[^<\s]/i.test(v)) fail("QC-" + i + ' says n/a without "n/a: <reason>"');
  }
  const t = s.match(TECH);
  if (t) fail('technology named: "' + t[0] + '" (belongs in the TP)');
  fails.push(...answererFails(s, f + ": "));
  const states = section(s, "States") ?? "";
  if (!/n\/a:\s*[^<\s]/i.test(states)) fails.push(...diagramFails(s, "States", f + ": ")); // an explained n/a needs no diagram
  return { fails, covered };
}

export function checkFrds(dir: string, slice: string): { fails: string[]; files: number; reqs: number } {
  const prd = readFileSync(join(dir, "PRD.md"), "utf8");
  const prdReqs = new Set([...prd.matchAll(new RegExp("\\bR-" + slice + "-(\\d+)\\b", "g"))].map((m) => "R-" + slice + "-" + m[1]));
  const frdDir = join(dir, "frd");
  const fails: string[] = [];
  const files = existsSync(frdDir)
    ? readdirSync(frdDir)
        .filter((f) => kindOf("x/frd/" + f) === "FRD")
        .sort()
    : [];
  if (!files.length) fails.push("no FRD files named FRD-NN-name.md in " + frdDir);
  const covered = new Set<string>();
  for (const f of files) {
    const r = checkFrd(readFileSync(join(frdDir, f), "utf8"), f, slice, docNumber(f)!, prdReqs);
    fails.push(...r.fails);
    r.covered.forEach((c) => covered.add(c));
  }
  for (const r of prdReqs) if (!covered.has(r)) fails.push("PRD requirement " + r + " is covered by no FRD");
  return { fails, files: files.length, reqs: prdReqs.size };
}

const nnFile = (d: string, prefix: string, nn: string) => (existsSync(d) ? readdirSync(d).find((f) => f.startsWith(prefix + "-" + nn + "-") && kindOf("x/" + basename(d) + "/" + f)) : undefined);

// diagrams: also hold the Flows section to a Mermaid block (format 4).
export function checkUx(dir: string, diagrams = true): { fails: string[]; files: number } {
  const uxDir = join(dir, "ux");
  const files = existsSync(uxDir)
    ? readdirSync(uxDir)
        .filter((f) => /^UX-\d{2}-[a-z0-9-]+\.md$/.test(f))
        .sort()
    : [];
  const fails: string[] = [];
  for (const f of files) {
    const s = readFileSync(join(uxDir, f), "utf8");
    if (!STATUS.test(s)) fails.push(f + ": " + NO_STATUS);
    fails.push(...missing(s, ["Summary", "Flows", "Screens", "States", "Design system", "Accessibility and language", "Open questions"]).map((x) => f + ": " + x));
    fails.push(...answererFails(s, f + ": "), ...(diagrams ? diagramFails(s, "Flows", f + ": ") : []));
    const nn = docNumber(f)!;
    if (!nnFile(join(dir, "frd"), "FRD", nn)) fails.push(f + ": FRD-" + nn + " does not exist in " + join(dir, "frd"));
  }
  return { fails, files: files.length };
}

// FR ids a FRD defines: the first cell of a Behavior row.
export const frDefs = (frd: string) =>
  new Set(
    rows(section(frd, "Behavior") ?? "")
      .map((c) => c[0])
      .filter((c) => /^FR-/.test(c)),
  );

// A TP lists its decisions as "### TD-n: title", each with at least two options and a chosen one backed by an ADR or an explained "none".
// knownFrs: every FR id defined in the project, so the TP can only cite real requirements.
// An ADR file is ADR-<id>-name.md or <id>-name.md (legacy), the dash after the id kept.
const ADR_FILE = ADR_NAME;

// The number of an ADR file or path (ADR-0021-x.md and 0021-x.md both give 21).
export function adrNumber(file: string): number | undefined {
  const n = /^(?:ADR-)?(\d+)-/.exec(file.split(/[\\/]/).pop()!)?.[1];
  return n === undefined ? undefined : Number(n);
}

// The file of a cited ADR-<id>, the dash after the id kept: ADR-<id>-*.md or <id>-*.md.
const adrFileFor = (files: string[], id: string): string | undefined => files.find((f) => f.startsWith(id + "-") || f.startsWith(id.slice(4) + "-"));

// Ids a TP may cite when it rests on a request or a registry: "- ID-n:" lines of the request's Decision, or the first cell of the registry's rows.
const ID = /\b([A-Z][A-Z0-9]*)-(\d+)\b/g;
function parentIds(parent: string): { name: string; ids: Set<string>; what: string } | undefined {
  const base = basename(parent);
  const text = readFileSync(parent, "utf8");
  const req = /^(REQ-\d+)/.exec(base)?.[1];
  if (req) return { name: req, what: req + "'s Decision", ids: new Set((section(text, "Decision") ?? "").split(/\r?\n/).flatMap((l) => /^\s*[-*]\s+([A-Z][A-Z0-9]*-\d+):/.exec(l)?.[1] ?? [])) };
  if (REGISTRY.test(base)) return { name: base, what: base, ids: new Set(text.split(/\r?\n/).flatMap((l) => (/^\s*\|/.test(l) ? (/^\|?\s*([A-Z][A-Z0-9]*-\d+)\s*\|/.exec(l)?.[1] ?? []) : []))) };
  return undefined;
}

// tpPath: with a Rests on line to a request or a registry, the TP cites that document's ids; without, FR ids as before.
export function checkTp(text: string, adrDir: string, knownFrs: Set<string>, tpPath?: string): string[] {
  const fails = STATUS.test(text) ? [] : [NO_STATUS];
  fails.push(...missing(text, ["Summary", "Context", "Decisions", "Architecture", "Information", "Interfaces", "Threat model", "Testing", "Risks", "Open questions"]));
  const on = restsOn(text);
  const parent = on && tpPath ? fromDoc(tpPath, on) : undefined;
  const from = parent && existsSync(parent) ? parentIds(parent) : undefined;
  if (on && parent && !existsSync(parent)) fails.push("rests on " + on + ", which does not exist");
  else if (from) {
    if (!from.ids.size) fails.push(from.name + ": give each decision an id (CI-1, CI-2) so the TP can cite it");
    else {
      const prefixes = new Set([...from.ids].map((i) => i.split("-")[0]));
      const cited = [...new Set([...text.matchAll(ID)].filter((m) => prefixes.has(m[1]!)).map((m) => m[0]))];
      if (!cited.length) fails.push("cites no id of " + from.what);
      for (const c of cited) if (!from.ids.has(c)) fails.push("cites " + c + ", not in " + from.what);
    }
  } else {
    const cited = idsIn(text, FR_ANY);
    if (!cited.size) fails.push("cites no FR id");
    for (const fr of cited) if (!knownFrs.has(fr)) fails.push("cites " + fr + ", defined in no FRD");
  }
  const adrs = existsSync(adrDir) ? readdirSync(adrDir).filter((f) => ADR_FILE.test(f)) : [];
  const blocks = text.split(/^### (?=TD-\d+)/m).slice(1);
  if (!blocks.length) fails.push("no decisions written as ### TD-n: title");
  for (const b of blocks) {
    const id = b.match(/^TD-\d+/)![0];
    if ((b.match(/^\s*[-*]\s+\*\*Option\b/gim) ?? []).length < 2) fails.push(id + ": fewer than 2 options (- **Option A** ...)");
    if (!/^\**Chosen\b/im.test(b)) fails.push(id + ': no "Chosen:" line');
    const adr = b.match(/\bADR:\s*(ADR-\d{3,}|none:\s*\S)/);
    if (!adr) fails.push(id + ': no "ADR: ADR-NNN" or "ADR: none: <reason>"');
    else if (adr[1].startsWith("ADR-") && !adrFileFor(adrs, adr[1])) fails.push(id + ": " + adr[1] + " has no file in " + adrDir);
  }
  if (text.match(/\b(TBD|TODO)\b/)) fails.push("contains TBD or TODO");
  return [...fails, ...answererFails(text), ...diagramFails(text, "Architecture")];
}

const defsIn = (frd: string, head: string, re: RegExp) => [...idsIn(section(frd, head) ?? "", re)];

// A small spec (L-15): one agent run. It rests on one parent, quotes the rows it builds verbatim, names the tests first and one command.
const SPEC_ID = /\b[A-Z]+(?:-[A-Z0-9]+)*-\d+\b/g;
const DOC_ID = /^(SPEC|FRD|TP|ADR|REQ|UX|PRD|R)-/;
const PARENT_OK = /^(FRD-\d+-.+|TP(-\d+-.+)?|ADR-\d+-.+|REQ-\d+-.+)\.md$|^(CHECKS|INVARIANTS|CROSS-CUTTING)\.md$/;
const REGISTRY = /^(CHECKS|INVARIANTS|CROSS-CUTTING)\.md$/;
const isSep = (l: string) => /^[\s|:-]+$/.test(l);

// Path after "Rests on:" in the first 20 lines.
export const restsOn = (text: string): string | undefined => /^Rests on:\s*`?([^\s`]+)/m.exec(text.split(/\r?\n/).slice(0, 20).join("\n"))?.[1];

// The row lines of a Rows section: table rows and bullets, minus the "Quoted from:" line and table separators.
const rowLines = (body: string) =>
  body
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => /^\s*(\||[-*]\s)/.test(l) && !isSep(l) && !/Quoted from:/.test(l));

// The project of a document: the folder holding the docs/ folder above it, wherever the command runs from; undefined when the path has none.
function projectRoot(doc: string): string | undefined {
  const p = toPosix(resolve(doc));
  const i = p.lastIndexOf("/docs/");
  return i < 0 ? undefined : p.slice(0, i);
}

// The rows of a spec's Files section: table rows and bullets, minus the separator.
const filesLines = (text: string): string[] => (section(text, "Files") ?? "").split(/\r?\n/).filter((l) => /^\s*(\||[-*]\s)/.test(l) && !isSep(l));

// Format 3: the Reuses section names the code a spec builds on (path and name, each found), a precedent spec, or why there is nothing to reuse.
function reusesFails(text: string, specPath: string): string[] {
  const body = section(text, "Reuses");
  const lines = (body ?? "").split(/\r?\n/);
  const root = projectRoot(specPath) ?? "";
  const fails: string[] = [];
  let entries = 0;
  for (const l of lines) {
    const code = /^\s*[-*]\s+`([^`]+)`\s+`([^`]+)`/.exec(l); // a bullet is part of an entry; a line without one gets the "what to write" failure
    const nothing = /Nothing to reuse(?::\s*(.*))?/.exec(l);
    const prec = /Precedent:\s*`?([\w.-]+\.md)/.exec(l);
    if (code) {
      entries++;
      const file = typed(code[1]!);
      const abs = resolve(root, file);
      const inside = !relative(root, abs).startsWith("..") && !isAbsolute(file); // a path that leaves the project counts as not existing
      if (!inside || !existsSync(abs)) fails.push("Reuses: " + file + " does not exist");
      else if (statSync(abs).isDirectory()) fails.push("Reuses: " + file + " is a directory, name a file");
      else if (!new RegExp("(?<![\\w$])" + code[2]!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w$])").test(readFileSync(abs, "utf8"))) fails.push("Reuses: " + code[2] + " is not in " + file);
    } else if (nothing) {
      entries++;
      if (!nothing[1]?.trim().replace(/^[.\s]+$/, "")) fails.push("Reuses: say why there is nothing to reuse");
    } else if (prec) {
      entries++;
      const dd = join(root, "docs");
      const found = existsSync(dd) && readdirSync(dd, { withFileTypes: true }).some((e) => e.isDirectory() && existsSync(join(dd, e.name, "specs", prec[1]!)));
      if (!found) fails.push("Reuses: precedent " + prec[1] + " does not exist");
    }
  }
  if (!entries)
    return [body === undefined ? "no Reuses section: name the code and the precedent spec it builds on, or Nothing to reuse: <reason>" : "Reuses section has no valid entry, write one of: - `path` `name`, Nothing to reuse: <reason>, Precedent: SPEC-....md"].map((f) => "[format 3] " + f);
  return fails.map((f) => "[format 3] " + f);
}

// Format 4: a path named in Files, Tests first or Done when must be a file git tracks, unless a Files row marks it Create.
// A path ending in a slash is a folder: it counts when git tracks a file under it. Outside a git repository nothing can be told, so nothing fails.
function trackedFails(text: string, specPath: string): string[] {
  const root = projectRoot(specPath) ?? "";
  let tracked: string[];
  try {
    tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
  const created = new Set<string>();
  const named = new Set<string>();
  const placeholder = (p: string) => /[<>]/.test(p);
  for (const l of filesLines(text).filter((x) => x.trim().startsWith("|"))) {
    const c = cells(l);
    const p = typed(c[0]!.replace(/`/g, ""));
    if (!/[\w]\/|\w\.\w/.test(p) || p === "Path" || placeholder(p)) continue;
    named.add(p);
    if (/^Create\b/i.test(c[1] ?? "")) created.add(p);
  }
  for (const body of [section(text, "Tests first") ?? "", section(text, "Done when") ?? ""])
    for (const m of body.matchAll(/(?:^|[\s`(,])((?:[\w.-]+\/)+[\w.-]*)(?=$|[\s`),:;])/g)) {
      // prose is read for files and folders only: a name with an extension or a trailing slash; "EX-n." and the like are not paths
      const p = typed(m[1]!).replace(/\.+$/, (d) => (m[1]!.endsWith("/") ? d : ""));
      if (/\.\w+$/.test(p) || p.endsWith("/")) named.add(p);
    }
  return [...named].filter((p) => !created.has(p) && !(p.endsWith("/") ? tracked.some((t) => t.startsWith(p)) : tracked.includes(p) || tracked.some((t) => t.startsWith(p + "/")))).map((p) => "[format 4] " + p + " is not a tracked file");
}

// Format 4: the code blocks of a Build section declare functions, methods and constructors and call them. A call whose argument count
// differs from the declaration of the same name in a sibling spec of the folder fails. Arguments are counted at the top level.
type Sig = { key: string; min: number; max: number; decl: boolean }; // a call has min = max; a declaration has a range (optional and rest parameters)
const KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "function", "return", "super", "typeof", "await"]);

// The argument count of the parenthesis opened at `open`, and where it closes; undefined when it never closes.
function args(code: string, open: number): { count: number; end: number } | undefined {
  let depth = 0;
  let commas = 0;
  let any = false;
  let quote = "";
  for (let i = open + 1; i < code.length; i++) {
    const c = code[i]!;
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") (quote = c), (any = true);
    else if ("([{".includes(c)) depth++, (any = true);
    else if (")]}".includes(c)) {
      if (depth === 0) return { count: any ? commas + 1 : 0, end: i };
      depth--;
    } else if (c === "," && depth === 0) commas++;
    else if (!/\s/.test(c)) any = true;
  }
  return undefined;
}

// The parameters of a declaration, split at the top-level commas; "<" and ">" nest, so "Map<string, number>" is one parameter.
function params(inner: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = "";
  let cur = "";
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]!;
    if (quote) {
      if (c === "\\") cur += inner[i++] ?? "";
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("([{<".includes(c)) depth++;
    else if (")]}>".includes(c) && !(c === ">" && inner[i - 1] === "=")) depth = Math.max(0, depth - 1); // "=>" is an arrow, not a closing bracket
    if (c === "," && depth === 0 && !quote) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((p) => p.trim()).filter(Boolean);
}

function signatures(code: string): Sig[] {
  const classes = [...code.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)].map((m) => ({ name: m[1]!, at: m.index! }));
  const out: Sig[] = [];
  for (const m of code.matchAll(/(\bnew\s+)?([A-Za-z_$][\w$]*)\s*\(/g)) {
    const name = m[2]!;
    const a = args(code, m.index! + m[0].length - 1);
    if (!a || KEYWORDS.has(name)) continue;
    const before = code.slice(0, m.index!);
    // a declaration: "function f(", or a method or constructor at the start of a line followed by a body
    const decl = /\bfunction\s+$/.test(before) || (!m[1] && /^\s*(:\s*[^{;\n]+)?\{/.test(code.slice(a.end + 1)) && /(^|\n)[ \t]*((async|static|public|private)\s+)*$/.test(before));
    const owner = [...classes].reverse().find((c) => c.at < m.index!);
    const ps = decl ? params(code.slice(m.index! + m[0].length, a.end)) : [];
    const optional = (p: string) => /^\.\.\./.test(p) || /^[\w$]+\s*\?/.test(p) || /^[\w$]+(\s*:[^=]*)?\s*=(?![=>])/.test(p); // rest, "name?" and "name = default"
    const min = decl ? ps.filter((p) => !optional(p)).length : a.count;
    const max = decl ? (ps.some((p) => p.startsWith("...")) ? Infinity : ps.length) : a.count;
    out.push({ key: name === "constructor" ? "new " + (owner?.name ?? "") : (m[1] ? "new " : "") + name, min, max, decl });
  }
  return out;
}

function siblingFails(text: string, specPath: string): string[] {
  const code = (t: string) => [...(section(t, "Build") ?? "").matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]).join("\n");
  const id = (f: string) => /^SPEC-\d+-\d+/.exec(f)?.[0] ?? f;
  const dir = dirname(specPath);
  const me = basename(specPath);
  const mine = signatures(code(text)).filter((s) => !s.decl);
  const fails: string[] = [];
  for (const f of (existsSync(dir) ? readdirSync(dir) : []).filter((x) => /^SPEC-\d+-\d+.*\.md$/.test(x) && x !== me)) {
    const theirs = signatures(code(readFileSync(join(dir, f), "utf8"))).filter((s) => s.decl);
    for (const c of mine) {
      const same = theirs.filter((s) => s.key === c.key);
      if (same.length && !same.some((s) => c.min >= s.min && c.min <= s.max))
        fails.push("[format 4] " + c.key.replace(/^new /, "") + " takes " + (same[0]!.min === same[0]!.max ? same[0]!.min : same[0]!.min + " to " + (same[0]!.max === Infinity ? "any number of" : same[0]!.max)) + " arguments in " + id(f) + " and is called with " + c.min + " in " + id(me));
    }
  }
  return [...new Set(fails)];
}

export function checkSpec(text: string, specPath: string): string[] {
  const fails: string[] = [];
  if (!STATUS.test(text)) fails.push(NO_STATUS);
  fails.push(...checkSummary(text), ...missing(text, ["Rows", "Files", "Tests first", "Build", "Done when", "Out of scope", "Open questions"]));
  if (/^### TD-\d+/m.test(text) || /^\s*[-*]\s+\*\*Option\b/im.test(text)) fails.push("makes a decision (TD or Option): decisions belong in the TP and an ADR");
  if (text.match(/\b(TBD|TODO)\b/)) fails.push("contains TBD or TODO");
  const on = restsOn(text);
  const parent = on ? fromDoc(specPath, on) : undefined;
  if (!on) fails.push('no "Rests on: <path>" line in the first 20 lines');
  else if (!existsSync(parent!)) fails.push("Rests on " + on + ", which does not exist");
  else if (!PARENT_OK.test(basename(parent!))) fails.push("Rests on " + on + ": a spec rests on an FRD, a TP, an ADR, a request, or CHECKS.md, INVARIANTS.md or CROSS-CUTTING.md");
  const rowsBody = section(text, "Rows") ?? "";
  const from = /^Quoted from:\s*`?([^\s`]+)/m.exec(rowsBody)?.[1];
  const quoted = from ? fromDoc(specPath, from) : parent;
  const rows = rowLines(rowsBody);
  if (!rows.length) fails.push("Rows holds no quoted row lines");
  if (quoted && existsSync(quoted)) {
    // A table row is compared cell by cell, each cell trimmed (a formatter pads cells); any other line as written.
    const key = (l: string) => (/^\s*\|/.test(l) ? "|" + cells(l).join("|") : l.trimEnd());
    const have = new Set(readFileSync(quoted, "utf8").split(/\r?\n/).map(key));
    for (const r of rows) if (!have.has(key(r))) fails.push("quoted row not found verbatim in " + (from ?? on) + ": " + r.trim().slice(0, 60));
  } else if (from || on) fails.push("Quoted from " + (from ?? on) + ", which does not exist");
  // Document ids (SPEC-, FRD-, R-<SLICE>-n ...) name other documents; they are never row ids.
  const rowIds = new Set(rows.flatMap((r) => (r.trim().startsWith("|") ? r.trim().slice(1).split("|")[0]! : r).match(SPEC_ID)?.slice(0, 1) ?? []).filter((i) => !DOC_ID.test(i)));
  const tested = new Set((section(text, "Tests first")?.match(SPEC_ID) ?? []).filter((i) => !DOC_ID.test(i)));
  for (const id of rowIds) if (!tested.has(id)) fails.push(id + " is in Rows but Tests first does not cite it");
  for (const id of tested) if (!rowIds.has(id)) fails.push(id + " is in Tests first but not in Rows");
  const files = filesLines(text);
  // The cap counts code files: a table's header row and any test file (skills/spec/SKILL.md) do not count.
  const rowPath = (l: string) => typed((l.trim().startsWith("|") ? l.split("|")[1]! : l.replace(/^\s*[-*]\s+/, "").split(/\s/)[0]!).trim().replace(/`/g, ""));
  const nFiles = files.filter((l, i) => !(l.trim().startsWith("|") && files.findIndex((x) => x.trim().startsWith("|")) === i) && !isTest(rowPath(l))).length;
  if (nFiles > 3) fails.push("Files lists " + nFiles + " rows; the cap is 3");
  const cmds = (section(text, "Done when") ?? "").match(/`[^`\n]+`/g) ?? [];
  if (cmds.length !== 1) fails.push("Done when must hold exactly one backticked command, found " + cmds.length);
  return [...fails, ...reusesFails(text, specPath), ...answererFails(text), ...trackedFails(text, specPath), ...siblingFails(text, specPath)];
}

// The format 1 spec check (0.3.0): one spec per FRD, its tasks covering every FRD id.
export function checkSpecV1(text: string, frd: string): string[] {
  const fails: string[] = [];
  if (!STATUS.test(text)) fails.push(NO_STATUS);
  fails.push(...checkSummary(text), ...missing(text, ["Context", "Files", "Interfaces", "Data", "Tasks", "Out of scope"]));
  if (/^### TD-\d+/m.test(text) || /^\s*[-*]\s+\*\*Option\b/im.test(text)) fails.push("makes a decision (TD or Option): decisions belong in the TP and an ADR");
  const tasks = text.split(/^### (?=Task \d+)/m).slice(1);
  if (!tasks.length) fails.push("no tasks written as ### Task n: title");
  const tested = new Set<string>();
  for (const t of tasks) {
    const id = t.match(/^Task \d+/)![0];
    const first = t.match(/^\s*[-*]\s+\*\*Tests first:?\*\*:?([\s\S]*?)(?=^\s*[-*]\s+\*\*|$(?![\s\S]))/im);
    if (!first) fails.push(id + ': no "Tests first:" line');
    else for (const m of first[1]!.matchAll(/\b(EX|DT|ST|INV)-\d+\b/g)) tested.add(m[0]);
    if (!/^\s*[-*]\s+\*\*Done when:?\*\*/im.test(t)) fails.push(id + ': no "Done when:" line');
  }
  const defs = [...defsIn(frd, "Rules and examples", /\bEX-\d+\b/g), ...defsIn(frd, "Decision table", /\bDT-\d+\b/g), ...defsIn(frd, "States", /\bST-\d+\b/g), ...defsIn(frd, "Invariants", /\bINV-\d+\b/g)];
  for (const d of defs) if (!tested.has(d)) fails.push(d + " has no task whose Tests first line cites it");
  if (text.match(/\b(TBD|TODO)\b/)) fails.push("contains TBD or TODO");
  return fails;
}

// A spec's failures under a project's pin: the format 1 check counts under format 1, the small-spec check is tagged format 2.
// shortcut: the FRD is the sibling FRD-NN-*.md of SPEC-NN-*.md (empty when absent), read only under format 1.
export function specFails(text: string, specPath: string, pin: number): string[] {
  const v2 = checkSpec(text, specPath).map((f) => (f.startsWith("[format ") ? f : "[format 2] " + f));
  if (pin >= 2) return v2;
  const nn = basename(specPath).match(/^SPEC-(\d{2})-/)?.[1];
  const dir = join(dirname(specPath), "..", "frd");
  const f = nn && existsSync(dir) ? readdirSync(dir).find((x) => x.startsWith("FRD-" + nn + "-")) : undefined;
  return [...checkSpecV1(text, f ? readFileSync(join(dir, f), "utf8") : ""), ...v2];
}

// Rows of file whose first cell (or bullet id) is one of ids; ids with no row come back in missingIds.
export function excerpt(text: string, ids: string[]): { lines: string[]; missingIds: string[] } {
  const lines: string[] = [],
    missingIds: string[] = [];
  const all = text.split(/\r?\n/).map((l) => l.trimEnd());
  for (const id of ids) {
    const hit = all.filter((l) => new RegExp("^\\s*(\\||[-*]\\s+)\\s*\\**\\s*" + id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(l));
    if (hit.length) lines.push(...hit);
    else missingIds.push(id);
  }
  return { lines, missingIds };
}

export function checkAdr(text: string, name: string): string[] {
  const fails = missing(text, ["Status", "Summary", "Context", "Options considered", "Decision", "Consequences"]).map((x) => name + ": " + x);
  if (!/^## Status\s*\n+\s*(Proposed|Accepted|Superseded|Rejected)\b/im.test(text)) fails.push(name + ": Status must be Proposed, Accepted, Superseded or Rejected");
  return fails;
}

// "## Summary" within the first 20 lines, holding a "Last change: YYYY-MM-DD, <what>" line.
// An ADR is not edited once accepted, so it needs the Summary but no Last change line.
export function checkSummary(text: string, isAdr = false): string[] {
  const lines = text.split(/\r?\n/);
  const at = lines.findIndex((l) => /^## Summary\s*$/.test(l));
  if (at < 0 || at >= 20) return ["no ## Summary within the first 20 lines"];
  const body = [];
  for (const l of lines.slice(at + 1)) {
    if (/^## /.test(l)) break;
    body.push(l);
  }
  if (isAdr) return [];
  return body.some((l) => /^Last change: \d{4}-\d{2}-\d{2}, \S/.test(l)) ? [] : ['the Summary has no "Last change: YYYY-MM-DD, <what>" line'];
}

function frIds(root: string): Set<string> {
  const ids = new Set<string>();
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/^FRD-\d{2}-.*\.md$/.test(e.name)) frDefs(readFileSync(p, "utf8")).forEach((i) => ids.add(i));
    }
  };
  if (existsSync(root)) walk(root);
  return ids;
}

// Status of every chain document. A document is approved only when the line "Status: Approved (YYYY-MM-DD)"
// is present; anything else counts as a draft. ADRs use "## Status" followed by Proposed|Accepted|Superseded|Rejected,
// requests "Status: Open|Accepted|Rejected|Merged into REQ-m".
// A document may be approved only if the document it rests on is approved and no Q-n is left in its Open questions.
export type Doc = { path: string; kind: string; approved: boolean; status: string; by?: string; parent?: string; also?: string[] };

export function docStatus(text: string, kind: string): { approved: boolean; status: string; by?: string } {
  if (kind === "ADR") {
    const s = text.match(/^## Status\s*\n+\s*(\w+)/m)?.[1] ?? "missing";
    return { approved: s === "Accepted", status: s };
  }
  if (kind === "REQUEST") {
    const s = text.match(/^\**Status:?\**\s*(.+?)\s*$/im)?.[1] ?? "";
    const ok = /^(Open|Accepted|Rejected|Merged into REQ-\d+)$/.test(s);
    return { approved: s === "Accepted", status: ok ? s : "missing" };
  }
  const m = text.match(/^\**Status:?\**\s*Approved \((\d{4}-\d{2}-\d{2})\)/im);
  if (m) return { approved: true, status: "Approved " + m[1] };
  const by = SUPERSEDED.exec(text)?.[1];
  if (by) return { approved: false, status: "Superseded", by };
  return /^\**Status:?\**\s*Draft\b/im.test(text) ? { approved: false, status: "Draft" } : { approved: false, status: "missing" };
}

export function chainStatus(root: string): { docs: Doc[]; fails: string[] } {
  const docs: Doc[] = [];
  const fails: string[] = [];
  const add = (path: string, kind: string, parent?: string, also: string[] = []) => {
    if (!existsSync(path)) return;
    const text = readFileSync(path, "utf8");
    const d = { path, kind, parent, also, ...docStatus(text, kind) };
    docs.push(d);
    if (d.status === "missing" && kind !== "ADR") fails.push(path + ": " + NO_STATUS);
    if (d.by && !existsSync(fromDoc(path, d.by))) fails.push(path + ": superseded by " + d.by + ", which does not exist");
    if (d.approved && kind !== "ADR" && kind !== "REQUEST" && /\bQ-\d+\b/.test(section(text, "Open questions") ?? "")) fails.push(path + ": approved, but its Open questions section still holds a Q-n");
  };
  // the files of a folder that are chain documents, by the one kind rule; under is the folder's path under docs/ with a slice name in front
  const ls = (d: string, under: string) =>
    existsSync(d)
      ? readdirSync(d)
          .filter((f) => kindOf(under + "/" + f))
          .sort()
      : [];
  const dd = join(root, "docs");
  const product = join(dd, "PRODUCT.md");
  const crossTp = join(dd, "tp", "TP.md");
  add(product, "PRODUCT");
  for (const f of ls(join(dd, "requests"), "requests")) add(join(dd, "requests", f), "REQUEST");
  add(crossTp, "TP", product);
  const slices = existsSync(dd)
    ? readdirSync(dd, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !RESERVED.includes(e.name) && !e.name.startsWith("."))
        .map((e) => e.name)
        .sort()
    : [];
  for (const slice of slices) {
    const d = join(dd, slice);
    const prd = join(d, "PRD.md");
    const sib = (sub: string, prefix: string, nn: string) => {
      const f = nnFile(join(d, sub), prefix, nn);
      return f ? join(d, sub, f) : join(d, sub, prefix + "-" + nn + "-?.md");
    };
    add(prd, "PRD", product);
    for (const f of ls(join(d, "frd"), "x/frd")) add(join(d, "frd", f), "FRD", prd);
    for (const f of ls(join(d, "ux"), "x/ux")) add(join(d, "ux", f), "UX", sib("frd", "FRD", docNumber(f)!));
    for (const f of ls(join(d, "tp"), "x/tp")) {
      const tpPath = join(d, "tp", f);
      const on = restsOn(readFileSync(tpPath, "utf8"));
      const parent = on ? fromDoc(tpPath, on) : undefined;
      // A Rests on line wins over the FRD of its number; resting on a request or a registry, a TP owes the cross-cutting TP nothing.
      const own = parent && (/^REQ-\d+/.test(basename(parent)) || REGISTRY.test(basename(parent)));
      add(tpPath, "TP", parent ?? sib("frd", "FRD", docNumber(f)!), own ? [] : [crossTp]);
    }
    for (const f of ls(join(d, "specs"), "x/specs")) {
      const sp = join(d, "specs", f),
        on = restsOn(readFileSync(sp, "utf8"));
      add(sp, "SPEC", on ? fromDoc(sp, on) : undefined);
      if (!on) fails.push("[format 2] " + sp + ': no "Rests on: <path>" line in the first 20 lines');
    }
  }
  // An ADR has no parent: it may be Accepted while its TP is a draft. The TP is what waits for its ADRs (below).
  for (const f of ls(join(dd, "adr"), "adr")) add(join(dd, "adr", f), "ADR");
  // An ADR numbered at or below legacyAdrsThrough was written before adoption: listed as "legacy", counted as accepted, never failed for its status line.
  let through: number | undefined;
  try {
    through = legacyAdrsThrough(root);
  } catch {} // lint-docs reports a bad value
  const legacy = new Set<string>();
  for (const x of docs)
    if (x.kind === "ADR" && through !== undefined && (adrNumber(x.path) ?? Infinity) <= through) {
      Object.assign(x, { status: "legacy", approved: true });
      legacy.add(x.path);
    }
  const byPath = new Map(docs.map((x) => [x.path, x]));
  for (const x of docs) {
    if (x.kind === "ADR" && !legacy.has(x.path) && !["Proposed", "Accepted", "Superseded", "Rejected"].includes(x.status)) fails.push(x.path + ': ADR status "' + x.status + '" is not Proposed, Accepted, Superseded or Rejected');
    if (!x.approved || x.kind === "REQUEST") continue;
    for (const par of [x.parent, ...(x.also ?? [])]) {
      if (!par) continue;
      const p = byPath.get(par);
      if (!p && REGISTRY.test(basename(par)) && existsSync(par)) continue; // L-15: a registry counts as approved
      if (!p) fails.push(x.path + ": approved, but the document it rests on (" + par + ") does not exist");
      else if (p.status === "Superseded") fails.push(x.path + ": approved, but " + p.path + " is superseded by " + p.by);
      else if (!p.approved) fails.push(x.path + ": approved, but " + p.path + " is still " + p.status);
    }
    // A TP is approved only when every ADR it cites ("ADR: ADR-NNN") is Accepted.
    if (x.kind === "TP")
      for (const id of new Set([...readFileSync(x.path, "utf8").matchAll(/\bADR:\s*(ADR-\d{3,})/g)].map((m) => m[1]))) {
        const a = docs.find((y) => y.kind === "ADR" && y.path.split(/[\\/]/).pop()!.startsWith(id));
        if (a && !a.approved) fails.push(x.path + ": approved, but " + id + " is still " + a.status);
      }
  }
  return { docs, fails: fails.map(toPosix) };
}

// Principles are the numbered list under the "Principles" heading of PRODUCT.md.
function countPrinciples(product: string): number {
  const sec = product.split(/^## /m).find((p) => /^[\d. ]*Principles/i.test(p)) ?? "";
  const body = sec.slice(sec.indexOf("\n") + 1); // skip the heading line, which may itself be numbered
  return (body.match(/^\d+\.\s/gm) ?? []).length;
}

const USAGE = [
  "check.ts prd <docs/slice/PRD.md> <SLICE_ID> [--product docs/PRODUCT.md]",
  "check.ts frd <docs/slice> <SLICE_ID>",
  "check.ts ux <docs/slice>",
  "check.ts tp <TP.md> <adr dir> [--root docs]",
  "check.ts spec <SPEC.md>",
  "check.ts excerpt <file> <ID>...",
  "check.ts done <SPEC.md>",
  "check.ts status [root]",
  "check.ts summary <file>",
  "check.ts approve|clear <doc> [root]",
  "check.ts drift [root]",
  "check.ts trace [root] [test dir]...",
  "check.ts migrate [root] [--apply]",
  "check.ts history <doc>",
];

if (import.meta.main) {
  const args = process.argv.slice(2);
  const [kind, a, b] = args;
  const opt = (name: string, dflt: string) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const usage = (): never => {
    console.error("usage:\n  " + USAGE.join("\n  "));
    process.exit(2);
  };
  const finish = (all: string[], ok: string, warned: string[] = []): never => {
    let pin = 1;
    try {
      pin = readFormat(".");
    } catch {} // a bad pin was reported above
    const g = gate(all, pin); // a rule newer than the pin is a warning, not a failure
    const fails = g.fails;
    for (const w of [...warned, ...g.warnings]) console.log(toPosix(w));
    if (fails.length) {
      for (const f of fails) console.log("FAIL", toPosix(f));
      process.exit(1);
    }
    console.log("PASS " + ok);
    process.exit(0);
  };
  // The pin lives beside docs/: status, drift and trace take the root; the others read from the project root they run in.
  if (kind) {
    const pin = pinProblem(["status", "drift", "trace", "migrate"].includes(kind) ? (a && !a.startsWith("--") ? a : ".") : ".");
    if (pin) finish([pin], "");
  }
  const read = (p: string) => {
    if (!existsSync(p)) {
      console.error("no such file: " + p);
      process.exit(2);
    }
    return readFileSync(p, "utf8");
  };

  if (kind === "status") {
    const root = a && !a.startsWith("--") ? a : ".";
    const { docs, fails: chainFails } = chainStatus(root);
    const rel = (p: string) => toPosix(relative(root, p));
    const drift = driftFails(root);
    const g = gate([...chainFails, ...drift.fails, ...reworkFails(root)], readFormat(root));
    const fails = g.fails;
    console.log("| Document | Kind | Status |\n|---|---|---|");
    for (const d of docs) console.log("| " + rel(d.path) + " | " + d.kind + " | " + d.status + " |");
    console.log("\n" + docs.filter((d) => d.approved).length + " of " + docs.length + " approved or accepted.");
    for (const d of driftReport(root).filter((x) => x.cause !== "missing")) console.log("drifted: " + rel(d.path) + ": " + (d.cause === "body" ? "edited after approval" : "suspect, " + d.parent + " changed"));
    for (const w of drift.warnings) console.log("WARN", toPosix(w));
    finish(fails, "status", g.warnings);
  }
  if (kind === "approve" || kind === "clear") {
    if (!a) usage();
    // the project is the folder holding the docs/ folder above the document, wherever the command runs from; the argument is the fallback
    const projectOf = (doc: string, dflt: string) => projectRoot(doc) ?? dflt;
    try {
      if (kind === "approve") {
        const date = opt("--date", new Date().toISOString().slice(0, 10));
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) usage();
        const root = projectOf(a, b && !b.startsWith("--") ? b : ".");
        const all = chainStatus(root).docs;
        if (all.find((y) => resolve(y.path) === resolve(a))?.kind === "REQUEST") throw new Error("the owner accepts a request on its Status line; approve is for chain documents");
        const par = all.find((x) => x.path === all.find((y) => resolve(y.path) === resolve(a))?.parent);
        if (par?.kind === "REQUEST" && !par.approved) throw new Error(basename(par.path).replace(/^(REQ-\d+).*/, "$1") + " is " + par.status + ", not accepted: a document resting on a request needs it accepted");
        approve(a, root, date);
      } else clear(a, projectOf(a, b ?? "."));
    } catch (e) {
      console.log("FAIL", toPosix(a) + ": " + (e as Error).message);
      process.exit(1);
    }
    console.log("PASS " + kind + " " + a);
    process.exit(0);
  }
  if (kind === "drift") {
    const r = driftFails(a ?? ".");
    for (const w of r.warnings) console.log("WARN", toPosix(w));
    finish(r.fails, "drift");
  }
  if (kind === "trace") {
    const root = a ?? ".";
    const dirs = args.slice(2).length ? args.slice(2) : [join(root, "test")].filter(existsSync);
    if (!dirs.length || !dirs.every(existsSync)) {
      console.error("no test directory to scan");
      process.exit(2);
    }
    const r = traceFails(join(root, "docs"), dirs);
    for (const n of r.notes) console.log("NOTE", n);
    finish(r.fails, "trace", r.warnings);
  }
  if (kind === "migrate") {
    const { migrate } = await import("./migrate.ts");
    const r = migrate(a && !a.startsWith("--") ? a : ".", args.includes("--apply"));
    console.log(r.lines.join("\n"));
    process.exit(r.code);
  }
  if (kind === "history") {
    if (!a || !existsSync(a)) usage();
    try {
      console.log(history(a).join("\n"));
    } catch (e) {
      console.error("history failed: " + ((e as { stderr?: string }).stderr || (e as Error).message).trim());
      process.exit(1);
    }
    process.exit(0);
  }
  if (kind === "summary") {
    if (!a) usage();
    // the kind comes from the path under docs/, by the one rule; an ADR at or below the cutoff was written before adoption and is asked nothing
    const abs = toPosix(resolve(a));
    const at = abs.lastIndexOf("/docs/");
    const adr = at >= 0 ? kindOf(abs.slice(at + "/docs/".length)) === "ADR" : kindOf("adr/" + basename(abs)) === "ADR";
    let through: number | undefined;
    try {
      through = legacyAdrsThrough(projectRoot(a) ?? ".");
    } catch {} // lint-docs reports a bad value
    if (adr && through !== undefined && (adrNumber(basename(abs)) ?? Infinity) <= through) finish([], a + ": summary");
    finish(
      checkSummary(read(a), adr).map((f) => a + ": " + f),
      a + ": summary",
    );
  }
  if (kind === "ux") {
    if (!a) usage();
    const r = checkUx(a);
    finish(r.fails, a + ": " + r.files + " UX documents");
  }
  if (kind === "tp") {
    if (!a || !b) usage();
    const text = read(a);
    const adrFiles = existsSync(b) ? readdirSync(b).filter((f) => ADR_FILE.test(f)) : [];
    // ADRs at or below legacyAdrsThrough were written before adoption: no template rules, but a cited one must still be accepted.
    let through: number | undefined;
    try {
      // the project that holds the docs folder: beside --root, or two levels above the ADR dir (docs/adr -> docs -> project)
      through = legacyAdrsThrough(args.includes("--root") ? dirname(resolve(opt("--root", "docs"))) : resolve(b, "..", ".."));
    } catch {} // lint-docs reports a bad value
    const legacy = (f: string) => through !== undefined && (adrNumber(f) ?? Infinity) <= through;
    const notAccepted = [...new Set([...text.matchAll(/\bADR:\s*(ADR-(\d{3,}))/g)].map((m) => m[1]!))].flatMap((id) => {
      const f = adrFileFor(adrFiles, id);
      const st = f && legacy(f) ? /^Status:\s*(\w+)|^## Status\s*\n+\s*(\w+)/m.exec(readFileSync(join(b, f), "utf8")) : null;
      const status = st?.[1] ?? st?.[2];
      return status && /^(Proposed|Superseded|Rejected)$/.test(status) ? [id + " is " + status + ", not accepted"] : [];
    });
    const fails = [...checkTp(text, b, frIds(opt("--root", "docs")), resolve(a)), ...adrFiles.filter((f) => !legacy(f)).flatMap((f) => checkAdr(readFileSync(join(b, f), "utf8"), f)), ...notAccepted];
    finish(fails, a + ": " + (text.split(/^### (?=TD-\d+)/m).length - 1) + " decisions, " + adrFiles.length + " ADRs");
  }
  if (kind === "spec") {
    if (!a) usage();
    const g = gate(specFails(read(a), a, readFormat(".")), readFormat("."));
    finish(g.fails, a + ": spec", g.warnings);
  }
  if (kind === "excerpt") {
    if (!a || args.length < 3) usage();
    const r = excerpt(read(a), args.slice(2));
    if (r.missingIds.length)
      finish(
        r.missingIds.map((i) => a + ": no row with id " + i),
        "",
      );
    console.log(r.lines.join("\n"));
    process.exit(0);
  }
  if (kind === "done") {
    if (!a) usage();
    const text = read(a);
    if (!docStatus(text, "SPEC").approved) finish([a + ": not approved, so not run"], "");
    const cmds = (section(text, "Done when") ?? "").match(/`([^`\n]+)`/g) ?? [];
    if (cmds.length !== 1) finish([a + ": Done when must hold exactly one backticked command"], "");
    const cmd = cmds[0]!.slice(1, -1);
    // Bun's own shell: the same globs and quoting on every system.
    const r = await Bun.$`${{ raw: cmd }}`.nothrow();
    process.exit(r.exitCode);
  }
  if (kind === "prd") {
    if (!a || !b) usage();
    const text = read(a);
    const n = new Set([...text.matchAll(new RegExp("\\bR-" + b + "-(\\d+)\\b", "g"))].map((m) => m[1])).size;
    finish(checkPrd(text, b, read(opt("--product", "docs/PRODUCT.md"))), a + ": " + n + " requirements");
  }
  if (kind === "frd") {
    if (!a || !b) usage();
    if (!existsSync(join(a, "PRD.md"))) {
      console.error("no PRD.md in " + a);
      process.exit(2);
    }
    const r = checkFrds(a, b);
    finish(r.fails, a + ": " + r.files + " FRDs cover " + r.reqs + " PRD requirements");
  }
  usage();
}
