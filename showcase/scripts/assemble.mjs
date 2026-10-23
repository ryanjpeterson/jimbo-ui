/**
 * Lay the release's code out the way an app would have it, in .jimbo/:
 * reference (Tinnitus's code) first, then foundation and starter on top, then
 * the showcase's stand-ins (overrides/) for the parts that need a server.
 * The showcase imports everything from there through the `@/` alias.
 */
import { cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(here, "..");
const out = join(here, ".jimbo");
rmSync(out, { recursive: true, force: true });
for (const layer of ["reference/web/src", "foundation/src", "starter/src", "showcase/overrides"]) {
  cpSync(join(repo, layer), out, { recursive: true });
}
console.log("Assembled .jimbo/ from reference, foundation, starter and showcase overrides");
