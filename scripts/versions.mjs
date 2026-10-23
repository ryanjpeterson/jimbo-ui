#!/usr/bin/env node
/**
 * Check that every place that states jimbo.ui's version agrees: both plugin
 * manifests, the skill's "This is jimbo.ui X" line, and the newest
 * CHANGELOG.md entry. Exits 1 and lists them when they don't.
 *
 *   node scripts/versions.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const found = {
  "plugin.json": JSON.parse(read(".claude-plugin/plugin.json")).version,
  "marketplace.json": JSON.parse(read(".claude-plugin/marketplace.json")).plugins[0].version,
  "SKILL.md": /This is jimbo\.ui (\d+\.\d+\.\d+)/.exec(read("skills/jimbo-ui/SKILL.md"))?.[1],
  "CHANGELOG.md": /^## (\d+\.\d+\.\d+)/m.exec(read("CHANGELOG.md"))?.[1],
};
const all = new Set(Object.values(found));
if (all.size === 1 && !all.has(undefined)) console.log(`All at ${[...all][0]}`);
else {
  for (const [file, v] of Object.entries(found)) console.error(`${file.padEnd(17)} ${v ?? "(missing)"}`);
  process.exit(1);
}
