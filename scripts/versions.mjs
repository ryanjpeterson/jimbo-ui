#!/usr/bin/env node
/**
 * Check that every place that states jimbo.ui's version agrees: both plugin
 * manifests, the foundation's JIMBO_UI.version, the skill's "This is jimbo.ui X" line, and the newest
 * CHANGELOG.md entry — that releases.json is current with the changelog, and
 * that every release's number fits its update type (Semantic Versioning, as
 * the changelog's head explains). Exits 1 and lists what's wrong.
 *
 *   node scripts/versions.mjs          check
 *   node scripts/versions.mjs --next   the version Unreleased needs, from its Update line
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReleases, serialise, updateType } from "./releases.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// ── Numbering: Semantic Versioning, read for 0.x ────────────────────────────
// breaking → 0.MINOR (MAJOR from 1.0.0); feature → 0.x.PATCH (MINOR from 1.0.0); fix → PATCH.
const parts = (v) => v.split(".").map(Number);
const bumpOf = (prev, next) => {
  const [a, b] = [parts(prev), parts(next)];
  return b[0] > a[0] ? "major" : b[1] > a[1] ? "minor" : b[2] > a[2] ? "patch" : "none";
};
const RANK = { none: 0, patch: 1, minor: 2, major: 3 };
/** The smallest bump an update type needs, given the version it follows. */
const needs = (type, prev) => parts(prev)[0] === 0
  ? ({ breaking: "minor", feature: "patch", fix: "patch" })[type]
  : ({ breaking: "major", feature: "minor", fix: "patch" })[type];
const nextFor = (type, prev) => {
  const [x, y, z] = parts(prev), want = needs(type, prev);
  return want === "major" ? `${x + 1}.0.0` : want === "minor" ? `${x}.${y + 1}.0` : `${x}.${y}.${z + 1}`;
};
/** Released before the rule was checked: breaking, but numbered as patches. Released numbers never change. */
const KNOWN = new Set(["0.8.1", "0.8.2", "0.8.4"]);

const { releases } = buildReleases();
if (process.argv.includes("--next")) {
  const unreleased = /^## Unreleased\n([\s\S]*?)(?=^## \d)/m.exec(read("CHANGELOG.md"))?.[1] ?? "";
  const type = updateType(unreleased);
  const latest = releases[0].version;
  if (!unreleased.trim()) { console.log(`Nothing under Unreleased; latest is ${latest}.`); process.exit(0); }
  if (!type) { console.error("Unreleased has no **Update:** line (breaking, feature or fix)."); process.exit(1); }
  console.log(`${nextFor(type, latest)}  (${type}, after ${latest})`);
  process.exit(0);
}
const wrong = [];
[...releases].reverse().forEach((r, i, all) => {
  if (i === 0) return;
  const prev = all[i - 1].version;
  if (!r.type) { wrong.push(`${r.version}: no **Update:** line`); return; }
  if (r.type === "first") return;
  const got = bumpOf(prev, r.version), want = needs(r.type, prev);
  if (RANK[got] < RANK[want] && !KNOWN.has(r.version)) wrong.push(`${r.version}: ${r.type} needs a ${want} bump from ${prev} (${nextFor(r.type, prev)}), got a ${got}`);
});
if (wrong.length) {
  console.error("Release numbers that don't fit their update type:\n" + wrong.map((w) => `  ${w}`).join("\n"));
  process.exit(1);
}
const found = {
  "plugin.json": JSON.parse(read(".claude-plugin/plugin.json")).version,
  "marketplace.json": JSON.parse(read(".claude-plugin/marketplace.json")).plugins[0].version,
  "SKILL.md": /This is jimbo\.ui (\d+\.\d+\.\d+)/.exec(read("skills/jimbo-ui/SKILL.md"))?.[1],
  "foundation jimbo.ts": /version: "(\d+\.\d+\.\d+)"/.exec(read("foundation/src/lib/jimbo.ts"))?.[1],
  "CHANGELOG.md": /^## (\d+\.\d+\.\d+)/m.exec(read("CHANGELOG.md"))?.[1],
  "releases.json": JSON.parse(read("releases.json")).latest,
};
if (read("releases.json") !== serialise(buildReleases())) {
  console.error("releases.json is out of date with CHANGELOG.md: run node scripts/releases.mjs");
  process.exit(1);
}
const all = new Set(Object.values(found));
if (all.size === 1 && !all.has(undefined)) console.log(`All at ${[...all][0]}`);
else {
  for (const [file, v] of Object.entries(found)) console.error(`${file.padEnd(17)} ${v ?? "(missing)"}`);
  process.exit(1);
}
