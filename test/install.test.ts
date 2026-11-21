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
  expect(JSON.parse(readFileSync(join(root, ".scriptorium", "config.json"), "utf8"))).toEqual({ format: 3 });
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
