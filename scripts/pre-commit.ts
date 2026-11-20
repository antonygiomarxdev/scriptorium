#!/usr/bin/env bun
// L-12 layer 2: the same document checks on staged documents, for any agent or person. Exit 1 blocks the commit.
// Does nothing in a project without docs/PRODUCT.md.
// Install once per clone, from the project root (Git needs an executable file named pre-commit):
//   printf '#!/bin/sh\nexec bun "<path to scriptorium>/scripts/pre-commit.ts"\n' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
// Or keep that two-line file in a folder of your own and run: git config core.hooksPath <folder>
// CI runs the whole of one project: bun scripts/pre-commit.ts --all <root>   (root holds docs/)
// shortcut: reads the working-tree file, not the staged blob; stage everything you mean to commit.
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { isChainProject, runDocChecks, runStatus, splitDocPath } from "./hook-doc-check.ts";

const sh = (args: string[], cwd?: string) => Bun.spawnSync(args, { cwd }).stdout.toString().trim();
const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

if (import.meta.main) {
  const all = process.argv[2] === "--all";
  let docs: { root: string; rel: string }[];
  if (all) {
    const root = process.argv[3] ?? ".";
    docs = walk(join(root, "docs")).map((f) => ({ root, rel: relative(root, f).replaceAll("\\", "/") })).filter((d) => d.rel.endsWith(".md"));
  } else {
    const top = sh(["git", "rev-parse", "--show-toplevel"]);
    docs = sh(["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"], top).split("\n").filter(Boolean)
      .map((f) => splitDocPath(join(top, f))).filter((d): d is { root: string; rel: string } => !!d && isChainProject(d.root));
  }
  const fails: string[] = [];
  for (const d of docs) fails.push(...runDocChecks(d.root, d.rel, all));
  for (const root of new Set(docs.map((d) => d.root))) fails.push(...runStatus(root));
  if (fails.length) {
    console.error("Scriptorium: commit blocked.\n" + [...new Set(fails)].join("\n"));
    process.exit(1);
  }
  console.log("Scriptorium: " + docs.length + " documents pass");
}
