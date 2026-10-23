#!/usr/bin/env node
/**
 * Session start check: if this project has a jimbo-ui.json, compare its
 * version with the installed jimbo.ui plugin and say when there are new brand
 * guidelines to bring in. Prints nothing (and never fails the session) when
 * there's no jimbo-ui.json, the app is current, or anything goes wrong.
 *
 *   node hooks/check-version.mjs [project dir]   (default: $CLAUDE_PROJECT_DIR or the cwd)
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), "..");

/** jimbo-ui.json in the project dir or a parent, stopping at the repo root. */
function findAppFile(start) {
  for (let dir = start; ; dir = dirname(dir)) {
    const file = join(dir, "jimbo-ui.json");
    if (existsSync(file)) return file;
    if (existsSync(join(dir, ".git")) || dirname(dir) === dir) return null;
  }
}

/** Releases tagged before jimbo.ui moved to 0.x (it's a work in progress), and their 0.x numbers. */
const LEGACY = { "1.0.0": "0.1.0", "1.1.0": "0.2.0", "2.0.0": "0.3.0", "3.0.0": "0.4.0", "3.1.0": "0.5.0", "4.0.0": "0.6.0" };

const parse = (v) => (/^(\d+)\.(\d+)\.(\d+)$/.exec(String(v).trim()) ?? []).slice(1).map(Number);
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};

/** "## 0.5.0 — 2026-10-23" headings from the changelog, newest first, with each one's first line of prose. */
function releases(changelog) {
  const out = [];
  const lines = changelog.split("\n");
  lines.forEach((line, i) => {
    const m = /^## (\d+\.\d+\.\d+)/.exec(line);
    if (!m) return;
    const next = lines.slice(i + 1).find((l) => l.trim() && !l.startsWith("#"));
    const summary = next && !next.startsWith("-") ? next.trim() : "";
    out.push({ version: m[1], summary });
  });
  return out;
}

try {
  const appFile = findAppFile(process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
  if (!appFile) process.exit(0);
  const written = JSON.parse(readFileSync(appFile, "utf8")).version;
  const app = LEGACY[written] ?? written;
  const renamed = app !== written ? ` (its jimbo-ui.json says ${written}, the old number for ${app}; set it to ${app} when updating)` : "";
  const latest = JSON.parse(readFileSync(join(pluginRoot, ".claude-plugin/plugin.json"), "utf8")).version;
  if (!parse(app).length || !parse(latest).length) process.exit(0);

  const diff = compare(latest, app);
  if (diff === 0 && !renamed) process.exit(0);

  let message, context;
  if (diff === 0) {
    message = `This app is on jimbo.ui ${app}, the latest. Its jimbo-ui.json still says ${written}, the old number; set it to ${app}.`;
    context = `jimbo.ui: this app is on the latest release, ${app}${renamed}. Mention the renumbering once if relevant.`;
  } else if (diff > 0) {
    const changelog = join(pluginRoot, "CHANGELOG.md");
    const newer = existsSync(changelog)
      ? releases(readFileSync(changelog, "utf8")).filter((r) => compare(r.version, app) > 0)
      : [];
    const list = newer.map((r) => `- ${r.version}${r.summary ? `: ${r.summary}` : ""}`).join("\n");
    message = `jimbo.ui ${latest} is out; this app is on ${app}. Say "what would the latest jimbo-ui change here?" to preview, or "update to the latest jimbo-ui".`;
    context = [
      `jimbo.ui: this app is on ${app}${renamed}, and the installed jimbo-ui plugin is ${latest}, so there are newer brand guidelines to bring in.`,
      newer.length ? `Releases since then (details and "Apps must" steps in ${changelog}):\n${list}` : "",
      "Mention this to the user once, early, in a line, and offer the jimbo-ui skill's preview or update workflow. Don't update without being asked.",
    ].filter(Boolean).join("\n");
  } else {
    message = `This app is on jimbo.ui ${app}, newer than the installed plugin (${latest}). Refresh it: claude plugin marketplace update jimbo-ui, then claude plugin update jimbo-ui@jimbo-ui.`;
    context = `jimbo.ui: this app's jimbo-ui.json says ${app}, but the installed jimbo-ui plugin is only ${latest}. Its guidelines may be out of date for this app; suggest the user refreshes the plugin.`;
  }
  process.stdout.write(JSON.stringify({ systemMessage: message, hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }));
} catch {
  // Never get in the way of a session.
}
process.exit(0);
