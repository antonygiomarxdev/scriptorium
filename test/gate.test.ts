import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { approve } from "../scripts/drift.ts";
import { gateFile } from "../scripts/gate.ts";

const SUM = "## Summary\n\ns\n\nLast change: 2026-11-20, written\n";
const PRD = "# PRD\n\nStatus: Draft\n\n" + SUM;
const FRD = "# FRD\n\nStatus: Draft\nRests on: ../PRD.md\n\n" + SUM;
const spec = (files: string, status = "Draft") =>
  "# Spec\n\nStatus: " + status + "\nRests on: ../frd/FRD-01-a.md\n\n" + SUM + "\n## Rows\n| EX-1 | a | b |\n\n## Files\n| Path | Create or change | Holds |\n|---|---|---|\n" + files + "\n\n## Tests first\nEX-1\n\n## Build\nb\n\n## Done when\n`bun test`\n\n## Out of scope\nn\n\n## Open questions\nNone\n";
const row = (p: string) => "| `" + p + "` | Create | x |";
const req = (status: string, path: string) => "# REQ-1: x\n\nStatus: " + status + "\n\n" + SUM + "\nShort path: " + path + "\n";
const SPEC = "docs/chain/specs/SPEC-01-1-a.md";

function project(files: Record<string, string>, approveSpec = false) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-gate-"));
  const all: Record<string, string> = { "docs/PRODUCT.md": "# P\n\nStatus: Draft\n\n" + SUM, "docs/chain/PRD.md": PRD, "docs/chain/frd/FRD-01-a.md": FRD, ...files };
  for (const [p, t] of Object.entries(all)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), t);
  }
  if (approveSpec) {
    approve(join(root, "docs/PRODUCT.md"), root, "2026-11-21");
    approve(join(root, "docs/chain/PRD.md"), root, "2026-11-21");
    approve(join(root, "docs/chain/frd/FRD-01-a.md"), root, "2026-11-21");
    approve(join(root, SPEC), root, "2026-11-21");
  }
  return root;
}

// covers: chain/FRD-04/EX-2
// covers: chain/FRD-04/DT-2
test("no spec lists the file: refused with the reason and how to write a spec", () => {
  const root = project({ [SPEC]: spec(row("scripts/a.ts")) }, true);
  const r = gateFile(root, "scripts/b.ts");
  expect(r).toContain("scripts/b.ts: no approved spec names it in its Files table");
  expect(r).toContain("spec");
});

// covers: chain/FRD-04/EX-3
test("only a draft spec lists the file: refused and the spec named as not approved", () => {
  const root = project({ [SPEC]: spec(row("scripts/a.ts")) });
  const r = gateFile(root, "scripts/a.ts");
  expect(r).toBeDefined();
  expect(r).toContain("SPEC-01-1-a.md");
  expect(r).toContain("not approved");
});

// covers: chain/FRD-04/EX-4
// covers: chain/FRD-04/DT-1
test("tests and docs go ahead with no spec", () => {
  const root = project({});
  expect(gateFile(root, "test/a.test.ts")).toBeUndefined();
  expect(gateFile(root, "docs/x.md")).toBeUndefined();
});

// covers: chain/FRD-04/EX-5
test("an accepted request with the short path lets the edit go ahead", () => {
  const root = project({ "docs/requests/REQ-1-a.md": req("Accepted", "scripts/c.ts") });
  expect(gateFile(root, "scripts/c.ts")).toBeUndefined();
});

// covers: chain/FRD-04/EX-6
test("an open request with the short path does not let the edit go ahead", () => {
  const root = project({ "docs/requests/REQ-1-a.md": req("Open", "scripts/c.ts") });
  expect(gateFile(root, "scripts/c.ts")).toBeDefined();
});

// covers: chain/FRD-04/EX-7
test("configuration is gated like code", () => {
  const root = project({ [SPEC]: spec(row("scripts/a.ts")) }, true);
  expect(gateFile(root, "package.json")).toContain("package.json: no approved spec names it in its Files table");
});

// covers: chain/FRD-04/EX-8
test("a Files row ending in a slash names the folder", () => {
  const root = project({ [SPEC]: spec(row("src/pickups/")) }, true);
  expect(gateFile(root, "src/pickups/book.ts")).toBeUndefined();
  expect(gateFile(root, "src/other/book.ts")).toBeDefined();
});

// covers: chain/FRD-04/DT-4
test("not exempt, named by an approved spec: allowed", () => {
  const root = project({ [SPEC]: spec(row("scripts/a.ts")) }, true);
  expect(gateFile(root, "scripts/a.ts")).toBeUndefined();
});

const frdRows = (ids: string[]) => FRD + "\n## Rows\n" + ids.map((i) => "| " + i + " | RULE-1 | positive | g | w | t |").join("\n") + "\n";
const specRows = (ids: string[], rests = "../frd/FRD-01-a.md") =>
  spec(row("scripts/a.ts"))
    .replace("../frd/FRD-01-a.md", rests)
    .replace("| EX-1 | a | b |", ids.map((i) => "| " + i + " | RULE-1 | positive | g | w | t |").join("\n"));
const tag = (id: string) => "// covers: chain/FRD-01/" + id + '\ntest("t", () => {});\n';

// covers: chain/FRD-04/EX-1
test("every quoted FRD row has a covers tag: the edit goes ahead", () => {
  const root = project({ "docs/chain/frd/FRD-01-a.md": frdRows(["EX-4"]), [SPEC]: specRows(["EX-4"]), "test/a.test.ts": tag("EX-4") }, true);
  expect(gateFile(root, "scripts/a.ts")).toBeUndefined();
});

// covers: chain/FRD-04/EX-10
// covers: chain/FRD-04/DT-3
test("a quoted FRD row without a covers tag: refused, write the tests first", () => {
  const root = project({ "docs/chain/frd/FRD-01-a.md": frdRows(["EX-4"]), [SPEC]: specRows(["EX-4"]), "test/a.test.ts": tag("EX-9") }, true);
  expect(gateFile(root, "scripts/a.ts")).toContain("write the tests first: FRD-01/EX-4");
});

// covers: chain/FRD-04/EX-11
test("rows quoted from a request need no covers tag", () => {
  const root = project({ "docs/requests/REQ-1-a.md": req("Accepted", "scripts/z.ts"), [SPEC]: specRows(["EX-4"], "../../requests/REQ-1-a.md") }, true);
  expect(gateFile(root, "scripts/a.ts")).toBeUndefined();
});
