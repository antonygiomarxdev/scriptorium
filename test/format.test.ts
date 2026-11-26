import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { gate, readFormat } from "../scripts/format.ts";

const root = join(import.meta.dir, "..");
const scripts = join(root, "scripts");
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

// covers: chain/FRD-03/EX-3
test("an unknown pin: the CLI exits 1 saying update Scriptorium, the hook passes with the warning", () => {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-pin-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  mkdirSync(join(root, ".scriptorium"));
  writeFileSync(join(root, "docs", "PRODUCT.md"), "x");
  writeFileSync(join(root, ".scriptorium", "config.json"), '{"format": 9}');
  const msg = "this project uses format 9; this Scriptorium knows up to 5: update Scriptorium";
  const cli = Bun.spawnSync([process.execPath, join(scripts, "check.ts"), "status", "."], { cwd: root });
  expect(cli.exitCode).toBe(1);
  expect(cli.stdout.toString()).toContain(msg);
  const hook = Bun.spawnSync([process.execPath, join(scripts, "hook-doc-check.ts")], { cwd: root, stdin: Buffer.from(JSON.stringify({ cwd: root, tool_input: { file_path: join(root, "docs", "PRODUCT.md") } })) });
  expect(hook.exitCode).toBe(0);
  expect(hook.stderr.toString()).toContain(msg);
  writeFileSync(join(root, ".scriptorium", "config.json"), '{"format": 2}'); // mutant: a known pin gives no pin message
  expect(Bun.spawnSync([process.execPath, join(scripts, "check.ts"), "status", "."], { cwd: root }).stdout.toString()).not.toContain("update Scriptorium");
});

// covers: chain/FRD-03/EX-4
test("a config whose format is not a whole number fails the CLI and names the file", () => {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-pin-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  mkdirSync(join(root, ".scriptorium"));
  for (const bad of ['{"format": "two"}', "{nope", '{"format": 0}', '{"format": 1.5}']) {
    writeFileSync(join(root, ".scriptorium", "config.json"), bad);
    const r = Bun.spawnSync([process.execPath, join(scripts, "check.ts"), "status", "."], { cwd: root });
    expect(r.exitCode).toBe(1);
    expect(r.stdout.toString()).toContain(".scriptorium/config.json");
  }
});

// covers: chain/FRD-03/DT-1
test("readFormat takes 1 when missing; gate turns failures of newer formats into warnings", () => {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-pin-"));
  expect(readFormat(root)).toBe(1);
  mkdirSync(join(root, ".scriptorium"));
  writeFileSync(join(root, ".scriptorium", "config.json"), "{}");
  expect(readFormat(root)).toBe(1);
  expect(gate(["old", "[format 2] new"], 1)).toEqual({ fails: ["old"], warnings: ["WARN (format 2): new"] });
  expect(gate(["old", "[format 2] new"], 2)).toEqual({ fails: ["old", "new"], warnings: [] });
});
