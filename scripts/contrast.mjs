#!/usr/bin/env node
/**
 * Contrast report for every theme template: how well text, labels, cards and
 * borders stand apart in each one, using the foundation theme engine.
 *
 *   node scripts/contrast.mjs          table of every template
 *   node scripts/contrast.mjs --check  exit 1 if any template misses a target
 *
 * Targets (WCAG ratios, checked on cards — the surface most text sits on):
 *   text 7 · muted 4.5 · subtle (labels) 3.5 · border vs card 1.5 · card vs page 1.15
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
  writeFileSync(join(dir, "brand.config.ts"), `export const BRAND = { name: "Tinnitus", storagePrefix: "x", defaultTheme: { accent: "#A8FF3E", highlight: "#FF3D6E", background: "#141416" } };\n`);
  writeFileSync(join(dir, "run.ts"), `
import { contrast, themeHex } from "./theme";
import { TEMPLATE_GROUPS } from "./themes";
const T = { text: 7, muted: 4.5, subtle: 3.5, border: 1.5, card: 1.15 };
const check = process.argv.includes("--check");
let fails = 0;
console.log("template".padEnd(14) + "text  muted subtle border card");
for (const g of TEMPLATE_GROUPS) for (const t of g.templates) {
  const c = themeHex(t.theme);
  const r = { text: contrast(c.text!, c.surface!), muted: contrast(c["text-muted"]!, c.surface!), subtle: contrast(c["text-subtle"]!, c.surface!),
    border: contrast(c.border!, c.surface!), card: contrast(c.surface!, c.bg!) };
  const bad = (Object.keys(T) as (keyof typeof T)[]).filter((k) => r[k] < T[k]);
  fails += bad.length ? 1 : 0;
  console.log(t.name.padEnd(14) + [r.text, r.muted, r.subtle, r.border, r.card].map((x) => x.toFixed(2).padEnd(6)).join("") + (bad.length ? "  low: " + bad.join(", ") : ""));
}
if (check && fails) { console.error(fails + " template(s) below target"); process.exit(1); }
`);
  execFileSync("npx", ["-y", "tsx", join(dir, "run.ts"), ...process.argv.slice(2)], { stdio: "inherit" });
} catch (e) {
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
