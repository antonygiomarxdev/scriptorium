import { test, expect } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

// covers: chain/FRD-05/EX-5
test("the spec template has Reuses between Files and Tests first, with the three forms", () => {
  const t = read("templates/SPEC.md");
  const at = (h: string) => t.indexOf("\n## " + h);
  expect(at("Files")).toBeGreaterThan(-1);
  expect(at("Reuses")).toBeGreaterThan(at("Files"));
  expect(at("Tests first")).toBeGreaterThan(at("Reuses"));
  const section = t.slice(at("Reuses"), at("Tests first"));
  expect(section).toMatch(/^- `<[^>]+>` `<[^>]+>`/m); // a file and a name
  expect(section).toContain("Precedent:");
  expect(section).toContain("Nothing to reuse:");
});

// covers: chain/FRD-05/EX-5
test("the spec skill tells the writer to search for Reuses and names cause C-13", () => {
  const s = read("skills/spec/SKILL.md");
  expect(s).toContain("Reuses");
  expect(s).toContain("C-13");
});

// covers: chain/FRD-05/EX-9
test("the review skill names FR-CHAIN-05-5 and cause C-13 for code that repeats existing code", () => {
  const s = read("skills/review/SKILL.md");
  for (const id of ["FR-CHAIN-05-5", "C-13"]) expect(s).toContain(id);
});

// covers: chain/FRD-06/EX-7
test("the review skill names cause C-14 for a question put to the owner that research could answer", () => {
  expect(read("skills/review/SKILL.md")).toContain("C-14");
});

// covers: chain/FRD-06/EX-1
test("every template with an Open questions section shows the three answerer forms", () => {
  const withSection = readdirSync(join(ROOT, "templates")).filter((f) => /^## .*Open questions/m.test(read("templates/" + f)));
  expect(withSection.length).toBeGreaterThanOrEqual(5);
  for (const f of withSection) {
    const t = read("templates/" + f);
    const section = t.slice(t.search(/^## .*Open questions/m)).split(/\n## /)[0];
    expect([f, section.includes("(Owner:")]).toEqual([f, true]);
    expect([f, section.includes("(Research)")]).toEqual([f, true]);
    expect([f, section.includes("(Lead)")]).toEqual([f, true]);
  }
});

// covers: chain/FRD-06/EX-1
test("the shared skill has the Asking the owner rule", () => {
  const s = read("skills/scriptorium/SKILL.md");
  expect(s).toContain("Asking the owner");
  for (const form of ["(Owner:", "(Research)", "(Lead)"]) expect(s).toContain(form);
});
