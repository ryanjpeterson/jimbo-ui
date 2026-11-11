#!/usr/bin/env node
/**
 * Add shadcn/ui primitives to jimbo.ui's foundation (maintainers only — apps
 * never run this or `npx shadcn`; rule J2). Runs the shadcn CLI in showcase/
 * (its components.json writes into .jimbo/), then copies each new file into
 * foundation/src/components/ui/ with the mechanical jimbo edits:
 *   - the foundation header and `@/lib/cn` import
 *   - no `dark:` classes (jimbo's tokens already follow light, mid and dark)
 *   - no `shadow-xs` / `shadow-sm` (S8; overlays keep one `shadow-md`)
 * Then make the hand edits the guide lists (§14, "Adding a primitive"):
 * control heights, radius, flat surfaces. Existing files are never
 * overwritten unless --force.
 *
 *   node scripts/shadcn-add.mjs tabs toggle-group [--force]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SHADCN = "shadcn@4.23.0";
const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const showcase = join(repo, "showcase");
const args = process.argv.slice(2);
const force = args.includes("--force");
const names = args.filter((a) => !a.startsWith("--"));

const main = process.argv[1] === fileURLToPath(import.meta.url);
if (main && !names.length) { console.error("Usage: node scripts/shadcn-add.mjs <component…> [--force]"); process.exit(1); }
if (main && !process.env.JIMBO_SKIP_CLI) {
  execFileSync("npm", ["run", "assemble"], { cwd: showcase, stdio: "inherit" });
  execFileSync("npx", ["-y", SHADCN, "add", ...names, "-y", "-o"], { cwd: showcase, stdio: "inherit" });
}

export const HEADER = "// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).\n// shadcn/ui primitive, with jimbo.ui's edits (guide §14).\n";
export function jimboEdits(src) {
  return HEADER + src
    .replace(/from "cn"/g, 'from "@/lib/cn"')
    // Whole class tokens only, variant prefixes and all (`data-[state=active]:shadow-sm`).
    .replace(/[ \t]*[^\s"'`]*(?:\bdark:|shadow-(?:xs|sm)\b)[^\s"'`]*/g, "")
    .replace(/(["'`]) +/g, "$1");
}

if (main) for (const name of names) {
  const from = join(showcase, ".jimbo/components/ui", `${name}.tsx`);
  const to = join(repo, "foundation/src/components/ui", `${name}.tsx`);
  if (!existsSync(from)) { console.warn(`skip ${name}: the CLI wrote no ${name}.tsx`); continue; }
  if (existsSync(to) && !force) { console.warn(`skip ${name}: foundation already has it (--force to replace)`); continue; }
  writeFileSync(to, jimboEdits(readFileSync(from, "utf8")));
  console.log(`foundation/src/components/ui/${name}.tsx`);
}
