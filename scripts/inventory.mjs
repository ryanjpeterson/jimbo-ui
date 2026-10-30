#!/usr/bin/env node
/**
 * The registry at a glance: which app uses which component, what to promote,
 * what nobody uses, who's behind, raw colours in app code, and whether each
 * app's jimbo-ui config section is in one piece and gated right.
 *
 *   node scripts/inventory.mjs [--apps-dir ~/Development]
 *
 * Reads registry/apps.json and registry/components.json, then each app's
 * checkout at <apps-dir>/<name> (its jimbo-ui.json and its web code) when
 * it's there. Changes nothing.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const appsDir = (arg("--apps-dir") ?? join(homedir(), "Development")).replace(/^~/, homedir());

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const { apps } = read(join(root, "registry/apps.json"));
const { components } = read(join(root, "registry/components.json"));
const latest = read(join(root, ".claude-plugin/plugin.json")).version;

const cmp = (a, b) => {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};
const head = (s) => console.log(`\n## ${s}\n`);
const table = (rows) => {
  const w = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  const line = (r) => `| ${r.map((c, i) => String(c).padEnd(w[i])).join(" | ")} |`;
  console.log(line(rows[0]));
  console.log(`| ${w.map((n) => "-".repeat(n)).join(" | ")} |`);
  for (const r of rows.slice(1)) console.log(line(r));
};

// Each app's checkout and config, when it's on this machine.
const local = Object.fromEntries(apps.map((a) => {
  const dir = join(appsDir, a.name);
  const cfgPath = join(dir, "jimbo-ui.json");
  return [a.name, { dir: existsSync(dir) ? dir : null, cfg: existsSync(cfgPath) ? read(cfgPath) : null }];
}));

// ── 1. Component × app ─────────────────────────────────────────────────────
head("Components × apps  (● uses the kit's · ◐ has its own copy that matches · – not used)");
const shared = components.filter((c) => c.tier !== "domain");
const rows = [["Component", "Tier", ...apps.map((a) => a.name)]];
for (const c of shared) {
  rows.push([c.name, c.tier, ...apps.map((a) => {
    const own = (local[a.name].cfg?.components?.local ?? []).some((l) => l.matches === c.id);
    if (own) return "◐";
    return c.usedBy.includes(a.name) ? "●" : "–";
  })]);
}
table(rows);
const domain = components.filter((c) => c.tier === "domain");
console.log(`\nDomain-only (stay in their app): ${apps.map((a) => `${a.name} ${domain.filter((c) => c.usedBy.includes(a.name)).length}`).join(", ")}`);

// ── 2. Candidates more than one app has built ──────────────────────────────
head("Candidates built by more than one app (promote these)");
const multi = new Map();
for (const c of components.filter((c) => c.tier === "candidate" && c.usedBy.length > 1)) multi.set(c.id, new Set(c.usedBy));
for (const a of apps) for (const l of local[a.name].cfg?.components?.local ?? []) {
  const c = components.find((x) => x.id === l.matches);
  if (l.kind === "candidate" && c?.tier === "candidate") (multi.get(c.id) ?? multi.set(c.id, new Set()).get(c.id)).add(a.name);
}
const promote = [...multi].filter(([, s]) => s.size > 1);
if (promote.length) for (const [id, s] of promote) console.log(`- ${components.find((c) => c.id === id).name} (${id}): ${[...s].join(", ")}`);
else console.log("None.");
const solo = components.filter((c) => c.tier === "candidate" && !promote.some(([id]) => id === c.id));
if (solo.length) console.log(`\nOne app so far: ${solo.map((c) => c.name).join(", ")}`);

// ── 3. Kit components no app uses ──────────────────────────────────────────
head("Kit components no app uses (not even as its own copy)");
const matched = new Set(apps.flatMap((a) => (local[a.name].cfg?.components?.local ?? []).map((l) => l.matches)));
const unused = components.filter((c) => (c.tier === "kit" || c.tier === "foundation") && c.usedBy.length === 0 && !matched.has(c.id));
console.log(unused.length ? unused.map((c) => `- ${c.name}`).join("\n") : "None.");

// ── 4. Apps behind the latest release ──────────────────────────────────────
head(`Versions (latest ${latest})`);
table([["App", "Registry", "jimbo-ui.json", "State"], ...apps.map((a) => {
  const v = local[a.name].cfg?.version ?? "—";
  const state = !local[a.name].dir ? "not checked out" : v === "—" ? "no jimbo-ui.json" : cmp(v, latest) < 0 ? "behind" : "current";
  return [a.name, a.version, v, state];
})]);

// ── 5. Raw colours, and 6. the config section — these read the app's code ──
const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    if (f === "node_modules" || f === "dist" || f.startsWith(".")) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|css)$/.test(f)) out.push(p);
  }
  return out;
};
// Files whose colours are values by design: the engine, the templates, the picker, and the theme editor's swatches.
const COLOUR_FILES = /(lib\/theme\.ts|lib\/themes\.ts|lib\/brand\.config\.ts|ColorPicker\.tsx|styles\/(globals|tokens)\.css|tailwind\.config|BrandPage\.tsx|StyleGuidePage\.tsx|config\/(ThemePanel|StyleGuidePanel)\.tsx|jimbo-kit\.tsx|favicon)/;
const HEX = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b(?![0-9A-Fa-f])/g;
const PALETTE = /\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|shadow|decoration|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|white|black)(?:-\d{2,3})?(?:\/\d+)?\b/g;

head("Raw hex or palette colours in app code (should be tokens)");
console.log("Tone copies: the kit's fixed status colours written out by hand — use TONES.<tone>. Overlays: black or white at an");
console.log("opacity — fine over photos (as the kit's Banner does), a token anywhere else. Raw: everything else — use a token.\n");
const kind = (c) => /^(?:\w+-)+(?:yellow|purple|red)-\d/.test(c) ? "tone" : /-(?:black|white)\/\d+$/.test(c) ? "overlay" : "raw";
for (const a of apps) {
  const { dir } = local[a.name];
  if (!dir) { console.log(`${a.name}: not checked out at ${join(appsDir, a.name)}`); continue; }
  const files = walk(join(dir, a.webRoot, "src")).filter((f) => !COLOUR_FILES.test(f));
  const hits = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|(^|\s)\/\/.*$/gm, "$1");
    const found = [...(src.match(PALETTE) ?? []), ...(src.match(HEX) ?? [])];
    if (!found.length) continue;
    const n = { tone: 0, overlay: 0, raw: 0 };
    for (const c of found) n[kind(c)]++;
    const raw = [...new Set(found.filter((c) => kind(c) === "raw"))].slice(0, 4).join(" ");
    hits.push([relative(dir, f), n.tone, n.overlay, n.raw, raw]);
  }
  const sum = (i) => hits.reduce((n, h) => n + h[i], 0);
  console.log(`${a.name}: ${hits.length ? `${sum(1)} tone copies, ${sum(2)} overlays, ${sum(3)} raw, in ${hits.length} files` : "clean"}`);
  if (hits.length) table([["File", "Tone", "Overlay", "Raw", "Raw examples"], ...hits.sort((x, y) => y[3] + y[1] - x[3] - x[1])]);
  console.log();
}

// ── 6. The config section ──────────────────────────────────────────────────
head("jimbo-ui config section (one section at /jimbo-ui; gated by auth)");
const results = [["App", "Auth", "Section", "Split up", "Gating"]];
for (const a of apps) {
  const { dir } = local[a.name];
  if (!dir) { results.push([a.name, a.auth, "?", "?", "not checked out"]); continue; }
  const files = walk(join(dir, a.webRoot, "src"));
  const text = files.map((f) => [f, readFileSync(f, "utf8")]);
  const routeLines = text.flatMap(([f, s]) => s.split("\n").filter((l) => /path=["']\/jimbo-ui/.test(l)).map((l) => [f, l]));
  const has = routeLines.length > 0;
  // Brand, theme or style guide anywhere but the section: their own routes, and links to them.
  const routes = new Set(), linkFiles = new Set();
  for (const [f, s] of text) {
    if (/config\/|JimboConfigPage|BrandPage|StyleGuidePage/.test(f)) continue;
    for (const m of s.matchAll(/path=["'](\/admin\/(?:brand|style|theme)[^"']*|\/(?:brand|theme|style-guide|appearance)[^"']*)["']/g)) routes.add(m[1]);
    if (/to=["'](\/admin\/(?:brand|style)|\/(?:brand|theme|style-guide))["']/.test(s)) linkFiles.add(relative(join(dir, a.webRoot, "src"), f));
  }
  const split = [...(routes.size ? [`routes ${[...routes].join(", ")}`] : []), ...(linkFiles.size ? [`linked from ${[...linkFiles].join(", ")}`] : [])];
  let gating = "—";
  if (has) {
    const gated = routeLines.some(([, l]) => /RequireAdmin|isAdmin|canConfigure=\{(?!true)/.test(l));
    if (a.auth === "admin") {
      // The server must check admin too: find the theme save route.
      const server = walk(dir).filter((f) => !f.includes(`${a.webRoot}/src`));
      const saves = server.flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => /(put|post|delete)\s*\(\s*["'`][^"'`]*\/admin\/theme|PUT[^\n]*\/admin\/theme/i.test(l)));
      const serverOk = saves.length > 0 && saves.every((l) => /requireAdmin|isAdmin|admin\(/i.test(l));
      gating = gated && serverOk ? "admin (UI and server)" : !gated ? "NOT GATED — needs admin" : "server save route not admin-checked";
    } else gating = gated ? "GATED — should be open (auth none)" : "open";
  }
  results.push([a.name, a.auth, has ? "yes" : "MISSING", split.length ? split.join("; ") : "no", gating]);
}
table(results);
