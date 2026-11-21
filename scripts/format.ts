// The project's pinned format (FRD-03): .scriptorium/config.json beside docs/, format 1 when missing.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const NEWEST = 3;
export const CONFIG = ".scriptorium/config.json";

// The pin, or an Error naming the config file when it cannot be read or is not a positive whole number.
export function readFormat(root: string): number {
  const p = join(root, CONFIG);
  if (!existsSync(p)) return 1;
  let v: unknown;
  try {
    v = JSON.parse(readFileSync(p, "utf8")).format;
  } catch (e) {
    throw new Error(CONFIG + ": not valid JSON (" + (e as Error).message + ")");
  }
  if (v === undefined) return 1;
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1) throw new Error(CONFIG + ': "format" must be a positive whole number');
  return v;
}

// The problem with the pin, if any: a bad file or a format this Scriptorium does not know.
export function pinProblem(root: string): string | undefined {
  try {
    const n = readFormat(root);
    return n > NEWEST ? "this project uses format " + n + "; this Scriptorium knows up to " + NEWEST + ": update Scriptorium" : undefined;
  } catch (e) {
    return (e as Error).message;
  }
}

// A failure is tagged "[format N] text" with the format that introduced its rule; untagged is format 1.
// Failures of a rule newer than the pin become warnings, never failures.
export function gate(failures: string[], pin: number): { fails: string[]; warnings: string[] } {
  const fails: string[] = [];
  const warnings: string[] = [];
  for (const f of failures) {
    const m = f.match(/^\[format (\d+)\] /);
    const n = m ? Number(m[1]) : 1;
    if (n > pin) warnings.push("WARN (format " + n + "): " + f.slice(m![0].length));
    else fails.push(m ? f.slice(m[0].length) : f);
  }
  return { fails, warnings };
}
