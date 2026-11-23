#!/usr/bin/env bun
// Nightly mutation testing (SPEC-01-3). Only CI runs it, see .github/workflows/mutation.yml; nothing here starts the tool.
//   bun scripts/mutation.ts list                  one line per script: "<file>\t<its test files>" (the map below)
//   bun scripts/mutation.ts summary <report>...   the issue body for the survivors of the JSON reports, or nothing
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Each script's mutants run only these test files. A new script without an entry is reported as unmapped.
export const MAP: Record<string, string[]> = {
  "scripts/affected.ts": ["test/affected.test.ts"],
  "scripts/check.ts": ["test/check.test.ts", "test/cli.test.ts", "test/format.test.ts", "test/frozen-formats.test.ts", "test/hooks.test.ts"],
  "scripts/cli.ts": ["test/cli.test.ts", "test/install.test.ts"],
  "scripts/drift.ts": ["test/drift.test.ts", "test/gate.test.ts"],
  "scripts/format.ts": ["test/format.test.ts"],
  "scripts/gate.ts": ["test/gate.test.ts", "test/hooks.test.ts"],
  "scripts/history.ts": ["test/history.test.ts"],
  "scripts/hook-doc-check.ts": ["test/hooks.test.ts", "test/check.test.ts"],
  "scripts/hook-gate.ts": ["test/hooks.test.ts"],
  "scripts/hook-stop.ts": ["test/hooks.test.ts"],
  "scripts/install.ts": ["test/install.test.ts"],
  "scripts/kinds.ts": ["test/check.test.ts", "test/lint-docs.test.ts", "test/hooks.test.ts"],
  "scripts/lint-docs.ts": ["test/lint-docs.test.ts", "test/frozen-formats.test.ts"],
  "scripts/migrate.ts": ["test/migrate.test.ts"],
  "scripts/mutation.ts": ["test/mutation.test.ts"],
  "scripts/paths.ts": ["test/no-system-branches.test.ts", "test/check.test.ts", "test/gate.test.ts"],
  "scripts/pre-commit.ts": ["test/hooks.test.ts", "test/install.test.ts"],
  "scripts/rework.ts": ["test/rework.test.ts", "test/cli.test.ts"],
  "scripts/summary-diff.ts": ["test/summary-diff.test.ts"],
  "scripts/sync-version.ts": ["test/version.test.ts"],
  "scripts/trace.ts": ["test/trace.test.ts"],
};

const ROOT = join(import.meta.dir, "..");
const onDisk = (): string[] =>
  readdirSync(join(ROOT, "scripts"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => "scripts/" + f);

// The scripts (default: every scripts/*.ts) with no entry in the map.
export const unmapped = (files: string[] = onDisk()): string[] => files.filter((f) => !MAP[f]);

type Report = { files?: Record<string, { mutants?: { status: string; mutatorName: string; location: { start: { line: number } } }[] }> };

// The issue body for the survivors of one report, grouped by file with line and mutator; undefined when none survived.
export function summary(report: Report): string | undefined {
  const parts: string[] = [];
  for (const [file, { mutants = [] }] of Object.entries(report.files ?? {})) {
    const left = mutants.filter((m) => m.status === "Survived");
    if (left.length) parts.push("### " + file + "\n" + left.map((m) => "- line " + m.location.start.line + ": " + m.mutatorName).join("\n"));
  }
  return parts.length ? "Mutants that survived the nightly run: no test of the file's own tests failed for these changes.\n\n" + parts.join("\n\n") + "\n" : undefined;
}

if (import.meta.main) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "list") {
    for (const [f, t] of Object.entries(MAP)) console.log(f + "\t" + t.join(" "));
    const lost = unmapped();
    if (lost.length) console.error("unmapped: " + lost.join(", "));
  } else if (cmd === "summary") {
    // One report per file: merge them, then summarize once.
    const files = args.filter(existsSync).flatMap((p) => Object.entries((JSON.parse(readFileSync(p, "utf8")) as Report).files ?? {}));
    const body = summary({ files: Object.fromEntries(files) });
    if (body) console.log(body);
  } else {
    console.error("usage: bun scripts/mutation.ts list | summary <report.json>...");
    process.exit(2);
  }
}
