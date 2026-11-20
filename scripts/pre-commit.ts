#!/usr/bin/env bun
// L-12 layer 2: the same document checks on staged documents, for any agent or person. Exit 1 blocks the commit.
// Does nothing in a project without docs/PRODUCT.md.
// Install once per clone, from the project root (Git needs an executable file named pre-commit):
//   printf '#!/bin/sh\nexec bun "<path to scriptorium>/scripts/pre-commit.ts"\n' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
// Or keep that two-line file in a folder of your own and run: git config core.hooksPath <folder>
// CI runs the whole of one project: bun scripts/pre-commit.ts --all <root>   (root holds docs/)
// shortcut: reads the working-tree file, not the staged blob; stage everything you mean to commit.
import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { isChainProject, runDocChecks, runStatus, runTrace, splitDocPath } from "./hook-doc-check.ts";
import { toPosix } from "./paths.ts";

const sh = (args: string[], cwd?: string) => Bun.spawnSync(args, { cwd }).stdout.toString().trim();
// L-15 Changesets: staged `git diff --name-status` lines; fails a change outside docs/, tests and .changeset/ that stages no new changeset.
const isTest = (p: string) => /(^|\/)(tests?|__tests__)\//.test(p) || /\.(test|spec)\./.test(p);
export function changesetRule(nameStatus: string[]): string[] {
  const rows = nameStatus.map((l) => l.split("\t")).filter((c) => c.length >= 2).map((c) => ({ s: c[0]![0]!, ps: c.slice(1).map((p) => toPosix(p)) }));
  const isChangeset = (r: { s: string; ps: string[] }) => r.s === "A" && /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(r.ps[0]!);
  // A rename or copy has two paths: code moved into docs/ is still a code change.
  const codePath = rows.flatMap((r) => r.ps).find((p) => !p.startsWith("docs/") && !p.startsWith(".changeset/") && !isTest(p));
  if (!codePath || rows.some(isChangeset)) return [];
  return [`Changeset missing: ${codePath} is staged without a new .changeset/*.md. Run \`bunx changeset\` (or \`bunx changeset --empty\` when no user notices the change) and stage it.`];
}

const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

if (import.meta.main) {
  const all = process.argv[2] === "--all";
  let docs: { root: string; rel: string }[];
  if (all) {
    const root = process.argv[3] ?? ".";
    docs = walk(join(root, "docs")).map((f) => ({ root, rel: toPosix(relative(root, f)) })).filter((d) => d.rel.endsWith(".md"));
  } else {
    const top = sh(["git", "rev-parse", "--show-toplevel"]);
    docs = sh(["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"], top).split("\n").filter(Boolean)
      .map((f) => splitDocPath(join(top, f))).filter((d): d is { root: string; rel: string } => !!d && isChainProject(d.root));
  }
  const fails: string[] = [];
  if (!all) {
    const top = sh(["git", "rev-parse", "--show-toplevel"]);
    if (existsSync(join(top, ".changeset", "config.json"))) fails.push(...changesetRule(sh(["git", "diff", "--cached", "--name-status", "--diff-filter=ACMRD"], top).split("\n").filter(Boolean)));
  }
  for (const d of docs) fails.push(...runDocChecks(d.root, d.rel, all));
  for (const root of new Set(docs.map((d) => d.root))) fails.push(...runStatus(root), ...runTrace(root));
  if (fails.length) {
    console.error("Scriptorium: commit blocked.\n" + [...new Set(fails)].join("\n"));
    process.exit(1);
  }
  console.log("Scriptorium: " + docs.length + " documents pass");
}
