#!/usr/bin/env node
/**
 * The registry, put together from the apps: which app uses which component,
 * what to promote, what nobody uses, who's behind, raw colours in app code,
 * and whether each app's jimbo-ui config section is in one piece and gated
 * right, and whether its index.html sets up the full-screen phone frame.
 *
 *   node scripts/inventory.mjs [--apps-dir DIR …] [--json]
 *
 * registry/apps.json only lists the apps (name, repo). Everything else comes
 * from each app's own jimbo-ui.json as pushed to GitHub (read with `gh`), or
 * from its checkout when GitHub can't be read. Checkouts are found as
 * <dir>/<name> in each --apps-dir (default ~/Development, plus
 * JIMBO_APPS_DIRS, colon-separated); the code checks (colours, config
 * section, phone frame) read them, and a checkout whose jimbo-ui.json says
 * another version is flagged as stale. --json prints the assembled
 * registry instead — apps with their config, and each catalogue component
 * with the apps that use it. Changes nothing.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = (p) => p.replace(/^~/, homedir());
const dirsArg = process.argv.flatMap((a, i, all) => (all[i - 1] === "--apps-dir" ? [home(a)] : []));
const appsDirs = [...(dirsArg.length ? dirsArg : [join(homedir(), "Development")]), ...(process.env.JIMBO_APPS_DIRS ?? "").split(":").filter(Boolean).map(home)];

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

/** The app's jimbo-ui.json from GitHub, when it isn't checked out here. */
function fromGitHub(repo) {
  try {
    return JSON.parse(execFileSync("gh", ["api", `repos/${repo}/contents/jimbo-ui.json`, "-H", "Accept: application/vnd.github.raw"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch { return null; }
}

// Each app's jimbo-ui.json (as pushed, else its checkout's) and its checkout, when it's on this machine.
const local = Object.fromEntries(apps.map((a) => {
  const dirs = appsDirs.map((d) => join(d, a.name)).filter((d) => existsSync(join(d, "jimbo-ui.json")));
  const pushed = fromGitHub(a.repo);
  // The checkout that matches what's pushed, else the first one found.
  const dir = dirs.find((d) => !pushed || read(join(d, "jimbo-ui.json")).version === pushed.version) ?? dirs[0] ?? null;
  const mine = dir ? read(join(dir, "jimbo-ui.json")) : null;
  const cfg = pushed ?? mine;
  const stale = pushed && mine && mine.version !== pushed.version ? mine.version : null;
  return [a.name, { dir, cfg, stale, from: pushed ? "GitHub" : mine ? "checkout" : "—", webRoot: cfg?.webRoot ?? "", auth: cfg?.auth ?? "?" }];
}));
const uses = (name) => local[name].cfg?.components?.uses;
const own = (name) => local[name].cfg?.components?.local ?? [];
const usedBy = (id) => apps.filter((a) => uses(a.name)?.includes(id) || own(a.name).some((l) => l.matches === id)).map((a) => a.name);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({
    latest,
    apps: apps.map((a) => ({ ...a, from: local[a.name].from, config: local[a.name].cfg })),
    components: components.map((c) => ({ ...c, usedBy: usedBy(c.id) })),
  }, null, 2));
  process.exit(0);
}

// ── 1. Component × app ─────────────────────────────────────────────────────
head("Components × apps  (● uses the kit's · ◐ has its own copy that matches · – not used · ? app lists no components)");
const rows = [["Component", "Tier", ...apps.map((a) => a.name)]];
for (const c of components) {
  rows.push([c.name, c.tier, ...apps.map((a) => {
    if (own(a.name).some((l) => l.matches === c.id)) return "◐";
    if (!uses(a.name)) return "?";
    return uses(a.name).includes(c.id) ? "●" : "–";
  })]);
}
table(rows);
console.log(`\nThe app's own (domain, stays in the app): ${apps.map((a) => `${a.name} ${uses(a.name) ? own(a.name).filter((l) => l.kind === "domain").length : "?"}`).join(", ")}`);
const unlisted = apps.filter((a) => !uses(a.name)).map((a) => a.name);
if (unlisted.length) console.log(`No components listed in jimbo-ui.json (run "Consolidate an app" there): ${unlisted.join(", ")}`);

// ── 2. Candidates more than one app has built ──────────────────────────────
head("Candidates built by more than one app (promote these)");
const candidates = components.filter((c) => c.tier === "candidate");
const promote = candidates.map((c) => [c, usedBy(c.id)]).filter(([, by]) => by.length > 1);
if (promote.length) for (const [c, by] of promote) console.log(`- ${c.name} (${c.id}): ${by.join(", ")}`);
else console.log("None.");
const solo = candidates.filter((c) => !promote.some(([p]) => p.id === c.id));
if (solo.length) console.log(`\nOne app or none so far: ${solo.map((c) => `${c.name} (${usedBy(c.id).join(", ") || "—"})`).join(", ")}`);
const loose = apps.flatMap((a) => own(a.name).filter((l) => l.kind === "candidate" && !components.some((c) => c.id === l.matches)).map((l) => `${a.name}: ${l.name}`));
if (loose.length) console.log(`\nCandidates not in the catalogue yet (add them to registry/components.json): ${loose.join("; ")}`);

// ── 3. Kit components no app uses ──────────────────────────────────────────
head("Kit components no app uses (not even as its own copy)");
const unused = components.filter((c) => (c.tier === "kit" || c.tier === "foundation") && usedBy(c.id).length === 0);
console.log(unused.length ? unused.map((c) => `- ${c.name}`).join("\n") : "None.");

// ── 4. Apps behind the latest release ──────────────────────────────────────
head(`Versions (latest ${latest})`);
table([["App", "jimbo-ui.json", "Read from", "State", "Checkout"], ...apps.map((a) => {
  const { cfg, from, dir, stale } = local[a.name];
  const v = cfg?.version ?? "—";
  const state = v === "—" ? "no jimbo-ui.json" : cmp(v, latest) < 0 ? "behind" : "current";
  return [a.name, v, from, state, !dir ? "none here" : stale ? `${dir} says ${stale} — pull it` : dir];
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
  if (!dir) { console.log(`${a.name}: not checked out (looked in ${appsDirs.join(", ")})`); continue; }
  const files = walk(join(dir, local[a.name].webRoot, "src")).filter((f) => !COLOUR_FILES.test(f));
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
  const { dir, webRoot, auth } = local[a.name];
  if (!dir) { results.push([a.name, auth, "?", "?", "not checked out"]); continue; }
  const files = walk(join(dir, webRoot, "src"));
  const text = files.map((f) => [f, readFileSync(f, "utf8")]);
  const routeLines = text.flatMap(([f, s]) => s.split("\n").filter((l) => /path=["']\/jimbo-ui/.test(l)).map((l) => [f, l]));
  const has = routeLines.length > 0;
  // Brand, theme or style guide anywhere but the section: their own routes, and links to them.
  const routes = new Set(), linkFiles = new Set();
  for (const [f, s] of text) {
    if (/config\/|JimboConfigPage|BrandPage|StyleGuidePage/.test(f)) continue;
    for (const m of s.matchAll(/path=["'](\/admin\/(?:brand|style|theme)[^"']*|\/(?:brand|theme|style-guide|appearance)[^"']*)["']/g)) routes.add(m[1]);
    if (/to=["'](\/admin\/(?:brand|style)|\/(?:brand|theme|style-guide))["']/.test(s)) linkFiles.add(relative(join(dir, webRoot, "src"), f));
  }
  const split = [...(routes.size ? [`routes ${[...routes].join(", ")}`] : []), ...(linkFiles.size ? [`linked from ${[...linkFiles].join(", ")}`] : [])];
  let gating = "—";
  if (has) {
    const gated = routeLines.some(([, l]) => /RequireAdmin|isAdmin|canConfigure=\{(?!true)/.test(l));
    if (auth === "admin") {
      // The server must check admin too: find the theme save route.
      const server = walk(dir).filter((f) => !f.includes(`${webRoot}/src`));
      const saves = server.flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => /(put|post|delete)\s*\(\s*["'`][^"'`]*\/admin\/theme|PUT[^\n]*\/admin\/theme/i.test(l)));
      const serverOk = saves.length > 0 && saves.every((l) => /requireAdmin|isAdmin|admin\(/i.test(l));
      gating = gated && serverOk ? "admin (UI and server)" : !gated ? "NOT GATED — needs admin" : "server save route not admin-checked";
    } else gating = gated ? "GATED — should be open (auth none)" : "open";
  }
  results.push([a.name, auth, has ? "yes" : "MISSING", split.length ? split.join("; ") : "no", gating]);
}
table(results);

// ── 7. The phone frame ─────────────────────────────────────────────────────
head("Phone frame (index.html: viewport-fit=cover, solid status bar; no raw insets in app code)");
const frame = [["App", "viewport-fit=cover", "Status bar", "Raw env(safe-area-…) in app code"]];
for (const a of apps) {
  const { dir, webRoot } = local[a.name];
  if (!dir) { frame.push([a.name, "?", "?", "not checked out"]); continue; }
  const htmlPath = join(dir, webRoot, "index.html");
  const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";
  const viewport = html.match(/<meta[^>]+name=["']viewport["'][^>]*>/i)?.[0] ?? "";
  const cover = /viewport-fit\s*=\s*cover/.test(viewport);
  const bar = html.match(/apple-mobile-web-app-status-bar-style["'][^>]*content=["']([^"']+)/i)?.[1] ?? "none";
  // Insets belong to globals.css (--safe-top and friends); app code uses the variables.
  const raw = walk(join(dir, webRoot, "src")).filter((f) => !/styles\/globals\.css$/.test(f) && /env\(safe-area-inset/.test(readFileSync(f, "utf8")));
  frame.push([a.name, !html ? "no index.html" : cover ? "yes" : "MISSING", bar === "default" ? bar : `${bar} (want default)`, raw.length ? raw.map((f) => relative(join(dir, webRoot), f)).join(", ") : "none"]);
}
table(frame);

// ── 8. jimbo.ui is binding (rules J2, J3, J5) ──────────────────────────────
head("Binding (J2: components from jimbo.ui only; J5: pending local versions tracked)");
const SHIPPED = new Set(readdirSync(join(root, "foundation/src/components/ui")));
const OTHER_UI = /^(@mui\/|@chakra-ui\/|@mantine\/|@headlessui\/|daisyui$|bootstrap$|react-bootstrap$|antd$|@nextui-org\/|@heroui\/|@radix-ui\/)/;
const binding = [["App", "shadcn components.json", "Other UI libraries", "ui/ not shipped or edited", "Radix outside ui/", "Pending (J5)"]];
const prState = (url) => {
  const m = /github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/.exec(url ?? "");
  if (!m) return "no PR link";
  try {
    const pr = JSON.parse(execFileSync("gh", ["pr", "view", m[2], "--repo", m[1], "--json", "state,mergedAt"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    return pr.state === "MERGED" ? "merged — remove once released" : pr.state.toLowerCase();
  } catch { return "unreadable"; }
};
for (const a of apps) {
  const { dir, webRoot, cfg } = local[a.name];
  if (!dir) { binding.push([a.name, "?", "?", "?", "?", "not checked out"]); continue; }
  const web = join(dir, webRoot);
  const pkg = existsSync(join(web, "package.json")) ? JSON.parse(readFileSync(join(web, "package.json"), "utf8")) : {};
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  const others = deps.filter((d) => OTHER_UI.test(d));
  const uiDir = join(web, "src/components/ui");
  const mine = existsSync(uiDir) ? readdirSync(uiDir).filter((f) => f.endsWith(".tsx")) : [];
  const kitFiles = new Set(["kit.tsx", "forms.tsx", "overlays.tsx", "feedback.tsx", "data.tsx"]);
  const off = mine.filter((f) => !kitFiles.has(f) && (!SHIPPED.has(f) || readFileSync(join(uiDir, f), "utf8") !== readFileSync(join(root, "foundation/src/components/ui", f), "utf8")));
  const radix = walk(join(web, "src")).filter((f) => !f.startsWith(uiDir) && /from ["'](?:@radix-ui\/|radix-ui["'])/.test(readFileSync(f, "utf8")));
  const pending = cfg?.components?.pending ?? [];
  const pendDir = join(web, "src/components/jimbo-pending");
  const untracked = existsSync(pendDir) ? readdirSync(pendDir).filter((f) => !pending.some((p) => (p.path ?? "").endsWith(f))) : [];
  const pend = [...pending.map((p) => `${p.name}: ${prState(p.pr)}`), ...untracked.map((f) => `${f}: NOT IN jimbo-ui.json`)];
  binding.push([a.name, existsSync(join(web, "components.json")) || existsSync(join(dir, "components.json")) ? "YES — remove" : "no",
    others.join(", ") || "none", off.join(", ") || "none", radix.map((f) => relative(web, f)).join(", ") || "none", pend.join("; ") || "none"]);
}
table(binding);
