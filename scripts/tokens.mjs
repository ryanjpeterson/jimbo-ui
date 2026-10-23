#!/usr/bin/env node
/**
 * Print an app's src/styles/tokens.css for its brand colours, using the
 * foundation theme engine, so the CSS defaults always match what the engine
 * derives at runtime. Highlight and support are optional: pass "-" (or leave
 * support off) and the engine infers them.
 *
 *   node scripts/tokens.mjs '#A8FF3E' '#FF3D6E' '#141416' '#2EC5FF' > <app>/src/styles/tokens.css
 *                            accent    highlight  background support
 *   node scripts/tokens.mjs '#9DB2FF' - '#101418'      (two colours: the rest inferred)
 */
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const [accent, highlight, background, support] = process.argv.slice(2);
const hex = (c) => /^#[0-9a-f]{6}$/i.test(c ?? "");
const optional = (c) => c === undefined || c === "-" || hex(c);
if (![accent, background].every(hex) || !optional(highlight) || !optional(support)) {
  console.error("Usage: node scripts/tokens.mjs <accent> <highlight|-> <background> [support|-]   (each #RRGGBB; - = inferred)");
  process.exit(1);
}
const theme = { accent, background, ...(hex(highlight) ? { highlight } : {}), ...(hex(support) ? { support } : {}) };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "jimbo-tokens-"));
try {
  copyFileSync(join(root, "foundation/src/lib/theme.ts"), join(dir, "theme.ts"));
  writeFileSync(join(dir, "brand.config.ts"), `export const BRAND = { name: "", storagePrefix: "x", defaultTheme: ${JSON.stringify(theme)} };\n`);
  writeFileSync(join(dir, "run.ts"), `
import { deriveColors, luminance } from "./theme";
const t = ${JSON.stringify(theme)};
const lines = Object.entries(deriveColors(t)).map(([k, v]) => "  --c-" + k + ": " + v.map(Math.round).join(" ") + ";");
console.log([
  "/* This app's default theme tokens (\\"R G B\\" channels), so the page looks right",
  "   before any script runs. Owned by the app; generate from BRAND.defaultTheme",
  "   with jimbo-ui's scripts/tokens.mjs. src/lib/theme.ts overrides them at runtime. */",
  ":root {", ...lines, "  color-scheme: " + (luminance(t.background) > 0.4 ? "light" : "dark") + ";", "}",
].join("\\n"));
`);
  process.stdout.write(execFileSync("npx", ["-y", "tsx", join(dir, "run.ts")], { encoding: "utf8" }));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
