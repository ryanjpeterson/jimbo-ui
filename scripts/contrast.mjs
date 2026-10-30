#!/usr/bin/env node
/**
 * Contrast and variety report for every look in every page tone (light, mid,
 * dark — as written or made by atTone), using the foundation theme engine.
 *
 *   node scripts/contrast.mjs          table of every template
 *   node scripts/contrast.mjs --check  exit 1 if any template misses a target
 *
 * Targets (WCAG ratios; text ones checked on cards, the surface most text sits on):
 *   text 7 · muted 4.5 · subtle (labels) 3.5 · border vs card 1.75 · card vs page 1.19
 *   accent and highlight vs page 3 · support vs card 4.5 · text on the accent 4.5
 *   apart: accent and highlight at least 15 apart (CIE ΔE), and no two of accent,
 *   highlight and support closer than 10 — a tonal theme (shades of one colour)
 *   passes; identical colours don't
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
import { PAGE_TONES, TEMPLATE_TARGETS as T, templateScores } from "./theme";
import { familyAt, FAMILY_SETS } from "./themes";
const check = process.argv.includes("--check");
let fails = 0, made = 0, unmade: string[] = [];
const cols = Object.keys(T) as (keyof typeof T)[];
console.log("look".padEnd(30) + cols.map((c) => c.slice(0, 6).padEnd(7)).join(""));
const seen = new Set<string>();
for (const s of FAMILY_SETS) for (const g of s.groups) {
  // City tabs repeat league teams; check each look once.
  const fresh = g.families.filter((f) => !seen.has(f.key));
  if (!fresh.length) continue;
  console.log("— " + s.label + (g.label !== s.label ? " · " + g.label : ""));
  for (const f of fresh) {
    seen.add(f.key);
    // Every tone: as written, or made from the look's own colours (a tone it can't make falls back to its nearest).
    for (const tone of PAGE_TONES) {
      const t = familyAt(f, tone);
      if (!t) { unmade.push(f.name + " (" + tone + ")"); continue; }
      if (!f.authored[tone]) made++;
      const r = templateScores(t.theme);
      const bad = cols.filter((k) => r[k] < T[k]);
      fails += bad.length ? 1 : 0;
      const label = (f.name.slice(0, 20) + " · " + tone + (f.authored[tone] ? "" : "*")).padEnd(30);
      console.log(label + cols.map((k) => (k === "apart" ? r[k].toFixed(0) : r[k].toFixed(2)).padEnd(7)).join("") + (bad.length ? " low: " + bad.join(", ") : ""));
    }
  }
}
console.log("\\n" + seen.size + " looks; " + made + " tones made from their own colours (*); shown at their nearest tone: " + (unmade.join(", ") || "none"));
if (check && fails) { console.error(fails + " look(s) below target"); process.exit(1); }
`);
  execFileSync("npx", ["-y", "tsx", join(dir, "run.ts"), ...process.argv.slice(2)], { stdio: "inherit" });
} catch (e) {
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
