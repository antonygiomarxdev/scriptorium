import { test, expect } from "bun:test";
import { cpSync, globSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const S = join(import.meta.dir, "..", "scripts");
const LARDER = join(import.meta.dir, "fixtures", "format-1", "examples", "larder");

// Today's checks on a project root: the status, every spec check, the lint and the coverage scan.
function runAll(root: string) {
  const run = (script: string, ...args: string[]) => {
    const r = Bun.spawnSync([process.execPath, join(S, script), ...args], { cwd: root });
    return { code: r.exitCode, out: r.stdout.toString() };
  };
  const specs = globSync("docs/*/specs/SPEC-*.md", { cwd: root }).map((s) => s.replaceAll("\\", "/"));
  return [run("check.ts", "status", "."), ...specs.map((s) => run("check.ts", "spec", s)), run("lint-docs.ts", "."), run("check.ts", "trace", ".")];
}

// covers: chain/FRD-03/EX-17
test("EX-17: the Larder example of 0.3.0, with no pin, passes today's checks with warnings only", () => {
  const rs = runAll(LARDER);
  expect(rs.length).toBeGreaterThan(3);
  expect(rs.map((r) => r.code)).toEqual(rs.map(() => 0));
  expect(rs.map((r) => r.out).join("\n")).toContain("WARN (format 2):"); // the newer rules are checked, and only warn
});

// covers: chain/FRD-03/EX-18
test("EX-18: the same example fails once its pin is format 2, so a format 2 rule made to fail under format 1 breaks the test above", () => {
  const copy = mkdtempSync(join(tmpdir(), "scriptorium-frozen-"));
  cpSync(LARDER, copy, { recursive: true });
  mkdirSync(join(copy, ".scriptorium"));
  writeFileSync(join(copy, ".scriptorium", "config.json"), '{"format":2}');
  expect(runAll(copy).some((r) => r.code === 1)).toBe(true);
});
