import { dirname, join, sep } from "node:path";

// Paths in output use "/" on every system.
export const toPosix = (p: string): string => p.split(sep).join("/");

// A path a person typed in a document or a PR body: either slash reads as a slash, on every system.
export const typed = (p: string): string => p.replaceAll("\\", "/");

// A typed path, relative to the document it is written in.
export const fromDoc = (docPath: string, p: string): string => join(dirname(docPath), typed(p));
