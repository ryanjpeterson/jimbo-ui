/**
 * Turn dist/index.html into the page body the Artifact publisher expects (it
 * adds its own doctype, html, head and body), keeping the title, fonts, the
 * pre-paint theme script and the built CSS/JS. The assets in dist/assets are
 * published next to it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "";
const keep = head
  .split("\n")
  .filter((l) => !/<meta charset|<meta name="viewport"/.test(l))
  .join("\n");
writeFileSync(join(dist, "page.html"), `${keep.trim()}\n${body.trim()}\n`);
console.log("Wrote dist/page.html for publishing");
