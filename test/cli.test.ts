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

// covers: chain/FRD-03/EX-24
test("EX-24: a document of a project pinned to an unknown format fails with the update message, run from another folder", () => {
  const pinned = (format: number) => {
    const root = mkdtempSync(join(tmpdir(), "scriptorium-cli-"));
    mkdirSync(join(root, ".scriptorium"));
    mkdirSync(join(root, "docs", "chain", "specs"), { recursive: true });
    writeFileSync(join(root, ".scriptorium", "config.json"), JSON.stringify({ format }));
    writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Draft\n");
    const spec = join(root, "docs", "chain", "specs", "SPEC-01-1-a.md");
    writeFileSync(spec, "# Spec\n\nStatus: Draft\n");
    return spec;
  };
  const elsewhere = mkdtempSync(join(tmpdir(), "scriptorium-elsewhere-"));
  const r = run("cli.ts", elsewhere, "spec", pinned(9));
  expect(r.code).toBe(1);
  expect(r.out).toContain("this project uses format 9; this Scriptorium knows up to 2: update Scriptorium");
  expect(run("cli.ts", elsewhere, "spec", pinned(2)).out).not.toContain("update Scriptorium"); // mutant: a known pin gives no update message
});

// covers: chain/FRD-03/EX-24
test("EX-24: the status command given a project folder reads that project's pin, run from another folder", () => {
  const project = (format: number) => {
    const root = mkdtempSync(join(tmpdir(), "scriptorium-cli-"));
    mkdirSync(join(root, ".scriptorium"));
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, ".scriptorium", "config.json"), JSON.stringify({ format }));
    writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Draft\n");
    return root;
  };
  const elsewhere = mkdtempSync(join(tmpdir(), "scriptorium-elsewhere-"));
  const r = run("cli.ts", elsewhere, "status", project(9));
  expect(r.code).toBe(1);
  expect(r.out).toContain("this project uses format 9; this Scriptorium knows up to 2: update Scriptorium");
  expect(run("cli.ts", elsewhere, "status", project(2)).out).not.toContain("update Scriptorium"); // mutant: a known pin gives no update message
});
