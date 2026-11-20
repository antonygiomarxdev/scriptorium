---
name: migrate
description: Move a project to the next Scriptorium format - run the migrate dry run, make the mechanical rewrites, do the parts that need judgment (splitting a spec into small specs), and move the pin in .scriptorium/config.json only when the next format passes. Use when check output shows "WARN (format N)" lines, after a Scriptorium update, or when the owner asks to migrate.
argument-hint: [project root]
---

# Migrate to the next format (REQ-5, L-16)

A project pins the format of its rules in `.scriptorium/config.json` (no file means format 1). A rule from a newer format only warns until the project migrates, so an update never breaks it. Migrating is one-way and one format at a time.

1. **See what changes.** Show the owner the dry run; it writes nothing:
   ```bash
   bun "${CLAUDE_PLUGIN_ROOT}/scripts/cli.ts" migrate .
   ```
   (The same run through check.ts: `bun "${CLAUDE_PLUGIN_ROOT}/scripts/check.ts" migrate .`.) It lists every failure under the next format, the rewrites it would make, and what needs judgment.
2. **Ask before changing.** Migration rewrites documents in place, on a branch of their own. Ask the owner to go ahead.
3. **Mechanical part.**
   ```bash
   bun "${CLAUDE_PLUGIN_ROOT}/scripts/cli.ts" migrate . --apply
   ```
   It makes only the rewrites it listed. When the next format then passes, it moves the pin and stops.
4. **Judgment part**, for what it listed and could not rewrite. From format 1 to 2:
   - **A spec with several tasks or over the caps:** split it into small specs with `/scriptorium:spec`: one spec per task, rows quoted from the FRD with `check.ts excerpt`, at most 3 files, one done command. Mark the old spec `Status: Superseded by <first new spec> (YYYY-MM-DD)`, or delete it when nothing links to it. An approved spec that is split goes back to the owner for approval.
   - **An approved example with no test:** tag the test that covers it (`covers: <slice>/FRD-NN/<ID>`), or add a waiver with a reason to the FRD, which the owner approves.
   - **A document with a version line:** delete the line; git and release tags are the history.
   - **Code commits without a changeset:** nothing to fix in the past; from now on every code commit adds one.
5. **Run it again** with `--apply` until the pin moves. Then `check.ts status .` must pass with no `WARN (format` lines.
6. **Commit** the migration in its own pull request, and say which format it reaches.

Never edit the pin by hand to skip a failure: the pin says which rules the project keeps.
