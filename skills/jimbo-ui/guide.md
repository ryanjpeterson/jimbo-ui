# jimbo-ui standards

How apps built on **jimbo-ui** look, read and behave, written as a recipe:
with this guide you can build an app that looks and feels like the others,
with its own colours and logo, whether or not you copy the code. Generic
implementations of everything below are in the repo's `reference/` folder.

- **The rules:** this guide. It's versioned with the jimbo-ui repo; see
  `CHANGELOG.md` for what changed in each version and what apps must do.
- **The living picture:** each app's **Style guide** page (`/admin/style`)
  renders every shared component in that app's current theme.
- **Theme:** three colours (accent, highlight, background), picked from
  templates or fine-tuned on each app's **Brand & theme** admin page.

**Contents:** 1 How apps use jimbo-ui · 2 Brand · 3 Theme engine · 4 Theme
templates · 5 Typography · 6 Layout and shell · 7 Surfaces, depth and motion ·
8 Components · 9 Patterns · 10 Icons · 11 Accessibility · 12 Don'ts

---

## 1. How apps use jimbo-ui

The stack is React + TypeScript + Vite + Tailwind CSS 3 (with `clsx` and
`tailwind-merge`). Paths below are relative to the app's web root.

### Three kinds of file

| Kind | In the repo | In an app | Updated how |
| --- | --- | --- | --- |
| **Foundation** | `foundation/` | Same path in the app | Copied over verbatim on every update. **Never edit in an app** — change jimbo-ui instead. Each file says so in its header |
| **Starter** | `starter/` | Same path in the app | Copied once when an app starts, then owned by the app |
| **Reference** | `reference/` | The app's own equivalents | Generic implementations. Apps adapt and extend them with their own domain pieces; on update, changes are ported by hand (the changelog says which) |

**Foundation:** `src/lib/theme.ts` (theme engine), `src/lib/themes.ts`
(templates), `src/lib/cn.ts`, `src/lib/gestures.ts`,
`src/components/ui/button.tsx`, `src/components/ColorPicker.tsx`,
`src/styles/globals.css`, `tailwind.config.js`.

**Starter (app-owned):**
- `src/lib/brand.config.ts` — the app's name, default theme and localStorage
  prefix. The only theme values that differ between apps.
- `src/styles/tokens.css` — the default tokens; generate it with
  `node scripts/tokens.mjs <accent> <highlight> <background>`.
- `public/favicon.svg` — keep `#0B0B0C` for its background and `#A8FF3E` for
  its mark so `applyFavicon` can recolour it.

**Showcase:** `showcase/` is a small app built only from a release's code
(reference, then foundation and starter, then stand-ins for the server parts
in `showcase/overrides/`). It runs the real Brand page, Style guide and kit,
plus Home, List and Detail demo pages, with the theme saved in the browser.
`npm --prefix showcase run dev` runs it locally; each release publishes it as
a private page (URL in the README) — the way to see what an app would get
without having one.

**Reference (adapt to the app):** the UI kit (`kit.tsx`), the app shell
(`AppShell.tsx`: pass tabs, top-bar actions and routes), Brand page, Style
guide page, `Wordmark.tsx` (typeset from `BRAND.logo`), `useBrand.ts`, and
`index.html` (pre-paint script, fonts, PWA tags).

**Server side (optional):** an app that lets admins change the theme stores
the three colours and any uploaded logo/favicon, and serves them:
`GET /public/theme` → `{ theme: { accent, highlight, background } (null =
default), logoUrl, faviconUrl }`; admin-only `PUT /admin/theme` (three
`#RRGGBB` values), `DELETE /admin/theme` (back to defaults), and
`POST`/`DELETE /admin/theme/:asset` for `logo` / `favicon` (SVG, PNG, WebP or
JPEG ≤ 1 MB; refuse SVGs with scripts, event handlers or foreign objects).
The app's API client exposes these as `getTheme`, `setTheme`, `resetTheme`,
`uploadBrandAsset`, `removeBrandAsset`. An app without a server uses
`BRAND.defaultTheme` only and drops the Brand page's save.

### `jimbo-ui.json` (in each app's repo root)

```json
{
  "version": "1.0.0",
  "webRoot": "apps/web",
  "reference": {
    "web/src/components/ui/kit.tsx": "apps/web/src/components/ui/kit.tsx",
    "web/src/routes/AppShell.tsx": "apps/web/src/routes/AppShell.tsx"
  }
}
```

`version` is the jimbo-ui version the app is on. Foundation and starter files
live at `webRoot` + their path. `reference` maps each reference file to the
app's equivalent, if it has one.

### Identity each app sets
App name (`index.html` title, `apple-mobile-web-app-title`, the PWA manifest),
`brand.config.ts`, `tokens.css`, the wordmark artwork, `favicon.svg`, app
icons and splash screens, and the dock's tabs (five or fewer, icon + one-word
label).

### Building it without this code
Everything below is specified in values, so another stack can reproduce it:
the three colours and the derivation formulas (section 3), type scale
(section 5), shell sizes (section 6), surface recipes (section 7), and the
component and pattern rules (sections 8–9).

---

## 2. Brand

### Voice
- Plain, short, a little wry. Say what something is and what happens next
  ("Remove this event from the group? It stays in your list on its own.").
- **Sentence case** everywhere — titles, buttons, tabs. No Title Case, no ALL
  CAPS (except `.eyebrow` labels, which are styled caps).
- Buttons are verbs: *Save*, *Add to group…* (an ellipsis means a sheet or
  choice follows).
- Name things the way the user does, never by internal names (a person
  manages *events*, not *event_series rows*).
- Empty states and confirmations say what survives or what to do next.

### Logo
- A two-line wordmark: the **main word** in the **accent** (primary) colour
  with an outline in the text colour (white on dark themes, near-black on
  light), and a **second line** in the **highlight** (secondary) colour.
  The built-in one is typeset in the display face from `BRAND.logo`; an app
  can swap in its own drawn lettering and keep the colour rules.
- It follows the theme everywhere it appears: top bar, sign-in, Brand page
  miniatures, favicon (the mark in the accent on the background colour).
- An uploaded logo (SVG/PNG/WebP/JPEG ≤ 1 MB) replaces the wordmark; an
  uploaded favicon replaces the recoloured one. Both can be reset to built-in.
- Minimum height 40 px (`size="sm"`), always on the page background or a card —
  never on a photo without a dark fade.

### Colour — the three source colours

| Colour | Default (Volt) | Used for |
| --- | --- | --- |
| **Accent** (primary) | `#A8FF3E` | Logo main word, primary buttons, active tab/pill, focus rings, links on hover, "done" states, text selection, numbers that matter, the favicon mark |
| **Highlight** (secondary) | `#FF3D6E` | Logo second line, dates (month on date blocks), map pins, count badges, warnings and errors, destructive hover |
| **Background** | `#141416` | The page. Surfaces, borders and every text colour are derived from it |

Status colours are **fixed tones**, not themed, because they carry meaning
(`Tone` and `TONES` in the kit). An app maps its own statuses onto them, with
the accent for the "done" one:

| Tone | Example status | Chip |
| --- | --- | --- |
| `accent` | Done | `bg-accent-950 text-accent border-accent-700` |
| `yellow` | Going / in progress | `bg-yellow-950 text-yellow-400 border-yellow-700` |
| `purple` | Maybe / saved | `bg-purple-950 text-purple-400 border-purple-800` |
| `red` | Missed / failed | `bg-red-950 text-red-400 border-red-800` |
| `muted` | Cancelled / archived | `bg-surface-2 text-text-subtle border-border` |

The offline banner is fixed yellow (`bg-yellow-950/95 text-yellow-200`).

---

## 3. Theme engine

Three colours in, every token out (`deriveColors()` in `src/lib/theme.ts`).
Tokens are CSS variables holding `R G B` channels (`--c-surface: 28 28 30`),
and Tailwind colours are `rgb(var(--c-name) / <alpha-value>)`, so opacity
modifiers work on every token (`bg-accent/15`, `border-border/60`).

**Never write a hex value in a component.** Use the token classes.

### Derivation

`mix(a, b, t)` = a → b by t (0 = a, 1 = b), per RGB channel.
`light` = WCAG luminance of the background > 0.4.
`away` = black on a light background, white on a dark one.
`text` = `#111113` on light, `#FAF8F4` on dark.
`on(c)` = `#141416` if luminance(c) > 0.35, else `#FFFFFF`.

Surfaces, borders and secondary text aren't fixed percentages: the engine
steps each one just far enough to meet a **contrast target** on that
background (`CONTRAST_TARGETS` in `theme.ts`), so a mid-blue page gets as
clear cards and labels as a near-black one.

- `stepTo(…, target)` = the smallest t where mix(bg, away, t) reaches the
  target contrast against a reference colour.
- `fadeTo(…, target)` = the largest t where mix(text, bg, t) still keeps the
  target contrast on cards.

| Token (`--c-…`) | Tailwind | Formula | Use |
| --- | --- | --- | --- |
| `bg` | `bg-bg` | background | Page |
| `surface` | `bg-surface` | mix(bg, away, *card*) where *card* = stepTo vs bg, **1.16:1** (at least 0.05 dark / 0.04 light) | Cards, sheets, the dock |
| `bg-deep` | `bg-bg-deep` | mix(bg, away, *card* × 0.35) | End of the card gradient |
| `surface-2` | `bg-surface-2` | stepTo vs surface, **1.14:1** | Fields, chips, hover rows |
| `border` | `border-border` | stepTo vs surface, **1.55:1** | Lines, outlines, card edges |
| `text` | `text-text-base` | text | Body text, logo outline |
| `text-muted` | `text-text-muted` | mix(text, bg, fadeTo **5:1** on surface, at most 0.4) | Secondary lines |
| `text-subtle` | `text-text-subtle` | mix(text, bg, fadeTo **3.8:1** on surface, at most 0.6) | Labels, hints, counts |
| `accent` | `*-accent` | accent | See section 2 |
| `accent-hover` | `*-accent-hover` | mix(accent, light ? black : white, 0.22) | Hover |
| `on-accent` | `text-on-accent` | on(accent) | Text/icons on accent fills |
| `accent-950/900/700` | `*-accent-950/900/700` | mix(bg, accent, 0.10 / 0.28 / 0.50) | Accent washes: done chip, banner glow |
| `highlight` | `*-highlight` | highlight | See section 2 |
| `highlight-hover` | `*-highlight-hover` | mix(highlight, light ? black : white, 0.20) | Hover |
| `on-highlight` | `text-on-highlight` | on(highlight) | Text on highlight fills (count badges) |
| `highlight-950/900/800` | `*-highlight-950/900/800` | mix(bg, highlight, 0.10 / 0.28 / 0.40) | Warning washes |

**Legacy class names:** apps from before 2.0 may use `accent-lime`,
`accent-pink`, `lime-950/900/700` and `rose-950/900/800`; they still work
(same tokens). New code uses `accent`, `highlight` and their `-950…` washes.

### Where else the theme goes
- **Page background:** `bg` plus two soft glows — accent at 6% from the top,
  highlight at 4% from the bottom (`radial-gradient(ellipse at top/bottom …)`,
  fixed).
- **Browser chrome:** `<meta name="theme-color">` = background;
  `color-scheme` = light or dark to match.
- **Text selection:** accent fill, on-accent text.
- **Maps:** `mapStyles(theme)` returns plain style rules (`MapStyle[]`, the
  shape Google Maps' `styles` option takes, no Maps types needed) tinting the
  map from bg → accent; pins are round,
  highlight-filled with a lighter ring (`markerIcon`).
- **Favicon:** `applyFavicon` swaps the template's `#0B0B0C` → background and
  `#A8FF3E` → accent.
- **Share images:** background, accent, highlight, text and the accent-900
  wash from the cached theme.

### Applying it
- `applyTheme(theme)` sets every variable on `<html>`, the theme-colour meta
  and `color-scheme`, and caches the theme (`<prefix>.theme`) and computed
  variables (`<prefix>.themeVars`) in localStorage, with the prefix from
  `brand.config.ts`.
- A small inline script in `index.html` applies the cached variables **before
  first paint**, so there is never a flash of the default colours.
- Light backgrounds: surfaces step *darker*, text flips to near-black. Photo
  viewers, banners over images and map pins stay dark/vivid on purpose.

### Readability (WCAG)

Checked live on the Brand page for the colours an admin picks:
- Body text ≥ 4.5:1 on the background.
- Accent and highlight ≥ 3:1 on the background.
- Text on an accent button ≥ 4.5:1.

Every template must also pass `node scripts/contrast.mjs --check`, measured
on cards: body text ≥ 7:1, muted ≥ 4.5:1, labels ≥ 3.5:1, card border
≥ 1.5:1, card against page ≥ 1.15:1. Mid-grey backgrounds limit body text
most: keep them dark enough (luminance under about 0.07) for 7:1.

---

## 4. Theme templates

The Brand page offers these (`foundation/src/lib/themes.ts`), grouped Dark /
Mid / Light, each drawn as a miniature of the app. Every one passes the
readability checks. An app whose default isn't one of them gets it as an
extra "Yours" card at the front.

**Dark**

| Name | Vibe | Accent | Highlight | Background |
| --- | --- | --- | --- | --- |
| Volt (default) | Lime + hot pink | `#A8FF3E` | `#FF3D6E` | `#141416` |
| Neon night | Cyan + magenta | `#2EF2FF` | `#FF2ED1` | `#0A0A12` |
| Acid | Loud yellow | `#F5FF2E` | `#FF5A1F` | `#0D0D0B` |
| Sunset strip | Orange on plum | `#FF8A3D` | `#FF3D7F` | `#1A0F1F` |
| Deep sea | Teal + coral | `#3DFFC5` | `#FF7A59` | `#071A1F` |
| Ultraviolet | Purple haze | `#B48CFF` | `#FF5FA2` | `#120F1C` |
| Ember | Gold + fire | `#FFB23D` | `#FF3D3D` | `#17110D` |
| Blackout | Monochrome | `#F2F2F2` | `#FF3D3D` | `#000000` |

**Mid** (coloured darks and mid-light greys/earths)

| Name | Vibe | Accent | Highlight | Background |
| --- | --- | --- | --- | --- |
| Slate | Frost + sand | `#88C0D0` | `#EBCB8B` | `#2E3440` |
| Denim | Yellow on blue | `#FFD23F` | `#EE6C4D` | `#23395B` |
| Forest | Gold + clay | `#E9C46A` | `#F4A261` | `#1F3A2E` |
| Burgundy | Rosé + butter | `#F7B2BD` | `#FFD166` | `#4A1C2B` |
| Dusk | Peach + mint | `#FFB4A2` | `#9DE0AD` | `#3D3B6B` |
| Concrete | Grey + lemon | `#FFE066` | `#FF8FA3` | `#45484D` |
| Fog | Navy + red | `#1E3A8A` | `#B91C1C` | `#C8CDD4` |
| Sage | Pine + wine | `#1F3D2B` | `#8B1E3F` | `#B7C9B0` |
| Clay | Plum + teal | `#3B1F5C` | `#0F4C5C` | `#D9B8A0` |

**Light**

| Name | Vibe | Accent | Highlight | Background |
| --- | --- | --- | --- | --- |
| Daylight | Green + pink | `#1F7A4D` | `#D6336C` | `#F6F4EF` |
| Gig poster | Cream + red | `#D7261E` | `#1E4FD7` | `#F3EAD6` |
| Newsprint | Black + red | `#111111` | `#E11D48` | `#FFFFFF` |
| Mint | Teal + rust | `#0F766E` | `#C2410C` | `#E6F4EE` |
| Blush | Raspberry + violet | `#BE185D` | `#6D28D9` | `#FCE8EE` |
| Sky | Cobalt + pink | `#1D4ED8` | `#DB2777` | `#E8F0FB` |
| Lemonade | Violet + red | `#7C3AED` | `#DC2626` | `#FFF7CC` |
| Peach | Rust + teal | `#C2410C` | `#0E7490` | `#FFE8D6` |

**Writing a new template:** on dark and mid-dark backgrounds use bright,
saturated accents; on light and mid-light ones use deep accents (luminance
roughly under 0.2). Accent and highlight should differ in hue, since they
sit side by side in the logo. Check all three readability ratios.

---

## 5. Typography

Fonts (Google Fonts): **Archivo** 500–900 for display, **Inter** 400–700 for
everything else, **JetBrains Mono** 400/600 for codes and hex values.

| Class | Size | Font | Use |
| --- | --- | --- | --- |
| `.h-page` | 30 → 36 px, line-height 1.05 | Archivo 800, tracking −0.015em | One per page, in `PageHeader` |
| `.h-section` | 20 → 22 px | Archivo 800 | Section titles |
| body | 15 px | Inter | Default text; row titles semibold |
| `.meta` | 14 px | Inter, text-muted | Second lines, helper text |
| `.label` | 14 px semibold | Inter, text-muted | Form label above a field |
| `.eyebrow` | 11 px caps, tracking 0.12em | Inter semibold, text-subtle | Label above a title, group labels |
| `font-display` + size | any | Archivo 800 | Big numbers |
| small UI | 10.5–12 px | Inter semibold/bold | Dock labels, badges, chips |

- The `→` in a size means phone → ≥ 640 px.
- Numbers use tabular figures (set on `body`) so counts and dates line up.
- Long titles: `line-clamp-2` in rows, `truncate` for single-line subtitles.
- Inputs are 16 px on phones so iOS doesn't zoom into them.

---

## 6. Layout and shell

- **Phone first.** Design at 375 px wide, then relax at `sm:` (≥ 640 px).
- **Installed-app feel:** `apple-mobile-web-app-capable`, translucent status
  bar, no tap highlight, `overscroll-behavior-y: contain` (own pull to
  refresh), smooth scrolling, pinch-zoom allowed.
- **Top bar:** sticky, 56 px (64 px on desktop) plus the top safe area,
  `bg-bg/90` frosted (`backdrop-blur-xl`), bottom border. Left: logo (and text
  tabs on desktop). Right: 40 px round buttons — search (outlined), **+ add**
  (accent fill), account (avatar initial in an accent circle).
- **Content:** `max-w-5xl`, `px-4` (`sm:px-6`), `pt-6`; bottom padding of
  6.5 rem + the bottom safe area on phones so nothing hides under the dock.
- **Tab dock (phones):** floats 12 px above the bottom safe area, `max-w-md`,
  a 5-column grid in a 28 px-radius pill: `bg-surface/75`, `border-white/10`,
  `ring-1 ring-black/40`, `backdrop-blur-2xl backdrop-saturate-150`, deep
  shadow. Each tab is 56 px tall with a 22 px-radius active pill, icon above a
  10.5 px label; active = accent pill, filled icon, bold label. Presses scale
  to 0.92. Tapping the active tab scrolls to the top. A gradient fade from
  `bg` sits behind it so content dissolves under the dock.
- **Things pinned to the bottom** (save bar, select-mode action bar, upload
  ring) sit above the dock: `bottom-[calc(5.75rem+env(safe-area-inset-bottom))]`,
  `sm:bottom-6`.
- **Page anatomy:** `PageHeader` (eyebrow, title, count, actions) → filters →
  content. Detail pages start with a full-width `Hero`/`Banner` (blurred
  image, back button top-left, status top-right, actions below).
- **Spacing:** `space-y-6`–`8` between sections, `space-y-3` inside one,
  `gap-3` in grids, `p-4 sm:p-5` inside cards; grids are 2 columns on phones,
  3 from `sm:`.
- **No horizontal scroll strips.** Wrap, use a select on phones, or a sheet.
- **Touch targets ≥ 44 px** (`h-11`/`h-12` on phones), rows ≥ 64 px.

### Layers (z-index)

| z | What |
| --- | --- |
| 30 | Pull-to-refresh spinner, dock fade, sticky sub-bars (offline banner) |
| 40 | Top bar, tab dock, floating save/action bars |
| 50 | Sheets (with a `bg-black/70` blurred backdrop) |
| 100 | Full-screen image viewer (`bg-black/90`) |

---

## 7. Surfaces, depth and motion

| Thing | Recipe |
| --- | --- |
| `.card` | 18 px radius, `border-border` (full strength), gradient `surface → bg-deep` top to bottom, inner top highlight `inset 0 1px 0 rgba(255,255,255,.05)`, soft drop `0 12px 32px -16px rgba(0,0,0,.7)` |
| `.field` | 14 px radius, `bg-surface-2`, `border-border`, 15 px text, `px-4`; focus = accent border + 2 px accent ring at 20% |
| `.btn` | Fully round, 44 px tall on phones (40 px desktop), `px-5`, 15 px semibold; `.btn-sm` 36 px (32 px desktop); `lg` 48 px |
| `.btn-primary` | Accent fill, on-accent text, accent-hover on hover |
| `.btn-secondary` | `bg-surface-2`, border, border lightens on hover |
| `.btn-ghost` | Muted text, `surface-2` on hover |
| `.btn-danger` | Muted text, red wash and highlight text on hover |
| `.chip` | Fully round, `bg-surface-2`, border, 14 px medium, muted |
| Floating bars and the dock | `bg-surface/75–95`, `backdrop-blur-xl/2xl`, `border-white/10` or `border-border`, `shadow-2xl shadow-black/50` |
| Sheet | Rendered into `<body>` through a portal (so a parent's spacing or transform can't shift it); bottom sheet on phones (top corners 24 px, grab handle 40×6 px, max 92 dvh), centred dialog on desktop (24 px radius, `max-w-lg` / `max-w-xl`) |
| Radii scale | 6 · 8 · 10 · 14 (`xl`) · 18 (`2xl`) · 22/28 (dock) · full (buttons, pills, badges, avatars) |

**Motion:** quick and physical, never decorative.
- Presses: `active:scale-95` on buttons, `0.92` on dock tabs, `0.97` on cards.
- Colour changes: `transition-colors` (≈150 ms); dock tabs 200 ms.
- Loading: skeletons pulse; spinners only inside small round buttons
  (pull to refresh, uploads).
- No page transitions, no parallax, no bouncing.

---

## 8. Components (`components/ui/kit.tsx` unless noted)

| Component | Use it for |
| --- | --- |
| `PageHeader` | Every index page's title row |
| `Hero` / `Banner` | Detail page header over a blurred image |
| `Section` | A titled card holding one block of content |
| `List` + `ListGroupLabel` | A card of rows, optionally grouped (by month) |
| `EventRow` | A dated item. `DateBlock` on the left, a `status` dot (`{ tone, label }`); `selected`/`onSelect` for select mode |
| `EntityRow` | A named thing with an avatar (a person, a place) |
| `DateBlock` | Ticket-style date: highlight month over a big display-font day |
| `MediaCard` | Image-led grid card (`aspect="portrait"` for posters) |
| `LinkCard` | A card that navigates (eyebrow / title / sub); `accent` for the one to notice |
| `StatTile` / `StatGrid` | Headline numbers (`accent="lime"` / `"pink"` for emphasis) |
| `RankedList` | Top-N lists with counts |
| `SearchField`, `SelectField` | Search and single-choice filters (select on phones) |
| `Tabs` | 2–4 mutually exclusive views (segmented) |
| `PillTabs` | Filters on desktop |
| `Pager` | Paging long lists |
| `Sheet` | **The** modal: bottom sheet on phones, dialog on desktop |
| `ImageViewer` | Full-screen image (tap or Escape to close) |
| `Badge` / `Tone` / `TONES` | A status as a chip, in one of the fixed tones |
| `EmptyState` | No data — say what's missing and offer the next step |
| `Loading` | Skeleton shaped like a page (never a bare spinner) |
| `ViewSwitch` | Two or three views of one page as links (List ⇄ Map) |
| `Wordmark` (`components/Wordmark.tsx`) | The logo, `sm`/`md`/`lg`/`xl` (40/60/88/120 px tall) |
| `ColorPicker` (`components/ColorPicker.tsx`) | Inline colour picker: saturation/brightness field, hue slider (28–36 px thumbs, drag anywhere), one row of 8 quick swatches, hex box with a preview chip. Never the native `<input type=color>` — it opens a different dialog on every platform |
| `ThemeCard` (`routes/BrandPage.tsx`) | A theme shown as a miniature of the app: logo, eyebrow, a date-row card, a primary and a secondary button, then name and vibe |
| `Button` (`ui/button.tsx`) | `primary` (one per view), `secondary`, `ghost`, `danger`; `sm`/`md`/`lg` |

CSS classes for plain elements: `.card`, `.field`, `.btn …`, `.chip`,
`.link-action`, `.eyebrow`, `.meta`, `.label`, `.h-page`, `.h-section`.

Adding a component: build it from tokens, put it in the kit, add it to the
Style guide page, and list it here.

---

## 9. Patterns

- **Theme editor:** templates first (tap to try; the whole app changes live),
  then *Make it yours* — tap which colour to change (round swatch tabs), drag
  in the picker. Readability warnings appear inline. Nothing is saved until
  *Save*; leaving the page restores the saved theme.
- **Unsaved changes:** a floating save bar above the dock (*Undo* / *Save*)
  appears only while there is something to save; editors preview live.
- **Choosing a look:** show choices as miniatures of the real thing, not
  names in a list.
- **Select mode:** a *Select* button turns rows into toggles (`EventRow
  onSelect`); a floating action bar above the dock shows the count and action.
- **Sheets for choices**, not new pages, when the user comes straight back
  (pickers, add flows, search).
- **Confirm before destructive or surprising actions**, in plain words; say
  what survives ("Its events stay in your list").
- **Background work** (uploads, syncing) shows as a small progress ring in a
  corner: never block the
  screen; allow pause/cancel; warn before closing with work pending.
- **Gestures:** pull to refresh at the top of a page; horizontal swipe between
  siblings (days of a multi-day event); swipe down to close full-screen media. Mark
  carousels/maps `data-no-swipe`.
- **Lists:** newest first for the past, soonest first for the future; group by
  month; status as a quiet dot in rows, a badge on detail pages.
- **Counts on tabs:** a small highlight badge with on-highlight text.
- **Errors:** inline, near what failed, in the highlight colour; keep the
  user's input.
- **Offline / pending:** a slim yellow banner under the top bar.

---

## 10. Icons

- Inline SVG, `stroke="currentColor"`, stroke width 2–2.25, round caps and
  joins, 24 px in the dock and top bar, 16–20 px inline.
- Active dock icons get a 22% fill (`fill="currentColor" fillOpacity={0.22}`).
- Icon-only buttons need `aria-label` (and `title` for shortcuts).

---

## 11. Accessibility checklist

- Readability targets in section 3 (the Brand page warns when they're missed;
  every template passes).
- Focus is visible (`focus:ring-2 ring-accent/20` on fields,
  `focus-visible:ring-accent/50` on buttons).
- Every interactive element is a real `button`/`a`; toggles use
  `aria-pressed`/`role="switch"`; tabs use `role="tab"`/`aria-selected`;
  the picker's field and hue bar are `role="slider"`.
- Images: meaningful ones get `alt`; decorative ones `alt=""`.
- Nothing is hover-only — touch screens show controls (`[@media(hover:none)]`).

---

## 12. Don'ts

- No raw hex, no Tailwind palette colours for brand surfaces (`bg-zinc-900`,
  `text-white` on cards or on accent/highlight fills) — use tokens and the
  `on-*` colours.
- No second modal style, no full-screen blocking spinners.
- No horizontal scrolling rows, no hover-only actions.
- No native colour inputs, and no browser alerts except as a last-resort
  error.
- No new font sizes outside the scale in section 5.

---

## Change log of this guide

Versions and what apps must do for each are in the repo's `CHANGELOG.md`.

- **1.0.0 (2026-10-23)** — First release: three-colour
  theme engine, 25 templates, kit, shell, patterns; foundation / starter /
  reference files; `jimbo-ui.json`; the skill and its update workflow.
- **1.1.0 (2026-10-23)** — Contrast targets: surfaces, borders and secondary
  text step to meet ratios on every background instead of fixed percentages;
  card borders at full strength; Concrete deepened to `#45484D`;
  `scripts/contrast.mjs`. The showcase. Sheets render through a portal.
  `mapStyles` no longer needs Google Maps types.
- **2.0.0 (2026-10-23)** — Fully generic: neutral kit (`Badge`/`Tone`
  instead of app statuses, `ViewSwitch`), `AppShell` takes tabs and actions,
  typeset `Wordmark` from `BRAND.logo`, neutral favicon and showcase content,
  generic colour class names (`accent`, `highlight`) with the old ones kept as
  legacy aliases, server contract described instead of shipped.
