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
  if (!kind || !target || !slice || !["prd", "frd"].includes(kind)) {
    console.error("usage: check.ts prd <PRD.md> <SLICE_ID> [--product docs/PRODUCT.md] | check.ts frd <slice dir> <SLICE_ID>");
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
