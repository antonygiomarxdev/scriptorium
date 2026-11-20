import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";

const root = join(import.meta.dir, "..");
const bin = join(root, "node_modules", ".bin");
const biome = (...a: string[]) => Bun.spawnSync(["biome", "format", ...a], { cwd: root, env: { ...process.env, PATH: bin + delimiter + process.env.PATH } });
const sample = (name: string, text: string) => {
  const p = join(mkdtempSync(join(tmpdir(), "scriptorium-fmt-")), name);
  writeFileSync(p, text);
  return p;
};

// FMT-1, FMT-2: the formatter fails on a TypeScript file with wrong indentation and passes on a formatted one.
test("FMT-1: format:check fails on wrong indentation and passes on formatted code", () => {
  expect(biome("--config-path=.", sample("a.ts", "export function f() {\n        return 1;\n}\n")).exitCode).not.toBe(0);
  expect(biome("--config-path=.", sample("a.ts", "export function f() {\n  return 1;\n}\n")).exitCode).toBe(0);
});

test("FMT-1: it never touches markdown, whatever its layout", () => {
  const dir = dirname(sample("good.ts", "export const a = 1;\n"));
  writeFileSync(join(dir, "messy.md"), "#   Title\n\n*   one\n     *   two\n   text   with   spaces\n");
  expect(biome("--config-path=.", dir).exitCode).toBe(0); // the markdown beside the formatted file is ignored
  writeFileSync(join(dir, "bad.ts"), "export const b   =  1\n");
  expect(biome("--config-path=.", dir).exitCode).not.toBe(0); // the same folder fails once a TypeScript file is not formatted
});

// FMT-2: the scripts exist and CI runs the check.
test("FMT-2: package.json has format and format:check, and CI runs format:check", () => {
  const pkg = require("../package.json");
  expect(pkg.scripts.format).toContain("--write");
  expect(pkg.scripts["format:check"]).toContain("biome");
  expect(require("node:fs").readFileSync(join(root, ".github/workflows/ci.yml"), "utf8")).toContain("bun run format:check");
});
