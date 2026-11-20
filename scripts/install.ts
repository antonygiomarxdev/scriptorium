#!/usr/bin/env bun
// install [root]: the pre-commit hook in <root>/.scriptorium, git's hooks path pointed at it; a project with no chain yet gets the newest pin.
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CONFIG, NEWEST } from "./format.ts";

const root = resolve(process.argv[2] ?? ".");
const git = (...a: string[]) => Bun.spawnSync(["git", "-C", root, ...a]);
const LOCAL = join(import.meta.dir, "cli.ts");
const LINE = `exec \${SCRIPTORIUM_CLI:-bun "${LOCAL}"} pre-commit`;
// Not a shell string run by us: this is the text of the hook file. It runs $SCRIPTORIUM_CLI, else the path install wrote
// to .scriptorium/local, from the repository root; never a package fetched by name (that name belongs to someone else).
const HOOK = `#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
if [ -n "$SCRIPTORIUM_CLI" ]; then exec $SCRIPTORIUM_CLI pre-commit; fi
if [ -f .scriptorium/local ]; then exec bun "$(cat .scriptorium/local)" pre-commit; fi
echo "scriptorium: no tool to run; run scriptorium install" >&2
exit 1
`;

const inRepo = git("rev-parse", "--git-dir").exitCode === 0;
const set = inRepo ? git("config", "--get", "core.hooksPath").stdout.toString().trim() : "";
if (set && set !== ".scriptorium") {
  console.error("core.hooksPath already points to " + set + ": install changed nothing. Add this line to " + set + "/pre-commit:\n" + LINE);
  process.exit(1);
}
if (!existsSync(join(root, "docs")) && !existsSync(join(root, CONFIG))) {
  mkdirSync(join(root, ".scriptorium"), { recursive: true });
  writeFileSync(join(root, CONFIG), JSON.stringify({ format: NEWEST }) + "\n");
  console.log("wrote " + CONFIG + " (format " + NEWEST + ")");
}
if (!inRepo) {
  console.log("not a git repository: the hook is not installed; run install again after git init");
  process.exit(0);
}
mkdirSync(join(root, ".scriptorium"), { recursive: true });
writeFileSync(join(root, ".scriptorium", "pre-commit"), HOOK);
chmodSync(join(root, ".scriptorium", "pre-commit"), 0o755);
writeFileSync(join(root, ".scriptorium", "local"), LOCAL + "\n");
writeFileSync(join(root, ".scriptorium", ".gitignore"), "local\n");
git("config", "core.hooksPath", ".scriptorium");
console.log("installed .scriptorium/pre-commit and set core.hooksPath to .scriptorium");
