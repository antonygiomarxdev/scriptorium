#!/usr/bin/env bun
// The scriptorium command: every check outside Claude Code, with the output and exit code of the scripts.
//   scriptorium <status|trace|drift|migrate|spec|frd|...> ...   check.ts (also: scriptorium check <kind> ...)
//   scriptorium lint [root] | pre-commit [--all root] | install [root]
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { splitDocPath } from "./hook-doc-check.ts";

const OWN: Record<string, string> = { lint: "lint-docs.ts", "pre-commit": "pre-commit.ts", install: "install.ts" };
let [cmd, ...args] = process.argv.slice(2);
if (cmd === "check") [cmd, ...args] = args;
if (!cmd) {
  console.error("usage: scriptorium <status|trace|drift|migrate|approve|spec|frd|prd|tp|ux|lint|pre-commit|install> [args]");
  process.exit(2);
}
// The pin is read from the project that holds the document named, not from the current folder.
let cwd: string | undefined;
if (!OWN[cmd]) {
  args = args.map((a) => (a.endsWith(".md") && existsSync(a) ? resolve(a) : a));
  cwd = args.map((a) => splitDocPath(a)?.root).find(Boolean);
}
const script = join(dirname(import.meta.path), OWN[cmd] ?? "check.ts");
const r = Bun.spawnSync([process.execPath, script, ...(OWN[cmd] ? [] : [cmd]), ...args], { cwd, stdio: ["inherit", "inherit", "inherit"] });
process.exit(r.exitCode ?? 1);
