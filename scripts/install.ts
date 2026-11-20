#!/usr/bin/env bun
// install [root]: the pre-commit hook in <root>/.scriptorium, git's hooks path pointed at it; a project with no chain yet gets the newest pin.
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CONFIG, NEWEST } from "./format.ts";

const root = resolve(process.argv[2] ?? ".");
const git = (...a: string[]) => Bun.spawnSync(["git", "-C", root, ...a]);
const LINE = "bunx scriptorium pre-commit";
// Not a shell string run by us: this is the text of the hook file. SCRIPTORIUM_CLI overrides the command (a local checkout, a pinned path).
const HOOK = '#!/bin/sh\ncd "$(dirname "$0")/.." || exit 1\nexec ${SCRIPTORIUM_CLI:-bunx scriptorium} pre-commit\n';

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
git("config", "core.hooksPath", ".scriptorium");
console.log("installed .scriptorium/pre-commit and set core.hooksPath to .scriptorium");
