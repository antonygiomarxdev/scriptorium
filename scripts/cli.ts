#!/usr/bin/env bun
// The scriptorium command: every check outside Claude Code, with the output and exit code of the scripts.
//   scriptorium <status|trace|drift|migrate|spec|frd|...> ...   check.ts (also: scriptorium check <kind> ...)
//   scriptorium lint [root] | pre-commit [--all root] | install [root] | rework [root]
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { splitDocPath } from "./hook-doc-check.ts";
import { readQueue } from "./rework.ts";

const OWN: Record<string, string> = { lint: "lint-docs.ts", "pre-commit": "pre-commit.ts", install: "install.ts" };
let [cmd, ...args] = process.argv.slice(2);
if (cmd === "check") [cmd, ...args] = args;
if (!cmd) {
  console.error("usage: scriptorium <status|trace|drift|migrate|approve|spec|frd|prd|tp|ux|lint|pre-commit|install> [args]");
  process.exit(2);
}
// rework [root]: open findings per cause, per step and in total.
if (cmd === "rework") {
  const q = readQueue(resolve(args[0] ?? "."));
  const per = (key: (c: { id: string; step: string }) => string) => {
    const n = new Map<string, number>();
    for (const f of q!.findings) {
      const c = q!.causes.find((x) => x.id === f.cause);
      if (!c) continue; // an unknown cause is a failure of status, not a line of the report
      n.set(key(c), (n.get(key(c)) ?? 0) + 1);
    }
    return [...n].map(([k, v]) => k + ": " + v);
  };
  if (q) console.log([...per((c) => c.id + " (" + c.step + ")"), ...per((c) => c.step), "open: " + q.findings.length].join("\n"));
  process.exit(0);
}
// The pin is read from the project that holds the document named, not from the current folder.
let cwd: string | undefined;
if (!OWN[cmd]) {
  // Any path that exists maps to its project root (a folder like docs/chain/frd too), not only .md files.
  args = args.map((a) => (existsSync(a) && splitDocPath(resolve(a) + (a.endsWith(".md") ? "" : "/x.md")) ? resolve(a) : a));
  cwd = args.map((a) => (existsSync(a) ? splitDocPath(resolve(a) + (a.endsWith(".md") ? "" : "/x.md"))?.root : undefined)).find(Boolean);
}
const script = join(dirname(import.meta.path), OWN[cmd] ?? "check.ts");
const r = Bun.spawnSync([process.execPath, script, ...(OWN[cmd] ? [] : [cmd]), ...args], { cwd, stdio: ["inherit", "inherit", "inherit"] });
process.exit(r.exitCode ?? 1);
