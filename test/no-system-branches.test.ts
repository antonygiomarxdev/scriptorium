import { test, expect } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const S = join(import.meta.dir, "..", "scripts");
// A platform test, a cmd /c shell, or a hand-made backslash-to-slash replace.
export const BANNED = [/process\.platform/, /\bos\.platform\b/, /cmd\s*\/c|["']cmd["']\s*,\s*["']\/c["']/, /replaceAll\(\s*["']\\\\["']\s*,\s*["']\/["']/, /replace\(\s*\/\\\\\/g\s*,\s*["']\/["']/];

export function offenders(files: Record<string, string>): string[] {
  return Object.entries(files)
    .filter(([f]) => f !== "paths.ts")
    .flatMap(([f, t]) => t.split(/\r?\n/).flatMap((l, i) => (BANNED.some((re) => re.test(l)) ? [f + ":" + (i + 1)] : [])));
}

// covers: chain/FRD-02/EX-25
test("no script branches on the system or converts backslashes by hand outside paths.ts", () => {
  const files = Object.fromEntries(
    readdirSync(S)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => [f, readFileSync(join(S, f), "utf8")]),
  );
  expect(offenders(files)).toEqual([]);
});

// covers: chain/FRD-02/EX-25
test("the scan names file and line for each banned form, and spares paths.ts", () => {
  for (const bad of ['if (process.platform === "win32") x();', "os.platform()", '["cmd", "/c", c]', 'p.replaceAll("\\\\", "/")', 'p.replace(/\\\\/g, "/")']) expect(offenders({ "a.ts": "ok\n" + bad + "\n" })).toEqual(["a.ts:2"]);
  expect(offenders({ "paths.ts": 'p.replaceAll("\\\\", "/")' })).toEqual([]);
  expect(offenders({ "a.ts": 'p.split(sep).join("/")' })).toEqual([]);
});
