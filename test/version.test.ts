import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
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
