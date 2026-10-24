#!/usr/bin/env node
/**
 * Turn a set of real-world colours (a team's, a flag's) into theme templates
 * that pass every readability check, using the foundation theme engine.
 *
 *   node scripts/template-from-colours.mjs input.json
 *
 * input.json is a list of entries, each printed as one `t(…)` line for
 * foundation/src/lib/themes.ts (with a note if it misses a target):
 *
 *   { "name": "Maple Leafs", "vibe": "Toronto · blue and white",
 *     "colours": ["#00205B", "#FFFFFF"],      most important first
 *     "page": "#003DA5",                      optional: the page colour (a flag's field)
 *     "light": true,                          optional: a white page (else dark)
 *     "road": true,                           optional: a road-grey page (baseball away)
 *     "kit": "home" | "away" | "retro" }      optional: shown as Home / Away / Retro
 *
 * The rule: only the entry's own colours, and lighter or darker versions of
 * them that still read as that colour, are used — never a new hue. So:
 *   page       the given page; or white / road grey; or (dark) the main
 *              colour — or, if it's too bright, the darkest — deepened just
 *              enough for body text to read on cards
 *   accent,    taken in order from the colours, preferring each colour as it
 *   highlight, is, then nudged lighter or darker (reds and oranges are never
 *   support    lightened into pink), then — on a dark page — whites tinted
 *              with the main colour (a blue-and-white team's pale blues)
 * A role no colour can fill is left to tonal inference (shades of the accent).
 */
import { mkdtempSync, copyFileSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/template-from-colours.mjs input.json");
  process.exit(1);
}
const entries = JSON.parse(readFileSync(resolve(input), "utf8"));

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "jimbo-from-colours-"));
try {
  copyFileSync(join(root, "foundation/src/lib/theme.ts"), join(dir, "theme.ts"));
  writeFileSync(join(dir, "brand.config.ts"), `export const BRAND = { name: "", storagePrefix: "x", defaultTheme: { accent: "#A8FF3E", background: "#141416" } };\n`);
  writeFileSync(join(dir, "entries.json"), JSON.stringify(entries));
  writeFileSync(join(dir, "run.ts"), `
import { readFileSync } from "node:fs";
import { contrast, deltaE, hexToRgb, luminance, rgbToHex, themeHex, type Theme } from "./theme";
type RGB = [number, number, number];
type Entry = { name: string; vibe: string; colours: string[]; page?: string; light?: boolean; road?: boolean; kit?: string };
const entries: Entry[] = JSON.parse(readFileSync(${JSON.stringify(join(dir, "entries.json"))}, "utf8"));

function hsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255) as RGB;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function fromHsl([h, s, l]: [number, number, number]): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
  return rgbToHex([f(0), f(8), f(4)]);
}
const mixHex = (a: string, b: string, t: number) => { const [x, y] = [hexToRgb(a), hexToRgb(b)]; return rgbToHex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * t) as RGB); };
const isWhite = (c: string) => luminance(c) > 0.8;
const isNeutral = (c: string) => hsl(c)[1] < 0.16 || isWhite(c) || luminance(c) < 0.012;
/** Reds, oranges and magentas: lightening them much turns them pink or peach. */
const warm = (c: string) => { const [h, s] = hsl(c); return s > 0.35 && (h < 28 || h > 320); };

/** Body text reads on cards (7:1) — the page is dark or light enough. */
const textOk = (bg: string) => { const c = themeHex({ accent: "#808080", background: bg }); return contrast(c.text!, c.surface!) >= 7.05; };
function pageFor(e: Entry): string {
  const vivid = e.colours.find((c) => !isNeutral(c)) ?? e.colours[0]!;
  let bg = e.page ?? (e.road ? "#DCDFE2" : e.light ? mixHex("#FCFCFB", vivid, 0.025) : "");
  if (!bg) {
    // Home: the main colour, deepened (a red team gets a deep red page). If the main
    // colour is too bright to deepen and keep (gold, silver), the darkest colour instead.
    // A red or orange main colour stays the accent at its true value instead, on the
    // team's dark secondary (black, navy) — a deep-red page leaves nothing readable on it but white.
    const first = e.colours[0]!;
    const [, s0] = hsl(first);
    if (!warm(first) && s0 >= 0.2 && luminance(first) < 0.3 && luminance(first) >= 0.004) bg = first;
    else {
      const dark = e.colours.filter((c) => luminance(c) < 0.09 && !warm(c)).sort((a, b) => luminance(a) - luminance(b));
      const chromatic = dark.find((c) => hsl(c)[1] >= 0.2 && luminance(c) >= 0.004);
      bg = chromatic ?? dark[0] ?? mixHex("#0C0C0E", vivid, 0.07);
    }
  }
  // Deepen (dark) or lighten (light) only as far as body text needs — and, for a
  // red or orange team on a dark page, until its red reads as the accent.
  let [h, s, l] = hsl(bg);
  const lightPage = luminance(bg) > 0.4;
  const first = e.colours[0]!;
  const redReads = (b: string) => lightPage || !warm(first) || e.page || contrast(first, b) >= 3.15;
  for (let i = 0; i < 80 && (!textOk(fromHsl([h, s, l])) || !redReads(fromHsl([h, s, l]))); i++) l = lightPage ? Math.min(0.99, l + 0.01) : Math.max(0.015, l - 0.01);
  return fromHsl([h, s, l]);
}

/** Candidate colours for the roles, cheapest (truest) first: [colour, cost]. */
function candidates(e: Entry, bg: string): [string, number][] {
  const light = luminance(bg) > 0.4;
  const main = e.colours.find((c) => !isNeutral(c)) ?? e.colours[0]!;
  const out: [string, number][] = [];
  e.colours.forEach((c, i) => {
    if (light && isWhite(c)) return;
    const order = i * 1.5;                        // the team's main colours come before its whites and trims
    out.push([c, 0 + order]);
    const [h, s, l] = hsl(c);
    const away = light ? -1 : 1;                  // lighter on a dark page, deeper on a light one
    const maxUp = warm(c) ? 0.1 : 0.3;             // never lighten a red into pink
    // On a light page a very deep colour goes lighter first (Leafs navy → mid blue), not toward black.
    const deep = light && luminance(c) < 0.05;
    for (const [d, cost] of [[0.05, 1], [0.1, 2], [0.18, 3], [0.26, 4], [0.34, 5]] as const) {
      if (away < 0 || d <= maxUp) out.push([fromHsl([h, s, Math.max(0.03, Math.min(0.96, l + away * d))]), cost + (deep ? 0.5 : 0) + order]);
      if (light && d <= maxUp) out.push([fromHsl([h, s, Math.min(0.96, l + d)]), cost + (deep ? 0 : 0.5) + order]);
    }
    // A white on a dark page also comes tinted with the main colour (a blue-and-white
    // team's pale blues) — or, for a red team, as light greys (never pink).
    if (!light && isWhite(c)) {
      if (!warm(main)) for (const [t, cost] of [[0.15, 2], [0.3, 3], [0.45, 4]] as const) out.push([mixHex(c, main, t), cost + order]);
      for (const [t, cost] of [[0.16, 3], [0.28, 4]] as const) out.push([mixHex(c, "#000000", t), cost + order]);
    }
  });
  // Nothing that looks like the page itself.
  return out.filter(([c]) => deltaE(c, bg) >= 22).sort((a, b) => a[1] - b[1]);
}

const readsAsAccent = (c: string, bg: string) =>
  contrast(c, bg) >= 3.1 && (luminance(c) <= 0.35 ? contrast("#FFFFFF", c) >= 4.6 : true);

function build(e: Entry): Theme {
  const background = pageFor(e);
  const pool = candidates(e, background).map(([c]) => c);
  const accent = pool.find((c) => readsAsAccent(c, background)) ?? e.colours[0]!;
  const theme: Theme = { accent, background };
  const hl = pool.find((c) => contrast(c, background) >= 3.3 && deltaE(c, accent) >= 15);
  if (hl) theme.highlight = hl;
  const sp = pool.find((c) => contrast(c, background) >= 5.5 && deltaE(c, accent) >= 11 && (!hl || deltaE(c, hl) >= 11));
  if (sp) theme.support = sp;
  if (!hl || !sp) theme.infer = "tonal";
  return theme;
}

function problems(theme: Theme): string[] {
  const c = themeHex(theme);
  const out: string[] = [];
  if (contrast(c.text!, c.surface!) < 7) out.push("text");
  if (contrast(c.accent!, c.bg!) < 3) out.push("accent");
  if (contrast(c.highlight!, c.bg!) < 3) out.push("highlight");
  if (contrast(c.support!, c.surface!) < 4.5) out.push("support");
  if (contrast(c["on-accent"]!, c.accent!) < 4.5) out.push("button");
  if (deltaE(c.accent!, c.highlight!) < 15 || Math.min(deltaE(c.accent!, c.support!), deltaE(c.highlight!, c.support!)) < 10) out.push("apart");
  return out;
}

const q = (v?: string) => (v ? JSON.stringify(v) : "null");
for (const e of entries) {
  const th = build(e);
  const bad = problems(th);
  const opts = [e.kit ? \`kit: "\${e.kit}"\` : "", th.infer === "tonal" ? 'infer: "tonal"' : ""].filter(Boolean);
  const args = [JSON.stringify(e.name), JSON.stringify(e.vibe), q(th.accent), q(th.highlight), q(th.background), q(th.support)];
  if (opts.length) args.push("{ " + opts.join(", ") + " }");
  else if (!th.support) args.pop();
  console.log("t(" + args.join(", ") + ")," + (bad.length ? " // LOW: " + bad.join(", ") : ""));
}
`);
  process.stdout.write(execFileSync("npx", ["-y", "tsx", join(dir, "run.ts")], { encoding: "utf8" }));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
