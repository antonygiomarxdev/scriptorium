#!/usr/bin/env bun
// FRD-04 PreToolUse on Edit|Write|MultiEdit|NotebookEdit: refuse an edit to a file no approved spec names.
// Hook input (JSON) arrives on stdin. Exit 2 with the refusal; exit 0 when allowed, not a chain project, or format 1 (warning only).
// An error in the hook itself refuses: a gate that fails open is no gate.
import { isAbsolute, relative, resolve } from "node:path";
import { gateFile } from "./gate.ts";
import { gate, readFormat } from "./format.ts";
import { isChainProject, projectOf } from "./hook-doc-check.ts";
import { toPosix, typed } from "./paths.ts";

try {
  const input: { tool_input?: { file_path?: string; notebook_path?: string }; cwd?: string } = JSON.parse(await Bun.stdin.text());
  const session = resolve(input.cwd ?? process.cwd());
  const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
  if (!file) process.exit(0);
  const abs = resolve(session, typed(file));
  const root = projectOf(abs, session);
  if (!isChainProject(root)) process.exit(0);
  const rel = toPosix(relative(root, abs));
  if (rel.startsWith("..") || isAbsolute(rel)) process.exit(0); // outside the project
  const refusal = gateFile(root, rel);
  if (!refusal) process.exit(0);
  const g = gate([refusal], readFormat(root));
  if (g.warnings.length) console.error(g.warnings.join("\n"));
  if (g.fails.length) {
    console.error(g.fails.join("\n"));
    process.exit(2);
  }
} catch (e) {
  console.error("Scriptorium gate hook failed: " + (e as Error).message);
  process.exit(2);
}
