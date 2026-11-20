#!/usr/bin/env bun
// L-11: in a pull request, a chain document whose body changed must change its "## Summary" too.
//   bun scripts/summary-diff.ts <base ref> [PR body file]     (PR body also read from env PR_BODY)
// Waiver: a PR body line "Summary unchanged: <file or all>, <reason>".
import { readFileSync, existsSync } from "node:fs";

// Registries and archives have no Summary to keep.
const SKIP = /(^|\/)(GLOSSARY|INVARIANTS|CROSS-CUTTING|CHECKS|DECISIONS|RETRO)\.md$|(^|\/)(research|retro|decisions)\//;

// The "## Summary" section and everything else, line endings normalized.
export function split(text: string): { summary: string; body: string } {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const at = lines.findIndex((l) => /^## Summary\s*$/.test(l));
  if (at < 0) return { summary: "", body: lines.join("\n").trim() };
  let end = lines.findIndex((l, i) => i > at && /^## /.test(l));
  if (end < 0) end = lines.length;
  return { summary: lines.slice(at + 1, end).join("\n").trim(), body: [...lines.slice(0, at), ...lines.slice(end)].join("\n").trim() };
}

// true when the body changed and the summary did not. A file with no Summary or no base text passes.
export const staleSummary = (base: string | undefined, head: string) => {
  if (base === undefined || !/^## Summary\s*$/m.test(head)) return false;
  const [b, h] = [split(base), split(head)];
  return b.body !== h.body && b.summary === h.summary;
};

// Targets are the words between "unchanged:" and the first comma; "all" or an exact path.
export const waived = (prBody: string, file: string) =>
  prBody.split(/\r?\n/).some((l) => {
    const m = /^\s*Summary unchanged:([^,]*)/i.exec(l);
    return !!m && m[1].trim().split(/\s+/).some((t) => t.toLowerCase() === "all" || t.replaceAll("\\", "/") === file);
  });

if (import.meta.main) {
  const [base, bodyFile] = process.argv.slice(2);
  if (!base) { console.error("usage: summary-diff.ts <base ref> [PR body file]"); process.exit(2); }
  const prBody = (bodyFile && existsSync(bodyFile) ? readFileSync(bodyFile, "utf8") : "") + "\n" + (process.env.PR_BODY ?? "");
  const git = (...a: string[]) => Bun.spawnSync(["git", ...a]);
  const diff = git("diff", "--name-only", base + "...HEAD", "--", "docs");
  if (diff.exitCode !== 0) { console.error(diff.stderr.toString()); process.exit(2); }
  const stale = diff.stdout.toString().split(/\r?\n/).filter((f) => f.endsWith(".md") && !SKIP.test(f) && existsSync(f))
    .filter((f) => { const b = git("show", base + ":" + f); return staleSummary(b.exitCode === 0 ? b.stdout.toString() : undefined, readFileSync(f, "utf8")); })
    .filter((f) => !waived(prBody, f));
  for (const f of stale) console.log("FAIL " + f + ": body changed, ## Summary did not (update it, or add a PR line \"Summary unchanged: " + f + ", <reason>\")");
  if (stale.length) process.exit(1);
  console.log("PASS summary-diff");
}
