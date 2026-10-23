#!/usr/bin/env node
/**
 * Turn a set of real-world colours (a team's, a flag's) into theme templates
 * that pass every readability check, using the foundation theme engine.
 *
 *   node scripts/template-from-colours.mjs input.json
 *
 * input.json is a list of { "name", "vibe", "colours": ["#RRGGBB", …] } with
 * the most important colour first. It prints one `t(…)` line per entry, ready
 * for foundation/src/lib/themes.ts, and a note for any that miss a target.
 *
 * How a theme is made from the colours:
 *   light or dark  light when white is one of the colours ("#FFFFFF") or the
 *               entry says "light": true; otherwise dark
 *   background  dark: the darkest colour, deepened (or a near-black tinted
 *               with the first colour); light: near-white tinted with it
 *   accent      the first vivid colour, kept if it already reads, else
 *               lightened (dark) or deepened (light) until it does
 *   highlight   the next vivid colour that's clearly different, made to read;
 *               else a tint (dark), or a deep shade or mid-tone (light), of it
 *   support     the next clearly different vivid colour, made to read on
 *               cards; else left to the engine to infer
 * Whites, greys and blacks are never the accent, highlight or support — except
 * for a black-and-silver brand with no other colour, which gets a monochrome
 * theme (white or black accent, silver highlight, steel-blue support).
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
import { contrast, hexToRgb, luminance, rgbToHex, themeHex, type Theme } from "./theme";
type RGB = [number, number, number];
const entries: { name: string; vibe: string; colours: string[]; light?: boolean }[] = JSON.parse(readFileSync(${JSON.stringify(join(dir, "entries.json"))}, "utf8"));

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
function deltaE(a: string, b: string): number {
  const lab = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }) as RGB;
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const [x, y, z] = [(r * 0.4124 + g * 0.3576 + bl * 0.1805) / 0.95047, r * 0.2126 + g * 0.7152 + bl * 0.0722, (r * 0.0193 + g * 0.1192 + bl * 0.9505) / 1.08883].map(f) as RGB;
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };
  const [p, q] = [lab(a), lab(b)];
  return Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!);
}
const mixHex = (a: string, b: string, t: number) => { const [x, y] = [hexToRgb(a), hexToRgb(b)]; return rgbToHex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * t) as RGB); };
const neutral = (hex: string) => { const [, s, l] = hsl(hex); return s < 0.16 || l > 0.93 || luminance(hex) < 0.012; };

const isLight = (bg: string) => luminance(bg) > 0.4;
/** Step lightness away from the page (lighter on dark, deeper on light), keeping hue and saturation, until the colour reaches target contrast on bg. */
function readable(hex: string, bg: string, target: number): string {
  let [h, s, l] = hsl(hex);
  const step = isLight(bg) ? -0.012 : 0.012;
  for (let i = 0; i < 70 && contrast(fromHsl([h, s, l]), bg) < target; i++) l = Math.max(0.03, Math.min(0.97, l + step));
  return fromHsl([h, s, l]);
}
/** An accent that reads on bg (3:1) and takes 4.5:1 button text: kept if it already does, else moved away from the page until it does. */
function accentFor(hex: string, bg: string): string {
  const ok = (c: string) => contrast(c, bg) >= 3.1 && (luminance(c) <= 0.35 ? contrast("#FFFFFF", c) >= 4.6 : true);
  if (ok(hex)) return hex;
  let [h, s, l] = hsl(hex);
  if (isLight(bg)) {
    for (let i = 0; i < 80 && !ok(fromHsl([h, s, l])); i++) l = Math.max(0.05, l - 0.01);
  } else {
    for (let i = 0; i < 80 && (luminance(fromHsl([h, s, l])) <= 0.37 || contrast(fromHsl([h, s, l]), bg) < 3.1); i++) l = Math.min(0.97, l + 0.01);
  }
  return fromHsl([h, s, l]);
}
function backgroundFor(colours: string[]): { bg: string; used: string | null } {
  const dark = colours.filter((c) => luminance(c) < 0.07).sort((a, b) => luminance(a) - luminance(b));
  const chromatic = dark.find((c) => hsl(c)[1] >= 0.2 && luminance(c) >= 0.004);
  if (chromatic) {
    let [h, s, l] = hsl(chromatic);
    s = Math.min(s, 0.75);
    for (let i = 0; i < 40 && luminance(fromHsl([h, s, l])) > 0.013; i++) l -= 0.01;
    return { bg: fromHsl([h, s, Math.max(l, 0.04)]), used: chromatic };
  }
  // Black (or nothing dark): a near-black with a breath of the first vivid colour.
  const first = colours.find((c) => !neutral(c)) ?? colours[0]!;
  return { bg: mixHex("#0C0C0E", first, 0.07), used: null };
}

function build(colours: string[], light: boolean): Theme {
  const vividAll = colours.filter((c) => !neutral(c));
  // A black-and-silver (or black-and-white) brand: a monochrome theme.
  if (!vividAll.length) {
    // Three greys can't be both clearly apart and readable, so the support is a cool steel blue.
    if (light) return { accent: "#111111", highlight: "#5F6368", background: "#FAFAFA", support: "#2F5D9A" };
    const silver = colours.filter((c) => luminance(c) > 0.2).sort((a, b) => luminance(b) - luminance(a))[0];
    return { accent: "#F2F2F2", highlight: silver ? readable(mixHex(silver, "#8A9096", 0.4), "#0C0C0E", 3.6) : "#9AA0A6", background: "#0C0C0E", support: "#7FB0E8" };
  }
  if (light) {
    const bg = mixHex("#FCFBF9", vividAll[0]!, 0.035);
    const accent = accentFor(vividAll[0]!, bg);
    const theme: Theme = { accent, background: bg };
    const rest = vividAll.slice(1);
    const hl = rest.map((c) => readable(c, bg, 3.6)).find((c) => deltaE(c, accent) >= 24);
    if (hl) theme.highlight = hl;
    else {
      // No second colour: a deep shade of the first, or (if it's already deep) a mid-tone of it.
      const shade = readable(mixHex(vividAll[0]!, "#000000", 0.5), bg, 3.6);
      const mid = readable(mixHex(vividAll[0]!, "#FFFFFF", 0.4), bg, 3.6);
      const pickHl = [shade, mid].find((c) => deltaE(c, accent) >= 24);
      if (pickHl) theme.highlight = pickHl;
    }
    const sp = rest.map((c) => readable(c, bg, 5.6)).find((c) => deltaE(c, accent) >= 24 && (!theme.highlight || deltaE(c, theme.highlight) >= 24));
    if (sp) theme.support = sp;
    return theme;
  }
  const { bg, used } = backgroundFor(colours);
  const vivid = colours.filter((c) => !neutral(c) && c !== used);
  if (!vivid.length && used) vivid.push(used);
  if (!vivid.length) vivid.push(colours.find((c) => !neutral(c)) ?? "#8FB2FF");
  const accent = accentFor(vivid[0]!, bg);
  const theme: Theme = { accent, background: bg };
  const rest = vivid.slice(1).concat(used && vivid[0] !== used ? [used] : []);
  const hl = rest.map((c) => readable(c, bg, 3.6)).find((c) => deltaE(c, accent) >= 24);
  if (hl) theme.highlight = hl;
  else {
    const tint = readable(mixHex(vivid[0]!, "#FFFFFF", 0.62), bg, 3.6);
    if (deltaE(tint, accent) >= 24) theme.highlight = tint;
  }
  const sp = rest.map((c) => readable(c, bg, 5.6)).find((c) => deltaE(c, accent) >= 24 && (!theme.highlight || deltaE(c, theme.highlight) >= 24));
  if (sp) theme.support = sp;
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
  if (Math.min(deltaE(c.accent!, c.highlight!), deltaE(c.accent!, c.support!), deltaE(c.highlight!, c.support!)) < 20) out.push("apart");
  return out;
}

const q = (v?: string) => (v ? JSON.stringify(v) : "null");
for (const e of entries) {
  const th = build(e.colours, e.light ?? e.colours.some((c) => c.toUpperCase() === "#FFFFFF"));
  const bad = problems(th);
  const args = [JSON.stringify(e.name), JSON.stringify(e.vibe), q(th.accent), q(th.highlight), q(th.background)].concat(th.support ? [q(th.support)] : []);
  console.log("t(" + args.join(", ") + ")," + (bad.length ? " // LOW: " + bad.join(", ") : ""));
}
`);
  process.stdout.write(execFileSync("npx", ["-y", "tsx", join(dir, "run.ts")], { encoding: "utf8" }));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
