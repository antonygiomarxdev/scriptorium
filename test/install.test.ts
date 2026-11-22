import { test, expect } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const S = join(import.meta.dir, "..", "scripts");
const tmp = () => mkdtempSync(join(tmpdir(), "scriptorium-install-"));
const git = (cwd: string, ...a: string[]) => Bun.spawnSync(["git", ...a], { cwd, env: { ...process.env, SCRIPTORIUM_CLI: "bun " + join(S, "cli.ts") } });
const install = (cwd: string) => {
  const r = Bun.spawnSync([process.execPath, join(S, "install.ts"), cwd]);
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
};

// covers: chain/FRD-03/EX-5
test("EX-5: install in a folder with no docs and no .scriptorium writes the newest format", () => {
  const root = tmp();
  expect(install(root).code).toBe(0);
  expect(JSON.parse(readFileSync(join(root, ".scriptorium", "config.json"), "utf8"))).toEqual({ format: 4 });
  const withDocs = tmp();
  mkdirSync(join(withDocs, "docs"));
  install(withDocs);
  expect(existsSync(join(withDocs, ".scriptorium", "config.json"))).toBe(false); // a project with a chain keeps its own pin
});

// covers: chain/FRD-03/EX-14
test("EX-14: install writes the hook, sets the hooks path, and a commit of a failing document is blocked", () => {
  const root = tmp();
  git(root, "init");
  mkdirSync(join(root, "docs", "requests"), { recursive: true });
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n");
  writeFileSync(join(root, "docs", "requests", "REQ-1-a.md"), "# REQ-1: x\n\nStatus: Open\n");
  expect(install(root).code).toBe(0);
  expect(existsSync(join(root, ".scriptorium", "pre-commit"))).toBe(true);
  expect(git(root, "config", "core.hooksPath").stdout.toString().trim()).toBe(".scriptorium");
  git(root, "add", "docs/requests/REQ-1-a.md");
  const c = git(root, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-m", "x");
  expect(c.exitCode).not.toBe(0);
  expect(c.stderr.toString() + c.stdout.toString()).toContain("commit blocked");
  expect(install(root).code).toBe(0); // running it again is fine
});

// covers: chain/FRD-03/EX-15
test("EX-15: a hooks path set elsewhere is refused, nothing changes, the line to add is printed", () => {
  const root = tmp();
  git(root, "init");
  git(root, "config", "core.hooksPath", ".husky");
  const r = install(root);
  expect(r.code).toBe(1);
  expect(r.out).toContain(".husky");
  expect(r.out).toMatch(/SCRIPTORIUM_CLI|\.scriptorium\/local/);
  expect(r.out).not.toContain("bunx");
  expect(existsSync(join(root, ".scriptorium"))).toBe(false);
  expect(git(root, "config", "core.hooksPath").stdout.toString().trim()).toBe(".husky");
});

const FAIL_REQ = "# REQ-1: x\n\nStatus: Open\n";
function repo() {
  const root = tmp();
  git(root, "init");
  mkdirSync(join(root, "docs", "requests"), { recursive: true });
  mkdirSync(join(root, "sub"));
  writeFileSync(join(root, "docs", "PRODUCT.md"), "# P\n");
  writeFileSync(join(root, "docs", "requests", "REQ-1-a.md"), FAIL_REQ);
  expect(install(root).code).toBe(0);
  git(root, "add", "docs/requests/REQ-1-a.md");
  return root;
}
// git without SCRIPTORIUM_CLI, so the hook falls back to what install wrote
const bare = (cwd: string, ...a: string[]) => {
  const { SCRIPTORIUM_CLI: _drop, ...env } = process.env;
  const r = Bun.spawnSync(["git", ...a], { cwd, env });
  return { code: r.exitCode, out: r.stdout.toString() + r.stderr.toString() };
};
const commit = (cwd: string, run = bare) => run(cwd, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-m", "x");

// covers: chain/FRD-03/EX-23
test("EX-23: a commit of a failing document made from a subfolder is blocked", () => {
  const root = repo();
  const viaEnv = Bun.spawnSync(["git", "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-m", "x"], { cwd: join(root, "sub"), env: { ...process.env, SCRIPTORIUM_CLI: "bun " + join(S, "cli.ts") } });
  expect(viaEnv.exitCode).not.toBe(0);
  expect(viaEnv.stderr.toString() + viaEnv.stdout.toString()).toContain("commit blocked");
  const viaLocal = commit(join(root, "sub")); // no env: the path install wrote
  expect(viaLocal.code).not.toBe(0);
  expect(viaLocal.out).toContain("commit blocked");
});

// covers: chain/FRD-03/EX-25
test("EX-25: the hook runs the tool install wrote or SCRIPTORIUM_CLI, never a package by name, else says run scriptorium install", () => {
  const root = repo();
  const local = readFileSync(join(root, ".scriptorium", "local"), "utf8");
  expect(local).toContain(join(S, "cli.ts"));
  expect(readFileSync(join(root, ".scriptorium", ".gitignore"), "utf8")).toContain("local");
  const hook = readFileSync(join(root, ".scriptorium", "pre-commit"), "utf8");
  expect(hook).toContain("SCRIPTORIUM_CLI");
  expect(hook).toContain("run scriptorium install");
  expect(hook).not.toMatch(/bunx|npx|bun x /);
  rmSync(join(root, ".scriptorium", "local"));
  const none = commit(root);
  expect(none.code).not.toBe(0);
  expect(none.out).toContain("run scriptorium install");
  expect(none.out).not.toContain("commit blocked"); // it failed for the missing tool, not a document
});

// covers: chain/FRD-08/EX-4
// covers: chain/FRD-08/EX-7
test("the adopt skill keeps existing ADRs and sets legacyAdrsThrough to the highest existing ADR number", () => {
  const skill = readFileSync(join(import.meta.dir, "..", "skills", "adopt", "SKILL.md"), "utf8");
  const step = skill.split("\n").find((l) => l.includes("legacyAdrsThrough")) as string;
  expect(step).toBeDefined();
  expect(step).toContain(".scriptorium/config.json");
  expect(step).toMatch(/highest existing ADR number/);
  expect(step).toMatch(/do not rename or rewrite an accepted ADR/i);
  expect(step).toContain("NNNN-name.md"); // an old file name is read as it is
  expect(step).toMatch(/new ADRs are written as `ADR-NNNN-name\.md` from the template/i);
  expect(step).toMatch(/at or below it/); // ADRs at or below the number are exempt, the others are not
});

const reworkSkill = () => readFileSync(join(import.meta.dir, "..", "skills", "rework", "SKILL.md"), "utf8");

// covers: metrics/FRD-03/EX-1
test("rework skill, EX-1: it plans the cause with the most open findings, read from the report and the history", () => {
  const s = reworkSkill();
  expect(s).toMatch(/most open findings/i);
  expect(s).toContain("scriptorium rework");
  expect(s).toContain("rework history");
});

// covers: metrics/FRD-03/EX-2
test("rework skill, EX-2: on a tie the earliest step of the chain wins, FRD before spec", () => {
  const s = reworkSkill();
  expect(s).toMatch(/tie/i);
  expect(s).toMatch(/earliest step/i);
  expect(s).toMatch(/FRD[^\n]*before[^\n]*spec/i);
});

// covers: metrics/FRD-03/EX-3
test("rework skill, EX-3: with no open finding it says there is nothing to plan and writes no request", () => {
  const s = reworkSkill();
  expect(s).toMatch(/nothing to plan/i);
  expect(s).toMatch(/no open finding[^\n]*(write nothing|writes? no request|no request)|(write nothing|writes? no request)[^\n]*no open finding/i);
});

// covers: metrics/FRD-03/EX-4
test("rework skill, EX-4: it writes docs/requests/REQ-n with its four parts", () => {
  const s = reworkSkill();
  expect(s).toContain("docs/requests/REQ-n");
  for (const part of ["Evidence", "Step", "Prevention and replay", "How we will see it worked"]) expect(s).toContain(part);
});

// covers: metrics/FRD-03/EX-5
test("rework skill, EX-5: a prevention that did not hold makes the request about why it did not hold", () => {
  const s = reworkSkill();
  expect(s).toMatch(/CHECK-n|CHECK-\d/);
  expect(s).toMatch(/why[^\n]*(did not hold|failed|fails)/i);
  expect(s).toMatch(/finding[^\n]*(dated )?after/i);
});

// covers: metrics/FRD-03/EX-6
test("rework skill, EX-6: it never edits the checks, the templates, the queue or the cause list", () => {
  const s = reworkSkill();
  const line = s.split("\n").find((l) => /never edit/i.test(l)) as string;
  expect(line).toBeDefined();
  for (const what of ["checks", "templates", "queue", "cause list"]) expect(line.toLowerCase()).toContain(what);
});

// covers: chain/FRD-09/EX-6
test("the adopt skill says where a verbatim export of another tool goes", () => {
  const skill = readFileSync(join(import.meta.dir, "..", "skills", "adopt", "SKILL.md"), "utf8");
  const para = skill.split("\n").find((l) => l.includes("archive/<tool>/")) as string;
  expect(para).toBeDefined();
  expect(para).toMatch(/verbatim/i);
  expect(para).toMatch(/repo(sitory)? root/i);
  expect(para).toMatch(/outside `?docs\/`?/i);
  expect(para).toMatch(/Source:/);
  expect(para).toMatch(/not linted/i);
  expect(para).toMatch(/not read by agents by default/i);
});

// The rules of the diagrams page, each with the section it belongs in and the words that state it.
const TYPES = ["flowchart", "sequenceDiagram", "stateDiagram-v2", "erDiagram", "classDiagram"];
const sectionOf = (text: string, heading: string) => (text.split(/^## /m).find((s) => s.startsWith(heading)) ?? "").split("\n").slice(1).join("\n");
const PAGE_RULES: [string, string, RegExp][] = [
  ["a diagram is optional in PRODUCT and PRD", "Where a diagram is required", /PRODUCT and PRD[^\n]*optional|optional[^\n]*PRODUCT and PRD/i],
  ["the limit of 15 nodes", "Keep it small", /15 nodes or fewer|at most 15|no more than 15/i],
  ["quote a label with punctuation", "Keep it renderable", /quote a label[^\n]*(punctuation|\( \))/i],
  ["no HTML in a label, not even <br>", "Keep it renderable", /no html[^\n]*<br>/i],
  ["never a lowercase end node", "Keep it renderable", /never name a node end in lowercase/i],
  ["no styling", "Keep it renderable", /no styling/i],
  ["never install a renderer or download a browser", "Keep it renderable", /never install a renderer[^\n]*download a browser/i],
  ["cite FR ids", "Cite the rows", /\bFR id/],
  ["cite EX ids", "Cite the rows", /\bEX id/],
  ["cite ST ids", "Cite the rows", /\bST id/],
  ...TYPES.map((type): [string, string, RegExp] => ["the type " + type + " is in the question-to-type table", "Which diagram answers which question", new RegExp("^\\|[^\\n]*\\|\\s*" + type + "\\s*\\|\\s*$", "m")]),
];
const pageProblems = (text: string) => PAGE_RULES.filter(([, heading, re]) => !re.test(sectionOf(text, heading))).map(([name]) => name);

// covers: chain/FRD-11/FR-CHAIN-11-5
test("the diagram practices page exists with every rule in its place, and the five skills link it", () => {
  const root = join(import.meta.dir, "..", "skills");
  const page = join(root, "scriptorium", "diagrams.md");
  expect(existsSync(page)).toBe(true);
  const text = readFileSync(page, "utf8");
  expect(pageProblems(text)).toEqual([]);
  expect(text).toContain("PRODUCT");
  expect(text).toContain("PRD");
  for (const type of TYPES) expect([type, text.includes(type)]).toEqual([type, true]);
  // the skills of PRODUCT (the scriptorium skill), PRD, FRD (its writing rules), UX and TP
  for (const file of ["scriptorium/SKILL.md", "prd/SKILL.md", "frd/writing-rules.md", "ux/SKILL.md", "tp/SKILL.md"]) {
    expect([file, readFileSync(join(root, file), "utf8").includes("diagrams.md")]).toEqual([file, true]);
  }
});

// covers: chain/FRD-11/FR-CHAIN-11-5
test("each rule of the diagrams page is pinned: removing it from a copy of the page is caught", () => {
  const text = readFileSync(join(import.meta.dir, "..", "skills", "scriptorium", "diagrams.md"), "utf8");
  for (const [name, heading, re] of PAGE_RULES) {
    const lines = text.split("\n");
    const from = lines.findIndex((l) => l.startsWith("## " + heading));
    const at = lines.findIndex((l, i) => i > from && re.test(l) && !lines.slice(from + 1, i).some((x) => x.startsWith("## "))); // the line inside its own section
    expect([name, at >= 0]).toEqual([name, true]); // the rule sits on one line
    const copy = lines.filter((_, i) => i !== at).join("\n");
    expect([name, pageProblems(copy).includes(name)]).toEqual([name, true]);
  }
  // a type that is only in the prose, not in the table, is caught
  const proseOnly = text.replace(/^\|[^\n]*\|\s*classDiagram\s*\|\s*$/m, "");
  expect(pageProblems(proseOnly)).toEqual(["the type classDiagram is in the question-to-type table"]);
});
