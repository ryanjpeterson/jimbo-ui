---
name: jimbo-ui
description: Ryan's shared brand and UI system, jimbo.ui (repo and plugin jimbo-ui), for his web apps — theme engine with two to four colours and their shades, everyday, flag and holiday templates, glass and circle-motif look, Tailwind tokens, UI kit, floating tab-dock app shell and interaction patterns. Use when building, styling or reviewing UI in an app that has a jimbo-ui.json, when starting a new app "in my style" / "like my other apps" / "with jimbo-ui", when asked to update an app to the latest jimbo-ui or brand guidelines, whether there are new brand guidelines, or to preview what an update would change, when checking contrast across themes, when changing and releasing the jimbo-ui guidelines themselves, and for the registry of apps and components — add this to the jimbo ui registry, register this app with jimbo-ui, audit this app's UI against jimbo-ui, consolidate this app with jimbo-ui, use the jimbo-ui versions of my components.
---

# jimbo.ui

**This is jimbo.ui 0.8.0.** (Kept in step with the plugin version and the
newest numbered `CHANGELOG.md` entry; `scripts/versions.mjs` checks.)
jimbo.ui is a work in progress, so it's on 0.x: work collects under
"Unreleased" in the changelog and is numbered only when Ryan asks for a
release. Old tags 1.0.0–3.1.0 are now 0.1.0–0.5.0; an app still on an old
number is on the matching 0.x release (1.0.0 → 0.1.0, 1.1.0 → 0.2.0,
2.0.0 → 0.3.0, 3.0.0 → 0.4.0, 3.1.0 → 0.5.0).

jimbo.ui is a shared look and behaviour for Ryan's apps: phone-first, app-like, dark by
default, themeable from two to four colours. The full rules are in
[guide.md](guide.md); read the sections a task needs before writing UI.

The source of truth is the GitHub repo **ryanjpeterson/jimbo-ui** (private).
Releases are git tags `jimbo-ui--v<version>`; `CHANGELOG.md` says what changed
in each and what apps must do.

## Check the app's version first (always)

When this skill is used in an app (it has a `jimbo-ui.json`), compare that
file's `version` with this skill's version (above). If the app is behind, say
so in one line before anything else — "jimbo.ui 0.6.0 is out; this app is on
0.5.0" — with the one-line summary of each newer `CHANGELOG.md` entry, and
offer the preview or update workflow. Don't update unless asked. If the app is
*ahead*, the installed plugin is stale: suggest
`claude plugin marketplace update jimbo-ui` then
`claude plugin update jimbo-ui@jimbo-ui`.

The plugin also does this at the start of every session in an app
(`hooks/check-version.mjs`, a SessionStart hook), so the user hears about a
new release without asking. On claude.ai there's no hook: do it from this
section, using the `CHANGELOG.md` bundled with the skill.

"Are there new brand guidelines?" / "is this app on the latest jimbo-ui?" →
this check, then the preview workflow if they want detail.

## Core rules (always)

- Colours come from tokens only: `bg-bg`, `bg-surface`, `bg-surface-2`,
  `border-border`, `text-text-base/muted/subtle`, `*-accent`, `*-highlight`,
  `*-support`, `text-on-accent`, `text-on-highlight`, `text-on-support`,
  each brand colour's shades (`-lighter`, `-light`, `-dark`, `-darker`),
  solid fill (`.lit-*`) and washes (`-950/900/800/700`) (older apps may use the legacy `accent-lime`,
  `accent-pink`, `lime-*`, `rose-*` names — same tokens). Never raw hex or Tailwind palette
  colours on brand surfaces; never `text-white` on an accent/highlight fill.
- No logo: the brand is the app's name as header text (`HeaderTitle`, display
  face, text colour, a dot in the accent — "jimbo.ui").
- Two to four source colours: **accent** (primary: buttons, active states,
  the dot in the name) and **background** (everything else derives from it)
  always; **highlight** (secondary: dates, pins, badges, errors) and
  **support** (third: page eyebrows, avatars, third place, glows) set or
  inferred. Light backgrounds flip text dark automatically. Spread the
  colours: a page shows more than the accent, and no brand colour is white or
  grey.
- Coloured shapes are flat (`.lit-*`, `.btn-primary`, `.dot-*`) — no gloss,
  gradients or glows; depth comes from layers, borders and shadows, lightly frosted `.glass` (mostly solid, never
  see-through). Softly rounded corners, not pills (`rounded-control` for
  buttons and pills); full circles only for the motif.
- Type: the theme picks a font for headings and one for body (`FONTS`:
  sans, serif, mono, and decorative for headings only) with weight and
  spacing (`Theme.fonts`); use `font-display` / `font-body`, never a named
  family.
- Colour tuning: `Theme.infer` (contrasting or tonal), `Theme.vibrancy` and
  `Theme.contrast` — all on the jimbo-ui config section's Theme tab.
- Themes made from real things (teams, flags, provinces, games) use only
  their own colours and shades of them — never an invented hue.
- **Circles** (guide section 2): always one flat fill — no gradient, shine,
  glow, shadow, outline or ring, and no orbs or blurred blobs. Side by side
  with a 4 px gap, never overlapping. Sizes: 8 px inline (`ThemeDots`, label
  dots), 10 px status, 16 px swatches, 40–48 px editor swatches and avatars.
  The page colour as a swatch gets a 1 px `border-border`; inferred colours
  show at 55% opacity. Only in empty states, status, label dots, avatars and
  colour swatches — never above a page title or as decoration.
- **Each look comes once, in light, mid and dark** (guide section 4): a
  Light / Mid / Dark switch sets the page tone every tile shows; tones a
  look wasn't written in are made from its own colours (`atTone`,
  `FAMILY_SETS`, `familyLook`), and every look in every tone passes the
  checks. Six categories: **Everyday**, **Holidays**, **Countries** (by
  region), **Provinces**, **Games** (The Legend of Zelda) and **Sports**
  (every NHL, NBA, MLB and NFL team, plus Toronto, Ottawa and Chicago tabs),
  with a search box. New team, country, place or game looks come from their
  real colours via `scripts/template-from-colours.mjs`.
- Phone first at 375 px; floating frosted tab dock (≤ 5 tabs); things pinned
  to the bottom sit above it; touch targets ≥ 44 px; no horizontal scroll
  strips; nothing hover-only.
- One modal style (`Sheet`); one primary button per view; sentence case;
  plain, short, slightly wry copy.
- Use the kit (`.card`, `.btn`, `.field`, `.chip`, `.eyebrow`, `.meta`,
  `PageHeader`, `List`, `Section`, `KeyValue`, `SwitchRow`,
  `Autocomplete`…) before inventing anything. A new shared
  component goes in the kit, the Style guide panel, the showcase and the guide.
- **One library, no duplicates** (guide section 13). Every UI element in
  every app is in `registry/components.json`. Before adding one, **match it
  by purpose and behaviour, not by name**, against every entry and its
  aliases. A match *is* that component: record the name as an alias, and if
  it must differ, add a variant prop to the canonical one — never a second
  component. A component moves into the kit when two or more apps need it
  (or at once when it's clearly generic): a generic rewrite with neutral
  names, plus the kit, guide, showcase and Style guide panel, released as a
  minor version with "Apps must: Nothing" and an "Available" list. Domain
  components stay in their app — listed, never copied. **Pull jimbo-ui
  before writing to the registry**, so app chats don't overwrite each other.
- **Maps** use `MapView` (`components/MapView.tsx`): the theme's map style
  (`mapStyles`), flat highlight pins (`markerIcon`), `MapPinCard` for the
  chosen place, `ViewSwitch` for list ⇄ map. Never a stock map style.
- **Ask before building a feature or section:** "What existing component do
  you want to use for this feature or section's styling?" — offer 3–4
  fitting options from the component menu (guide section 9: e.g. for a list,
  `EventRow` list, `EntityRow` list, `MediaCard` grid, `RankedList`), plus
  something new, recommending one. Use Claude Code's question tool when
  available. One question per feature or section; then build with the
  choice.
- **New apps start from an archetype** (Tracker, Collection, Dashboard,
  Directory, Planner, Showcase, Tool — guide section 9): ask which fits
  before building.
- Backdrops and width: the theme's backdrop (`Theme.backdrop` — 21
  patterns in four groups, **Abstract**, **Geo**, **Vintage** and
  **Texture**, over a solid, gradient or glow base, with strength, size,
  contrast and saturation sliders) is behind every page; full-width sections use
  `FullBleed` and `HeroSection`, and `AppShell width` sets the page width.
- **One jimbo-ui config section per app** (guide section 1). Every brand,
  theme and style guide option lives there and nowhere else — no separate
  Brand pages, theme pickers in settings, or standalone Style guide pages.
  It's the same in every app: named **jimbo-ui config**, at **`/jimbo-ui`**,
  reached from the app's settings or admin area (never a dock tab), with
  tabs **Theme** (templates, colours, type, backdrop, live preview and
  readability checks), **Brand** (name and header text preview, favicon),
  **Style guide** (the live kit plus the app's components) and **About**
  (jimbo-ui version, registry status, the showcase link). App-specific
  additions go in its **App** tab, nowhere else. The theme set there is the
  app-wide default for everyone. Build it from
  `reference/web/src/routes/JimboConfigPage.tsx` (with `config/ThemePanel`
  and `config/StyleGuidePanel`), passing `canConfigure`:
  - `auth: "admin"` in `jimbo-ui.json`: the section, its route and its link
    exist only for admins (`canConfigure={user.isAdmin}`), and **every
    server route that saves the theme or brand checks admin on the server**.
    Non-admins get the default theme and never see the section.
  - `auth: "none"`: open to anyone using the app (`canConfigure`).
  Adapt only where it saves (the app's server, or the browser with no
  server) and the App tab. Never drop templates, colour editing or type.

## Where the files are

Find the repo: use `~/Development/jimbo-ui` if it exists, otherwise
`gh repo clone ryanjpeterson/jimbo-ui ~/Development/jimbo-ui`. Run
`git -C ~/Development/jimbo-ui fetch --tags` before reading versions. To read a
release without touching that working copy, export it:
`git -C ~/Development/jimbo-ui archive jimbo-ui--v<version> | tar -x -C <tmpdir>`.

- `foundation/` — copied verbatim into apps (never edited in an app)
- `starter/` — copied once into a new app, then app-owned
- `reference/` — generic implementations (kit, shell, header text, `MapView`,
  the jimbo-ui config section, and the **archetypes** in
  `web/src/archetypes/`: `catalogue.tsx` and `dashboard.tsx`), adapted and
  extended per app
- `registry/apps.json` — every app on jimbo-ui (repo, web root, version,
  auth, registered, last audited); `registry/components.json` — every UI
  element across all apps (id, name, purpose, tier, source, usedBy, aliases,
  variants). Names and paths only, never app code
- `scripts/inventory.mjs` — reads the registry and the apps' checkouts and
  prints the component × app table, candidates to promote, unused kit
  components, apps behind, raw colours in app code, and whether each app's
  config section is missing, split up or gated wrong
- `scripts/tokens.mjs` — prints an app's `tokens.css` for its colours
  (accent, highlight or `-`, background, optional support)
- `scripts/contrast.mjs` — contrast and colour-separation report for every
  template (`--check` fails on a miss)
- `scripts/versions.mjs` — checks every stated version agrees
- `scripts/template-from-colours.mjs` — turns real colours (a team's, a
  flag's) into templates that pass the checks
- `hooks/check-version.mjs` — the session-start version check for apps
- `showcase/` — a demo app built only from the release's code; published as a
  private page (URL in the README) so anyone can see what an app gets. Also
  the **playground**: design a theme there, export it (*Share this look*),
  and import it into an app's jimbo-ui config section or paste its `brand.config` line and
  `tokens.css` into the app. `docker compose up --build` runs it on
  http://localhost:4460
- `skills/jimbo-ui/guide.md` — the guide

Each app has `jimbo-ui.json` at its repo root: `version`, `webRoot`, `auth`
(`"admin"` or `"none"`), a `reference` map (reference file → the app's
equivalent), `registry` (`registered`, `audited`) and `components`
(`uses` — registry ids; `local` — `{ name, path, kind: domain|candidate,
matches }`; `overrides` — kit pieces the app wraps). Guide section 1
explains all of this.

## Workflow: start a new app on jimbo-ui

0. **Ask which archetype fits** (guide section 9: Catalogue and
   Single-page dashboard — real templates in `reference/web/src/archetypes/`
   to copy and remix — or Tracker, Collection, Dashboard, Directory,
   Planner, Showcase, Tool, or a mix), recommending the closest. It sets the dock tabs, page width, main pages and backdrop.
   Then, as you build each page, ask which component to use for each feature
   or section (the component menu).
1. Export the latest release (highest `jimbo-ui--v*` tag).
2. Copy `foundation/` and `starter/` into the app's web root. Install
   `clsx` and `tailwind-merge`; Tailwind 3 with PostCSS; the `@/` alias to `src/`.
3. Set `src/lib/brand.config.ts` (name, default theme — a template from guide
   section 4 or new colours that pass the readability checks — storage
   prefix), then regenerate `src/styles/tokens.css` with `scripts/tokens.mjs`.
4. Adapt from `reference/`: `index.html` (pre-paint script with the app's
   prefix, fonts, PWA tags), the app shell and its tabs, the kit (drop
   map the app's statuses onto the kit's tones and add its domain components), `BRAND.name` as the header text,
   the archetype's pages if one fits, and the **jimbo-ui config** section
   with every theming feature (see the core rule above), gated by `auth`,
   wired to the app's theme API if it has a server, or saved in the browser
   if it doesn't.
5. Write `jimbo-ui.json` (version, webRoot, auth, reference map,
   components), a short `docs/brand.md` noting its identity choices, and
   the jimbo-ui block in its `CLAUDE.md` (see "Register an app"); add the
   app to the registry.
6. Typecheck, run it, and look at the Style guide tab in a dark and a light
   template at phone width. On the Theme tab, try a template from each set,
   a two-colour theme (highlight and support inferred), each type style and
   a save, and check the choice survives a reload.

## Workflow: preview what an update would do (changes nothing)

Use when asked "what would the latest jimbo-ui change here?", "preview the
update", or before updating if the user wants to look first.

1. Read the app's `jimbo-ui.json`; fetch tags. If it's on the latest version
   (the newest tag, and at least this skill's version), say so and stop.
2. Export the app's version and the latest one to temp dirs (never touch the
   app's files or the jimbo-ui working copy).
3. Report, in plain words, in this order:
   - **Versions:** current → latest, with the one-line summary of each
     changelog entry in between.
   - **Look and feel:** what someone using the app will notice (e.g. "cards
     stand out more from the page", "sheets cover the whole screen").
   - **Foundation files:** each one that differs between the two releases,
     with a one-line summary of the change (`diff -u old new`); new and
     removed files.
   - **Local edits at risk:** foundation files where the app's copy differs
     from the *old* release's copy — these would be overwritten. Show the
     app's edit so the user can decide to keep it (fold it into jimbo-ui) or
     drop it.
   - **Apps must steps:** each one, and which of the app's files it touches
     (use the `reference` map and a search of the app for affected classes or
     names).
   - **jimbo-ui config section:** whether the app has the one section at
     `/jimbo-ui`, gated by its `auth`, with every feature the new reference
     has — or which separate brand, theme or style pages it still has.
   - **Reference changes:** a summary of `git diff <old> <new> -- reference/`,
     and whether the app's mapped files still look like the old reference
     (easy port) or have diverged (hand work).
   - **Default colours:** whether `tokens.css` would be regenerated, and if the
     app's default theme would look different (run `scripts/contrast.mjs` on
     the new release for its numbers if the engine changed).
4. Point to the showcase page to see the new release in action.
5. End by asking whether to go ahead with the update.

## Workflow: update an app to the latest jimbo-ui

1. Read the app's `jimbo-ui.json`. Fetch tags; if the app is already on the
   latest version, say so and stop.
2. Read every `CHANGELOG.md` entry after the app's version, oldest first, and
   tell the user briefly what's coming.
3. Export the app's current version and the latest one. For each foundation
   file, compare the app's copy with the *old* release's copy: if the app
   changed it locally, show the user and fold the change into jimbo-ui or
   drop it — never silently overwrite. Then copy the new foundation files in.
   Add new foundation files; delete ones the changelog says were removed.
4. Do each changelog **"Apps must"** step. For reference changes, run
   `git -C ~/Development/jimbo-ui diff jimbo-ui--v<old> jimbo-ui--v<new> -- reference/`
   and port the relevant hunks into the files the `reference` map names
   (and any other app code the change applies to, e.g. a renamed class).
5. If the changelog says the theme engine's derivation changed, regenerate
   `tokens.css` from `BRAND.defaultTheme`.
6. Make sure the app's jimbo-ui config section has every theming feature
   the current reference has (core rule above) and is gated right; build it
   if the app doesn't have it yet, moving any separate brand, theme or style
   pages into it.
7. Typecheck and build; check the config section's tabs at phone width.
8. Set `version` in `jimbo-ui.json`, add an entry to the app's own changelog
   ("Updated to jimbo-ui 0.6.0: …"), and commit. Push only if the user asks.

## Workflow: register an app

"Register this app with jimbo-ui", "audit this app's UI against jimbo-ui",
"add this to the jimbo ui registry". Changes no app code.

1. Pull `~/Development/jimbo-ui`. Clone or pull the app from GitHub into
   `~/Development/<name>` (`gh repo clone ryanjpeterson/<name>`).
2. Read its `jimbo-ui.json`, or note that it's missing.
3. Work out whether it has auth and roles (an admin flag, a `requireAdmin`
   on the server): that's `auth` — `"admin"` or `"none"`.
4. Inventory every UI component, class pattern and interaction pattern:
   its kit file, `components/`, and the components defined inside route
   files. Note which kit pieces it uses.
5. Find every brand, theme and style guide screen or option it has today
   and where it lives (routes, settings links, theme pickers).
6. Classify each piece against `registry/components.json` with the dedupe
   rules: **uses** (the kit's), **duplicate** (same purpose as an entry —
   an alias, maybe a variant), **candidate** (generic, not in the kit yet),
   **domain** (only this app's).
7. Update the app's `jimbo-ui.json` (`auth`, `registry`, `components`) and
   both registry files (`apps.json`; `components.json` usedBy, aliases,
   new candidates and domain entries). Run `node scripts/inventory.mjs`.
8. On a branch in the app, add this block to its `CLAUDE.md` (create it if
   missing):
   > This app uses jimbo-ui. Before creating a new UI component, check
   > registry/components.json in jimbo-ui for an existing one with the same
   > purpose. All brand, theme and style options belong in the jimbo-ui
   > config section (/jimbo-ui), admin-only if this app has auth. After
   > adding or changing a UI component, update this app's entry in the
   > jimbo-ui registry.
9. Report: what it reuses; duplicates of existing components, each with a
   merge plan; new candidates; domain-only pieces; token-rule violations
   (from the inventory); and a plan for moving its brand, theme and style
   options into the jimbo-ui config section with the right gating.
10. Ask before promoting anything, and before committing to the app's repo.

## Workflow: consolidate an app

"Consolidate this app with jimbo-ui", "use the jimbo-ui versions of my
components". In the app's own session.

1. Pull jimbo-ui. Read the app's `jimbo-ui.json` and the registry.
2. On a branch: for each `local` component that now has a canonical kit
   version, replace it with the kit component, choosing the matching variant
   props, and delete the local file.
3. Move every brand, theme and style guide option into the jimbo-ui config
   section, applying the access rules; remove the old pages, routes and
   settings entries.
4. Update `uses` / `local` in `jimbo-ui.json` and `usedBy` in the registry
   (pull first; commit the registry in jimbo-ui).
5. Typecheck and build. With `auth: "admin"`, check that a non-admin can't
   reach `/jimbo-ui` or call the save route (expect a 401/403). Show the
   user any visual differences before committing.

## Workflow: change and release the guidelines

Changes often start in an app. **jimbo-ui stays generic:** never copy an
app's code, names, artwork, sample content or domain terms into it — bring
back only the generic pattern, rewritten with neutral names and examples.
To release one:

1. In `~/Development/jimbo-ui` (pull first): copy the changed foundation files
   back from the app (they hold no app values — those live in the app's
   `brand.config.ts` and `tokens.css`) and update the matching generic
   `reference/` files by hand. Search the repo for the app's name and domain
   words before committing.
2. Update `skills/jimbo-ui/guide.md` (the relevant section and its change log)
   and this file if a core rule or workflow changed. **Promoting a
   component:** rewrite it generically, add it to the kit, the Style guide
   panel, the showcase and guide section 8, set its registry entry's tier to
   `kit` with the kit path, and list it under **Available** in the changelog
   ("Apps must: Nothing"). If the theme engine or
   templates changed, run `node scripts/contrast.mjs --check` — every template
   must pass. If the shell or kit changed, keep `showcase/src/Shell.tsx` and
   the demo pages in step.
3. While working, record changes under **Unreleased** in `CHANGELOG.md`
   (Changed / Added / Removed and **Apps must**, or "Nothing — copy the
   foundation files") and don't bump anything. Only when Ryan asks for a
   release: turn Unreleased into the new version's entry and leave an empty
   Unreleased above it. Versions (jimbo.ui is a work in progress, so 0.x): minor (0.6 → 0.7) when
   apps must change their own code, patch for fixes and small additions.
4. Bump `version` in `.claude-plugin/plugin.json`,
   `.claude-plugin/marketplace.json`, `foundation/src/lib/jimbo.ts` and the
   "This is jimbo.ui" line at the top of this file; `node scripts/versions.mjs` must pass. Start the
   changelog entry with a one-line summary — the session-start check shows it
   to every app that's behind.
5. `claude plugin validate .`, commit, `claude plugin tag .` (creates
   `jimbo-ui--v<version>`), and — when the user asks — `git push --follow-tags`.
6. `scripts/build-zip.sh` makes `dist/jimbo-ui-skill.zip` for claude.ai
   (Settings → Capabilities → Skills, replace the old one). Then
   `npm --prefix showcase install && npm --prefix showcase run build` and
   republish the showcase page (Artifact tool, `url` from the README,
   `file_path` `showcase/dist/page.html`, `files` mapping each
   `assets/<file>` to `showcase/dist/assets/<file>`, and `null` for the
   previous release's asset files so they're removed).
7. Remind the user: in Claude Code, `claude plugin marketplace update jimbo-ui`
   then `claude plugin update jimbo-ui@jimbo-ui` (restart to apply); then say
   "update to the latest jimbo-ui" in each app.
8. In the app the change came from, set `jimbo-ui.json` to the new version.
