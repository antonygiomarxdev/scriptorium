// Who may edit a file (FRD-04): exempt, named by an approved spec or an accepted short path, or refused.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative } from "node:path";
import { chainStatus, restsOn } from "./check.ts";
import { driftReport } from "./drift.ts";
import { kindOf } from "./kinds.ts";
import { fromDoc, toPosix, typed } from "./paths.ts";
import { frdIds, scanTags } from "./trace.ts";

// Same exemptions as the changeset rule in pre-commit.ts (not exported there): docs, changesets, tests.
const isTest = (p: string) => /(^|\/)(tests?|__tests__)\//.test(p) || /\.(test|spec)\./.test(p);
const exempt = (p: string) => p.startsWith("docs/") || p.startsWith(".changeset/") || isTest(p);

// First cell of each row under "## Files", backticks removed; a trailing slash names a folder.
function filesRows(text: string): string[] {
  const body = text.split(/^## /m).find((s) => /^Files\b/i.test(s)) ?? "";
  return body
    .split(/\r?\n/)
    .filter((l) => /^\s*\|/.test(l))
    .map((l) => typed(l.split("|")[1]!.trim().replace(/`/g, "")))
    .filter((c) => c && c !== "Path" && !/^-+$/.test(c));
}
// FRD rows the spec quotes that no test folder tags with covers; rows of a request or registry are skipped.
function untested(root: string, specPath: string, text: string): string[] {
  const on = restsOn(text);
  const frd = on ? fromDoc(specPath, on) : "";
  const num = /^FRD-\d+/.exec(basename(frd))?.[0];
  const slice = basename(dirname(dirname(frd))); // docs/<slice>/frd/FRD-NN-*.md
  if (!num || kindOf(slice + "/frd/" + basename(frd)) !== "FRD" || !existsSync(frd)) return []; // only a file the kind rule calls an FRD is read as one
  const defined = new Set(frdIds(readFileSync(frd, "utf8")));
  const dirs = ["test", "tests"].map((d) => join(root, d)).filter(existsSync);
  const tags = scanTags(...dirs);
  return frdIds(text)
    .filter((id) => defined.has(id) && !tags.some((t) => t.frd === num && t.id === id && (!t.slice || t.slice === slice)))
    .map((id) => num + "/" + id);
}
const names = (row: string, file: string) => row === file || (row.endsWith("/") && file.startsWith(row));

// undefined when the edit may go ahead, else the refusal text.
export function gateFile(root: string, file: string): string | undefined {
  const f = typed(isAbsolute(file) ? toPosix(relative(root, file)) : file);
  if (exempt(f)) return undefined;
  const { docs } = chainStatus(root);
  const drifted = new Set(
    driftReport(root)
      .filter((d) => d.cause !== "missing")
      .map((d) => toPosix(d.path)),
  );
  const notApproved: string[] = [];
  const noTests: string[] = [];
  for (const d of docs) {
    const text = readFileSync(d.path, "utf8");
    if (d.kind === "REQUEST") {
      if (d.approved && [...text.matchAll(/^Short path:\s*`?([^\s`]+)/gm)].some((m) => typed(m[1]!) === f)) return undefined;
    } else if (d.kind === "SPEC" && filesRows(text).some((r) => names(r, f))) {
      if (d.approved && !drifted.has(toPosix(d.path))) {
        const missing = untested(root, d.path, text);
        if (!missing.length) return undefined;
        noTests.push(...missing);
      } else notApproved.push(toPosix(relative(root, d.path)));
    }
  }
  if (noTests.length) return "[format 2] " + f + ": write the tests first: " + [...new Set(noTests)].join(", ");
  const why = notApproved.length ? "; " + notApproved.join(", ") + " lists it but is not approved (draft, superseded or changed since approval)" : "";
  return "[format 2] " + f + ": no approved spec names it in its Files table" + why + '. Write a spec for it (/scriptorium:spec) and get it approved, or for a small change an accepted request with a "Short path:" line.';
}
