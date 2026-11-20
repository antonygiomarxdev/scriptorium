#!/usr/bin/env bun
// Document lint (L-13): banned phrases, dead links, filler sections, line caps, empty registry cells, copied text.
//   bun scripts/lint-docs.ts [root]     exit 0 pass, 1 fail ("FAIL <file>:<line>: <reason>")
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";

// Line cap per document type.
export const CAPS: Record<string, number> = { PRODUCT: 250, PRD: 150, FRD: 300, UX: 150, TP: 250, ADR: 80, SPEC: 250, REQUEST: 60, DECISIONS: 120 };
// Registry rows must fill this column.
const REGISTRY: Record<string, string> = { DECISIONS: "Goes into", INVARIANTS: "Check", CHECKS: "Command", "CROSS-CUTTING": "Rule" };
const COPY_WORDS = 12;

export type Fail = { file: string; line: number; reason: string };

// rel is the path under docs/, with forward slashes.
export function docKind(rel: string): string | undefined {
  const base = rel.split("/").pop()!;
  const top = rel.split("/").length === 1;
  if (top && /^(PRODUCT|DECISIONS|INVARIANTS|CHECKS|CROSS-CUTTING)\.md$/.test(base)) return base.slice(0, -3);
  if (/^requests\/REQ-/.test(rel)) return "REQUEST";
  if (/^adr\/ADR-/.test(rel)) return "ADR";
  if (rel === "tp/TP.md" || /\/tp\/TP-\d+/.test(rel)) return "TP";
  if (/^[^/]+\/PRD\.md$/.test(rel)) return "PRD";
  if (/\/frd\/FRD-/.test(rel)) return "FRD";
  if (/\/ux\/UX-/.test(rel)) return "UX";
  if (/\/specs\/SPEC-/.test(rel)) return "SPEC";
  return undefined;
}

// Lines outside fenced code, with their 1-based numbers.
function prose(text: string): { n: number; s: string }[] {
  let fence = false;
  const out: { n: number; s: string }[] = [];
  text.split(/\r?\n/).forEach((s, i) => {
    if (/^\s*\x60\x60\x60/.test(s)) { fence = !fence; return; }
    if (!fence) out.push({ n: i + 1, s });
  });
  return out;
}

const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const sentences = (s: string) => s.replace(/[*_\x60]/g, "").split(/(?<=[.!?])\s+/).map((x) => x.replace(/\s+/g, " ").trim()).filter((x) => x.split(" ").length >= COPY_WORDS);

// GitHub's heading slug: lowercase, punctuation dropped, spaces to hyphens.
export const slug = (h: string) => h.trim().toLowerCase().replace(/[\x60*_]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
const anchorsOf = (md: string) => new Set(prose(md).filter((l) => /^#{1,6}\s/.test(l.s)).map((l) => slug(l.s.replace(/^#+\s+/, ""))));

const hasWord = (t: string, w: string) => new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9])").test(t);

// The words in the Avoid column of the glossary table.
export function avoidWords(glossary: string): string[] {
  let at = -1;
  const out: string[] = [];
  for (const l of glossary.split(/\r?\n/)) {
    if (!/^\s*\|/.test(l)) { at = -1; continue; }
    const c = cells(l);
    if (/^[\s:|-]+$/.test(l)) continue;
    if (at === -1) { at = c.indexOf("Avoid"); if (at < 0) at = -2; continue; }
    if (at >= 0) out.push(...(c[at] ?? "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean));
  }
  return [...new Set(out)];
}

export function lintFile(rel: string, text: string, phrases: string[], upstream: string[] = [], dirOnDisk?: string, avoid: string[] = [], projectRoot?: string): Fail[] {
  const fails: Fail[] = [];
  const f = (line: number, reason: string) => fails.push({ file: rel, line, reason });
  const kind = docKind(rel);
  const lines = prose(text);

  if (!rel.startsWith("research/"))
    for (const { n, s } of lines) {
      if (/<!--\s*lint-ok:\s*(?!-->)\S/.test(s)) continue;
      const t = s.toLowerCase().replace(/’/g, "'");
      for (const p of phrases) if (new RegExp("(^|[^a-z0-9])" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9])").test(t)) f(n, 'banned phrase "' + p + '" (rewrite it, or add <!-- lint-ok: reason -->)');
    }

  // Glossary: a word the glossary says to avoid fails anywhere but in the glossary and research.
  if (rel !== "GLOSSARY.md" && !rel.startsWith("research/"))
    for (const { n, s } of lines) {
      if (/<!--\s*lint-ok:\s*(?!-->)\S/.test(s)) continue;
      for (const w of avoid) if (hasWord(s.toLowerCase(), w)) f(n, 'glossary: avoid "' + w + '" (use the term the glossary names, or add <!-- lint-ok: reason -->)');
    }

  if (dirOnDisk)
    for (const { n, s } of lines)
      for (const m of s.matchAll(/\]\(([^)\s]+)\)/g)) {
        const [target, anchor] = m[1].split("#");
        if (/^(https?:|mailto:)/i.test(m[1]) || (!target && !anchor)) continue;
        const path = target ? resolve(dirOnDisk, decodeURIComponent(target)) : undefined;
        if (path && !existsSync(path)) { f(n, "link does not resolve: " + m[1]); continue; }
        if (anchor && (!path || path.endsWith(".md")) && !anchorsOf(path ? readFileSync(path, "utf8") : text).has(decodeURIComponent(anchor).toLowerCase()))
          f(n, "link anchor has no heading: " + m[1]);
      }

  // Filler: a section holding nothing, TBD, TODO, or n/a without a reason.
  const heads = lines.filter((l) => /^## /.test(l.s));
  heads.forEach((h, i) => {
    const end = heads[i + 1]?.n ?? Infinity;
    const body = text.split(/\r?\n/).slice(h.n, end === Infinity ? undefined : end - 1).join("\n").replace(/<!--[\s\S]*?-->/g, "").trim();
    if (!body) f(h.n, "section is empty: " + h.s);
    else if (/^(TBD|TODO|n\/a)\.?$/i.test(body)) f(h.n, "section holds only " + body + ": " + h.s);
  });

  const total = text.replace(/\r?\n$/, "").split(/\r?\n/).length;
  if (kind && CAPS[kind] && total > CAPS[kind]) f(total, kind + " is " + total + " lines, over its cap of " + CAPS[kind]);

  const col = kind && REGISTRY[kind];
  if (col) {
    let at = -1;
    for (const { n, s } of lines) {
      if (!/^\s*\|/.test(s)) { at = -1; continue; }
      const c = cells(s);
      if (/^[\s:|-]+$/.test(s)) continue;
      if (at === -1) { at = c.indexOf(col); if (at < 0) { f(n, 'table has no "' + col + '" column'); at = -2; } continue; }
      if (at >= 0 && !(c[at] ?? "")) f(n, (c[0] || "row") + ': empty "' + col + '" cell');
    }
  }

  // CHECKS.md: a path named in the Replay cell must exist under the project root.
  if (kind === "CHECKS" && projectRoot) {
    let at = -1;
    for (const { n, s } of lines) {
      if (!/^\s*\|/.test(s)) { at = -1; continue; }
      if (/^[\s:|-]+$/.test(s)) continue;
      const c = cells(s);
      if (at === -1) { at = c.indexOf("Replay"); continue; }
      if (at >= 0) for (const m of (c[at] ?? "").matchAll(/\x60([^\x60\s]+[\/.][^\x60\s]*)\x60/g)) if (!existsSync(resolve(projectRoot, m[1]))) f(n, (c[0] || "row") + ": Replay path does not exist: " + m[1]);
    }
  }

  if (upstream.length && kind && ["FRD", "UX", "TP", "SPEC"].includes(kind)) {
    const seen = new Set(upstream.flatMap((u) => u.split(/\r?\n/).flatMap(sentences)));
    for (const { n, s } of lines) for (const x of sentences(s)) if (seen.has(x)) f(n, "sentence copied from the PRD or PRODUCT (link the id instead): " + x.slice(0, 60) + "...");
  }
  return fails;
}

export function lintDocs(root: string, phrases: string[]): Fail[] {
  const docs = join(root, "docs");
  const fails: Fail[] = [];
  const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".md") ? [join(d, e.name)] : []));
  if (!existsSync(docs)) return fails;
  const read = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : undefined);
  const product = read(join(docs, "PRODUCT.md"));
  const avoid = avoidWords(read(join(docs, "GLOSSARY.md")) ?? "");
  for (const p of walk(docs)) {
    const rel = relative(docs, p).replaceAll("\\", "/");
    const slice = rel.split("/")[0];
    const prd = rel.includes("/") ? read(join(docs, slice, "PRD.md")) : undefined;
    fails.push(...lintFile(rel, readFileSync(p, "utf8"), phrases, [product, prd].filter((x): x is string => !!x), dirname(p), avoid, root));
  }
  return fails;
}

export const loadPhrases = (file = join(import.meta.dir, "banned-phrases.txt")) => readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.trim().toLowerCase().replace(/’/g, "'")).filter(Boolean);

if (import.meta.main) {
  const root = process.argv[2] ?? ".";
  const fails = lintDocs(root, loadPhrases());
  for (const x of fails) console.log("FAIL docs/" + x.file + ":" + x.line + ": " + x.reason);
  if (fails.length) process.exit(1);
  console.log("PASS docs lint");
}
