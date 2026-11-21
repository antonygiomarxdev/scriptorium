import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintFile, lintDocs, loadPhrases, docKind, avoidWords, CAPS } from "../scripts/lint-docs.ts";

const PH = ["delve", "serves as", "it's important to note", "not just"];
const lint = (rel: string, text: string, up: string[] = [], dir?: string) => lintFile(rel, text, PH, up, dir);
const reasons = (rel: string, text: string, up: string[] = [], dir?: string) => lint(rel, text, up, dir).map((f) => f.line + ": " + f.reason);
const has = (xs: string[], s: string) => xs.some((x) => x.includes(s));

test("document kind comes from the path", () => {
  expect(["PRODUCT.md", "x/PRD.md", "x/frd/FRD-01-a.md", "x/ux/UX-01-a.md", "tp/TP.md", "x/tp/TP-01-a.md", "adr/ADR-001-a.md", "x/specs/SPEC-01-a.md", "requests/REQ-1-a.md", "DECISIONS.md", "research/a.md"].map(docKind)).toEqual([
    "PRODUCT",
    "PRD",
    "FRD",
    "UX",
    "TP",
    "TP",
    "ADR",
    "SPEC",
    "REQUEST",
    "DECISIONS",
    undefined,
  ]);
});

test("banned phrases fail, case-insensitive, unless the line says lint-ok with a reason; research is exempt", () => {
  expect(reasons("PRODUCT.md", "# P\n## A\nPlain words.\n")).toEqual([]);
  expect(has(reasons("PRODUCT.md", "# P\n## A\nWe Delve into it.\n"), '3: banned phrase "delve"')).toBe(true);
  expect(has(reasons("PRODUCT.md", "# P\n## A\nIt’s important to note this.\n"), "it's important to note")).toBe(true);
  expect(has(reasons("PRODUCT.md", "# P\n## A\nIt serves as a base.\n"), "serves as")).toBe(true);
  expect(reasons("PRODUCT.md", "# P\n## A\nWe delve. <!-- lint-ok: quoted source -->\n")).toEqual([]);
  expect(has(reasons("PRODUCT.md", "# P\n## A\nWe delve. <!-- lint-ok: -->\n"), "delve")).toBe(true);
  expect(reasons("research/a.md", "# R\n## A\nWe delve.\n")).toEqual([]);
  expect(reasons("PRODUCT.md", "# P\n## A\nThe delver and robustness stay.\n")).toEqual([]); // whole words only
});

test("the shipped phrase list holds the starting phrases", () => {
  const p = loadPhrases();
  for (const x of ["pivotal", "delve", "seamless", "robust", "it's important to note", "serves as", "not just", "in today's", "leverage", "cutting-edge", "game-changer"]) expect(p).toContain(x);
});

function tree(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "scriptorium-lint-"));
  for (const [p, t] of Object.entries(files)) {
    mkdirSync(join(root, "docs", p, ".."), { recursive: true });
    writeFileSync(join(root, "docs", p), t);
  }
  return root;
}

test("a relative link must resolve to a file or directory; http, mailto and anchors are skipped", () => {
  const root = tree({ "a/PRD.md": "## A\n[ok](../b.md) [dir](../c) [web](https://x.y/z) [m](mailto:a@b.c) [anchor](#a) [sec](../b.md#b)\n", "b.md": "## B\nx\n", "c/n.md": "## C\nx\n" });
  expect(lintDocs(root, []).filter((f) => f.reason.includes("link"))).toEqual([]);
  const bad = tree({ "a/PRD.md": "## A\n[gone](../missing.md)\n" });
  expect(lintDocs(bad, []).map((f) => f.file + ":" + f.line + " " + f.reason)).toEqual(["a/PRD.md:2 link does not resolve: ../missing.md"]);
  const fenced = tree({ "a/PRD.md": "## A\n```\n[x](nope.md)\n```\ntext\n" });
  expect(lintDocs(fenced, [])).toEqual([]);
});

test("a section that is empty, TBD, TODO or a bare n/a fails; n/a with a reason passes", () => {
  expect(reasons("a.md", "# T\n## A\ntext\n## B\nn/a: no screens\n")).toEqual([]);
  expect(has(reasons("a.md", "# T\n## A\n\n## B\ntext\n"), "section is empty: ## A")).toBe(true);
  expect(has(reasons("a.md", "# T\n## A\nTBD\n"), "only TBD")).toBe(true);
  expect(has(reasons("a.md", "# T\n## A\nTODO.\n"), "only TODO")).toBe(true);
  expect(has(reasons("a.md", "# T\n## A\nn/a\n"), "only n/a")).toBe(true);
  expect(has(reasons("a.md", "# T\n## A\n<!-- note -->\n"), "section is empty")).toBe(true);
  expect(reasons("a.md", "# T\n## A\n```mermaid\nflowchart LR\n```\n")).toEqual([]); // a diagram is content
});

test("each document type has a line cap", () => {
  const lines = (n: number) => "## A\n" + "x\n".repeat(n - 1);
  for (const [rel, kind] of [
    ["PRODUCT.md", "PRODUCT"],
    ["a/PRD.md", "PRD"],
    ["a/frd/FRD-01-a.md", "FRD"],
    ["a/ux/UX-01-a.md", "UX"],
    ["tp/TP.md", "TP"],
    ["adr/ADR-001-a.md", "ADR"],
    ["a/specs/SPEC-01-a.md", "SPEC"],
    ["requests/REQ-1-a.md", "REQUEST"],
    ["DECISIONS.md", "DECISIONS"],
  ] as const) {
    expect(
      has(
        reasons(rel, lines(CAPS[kind])).filter((x) => x.includes("cap")),
        "cap",
      ),
    ).toBe(false);
    expect(has(reasons(rel, lines(CAPS[kind] + 1)), kind + " is " + (CAPS[kind] + 1) + " lines, over its cap of " + CAPS[kind])).toBe(true);
  }
  expect(CAPS).toEqual({ PRODUCT: 250, PRD: 150, FRD: 300, UX: 150, TP: 250, ADR: 80, SPEC: 80, REQUEST: 60, DECISIONS: 120 });
});

test("registry rows need their column filled: Goes into, Check, Command, Rule", () => {
  const t = (head: string, row: string) => "# R\n## Rows\n| ID | " + head + " |\n|---|---|\n| X-1 | " + row + " |\n";
  for (const [rel, col] of [
    ["DECISIONS.md", "Goes into"],
    ["INVARIANTS.md", "Check"],
    ["CHECKS.md", "Command"],
    ["CROSS-CUTTING.md", "Rule"],
  ]) {
    expect(reasons(rel, t(col, "something"))).toEqual([]);
    expect(has(reasons(rel, t(col, "")), 'X-1: empty "' + col + '" cell')).toBe(true);
    expect(has(reasons(rel, t("Other", "something")), 'no "' + col + '" column')).toBe(true);
  }
  expect(reasons("a/PRD.md", t("Other", ""))).toEqual([]); // other documents are not registries
  const two = "# R\n## Rows\n| ID | Check |\n|---|---|\n| I-1 | ok |\n\n| ID | Name |\n|---|---|\n| I-2 | |\n";
  expect(reasons("INVARIANTS.md", two).some((x) => x.includes("I-2"))).toBe(false); // only the first table is read until it ends
});

const LONG = "The pantry must show every family the pickup slots that still have room for them this week.";

test("a downstream document may not copy a 12-word sentence from its PRD or PRODUCT", () => {
  const frd = "# F\n## A\nUnique text of a different kind entirely. " + LONG + "\n";
  expect(reasons("a/frd/FRD-01-a.md", frd.replace(LONG, "Short sentence here."), [LONG])).toEqual([]);
  expect(has(reasons("a/frd/FRD-01-a.md", frd, ["# P\n## A\n" + LONG + "\n"]), "2: sentence copied")).toBe(false);
  expect(has(reasons("a/frd/FRD-01-a.md", frd, ["# P\n## A\n" + LONG + "\n"]), "3: sentence copied")).toBe(true);
  expect(has(reasons("a/ux/UX-01-a.md", frd, [LONG]), "sentence copied")).toBe(true);
  expect(has(reasons("tp/TP.md", frd, [LONG]), "sentence copied")).toBe(true);
  expect(has(reasons("a/specs/SPEC-01-a.md", frd, [LONG]), "sentence copied")).toBe(true);
  expect(has(reasons("a/frd/FRD-01-a.md", "# F\n## A\nThe pantry must show every family the pickup slots.\n", ["The pantry must show every family the pickup slots."]), "copied")).toBe(false); // under 12 words
  expect(has(reasons("a/PRD.md", frd, [LONG]), "copied")).toBe(false); // the PRD itself is not downstream
  const rows = "# S\n## Rows\n" + LONG + "\n## Build\nok\n";
  expect(has(reasons("a/specs/SPEC-01-a.md", rows, [LONG]), "sentence copied")).toBe(false); // a spec quotes its Rows
  expect(has(reasons("a/specs/SPEC-01-a.md", rows.replace("## Rows", "## Other"), [LONG]), "sentence copied")).toBe(true);
  expect(has(reasons("a/frd/FRD-01-a.md", rows, [LONG]), "sentence copied")).toBe(true); // only a spec
});

test("lintDocs finds the PRD of the slice and PRODUCT for the copy rule", () => {
  const files = { "PRODUCT.md": "# P\n## A\nx\n", "s/PRD.md": "# P\n## A\n" + LONG + "\n", "s/frd/FRD-01-a.md": "# F\n## A\n" + LONG + "\n", "tp/TP.md": "# T\n## A\nfine\n" };
  const fails = lintDocs(tree(files), []);
  expect(fails.map((f) => f.file)).toEqual(["s/frd/FRD-01-a.md"]);
  expect(lintDocs(tree({ ...files, "s/frd/FRD-01-a.md": "# F\n## A\nfine\n" }), [])).toEqual([]);
  expect(lintDocs(tree({ ...files, "s/frd/FRD-01-a.md": "# F\n## A\nfine\n", "tp/TP.md": "# T\n## A\n" + LONG + "\n" }).replace(/$/, ""), []).length).toBe(0); // PRODUCT holds no copy of it
});

const GLOSSARY = "# Glossary\n\n| Term | Meaning | Avoid |\n|---|---|---|\n| Booking | One place in a slot. | Reservation, appointment |\n| Family | A household. | client |\n";

test("a link anchor needs a heading with that GitHub slug, in the target or in the file itself", () => {
  const root = tree({ "a/PRD.md": "## A\n[ok](../b.md#the-why-2) [self](#a) [bad](../b.md#nope) [bad2](#zzz) [file](../b.md)\n", "b.md": "# B\n## The Why? 2\nbody\n" });
  const out = lintDocs(root, []).map((f) => f.file + ":" + f.line + ": " + f.reason);
  expect(out).toEqual(["a/PRD.md:2: link anchor has no heading: ../b.md#nope", "a/PRD.md:2: link anchor has no heading: #zzz"]);
});

test("a CHECKS.md Replay path in backticks must exist under the project root", () => {
  const checks = (cell: string) => "# C\n## A\n| ID | Prevents | Command | Replay |\n|---|---|---|---|\n| CHECK-1 | x | `bun test` | " + cell + " |\n";
  const root = tree({ "CHECKS.md": checks("`test/x.ts` fails") });
  expect(lintDocs(root, []).map((f) => f.reason)).toEqual(["CHECK-1: Replay path does not exist: test/x.ts"]);
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "test", "x.ts"), "");
  expect(lintDocs(root, [])).toEqual([]);
  expect(lintDocs(tree({ "CHECKS.md": checks("no path here, `bun` only") }), [])).toEqual([]);
});

test("glossary: the Avoid words are read from the table", () => {
  expect(avoidWords(GLOSSARY)).toEqual(["reservation", "appointment", "client"]);
  expect(avoidWords("# G\n| Term | Meaning |\n|---|---|\n| a | b |\n")).toEqual([]);
});

test("glossary: an Avoid word fails in any other document, whole word, unless lint-ok, in fences, in research or in the glossary", () => {
  const avoid = avoidWords(GLOSSARY);
  const l = (rel: string, body: string) => lintFile(rel, "# T\n## A\n" + body + "\n", [], [], undefined, avoid).map((f) => f.line + ": " + f.reason);
  expect(l("a/PRD.md", "A booking per family.")).toEqual([]);
  expect(has(l("a/PRD.md", "Each Reservation is one place."), '3: glossary: avoid "reservation"')).toBe(true);
  expect(has(l("a/frd/FRD-01-a.md", "The client books."), 'avoid "client"')).toBe(true);
  expect(l("a/PRD.md", "Clients and reservations are different words.")).toEqual([]); // whole words only
  expect(l("a/PRD.md", "The client books. <!-- lint-ok: quoted from the request -->")).toEqual([]);
  expect(l("a/PRD.md", "```\nclient\n```\ntext")).toEqual([]);
  expect(l("research/a.md", "The client books.")).toEqual([]);
  expect(lintFile("GLOSSARY.md", GLOSSARY, [], [], undefined, avoid)).toEqual([]);
});

test("glossary: lintDocs reads docs/GLOSSARY.md", () => {
  const root = tree({ "GLOSSARY.md": GLOSSARY, "a/PRD.md": "# P\n## A\nThe client books.\n" });
  expect(lintDocs(root, []).map((f) => f.file + ":" + f.line)).toEqual(["a/PRD.md:3"]);
  expect(lintDocs(tree({ "GLOSSARY.md": GLOSSARY, "a/PRD.md": "# P\n## A\nThe family books.\n" }), [])).toEqual([]);
});

// covers: chain/FRD-01/EX-20
test("a Version line fails and names the line, plain or bold, with or without v", () => {
  for (const v of ["Version: 1.2", "**Version:** 1.2", "Version 2.0.1", "  Version: v1.0"]) expect(reasons("a/PRD.md", "# P\n## A\n" + v + "\n")).toEqual(["3: [format 2] version number in a document"]);
  expect(reasons("a/PRD.md", "# P\n## A\n```\nVersion: 1.2\n```\ntext\n")).toEqual([]);
});

// covers: chain/FRD-01/EX-21
test("a release named in prose is not a document version", () => {
  expect(reasons("a/PRD.md", "# P\n## A\nThis requirement is met by the 0.3.0 release.\nVersion control stays in git.\n")).toEqual([]);
});

// covers: chain/FRD-03/EX-9
test("EX-9: a Version line only warns under format 1 and fails under format 2", () => {
  const root = tree({ "a/PRD.md": "# P\n## A\nVersion: 1.2\n" });
  const warnings: string[] = [];
  expect(lintDocs(root, [], warnings)).toEqual([]);
  expect(warnings).toEqual(["WARN (format 2): docs/a/PRD.md:3: version number in a document"]);
  mkdirSync(join(root, ".scriptorium"));
  writeFileSync(join(root, ".scriptorium", "config.json"), '{"format":2}');
  expect(lintDocs(root, []).map((f) => f.reason)).toEqual(["version number in a document"]);
});

// covers: chain/FRD-08/EX-3
test("EX-3: an ADR named NNNN-name.md has the ADR kind and its cap", () => {
  expect(docKind("adr/0021-baselines.md")).toBe("ADR");
  expect(docKind("docs/adr/0021-baselines.md")).toBe("ADR");
  expect(docKind("notes/0021-baselines.md")).toBeUndefined(); // mutant: only under adr/
  expect(has(reasons("adr/0021-baselines.md", "## A\n" + "x\n".repeat(89)), "ADR is 90 lines, over its cap of 80")).toBe(true);
  expect(has(reasons("adr/0021-baselines.md", "## A\n" + "x\n".repeat(79)), "over its cap")).toBe(false); // 80 lines is within the cap
});

// A project whose docs folder holds the given files and whose config sits beside docs/.
function adrProject(files: Record<string, string>, config?: string) {
  const root = tree(files);
  if (config !== undefined) {
    mkdirSync(join(root, ".scriptorium"), { recursive: true });
    writeFileSync(join(root, ".scriptorium", "config.json"), config);
  }
  return root;
}
const big = "# ADR 21\n" + "just a long note\n".repeat(199); // 200 lines
const lintAll = (root: string) => lintDocs(root, []).map((f) => f.file + ":" + f.line + " " + f.reason);

// covers: chain/FRD-08/EX-4
test("EX-4: the docs lint reports nothing for an ADR at or below the cutoff, however long and bare", () => {
  const root = adrProject({ "adr/0021-baselines.md": big }, '{"format":3,"legacyAdrsThrough":30}');
  expect(lintAll(root).filter((r) => r.includes("0021"))).toEqual([]);
  const above = adrProject({ "adr/0031-x.md": big }, '{"format":3,"legacyAdrsThrough":30}'); // mutant: above the cutoff the cap applies
  expect(lintAll(above).some((r) => r.includes("over its cap of 80"))).toBe(true);
});

// covers: chain/FRD-08/EX-7
test("EX-7: with no cutoff in the config a 200-line ADR fails its cap", () => {
  for (const config of [undefined, '{"format":3}']) {
    const root = adrProject({ "adr/0021-baselines.md": big }, config);
    expect(lintAll(root).some((r) => r.includes("ADR is 200 lines, over its cap of 80"))).toBe(true);
  }
});

// covers: chain/FRD-08/EX-11
test("EX-11: a cutoff that is not a whole number fails and says what to write", () => {
  for (const bad of ['"thirty"', "30.5", "-1"]) {
    const root = adrProject({ "adr/0021-baselines.md": "# ADR\n## A\nx\n" }, '{"format":3,"legacyAdrsThrough":' + bad + "}");
    expect(lintAll(root).some((r) => r.includes("legacyAdrsThrough must be a whole number, the last ADR written before adoption"))).toBe(true);
  }
  const ok = adrProject({ "adr/0021-baselines.md": "# ADR\n## A\nx\n" }, '{"format":3,"legacyAdrsThrough":30}');
  expect(lintAll(ok).some((r) => r.includes("legacyAdrsThrough"))).toBe(false); // mutant: a whole number is fine
});

// covers: chain/FRD-08/EX-11
test("EX-11: a cutoff that is not a whole number is a failure under every format, never a warning", () => {
  for (const config of ['{"format":2,"legacyAdrsThrough":"thirty"}', '{"legacyAdrsThrough":"thirty"}', '{"format":3,"legacyAdrsThrough":"thirty"}']) {
    const root = adrProject({ "adr/0021-baselines.md": "# ADR\n## A\nx\n" }, config);
    const r = Bun.spawnSync([process.execPath, join(import.meta.dir, "..", "scripts", "lint-docs.ts"), "."], { cwd: root });
    const out = r.stdout.toString() + r.stderr.toString();
    expect(r.exitCode).toBe(1);
    expect(out).toContain("legacyAdrsThrough must be a whole number, the last ADR written before adoption");
    expect(out).not.toMatch(/WARN[^\n]*legacyAdrsThrough/);
  }
});

// covers: chain/FRD-08/EX-4
test("EX-4: an ADR numbered exactly at the cutoff is exempt, and the next one is not", () => {
  const config = '{"format":3,"legacyAdrsThrough":30}';
  expect(lintAll(adrProject({ "adr/0030-x.md": big }, config)).filter((r) => r.includes("0030"))).toEqual([]);
  expect(lintAll(adrProject({ "adr/0031-x.md": big }, config)).some((r) => r.includes("over its cap of 80"))).toBe(true);
});

const linksDoc = (line: string) => "# P\n\nStatus: Draft\n" + line + "\n\n## A\nx\n";
const linkReasons = (line: string) => reasons("a/PRD.md", linksDoc(line)).filter((r) => r.includes("Links"));

// covers: chain/FRD-08/EX-13
test("EX-13: a Links line of several https links, separated by commas or spaces, reports nothing", () => {
  expect(linkReasons("Links: [Asana](https://app.asana.com/1/1), [Other](https://app.asana.com/0/2/3)")).toEqual([]);
  expect(linkReasons("Links: [Asana](https://app.asana.com/1/1) [Other](https://app.asana.com/0/2/3)")).toEqual([]);
  expect(linkReasons("Links: [Asana](https://app.asana.com/0/2/3)")).toEqual([]);
});

// covers: chain/FRD-08/EX-14
test("EX-14: a Links line with text that is not a link fails", () => {
  const r = linkReasons("Links: [Asana](https://app.asana.com/0/2/3) and a slot holds 10 families");
  expect(r).toHaveLength(1);
  expect(r[0]).toContain("Links line holds text that is not a link");
  expect(r[0]).toMatch(/^4: /); // it names the line
});

// covers: chain/FRD-08/EX-15
test("EX-15: a Links line with an http link fails", () => {
  const r = linkReasons("Links: [Asana](http://example.com/x)");
  expect(r).toHaveLength(1);
  expect(r[0]).toContain("Links line holds text that is not a link");
});

const capLines = (n: number) => "## A\n" + "x\n".repeat(n - 1);
const LINKS_LINE = "Links: [Asana](https://app.asana.com/0/2/3)\n";
const uxCap = (text: string) => reasons("a/ux/UX-01-a.md", text).filter((r) => r.includes("cap"));

// covers: chain/FRD-08/EX-16
test("EX-16: a Links header line is not counted toward the cap", () => {
  expect(CAPS.UX).toBe(150);
  expect(uxCap(capLines(150))).toEqual([]);
  expect(uxCap(LINKS_LINE + capLines(150))).toEqual([]); // 151 lines in the file, 150 counted
});

// covers: chain/FRD-08/EX-17
test("EX-17: one more content line over the cap fails, and the count leaves the Links line out", () => {
  const r = uxCap(LINKS_LINE + capLines(151));
  expect(r).toHaveLength(1);
  expect(r[0]).toContain("UX is 151 lines, over its cap of 150");
  expect(uxCap(capLines(151))[0]).toContain("UX is 151 lines, over its cap of 150"); // mutant: no Links line gives the same count
});

// covers: chain/FRD-08/EX-18
test("EX-18: only a Links line in the header is left out of the cap; a body Links line counts", () => {
  const body = LINKS_LINE.trim() + "\n";
  const inBody = "## A\n" + body + "x\n".repeat(149); // 151 lines, the Links line is below the first heading
  expect(uxCap(inBody)[0]).toContain("UX is 151 lines, over its cap of 150");
  expect(uxCap("## A\n" + "x\n".repeat(149))).toEqual([]); // mutant: without the line it is 150
  const many = "## A\n" + body.repeat(400);
  expect(uxCap(many)[0]).toContain("UX is 401 lines, over its cap of 150");
});

// covers: chain/FRD-08/EX-19
test("EX-19: a second Links line in the header counts toward the cap", () => {
  const second = "Links: [Other](https://app.asana.com/1/1/1)\n";
  const r = uxCap(LINKS_LINE + second + capLines(150));
  expect(r).toHaveLength(1);
  expect(r[0]).toContain("UX is 151 lines, over its cap of 150");
  expect(uxCap(LINKS_LINE + capLines(150))).toEqual([]); // the first one is still left out
});

// covers: chain/FRD-08/EX-18
test("EX-18: lines that only look like a Links line are counted", () => {
  for (const line of ["Linksys notes", "Lines: x", "links: [a](https://app.asana.com/0/2/3)", " Links: [a](https://app.asana.com/0/2/3)"]) {
    const r = uxCap(line + "\n" + capLines(150));
    expect([line, r.length]).toEqual([line, 1]);
    expect(r[0]).toContain("UX is 151 lines, over its cap of 150");
  }
});
