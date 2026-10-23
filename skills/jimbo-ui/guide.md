# jimbo.ui standards

How apps built on **jimbo.ui** look, read and behave, written as a recipe:
with this guide you can build an app that looks and feels like the others,
with its own name and colours, whether or not you copy the code. Generic
implementations of everything below are in the repo's `reference/` folder.

- **The rules:** this guide. It's versioned with the jimbo-ui repo; see
  `CHANGELOG.md` for what changed in each version and what apps must do.
- **The living picture:** each app's **Style guide** page (`/admin/style`)
  renders every shared component in that app's current theme.
- **Theme:** two to four colours (accent and background always; highlight
  and support set or inferred), each with lighter and darker shades, picked
  from Everyday, Flags or Holidays templates or fine-tuned on each app's
  **Brand & theme** admin page.
- **Look:** depth, not flat fills — lit gradients, solid surfaces with a
  light frost, softly rounded corners (not pills), soft colour orbs, and
  circles of the theme's colours as a recurring motif.
- **Type:** sans (Archivo and Inter), mono (JetBrains Mono) or serif
  (Fraunces and Source Serif 4), chosen separately for headings and body.

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
  `node scripts/tokens.mjs <accent> <highlight|-> <background> [support|-]`
  (`-` = inferred).
- `public/favicon.svg` — three overlapping circles. Keep `#0B0B0C` for the
  background, `#A8FF3E`, `#FF3D6E` and `#2EC5FF` for the accent, highlight
  and support so `applyFavicon` can recolour it.

**Showcase:** `showcase/` is a small app built only from a release's code
(reference, then foundation and starter, then stand-ins for the server parts
in `showcase/overrides/`). It runs the real Brand page, Style guide and kit,
plus Home, List and Detail demo pages, with the theme saved in the browser.
`npm --prefix showcase run dev` runs it locally; each release publishes it as
a private page (URL in the README) — the way to see what an app would get
without having one.

**Reference (adapt to the app):** the UI kit (`kit.tsx`), the app shell
(`AppShell.tsx`: pass tabs, top-bar actions and routes), Brand page, Style
guide page, `HeaderTitle.tsx` (the app's name as header text), `useBrand.ts`, and
`index.html` (pre-paint script, fonts, PWA tags).

**Server side (optional):** an app that lets admins change the theme stores
the colours and any uploaded favicon, and serves them:
`GET /public/theme` → `{ theme: { accent, highlight, background, support }
(null = default; `highlight` and `support` may be missing — inferred),
faviconUrl }`; admin-only `PUT /admin/theme` (accent and background as
`#RRGGBB`, plus optional `highlight` and `support` — store what's sent, and
leave missing ones missing so they stay inferred), `DELETE /admin/theme` (back to defaults), and
`POST`/`DELETE /admin/theme/favicon` (SVG, PNG, WebP or
JPEG ≤ 1 MB; refuse SVGs with scripts, event handlers or foreign objects).
The app's API client exposes these as `getTheme`, `setTheme`, `resetTheme`,
`uploadBrandAsset`, `removeBrandAsset`. An app without a server uses
`BRAND.defaultTheme` only and drops the Brand page's save.

### `jimbo-ui.json` (in each app's repo root)

```json
{
  "version": "0.6.0",
  "webRoot": "apps/web",
  "reference": {
    "web/src/components/ui/kit.tsx": "apps/web/src/components/ui/kit.tsx",
    "web/src/routes/AppShell.tsx": "apps/web/src/routes/AppShell.tsx"
  }
}
```

`version` is the jimbo-ui version the app is on. At the start of every
Claude Code session in the app, the jimbo-ui plugin compares it with the
installed release and says when there are newer guidelines to bring in (see
"Versions" below). Foundation and starter files
live at `webRoot` + their path. `reference` maps each reference file to the
app's equivalent, if it has one.

### Versions

jimbo.ui is a work in progress, so it's on **0.x**: a release that asks apps
to change their own code bumps the minor (0.6.0 → 0.7.0); fixes and small
additions bump the patch (0.6.0 → 0.6.1). 1.0.0 comes when it's called
stable. Work collects under "Unreleased" in `CHANGELOG.md` and is numbered
only when a release is asked for, not per change. Releases tagged
1.0.0–3.1.0 before the renumbering are 0.1.0–0.5.0; an app still on an old
number is on the matching 0.x release. The version is stated in the plugin
manifests, the skill (`This is jimbo.ui X`) and the newest `CHANGELOG.md`
entry, which always agree (`scripts/versions.mjs`). An app is behind when its
`jimbo-ui.json` version is lower than the installed plugin's: the plugin's
session-start check (`hooks/check-version.mjs`) and the skill both say so,
list what's new, and offer a preview or the update. A new release reaches a
machine when the plugin is refreshed
(`claude plugin marketplace update jimbo-ui`, then
`claude plugin update jimbo-ui@jimbo-ui`).

### Identity each app sets
App name (`index.html` title, `apple-mobile-web-app-title`, the PWA manifest),
`brand.config.ts` (the name is the header text), `tokens.css`, `favicon.svg`, app
icons and splash screens, and the dock's tabs (five or fewer, icon + one-word
label).

### Building it without this code
Everything below is specified in values, so another stack can reproduce it:
the colours and the derivation formulas (section 3), type scale
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

### Header text (no logo)
- The brand is the app's **name as header text** (`HeaderTitle`), not a logo:
  `BRAND.name` set in the display face (the headings style, weight 800, tracking −0.02em) in the
  text colour. A **dot** in the name takes the **accent** — `jimbo.ui` —
  which is the brand's one flourish.
- Sizes: 22 px in the top bar (`sm`), 30 px (`md`), 44 px (`lg`) for brand
  moments like a sign-in screen or the Style guide.
- It follows the theme everywhere: top bar, sign-in, Brand page miniatures.
- The **favicon** is the one graphic: the theme's colours as overlapping
  circles on the background, recoloured with the theme; an uploaded favicon (SVG, PNG,
  WebP or JPEG ≤ 1 MB) replaces it and can be reset to the built-in one.

### Colour — two to four source colours

| Colour | Default (Volt) | Used for |
| --- | --- | --- |
| **Accent** (primary) | `#A8FF3E` | The dot in the header text, primary buttons, active tab/pill, focus rings, links on hover, "done" states, text selection, numbers that matter, the favicon mark |
| **Highlight** (secondary, optional) | `#FF3D6E` | Dates (the month band on date tickets), map pins, count badges, warnings and errors, destructive hover, second place |
| **Support** (third, optional) | `#2EC5FF` | Page eyebrows (`PageHeader`), avatar initials (`EntityRow`), third place in ranked lists, a stat or banner glow that isn't the main one, the page's bottom-left glow |
| **Background** | `#141416` | The page. Surfaces, borders and every text colour are derived from it |

**Two is enough.** A theme always sets the accent and background. Leave out
the highlight and it's inferred from the accent (a split complement); leave
out the support and it's inferred from the others (the hue furthest from
both). Four is the most.

**Spread the colours.** A page should show more than the accent: the accent
for what to tap, the highlight for dates and alerts, the support for labels
and people. Don't make the highlight or support white or grey — that's the
text colour, and the page goes flat.

**Depth, not flat fills.** Each brand colour comes with lighter and darker
shades (section 3). Solid shapes get a **lit fill** — lighter at the top,
darker at the bottom, with a bright inner top edge — and primary buttons a
soft glow in the accent's dark shade. Floating things are **lightly
frosted**: mostly solid, a soft blur, a crisp border and a lit top line — never
see-through glass. Corners are **softly rounded, not pills**: circles are
kept for the motif (avatars, dots, orbs, round icon buttons). Cards carry a breath of the accent (top left)
and support (bottom right).

**Colour comes from opaque shapes, not thin washes.** A faint wash of a
colour over a background of the opposite hue goes grey (amber over blue,
pink over green) — that's what makes a theme look flat. Put brand colour on
solid, lit things instead: the date ticket's month band, lit avatars and
pills, glowing status dots, orbs, coloured text. Washes are for tinting the
same hue family (done chips, warnings), not for adding colour.

**The circle motif.** The theme's colours as circles turn up here and there:
`ThemeDots` before a page eyebrow and in empty states, a small orb beside a
stat's label, lit-circle avatars, colour circles on theme tiles, three soft
orbs behind the page, and the favicon. Keep them small and few — a motif, not
wallpaper.

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

Two to four colours in, every token out (`deriveColors()` in `src/lib/theme.ts`).
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
`highlight` = the theme's highlight, or `deriveHighlight(theme)`: the
accent's hue + 150°, saturation at least 0.6, lightness starting at the
accent's and stepping away from the page until it reaches 3.5:1 (a grey
accent gets a red).
`support` = the theme's support, or `deriveSupport(theme)`: the hue (in 5°
steps) furthest from both the accent's and the highlight's (ignoring greys),
saturation the average of theirs (at least 0.55), lightness stepping away from
the page until it reaches 5.4:1 (4.5:1 on cards).
`fullTheme(theme)` fills both in; `ownColours(theme)` drops the inferred ones
(what to save).

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
| `surface` | `bg-surface` | mix(bg, away, *card*) where *card* = stepTo vs bg, **1.2:1** (at least 0.05 dark / 0.04 light) | Cards, sheets, the dock |
| `bg-deep` | `bg-bg-deep` | mix(bg, away, *card* × 0.35) | End of the card gradient |
| `surface-2` | `bg-surface-2` | stepTo vs surface, **1.15:1** | Fields, chips, hover rows |
| `border` | `border-border` | stepTo vs surface, **1.8:1** | Lines, outlines, card edges, row dividers |
| `text` | `text-text-base` | text | Body text, header text |
| `text-muted` | `text-text-muted` | mix(text, bg, fadeTo **5:1** on surface, at most 0.4) | Secondary lines |
| `text-subtle` | `text-text-subtle` | mix(text, bg, fadeTo **3.8:1** on surface, at most 0.6) | Labels, hints, counts |

Each brand colour *c* — `accent`, `highlight`, `support` — gets the same
family of tokens:

| Token (`--c-…`) | Tailwind | Formula | Use |
| --- | --- | --- | --- |
| *c* | `*-c` | the colour | See section 2 |
| *c*`-hover` | `*-c-hover` | mix(c, light ? black : white, 0.20) | Hover |
| `on-`*c* | `text-on-c` | on(c) | Text/icons on fills of it |
| *c*`-lighter` / `-light` | `*-c-lighter`, `*-c-light` | mix(c, white, 0.50 / 0.22) | Highlights on spheres, glows, light ends |
| *c*`-dark` / `-darker` | `*-c-dark`, `*-c-darker` | mix(c, black, 0.22 / 0.50) | Shadows, glows under buttons, dark ends |
| *c*`-top` → *c*`-bottom` | `from-c-top to-c-bottom` | dark on-text: mix(c, white, 0.30) → c; white on-text: c → mix(c, black, 0.28) | The lit fill (`.lit-c`, `.btn-primary`). It only moves away from the on-colour, so text on it never gets harder to read |
| *c*`-950/900/800/700` | `*-c-950…700` | mix(bg, c, 0.10 / 0.28 / 0.40 / 0.50) | Washes: done chip, warnings, banner glows |

**Legacy class names:** apps from before 0.3 may use `accent-lime`,
`accent-pink`, `lime-950/900/700` and `rose-950/900/800`; they still work
(same tokens). New code uses `accent`, `highlight` and their `-950…` washes.

### Where else the theme goes
- **Page background:** `bg` with three soft orbs — accent (20%) top left,
  highlight (16%) right, support (16%) bottom left (`radial-gradient(circle
  at …)`) — over a fade to `bg-deep`, all fixed. Cards are 90% opaque, so the
  orbs tint them as they pass behind.
- **Browser chrome:** `<meta name="theme-color">` = background;
  `color-scheme` = light or dark to match.
- **Text selection:** accent fill, on-accent text.
- **Maps:** `mapStyles(theme)` returns plain style rules (`MapStyle[]`, the
  shape Google Maps' `styles` option takes, no Maps types needed) tinting the
  map from bg → accent; pins are round,
  highlight-filled with a lighter ring (`markerIcon`).
- **Favicon:** `applyFavicon` swaps the template's `#0B0B0C` → background,
  `#A8FF3E` → accent, `#FF3D6E` → highlight and `#2EC5FF` → support.
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

Checked live on the Brand page for the colours an admin picks (and for the
inferred ones, which are built to pass):
- Body text ≥ 4.5:1 on the background.
- Accent and highlight ≥ 3:1 on the background.
- Support ≥ 4.5:1 on cards (it's used for small text).
- Text on an accent button ≥ 4.5:1.

Every template must also pass `node scripts/contrast.mjs --check`, measured
on cards: body text ≥ 7:1, muted ≥ 4.5:1, labels ≥ 3.5:1, card border
≥ 1.75:1, card against page ≥ 1.19:1 — and the three above, plus
**colours apart**: accent, highlight and support at least 20 apart from each
other (CIE76 ΔE), so no template reads as one colour. Mid-grey backgrounds limit body text
most: keep them dark enough (luminance under about 0.07) for 7:1.

---

## 4. Theme templates

The Brand page offers these (`foundation/src/lib/themes.ts`) in three sets —
**Everyday** (Dark / Mid / Light), **Flags** and **Holidays** — chosen with
`Tabs`, each template drawn as a miniature of the app. Every one passes the
readability checks. An app whose default isn't one of them gets it as an
extra "Yours" card at the front of Everyday. `TEMPLATE_SETS` has the sets;
`TEMPLATE_GROUPS` is every group in one list; `sameTheme` compares two themes.

**Dark**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |
| Volt (default) | Lime, hot pink, sky | `#A8FF3E` | `#FF3D6E` | `#2EC5FF` | `#141416` |
| Neon night | Cyan, magenta, lemon | `#2EF2FF` | `#FF2ED1` | `#FFE53D` | `#0A0A12` |
| Acid | Yellow, orange, violet | `#F5FF2E` | `#FF5A1F` | `#B98CFF` | `#0D0D0B` |
| Sunset strip | Orange, pink, teal | `#FF8A3D` | `#FF3D7F` | `#3DDCC8` | `#1A0F1F` |
| Deep sea | Teal, coral, periwinkle | `#3DFFC5` | `#FF7A59` | `#9BB0FF` | `#071A1F` |
| Ultraviolet | Purple, pink, mint | `#B48CFF` | `#FF5FA2` | `#5CF2B8` | `#120F1C` |
| Ember | Gold, fire, ice | `#FFB23D` | `#FF3D3D` | `#7FD4FF` | `#17110D` |
| Blackout | White, red, blue | `#F2F2F2` | `#FF3D3D` | `#4D94FF` | `#000000` |
| Two-tone | Periwinkle; the rest inferred | `#9DB2FF` | inferred | inferred | `#101418` |

**Mid**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |
| Slate | Frost, sand, heather | `#88C0D0` | `#EBCB8B` | `#D3AECB` | `#2E3440` |
| Denim | Yellow, coral, aqua | `#FFD23F` | `#EE6C4D` | `#8EE6DC` | `#23395B` |
| Forest | Gold, clay, sky | `#E9C46A` | `#F4A261` | `#AEDBF5` | `#1F3A2E` |
| Burgundy | Rosé, butter, mint | `#F7B2BD` | `#FFD166` | `#A6EBCF` | `#4A1C2B` |
| Dusk | Peach, mint, butter | `#FFB4A2` | `#9DE0AD` | `#FFE38A` | `#3D3B6B` |
| Concrete | Lemon, pink, sky | `#FFE066` | `#FF8FA3` | `#9AD8FF` | `#45484D` |
| Fog | Navy, red, pine | `#1E3A8A` | `#B91C1C` | `#14532D` | `#C8CDD4` |
| Sage | Pine, wine, navy | `#1F3D2B` | `#8B1E3F` | `#1E2F6B` | `#B7C9B0` |
| Clay | Plum, teal, rust | `#3B1F5C` | `#0F4C5C` | `#6B260B` | `#D9B8A0` |

**Light**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |
| Daylight | Green, pink, violet | `#1F7A4D` | `#D6336C` | `#5B3FD1` | `#F6F4EF` |
| Gig poster | Red, blue, green | `#D7261E` | `#1E4FD7` | `#0F6B4F` | `#F3EAD6` |
| Newsprint | Black, red, blue | `#111111` | `#E11D48` | `#1D4ED8` | `#FFFFFF` |
| Mint | Teal, rust, purple | `#0F766E` | `#C2410C` | `#6D28D9` | `#E6F4EE` |
| Blush | Raspberry, violet, teal | `#BE185D` | `#6D28D9` | `#0B5E57` | `#FCE8EE` |
| Sky | Cobalt, pink, green | `#1D4ED8` | `#DB2777` | `#116632` | `#E8F0FB` |
| Lemonade | Violet, red, teal | `#7C3AED` | `#DC2626` | `#0B5C73` | `#FFF7CC` |
| Peach | Rust, teal, plum | `#C2410C` | `#0E7490` | `#86198F` | `#FFE8D6` |

**Flags**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |
| Canada | Red, white and pine | `#D52B1E` | `#8E1B14` | `#1F5E3A` | `#FFFFFF` |
| USA | Red, white and blue | `#E0283F` | `#7DB4FF` | `#F2F2F2` | `#0B1B3D` |
| Italy | Green, white and red | `#007A3D` | `#CD212A` | `#1F4E8C` | `#FAFAF5` |
| Germany | Black, red and gold | `#FFCE00` | `#FF4B3E` | `#F2F2F2` | `#0E0E0E` |
| Ireland | Green, white and orange | `#3DDC84` | `#FF9F43` | `#F5F5F0` | `#0C2418` |
| Sweden | Yellow and amber on blue | `#FECC02` | `#FF9F1C` | `#A8DCFF` | `#004B87` |
| Jamaica | Black, gold and green | `#FED100` | `#2BB24C` | `#FF7A45` | `#0A0A0A` |
| Brazil | Green, yellow and blue | `#FFDF00` | `#9DBBFF` | `#FFFFFF` | `#004D26` |
| Mexico | Green, white and red | `#006847` | `#CE1126` | `#7A4A12` | `#FFFFFF` |
| India | Saffron, white and green | `#FF9933` | `#46C35A` | `#F2F2F2` | `#0A0F3D` |
| South Africa | Green, gold, red and blue | `#1FC77A` | `#FFB612` | `#6E9BFF` | `#0B0B0B` |

**Through the year**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |
| Lunar new year | Gold and jade on red | `#FFD24A` | `#FF9A7A` | `#5FE0B4` | `#5A0A0A` |
| Valentine's | Red, pink and purple | `#C9184A` | `#D63384` | `#6A23B0` | `#FFF0F3` |
| St Patrick's | Shamrock, gold and sky | `#4ADE80` | `#FFD54A` | `#8CC4FF` | `#0B2016` |
| Easter | Violet, pink and green | `#6D28D9` | `#BE185D` | `#0F6630` | `#F4EEFF` |
| Pride | Yellow, red and blue | `#FFD93D` | `#FF4D6D` | `#4DA3FF` | `#121212` |
| Halloween | Pumpkin, purple and slime | `#FF7A1A` | `#B266FF` | `#8CFF4F` | `#120D17` |
| Diwali | Marigold, magenta and teal | `#FFB020` | `#FF3DA5` | `#2DD4BF` | `#1A0B2E` |
| Harvest | Pumpkin, mustard and sage | `#FF9A3C` | `#E8C04A` | `#A7CC94` | `#1E140C` |
| Hanukkah | Blue, silver and gold | `#5AA9FF` | `#B9D3F5` | `#FFC94D` | `#0A1838` |
| Christmas | Red, gold and green | `#DC1F2A` | `#FFC94D` | `#3FBF6F` | `#0B1A12` |
| Christmas morning | Red and green on snow | `#C8102E` | `#146B3A` | `#6F5000` | `#FFF9F5` |
| New year's eve | Champagne, fuchsia and ice | `#F2C14E` | `#FF3DA5` | `#5BC0FF` | `#0A0A0F` |

**Yours**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |

Flags are named for the country; holidays run through the year in order.
"Inferred" means the template leaves that colour to the engine (Two-tone shows
a two-colour theme). Each theme tile shows its colours as circles under the
miniature, inferred ones with a dashed ring.

**Writing a new template:** on dark and mid-dark backgrounds use bright,
saturated colours; on light and mid-light ones use deep ones (luminance
roughly under 0.2). Accent, highlight and support should differ in hue, since
they sit side by side on every page — and none of them white or grey (that's
the text colour; Sweden got amber, not white, for this reason). Leaving
highlight or support out works; a chosen one looks better. Red accents on dark pages are tricky:
a bright red gets white button text below 4.5:1, so use a deeper red (about
`#DC1F2A`) or make the red the highlight. Run `node scripts/contrast.mjs
--check`.

---

## 5. Typography

**Type styles.** A theme picks one style for headings and one for body text
(`Theme.fonts: { headings, body }`, both default `sans`; `FONT_STYLES` in
`theme.ts`). They're set as `--font-display` and `--font-body`, which
Tailwind's `font-display` and `font-body` read, so every page follows.

| Style | Headings | Body | Feel |
| --- | --- | --- | --- |
| `sans` (default) | **Archivo** 800 | **Inter** 400–700 | Bold and clean |
| `mono` | **JetBrains Mono** 800 | **JetBrains Mono** 400–700 | Technical, terminal |
| `serif` | **Fraunces** 800 | **Source Serif 4** 400–700 | Editorial, warm |

Mixing works: serif headings over sans body is the most common pairing; mono
throughout suits tools. Sans loads from `index.html`; `applyTheme` loads the
others from Google Fonts when picked (`loadFonts`). An app whose default uses
mono or serif adds those families to `index.html` and passes `--headings=` /
`--body=` to `scripts/tokens.mjs`. **JetBrains Mono** 400/600 is also always
used for codes and hex values (`font-mono`). Below, "Archivo" and "Inter"
mean the headings and body styles.

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
  `bg-bg/90` frosted (`backdrop-blur-xl`), bottom border. Left: the header text (and text
  tabs on desktop). Right: 40 px round buttons — search (outlined), **+ add**
  (accent fill), account (avatar initial in an accent circle).
- **Content:** `max-w-5xl`, `px-4` (`sm:px-6`), `pt-6`; bottom padding of
  6.5 rem + the bottom safe area on phones so nothing hides under the dock.
- **Tab dock (phones):** floats 12 px above the bottom safe area, `max-w-md`,
  a 5-column grid in a 20 px-radius slab: `bg-surface/95`, `border-border`,
  `ring-1 ring-black/30`, `backdrop-blur-md`, a lit top line, deep
  shadow. Each tab is 56 px tall with a 14 px-radius active tab, icon above a
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
- **Touch targets ≥ 44 px** (`h-11`/`h-12` on phones), rows ≥ 76 px (`py-3.5`), each divided from the next by an etched line.

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
| `.card` | 14 px radius, `border-border` (full strength), gradient `surface → bg-deep` top to bottom at 97%, under a 9% accent glow from the top left and a 9% support glow from the bottom right; inner top highlight `inset 0 1px 0 rgba(255,255,255,.06)`, soft drop `0 12px 32px -16px rgba(0,0,0,.7)` |
| `.glass` / `.card-glass` | Lightly frosted: `bg-surface/90`, `backdrop-blur-md`, `border-border`, inner top highlight `rgba(255,255,255,.08)`, soft drop. For tabs, the secondary top-bar buttons, the pager and anything over a banner |
| `.orb-accent/highlight/support` | A brand colour as a lit sphere: `radial-gradient(circle at 32% 28%, c-lighter, c 48%, c-darker)`, fully round. Size it with utilities. The circle motif |
| `.divide-etched` | Lines between stacked items, on the parent like `divide-y`: a full-strength `border` line with a faint light line under it (`inset 0 1px 0 rgba(255,255,255,.05)`). It also reaches one level down, so rows grouped in wrappers (a month's label and rows) are divided too. Lists, ranked lists |
| `.lit-accent/highlight/support` | The lit fill: `from-c-top to-c-bottom` with `on-c` text. Active tabs and pills, avatars, count badges |
| `.field` | 11 px radius, `bg-surface-2`, `border-border`, 15 px text, `px-4`; focus = accent border + 2 px accent ring at 20% |
| `.btn` | 10 px radius (`rounded-control`), 44 px tall on phones (40 px desktop), `px-5`, 15 px semibold; `.btn-sm` 36 px (32 px desktop); `lg` 48 px |
| `.btn-primary` | Lit accent fill (`accent-top → accent-bottom`), on-accent text, inner top highlight `rgba(255,255,255,.28)`, glow `0 8px 20px -10px accent-dark/90%` that grows on hover |
| `.btn-secondary` | `bg-surface-2`, border, inner top highlight, border lightens on hover |
| `.btn-ghost` | Muted text, `surface-2` on hover |
| `.btn-danger` | Muted text, red wash and highlight text on hover |
| `.chip` | 8 px radius, `bg-surface-2`, border, 14 px medium, muted |
| Top bar | `bg-bg/90`, `backdrop-blur-md`, `border-border` |
| Floating bars and the dock | `bg-surface/95`, `backdrop-blur-md`, `border-border`, lit top line, deep shadow; the dock is a 20 px-radius slab and its active tab a 14 px-radius accent gradient (25% → 10%) with an accent top edge |
| Sheet | Solid `bg-bg`, `border-border`. Rendered into `<body>` through a portal (so a parent's spacing or transform can't shift it); bottom sheet on phones (top corners 18 px, grab handle 40×6 px, max 92 dvh), centred dialog on desktop (18 px radius, `max-w-lg` / `max-w-xl`) |
| Radii scale | 4 (`sm`) · 6 (`md`: badges) · 8 (`lg`: chips, tabs) · 10 (`control`: buttons, pills) · 11 (`xl`: fields) · 14 (`2xl`: cards) · 18 (`3xl`: sheets) · 20 (dock) · full only for circles (avatars, dots, orbs, round icon buttons) |

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
| `List` + `ListGroupLabel` | A card of rows, optionally grouped (by month); group labels are support text with a support orb, on a support wash fading right |
| `EventRow` | A dated item. `DateBlock` on the left, a `status` dot (`{ tone, label }`); `selected`/`onSelect` for select mode |
| `EntityRow` | A named thing with an avatar (a person, a place) |
| `DateBlock` | A tear-off calendar ticket (52 px wide, 12 px radius, `surface-2`): the month on a lit highlight band, the day big below, then the year or weekday |
| `MediaCard` | Image-led grid card (`aspect="portrait"` for posters) |
| `LinkCard` | A card that navigates (eyebrow / title / sub); `accent` for the one to notice |
| `StatTile` / `StatGrid` | Headline numbers (`accent="accent"` / `"highlight"` / `"support"`: the number in that colour, a small orb by the label and a soft pool of it in the corner) |
| `ThemeDots` | The circle motif: the theme's three colours as small overlapping orbs. Before page eyebrows and in empty states |
| `RankedList` | Top-N lists with counts |
| `SearchField`, `SelectField` | Search and single-choice filters (select on phones) |
| `Tabs` | 2–4 mutually exclusive views (segmented) |
| `PillTabs` | Filters on desktop |
| `Pager` | Paging long lists |
| `Sheet` | **The** modal: bottom sheet on phones, dialog on desktop |
| `ImageViewer` | Full-screen image (tap or Escape to close) |
| `Badge` / `Tone` / `TONES` | A status as a chip, in one of the fixed tones |
| `EmptyState` | No data — `ThemeDots` above, say what's missing and offer the next step |
| `Loading` | Skeleton shaped like a page (never a bare spinner) |
| `ViewSwitch` | Two or three views of one page as links (List ⇄ Map) |
| `HeaderTitle` (`components/HeaderTitle.tsx`) | The app's name as header text — the brand; `sm`/`md`/`lg` (22/30/44 px) |
| `ColorPicker` (`components/ColorPicker.tsx`) | Inline colour picker: saturation/brightness field, hue slider (28–36 px thumbs, drag anywhere), one row of 8 quick swatches, hex box with a preview chip. Never the native `<input type=color>` — it opens a different dialog on every platform |
| `ThemeCard` (`routes/BrandPage.tsx`) | A theme shown as a miniature of the app (header text, a lit support avatar, a support eyebrow, a date-row card, a lit primary and a secondary button), then a row of circles — every colour it uses, inferred ones with a dashed ring — then name and vibe |
| `Button` (`ui/button.tsx`) | `primary` (one per view), `secondary`, `ghost`, `danger`; `sm`/`md`/`lg` |

CSS classes for plain elements: `.card`, `.field`, `.btn …`, `.chip`,
`.link-action`, `.eyebrow`, `.meta`, `.label`, `.h-page`, `.h-section`.

Adding a component: build it from tokens, put it in the kit, add it to the
Style guide page, and list it here.

---

## 9. Patterns

- **Theme editor:** templates first, in Everyday / Flags / Holidays tabs (tap
  to try; the whole app changes live), then *Make it yours* — tap which
  colour to change (round swatch tabs; inferred ones dashed), drag in the
  picker. Highlight and support have an *Infer it* / *Inferred* switch:
  inferred colours follow the accent and background as they change. Readability warnings appear inline. Nothing is saved until
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
  month; status as a small glowing dot in rows (`STATUS_DOT` + the tone's
  `dot`: a lit sphere with a halo in its colour), a badge on detail pages.
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

- **0.1.0 (2026-10-23)** — First release: three-colour
  theme engine, 25 templates, kit, shell, patterns; foundation / starter /
  reference files; `jimbo-ui.json`; the skill and its update workflow.
- **0.2.0 (2026-10-23)** — Contrast targets: surfaces, borders and secondary
  text step to meet ratios on every background instead of fixed percentages;
  card borders at full strength; Concrete deepened to `#45484D`;
  `scripts/contrast.mjs`. The showcase. Sheets render through a portal.
  `mapStyles` no longer needs Google Maps types.
- **0.3.0 (2026-10-23)** — Fully generic: neutral kit (`Badge`/`Tone`
  instead of app statuses, `ViewSwitch`), `AppShell` takes tabs and actions,
  typeset `Wordmark` from `BRAND.logo`, neutral favicon and showcase content,
  generic colour class names (`accent`, `highlight`) with the old ones kept as
  legacy aliases, server contract described instead of shipped.
- **0.4.0 (2026-10-23)** — Branded **jimbo.ui**. No logo: the brand is the
  app's name as header text (`HeaderTitle`, a dot in the accent); logo uploads
  removed, favicon kept.
- **0.5.0 (2026-10-23)** — Up to four colours: an optional **support**
  colour (derived when missing) with its own tokens, used for page eyebrows,
  avatars, third place and a page glow. 22 new templates in **Flags** and
  **Holidays** sets beside **Everyday**; every Everyday template gains a
  support colour. Contrast check adds button text, support and colour
  separation. Versions: the skill states its version and the plugin checks
  each app's `jimbo-ui.json` at session start.
- **0.6.0 (2026-10-23)** — Depth and the circle motif. Two to four colours:
  highlight is optional too, inferred from the accent. Every brand colour has
  lighter and darker shades, a lit fill (`-top` → `-bottom`) and washes
  950–700. Lit buttons, tabs and avatars; frosted glass (`.glass`,
  `.card-glass`, top bar, sheets); colour orbs behind the page; `.orb-*`,
  `.lit-*` and `ThemeDots`; colour circles on theme tiles; a circles favicon.
  Canada and Two-tone templates; Sweden, USA and Hanukkah lose their white
  highlights. Colour from opaque shapes, not thin washes: date tickets with a
  lit month band, glowing status dots, support group labels, cards lit by the
  accent and support.
- **Unreleased** — Less glassy and less round: mostly solid frosted surfaces
  and a smaller radius scale (cards 14, buttons 10, chips 8; circles kept for
  the motif). Type styles: sans, mono or serif for headings and body.
  Clearer separation: borders step to 1.8:1 against cards
  (was 1.55:1) and cards to 1.2:1 against the page (was 1.16:1); rows are
  divided by etched lines (`.divide-etched`), including rows grouped under a
  label, and are a little taller (76 px).
