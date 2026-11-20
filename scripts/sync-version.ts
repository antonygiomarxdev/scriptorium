#!/usr/bin/env bun
// Copies the version Changesets wrote to package.json into the plugin manifest, so both say the same.
import { readFileSync, writeFileSync } from "node:fs";

export function syncVersion(pkg: string, manifest: string): string {
  const version = JSON.parse(pkg).version;
  if (!/^\d+\.\d+\.\d+/.test(version ?? "")) throw new Error(`package.json has no semver version: ${version}`);
  return JSON.stringify({ ...JSON.parse(manifest), version }, null, 2) + "\n";
}

if (import.meta.main) {
  const path = ".claude-plugin/plugin.json";
  writeFileSync(path, syncVersion(readFileSync("package.json", "utf8"), readFileSync(path, "utf8")));
}
