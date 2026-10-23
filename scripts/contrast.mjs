#!/usr/bin/env node
/**
 * Contrast and variety report for every theme template, using the foundation
 * theme engine.
 *
 *   node scripts/contrast.mjs          table of every template
 *   node scripts/contrast.mjs --check  exit 1 if any template misses a target
 *
 * Targets (WCAG ratios; text ones checked on cards, the surface most text sits on):
 *   text 7 · muted 4.5 · subtle (labels) 3.5 · border vs card 1.75 · card vs page 1.19
 *   accent and highlight vs page 3 · support vs card 4.5 · text on the accent 4.5
 *   apart: accent, highlight and support at least 20 apart from each other (CIE ΔE),
 *   so a theme reads as more than one colour
 */
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "jimbo-contrast-"));
try {
  for (const f of ["theme.ts", "themes.ts"]) copyFileSync(join(root, "foundation/src/lib", f), join(dir, f));
  writeFileSync(join(dir, "brand.config.ts"), `export const BRAND = { name: "Default", storagePrefix: "x", defaultTheme: { accent: "#A8FF3E", highlight: "#FF3D6E", background: "#141416", support: "#2EC5FF" } };\n`);
  writeFileSync(join(dir, "run.ts"), `
import { contrast, hexToRgb, themeHex } from "./theme";
import { TEMPLATE_SETS } from "./themes";
const T = { text: 7, muted: 4.5, subtle: 3.5, border: 1.75, card: 1.19, accent: 3, highlight: 3, support: 4.5, button: 4.5, apart: 20 };
/** CIE76 ΔE between two hex colours (sRGB → Lab, D65). */
function deltaE(a: string, b: string): number {
  const lab = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }) as [number, number, number];
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const [x, y, z] = [(r * 0.4124 + g * 0.3576 + bl * 0.1805) / 0.95047, r * 0.2126 + g * 0.7152 + bl * 0.0722, (r * 0.0193 + g * 0.1192 + bl * 0.9505) / 1.08883].map(f) as [number, number, number];
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };
  const [p, q] = [lab(a), lab(b)];
  return Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!);
}
const check = process.argv.includes("--check");
let fails = 0;
const cols = ["text", "muted", "subtle", "border", "card", "accent", "highlight", "support", "button", "apart"] as const;
console.log("template".padEnd(19) + cols.map((c) => c.slice(0, 6).padEnd(7)).join(""));
for (const s of TEMPLATE_SETS) for (const g of s.groups) {
  console.log("— " + s.label + (g.label !== s.label ? " · " + g.label : ""));
  for (const t of g.templates) {
    const c = themeHex(t.theme);
    const r: Record<(typeof cols)[number], number> = {
      text: contrast(c.text!, c.surface!), muted: contrast(c["text-muted"]!, c.surface!), subtle: contrast(c["text-subtle"]!, c.surface!),
      border: contrast(c.border!, c.surface!), card: contrast(c.surface!, c.bg!),
      accent: contrast(c.accent!, c.bg!), highlight: contrast(c.highlight!, c.bg!), support: contrast(c.support!, c.surface!),
      button: contrast(c["on-accent"]!, c.accent!),
      apart: Math.min(deltaE(c.accent!, c.highlight!), deltaE(c.accent!, c.support!), deltaE(c.highlight!, c.support!)),
    };
    const bad = cols.filter((k) => r[k] < T[k]);
    fails += bad.length ? 1 : 0;
    console.log(t.name.padEnd(19) + cols.map((k) => (k === "apart" ? r[k].toFixed(0) : r[k].toFixed(2)).padEnd(7)).join("") + (bad.length ? " low: " + bad.join(", ") : ""));
  }
}
if (check && fails) { console.error(fails + " template(s) below target"); process.exit(1); }
`);
  execFileSync("npx", ["-y", "tsx", join(dir, "run.ts"), ...process.argv.slice(2)], { stdio: "inherit" });
} catch (e) {
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
