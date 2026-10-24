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
 *   … --headings=fraunces --body=inter                 (fonts: keys of FONTS in theme.ts)
 */
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const [accent, highlight, background, support] = args.filter((a) => !a.startsWith("--"));
const fonts = { ...(flag("headings") ? { headings: flag("headings") } : {}), ...(flag("body") ? { body: flag("body") } : {}) };

const hex = (c) => /^#[0-9a-f]{6}$/i.test(c ?? "");
const optional = (c) => c === undefined || c === "-" || hex(c);
if (![accent, background].every(hex) || !optional(highlight) || !optional(support)) {
  console.error("Usage: node scripts/tokens.mjs <accent> <highlight|-> <background> [support|-]   (each #RRGGBB; - = inferred)");
  process.exit(1);
}
const theme = { accent, background, ...(hex(highlight) ? { highlight } : {}), ...(hex(support) ? { support } : {}), ...(Object.keys(fonts).length ? { fonts } : {}) };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "jimbo-tokens-"));
try {
  copyFileSync(join(root, "foundation/src/lib/theme.ts"), join(dir, "theme.ts"));
  writeFileSync(join(dir, "brand.config.ts"), `export const BRAND = { name: "", storagePrefix: "x", defaultTheme: ${JSON.stringify(theme)} };\n`);
  writeFileSync(join(dir, "run.ts"), `
import { tokensCss } from "./theme";
console.log(tokensCss(${JSON.stringify(theme)}));
`);
  process.stdout.write(execFileSync("npx", ["-y", "tsx", join(dir, "run.ts")], { encoding: "utf8" }));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
