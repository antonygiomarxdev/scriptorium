#!/usr/bin/env bun
// Scriptorium checks. Exit 0 when the document passes, 1 when it fails (every failure printed), 2 on bad usage.
//   bun scripts/check.ts prd <slice>/docs/PRD.md <SLICE_ID> [--product docs/PRODUCT.md]
//   bun scripts/check.ts frd <slice dir> <SLICE_ID>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// A PRD or FRD says what, not how: these names belong in the Technical Proposal.
// shortcut: fixed list, make it configurable per project when a project needs other words.
const TECH = /\b(Bun|Node(\.js)?|TypeScript|Python|SQLite|Postgres|MySQL|Redis|JSONL?|CSV|YAML|HTTP|REST|GraphQL|HMAC|npm|endpoint|webhook handler|MCP tool)\b/;

export function checkPrd(text: string, slice: string, product: string): string[] {
  const fails: string[] = [];
  for (const h of ["Purpose", "Use cases", "Requirements", "Principles", "Out of scope", "Dependencies", "Acceptance criteria", "Open questions"])
    if (!new RegExp(`^## .*${h}`, "mi").test(text)) fails.push(`missing section: ## ${h}`);
  const reqs = new Set([...text.matchAll(new RegExp(`\\bR-${slice}-(\\d+)\\b`, "g"))].map((m) => m[1]));
  if (reqs.size < 3) fails.push(`fewer than 3 requirement IDs like R-${slice}-1`);

  const ucs = new Set([...product.matchAll(/\bUC-(\d+)\b/g)].map((m) => m[1]));
  const cited = [...text.matchAll(/\bUC-(\d+)\b/g)].map((m) => m[1]);
  for (const u of cited) if (!ucs.has(u)) fails.push(`unknown use case UC-${u}`);
  if (!cited.length) fails.push("cites no use case UC-n");

  const principles = countPrinciples(product);
  const cp = [...text.matchAll(/principle\s+(\d+)/gi)].map((m) => +m[1]);
  for (const p of cp) if (p < 1 || p > principles) fails.push(`unknown principle ${p}`);
  if (!cp.length) fails.push("cites no principle by number");

  if (!/PRODUCT\.md/.test(text)) fails.push("does not link PRODUCT.md");
  const t = text.match(TECH);
  if (t) fails.push(`technology named in a PRD: "${t[0]}" (move to the TP)`);
  return fails;
}

export function checkFrds(dir: string, slice: string): { fails: string[]; files: number; reqs: number } {
  const prd = readFileSync(join(dir, "docs", "PRD.md"), "utf8");
  const prdReqs = new Set([...prd.matchAll(new RegExp(`\\bR-${slice}-(\\d+)\\b`, "g"))].map((m) => `R-${slice}-${m[1]}`));
  const frdDir = join(dir, "docs", "frd");
  const fails: string[] = [];
  const files = existsSync(frdDir) ? readdirSync(frdDir).filter((f) => /^FRD-\d{2}-[a-z0-9-]+\.md$/.test(f)) : [];
  if (!files.length) fails.push(`no FRD files named FRD-NN-name.md in ${frdDir}`);
  const covered = new Set<string>();
  for (const f of files) {
    const s = readFileSync(join(frdDir, f), "utf8");
    const nn = f.slice(4, 6);
    for (const h of ["Summary", "Requirements covered", "Behavior", "Edge cases", "Information", "Acceptance tests", "Open questions"])
      if (!new RegExp(`^## .*${h}`, "mi").test(s)) fails.push(`${f}: missing section ## ${h}`);
    if (!/\.\.\/PRD\.md/.test(s)) fails.push(`${f}: does not link ../PRD.md`);
    const cites = [...s.matchAll(new RegExp(`\\bR-${slice}-(\\d+)\\b`, "g"))].map((m) => `R-${slice}-${m[1]}`);
    if (!cites.length) fails.push(`${f}: cites no R-${slice}-n`);
    for (const r of cites) prdReqs.has(r) ? covered.add(r) : fails.push(`${f}: cites ${r}, not in the PRD`);
    const frs = new Set([...s.matchAll(new RegExp(`\\bFR-${slice}-${nn}-(\\d+)\\b`, "g"))].map((m) => m[1]));
    if (frs.size < 2) fails.push(`${f}: fewer than 2 functional requirements FR-${slice}-${nn}-n`);
    const tests = (s.match(/^\s*[-*]?\s*\**Given\b[\s\S]*?\bWhen\b[\s\S]*?\bThen\b/gim) ?? []).length;
    if (tests < 2) fails.push(`${f}: fewer than 2 Given/When/Then acceptance tests`);
    const t = s.match(TECH);
    if (t) fails.push(`${f}: technology named: "${t[0]}" (belongs in the TP)`);
  }
  for (const r of prdReqs) if (!covered.has(r)) fails.push(`PRD requirement ${r} is covered by no FRD`);
  return { fails, files: files.length, reqs: prdReqs.size };
}

// A TP lists its decisions as "### TD-n: title", each with at least two options and a chosen one backed by an ADR.
// knownFrs: every FR id defined in the project, so the TP can only cite real requirements.
export function checkTp(text: string, adrDir: string, knownFrs: Set<string>): string[] {
  const fails: string[] = [];
  for (const h of ["Context", "Requirements served", "Decisions", "Architecture", "Information", "Interfaces", "Threat model", "Testing", "Risks", "Open questions"])
    if (!new RegExp(`^## .*${h}`, "mi").test(text)) fails.push(`missing section: ## ${h}`);
  const cited = new Set([...text.matchAll(/\bFR-[A-Z]+-\d{2}-\d+\b/g)].map((m) => m[0]));
  if (!cited.size) fails.push("cites no FR id");
  for (const fr of cited) if (!knownFrs.has(fr)) fails.push(`cites ${fr}, defined in no FRD`);
  const adrs = existsSync(adrDir) ? readdirSync(adrDir).filter((f) => /^ADR-\d{3}-[a-z0-9-]+\.md$/.test(f)) : [];
  const blocks = text.split(/^### (?=TD-\d+)/m).slice(1);
  if (!blocks.length) fails.push("no decisions written as ### TD-n: title");
  for (const b of blocks) {
    const id = b.match(/^TD-\d+/)![0];
    const options = (b.match(/^\s*[-*]\s+\*\*Option\b/gim) ?? []).length;
    if (options < 2) fails.push(`${id}: fewer than 2 options (- **Option A** …)`);
    if (!/^\**Chosen\b/im.test(b)) fails.push(`${id}: no "Chosen:" line`);
    const adr = b.match(/ADR-(\d{3})/)?.[0];
    if (!adr) fails.push(`${id}: links no ADR-NNN`);
    else if (!adrs.some((f) => f.startsWith(adr))) fails.push(`${id}: ${adr} has no file in ${adrDir}`);
  }
  if (text.match(/\b(TBD|TODO)\b/)) fails.push("contains TBD or TODO");
  return fails;
}

export function checkAdr(text: string, name: string): string[] {
  const fails: string[] = [];
  for (const h of ["Status", "Context", "Decision", "Alternatives", "Consequences"])
    if (!new RegExp(`^## .*${h}`, "mi").test(text)) fails.push(`${name}: missing section ## ${h}`);
  if (!/^## Status\s*\n+\s*(Proposed|Accepted|Superseded|Rejected)\b/im.test(text)) fails.push(`${name}: Status must be Proposed, Accepted, Superseded or Rejected`);
  return fails;
}

function frIds(root: string): Set<string> {
  const ids = new Set<string>();
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/^FRD-\d{2}-.*\.md$/.test(e.name)) for (const m of readFileSync(p, "utf8").matchAll(/\bFR-[A-Z]+-\d{2}-\d+\b/g)) ids.add(m[0]);
    }
  };
  walk(root);
  return ids;
}

// Status of every chain document. A document is approved only when the line "Status: Approved (YYYY-MM-DD)"
// is present; anything else counts as a draft. ADRs use "## Status" followed by Proposed|Accepted|Superseded|Rejected.
// A document may be approved only if the document it rests on is approved.
export type Doc = { path: string; kind: string; approved: boolean; status: string; parent?: string };

export function docStatus(text: string, isAdr: boolean): { approved: boolean; status: string } {
  if (isAdr) {
    const s = text.match(/^## Status\s*\n+\s*(\w+)/m)?.[1] ?? "missing";
    return { approved: s === "Accepted", status: s };
  }
  const m = text.match(/^\**Status:?\**\s*Approved \((\d{4}-\d{2}-\d{2})\)/im);
  return m ? { approved: true, status: `Approved ${m[1]}` } : { approved: false, status: "Draft" };
}

export function chainStatus(root: string): { docs: Doc[]; fails: string[] } {
  const docs: Doc[] = [];
  const add = (path: string, kind: string, parent?: string) => {
    if (!existsSync(path)) return;
    docs.push({ path, kind, parent, ...docStatus(readFileSync(path, "utf8"), kind === "ADR") });
  };
  const product = join(root, "docs", "PRODUCT.md");
  const crossTp = join(root, "docs", "tp", "TP.md");
  add(product, "PRODUCT");
  add(crossTp, "TP", product);
  const ls = (d: string, re: RegExp) => (existsSync(d) ? readdirSync(d).filter((f) => re.test(f)).sort() : []);
  for (const f of ls(join(root, "docs", "adr"), /^ADR-\d{3}-.*\.md$/)) add(join(root, "docs", "adr", f), "ADR", crossTp);
  const src = join(root, "src");
  for (const slice of ls(src, /^[a-z0-9-]+$/)) {
    const d = join(src, slice, "docs");
    const prd = join(d, "PRD.md");
    add(prd, "PRD", product);
    for (const f of ls(join(d, "frd"), /^FRD-\d{2}-.*\.md$/)) add(join(d, "frd", f), "FRD", prd);
    const tps = ls(join(d, "tp"), /^TP-\d{2}-.*\.md$/);
    for (const f of tps) add(join(d, "tp", f), "TP", join(d, "frd", `FRD-${f.slice(3, 5)}${f.slice(5)}`));
    for (const f of ls(join(d, "specs"), /^SPEC-\d{2}-.*\.md$/)) add(join(d, "specs", f), "SPEC", join(d, "tp", `TP-${f.slice(5, 7)}${f.slice(7)}`));
    // A slice ADR rests on the slice TP that cites it.
    for (const f of ls(join(d, "adr"), /^ADR-\d{3}-.*\.md$/)) {
      const id = f.slice(0, 7);
      const tp = tps.find((t) => readFileSync(join(d, "tp", t), "utf8").includes(id));
      add(join(d, "adr", f), "ADR", tp ? join(d, "tp", tp) : undefined);
    }
  }
  const byPath = new Map(docs.map((x) => [x.path, x]));
  const fails: string[] = [];
  for (const x of docs) {
    if (x.kind === "ADR" && !["Proposed", "Accepted", "Superseded", "Rejected"].includes(x.status)) fails.push(`${x.path}: ADR status "${x.status}" is not Proposed, Accepted, Superseded or Rejected`);
    if (!x.approved || !x.parent) continue;
    const p = byPath.get(x.parent);
    if (!p) fails.push(`${x.path}: approved, but the document it rests on (${x.parent}) does not exist`);
    else if (!p.approved) fails.push(`${x.path}: approved, but ${p.path} is still ${p.status}`);
  }
  return { docs, fails };
}

// Principles are the numbered list under the "Principles" heading of PRODUCT.md.
function countPrinciples(product: string): number {
  const sec = product.split(/^## /m).find((p) => /^[\d. ]*Principles/i.test(p)) ?? "";
  const body = sec.slice(sec.indexOf("\n") + 1); // skip the heading line, which may itself be numbered
  return (body.match(/^\d+\.\s/gm) ?? []).length;
}

if (import.meta.main) {
  const [kind, target, slice, ...rest] = process.argv.slice(2);
  const pi = rest.indexOf("--product");
  const productPath = pi >= 0 ? rest[pi + 1] : "docs/PRODUCT.md";
  if (kind === "status") {
    // check.ts status [project root]: a table of every chain document and its status; fails on an approval above a draft.
    const root = target ?? ".";
    const { docs, fails } = chainStatus(root);
    const rel = (p: string) => p.slice(root.length).replace(/^[\\/]/, "").replaceAll("\\", "/");
    console.log("| Document | Kind | Status |\n|---|---|---|");
    for (const d of docs) console.log(`| ${rel(d.path)} | ${d.kind} | ${d.status} |`);
    const done = docs.filter((d) => d.approved).length;
    console.log(`\n${done} of ${docs.length} approved or accepted.`);
    if (fails.length) { for (const f of fails) console.log("FAIL", f.replaceAll("\\", "/")); process.exit(1); }
    process.exit(0);
  }
  if (kind === "tp") {
    // check.ts tp <TP.md> <adr dir> [--root src]
    const ri = process.argv.indexOf("--root");
    const root = ri >= 0 ? process.argv[ri + 1] : "src";
    if (!target || !slice) { console.error("usage: check.ts tp <TP.md> <adr dir> [--root src]"); process.exit(2); }
    const text = readFileSync(target, "utf8");
    const adrFiles = existsSync(slice) ? readdirSync(slice).filter((f) => /^ADR-\d{3}-[a-z0-9-]+\.md$/.test(f)) : [];
    const fails = [...checkTp(text, slice, frIds(root)), ...adrFiles.flatMap((f) => checkAdr(readFileSync(join(slice, f), "utf8"), f))];
    if (fails.length) { for (const f of fails) console.log("FAIL", f); process.exit(1); }
    console.log(`PASS ${target}: ${text.split(/^### (?=TD-\d+)/m).length - 1} decisions, ${adrFiles.length} ADRs`);
    process.exit(0);
  }
  if (!kind || !target || !slice || !["prd", "frd"].includes(kind)) {
    console.error("usage: check.ts prd <PRD.md> <SLICE_ID> [--product docs/PRODUCT.md] | check.ts frd <slice dir> <SLICE_ID> | check.ts tp <TP.md> <adr dir> [--root src]");
    process.exit(2);
  }
  let fails: string[], ok: string;
  if (kind === "prd") {
    const text = readFileSync(target, "utf8");
    fails = checkPrd(text, slice, readFileSync(productPath, "utf8"));
    ok = `PASS ${target}: ${new Set([...text.matchAll(new RegExp(`\\bR-${slice}-(\\d+)\\b`, "g"))].map((m) => m[1])).size} requirements`;
  } else {
    const r = checkFrds(target, slice);
    fails = r.fails;
    ok = `PASS ${target}: ${r.files} FRDs cover ${r.reqs} PRD requirements`;
  }
  if (fails.length) { for (const f of fails) console.log("FAIL", f); process.exit(1); }
  console.log(ok);
}
