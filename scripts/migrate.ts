// Migrate a project one format up (FRD-03): a dry run lists what fails and the rewrites; apply makes the mechanical rewrites
// and moves the pin only when the next format passes. Never lowers the pin; never skips a format.
// shortcut: only the format 1 to 2 rewrite exists (a spec's Rests on from its TP sibling); add one per new format.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { chainStatus, RESERVED, restsOn, specFails } from "./check.ts";
import { CONFIG, gate, NEWEST, readFormat } from "./format.ts";
import { lintDocs, loadPhrases } from "./lint-docs.ts";
import { traceFails } from "./trace.ts";
import { toPosix } from "./paths.ts";

const specsOf = (root: string): string[] => {
  const dd = join(root, "docs");
  if (!existsSync(dd)) return [];
  return readdirSync(dd, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !RESERVED.includes(e.name) && !e.name.startsWith("."))
    .flatMap((e) => {
      const d = join(dd, e.name, "specs");
      return existsSync(d)
        ? readdirSync(d)
            .filter((f) => /^SPEC-\d{2}-.*\.md$/.test(f))
            .sort()
            .map((f) => join(d, f))
        : [];
    });
};

type Rewrite = { spec: string; line: string };

// A spec with no Rests on line rests on its TP sibling: TP-NN-*.md of SPEC-NN-*.md.
function rewrites(root: string): Rewrite[] {
  const out: Rewrite[] = [];
  for (const spec of specsOf(root)) {
    if (restsOn(readFileSync(spec, "utf8")) || !/^Status:/m.test(readFileSync(spec, "utf8"))) continue;
    const nn = basename(spec).slice(5, 7);
    const dir = join(dirname(spec), "..", "tp");
    const tp = existsSync(dir) ? readdirSync(dir).find((f) => f.startsWith("TP-" + nn + "-") && f.endsWith(".md")) : undefined;
    if (tp) out.push({ spec, line: "Rests on: ../tp/" + tp });
  }
  return out;
}

// What fails under format n: the chain status, every spec, the docs lint and the coverage scan.
function failsAt(root: string, n: number): { fails: string[]; bySpec: string[] } {
  const fails = gate(chainStatus(root).fails, n).fails;
  const bySpec: string[] = [];
  for (const spec of specsOf(root)) {
    const f = gate(specFails(readFileSync(spec, "utf8"), spec, n), n).fails;
    if (f.length) bySpec.push(spec);
    fails.push(...f.map((x) => toPosix(spec) + ": " + x));
  }
  // lintDocs reads the pin itself: a rule newer than the pin comes back as a warning, which is a failure under n.
  const warned: string[] = [];
  fails.push(...lintDocs(root, loadPhrases(), warned).map((x) => "docs/" + x.file + ":" + x.line + ": " + x.reason));
  for (const w of warned) {
    const m = /^WARN \(format (\d+)\): (.*)$/.exec(w);
    if (m && Number(m[1]) <= n) fails.push(m[2]!);
  }
  const tests = join(root, "test");
  if (existsSync(tests)) fails.push(...traceFails(join(root, "docs"), [tests], n).fails);
  return { fails: [...new Set(fails)], bySpec };
}

export function migrate(root: string, apply = false): { lines: string[]; code: number } {
  const pin = readFormat(root);
  if (pin >= NEWEST) return { lines: ["nothing to migrate: format " + NEWEST + " is the newest"], code: 0 };
  const next = pin + 1;
  const rw = rewrites(root);
  const rel = (p: string) => toPosix(p).replace(toPosix(root).replace(/\/$/, "") + "/", "");
  const adds = (rs: Rewrite[]) => rs.map((r) => "add " + r.line + " to " + basename(r.spec));
  if (!apply) {
    const f = failsAt(root, next).fails;
    return { lines: ["fails under format " + next + ":", ...f.map((x) => "  " + rel(x)), "rewrites:", ...adds(rw).map((x) => "  " + x), "run with --apply to make the rewrites"], code: 0 };
  }
  for (const r of rw) {
    const text = readFileSync(r.spec, "utf8");
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    writeFileSync(
      r.spec,
      text.replace(/^Status:.*$/m, (s) => s + eol + r.line),
    );
  }
  const left = failsAt(root, next);
  const done = adds(rw).map((x) => "did: " + x);
  if (left.fails.length) {
    return {
      lines: [...done, "format " + next + " does not pass yet; the pin stays " + pin + ":", ...left.fails.map((x) => "  " + rel(x)), ...left.bySpec.map((s) => "split " + rel(s) + " with the migrate skill")],
      code: 1,
    };
  }
  const p = join(root, CONFIG);
  const cfg = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({ ...cfg, format: next }, null, 2) + "\n");
  return { lines: [...done, "pin moved to format " + next], code: 0 };
}
