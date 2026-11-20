import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "../scripts/migrate.ts";

const SUM = "## Summary\n\ns\n\nLast change: 2026-11-20, written\n";
const ROWS = "| EX-1 | a | b |\n| EX-2 | c | d |\n";
// A format 2 spec but for its Rests on line, which migrate adds under Status; it quotes the TP beside it.
const SPEC = "# Spec\n\nStatus: Draft\n\n" + SUM + "\n## Rows\n" + ROWS + "\n## Files\n| File | Change |\n|---|---|\n| a.ts | new |\n\n## Tests first\nEX-1, EX-2\n\n## Build\nb\n\n## Done when\n`bun test`\n\n## Out of scope\nn\n\n## Open questions\nNone\n";
const OLD =
  "# Spec\n\nStatus: Draft\n\n" + SUM + "\n## Context\nc\n## Files\nf\n## Interfaces\ni\n## Data\nd\n## Tasks\n### Task 1: a\n- **Tests first:** EX-1\n- **Done when:** ok\n### Task 2: b\n- **Tests first:** EX-2\n- **Done when:** ok\n### Task 3: c\n- **Tests first:** EX-1\n- **Done when:** ok\n## Out of scope\nn\n";
const S1 = "docs/inbox/specs/SPEC-01-1-a.md";

function project(files: Record<string, string> = {}, config?: string) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-migrate-"));
  const all = { "docs/PRODUCT.md": "Status: Approved (2026-11-17)\n", "docs/inbox/PRD.md": "Status: Draft\n", "docs/inbox/tp/TP-01-a.md": "Status: Draft\n" + ROWS, [S1]: SPEC, ...files, ...(config ? { ".scriptorium/config.json": config } : {}) };
  for (const [p, t] of Object.entries(all)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  return root;
}
const read = (root: string, p: string) => readFileSync(join(root, p), "utf8");
const status = (root: string) => Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "status", "."], { cwd: root }).exitCode;

// covers: chain/FRD-03/EX-10
test("a dry run lists the rewrite and changes no file", () => {
  const root = project();
  const r = migrate(root);
  expect(r.lines).toContain("  add Rests on: ../tp/TP-01-a.md to SPEC-01-1-a.md");
  expect(read(root, S1)).toBe(SPEC);
  expect(() => read(root, ".scriptorium/config.json")).toThrow();
});

// covers: chain/FRD-03/EX-11
// covers: chain/FRD-03/ST-1
test("apply writes the line under Status, moves the pin to 2 and status passes", () => {
  const root = project();
  const r = migrate(root, true);
  expect(r.code).toBe(0);
  expect(read(root, S1)).toBe(SPEC.replace("Status: Draft\n", "Status: Draft\nRests on: ../tp/TP-01-a.md\n"));
  expect(JSON.parse(read(root, ".scriptorium/config.json"))).toEqual({ format: 2 });
  expect(status(root)).toBe(0);
});

// covers: chain/FRD-03/EX-12
// covers: chain/FRD-03/ST-3
test("a spec to split keeps the pin, the mechanical rewrite stays", () => {
  const root = project({ "docs/inbox/specs/SPEC-02-1-b.md": OLD });
  const r = migrate(root, true);
  expect(r.code).toBe(1);
  expect(read(root, S1)).toContain("Rests on: ../tp/TP-01-a.md");
  expect(() => read(root, ".scriptorium/config.json")).toThrow(); // pin stays 1
  expect(r.lines).toContain("split docs/inbox/specs/SPEC-02-1-b.md with the migrate skill");
  expect(r.lines.join("\n")).not.toContain("SPEC-01-1-a.md with the migrate skill");
});

// covers: chain/FRD-03/EX-13
// covers: chain/FRD-03/ST-2
test("at the newest format there is nothing to migrate and nothing changes", () => {
  const root = project({}, '{"format": 2}');
  for (const apply of [false, true]) expect(migrate(root, apply)).toEqual({ lines: ["nothing to migrate: format 2 is the newest"], code: 0 });
  expect(read(root, S1)).toBe(SPEC);
  expect(read(root, ".scriptorium/config.json")).toBe('{"format": 2}');
});

test("the CLI runs migrate with and without --apply", () => {
  const root = project();
  const cli = (...a: string[]) => Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "check.ts"), "migrate", ...a], { cwd: root });
  expect(cli().stdout.toString()).toContain("add Rests on: ../tp/TP-01-a.md");
  expect(cli("--apply").exitCode).toBe(0);
  expect(read(root, ".scriptorium/config.json")).toContain('"format": 2');
});
