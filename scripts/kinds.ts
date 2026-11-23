// The kind of a chain document, read from its path by one rule (FR-CHAIN-08-15). Status, the hooks, the docs lint, trace, the gate and
// the summary check all ask here, so no two of them disagree on a path.

export type Kind = "PRODUCT" | "DECISIONS" | "INVARIANTS" | "CHECKS" | "CROSS-CUTTING" | "REQUEST" | "ADR" | "TP" | "PRD" | "FRD" | "UX" | "SPEC";

// The folders of docs/ that are not slices: three hold other things than chain documents, the others hold one kind each.
export const RESERVED = ["requests", "tp", "adr", "retro", "decisions", "research"];

// An ADR file: ADR-NNN-name.md or NNN-name.md, three or more digits.
export const ADR_NAME = /^(ADR-)?\d{3,}-[a-z0-9-]+\.md$/;
// An FRD, UX, TP or spec file: its number has two or more digits.
const SLICE_NAME: Record<string, [Kind, RegExp]> = {
  frd: ["FRD", /^FRD-\d{2,}-[a-z0-9-]+\.md$/],
  ux: ["UX", /^UX-\d{2,}-[a-z0-9-]+\.md$/],
  tp: ["TP", /^TP-\d{2,}-[a-z0-9-]+\.md$/],
  specs: ["SPEC", /^SPEC-\d{2,}-[a-z0-9-]+\.md$/],
};

// rel is the path under docs/, with forward slashes ("adr/ADR-0021-x.md"). undefined: no chain document.
export function kindOf(rel: string): Kind | undefined {
  const p = rel.split("/");
  const base = p[p.length - 1]!;
  if (p.length === 1) return /^(PRODUCT|DECISIONS|INVARIANTS|CHECKS|CROSS-CUTTING)\.md$/.test(base) ? (base.slice(0, -3) as Kind) : undefined;
  if (["retro", "decisions", "research"].includes(p[0]!)) return undefined; // nothing under them is a chain document, whatever its name
  if (p[p.length - 2] === "adr") return ADR_NAME.test(base) ? "ADR" : undefined;
  if (p.length === 2 && p[0] === "requests") return /^REQ-\d+-[a-z0-9-]+\.md$/.test(base) ? "REQUEST" : undefined;
  if (rel === "tp/TP.md") return "TP";
  if (RESERVED.includes(p[0]!)) return undefined; // a slice folder is any folder that is not one of these
  if (p.length === 2) return base === "PRD.md" ? "PRD" : undefined;
  const slice = p.length === 3 ? SLICE_NAME[p[1]!] : undefined;
  return slice && slice[1].test(base) ? slice[0] : undefined;
}

// The number in an FRD, UX, TP or spec file name ("FRD-100-x.md" gives "100").
export const docNumber = (base: string): string | undefined => /^(?:FRD|UX|TP|SPEC)-(\d{2,})-/.exec(base)?.[1];
