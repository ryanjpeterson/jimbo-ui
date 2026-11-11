# Features

## Summary

Theme engine, kit and shell, rules, registry, tooling and the plugin. 27 features in 6 areas.

## Features

### Theme

| Feature | What it does | Where | Status |
|-|-|-|-|
| Theme engine | Two to four colours → palette with shades, light / mid / dark | `foundation/src/lib/theme.ts` | stable |
| Looks | 324 templates in Everyday, Holidays, Countries, Provinces, Games, Brands, Sports | `foundation/src/lib/themes.ts`, `scripts/template-from-colours.mjs` | stable |
| Backdrops and motifs | 79 backdrops, still or moving; motif shapes; favicon is the motif | `foundation/` | stable |
| Fonts | Nine per group, heading and body sizes | `foundation/` | stable |
| Tokens | Tailwind 4 theme, the one mapping onto shadcn's variables, an app's `tokens.css` | `foundation/src/styles/globals.css`, `scripts/tokens.mjs` | changed (Unreleased) |

### Kit and shell

| Feature | What it does | Where | Status |
|-|-|-|-|
| shadcn primitives | 29 shadcn/ui components with jimbo's edits, copied into apps | `foundation/src/components/ui/`, `scripts/shadcn-add.mjs` | new (Unreleased) |
| UI kit | Composed from the primitives: fields, menus, toasts, tables, steps, lists, cards, stats, charts, Timeline, ScrollingLine | `reference/web/src/components/ui/` | changed (Unreleased) |
| App shell | Phone-first, full-screen, floating tab dock, safe areas, top bar | `reference/web/src/routes/AppShell.tsx` | stable |
| Heroes | `PageHeader` (compact hero), `HeroSection`, `HeroCarousel`; a hero on every page | `reference/web/src/components/ui/kit.tsx` | new (0.17.0) |
| JumpMenu | Every data page one tap away | kit | new (0.17.0) |
| Spotlight search | ⌘K app-wide search | kit | stable |
| MapView | Maps in the theme | `reference/web/src/components/MapView.tsx` | stable |
| jimbo-ui config section | `/jimbo-ui`: Theme (Looks, Colours, Type, Backdrop), Brand, Style guide, Updates/About | `reference/web/src/routes/JimboConfigPage.tsx`, `routes/config/` | stable |
| URL state | The view lives in the URL | `reference/web/src/lib/useUrlState.ts` | stable |
| Archetypes | Catalogue, Dashboard, Status monitor | `reference/web/src/archetypes/` | stable |

### Rules

| Feature | What it does | Where | Status |
|-|-|-|-|
| Rulebook | 68 numbered rules (Brand, Colour, Shapes, Controls, Layout, Navigation, Motion, Parts, Binding, Accessibility) | `skills/jimbo-ui/rulebook.md` | changed (Unreleased: J binding group, S8, C8) |
| PR route | Apps amend jimbo.ui only by PR; tracked pending versions | guide section 14, SKILL.md "Amend jimbo.ui" | new (Unreleased) |
| Guide | Each rule explained, values and patterns | `skills/jimbo-ui/guide.md` | stable |

### Registry

| Feature | What it does | Where | Status |
|-|-|-|-|
| Apps list | Names, repos, dates | `registry/apps.json` | stable |
| Component catalogue | 120 shared components, primitives and generic candidates in tiers, each with its shadcn base | `registry/components.json` | stable |
| Inventory | Component × app table, what to promote, raw colours, config and binding checks from each app's pushed `jimbo-ui.json` | `scripts/inventory.mjs` | stable |

### Tooling

| Feature | What it does | Where | Status |
|-|-|-|-|
| Contrast check | Every template, `--check` for releases | `scripts/contrast.mjs` | stable |
| Versions and releases | Versions agree; `releases.json` from the changelog (apps' Updates tab reads it) | `scripts/versions.mjs`, `scripts/releases.mjs`, `releases.json` | stable |
| Showcase | Demo from a release's code; screen tests at 375 px | `showcase/`, `compose.yaml` | stable |
| claude.ai zip | The skill for claude.ai | `scripts/build-zip.sh` | stable |

### Plugin

| Feature | What it does | Where | Status |
|-|-|-|-|
| Skill and workflows | Start, preview an update, update, audit, register, release | `skills/jimbo-ui/SKILL.md` | stable |
| Version hook | Session start in an app says when it's behind | `hooks/` | stable |

## Removed or retired

- **Glossy orbs and heavy glass** (0.6.0–0.7.0): circles always flat, calmer surfaces.
- **Per-app details in the registry** (0.11.0): moved to each app's `jimbo-ui.json`.
- **Tailwind 3 config files** (0.14.0): Tailwind 4 theme in CSS.
- **`HeroSlide` actions** (0.17.0): slides are facts only.
