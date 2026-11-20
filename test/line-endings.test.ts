import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const read = (f: string) => readFileSync(join(root, f), "utf8");

// One line of `git ls-files --eol`: "i/lf    w/crlf  attr/text=auto eol=lf\tpath".
export function crlfFiles(eol: string): string[] {
  return eol
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((l) => {
      const [info, path] = l.split("\t");
      return /\bi\/(crlf|mixed)\b/.test(info!) || /\beol=crlf\b/.test(info!) ? [path!] : [];
    });
}

// LF-1 of docs/ops/specs/SPEC-01-1-lf-line-endings.md
test("LF-1: .gitattributes stores and checks out every text file with LF", () => {
  expect(read(".gitattributes")).toMatch(/^\* text=auto eol=lf\s*$/m);
});

// LF-2 of docs/ops/specs/SPEC-01-1-lf-line-endings.md
test("LF-2: .editorconfig says LF, UTF-8, a final newline and trimmed spaces, but not in markdown", () => {
  const t = read(".editorconfig");
  for (const k of ["end_of_line = lf", "charset = utf-8", "insert_final_newline = true", "trim_trailing_whitespace = true"]) expect(t).toContain(k);
  expect(t).toMatch(/\[\*\.md\]\s*\ntrim_trailing_whitespace = false/);
});

// LF-3 of docs/ops/specs/SPEC-01-1-lf-line-endings.md
test("LF-3: no file in the index has CRLF line endings", () => {
  const r = Bun.spawnSync(["git", "ls-files", "--eol"], { cwd: root });
  expect(r.exitCode).toBe(0);
  expect(crlfFiles(r.stdout.toString())).toEqual([]);
  // the scan itself: it names a CRLF file and an eol=crlf attribute, and spares LF files
  expect(crlfFiles("i/lf    w/lf    attr/text eol=lf\ta.ts\ni/crlf  w/crlf  attr/\tb.ts\ni/mixed w/crlf attr/\tc.ts\ni/lf w/lf attr/eol=crlf\td.ts")).toEqual(["b.ts", "c.ts", "d.ts"]);
});
