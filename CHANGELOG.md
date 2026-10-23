# Changelog

Every release of jimbo-ui, newest first. Each entry ends with **Apps must** —
the steps the update workflow carries out in each app beyond copying the
foundation files.

**jimbo.ui is a work in progress, so it's on 0.x.** While it is: a release
that asks apps to change their own code bumps the minor (0.6.0 → 0.7.0);
fixes and small additions bump the patch (0.6.0 → 0.6.1). 1.0.0 is for when
Ryan calls it stable. Changes collect under **Unreleased** at the top and only
get a number when Ryan asks for a release.

Releases before 2026-10-23's renumbering were tagged 1.0.0–3.1.0; they are
now 0.1.0–0.5.0 (1.0.0 → 0.1.0, 1.1.0 → 0.2.0, 2.0.0 → 0.3.0, 3.0.0 → 0.4.0,
3.1.0 → 0.5.0). An app whose `jimbo-ui.json` still says an old number is on
the matching 0.x release.

## Unreleased

Nothing yet.

## 0.6.0 — 2026-10-23

Depth, glass and the circle motif; two colours are enough.

### Added
- **Shades for every brand colour** (accent, highlight, support):
  `-lighter`, `-light`, `-dark`, `-darker`, a lit fill `-top` → `-bottom`
  (only ever moves away from the on-colour, so button text never gets harder
  to read) and washes `-950/900/800/700` for all three.
- **Two-colour themes:** highlight is optional; `deriveHighlight` infers it
  from the accent, and support from both. `fullTheme`, `ownColours`,
  `OPTIONAL_KEYS`.
- **Look:** `.glass`, `.card-glass`, `.orb-accent/highlight/support`,
  `.lit-accent/highlight/support`; lit `.btn-primary` with a glow; three
  colour orbs behind the page; cards at 90% so the orbs tint them.
- **Circle motif:** `ThemeDots` (kit) before page eyebrows and in empty
  states; orbs by stat labels; lit-circle avatars; colour circles on theme
  tiles (inferred ones dashed); the starter favicon is three circles
  (recoloured from all three brand colours).
- **Templates:** Canada (Flags) and Two-tone (Everyday, two colours).
- Style guide: Shades and depth, Glass and orbs blocks; colours as circles.
- `scripts/tokens.mjs` takes `-` for an inferred highlight or support.

### Changed
- **`Theme.highlight` is optional** (breaking for code that reads it from a
  `Theme`: use `fullTheme(theme).highlight` or `useBrand().colors`).
- `useBrand()` returns `colors` (all four, inferred filled in) beside `theme`
  (as set); `withDefaults` keeps a saved theme's missing colours missing.
- Brand page: *Infer it* / *Inferred* switch for highlight and support; saves
  only the colours that are set.
- Kit: frosted `Tabs`, `ViewSwitch`, `Sheet`, `Pager` and top bar; lit
  active tabs, pills, select ticks and top-bar main button; `StatTile` and
  accent `LinkCard` glows; `Banner` without an image gets colour orbs.
- **Lists aren't flat:** `DateBlock` is a calendar ticket with the month on a
  lit highlight band; row status dots are lit spheres with a glow
  (`STATUS_DOT`; `TONES[*].dot` now carries a shadow colour);
  `ListGroupLabel` is support text with an orb on a support wash.
- `.card` is lit by the brand colours: a soft accent glow top left and
  support glow bottom right over its gradient.
- Washes: `highlight-700` and `accent-800`/`support-800` added; `accent-hover`
  is now 20% (was 22%).
- Sweden (amber highlight, sky support), USA (sky highlight, white support)
  and Hanukkah (silver-blue highlight): no white highlights.

### Apps must
- Copy the foundation files (`theme.ts`, `themes.ts`, `globals.css`,
  `tailwind.config.js`).
- Regenerate `src/styles/tokens.css` (`scripts/tokens.mjs`): many new tokens.
- Where app code reads `.highlight` (or `.support`) from a `Theme`, read it
  from `fullTheme(theme)` or `useBrand().colors` instead; the typecheck finds
  them.
- Apps with a theme server: accept a missing `highlight` (as for `support`)
  and store only what's sent.
- Apps that track the reference: port `useBrand`, the Brand page, Style guide,
  kit (`ThemeDots`, `DateBlock`, `ListGroupLabel`, `EventRow`, `TONES`,
  `STATUS_DOT`, `StatTile`, `Tabs`, `Sheet`, `Pager`, `EntityRow`,
  `EmptyState`, `Banner`, `LinkCard`, `ViewSwitch`, `PillTabs`) and
  `AppShell` changes. App rows built on their own date blocks or dots:
  follow the ticket and glowing-dot pattern (guide sections 2 and 9).
- Optional: replace `public/favicon.svg` with the starter's circles (keep its
  four marker colours) so the favicon follows all the brand colours.

## 0.5.0 — 2026-10-23

Up to four colours, flag and holiday templates, and apps hear about new releases.

### Added
- **Support colour** — an optional fourth colour (`Theme.support`) for page
  eyebrows, avatars, third place and the page's bottom-left glow, with tokens
  `support`, `support-hover`, `on-support` and `support-950/900/700`. Themes
  without one get it derived (`deriveSupport`, `fullTheme`), so three-colour
  themes and saved settings keep working. `THEME_KEYS`, `FullTheme`.
- **Flags** (10) and **Holidays** (12) template sets beside **Everyday**
  (`TEMPLATE_SETS`; `TEMPLATE_GROUPS` still lists every group; `sameTheme`).
- **Version check:** the plugin runs `hooks/check-version.mjs` at session
  start; in an app whose `jimbo-ui.json` is behind the installed release, it
  says so and lists what's new. The skill states its version and does the
  same check when used. `scripts/versions.mjs` keeps every stated version in
  step.

### Changed
- Every Everyday template has a support colour; vibes name all three.
- `scripts/contrast.mjs` also checks accent, highlight and support contrast,
  button text, and that the three colours are clearly apart (ΔE ≥ 20).
- `scripts/tokens.mjs` takes an optional fourth argument (support).
- Reference: Brand page has set tabs, four colour tabs and a support warning;
  `ThemeCard` shows support; `PageHeader` eyebrows, `EntityRow` initials and
  `RankedList` third place use support; `StatTile`, `Banner` and `Hero` take
  `"support"`; Style guide shows the four colours and support tokens;
  `useBrand`'s `withDefaults` keeps a saved support.
- Starter default theme has a support colour (`#2EC5FF`).

### Apps must
- Copy the foundation files (`theme.ts`, `themes.ts`, `globals.css`,
  `tailwind.config.js`).
- Regenerate `src/styles/tokens.css` (the support tokens are new): add a
  `support` to `BRAND.defaultTheme` if you want to choose it, then
  `node scripts/tokens.mjs <accent> <highlight> <background> [support]`.
- Apps that track the reference: port the Brand page, Style guide,
  `useBrand` and kit changes above.
- Apps with a theme server: accept and return an optional `support`
  (`#RRGGBB`) alongside the other three.

## 0.4.0 — 2026-10-23

Branded **jimbo.ui** (the repo and plugin keep the name `jimbo-ui`).

### Changed
- **No logo — header text.** The reference `Wordmark` is replaced by
  `HeaderTitle`: the app's name (`BRAND.name`) in the display face and text
  colour, with any dot in the accent ("jimbo.ui"). The top bar, Style guide
  and Brand page miniatures use it.
- **Starter `brand.config.ts`:** `logo` is gone; `name` is the header text.
- **Brand page:** the uploads section is favicon-only.
- **Server contract:** `GET /public/theme` returns `{ theme, faviconUrl }`;
  only `favicon` uploads (`/admin/theme/favicon`).
- Showcase branded jimbo.ui.

### Removed
- `reference/web/src/components/Wordmark.tsx` and logo uploads.

### Apps must
- Copy the foundation files (comment changes only in `theme.ts`).
- Apps that track the reference shell or Brand page: use `HeaderTitle` in the
  top bar instead of a logo, drop the logo upload row and `logoUrl`, and
  remove `logo` from `brand.config.ts`. Apps that keep their own logo can
  skip this.

## 0.3.0 — 2026-10-23

jimbo-ui is now fully generic: no app's code, names, artwork or sample content.

### Changed
- **Reference kit is neutral.** Statuses are fixed **tones** — `Tone`
  (`accent` · `yellow` · `purple` · `red` · `muted`), `TONES` and `Badge` —
  that an app maps its own statuses onto; `EventRow`'s `status` is
  `{ tone, label }`. `ViewSwitch({ options, current })` replaces the
  list/map switch. `Banner`/`Hero` glows and `StatTile` accents are named
  `accent` / `highlight`. `RankedList` counts default to "item". The kit no
  longer needs an app's types or format helpers (`dateParts` and `initials`
  are built in).
- **`AppShell` is reusable:** pass `tabs` (`ShellTab[]`), top-bar `actions`
  (`TopBarButton`), optional `onRefresh`, and routes as children; `DockIcon`
  draws tab icons. The showcase uses it directly.
- **`Wordmark` is typeset** from `BRAND.logo` (`{ word, line }`) in the display
  face — main word in the accent outlined in the text colour, second line in
  the highlight. An app with drawn lettering swaps in its own SVG.
- **Starter:** `brand.config.ts` gains `logo`; neutral name, prefix and
  favicon mark.
- **Generic colour classes:** `accent`, `accent-hover`, `accent-950/900/700`,
  `highlight`, `highlight-hover`, `highlight-950/900/800`. The old
  `accent-lime` / `accent-pink` / `lime-*` / `rose-*` names still work.
  Foundation CSS and components use the new names.
- The default template is named **Volt** (same colours).
- Showcase content is neutral (events, places).

### Removed
- App-specific reference files: share images, photo carousel, upload ring,
  the API theme route and its table. The guide now describes the server
  contract (endpoints and shapes) instead.

### Apps must
- Copy the foundation files (`theme.ts`, `themes.ts`, `globals.css`,
  `tailwind.config.js`, `button.tsx`, `ColorPicker.tsx`). Existing class
  names keep working; nothing else is required for apps that keep their own
  kit and shell.
- Apps that track the reference kit or shell: port the renames above
  (`StatusBadge` → `Badge` with the app's status → tone map, `status` objects
  on `EventRow`, `ViewSwitch`, `accent`/`highlight` prop values) and add
  `logo` to `brand.config.ts` if using the reference `Wordmark`.

## 0.2.0 — 2026-10-23

### Changed
- **Stronger contrast on every theme.** Cards, fields, borders and secondary
  text no longer use fixed percentages: the engine steps each one just far
  enough to meet a contrast target on that background (cards 1.16:1 against
  the page, borders 1.55:1 against cards, muted text 5:1, labels 3.8:1). Mid
  and light themes gain the most — on Denim, cards went from 1.11:1 to
  1.16:1, borders from 1.30:1 to 1.55:1 and labels from 2.8:1 to 3.8:1.
  Body text is a touch brighter (`#FAF8F4` dark, `#111113` light).
- **Card borders at full strength** (`.card` uses `border-border`, not `/60`).
- **Concrete** template background deepened `#55585E` → `#45484D` so body
  text reaches 7:1.
- **Sheets render into `<body>` through a portal** (reference kit), so a
  parent's `space-y` margin can no longer push the backdrop down and leave a
  strip of the page uncovered at the top.

### Fixed
- `theme.ts` no longer needs Google Maps' type definitions: `mapStyles()`
  returns its own `MapStyle[]` (same shape), so apps without Maps typecheck.

### Added
- **Showcase** (`showcase/`): a demo app built only from the release's code —
  Home, List (search, filters, select mode) and Detail demo pages, the real
  Style guide and Brand pages, the shell and dock — published as a private
  page each release.
- **Preview an update**: a skill workflow that reports what updating an app
  would change (versions, look, foundation diffs, local edits at risk, apps-must
  steps, reference changes, default colours) without touching anything.
- `scripts/contrast.mjs`: contrast report for every template; `--check` fails
  the release if any template misses a target.

### Apps must
- Copy the foundation files (`theme.ts`, `themes.ts`, `globals.css`).
- Regenerate `src/styles/tokens.css` from `BRAND.defaultTheme`
  (`scripts/tokens.mjs`) — the derivation changed.
- Port the `Sheet` portal change into the app's kit (`createPortal(…,
  document.body)` around the backdrop).
- If the app passes `mapStyles()` to Google Maps, nothing changes; if it typed
  anything as `google.maps.MapTypeStyle[]` from it, use `MapStyle[]`.

## 0.1.0 — 2026-10-23

First release.

### Added
- **Theme engine** (`foundation/src/lib/theme.ts`): accent, highlight and
  background in; every colour token out as CSS variables; light backgrounds
  flip text dark; map style, map pins and favicon recolouring.
- **25 templates** in Dark / Mid / Light groups (`foundation/src/lib/themes.ts`),
  all passing the readability checks; an app's own default is added when it
  isn't one of them.
- **Foundation:** `globals.css` (page background, type scale, `.card`,
  `.btn`, `.field`, `.chip`…), `tailwind.config.js` tokens, `Button`,
  `ColorPicker`, `cn`, gestures.
- **Starter:** `brand.config.ts` (name, default theme, storage prefix),
  `tokens.css` (generated by `scripts/tokens.mjs`), `favicon.svg`.
- **Reference:** UI kit, app shell with the floating tab dock, Brand page,
  Style guide page, wordmark, brand hook, `index.html`.
- **Guide** (`skills/jimbo-ui/guide.md`) and the **jimbo-ui skill** with
  workflows to start an app, update an app, and release changes.

### Apps must
- Adopting for the first time: follow "start a new app" in the skill, or —
  for an existing app — split its own values into `brand.config.ts` and
  `tokens.css`, copy the foundation, and add `jimbo-ui.json`.
