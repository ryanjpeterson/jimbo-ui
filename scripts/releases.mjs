#!/usr/bin/env node
/**
 * Write releases.json from CHANGELOG.md: every numbered release, newest
 * first, with its summary, its update type (breaking, feature, fix — from
 * its "**Update:**" line), its items by kind (changed, added, removed, fixed,
 * available), the components each item names (matched against
 * registry/components.json), and its "Apps must" steps. Apps' jimbo-ui config
 * section reads it from GitHub to say a newer release is out and what it
 * changes for that app. "Unreleased" is left out.
 *
 *   node scripts/releases.mjs           write releases.json
 *   node scripts/releases.mjs --check   exit 1 if releases.json is out of date
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/** Files that ship in the foundation: an item that touches only these comes with the update. */
const FOUNDATION_FILES = /\b(globals\.css|theme\.ts|themes\.ts|jimbo\.ts|viewport\.ts|gestures\.ts|cn\.ts|tailwind\.config|foundation\/)/;

const KINDS = { changed: "changed", added: "added", removed: "removed", fixed: "fixed", available: "available" };

/** "`List layout=\"tiles\"`" → "list"; "`<Badge dot>`" → "badge"; "`.card`" → ".card". */
const lead = (s) => (/^<?\/?(\.?[A-Za-z][\w-]*(?:-\*)?)/.exec(s.trim())?.[1] ?? "").toLowerCase();

function componentIndex() {
  const index = new Map();
  // Shared components only: an app's own (domain, candidate) never goes in releases.json.
  for (const c of JSON.parse(read("registry/components.json")).components.filter((c) => ["foundation", "kit", "pattern"].includes(c.tier))) {
    for (const n of [c.id, ...c.name.split(" / ")]) index.set(n.trim().toLowerCase(), c);
  }
  return index;
}

/** Bullets ("- " plus indented continuation lines) or, failing that, the section's prose as one item. */
function bullets(lines) {
  const out = [];
  for (const line of lines) {
    if (line.startsWith("- ")) out.push(line.slice(2).trim());
    else if (line.trim() && out.length) out[out.length - 1] += " " + line.trim();
    else if (line.trim()) out.push(line.trim());
  }
  return out.map((t) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
}

/** "**Update:** breaking — …" → "breaking". */
export const updateType = (text) => /^\*\*Update:\*\*\s*(breaking|feature|fix|first)/im.exec(text)?.[1]?.toLowerCase() ?? null;

export function buildReleases() {
  const index = componentIndex();
  const tiers = new Map([...index.values()].map((c) => [c.id, c.tier]));
  const affects = (text) => {
    const ids = new Set();
    for (const [, code] of text.matchAll(/`([^`]+)`/g)) {
      const c = index.get(lead(code));
      if (c) ids.add(c.id);
    }
    return [...ids];
  };

  const releases = [];
  const blocks = read("CHANGELOG.md").split(/^## /m).slice(1);
  for (const block of blocks) {
    const [heading, ...rest] = block.split("\n");
    const m = /^(\d+\.\d+\.\d+)(?:\s+—\s+(\S+))?/.exec(heading);
    if (!m) continue; // Unreleased
    const body = rest.join("\n");
    const release = { version: m[1], date: m[2] ?? null, type: updateType(body.split(/^### /m)[0]), summary: "", items: [], appsMust: [] };
    const sections = body.split(/^### /m);
    const intro = sections.shift().split("\n").find((l) => l.trim() && !l.startsWith("-") && !l.startsWith("**Update:**"));
    release.summary = intro?.trim() ?? "";
    for (const section of sections) {
      const [title, ...body] = section.split("\n");
      const lines = bullets(body);
      if (/^apps must/i.test(title)) {
        release.appsMust = lines.filter((l) => !/^Nothing beyond copying the foundation files/i.test(l));
        continue;
      }
      const kind = KINDS[title.trim().split(/\s/)[0].toLowerCase()] ?? "changed";
      for (const text of lines) {
        const ids = affects(text);
        const onlyFoundation = ids.every((id) => tiers.get(id) === "foundation");
        const foundation = onlyFoundation && (ids.length > 0 || FOUNDATION_FILES.test(text));
        release.items.push({ kind, text, affects: ids, ...(foundation ? { foundation: true } : {}) });
      }
    }
    releases.push(release);
  }
  return {
    $comment: "Generated from CHANGELOG.md by scripts/releases.mjs — don't edit. Apps' jimbo-ui config section reads it to show what a newer release changes.",
    latest: releases[0]?.version ?? null,
    releases,
  };
}

export const RELEASES_FILE = join(root, "releases.json");
export const serialise = (data) => JSON.stringify(data, null, 2) + "\n";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const next = serialise(buildReleases());
  if (process.argv.includes("--check")) {
    const now = existsSync(RELEASES_FILE) ? readFileSync(RELEASES_FILE, "utf8") : "";
    if (now !== next) { console.error("releases.json is out of date: run node scripts/releases.mjs"); process.exit(1); }
    console.log("releases.json is up to date");
  } else {
    writeFileSync(RELEASES_FILE, next);
    const r = JSON.parse(next);
    console.log(`Wrote releases.json: ${r.releases.length} releases, latest ${r.latest}`);
  }
}
