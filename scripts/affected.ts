#!/usr/bin/env bun
// CI runs only what a change affects (SPEC-01-4). Bun's own `bun test --changed=<base>` follows the import graph;
// this adds what imports cannot show: the tests the committed map of mutation.ts names for each changed script.
//   git diff --name-only <base>...HEAD | bun scripts/affected.ts   prints "all", "none", or the test files one per line
import { MAP } from "./mutation.ts";

// The markdown under templates/ and skills/ is product text, not a document (L-20): it runs the whole suite.
const isDoc = (f: string) => (f.endsWith(".md") && !/^(templates|skills|test)\//.test(f)) || f.startsWith("docs/"); // anything under test/ is code
const isTestFile = (f: string) => /^test\/[^/]+\.test\.ts$/.test(f);

// Did any code, test or configuration file change? Documents alone do not count; the workflow takes this from here, not from a list of its own.
export const codeChanged = (changed: string[]): boolean => changed.some((f) => !isDoc(f));

// "all" when a changed file cannot be placed (configuration, lockfile, a workflow, the map itself, a fixture); "none" when only documents changed.
export function plan(changed: string[]): "all" | "none" | string[] {
  const tests = new Set<string>();
  for (const f of changed.filter((f) => !isDoc(f))) {
    if (isTestFile(f)) tests.add(f);
    else if (f !== "scripts/mutation.ts" && MAP[f]) for (const t of MAP[f]!) tests.add(t);
    else return "all";
  }
  return tests.size ? [...tests].sort() : "none";
}

if (import.meta.main) {
  const changed = (await Bun.stdin.text()).split(/\r?\n/).filter(Boolean);
  if (process.argv[2] === "--code") console.log(codeChanged(changed));
  else {
    const r = plan(changed);
    console.log(typeof r === "string" ? r : r.join("\n"));
  }
}
