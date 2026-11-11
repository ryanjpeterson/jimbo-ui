# Overview

## What it is

A repo of three kinds of code plus the rules:

- **`foundation/`**: the theme engine, templates, `globals.css` with the Tailwind 4 theme and the one token mapping onto shadcn's variables, the shadcn/ui primitives (`src/components/ui/`), `ColorPicker`, gestures; copied verbatim into apps on every update, never edited there.
- **`starter/`**: `brand.config.ts`, `tokens.css`, favicon; copied once, then app-owned.
- **`reference/`**: the kit (`kit.tsx`, `forms`, `overlays`, `feedback`, `data`), `AppShell`, `HeaderTitle`, `MapView`, the jimbo-ui config section, and three archetypes (Catalogue, Dashboard, Status monitor); adapted per app.
- **`skills/jimbo-ui/`**: `rulebook.md` (68 numbered rules in ten groups, binding on apps; it decides), `guide.md` (each rule explained), `SKILL.md` (core rules and workflows).

Around it: `registry/` (the apps and a 120-entry component catalogue), `scripts/` (inventory, tokens, contrast, versions, releases, template-from-colours, zip), `hooks/` (a session-start version check), and `showcase/` (a demo built only from a release's code).

## Why it exists

The first app had a look worth reusing; the next ones were starting to diverge. jimbo.ui was split out of that first app on 2026-10-23 so every app shares one brand, one kit and one set of rules, with each release telling apps exactly what to change.

## What it is not

- Not an npm package: code is copied into apps (verbatim, once, or adapted).
- Not app-specific: no app's code, names, artwork or domain terms (a scan before every commit enforces it).
- Not a logo or brand identity per app: the brand is the app's name as header text with an accent dot.

## Principles and hard rules

- **Stay generic.** The scan in CLAUDE.md must print nothing; `registry/apps.json` is the only place apps are named.
- **The rulebook decides, the guide explains;** rule numbers are never reused or reordered.
- **Versions say what an update takes:** breaking = next 0.MINOR (apps change code), feature or fix = 0.x.PATCH (drop-in).
- **Contrast check passes for every template** after any theme change.
- **An app's details live only in its own `jimbo-ui.json`.**
- **jimbo.ui is binding:** apps use its components and tokens only and amend it by PR (J1–J6).
- **Push and release only when Ryan asks.**

## Status

Active and moving fast: 33 releases from 2026-10-23 to 2026-11-08. "Done" would be a 1.0.0 Ryan calls stable.
