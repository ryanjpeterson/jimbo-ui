---
name: jimbo-ui
description: Ryan's shared brand and UI system, jimbo.ui (repo and plugin jimbo-ui), for his web apps — theme engine with up to four colours, everyday, flag and holiday templates, Tailwind tokens, UI kit, floating tab-dock app shell and interaction patterns. Use when building, styling or reviewing UI in an app that has a jimbo-ui.json, when starting a new app "in my style" / "like my other apps" / "with jimbo-ui", when asked to update an app to the latest jimbo-ui or brand guidelines, whether there are new brand guidelines, or to preview what an update would change, when checking contrast across themes, or when changing and releasing the jimbo-ui guidelines themselves.
---

# jimbo.ui

**This is jimbo.ui 3.1.0.** (Kept in step with the plugin version and the
newest `CHANGELOG.md` entry; `scripts/versions.mjs` checks.)

jimbo.ui is a shared look and behaviour for Ryan's apps: phone-first, app-like, dark by
default, themeable from up to four colours. The full rules are in
[guide.md](guide.md); read the sections a task needs before writing UI.

The source of truth is the GitHub repo **ryanjpeterson/jimbo-ui** (private).
Releases are git tags `jimbo-ui--v<version>`; `CHANGELOG.md` says what changed
in each and what apps must do.

## Check the app's version first (always)

When this skill is used in an app (it has a `jimbo-ui.json`), compare that
file's `version` with this skill's version (above). If the app is behind, say
so in one line before anything else — "jimbo.ui 3.1.0 is out; this app is on
3.0.0" — with the one-line summary of each newer `CHANGELOG.md` entry, and
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
  `accent-950/900/700`, `highlight-950/900/800`, `support-950/900/700` (older apps may use the legacy `accent-lime`,
  `accent-pink`, `lime-*`, `rose-*` names — same tokens). Never raw hex or Tailwind palette
  colours on brand surfaces; never `text-white` on an accent/highlight fill.
- No logo: the brand is the app's name as header text (`HeaderTitle`, display
  face, text colour, a dot in the accent — "jimbo.ui").
- Up to four source colours: **accent** (primary: buttons, active states, the
  dot in the name), **highlight** (secondary: dates, pins, badges, errors),
  **support** (third: page eyebrows, avatars, third place, glows — optional,
  derived when a theme leaves it out), **background** (everything else
  derives from it). Light backgrounds flip text dark automatically. Spread
  the colours: a page should show more than the accent.
- Templates come in three sets: **Everyday** (dark, mid, light), **Flags**
  and **Holidays** (guide section 4).
- Phone first at 375 px; floating frosted tab dock (≤ 5 tabs); things pinned
  to the bottom sit above it; touch targets ≥ 44 px; no horizontal scroll
  strips; nothing hover-only.
- One modal style (`Sheet`); one primary button per view; sentence case;
  plain, short, slightly wry copy.
- Use the kit (`.card`, `.btn`, `.field`, `.chip`, `.eyebrow`, `.meta`,
  `PageHeader`, `List`, `Section`…) before inventing anything. A new shared
  component goes in the kit, the app's Style guide page, and the guide.

## Where the files are

Find the repo: use `~/Development/jimbo-ui` if it exists, otherwise
`gh repo clone ryanjpeterson/jimbo-ui ~/Development/jimbo-ui`. Run
`git -C ~/Development/jimbo-ui fetch --tags` before reading versions. To read a
release without touching that working copy, export it:
`git -C ~/Development/jimbo-ui archive jimbo-ui--v<version> | tar -x -C <tmpdir>`.

- `foundation/` — copied verbatim into apps (never edited in an app)
- `starter/` — copied once into a new app, then app-owned
- `reference/` — generic implementations (kit, shell, header text, Brand and
  Style guide pages), adapted and extended per app
- `scripts/tokens.mjs` — prints an app's `tokens.css` for its colours
  (accent, highlight, background, optional support)
- `scripts/contrast.mjs` — contrast and colour-separation report for every
  template (`--check` fails on a miss)
- `scripts/versions.mjs` — checks every stated version agrees
- `hooks/check-version.mjs` — the session-start version check for apps
- `showcase/` — a demo app built only from the release's code; published as a
  private page (URL in the README) so anyone can see what an app gets
- `skills/jimbo-ui/guide.md` — the guide

Each app has `jimbo-ui.json` at its repo root: `version`, `webRoot`, and a
`reference` map (reference file → the app's equivalent). Guide section 1
explains all of this.

## Workflow: start a new app on jimbo-ui

1. Export the latest release (highest `jimbo-ui--v*` tag).
2. Copy `foundation/` and `starter/` into the app's web root. Install
   `clsx` and `tailwind-merge`; Tailwind 3 with PostCSS; the `@/` alias to `src/`.
3. Set `src/lib/brand.config.ts` (name, default theme — a template from guide
   section 4 or new colours that pass the readability checks — storage
   prefix), then regenerate `src/styles/tokens.css` with `scripts/tokens.mjs`.
4. Adapt from `reference/`: `index.html` (pre-paint script with the app's
   prefix, fonts, PWA tags), the app shell and its tabs, the kit (drop
   map the app's statuses onto the kit's tones and add its domain components), `BRAND.name` as the header text, Brand and Style guide pages,
   and the API theme route if the app has a server (otherwise use
   `BRAND.defaultTheme` only).
5. Write `jimbo-ui.json` with the version and the reference map, and a short
   `docs/brand.md` in the app noting its identity choices and pointing here.
6. Typecheck, run it, and look at the Style guide page in a dark and a light
   template at phone width.

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
6. Typecheck and build; check the Style guide page at phone width.
7. Set `version` in `jimbo-ui.json`, add an entry to the app's own changelog
   ("Updated to jimbo-ui 1.2.0: …"), and commit. Push only if the user asks.

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
   and this file if a core rule or workflow changed. If the theme engine or
   templates changed, run `node scripts/contrast.mjs --check` — every template
   must pass. If the shell or kit changed, keep `showcase/src/Shell.tsx` and
   the demo pages in step.
3. Add a `CHANGELOG.md` entry for the new version with **Changed / Added /
   Removed** and an **Apps must** list (or "Nothing — copy the foundation
   files"). Semver: patch for fixes, minor for additions, major when apps must
   change their own code.
4. Bump `version` in `.claude-plugin/plugin.json`,
   `.claude-plugin/marketplace.json` and the "This is jimbo.ui" line at the
   top of this file; `node scripts/versions.mjs` must pass. Start the
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
