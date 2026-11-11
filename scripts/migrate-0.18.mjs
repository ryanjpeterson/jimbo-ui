#!/usr/bin/env node
/**
 * Codemod for the shadcn/ui update: renames jimbo's old token utilities and
 * classes to the shadcn names (guide §3, "The token mapping") and lists what
 * it can't rewrite, with the rule it breaks. Run it from an app's web root
 * (or pass the folders to scan). It changes files in place, so commit first.
 *
 *   node ~/Development/jimbo-ui/scripts/migrate-0.18.mjs [src …] [--dry]
 *
 * What it rewrites (in .ts, .tsx, .css, .html):
 *   bg-accent → bg-primary (every utility prefix and shade; on-accent →
 *   primary-foreground), on-highlight / on-support → *-foreground,
 *   bg / bg-deep → background / background-deep, surface → card,
 *   surface-2 → muted, text-base / text-muted / text-subtle → foreground /
 *   muted-foreground / subtle-foreground, danger → destructive, dot-accent /
 *   orb-* / motif-accent → dot-primary / dot-* / motif-primary, lit-* → the
 *   solid fill and its foreground, the -top / -bottom lit shades → the flat
 *   colour, .glass / .card-glass / .card → a flat card surface, and it drops
 *   backdrop-blur-* and shadow-* (S8).
 *
 * What it reports (fix by hand, using jimbo.ui's components):
 *   .btn* → <Button>, .field → <Input> / <Textarea> / <SelectField>,
 *   .chip → <Badge> / LinkChips, .label → <Label> / <Field>,
 *   raw rgb(var(--c-…)) colours, classes built from a tone name
 *   (`bg-${tone}`: "accent" now means shadcn's hover surface).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, extname, relative } from "node:path";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const roots = args.filter((a) => !a.startsWith("--"));
if (!roots.length) roots.push("src");

const PREFIX = "(?:bg|text|border|border-[trblxy]|ring|ring-offset|from|via|to|fill|stroke|outline|divide|decoration|caret|placeholder|accent|shadow)";
const V = "((?:[a-z0-9@\\[\\]=&_:/.-]*:)?!?)"; // variants like hover:, sm:, group-hover:, data-[x]:

/** [pattern, replacement] pairs, run in order. */
export const RULES = [
  // Brand fills and their text.
  [new RegExp(`\\b${V}(${PREFIX})-on-accent\\b`, "g"), "$1$2-primary-foreground"],
  [new RegExp(`\\b${V}(${PREFIX})-on-highlight\\b`, "g"), "$1$2-highlight-foreground"],
  [new RegExp(`\\b${V}(${PREFIX})-on-support\\b`, "g"), "$1$2-support-foreground"],
  // Lit two-stop shades are gone (flat): the plain colour.
  [new RegExp(`\\b${V}(${PREFIX})-(accent|highlight|support)-(?:top|bottom)\\b`, "g"), "$1$2-$3"],
  // accent (brand) → primary; shadcn's own accent is the hover surface.
  [new RegExp(`\\b${V}(${PREFIX})-accent(-(?:hover|lighter|light|dark|darker|950|900|800|700))?\\b(?!-)`, "g"), "$1$2-primary$3"],
  // Text tokens.
  [new RegExp(`\\b${V}(${PREFIX})-text-base\\b`, "g"), "$1$2-foreground"],
  [new RegExp(`\\b${V}(${PREFIX})-text-muted\\b`, "g"), "$1$2-muted-foreground"],
  [new RegExp(`\\b${V}(${PREFIX})-text-subtle\\b`, "g"), "$1$2-subtle-foreground"],
  // Surfaces.
  [new RegExp(`\\b${V}(${PREFIX})-surface-2\\b`, "g"), "$1$2-muted"],
  [new RegExp(`\\b${V}(${PREFIX})-surface\\b(?!-)`, "g"), "$1$2-card"],
  [new RegExp(`\\b${V}(${PREFIX})-bg-deep\\b`, "g"), "$1$2-background-deep"],
  [new RegExp(`\\b${V}(${PREFIX})-bg\\b(?!-)`, "g"), "$1$2-background"],
  [new RegExp(`\\b${V}(${PREFIX})-danger\\b`, "g"), "$1$2-destructive"],
  // The motif and dots.
  [/\b(?:dot|orb)-accent\b/g, "dot-primary"],
  [/\borb-(highlight|support)\b/g, "dot-$1"],
  [/\bmotif-accent\b/g, "motif-primary"],
  // Solid fills.
  [/\blit-accent\b/g, "bg-primary text-primary-foreground"],
  [/\blit-(highlight|support)\b/g, "bg-$1 text-$1-foreground"],
  // Glass and the lit card → a flat card (S6, S8).
  [/(["'`\s])card-glass(?=["'`\s])/g, "$1rounded-xl border border-border bg-card"],
  [/(["'`\s])glass(?=["'`\s])/g, "$1border border-border bg-card"],
  [/(["'`\s])card(?=["'`\s])/g, "$1rounded-xl border border-border bg-card"],
  // No blur or shadows on components (S8).
  [new RegExp(`[ \\t]?${V}backdrop-blur(?:-[a-z0-9]+)?(?=["'\`\\s])`, "g"), ""],
  [new RegExp(`[ \\t]?${V}shadow(?:-[a-z0-9/\\[\\]_.,()#-]+)?(?=["'\`\\s])`, "g"), ""],
];

/** [pattern, what to do, any line (not just class strings)] — reported, not rewritten. */
export const REPORTS = [
  [/(^|\s)btn(?:-(?:primary|secondary|ghost|danger|sm))?(?=\s|$)/, "P1/J3 · a .btn class: use <Button variant size>"],
  [/(^|\s)field(?=\s|$)/, "P1/J3 · a .field class: use <Input>, <Textarea> or <SelectField>"],
  [/(^|\s)chip(?=\s|$)/, "P1/J3 · a .chip class: use <Badge> or LinkChips"],
  [/(^|\s)label(?=\s|$)/, "P1 · a .label class: use <Label> or the kit's TextField"],
  [/rgb\(var\(--c-/, "C1 · a raw channel colour: use a token utility or var(--primary)…", true],
  [/(?:bg|text|border|ring|from|to)-\$\{/, "C1 · a class built from a name: check it isn't \"accent\" (now shadcn's hover surface; the brand colour is primary)", true],
  [/from ["'](?:@radix-ui\/|radix-ui["'])/, "J2 · a Radix import outside components/ui: use jimbo.ui's component", true],
];

/** The class strings on a line: className="…", class="…", @apply …, and the strings inside cn(…). */
function classText(line) {
  const out = [];
  for (const m of line.matchAll(/class(?:Name)?=\{?\s*(["'`])([^"'`]*)\1/g)) out.push(m[2]);
  for (const m of line.matchAll(/@apply ([^;]*)/g)) out.push(m[1]);
  for (const m of line.matchAll(/\bcn\(([^)]*)\)/g)) for (const q of m[1].matchAll(/(["'`])([^"'`]*)\1/g)) out.push(q[2]);
  return out;
}

const EXT = new Set([".ts", ".tsx", ".css", ".html"]);
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".") || name === "dist") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.has(extname(p))) yield p;
  }
}

/** Rewrite one file's text; foundation files (they say so on line 1) are left alone. */
export function migrate(text) {
  let out = text;
  for (const [re, to] of RULES) out = out.replace(re, to);
  return out;
}

const main = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (main) {
  let changed = 0;
  const reports = [];
  for (const root of roots) {
    for (const file of walk(root)) {
      const text = readFileSync(file, "utf8");
      if (/^\/[/*] Part of jimbo-ui \(foundation/.test(text)) continue;
      const out = migrate(text);
      if (out !== text) { changed++; if (!dry) writeFileSync(file, out); }
      out.split("\n").forEach((line, i) => {
        // Comments don't count; class checks only where classes are written.
        if (/^\s*(\*|\/\/|\/\*|\{\/\*)/.test(line)) return;
        const classes = classText(line);
        for (const [re, what, any] of REPORTS) {
          if (any ? re.test(line) : classes.some((c) => re.test(c))) reports.push(`${what} · ${relative(process.cwd(), file)}:${i + 1}`);
        }
      });
    }
  }
  console.log(`${dry ? "Would change" : "Changed"} ${changed} file(s).`);
  if (reports.length) {
    console.log(`\n${reports.length} to fix by hand:`);
    for (const r of reports) console.log(`  ${r}`);
  }
}
