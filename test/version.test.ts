import { expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncVersion } from "../scripts/sync-version";

test("the plugin manifest and package.json carry the same version", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const manifest = JSON.parse(readFileSync(".claude-plugin/plugin.json", "utf8"));
  expect(manifest.version).toBe(pkg.version);
});

test("syncVersion copies the package version into the manifest", () => {
  const out = JSON.parse(syncVersion('{"version":"1.2.3"}', '{"name":"x","version":"0.0.1"}'));
  expect(out).toEqual({ name: "x", version: "1.2.3" });
});

test("syncVersion refuses a package with no semver version", () => {
  expect(() => syncVersion('{"name":"x"}', '{"name":"x"}')).toThrow();
});

const workflow = () => readFileSync(join(import.meta.dir, "..", ".github", "workflows", "version.yml"), "utf8");
// The steps of the first job, each as its own text.
const steps = () =>
  workflow()
    .split(/\n      - /)
    .slice(1);

// covers: ops/REQ-16/RL-1
test("RL-1: version.yml runs when CI completes on main, and only when it succeeded", () => {
  const w = workflow();
  expect(w).toMatch(/^on:\s*\n\s+workflow_run:/m);
  expect(w).toMatch(/workflows:\s*\[\s*["']?CI["']?\s*\]/);
  expect(w).toMatch(/types:\s*\[\s*completed\s*\]/);
  expect(w).toMatch(/branches:\s*\[\s*main\s*\]/);
  expect(w).toMatch(/github\.event\.workflow_run\.conclusion\s*==\s*['"]success['"]/);
  expect(w).not.toMatch(/^\s+(push|pull_request|schedule):/m); // nothing else triggers it
});

// covers: ops/REQ-16/RL-1
test("RL-1: it versions, commits to main, tags and creates the release itself, with no pull request", () => {
  const w = workflow();
  expect(w).toMatch(/changeset version|changesets? version/);
  expect(w).toContain("git commit");
  expect(w).toMatch(/git push[^\n]*main|git push\s*$/m);
  expect(w).toContain("git tag");
  expect(w).toContain("gh release create");
  expect(w).toMatch(/contents:\s*write/);
  expect(w).not.toContain("changesets/action"); // that action opens the Version Packages pull request
  expect(w).not.toMatch(/gh pr create|create-pull-request|pull-requests:\s*write/);
});

// covers: ops/REQ-16/RL-2
test("RL-2: the version, commit, tag and release steps only run when changesets are pending", () => {
  const w = workflow();
  expect(w).toMatch(/\.changeset\/|changeset status/); // the workflow looks for pending changesets
  for (const key of ["changeset version", "git tag", "gh release create"]) {
    const step = steps().find((s) => s.includes(key));
    expect(step).toBeDefined();
    expect([key, /^\s*if:|\n\s+if:|exit 0|\[\s+-[nzs]/.test(step as string)]).toEqual([key, true]); // guarded by a condition
  }
});

// covers: ops/REQ-16/RL-3
test("RL-3: nothing publishes to npm", () => {
  const w = workflow();
  expect(w).not.toMatch(/npm publish|bun publish|changeset publish|pnpm publish|yarn publish/);
  expect(w).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN|registry-url/);
});

// covers: ops/REQ-16/RL-1
test("RL-1: runs of the workflow queue and never cancel one that is releasing", () => {
  const w = workflow();
  expect(w).toMatch(/^concurrency:/m);
  expect(w).not.toMatch(/cancel-in-progress:\s*true/);
});

// covers: ops/REQ-16/RL-1
test("RL-1: the run leaves a push alone when main has moved past the commit CI passed on", () => {
  const pending = steps().find((s) => /id:\s*pending/.test(s)) as string;
  expect(pending).toBeDefined();
  expect(pending).toMatch(/git rev-parse HEAD/);
  expect(pending).toMatch(/!=\s*"\$\{\{\s*github\.event\.workflow_run\.head_sha\s*\}\}"/);
  expect(pending).toMatch(/pending=false/);
});

// covers: ops/REQ-16/RL-1
test("RL-1: the release notes must not be empty: the step stops with exit 1", () => {
  const step = steps().find((s) => s.includes("notes.md")) as string;
  expect(step).toBeDefined();
  expect(step).toMatch(/\[\s+-s\s+notes\.md\s+\]\s*\|\|[^\n]*exit 1/);
  expect(step.indexOf("-s notes.md")).toBeLessThan(step.indexOf("git tag")); // before anything is tagged
  expect(step.indexOf("-s notes.md")).toBeLessThan(step.indexOf("gh release create"));
});

// covers: ops/REQ-16/RL-1
test("RL-1: nothing pushes by force, and the checkout carries no token of its own", () => {
  const w = workflow();
  for (const line of w.split("\n").filter((l) => l.includes("git push"))) expect([line, /\s-f\b|--force/.test(line)]).toEqual([line, false]);
  const checkout = steps().find((s) => s.includes("actions/checkout")) as string;
  expect(checkout).not.toMatch(/\btoken:/);
  expect(w).not.toMatch(/\bPAT\b|personal[- ]access/i);
  expect(w).not.toMatch(/secrets\.(?!GITHUB_TOKEN)/); // the workflow token is the only secret
});

// covers: ops/REQ-16/RL-1
test("RL-1: the checkout is the branch CI ran on", () => {
  const checkout = steps().find((s) => s.includes("actions/checkout")) as string;
  expect(checkout).toMatch(/ref:\s*\$\{\{\s*github\.event\.workflow_run\.head_branch\s*\}\}/);
});

// covers: ops/REQ-16/RL-2
test("RL-2: the version step and the commit step run only when changesets are pending", () => {
  for (const key of ["changeset version", "git commit"]) {
    const step = steps().find((s) => s.includes(key)) as string;
    expect(step).toBeDefined();
    expect([key, /\n\s+if:\s*steps\.pending\.outputs\.pending\s*==\s*'true'/.test(step)]).toEqual([key, true]);
  }
});

// covers: ops/REQ-16/RL-2
test("RL-2: the tag and release step also runs for a version in package.json that has no tag, even with no changeset pending", () => {
  const all = steps();
  const tagIndex = all.findIndex((s) => s.includes("git tag"));
  expect(tagIndex).toBeGreaterThan(-1);
  const tagStep = all[tagIndex] as string;
  // it still carries the pending condition, and one more way in: the version of package.json that no tag has yet
  const cond = tagStep.match(/\n\s+if:\s*(steps\.pending\.outputs\.pending\s*==\s*'true')\s*\|\|\s*steps\.(\w+)\.outputs\.\w+\s*==\s*'true'/);
  expect(cond).not.toBeNull();
  const id = cond?.[2] as string;
  const finder = all.slice(0, tagIndex).find((s) => new RegExp("id:\\s*" + id + "\\b").test(s)) as string;
  expect(finder).toBeDefined();
  expect(finder).toContain("package.json"); // it reads the version
  expect(finder).toMatch(/ls-remote|git tag -l|git tag --list/); // and looks for its tag
  expect(finder).not.toMatch(/\n\s+if:\s*steps\.pending/); // and does not depend on a pending changeset
});

// A step of the job is run in bash against stand-ins for git, bun and gh, in a folder of its own: what it writes to GITHUB_OUTPUT and what it calls are read back.
const stepOf = (id: string) => steps().find((s) => new RegExp("id:\\s*" + id + "\\b").test(s)) as string;
const runBlock = (step: string) => {
  const lines = step
    .slice(step.indexOf("run: |") + "run: |".length)
    .split("\n")
    .slice(1);
  const indent = (lines.find((l) => l.trim()) as string).match(/^\s*/)![0].length;
  return lines.map((l) => l.slice(indent)).join("\n");
};
function runStep(step: string, o: { head?: string; sha?: string; changesets?: string[]; tagExists?: boolean } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "scriptorium-step-"));
  mkdirSync(join(dir, ".changeset"));
  for (const f of o.changesets ?? []) writeFileSync(join(dir, ".changeset", f), "x\n");
  const out = join(dir, "output.txt");
  const calls = join(dir, "calls.txt");
  writeFileSync(out, "");
  writeFileSync(calls, "");
  const stubs = ['git() { echo "git $*" >> "' + calls.replace(/\\/g, "/") + '"; case "$1" in rev-parse) echo "' + (o.head ?? "abc") + '";; ls-remote) return ' + (o.tagExists ? 0 : 2) + ";; *) return 0;; esac; }", "bun() { echo 1.2.3; }", 'gh() { echo "gh $*" >> "' + calls.replace(/\\/g, "/") + '"; }'].join("\n");
  const script = runBlock(step)
    .replace(/\$\{\{\s*github\.event\.workflow_run\.head_sha\s*\}\}/g, o.sha ?? "abc")
    .replace(/\$\{\{[^}]*\}\}/g, "");
  const r = Bun.spawnSync(["bash", "-c", stubs + "\n" + script], { cwd: dir, env: { ...process.env, GITHUB_OUTPUT: out.replace(/\\/g, "/") } });
  const lines = (f: string) => readFileSync(f, "utf8").split("\n").filter(Boolean);
  return { code: r.exitCode, written: lines(out), calls: lines(calls), text: r.stdout.toString() + r.stderr.toString() };
}

// covers: ops/REQ-16/RL-1
test("RL-1: the pending step writes pending exactly once, and false when main has moved past the commit CI passed on", () => {
  const step = stepOf("pending");
  expect(runStep(step, { head: "new", sha: "old", changesets: ["a.md"] }).written).toEqual(["pending=false"]); // moved on, with a changeset
  expect(runStep(step, { head: "abc", sha: "abc", changesets: ["a.md"] }).written).toEqual(["pending=true"]);
  expect(runStep(step, { head: "abc", sha: "abc", changesets: ["README.md"] }).written).toEqual(["pending=false"]); // only the readme
  expect(runStep(step, { head: "abc", sha: "abc" }).written).toEqual(["pending=false"]);
});

// covers: ops/REQ-16/RL-1
test("RL-1: the untagged step writes untagged exactly once, and false when main has moved past the commit CI passed on", () => {
  const step = stepOf("untagged");
  expect(runStep(step, { head: "new", sha: "old", tagExists: false }).written).toEqual(["untagged=false"]); // a later push has its own run
  expect(runStep(step, { head: "abc", sha: "abc", tagExists: false }).written).toEqual(["untagged=true"]);
  expect(runStep(step, { head: "abc", sha: "abc", tagExists: true }).written).toEqual(["untagged=false"]);
});

// covers: ops/REQ-16/RL-2
test("RL-2: the untagged step and the tag step look for the same tag, v and the version of package.json", () => {
  const find = runStep(stepOf("untagged"), { head: "abc", sha: "abc", tagExists: true });
  const tag = runStep(steps().find((s) => s.includes("git tag")) as string, { tagExists: true });
  const refs = (calls: string[]) => calls.filter((c) => c.startsWith("git ls-remote")).map((c) => c.split(/\s+/).find((w) => w.startsWith("refs/tags/")));
  expect(refs(find.calls)).toEqual(["refs/tags/v1.2.3"]);
  expect(refs(tag.calls)).toEqual(["refs/tags/v1.2.3"]);
});

// covers: ops/REQ-16/RL-2
test("RL-2: the tag step skips a tag that already exists: it says so, exits 0 and tags and releases nothing", () => {
  const r = runStep(steps().find((s) => s.includes("git tag")) as string, { tagExists: true });
  expect(r.code).toBe(0);
  expect(r.text).toContain("v1.2.3 already released");
  expect(r.calls.some((c) => c.startsWith("git tag") || c.startsWith("git push") || c.startsWith("gh "))).toBe(false);
});

// covers: ops/REQ-16/RL-1
test("RL-1: the job runs only for a successful push run of CI", () => {
  const w = workflow();
  const cond = w.match(/^\s+if:\s*(github\.event\.workflow_run\.conclusion[^\n]*)$/m)?.[1] ?? "";
  expect(cond).toMatch(/github\.event\.workflow_run\.conclusion\s*==\s*'success'/);
  expect(cond).toMatch(/&&\s*github\.event\.workflow_run\.event\s*==\s*'push'/);
});
