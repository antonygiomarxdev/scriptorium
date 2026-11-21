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
  expect(r.out).toContain("this project uses format 9; this Scriptorium knows up to 3: update Scriptorium");
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
  expect(r.out).toContain("this project uses format 9; this Scriptorium knows up to 3: update Scriptorium");
  expect(run("cli.ts", elsewhere, "status", project(2)).out).not.toContain("update Scriptorium"); // mutant: a known pin gives no update message
});

function reworkRoot(causes: string[], findings: string[]) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-report-"));
  mkdirSync(join(root, "docs", "metrics"), { recursive: true });
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Draft\n");
  writeFileSync(
    join(root, "docs", "metrics", "rework.md"),
    "# Rework queue\n\nStatus: Draft\n\n## Causes\n\n| ID | Step | Cause | Open | Prevention | Since |\n|---|---|---|---|---|---|\n" + causes.join("\n") + "\n\n## Open findings\n\n| ID | Date | Change | Cause | Finding |\n|---|---|---|---|---|\n" + findings.join("\n") + "\n",
  );
  return root;
}
const C = (id: string, step: string) => "| " + id + " | " + step + " | c | 0 | none | n/a |";
const R = (id: string, c: string) => "| " + id + " | 2026-11-20 | SPEC-01-1 | " + c + " | f |";

// covers: metrics/FRD-01/EX-14
test("EX-14: the rework report prints the open findings per cause, per step and in total", () => {
  const root = reworkRoot([C("C-1", "FRD"), C("C-2", "spec")], [R("R-1", "C-1"), R("R-2", "C-1"), R("R-3", "C-2")]);
  const r = run("cli.ts", root, "rework", ".");
  expect(r.code).toBe(0);
  const lines = r.out.split("\n").map((l) => l.trim());
  for (const l of ["C-1 (FRD): 2", "C-2 (spec): 1", "FRD: 2", "spec: 1", "open: 3"]) expect(lines).toContain(l);
});

// covers: metrics/FRD-01/EX-17
test("EX-17: the rework report of a log with causes and no findings prints open: 0", () => {
  const root = reworkRoot([C("C-1", "FRD")], []);
  const r = run("cli.ts", root, "rework", ".");
  expect(r.code).toBe(0);
  expect(r.out.split("\n").map((l) => l.trim())).toContain("open: 0");
  expect(r.out).not.toContain("C-1 (FRD)"); // a cause with no finding is not listed
});

// covers: metrics/FRD-01/EX-14
test("EX-14: a finding of an unknown cause is not in the per-cause or per-step lines", () => {
  const root = reworkRoot([C("C-1", "FRD")], [R("R-1", "C-1"), R("R-2", "C-9")]);
  const r = run("cli.ts", root, "rework", ".");
  expect(r.code).toBe(0);
  const lines = r.out.split("\n").map((l) => l.trim());
  expect(lines).toContain("C-1 (FRD): 1");
  expect(lines).toContain("FRD: 1");
  expect(r.out).not.toContain("C-9");
});

// covers: metrics/FRD-01/EX-14
test("EX-14: rework <root> run from another folder reads that root", () => {
  const root = reworkRoot([C("C-1", "FRD")], [R("R-1", "C-1"), R("R-2", "C-1")]);
  const elsewhere = mkdtempSync(join(tmpdir(), "scriptorium-elsewhere-"));
  const r = run("cli.ts", elsewhere, "rework", root);
  expect(r.code).toBe(0);
  expect(r.out.split("\n").map((l) => l.trim())).toContain("C-1 (FRD): 2");
});

// covers: metrics/FRD-01/EX-14
test("EX-14: with no rework queue the report prints nothing and exits 0", () => {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-noqueue-"));
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n\nStatus: Draft\n");
  const r = run("cli.ts", root, "rework", ".");
  expect(r.code).toBe(0);
  expect(r.out.trim()).toBe("");
});
