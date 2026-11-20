#!/usr/bin/env bun
// L-12 layer 1, Stop: before the agent stops, the documents it changed and the chain status must pass.
// Does nothing outside a Scriptorium project (no docs/PRODUCT.md). Legacy documents that did not change are not checked.
// Exit 2 with the failures on stderr makes the agent continue. When the agent is already continuing because of this hook
// (stop_hook_active), it only warns and exits 0, so a failure the agent cannot fix never loops.
import { pinProblem } from "./format.ts";
import { isChainProject, runChanged } from "./hook-doc-check.ts";

let active = false;
try {
  active = !!JSON.parse(await Bun.stdin.text()).stop_hook_active;
} catch {
  /* no input: treat as a first stop */
}

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const pin = isChainProject(root) ? pinProblem(root) : undefined;
if (pin) {
  console.error("Scriptorium warning: " + pin);
  process.exit(0);
}
const fails = runChanged(root);
if (fails.length) {
  console.error("Scriptorium: the documents you changed do not pass yet." + (active ? " Not blocking again; tell the owner what is still failing." : " Fix before stopping.") + "\n" + [...new Set(fails)].join("\n"));
  process.exit(active ? 0 : 2);
}
