# jimbo.ui

Ryan's shared brand and UI system for his web apps. The display name is
**jimbo.ui**; the repo, plugin, skill and folder are named `jimbo-ui`
(plugin names can't contain a dot). It's a private GitHub repo,
`ryanjpeterson/jimbo-ui`, and also a Claude Code plugin that apps' sessions
install (`jimbo-ui@jimbo-ui`).

The rules themselves live in `skills/jimbo-ui/guide.md`, and the workflows
(start an app, preview an update, update an app, release) in
`skills/jimbo-ui/SKILL.md`. Read the relevant parts before changing anything.

## The one hard rule: stay generic

No app's code, names, artwork, sample content or domain terms go in this repo.
Ideas often come from an app; bring back only the pattern, rewritten with
neutral names and examples. Before every commit, scan for the first app's
name and domain words:

```bash
git ls-files | grep -v "package-lock\|CLAUDE.md\|CHANGELOG" | xargs grep -il "tinnitus\|tagg\b\|concert\|festival\|venue\|attended\|immich\|media\.backup\|mediabackup"
```

It must print nothing. Add an app's words to it when a new app adopts jimbo.ui.

## Layout

| Path | What | Rule |
| --- | --- | --- |
| `foundation/` | Theme engine, templates, `globals.css`, Tailwind config, `Button`, `ColorPicker`, `cn`, gestures | Copied verbatim into apps on every update — never holds app values |
| `starter/` | `brand.config.ts`, `tokens.css`, `favicon.svg` | Copied once into a new app, then app-owned |
| `reference/` | Generic kit, `AppShell`, `HeaderTitle`, Brand and Style guide pages, `useBrand`, `index.html` | Apps adapt and extend them |
| `showcase/` | Demo app assembled from reference → foundation → starter → `showcase/overrides/` | Published as a private page each release |
| `scripts/` | `tokens.mjs` (an app's `tokens.css`), `contrast.mjs` (template contrast report), `versions.mjs` (versions agree), `build-zip.sh` (claude.ai upload) | |
| `hooks/` | `hooks.json` + `check-version.mjs`: tells an app's session when it's behind the installed release | |
| `skills/jimbo-ui/` | `SKILL.md` (core rules + workflows), `guide.md` (the full guide) | |
| `.claude-plugin/` | `plugin.json` and `marketplace.json` | Versions must match |

Brand decisions so far: two to four source colours (accent and background
always; highlight and support set or inferred), each with lighter and darker
shades; coloured shapes flat with a slight outline (no gloss or glows), depth
from layers (lightly frosted solid surfaces, borders, the backdrop); circles
always flat, side by side, at fixed sizes — no orbs; softly rounded corners, not pills; sans, mono or serif type
for headings and body;
circles of the theme colours as a motif; templates in Everyday, Holidays, Countries,
Provinces and Sports categories (team themes from real colours, via
`scripts/template-from-colours.mjs`); no brand colour white or grey;
no logo — the brand is the app's name as header text (`HeaderTitle`), with a
dot in the accent; the favicon is the only graphic.

## Running and checking

- Showcase: `npm --prefix showcase install` once, then the **jimbo-ui-showcase**
  launch config (port 4455) or `npm --prefix showcase run dev`. It has Home,
  List, Kit and Theme tabs; theme changes are saved in the browser. With
  Docker: `docker compose up --build` (built app, port 4460) or
  `docker compose --profile dev up` (live reload, port 4461). It doubles as a
  playground: Theme → *Share this look* exports a theme file, brand.config
  line or tokens.css for an app.
- Typecheck: `npm --prefix showcase run typecheck` (assembles `.jimbo/` and
  checks the showcase plus all reference and foundation code).
- Contrast: `node scripts/contrast.mjs --check` must pass for every template
  after any change to `theme.ts` or `themes.ts`.
- Plugin manifests: `claude plugin validate --strict .`
- Versions: `node scripts/versions.mjs` (manifests, SKILL.md, CHANGELOG agree)
- Check UI at phone width (375 px) in a dark, a mid and a light template.

## Releasing

Follow "change and release the guidelines" in `skills/jimbo-ui/SKILL.md`. In short:

1. Update `skills/jimbo-ui/guide.md` (and its "Change log of this guide") and
   `SKILL.md` if a rule or workflow changed.
2. Add a `CHANGELOG.md` entry with Changed / Added / Removed and **Apps must**.
   jimbo.ui is WIP, so 0.x: minor = apps must change their own code, patch =
   fixes and small additions; 1.0.0 only when Ryan calls it stable. Record
   work under "Unreleased" as you go; don't number or tag anything until
   Ryan asks for a release.
3. Bump `version` in both `.claude-plugin` files and the "This is jimbo.ui"
   line in `SKILL.md`. Start the changelog entry with a one-line summary (the
   session-start check shows it to apps).
4. Run the checks above, commit, `claude plugin tag .` (creates
   `jimbo-ui--v<version>`).
5. Push (`git push --follow-tags`) **only when Ryan asks**.
6. `scripts/build-zip.sh` for claude.ai.
7. Republish the showcase: `npm --prefix showcase run build`, then publish
   `showcase/dist/page.html` with the Artifact tool to the existing page —
   pass `url: https://claude.ai/artifact/F4KAFYCkxZGZB7zKdaWjWC` (never create
   a second page), `files` mapping each `assets/<file>` to
   `showcase/dist/assets/<file>`, and `null` for the previous asset files
   (list them with the Artifact tool's `scope: "files"`). Copy the files to the
   session's scratchpad first if the publisher refuses paths outside it.
8. Tell Ryan to refresh the plugin (`claude plugin marketplace update jimbo-ui`,
   then `claude plugin update jimbo-ui@jimbo-ui`, restart) and re-upload the
   zip to claude.ai if he uses it there.

## Working style

- The pilot app is **Tinnitus A Go Go** (the first app on jimbo.ui, which it
  was split out of). Try new patterns there first, then bring them back
  generic. Its name stays out of everything but this file and the changelog.
  Its colours are two templates: **Volt** (its current default) and **Pilot**
  (its original palette from its first commit: lime `#A8FF3E`, hot pink
  `#FF3D6E`, cyan `#3DFFE8` on `#141416`; it also had orange `#FF8C3A`, a
  fifth colour a theme can't hold).
- When starting an app, ask which archetype fits; when building UI in an
  app, ask which existing component to use for each feature or section (the
  archetypes and component menu, guide section 9) before building.

- Plain, short copy; sentence case; the guide's voice rules apply to docs too.
- Keep `CHANGELOG.md`, `guide.md`'s change log and `README.md` in step with
  every meaningful change, in the same commit.
- Commit when work is done; push only when asked.
- Apps that use jimbo.ui each have a `jimbo-ui.json` at their repo root.
  Updating an app happens in that app's own session, not here.
