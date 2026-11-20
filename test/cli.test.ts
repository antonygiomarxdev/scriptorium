import { test, expect } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const S = join(import.meta.dir, "..", "scripts");
const run = (script: string, cwd: string, ...a: string[]) => {
  const r = Bun.spawnSync([process.execPath, join(S, script), ...a], { cwd });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
};

// covers: chain/FRD-03/EX-16
test("EX-16: the status command of the command-line tool equals the status script", () => {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-cli-"));
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Draft\n");
  const a = run("cli.ts", root, "status", ".");
  const b = run("check.ts", root, "status", ".");
  expect(a).toEqual(b);
  expect(a.out).toContain("PASS status");
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Approved (2026-11-21)\n"); // an approval resting on nothing it checks
  expect(run("cli.ts", root, "status", ".")).toEqual(run("check.ts", root, "status", "."));
  expect(run("cli.ts", root).code).toBe(2);
});
