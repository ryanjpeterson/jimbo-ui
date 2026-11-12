# jimbo.ui standards

How apps built on **jimbo.ui** look, read and behave, written as a recipe:
with this guide you can build an app that looks and feels like the others,
with its own name and colours, whether or not you copy the code. Generic
implementations of everything below are in the repo's `reference/` folder.

- **The rulebook:** [rulebook.md](rulebook.md) — every rule numbered and
  checkable (B1, K5…). Audits cite its numbers; it decides, and this guide
  explains.
- **It's binding:** every app with a `jimbo-ui.json` follows it (J1). Apps
  use jimbo.ui's shadcn components and tokens and nothing else (J2), never
  restyle them (J3), and get anything new through a PR to jimbo-ui (J4,
  section 14).
- **The detail:** this guide. It's versioned with the jimbo-ui repo; see
  `CHANGELOG.md` for what changed in each version and what apps must do.
- **The living picture:** the Style guide tab of each app's **jimbo-ui
  config** section (`/jimbo-ui`) renders every shared component in that
  app's current theme, a section at a time; the showcase's Home does the same.
- **The library:** `registry/` lists the apps on jimbo-ui and its catalogue
  of shared components; each app's `jimbo-ui.json` says what it uses and
  what it has built, so nothing is built twice (section 13).
- **Theme:** two to four colours (accent and background always; highlight
  and support set or inferred), each with lighter and darker shades, picked
  from Everyday, Holidays, Countries, Provinces or Sports templates (or a
  search across them) or fine-tuned on the Looks and Colours tabs of each app's
  jimbo-ui config section.
- **Look:** flat and modern — shadcn/ui components on solid surfaces with
  hairline borders, no shadows and no blur, softly rounded corners (not
  pills), flat colour on coloured shapes, a backdrop behind the page
  (still, or moving slowly), and flat circles of the theme's colours as a
  recurring motif (no orbs) — or another flat shape the theme picks
  (triforce, sparkles, stars…).
- **Type:** sans (Archivo and Inter), mono (JetBrains Mono) or serif
  (Newsreader and Source Serif 4), chosen separately for headings and body.
- **The URL holds the view:** the route and its tab, sub-tab, filter, search
  and page are in the URL, so a refresh, Back or a shared link lands on the
  same view.

**Contents:** 1 How apps use jimbo-ui · 2 Brand · 3 Theme engine · 4 Theme
templates · 5 Typography · 6 Layout and shell · 7 Surfaces, depth and motion ·
8 Components · 9 Patterns · 10 Icons · 11 Accessibility · 12 Don'ts ·
13 One library, no duplicates · 14 Amending jimbo.ui (the PR route)

---

## 1. How apps use jimbo-ui

The stack is React 19 + TypeScript + Vite + Tailwind CSS 4 (through
`@tailwindcss/vite`, with `clsx`, `tailwind-merge` 3 and `tw-animate-css`)
and **shadcn/ui**: Radix primitives (`radix-ui`), `class-variance-authority`,
`lucide-react` icons, `cmdk`, `vaul` (the phone sheet) and `sonner`
(toasts). Tailwind's theme and the one token mapping live in `globals.css`
(`@theme`); there's no `tailwind.config.js`, PostCSS config or shadcn
`components.json` in an app — jimbo.ui ships the components, already
themed, in foundation. Paths below are relative to the app's web root.

### Three kinds of file

| Kind | In the repo | In an app | Updated how |
| --- | --- | --- | --- |
| **Foundation** | `foundation/` | Same path in the app | Copied over verbatim on every update. **Never edit in an app** — change jimbo-ui instead. Each file says so in its header |
| **Starter** | `starter/` | Same path in the app | Copied once when an app starts, then owned by the app |
| **Reference** | `reference/` | The app's own equivalents | Generic implementations. Apps adapt and extend them with their own domain pieces; on update, changes are ported by hand (the changelog says which) |

**Foundation:** `src/lib/theme.ts` (theme engine), `src/lib/themes.ts`
(templates), `src/lib/jimbo.ts` (the release's version and links), `src/lib/cn.ts`, `src/lib/gestures.ts`,
`src/components/ui/*.tsx` (the shadcn/ui primitives jimbo.ui ships —
`button`, `card`, `input`, `textarea`, `label`, `field`, `badge`, `select`,
`switch`, `slider`, `tabs`, `toggle`, `toggle-group`, `dropdown-menu`,
`popover`, `tooltip`, `dialog`, `alert-dialog`, `drawer`, `command`,
`sonner`, `progress`, `skeleton`, `separator`, `table`, `accordion`,
`alert`, `avatar`, `empty` — with jimbo's edits, section 8),
`src/components/ColorPicker.tsx`, `src/styles/globals.css` (the Tailwind
theme and the token mapping).

**Starter (app-owned):**
- `src/lib/brand.config.ts` — the app's name, default theme and localStorage
  prefix. The only theme values that differ between apps.
- `src/styles/tokens.css` — the default tokens; generate it with
  `node scripts/tokens.mjs <accent> <highlight|-> <background> [support|-]`
  (`-` = inferred).
- `public/favicon.svg` — one accent circle on the page colour, shown only
  until the theme loads; then `applyFavicon` draws it from the theme
  (`motifFavicon`). Set its two colours to the app's default theme.

**Showcase:** `showcase/` is a small app built only from a release's code
(reference, then foundation and starter, then stand-ins for the server parts
in `showcase/overrides/`). It runs the real jimbo-ui config section and kit,
a Home page where ten random looks take turns on the whole page (theme,
font, backdrop and motif, every 15 seconds, or by arrow) over every component, and
Settings, with the theme saved in the browser. Its route is in the URL
(`#/jimbo-ui?tab=type`), so a refresh keeps the view. The archetypes aren't
mounted in it; they're templates in `reference/web/src/archetypes/`.
`npm --prefix showcase run dev` runs it locally, or with Docker:
`docker compose up --build` serves the built app on http://localhost:4460
(`JIMBO_PORT`), and `docker compose --profile dev up` a live-reloading dev
server on 4461 (`JIMBO_DEV_PORT`). Each release publishes it as a private
page (URL in the README) — the way to see what an app would get without
having one.

**Playground:** the showcase is also where to design a theme for an app.
Pick and tune a look on its Looks, Colours, Type and Backdrop tabs, then *Share this look* → export. A
**theme file** (`{ "kind": "jimbo-ui/theme", "version": 1, "theme": { … } }`
— only what the theme sets, so inferred colours stay inferred) imports into
any jimbo.ui app's jimbo-ui config section; the **brand.config** line replaces an app's
`defaultTheme`; **tokens.css** replaces the app's `src/styles/tokens.css`.
Themes go the other way too: export from an app, import into the showcase.
The helpers are in `theme.ts`: `exportTheme`, `importTheme` (accepts a theme
file, a bare theme or anything with a `theme` / `defaultTheme`; drops
unknown fields, clamps numbers), `brandConfigLine`, `tokensCss` (what
`scripts/tokens.mjs` prints).

**Reference (adapt to the app):** the UI kit (`kit.tsx`, with
`forms.tsx`, `overlays.tsx`, `feedback.tsx` and `data.tsx` beside it in
`components/ui/`), the app shell
(`AppShell.tsx`: pass tabs, top-bar actions and routes), the jimbo-ui
config section (`JimboConfigPage.tsx` with `config/ThemePanel.tsx` and
`config/StyleGuidePanel.tsx`), `MapView.tsx`, the archetypes
(`archetypes/catalogue.tsx`, `archetypes/dashboard.tsx`, `archetypes/status.tsx`), `HeaderTitle.tsx` (the app's name as header text), `useBrand.ts`, and
`index.html` (pre-paint script, fonts, PWA tags).

**Server side (optional):** an app that lets admins change the theme stores
the colours and any uploaded favicon, and serves them:
`GET /public/theme` → `{ theme (null = default), faviconUrl }`; admin-only
`PUT /admin/theme` with the theme as `ownColours` gives it: accent and
background as `#RRGGBB`, plus whatever else it sets — `highlight`,
`support`, `fonts`, `infer`, `vibrancy`, `contrast`, `backdrop`, `motif`,
`gridColumns`.
**Store the whole object as sent** (one JSON column), never a list of known
fields, so new theme options save without a server change; check the
colours are hex and the size is sane, and leave missing keys missing so they
stay inferred or default. `GET` returns it as stored; `DELETE /admin/theme` (back to defaults), and
`POST`/`DELETE /admin/theme/favicon` (SVG, PNG, WebP or
JPEG ≤ 1 MB; refuse SVGs with scripts, event handlers or foreign objects).
The app's API client exposes these as `getTheme`, `setTheme`, `resetTheme`,
`uploadBrandAsset`, `removeBrandAsset`. An app without a server keeps the
section and saves the theme in the browser instead, with the same five
functions over localStorage (`showcase/overrides/lib/api.ts` is exactly
that).

### The jimbo-ui config section (every app)

Every app has **exactly one** place for brand, theme and style guide
options, and it's the same in every app, so a person who's themed one app
can theme any:

- **Name:** "jimbo-ui config". **Route:** `/jimbo-ui` (`?tab=` picks the tab).
- **Where:** a link in the app's settings or admin area
  (`JimboConfigLink`) — never a dock tab.
- **Tabs, in this order,** one row that scrolls sideways on phones
  (`PillTabs scroll`) — one topic per tab, so no tab is a long page of
  everything:
  1. **Looks** (`?tab=theme`) — *Pick a look* (Everyday, Holidays,
     Countries, Provinces, Games, Brands and Sports with league and city
     tabs, and
     search; tiles are miniatures of the app with the theme's colours as
     circles) and *Share this look* (export and import).
  2. **Colours** — the four colours as round tabs, the inline picker, *Infer
     it* switches with *Contrasting* / *Tonal* inference, *Vibrancy* and
     *Contrast* sliders, readability warnings.
  3. **Type** — headings and body fonts with weight and spacing.
  4. **Backdrop** — the pattern by group, its base, strength, size,
     contrast and saturation, and its motion (still, alive, pulse, drift,
     breathe or sway) and speed.
  5. **Brand** — the name as header text at each size, the motif, and the favicon.
  6. **Style guide** — every shared component in the current theme
     (including an unsaved look), in sections with toggles (Brand and
     type, Controls, Numbers and charts, Lists, States), plus the app's
     own as extra sections (`more`).
  7. **About** — the jimbo-ui version, the app's registry status (from its
     `jimbo-ui.json`, passed in as `__JIMBO_APP__` by Vite's `define`) and a
     link to the showcase. When a newer release is out it says so first
     (`JimboUpdates`): which releases, what updating would change for this
     app — to do in its code (**Apps must**), changes to kit components it
     uses, what comes with the foundation, what's new if it wants it — and
     the request to paste in the app's Claude session. `JimboConfigLink`
     shows "jimbo-ui X is out" and opens About. It reads `releases.json`
     from GitHub at most once a day per person, only for people who can
     configure, and shows nothing extra when it can't be reached. An app
     never updates itself.
  8. **App** (optional) — anything app-specific. Nothing goes anywhere else.
- **Every choice is in the URL** — the tab (`?tab=`), the Looks category,
  sub-tab, tone and search (`set`, `group`, `tone`, `q`), the backdrop group
  (`patterns`), the font groups (`headings-fonts`, `body-fonts`) and the
  Style guide section (`section`) — so a link opens exactly that view.
- **One look is edited across the Looks, Colours, Type, Backdrop and Brand (motif) tabs**
  (`useThemeDraft`): it previews live across the app, one save bar
  (*Undo* / *Save*) floats over every tab while it's unsaved, and leaving
  the section without saving puts the saved look back.
- **The theme set here is the app-wide default for everyone.**
- No separate Brand pages, theme pickers in settings, or standalone Style
  guide pages.

**Access**, from `auth` in `jimbo-ui.json`. The reference takes
`canConfigure` from the app, so the same code serves both:

| `auth` | Who sees the section | Server |
| --- | --- | --- |
| `"admin"` (the app has sign-in and roles) | Admins only: the route redirects everyone else home and the link isn't rendered (`canConfigure={user?.isAdmin}`) | Every route that saves the theme or brand checks admin itself (`PUT`/`DELETE /admin/theme`, favicon uploads) — hiding the UI isn't enough. Non-admins get the default theme |
| `"none"` (local or single-user) | Anyone using the app (`canConfigure`) | No gate |

Adapt only where it saves (the app's server, or the browser with no
server), the copy, and the App tab. Leave out a part only when the app
can't support it (no storage for a favicon upload) and say so in the app's
`docs/brand.md`. Templates, colour editing and type are never left out.

### `jimbo-ui.json` (in each app's repo root)

```json
{
  "version": "0.8.0",
  "webRoot": "apps/web",
  "auth": "admin",
  "reference": {
    "web/src/components/ui/kit.tsx": "apps/web/src/components/ui/kit.tsx",
    "web/src/routes/JimboConfigPage.tsx": "apps/web/src/routes/JimboConfigPage.tsx"
  },
  "registry": { "registered": "2026-10-30", "audited": "2026-10-30" },
  "components": {
    "uses": ["sheet", "event-row", "page-header"],
    "local": [
      { "name": "PlaceAutocomplete", "path": "apps/web/src/routes/AddPage.tsx", "kind": "candidate", "matches": "autocomplete" },
      { "name": "OrderEditor", "path": "apps/web/src/routes/OrderPage.tsx", "kind": "domain", "matches": null }
    ],
    "overrides": [{ "id": "event-row", "path": "apps/web/src/components/ui/kit.tsx", "why": "maps the app's statuses" }],
    "pending": [{ "name": "RatingField", "path": "apps/web/src/components/jimbo-pending/RatingField.tsx", "pr": "https://github.com/ryanjpeterson/jimbo-ui/pull/12", "replaces": null }]
  }
}
```

`version` is the jimbo-ui version the app is on. `auth` gates the config
section (above). `registry` says when it registered and was last audited.
`components`: `uses` (catalogue ids of the kit pieces it uses), `local`
(its own components — `domain` or `candidate`, and the catalogue id it
`matches`, if any), `overrides` (kit pieces it adapts — wiring only, such
as mapping its statuses, never looks; J3) and `pending` (temporary local
versions of something proposed to jimbo-ui, each with its PR; J5). **This
file is the only record of the app** — jimbo-ui doesn't keep a copy, so
keep it current in the app's repo. At the start of every
Claude Code session in the app, the jimbo-ui plugin compares it with the
installed release and says when there are newer guidelines to bring in (see
"Versions" below). Foundation and starter files
live at `webRoot` + their path. `reference` maps each reference file to the
app's equivalent, if it has one.

### Versions

Numbering follows [Semantic Versioning](https://semver.org/), and **the
number says what an update takes.** jimbo.ui is a work in progress, so it's
on **0.x**, read the way npm and Cargo read 0.x versions: the MINOR is the
breaking digit. Each release has an **Update** type on its changelog entry:

| Update | What updating takes | 0.x (now) | From 1.0.0 |
| --- | --- | --- | --- |
| **breaking** | The app changes its own code — any Apps must step beyond copying the foundation files, or anything apps use removed or renamed | 0.11.0 → 0.12.0 | 1.4.2 → 2.0.0 |
| **feature** | Drop-in: copy the foundation files; new pieces to adopt when wanted | 0.11.0 → 0.11.1 | 1.4.2 → 1.5.0 |
| **fix** | Drop-in: copy the foundation files | 0.11.0 → 0.11.1 | 1.4.2 → 1.4.3 |

So an app on 0.11.0 can take any 0.11.x without touching its own code,
and 0.12.0 tells it before it starts that code will change. The changelog
follows Keep a Changelog (Added, Changed, Deprecated, Removed, Fixed,
Security); something to be removed is marked Deprecated in an earlier
release where possible. A released number never changes (0.8.1, 0.8.2 and
0.8.4 were breaking but went out as patches, before the rule was checked).
`node scripts/versions.mjs --next` gives the number Unreleased needs, and
`versions.mjs` fails a release numbered too low for its type; `releases.json`,
the session-start check and the config section's About tab all show each
release's type. 1.0.0 comes when it's called stable. Work collects under
"Unreleased" in `CHANGELOG.md` and is numbered only when a release is asked
for, not per change. Releases tagged
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
- It follows the theme everywhere: top bar, sign-in, theme miniatures.
- The **favicon** is the one graphic: one of the theme's motif shape (a
  circle unless the theme picks another) in the accent on the page colour,
  softly rounded, drawn from the theme so it follows every change; an uploaded favicon (SVG, PNG,
  WebP or JPEG ≤ 1 MB) replaces it and can be reset to the built-in one.

### Colour — two to four source colours

| Colour | Default (Volt) | Used for |
| --- | --- | --- |
| **Accent** (primary) | `#A8FF3E` | The dot in the header text, primary buttons, active tab/pill, focus rings, links on hover, "done" states, text selection, numbers that matter, the favicon mark |
| **Highlight** (secondary, optional) | `#FF3D6E` | Dates (the month band on date tickets), map pins, count badges, warnings and errors, destructive hover, second place |
| **Support** (third, optional) | `#2EC5FF` | Page eyebrows (`PageHeader`), avatar initials (`EntityRow`), third place in ranked lists, a stat or banner glow that isn't the main one, the page's bottom-left glow |
| **Background** | `#141416` | The page. Surfaces, borders and every text colour are derived from it |

**Two is enough.** A theme always sets the accent and background. Leave out
the highlight or support and it's inferred, one of two ways (`Theme.infer`):
**contrasting** (the default — the highlight is a split complement of the
accent, the support the hue furthest from both) or **tonal** (lighter and
darker versions of the accent, for a simple one-colour scheme like blue and
white). Four is the most, and a theme needn't be four different hues.

**Vibrancy and contrast.** Two sliders tune any theme: `Theme.vibrancy`
(0.4–1.5) scales the brand colours' saturation (the page's by half as much);
`Theme.contrast` (0.8–1.6) scales how far cards, fields and borders step from
the page. The Colours tab warns if a setting costs readability.

**Backdrop.** Behind every page sits a backdrop in the theme's colours
(`Theme.backdrop`, `backdropCss`): a **pattern** from seven groups
(`BACKDROP_GROUPS`, `BACKDROPS`, ten to thirteen each), or none —

| Group | Patterns |
| --- | --- |
| **Abstract** | ripples (rings from two corners), waves (layered along the bottom), contours (topographic lines), shapes (scattered circles, triangles, squiggles), blobs (three soft organic shapes), flow (lines across the page), confetti (small dashes), light burst (rays from the top), swirl (a spiral from a corner), ribbons (three broad bands), scribble (looping lines), rain (slanted strokes), panels (tall slanted panels side by side) |
| **Geo** | triangles, hexagons (a honeycomb), diamonds (harlequin), grid (graph paper), arrows (chevrons), squares (nested), zigzag, rings, crosses, scales (fish scales), cubes (isometric), checks (a faint checkerboard) |
| **Vintage** | halftone (print dots fading from a corner), retro stripes (three bands round a corner), sunburst (wide rays from the bottom), deco fans (art deco scallops), pinstripe, gingham, polka, plaid, argyle, racing stripes (across a corner), trellis (a studded lattice), bauhaus (quarter circles and blocks) |
| **Texture** | dot grid, grain (fine film grain), paper (soft mottle), linen (a fine crosshatch), concrete, brushed (horizontal streaks), sand (coarse grain), speckle, crosshatch, twill (a diagonal weave), carbon (a tiny check), ribbed |
| **Ruin** | embers (sparks rising), ash (flakes drifting down), cracks (fractures from three points), hazard (caution stripes along the bottom), skyline (a broken city along the bottom), fallout (scattered trefoils), smog (banks of smoke), barbed (rows of barbed wire), static (scan lines over noise), shockwave (broken rings from a blast below) |
| **Cosmos** | starfield (twinkling stars), nebula (clouds that swell and settle), galaxy (a tilted spiral turning about its core), orbits (planets round a corner sun), aurora (curtains that fold and unfold), comets (on a long diagonal), constellations, eclipse (a breathing corona), milky way, planetrise (a ringed planet along the bottom) |
| **Haunt** | bats (wings beating), webs (in two corners, a spider on its thread), moonlit (clouds passing a full moon), graveyard (headstones, a bare tree, fog), mist, candles (flickering), damask, drips (from the top; a drop falls now and then), briars (thorny vines from two corners), arches (pointed windows) |

— over a **base**: solid (the page colour), gradient (a sweep of accent and
support) or glow (soft colour glows, the default). Four sliders tune it:
**strength** (0–1, pattern and base together), **size** (0.5–2),
**contrast** (0.3–2, how far the pattern stands out; the base stays) and
**saturation** (0–1.6, the pattern's and base's colour: 0 is greys). Patterns are inline SVG or
gradients, fixed to the screen, and set as `--bg-image` /
`--bg-size` / `--bg-position` / `--bg-repeat` so the pre-paint script applies
them too.

**Backdrop motion** (`backdrop.motion`, `BACKDROP_MOTIONS`) is off by
default, with **speed** 0.5–2. Two kinds:

- **The pattern's own lines and shapes**, each on its own timing, as SMIL
  animation inside the pattern's SVG (`animatePattern`; it runs in a CSS
  background image without script). **Alive**: each pattern its own way —
  rain falls, confetti drifts down, arrows rise, stripes slide (tiles move
  a whole tile, so the loop never jumps), ripples spread, and every other
  line or shape sways a little on its own path; the rest twinkle.
  **Pulse**: every line and shape fades and returns on its own beat. Busy
  patterns move every nth element (at most about 220), to stay smooth.
- **The whole layer**: **drift** (glides corner to corner, 48 s),
  **breathe** (grows and settles, 22 s) or **sway** (turns a few degrees,
  36 s) — a CSS animation on the backdrop layer (`--bg-animation`,
  keyframes `jimbo-bg-*` in `globals.css`), scaled up a little so its
  edges never show.

Content never moves. Devices set to reduce motion get it still (the
pattern is drawn without its animation, and the layer's is off). Keep it slow: motion is atmosphere, not
an effect, and nothing on the page moves with it. Cards stay solid, so text never sits on the pattern; page titles
and labels do, so keep the strength moderate.

**Spread the colours.** A page should show more than the accent: the accent
for what to tap, the highlight for dates and alerts, the support for labels
and people. Don't make the highlight or support white or grey — that's the
text colour, and the page goes flat.

**Depth from layers, flat colour.** Each brand colour comes with lighter and darker
shades (section 3). Coloured shapes — buttons, active tabs and pills, date
bands, avatars, swatches, dots — are **one solid colour**: no outline, no
tinted fill with a coloured border, no gloss, gradients or glows. A selected
pill, tab, switch or tick is the solid fill with `border-transparent`.
Surfaces are **flat** (S8): depth comes from the surface steps (page,
card, muted) and their hairline borders over the backdrop — no shadows,
gradients, glows or blur on components. **Anything that would let the
backdrop show through is a solid `bg-card` with a hairline border** —
floating things, and controls sitting straight on the page (unselected
tabs, pager buttons, back buttons): never a bare outline over the
backdrop, never see-through or frosted (S6). Corners are **softly rounded,
not pills**: circles are kept for the motif (avatars, dots, swatches).

**Colour comes from opaque shapes, not thin washes.** A faint wash of a
colour over a background of the opposite hue goes grey (amber over blue,
pink over green) — that's what makes a theme look flat. Put brand colour on
solid, lit things instead: the date ticket's month band, lit avatars and
pills, status dots, flat colour circles, coloured text. Washes are for tinting the
same hue family (done chips, warnings), not for adding colour.

**The motif.** The theme's colours turn up here and there as three flat
shapes side by side — circles by default, or another shape the theme picks
(`Theme.motif`, `MOTIFS`): triforce, sparkles, stars, hearts, diamonds,
triangles, squares, crosses, bolts, flowers, moons, squiggles, skulls,
trefoils, flames, hazards, planets, comets, suns, rockets, spirals, bats,
pumpkins, ghosts, fangs, coffins, spiders or drops. Only
`ThemeDots` (`.motif-accent/highlight/support`, a mask from `--motif-mask`)
takes the shape; status dots, avatars, swatches and label dots stay
circles. A motif shape follows the circle rules below: flat, side by side,
the same fixed sizes, the same places.

**Circles — the motif, and its rules.** The theme's colours as circles
turn up here and there. Every circle follows these rules:

- **Flat.** One solid fill (`.dot-accent`, `.dot-highlight`, `.dot-support`,
  or a tone). No gradient, shine, glow, shadow, outline or ring — and no
  "orbs" (shaded spheres, blurred colour blobs) anywhere.
- **Side by side, never overlapping.** A row of circles has a 4 px gap
  (6 px from 16 px up). No stacked or overlapping dots, no ring to separate
  them.
- **Fixed sizes:** 8 px inline (`ThemeDots`, the dot before a stat label or
  a month header), 10 px status dots on rows, 16 px colour swatches (theme
  tiles), 40–48 px editor swatches and avatars.
- **Never inside a box.** No square, rounded square, border, ring, tile
  or background behind a circle. An avatar with no picture is the bare
  circle (`EntityRow` draws it so); a picture keeps its own frame — square
  for places and covers, round for people.
- **The page colour as a swatch** gets a 1 px `border-border`, so it shows
  against the page — the one circle with an edge.
- **Inferred colours** show at 55% opacity, not with a dashed ring.
- **Where they go:** `ThemeDots` in empty states and brand moments; a dot
  before a stat's label and a month header; status dots on rows; avatars;
  colour swatches on theme tiles, the editor and the Style guide; the
  favicon. Nowhere else — never above a page title, never as decoration or
  wallpaper.

Status colours are **fixed tones**, not themed, because they carry meaning
(`Tone` and `TONES` in the kit). An app maps its own statuses onto them, with
the accent for the "done" one:

| Tone | Example status | Chip |
| --- | --- | --- |
| `accent` | Done | `bg-primary-950 text-primary border-primary-700` |
| `yellow` | Going / in progress | `bg-yellow-950 text-yellow-400 border-yellow-700` |
| `purple` | Maybe / saved | `bg-purple-950 text-purple-400 border-purple-800` |
| `red` | Missed / failed | `bg-red-950 text-red-400 border-red-800` |
| `muted` | Cancelled / archived | `bg-muted text-subtle-foreground border-border` |

The offline banner is fixed yellow (`bg-yellow-950 text-yellow-200`).

---

## 3. Theme engine

Two to four colours in, every token out (`deriveColors()` in `src/lib/theme.ts`).
Tokens are CSS variables holding `R G B` channels (`--c-surface: 28 28 30`),
and Tailwind colours are `rgb(var(--c-name))` in an `@theme inline` block
(`globals.css`), so opacity modifiers work on every token (`bg-accent/15`,
`border-border/60` — Tailwind mixes them with `color-mix`), and every
utility follows the variables where it's used (a `ThemeScope`, a heading's
type size).

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

The engine's channels and their formulas; classes use the shadcn names
from "The token mapping" below (the Tailwind column).

| Token (`--c-…`) | Tailwind | Formula | Use |
| --- | --- | --- | --- |
| `bg` | `bg-background` | background | Page |
| `surface` | `bg-card` | mix(bg, away, *card*) where *card* = stepTo vs bg, **1.2:1** (at least 0.05 dark / 0.04 light) | Cards, sheets, the dock |
| `bg-deep` | `bg-background-deep` | mix(bg, away, *card* × 0.35) | End of the backdrop's fade |
| `surface-2` | `bg-muted` | stepTo vs surface, **1.15:1** | Fields, chips, hover rows |
| `border` | `border-border` | stepTo vs surface, **1.8:1** | Lines, outlines, card edges, row dividers |
| `text` | `text-foreground` | text | Body text, header text |
| `text-muted` | `text-muted-foreground` | mix(text, bg, fadeTo **5.8:1** on surface-2, at most 0.4) | Secondary lines |
| `text-subtle` | `text-subtle-foreground` | mix(text, bg, fadeTo **4.7:1** on surface-2, at most 0.6) | Labels, hints, counts |

Each brand colour *c* — `accent`, `highlight`, `support` — gets the same
family of tokens:

| Token (`--c-…`) | Tailwind | Formula | Use |
| --- | --- | --- | --- |
| *c* | `*-c` | the colour | See section 2 |
| *c*`-hover` | `*-c-hover` | mix(c, light ? black : white, 0.20) | Hover |
| `on-`*c* | `text-on-c` | on(c) | Text/icons on fills of it |
| *c*`-lighter` / `-light` | `*-c-lighter`, `*-c-light` | mix(c, white, 0.50 / 0.22) | Highlights on spheres, glows, light ends |
| *c*`-dark` / `-darker` | `*-c-dark`, `*-c-darker` | mix(c, black, 0.22 / 0.50) | Shadows, glows under buttons, dark ends |
| *c*`-top` → *c*`-bottom` | `from-c-top to-c-bottom` | dark on-text: mix(c, white, 0.30) → c; white on-text: c → mix(c, black, 0.28) | A two-stop version of the colour, if an app needs one; the kit no longer uses it (fills are flat) |
| *c*`-950/900/800/700` | `*-c-950…700` | mix(bg, c, 0.10 / 0.28 / 0.40 / 0.50) | Washes: done chip, warnings, banner glows |

**Legacy class names** (`accent-lime`, `accent-pink`, `accent-cyan`,
`accent-orange`, `lime-*`, `rose-*`) were removed with Tailwind 4. Use
`accent`, `highlight` and their `-950…` washes.

### Where else the theme goes
- **Page background:** the backdrop (above). Its default glow base is three
  soft colour glows — accent (20%) top left, highlight (16%) right, support
  (16%) bottom left (`radial-gradient(circle at …)`) — over a fade to
  `bg-deep`, all fixed.
- **Browser chrome:** `<meta name="theme-color">` = background (it also
  colours the installed app's solid status bar);
  `color-scheme` = light or dark to match.
- **Text selection:** accent fill, on-accent text.
- **Maps:** `mapStyles(theme)` returns plain style rules (`MapStyle[]`, the
  shape Google Maps' `styles` option takes, no Maps types needed) tinting the
  map from bg → accent; pins are round,
  highlight-filled with a lighter ring (`markerIcon`).
- **Favicon:** `applyFavicon` draws the motif shape in the accent on the
  page colour (`motifFavicon`, an SVG data URL — no file to fetch, so it
  works at any path) and adds the `<link rel="icon">` if the page has none.
  `themedFavicon` (recolouring an old template) is deprecated.
- **iOS home-screen icon:** `applyFavicon` also draws that icon (or an
  uploaded one) as a 180 px PNG, full-bleed on the theme's background
  (`iconPng`), and points `<link rel="apple-touch-icon">` at it, so adding
  the app to a Home Screen gets the current look. Keep the static
  `/icons/apple-touch-icon-180.png` in `index.html` as the fallback. iOS
  keeps the icon from when the app was added: after a theme change, phones
  that already have it remove it and add it again.
- **Share images:** background, accent, highlight, text and the accent-900
  wash from the cached theme.

### Applying it
- `applyTheme(theme)` sets every variable on `<html>`, the theme-colour meta
  and `color-scheme`, and caches the theme (`<prefix>.theme`) and computed
  variables (`<prefix>.themeVars`) in localStorage, with the prefix from
  `brand.config.ts`.
- A small inline script in `index.html` applies the cached variables **before
  first paint**, so there is never a flash of the default colours.
- `useBrand` starts from its cached copy (`<prefix>.brand`) but treats it as
  old, so it asks the server for the current theme on every load — a theme
  changed elsewhere appears as soon as the app opens, not minutes later.
- Light backgrounds: surfaces step *darker*, text flips to near-black. Photo
  viewers, banners over images and map pins stay dark/vivid on purpose.

### The token mapping (shadcn's names)

The engine writes "R G B" channels (`--c-bg`, `--c-accent`…). One block in
`globals.css`, on `:root` and every `.theme-scope`, names them the way
shadcn's components expect, so any shadcn component picks up any jimbo
theme with no colour code of its own. It's the only mapping: nothing else
sets these variables, and classes use only these names (C1).

| shadcn variable (class) | From | For |
| --- | --- | --- |
| `--background` (`bg-background`) | bg | The page |
| `--background-deep` | bg-deep | The backdrop's fade |
| `--foreground` (`text-foreground`) | text | Body text; also `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground` |
| `--card`, `--popover`, `--sidebar` | surface | Cards, sheets, menus, the dock |
| `--muted`, `--secondary` | surface-2 | Fields, tags, tracks, secondary buttons |
| `--accent` (`bg-accent`) | surface-2 | **shadcn's hover surface** — not the brand colour |
| `--muted-foreground` | text-muted | Secondary text |
| `--subtle-foreground` | text-subtle | Labels and hints (jimbo's own) |
| `--primary`, `--primary-foreground` | accent, on-accent | The theme's accent: primary buttons, active states, the dot in the name |
| `--primary-hover`, `-lighter`, `-light`, `-dark`, `-darker`, `-950`…`-700` | the accent's shades | Depth and washes |
| `--highlight`, `--support` (+ `-foreground`, shades) | highlight, support | jimbo's other two brand colours (no shadcn slot) |
| `--border`, `--input` | border | Hairlines, field borders |
| `--ring` | accent | Focus rings |
| `--destructive` (+ `-foreground`) | fixed red | Destructive actions only |
| `--chart-1` … `--chart-5` | accent, highlight, support, accent-light, support-dark | Charts (three series at most, P2) |
| `--radius` | 10 px | `rounded-sm` 6, `-md` 8, `-lg` 10 (controls), `-xl` 14 (cards), `-2xl` 18 (sheets) |

The one trap: in shadcn, **accent is the hover surface**; the theme's
accent colour is **primary**. A prop that names a theme colour (`tone`,
`accent` on `StatTile` or `Hero`) still says `"accent"` — it's drawn with
`primary`. Opacity modifiers work on every name (`bg-primary/15`).

### Readability (WCAG)

Checked live on the Colours tab for the colours an admin picks (and for the
inferred ones, which are built to pass):
- Body text ≥ 4.5:1 on the background.
- Accent and highlight ≥ 3.5:1 on the background.
- Support ≥ 4.5:1 on cards (it's used for small text).
- Text on an accent button ≥ 4.5:1.

Every template must also pass `node scripts/contrast.mjs --check`, with text
measured on fields (`surface-2`, the weakest surface it sits on, so it holds
on cards and the page too): body text ≥ 7:1, muted ≥ 5.5:1, labels ≥ 4.5:1;
hero text over its scrim
(below); card border
≥ 1.75:1, card against page ≥ 1.19:1 — and the three above, plus
**colours apart**: accent and highlight at least 22 apart (CIE76 ΔE) and no
two of accent, highlight and support closer than 15 — closer than that, two
roles read as one colour (an eyebrow looks like a link, a badge like a
button). A tonal theme passes when its shades are spread that far (the
engine spreads them); identical colours don't. A tone written into
`themes.ts` that misses any target isn't offered as written: it's remade
from the look's own colours (`atTone`), or that tone isn't offered and the
look shows at its nearest tone.

**Hero scrims (C8).** A hero's picture or theme blur sits under the page
colour, as much of it as this theme needs (`heroScrims` in `theme.ts`, set as
`--hero-scrim-image` and `--hero-scrim-blur`): the least that keeps the title
≥ 7:1 and its eyebrow and lines ≥ 4.5:1 over pure white and black (a
picture) or a strong wash of a brand colour (the blur). Use the
`hero-scrim-image` / `hero-scrim-blur` utilities, never a fixed black dim.

Mid-grey backgrounds limit body text
most: keep them dark enough (luminance under about 0.07) for 7:1.

---

## 4. Theme templates

The Looks tab offers these (`foundation/src/lib/themes.ts`) in ten
categories (Brands: companies' own palettes, colours only, and only the
colours on the brand's own website — each brand its own look, never mixed;
a one-colour brand stays one colour, its shades filling the rest with
`infer: "tonal"`. Marcone: logo red on white or black. mSupply: navy on
white), chosen with wrapping pills, plus a search box across all of them
(name, vibe, category and tab; accents ignored, so "quebec" finds Québec).

**Each look comes once, in three page tones.** A **Light / Mid / Dark**
switch above the grid sets the tone every tile shows: light (a near-white
page tinted with the look's colour), mid (a deep or muted page) or dark
(near-black). A look is a family (`TemplateFamily`: one palette, team, flag
or game) holding the templates written for it by tone (`toneOf`); the
other tones are made from **its own colours** by `atTone` — the page is
its most colourful colour, deepened or paled, and each role takes the first
own colour that reads on it, nudged lighter or darker (reds and oranges never
paled into pink; a role nothing fills is left to shades of the accent).
Every look in every tone passes the readability checks; one that can't be
made in a tone shows its nearest and says so ("Dark only"). A team's old
Home and Away looks are now its dark (or mid) and light tones.

| Category | What's in it | Shown as |
| --- | --- | --- |
| **Everyday** | The originals, one list (once split into Dark, Mid and Light) | One group |
| **Holidays** | Through the year, Lunar new year to New year's eve | One group |
| **Countries** | Flags by region: Americas, Europe, Asia and Pacific, Africa | Stacked groups |
| **Provinces** | Canada's 13 provinces and territories, each on its flag's field colour | One group |
| **Games** | **The Legend of Zelda** (twelve games' palettes, from the 1986 original to Echoes of Wisdom), **Super Mario** (Mario, Luigi, Peach, Bowser, Toad, Wario, Yoshi, Yoshi's Island), **Donkey Kong** (DK, Diddy, Country, the 1981 arcade), **More Nintendo** (Kirby, Metroid, Star Fox, Pikmin, Splatoon), **Sly Cooper** (Sly, Bentley, Murray, Carmelita, Thievius Raccoonus), **Tony Hawk's Underground** (its menu themes: T.H.U.G., Cloudbuster, Retro Hawk, Chilled, Skullz 'N Stuff) and **Consoles** (PlayStation, Nintendo 64, Dreamcast, PlayStation 2, Xbox, GameCube, Game Boy Advance, PSP, Xbox 360, Wii, PlayStation 3 — hardware and menu colours, each with a menu font, backdrop and motif). Colours, pattern and type only, no artwork | Sub-tabs, one per series |
| **Apocalypse** | **Nuclear** (Fallout shelter, Half-life, Nuclear winter), **Undead** (Outbreak, Dead of night, Quarantine), **Wasteland** (Dust bowl, Scorched earth, Rust belt), **Cosmic** (Last light, Impact, Judgement day) and **Collapse** (Drowned world, Wildfire smoke, Signal lost). Invented palettes, not taken from any film or game; each has a style — a Ruin backdrop, a motif (skulls, trefoils, flames, hazards…) and a heading font | Sub-tabs, one per ending |
| **Space** | **Nebulae** (Stellar nursery, Pillars of dust, Veil), **Stars** (Red giant, Blue supergiant, White dwarf), **Planets** (Gas giant, Ringed world, Ice giant, Pale blue dot), **Deep sky** (Event horizon, Galaxy core, Launch window) and **Aurora** (Aurora, Solar wind, Midnight sun). Invented palettes; each style has a Cosmos backdrop that moves on its own, a motif and a heading font | Sub-tabs |
| **Halloween** | **Vampire** (Velvet coffin, Blood moon, Count's court, Crypt, Daybreak), **Haunted** (Haunted manor, Séance, Ectoplasm), **Witching** (Witching hour, Cauldron, Hex), **Graveyard** (Graveyard, Moonlit mist) and **Harvest** (Jack-o'-lantern, Candy corn, Harvest moon). Invented palettes, each with a Haunt backdrop, a motif (bats, fangs, ghosts…) and a heading font | Sub-tabs |
| **Sports** | NHL, NBA, MLB, NFL (every team; some Toronto and Ottawa teams have a **Retro** look too), then **Toronto**, **Ottawa** and **Chicago** (every team from the city, across leagues — MLS, CFL, WNBA, PWHL, NWSL, CPL, NLL, AHL, OHL too) | Sub-tabs (`tabs: true`), one at a time |

Each template is drawn as a miniature of the app with its colours as
circles. Every one passes the readability checks. An app whose default isn't
one of them gets it as an extra "Yours" card at the front of Everyday.

A template may also carry a **style** (`Template.style`, `TemplateStyle`:
`fonts`, `backdrop`, `motif`) — the console looks do, to call up each
console's menu (the PS2's drifting specks on blue-black, the GameCube's
drifting cubes on indigo, the Xbox 360's slanted panels, the PS3's flowing
lines). Picking such a look brings its style with the colours; a look
without one keeps the type, backdrop and motif already chosen. Its card
shows the backdrop and heading font. Styles use only the options anyone can
pick — never a logo, system artwork or copied menu asset.
`FAMILY_SETS` has the categories as looks; `ALL_FAMILIES` every look once;
`familyAt(f, tone)` a look in a tone (or null), `familyLook(f, tone)` what a
tile shows (that tone or the nearest), `familyTones(f)` the tones it comes
in. The written templates are still there for older Theme tabs:
`TEMPLATE_SETS`, `TEMPLATE_GROUPS`, `ALL_TEMPLATES`; `sameTheme` compares
two themes. `templateScores` / `templateIssues` (in `theme.ts`) run the
readability targets on any theme; `scripts/contrast.mjs` runs them on every
look in every tone.

**Team, country and province themes** use **only their own colours** —
and lighter or darker versions of them that still read as that colour —
never a new hue. They're made with `scripts/template-from-colours.mjs` (a
list of `{ name, vibe, colours, page?, light?, road?, kit? }` in, `t(…)`
lines out):

- **The page:** a province's flag field (Québec's blue, Ontario's red
  ensign); a team's **Home** look is its main colour, deepened just enough
  for text — except a red or orange team, which keeps its red as the accent
  at full strength on its dark secondary (black, navy); **Away** is white
  (baseball: road grey); flags with a white field are light.
- **Accent, highlight, support:** taken in order from the real colours, each
  as it is if it reads, else nudged lighter or darker. Reds and oranges are
  never lightened into pink. On a dark page a white also comes as pale tints
  of the main colour (a blue-and-white team's pale blues) or, for a red team,
  light greys. Colours that look like the page are never used.
- **Simple schemes stay simple:** a blue-and-white team is shades of blue
  and white; a black-and-silver one is greys. Where nothing real can fill a
  role, the template uses tonal inference.
- **Retro:** classic looks for Toronto and Ottawa teams (St. Pats, Raptors
  ’95, Blue Jays ’77, Original Senators, Senators ’92, Rough Riders).

They borrow colours only — no logos or artwork; the tile label is the only
name on screen. Team vibes start with the city ("Toronto · blue and white"),
which builds the city tabs. To add teams or places: list their real colours
(main first, minor accents too — the Steelers' Steelmark red and blue), run
the script, paste the lines, run `node scripts/contrast.mjs --check`, and
look at them. The team colours were compiled from memory; correct any that
are off.

The Everyday and Holiday templates, hand-picked:

**Dark**

| Name | Vibe | Accent | Highlight | Support | Background |
| --- | --- | --- | --- | --- | --- |
| Volt (default) | Lime, hot pink, sky | `#A8FF3E` | `#FF3D6E` | `#2EC5FF` | `#141416` |
| Pilot | Lime, hot pink, cyan — the original | `#A8FF3E` | `#FF3D6E` | `#3DFFE8` | `#141416` |
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

**Holidays** (through the year)

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

"Inferred" means the template leaves that colour to the engine (Two-tone shows
a two-colour theme). Each theme tile shows its colours as flat circles side
by side under the miniature, inferred ones faded.

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

**Type.** A theme picks a font for headings and one for body text, each
with a weight and letter spacing (`Theme.fonts: { headings, body,
headingsWeight, bodyWeight, headingsTracking, bodyTracking }`; defaults
Archivo 800 at −0.015em and Inter 400 at 0). They're set as `--font-display`,
`--font-body` and their `-weight` / `-tracking`, which `font-display`,
`.h-page`, `.h-section` and the body read, so every page follows. The fonts
(`FONTS` in `theme.ts`, by `group`):

| Group | Fonts |
| --- | --- |
| Sans | **Archivo** (default headings), **Inter** (default body), Space Grotesk, DM Sans, Manrope, Geist, Plus Jakarta, **Avenir** (Avenir Next or Avenir on Apple devices, Nunito Sans elsewhere), Figtree |
| Serif | Newsreader, Source Serif, Playfair, EB Garamond, Literata, Baskerville, Instrument Serif (headings only), Lora, DM Serif (headings only) |
| Mono | JetBrains Mono, IBM Plex Mono, Space Mono, Fira Code, Roboto Mono, Source Code, DM Mono, Red Hat Mono, Inconsolata |
| Decorative (headings only) | Old English, Old German, Gothic (blackletter), Pirate, Bebas Neue, Typewriter, Old print, Unbounded, Syne |

Nine per group. Decorative faces are for headings only — wrong for running
text: blackletter and old print, plus a few modern poster faces (Bebas Neue,
Unbounded, Syne). No novelty (no pixel, neon, script or rounded display
faces). Fonts taken out (IBM Plex Sans, Work Sans, Fraunces, Marcellus,
Cormorant, Rocker, Uncial, Carved caps) map to the nearest one left
(`RETIRED_FONTS`), so a saved theme keeps a similar face.

**Size.** Headings and body text each have a size (`headingsSize`,
`bodySize`: 0.8–1.3, shown on the Type tab as ± em; +0.10 em is 10% bigger
throughout). Every Tailwind text size is its usual size × `--fs` — the
body size, or the headings size inside `font-display` — so the whole scale
moves together and line heights (ratios) follow. Use the named sizes
(`text-sm`, `text-xl`, and `text-15`, `text-11`, … for the pixel sizes the
kit uses), never `text-[15px]`: an arbitrary size doesn't follow.
Archivo, Inter and JetBrains Mono load from `index.html`; `applyTheme` loads
any other from Google Fonts when picked (`loadFonts`). An app whose default
uses another font adds it to `index.html` and passes `--headings=` /
`--body=` (font keys) to `scripts/tokens.mjs`. **JetBrains Mono** is also
always used for codes and hex values (`font-mono`). Older themes that saved
a style name (`sans`, `mono`, `serif`) map to Archivo/Inter, JetBrains Mono
and Fraunces/Source Serif. Below, "Archivo" and "Inter" mean the headings
and body fonts.

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
- **Installed-app feel:** `apple-mobile-web-app-capable`, a solid status bar
  (`apple-mobile-web-app-status-bar-style` `default`, coloured by
  `theme-color`), no tap highlight, `overscroll-behavior-y: contain` (own pull to
  refresh), smooth scrolling.
- **No zoom in the installed app.** From the Home Screen an app doesn't
  pinch-zoom or double-tap zoom, like a native app; `applyTheme` sets it up
  (`viewport.ts`: the viewport meta, `touch-action` via `html[data-installed]`
  and iOS's gesture events), so apps add nothing. In a browser tab pinch-zoom
  stays (it's a web page there) and double-tap zoom is off. The type size
  setting is how people make text bigger. Anything that zooms its own
  content (a map, an image viewer) does its pinch in JS on an element with
  `touch-action: none`; `isInstalledApp()` tells code which mode it's in
  (jimbo-deploy's iOS shell counts as installed).
- **Full screen on phones.** Every app fills the whole screen, edge to edge
  and top to bottom, and nothing sits under the status bar or the home
  indicator:
  - The status bar style is `default`, never `black-translucent`. Since
    iOS 26.1 an installed app with a translucent status bar gets a system
    blur over the status bar and the top of the page that the page can't
    turn off, and it covers the header text. With `default`, iOS draws a
    solid status bar in the `theme-color` (the theme's background, set by
    `applyTheme`) and the page starts below it. iOS reads the style only
    when the app is added to the Home Screen: remove and re-add it to see a
    change.
  - `index.html`'s viewport meta has `viewport-fit=cover`, so the bottom
    and side insets (home indicator, landscape notch) are real.
    `applyTheme` adds it if it's missing (and warns in development);
    `scripts/inventory.mjs` reports apps without it, or with a translucent
    status bar.
  - The page colour is on `html` and the backdrop is a fixed layer the full
    height of the screen (`body::before`, `100lvh`), so it never stops short
    or scrolls away; `html`, `body` and `#root` are `height: 100%` (so pages
    can use `h-full` / `min-h-full`) and `#root` at least `100dvh`.
  - Insets come from `globals.css`, never `env()` in app code:
    `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right`, plus
    `--top-bar` (the top bar's height with the status bar: where sticky
    sub-bars go), `--dock-space` (room under content on phones) and
    `--above-dock` (where bottom-pinned bars sit). Use them as
    `pt-[var(--safe-top)]`, `top-[var(--top-bar)]`, `bottom-[var(--above-dock)]`.
  - Anything fixed to the top edge of a phone screen (the top bar, a viewer's
    close button, a page's own sticky bar) pads by `--safe-top`; anything at
    the bottom by `--safe-bottom`; left and right by `--safe-left`/`-right`.
  - Content is full width on phones: the page frame's `px-4` is the only
    side margin; no app wraps pages in a narrower box at phone width.
- **The URL holds the view.** Every page is a route (`BrowserRouter` in
  apps; never `MemoryRouter`), and whatever picks what the page shows — a
  tab, sub-tab, segmented control, filter, sort, search, page number, the
  open item or sheet — is a search parameter on that route, read and set
  with `useUrlState` / `useUrlNumber` (`lib/useUrlState.ts`; a sheet or
  detail that Back should close, like a run's log, too). So a refresh, Back
  and a shared link all land on the same view. Parameters replace the
  history entry (tapping tabs doesn't fill Back) and drop out at their
  default.
- **An item's page is a path.** A detail page lives at the singular kind
  and the item's name or id — `/service/mail`, `/project/home-server`,
  `/entry/42` — under the plural list it comes from (`/services`). Never
  `?id=` for a page of its own, and never the list's path with the item
  after it (`/services/mail`). Old paths redirect to the new ones. A sheet
  over the list (the item open without leaving it) stays a search
  parameter. Only passing state stays in React: a selection in progress, a
  half-typed form, hover. Preferences that belong to the person, not the
  view (list or grid layout), stay in local storage.
- **Paths say how far in you are, and Back is always there.** A feature
  or tool under a dock tab nests under that tab's path, one segment per
  step in — `/library/import`, `/library/import/review`, `/settings/account`
  — never a top-level path of its own (`/import`). Every page below a dock
  tab's own page shows Back to its parent, the path minus its last part:
  `PageHeader back`, or `Hero`/`Banner back` on pages that open with a
  picture. An item's page (above) goes Back to the list it belongs to.
  `BackButton` goes to the parent as it was left (its tabs, filters and
  page), which the shell remembers (`useRememberPages` in `AppShell`);
  `parentPath` works the parent out from a path. Old paths redirect,
  keeping their search.
- **Top bar:** sticky, 56 px (64 px on desktop) plus `--safe-top` (0 under
  a solid status bar; in a browser with a notch in landscape or any page
  drawn under the status bar, its content still starts below it),
  solid `bg-background`, a hairline bottom border. Left: the header text (and text
  tabs on desktop). Right: icon buttons (`TopBarButton`, a `Button size="icon"`) — search (secondary), **+ add**
  (primary fill), account (avatar initial in an accent circle).
- **Width:** `AppShell width` — `column` (`max-w-5xl`, the default, for
  reading), `wide` (`max-w-7xl`: dashboards, galleries) or `full` (the whole
  screen). Any one section can go edge to edge on its own with `FullBleed`
  or `HeroSection`, whatever the page width.
- **Content:** the page width, `px-4` (`sm:px-6`), `pt-6`; bottom padding of
  `--dock-space` (6.5 rem + the bottom safe area on phones) so nothing hides
  under the dock.
- **Pages fill the screen.** `AppShell`'s main is a column at least the
  screen's height, and every page is a `Page` (the sections, `gap-6` apart,
  taking all of it). A page low on content doesn't stop halfway with the
  backdrop under it: its last `Section fill` (or `EmptyState fill`)
  stretches down to the dock. Use it on the one block that's meant to grow
  (a console, a list, an empty state), not on every section.
- **Symmetry: cards side by side are one size.** Symmetry is valued:
  nothing in a row is shorter than its neighbour. In a grid, every row is as
  tall as the tallest card and every card fills its cell (`auto-rows-fr`,
  `h-full`: `MediaGrid`, `List layout="tiles"` and `StatGrid` do it).
- **Desktop columns depend on the content (L13).** From `lg`, tile grids
  (`MediaGrid`, `List layout="tiles"`) show the app-wide count set in the
  jimbo-ui config (Brand → Desktop grids, saved as `Theme.gridColumns`,
  3–8; it sets `--grid-cols`), or their own default when it's Auto (3 or
  4 for cards, 6 for small covers). Where one grid's content wants a
  different count, give it a picker: `const [cols, setCols] =
  useGridColumns("covers")`, `<MediaGrid columns={cols}>`, and
  `<ColumnsPicker value={cols} onChange={setCols} />` in its `Section`'s
  action slot (it shows from `lg` only; the choice is in the URL as
  `?covers-cols=6`). Phones and tablets keep the grid's own counts.
  Picking a look keeps the setting: it isn't part of a look.
  Sections side by side go in `Columns` (`count` 2 or 3, from `lg:` or
  `sm:`), never a bare `grid lg:grid-cols-2`: each `Section`'s card stretches
  to the row's tallest with its content at the top, so two charts are one
  size even when one has a line under it. A card low on content keeps its
  neighbours' size, with its actions pinned to the bottom (`mt-auto`); text
  that would make it taller is trimmed to a fixed number of lines instead.
- **Anything that scrolls shows its scrollbar, always.** A box that
  scrolls inside the page (a capped `List`, `PillTabs scroll`, a sheet's
  body, a wide chart) shows a themed bar at all times — macOS hides
  scrollbars until you scroll, and a list cut off at a card's edge looks
  finished. `globals.css` styles every scrollbar under `<body>` (a
  `surface-2` lane, a `text-subtle` thumb at ≥ 3:1 on it in every look,
  muted on hover, accent while dragged); Chrome and Safari keep it showing,
  Firefox styles it but still follows the system setting. Use
  `.scroll-area` (with a `max-h-*`) for a box that scrolls down and
  `.scroll-area-x` for one that scrolls sideways; `List maxHeight` does it
  for a list. Never hide a scrollbar (`scrollbar-width: none`,
  `::-webkit-scrollbar { display: none }`).
- **Tab dock (phones):** floats 12 px above the bottom safe area, `max-w-md`,
  a 5-column grid in an 18 px-radius slab: solid `bg-card`, a hairline
  `border-border`, no shadow or blur. Each tab is 56 px tall with a 14 px-radius active tab, icon above a
  10.5 px label; active = a solid primary fill, filled icon, bold label. Presses scale
  to 0.92. Tapping the active tab scrolls to the top. A gradient fade from
  `bg` sits behind it so content dissolves under the dock.
- **Things pinned to the bottom** (save bar, select-mode action bar, upload
  ring) sit above the dock: `bottom-[var(--above-dock)]` (5.75 rem + the
  bottom safe area on phones, 1.5 rem from `sm:`).
- **Page anatomy:** `PageHeader` (eyebrow, title, count, actions) → filters →
  content. Detail pages start with a full-width `Hero`/`Banner` (blurred
  image, back button top-left, status top-right, actions below).
- **Spacing:** `space-y-6`–`8` between sections, `space-y-3` inside one,
  `gap-3` in grids, `p-4 sm:p-5` inside cards; grids are 2 columns on phones,
  3 from `sm:`.
- **No horizontal scroll strips.** Wrap, use a select on phones, or a sheet.
  The one exception, `PillTabs scroll`, shows its bar under the row.
- **Text never overflows; it's trimmed.** Any text whose length you don't
  control is cut with an ellipsis rather than pushing a layout wide or
  running to many lines. One line (`truncate`, and `min-w-0` on the flex
  child holding it) for row names and sub lines, labels, values, chips,
  badges, section titles and stat tiles; a clamp (`line-clamp-2` or `-3`,
  with `break-words` so one long word can't escape) for page, hero and sheet
  titles, hints, descriptions and stacked values. Numbers with a unit never
  wrap between them (`whitespace-nowrap`); give the column enough width
  instead (`minmax(17rem,1fr)`). Meta at a row's end gets a cap
  (`max-w-[40%]`) so it can't squeeze the name away. Where the whole text is the
  point (a job's current item or a failure's reason in a `JobTile`), it
  wraps (`break-words`) instead of being cut.
- **Touch targets ≥ 44 px** (`h-control` on phones), rows ≥ 76 px (`py-3.5`), each divided from the next by an etched line.
- **One control height.** Buttons, fields, selects, `Tabs`, `ViewSwitch`,
  `PillTabs` and `RangeField` tracks are all `h-control` — 44 px on phones,
  40 px from `sm` (`--control-h`); `h-control-sm` (36/32 px) is the
  compact size inside rows and cards. Never set a control's height by hand
  (`h-11 sm:h-10`). Controls side by side are one height and line up on
  one baseline: put them in a **`.controls`** row (a `PageHeader`'s
  `actions` and a `Section`'s `action` already are), which makes every
  button, field and switch in it `h-control`, whatever size it was given.
  Options laid out in columns go in a **`.control-grid`**: equal columns,
  each cell one control high and full width — never a mix of a big select
  and a small button. A `Section`'s title row is one control high with or
  without actions, so sections side by side start level.
- **Neighbours are one size.** Two controls side by side never differ in
  height, padding or type size: a `.controls` row also gives every button
  in it the same padding and type, so a `size="lg"` primary and a `sm`
  ghost come out alike. Actions passed to an action slot are a fragment;
  a bare `<span>` or `<div>` (no class) around them steps aside
  (`display: contents`), but a classed wrapper (`flex gap-2`) takes them
  out of the row — don't. A row of actions is primary and secondary only,
  one primary at most; ghost buttons belong inside rows and cards.
- **Anything that opens choices looks like a dropdown.** A trigger for a
  `Menu` of options, a sort, a filter `Popover` or "more ways to…" is a
  `DropdownButton`: the field's surface and border, its current value (or
  a muted label and the value), and a down arrow that turns while open.
  Never a plain or ghost button, never a bare "Or…". A choice that applies
  at once can be a `SelectField`. The ⋯ `MoreButton` stays for a row's own
  actions.

### Layers (z-index)

| z | What |
| --- | --- |
| 0 | The backdrop layer (`body::before`); `#root` stacks above it |
| 30 | Pull-to-refresh spinner, dock fade, sticky sub-bars (`OfflineBanner`, `UpdateBanner`) |
| 40 | Top bar, tab dock, floating save/action bars |
| 45 | Menus, popovers and tooltips |
| 50 | Sheets (with a `bg-black/70` blurred backdrop), the command palette |
| 60 | Toasts, top right (over sheets, so one from inside a sheet is seen) |
| 100 | Full-screen image viewer (`bg-black/90`) |

---

## 7. Surfaces, depth and motion

| Thing | Recipe |
| --- | --- |
| Surfaces (S8) | **Flat.** One solid fill — `bg-background` (page), `bg-card` (cards, sheets, menus, the dock, the top bar, floating controls), `bg-muted` (fields, tags, tracks) — and a 1 px `border-border` hairline. No shadows, gradients, inner highlights, glows or blur on any component, and nothing see-through (`bg-card/90`). Depth comes from the surface steps (card on page ≥ 1.19:1) and the backdrop |
| Overlays | Menus, popovers, tooltips, toasts and sheets are the one exception: a single `shadow-md` to lift them off what's under them. The dimmer under a dialog or sheet is `bg-background/80` |
| `Card` (`components/ui/card`) | `rounded-xl` (14 px), `border`, `bg-card`, padding 16 px (20 from `sm`). `asChild` makes a whole card a link (`LinkCard`, `MediaCard`) |
| Floating on the backdrop (S6) | Unselected tabs, the pager, back buttons, the dock and top bar: solid `bg-card` with a hairline border — never a bare outline, see-through or frosted |
| `.dot-primary/highlight/support` | A brand colour as a **flat circle**: one solid fill, nothing else (see Circles in section 2). Size it with utilities |
| `.motif-primary/highlight/support` | A brand colour in the theme's motif shape (circle unless `Theme.motif` says otherwise), for `ThemeDots` only |
| `.scroll-area` / `.scroll-area-x` | A box that scrolls inside the page, down or sideways: the scrollbar always shows (every scrollbar under `<body>` is themed: `muted` lane, `subtle-foreground` thumb, `muted-foreground` on hover, `primary` while dragged), its room is kept (`scrollbar-gutter: stable`), and scrolling stops at its end. Cap its height (`max-h-*`) |
| `.divide-etched` | Hairlines between stacked items, on the parent like `divide-y`. It also reaches one level down, so rows grouped in wrappers (a month's label and rows) are divided too. Lists, ranked lists |
| `.fade-out` (`.fade-both`) | **How a full-width opener ends.** A banner, a hero, a photo or gradient header never stops on a hard edge, a border, or a fade to solid `bg` — the page behind has its backdrop (pattern and glow), so any of those shows as a line. Put the opener's background (blurred photo, scrim, gradient, pattern) in its own layer behind the content and mask that layer out to transparent: `.fade-out` fades the bottom 45%; add `.fade-both` to fade the top too when something sits above it. Mask the background, never the text. `Banner`, `Hero` and `HeroSection` do this |
| Selected (S7) | A solid brand fill with its `-foreground` text and `border-transparent`: active tabs and toggles (`data-[state=on]`, `data-[state=active]`), select ticks, the date band, count badges |
| `Input` / `Textarea` / `SelectTrigger` | `h-control`, `rounded-lg`, `bg-muted`, `border-input`, 15 px text, `px-4`; focus = `ring` border + 3 px `ring/50` ring |
| `Button` | `rounded-lg` (10 px), `h-control` (44 px on phones, 40 px desktop), `px-5`, 15 px semibold, `active:scale-95`; `size="sm"` `h-control-sm` (36/32 px), `icon` / `icon-sm` squares. Variants: `default` (solid primary, `primary-hover` on hover), `secondary` (`bg-secondary`, border, border lightens on hover), `ghost` (muted text, `bg-accent` on hover), `destructive` (solid fixed red, for confirming only). No `outline` or `link` variants, and no `lg` (K2). `loading` disables it and shows a spinner |
| `Badge` (`components/ui/badge`) | `rounded-md`, never a pill (S2): `default` (primary), `secondary` (muted with a border), `highlight`, `support`, `destructive`. The kit's `Badge` is the status chip in a fixed `Tone` built on it |
| `.controls` | A row of controls, every one `h-control`, wrapping on phones. `PageHeader actions` and `Section action` use it |
| `.control-grid` | Options in equal columns (≥ 9 rem each), every cell one control high and full width |
| Top bar | `bg-background`, `border-b border-border`, solid |
| Floating bars and the dock | `bg-card`, `border-border`, solid, no shadow; the dock is a 18 px-radius slab and its active tab a solid primary fill |
| Sheet | shadcn `Drawer` on phones (bottom sheet, grab handle, drag down to close, up to 92 dvh, top corners 18 px) and `Dialog` from `sm` (centred, 18 px radius, `max-w-lg` / `max-w-xl`), both portalled to `<body>` on `bg-background` |
| Radii scale | One radius, `--radius` 10 px: `rounded-sm` 6 · `rounded-md` 8 (badges) · `rounded-lg` 10 (`rounded-control`: buttons, fields, tabs) · `rounded-xl` 14 (cards) · `rounded-2xl` 18 (sheets, the dock) · full only for circles (avatars, dots, switches' thumbs) |

**Motion:** quick and physical, never decorative.
- Presses: `active:scale-95` on buttons, `0.92` on dock tabs, `0.97` on cards.
- Colour changes: `transition-colors` (≈150 ms); dock tabs 200 ms.
- Loading: skeletons pulse; spinners only inside small round buttons
  (pull to refresh, uploads).
- **Nothing looks like it did nothing.** A control that changes what's on
  screen (a sort, a filter, a page) wraps the result in `Pending`: the old
  result stays, dimmed, under "Sorting…" within 150 ms, and Cancel after a
  second aborts the request (pass the query's `signal` to `fetch`) and puts
  the control back (`useSettled`). Long jobs show a live dot, the stage
  they're on, a moving `ProgressBar` and a clock that ticks — never a
  static "working…" line. A list of jobs running now is `JobTile`s in a
  `List layout="tiles"`: how far along and the item it's on come first and
  biggest; speed, time left and updated sit below.
- **Nothing changes by itself.** Content moves only when the person acts:
  no auto-advancing carousels or rotating panels. A set of things to step
  through has a `Pager`. The one exception in apps is `HeroCarousel`, a
  page opener's slides: it moves on every 10 s, with prev / next arrows
  and a pause button at its top left, the time left drawn as a thin bar the
  screen's full width along its bottom edge, and it stops
  while hovered or focused (and in a hidden tab). Its slides are all laid
  in one cell, so it's always as tall as its fullest slide and the page
  under it never jumps.
- No page transitions, no parallax, no bouncing, no decorative hover zoom.

---

## 8. Components (`components/ui/kit.tsx` unless noted)

Every component is built on the shadcn/ui primitives jimbo.ui ships in
`components/ui/` (foundation). Those are shadcn's own files with **jimbo's
edits**, made when a primitive is added (`scripts/shadcn-add.mjs` does the
mechanical ones) and kept on every update: the `@/lib/cn` import; no
`dark:` classes (the tokens already follow light, mid and dark); no
`shadow-xs`/`shadow-sm`, and overlays at `shadow-md` (S8); control heights
from `h-control` / `h-control-sm` (K1); `rounded-lg` controls, `rounded-xl`
cards, `rounded-2xl` dialogs, never a pill badge (S2); `bg-muted` fields;
selected states as solid primary fills (S7); the dimmer
`bg-background/80`, never black (C1); no `next-themes` in `sonner`, toasts
top right (M4); and a few jimbo props — `Button loading`, `Card asChild`,
`Progress tone` / `size` / indeterminate, `Badge` brand variants. Apps use
them as they are (J2, J3).

| Kit component | Built on |
| --- | --- |
| `Sheet` | `drawer` (phones) / `dialog` (`sm` up) |
| `ConfirmSheet`, `useConfirm` | `alert-dialog` |
| `toast`, `Toaster` | `sonner` |
| `Menu`, `MoreButton`, `DropdownButton`, `JumpMenu` | `dropdown-menu`, `button` |
| `Popover`, `Tooltip` | `popover`, `tooltip` |
| `CommandPalette` | `dialog`, `badge` (its own listbox and query parsing) |
| `TextField`, `TextArea`, `DateField`, `FileDrop` | `field`, `input`, `textarea`, `card` |
| `SelectField`, `Tabs`, `ToggleGrid`, `SwitchRow`, `RangeField`, `ShareSliders` | `select`, `tabs`, `toggle-group`, `switch`, `slider` |
| `DataTable`, `Accordion` | `table`, `accordion`, `card` |
| `ProgressBar`, `JobTile` | `progress`, `card`, `badge` |
| `Section`, `LinkCard`, `StatTile`, `List`, `EmptyState`, `Loading` | `card`, `empty`, `skeleton` |
| `Badge` (status), `LinkChips` | `badge` |
| `BackButton`, `Pager`, `PillTabs`, `TopBarButton` | `button` |
| Heroes, `Page`, `ThemeDots`, charts, `AppShell`, `HeaderTitle`, `MapView` | Custom (no shadcn equivalent), on the same tokens |

| Component | Use it for |
| --- | --- |
| `PageHeader` | Every page's opener (L11): a compact hero — the theme's colours blurred the full width, pulled up under the top bar — with `back` (top left), eyebrow, a big title, count, `actions` (a `.controls` row), `lede` (what the page is for, a reading-width `Lede`) and `updated` (`{ at, note? }`: "Updated 12 min ago", for data worked out ahead of time). `pattern` and `tone` (which brand colour leads the blur) give each kind of page its own look (L12); `plain` is the old in-column header, for demos and headers inside a card |
| `BackButton` + `useRememberPages` + `parentPath` | Back to the page above, as it was left. `PageHeader back` and `Hero`/`Banner back` draw it |
| `ShareSliders` + `rebalance` + `normaliseShares` | Linked sliders that split one total (100%, 60 items, a budget): moving one moves the rest the other way in proportion, so they always add up to the total. Each shows its percentage and amount. `normaliseShares` when the total changes |
| `Hero` / `Banner` | Detail page header over a blurred image (full width) |
| `HeroSection` | Full-width page opener with no photo: eyebrow, big title, a line, actions, over a soft blur of the theme's colours (`pattern`, any of the backdrops, blurred on a glow until no line shows — never the pattern's crisp lines); `size="lg"` fills most of the first screen; `align="center"`. It tucks up under the top bar; pass `pullUp={false}` when something sits above it (as `Banner` and `Hero` take too) |
| `HeroCarousel` | `HeroSection` slides one at a time (`slides`: id, eyebrow, title, a line — facts only, no buttons, L11): always as tall as its fullest slide; prev / next arrows that wrap round, a pause button and "3 / 29" at the top left (`controlsAt="right"`: top right); moves on every `interval` (10 s), the time left a thin bar the screen's full width along the bottom edge (`timerAt="top"`: the top edge); stops while hovered or focused. `index` / `onIndex` to keep the slide in the URL |
| `JumpMenu` (`overlays.tsx`) | One tap to any page in a series or every page of a kind (N7): a `Menu` of links (`{ label, to, hint, current }`, `{ heading }` to group, `"divider"`), the current one ticked. A `DropdownButton` saying where you are ("Year: 2019") by default; `trigger` for a top-bar ☰ that lists every data page. The menu scrolls past 30rem |
| `FullBleed` | Any section edge to edge: a band (`tone`: `surface`, or a flat `accent` / `highlight` / `support` with its `on-` text), a strip of media (`flush`), a call to action. Content lines up with the page column unless `flush` |
| `RangeField` | A labelled slider (weight, spacing, strength…) with its value shown. Sliders that are shares of one total are `ShareSliders`, never independent `RangeField`s |
| `Section` | A titled card holding one block of content; `plain` drops the card (a grid of tiles under a title). In a grid row its card stretches to the tallest, content at the top |
| `Columns` | Sections or cards side by side: one column on phones, `count` 2 or 3 from `lg:` (`from="sm"` for earlier). Every row as tall as its tallest cell — symmetry |
| `List` + `ListGroupLabel` | A card of rows, optionally grouped (by month: a wrapper that starts with a `ListGroupLabel`); group labels are support text with an 8 px support dot, on a support wash fading right. `layout="tiles"` shows the same children as a grid of cards (one column on phones, two or three wider); `bare` drops the card for use inside `Section flush`; `maxHeight` caps a list of rows and scrolls inside the card, its bar always showing |
| `ColumnsPicker` + `useGridColumns` | How many columns one tile grid shows on desktop (L13): a small select in the section's action slot, shown from `lg`; *Auto* follows the app-wide setting; kept in the URL. Pass the value to `MediaGrid columns` or `List columns` |
| `LayoutSwitch` + `useListLayout` | Lets people pick rows or tiles for a `List` (small `Tabs` in the section's action slot); the choice is remembered per list in the browser |
| `EventRow` | A dated item. `DateBlock` on the left, a `status` dot (`{ tone, label, live? }` — `live` pulses); `to` to go somewhere or `onOpen` to open something in place (a log in a `Sheet`); `selected`/`onSelect` for select mode |
| `EntityRow` | A named thing with an avatar (a person, a place); `avatarText` puts a short code or number in the placeholder avatar instead of initials. A picture that fails to load falls back to the placeholder (`useImageOrFallback`), never a broken image — as in `MediaCard`, `EventRow` and `Hero` |
| `DateBlock` | A tear-off calendar ticket (52 px wide, 12 px radius, `surface-2`): the month on a solid highlight band, the day big below, then the year or weekday |
| `MediaCard` + `MediaGrid` | Image-led grid card (`aspect="portrait"` for posters), always in a `MediaGrid`, whose `size` sets the card size: `sm` (three across on phones, up to six wide, smaller type: covers, a big collection to scan), `md` (two, up to four; the default) or `lg` (one, up to three: a few things to feature). The desktop count follows the app-wide setting or `columns` (L13) |
| `ScrollingLine` | One line that never wraps: an ellipsis, and the rest scrolls into view while its card (the nearest `group`) is hovered or focused. `MediaCard`'s title and sub line; any card's line that has to stay one line |
| `LinkCard` | A card that navigates (eyebrow / title / sub); `accent` for the one to notice |
| `StatTile` / `StatGrid` | Headline numbers (`accent="accent"` / `"highlight"` / `"support"`: the number in that colour, an 8 px dot by the label and a soft pool of it in the corner); `trend` adds a `Sparkline` of recent values under the number; `to` makes the whole tile one link (N4) |
| `Sparkline` | A small trend with no axes: a 2 px line in the subtle text colour, the latest point as a dot in the tone |
| `TrendChart` | Change over time: one to three lines over the same labels, one y-axis. One series gets a 10% wash; tap, drag, hover or arrow-key to move the crosshair, and the readout above shows the values there (latest by default) and names each series |
| `BarChart` | Comparing a few amounts in one tone: `horizontal` rows (label, bar, value at the tip; `to` links each) or `vertical` columns over a short run (tap a column to read it; the largest shows until you do). Vertical columns with a `to` go there on a click or Enter; on touch the first tap reads and a second tap goes, and the readout gets an *Open* link |
| `ThemeDots` | The motif: the theme's three colours as flat 8 px shapes side by side (4 px apart) — circles, or the theme's `motif` shape. In empty states and brand moments — never above a page title |
| `RankedList` | Top-N lists with counts |
| `Timeline` | Milestones in order along a vertical line, in `groups` (a year, a month, a phase; `label` optional). Each milestone is a card beside the line: a `when` line (the date and what kind of milestone it is), title (two lines), `body` (three), `meta` (one), an optional `badge`. Its 10 px dot sits on the line, outside the card (S3, S4), in a `tone` — `accent`, `highlight`, `support` or `muted`, one per kind — which the `when` line names too, so colour is never the only cue. With `to` the whole card is the one tap target (K7); `action` puts one small button under the card, outside its link |
| `Part` + `Lede` | A part of a long page, bigger than a `Section`: a rule above (none with `first`), an eyebrow with an 8 px dot in its `tone`, a big heading, at most one `action`, an optional `lede`, then its sections. `Lede` is the muted reading-width line on its own; `UpdatedLine` and `timeAgo` the freshness line |
| `Heatmap` | A calendar heatmap: a square per day, a column per week (Monday at the top), five solid steps of the accent's shades by percentile. `days` ({ date, value }, oldest first), `unit`, `to(date)` for days with something; `trim` (default) leaves off the earliest weeks on narrow screens, off wraps them onto more blocks (L3) |
| `CodeBlock` | Text to copy as it is (a command, a config line) in monospace, wrapped, on the field surface, with Copy beside it ("Copied" for two seconds); `prominent` makes Copy primary, `onCopy(ok)` lets the page toast |
| `SearchField`, `SelectField` | Search and single-choice filters (select on phones) |
| `Tabs` | 2–4 mutually exclusive views (segmented); `size="sm"` is a compact inline switch for a section's action slot |
| `PillTabs` | Filters on desktop; `scroll` for a page's own sections when there are more than fit (one row that scrolls sideways) |
| `Pager` | Paging long lists |
| `Sheet` | **The** modal: bottom sheet on phones, dialog on desktop |
| `ImageViewer` | Full-screen image (tap or Escape to close) |
| `Badge` / `Tone` / `TONES` | A status as a chip, in one of the fixed tones; `dot` puts a status dot before the label (`live` pulses it) |
| `EmptyState` | No data — `ThemeDots` above, say what's missing and offer the next step; `fill` takes the rest of the page |
| `Page` | Every page's frame: its sections `gap-6` apart, filling the screen's height so a short page's `Section fill` reaches the dock |
| `Loading` | Skeleton shaped like a page (never a bare spinner) |
| `Pending` / `useSettled` | A result being replaced after a control changed: dims it, says what's happening, offers Cancel that reverts the control |
| `ViewSwitch` | Two or three views of one page as links (List ⇄ Map) |
| `HeaderTitle` (`components/HeaderTitle.tsx`) | The app's name as header text — the brand; `sm`/`md`/`lg` (22/30/44 px) |
| `ColorPicker` (`components/ColorPicker.tsx`) | Inline colour picker: saturation/brightness field, hue slider (28–36 px thumbs, drag anywhere), one row of 8 quick swatches, hex box with a preview chip. Never the native `<input type=color>` — it opens a different dialog on every platform |
| `ThemeCard` (`routes/config/ThemePanel.tsx`) | A theme shown as a miniature of the app (header text, a support avatar, a support eyebrow, a date-row card, a primary and a secondary button — all flat), then a row of circles — every colour it uses, inferred ones with a dashed ring — then name and vibe |
| `KeyValue` | A read-only label and value: `inline` (settings, a job's details) or `stacked` (a detail page's facts). Several in a `List` or `Section flush` |
| `SwitchRow` | One setting on or off: the whole row is the switch (`role="switch"`), a label and a hint |
| `Autocomplete` | Pick an existing record as you type, or `onCreate` a new one: a field with matches under it (arrow keys, Enter, Escape). For several, keep picks as chips above it |
| `ToggleGrid` | Several picks from a small fixed set (days, tags, notes) as a wrapping grid of 44 px toggle buttons, picked ones a flat accent fill with `aria-pressed`; `columns` on phones, `smColumns` wider. For one pick use `Tabs` |
| `LinkChips` | Related things to go to, as a wrapping row of 44 px linked chips: a label, an optional muted second label and an optional 8 px dot (`tone`). See-also links, neighbours, tags that navigate |
| `FloatingBar` | A status line and its actions floating above the dock (`--above-dock`): the save bar, a select-mode action bar, Start/Stop for something running (`live` pulses its dot). Pad the page bottom (`pb-20`) so it never covers the last section |
| `LIVE` | Add to a status dot to pulse it while something is happening; `RowStatus.live` and `Badge live` use it |
| `ThemeScope` | Part of the page in another theme — colours, type and backdrop (`themeVars`, `.theme-scope`) — without touching the rest: previews, looks side by side |
| `MapView` (`components/MapView.tsx`) | **Every map.** Places as flat highlight pins (`markerIcon`) on the theme's map style (`mapStyles`: the page colour for land, accent-tinted roads, no POIs or transit); `size` `compact` (160 px, inline, no gestures), `full` (320 px), `fill` (a map page). With no Maps key it draws a themed preview with the same pins |
| `MapPinCard` (`components/MapView.tsx`) | The chosen place on a map page, floating above the dock: name, a line, what's there |
| `JimboConfigPage` / `JimboConfigLink` (`routes/JimboConfigPage.tsx`) | The jimbo-ui config section (section 1) and its one link in settings |
| `Button` (`ui/button.tsx`) | `primary` (one per view), `secondary`, `ghost`, `danger`; `sm`/`md`/`lg` |
| `TextField` (`ui/forms.tsx`) | One line of text with its label, a hint, and an inline error in the highlight colour once there is one (say what to do); `prefix` / `suffix` inside the field; `optional` marks it beside the label |
| `TextArea` (`ui/forms.tsx`) | Several lines; grows with its text up to `maxRows`; with `maxLength` it counts what's left once close |
| `DateField` (`ui/forms.tsx`) | A date, time or both (`type`) with the platform's own picker, in the page's light or dark scheme; `min` / `max` |
| `FileDrop` (`ui/forms.tsx`) | Pick or drop files: a dashed area that is the button, then the files with sizes and Remove; turns away wrong types and files over `maxSize`, saying why |
| `Menu` + `MoreButton` (`ui/overlays.tsx`) | Actions on one thing from the ⋯ button, or a list of choices from a `DropdownButton` trigger: arrow keys, Home / End, a letter; `danger` items last after a `"divider"`, in the highlight colour, confirmed |
| `DropdownButton` (`ui/overlays.tsx`) | **The trigger for anything that opens choices** (a `Menu` of options, a sort, a filter `Popover`): looks like a select — field surface, the value (`label` adds a muted prefix: "Sort Newest"), a down arrow that turns while open. `h-control`, or `size="sm"`; spread the trigger props on it |
| `Popover` (`ui/overlays.tsx`) | A few controls by their button (filters, a quick setting), open while you use them; anything that saves is a `Sheet` |
| `Tooltip` (`ui/overlays.tsx`) | A label for an icon-only control on hover or keyboard focus. Never the only place something's said — touch screens don't show it |
| `CommandPalette` + `useSpotlight` (`ui/overlays.tsx`) | **App-wide search** (Spotlight), on ⌘K / Ctrl+K and a top-bar search button on phones: live results from the app's `providers`, grouped, with thumbnails and a preview pane on wide screens; `facets` turn `key:value` tokens into chips; recent picks and `suggestions` while empty; `commands` (go to a page, run an action) after the results. `useSpotlight` keeps it in the URL (`?find=`); `useCommandPalette` is the older local-state hook. See section 9, *App-wide search* |
| `SearchTrigger` / `SearchIcon` (`ui/overlays.tsx`) | A button that looks like a search field and opens the palette (an explore page's search bar), and the magnifier for the top-bar `TopBarButton` |
| `toast()` + `Toaster` (`ui/feedback.tsx`) | **Every pop-up notice.** A short, timed note in the top right, under the top bar (full width on phones), newest on top: done (accent dot), info (support), error (highlight). Each goes by itself — 4 s, 6 s with an `action`, 8 s for an error — with a thin line showing the time left; hovering or focusing holds it. One `action` (Undo, Retry); three at most. `Toaster` sits in the shell once; `toast()` works from anywhere |
| `ConfirmSheet` / `useConfirm` (`ui/feedback.tsx`) | Asks before something destructive or surprising: the question, what survives, Cancel and the action in its own words (`danger`: a highlight fill, Cancel focused). `useConfirm` makes it one `await` |
| `ProgressBar` (`ui/feedback.tsx`) | How far along a job of known length is (`value` / `max`, `format`); no `value` is a slow sweep while the length is unknown; `size="lg"` is the thick bar for the one job a tile is about |
| `JobTile` (`ui/feedback.tsx`) | One job in a "running now" list, in `List layout="tiles"`: its name and a status `Badge`, then a large percentage with the count beside it ("57 of 3,384") and a thick bar, the item it's on in readable type on an accent wash (`current`, "Now"), a `note` line, and `facts` (speed, time left, updated) in a compact block at the bottom. `state` `done` / `failed` / `queued` is compact: name, badge (`stateLabel` for "Done 09:15"), note. Text wraps; nothing is cut short |
| `Stepper` (`ui/feedback.tsx`) | Where you are in two to five steps: numbered circles joined by a line, done ones ticked (`onStep` goes back), "Step 2 of 4 · Details" on phones |
| `OfflineBanner` / `UpdateBanner` (`ui/feedback.tsx`) | Slim bars stuck under the top bar, first thing on the page: offline with changes waiting (fixed yellow; `useOnline`), or a new version ready (Reload / Later) |
| `DataTable` (`ui/data.tsx`) | Many records with several facts: a sortable table on desktop (`sortValue` per column; `aria-sort`), a row per record on phones with the `primary` column as its title — never a sideways-scrolling table. Keep `sort` in the URL |
| `Accordion` (`ui/data.tsx`) | Sections that fold (FAQs, advanced settings), one open at a time unless `multiple`; shadcn `Accordion` in one card |

Plain elements use the primitives (`Card`, `Input`, `Button`, `Badge`,
`Label`) — the old `.card`, `.field`, `.btn`, `.chip`, `.label` and
`.glass` classes are gone. CSS classes left: `.link-action`, `.eyebrow`,
`.meta`, `.h-page`, `.h-section`, `.controls`, `.control-grid`,
`.scroll-area`, `.divide-etched`, `.fade-out`, the dots and the motif.

Adding a component: check the catalogue first (section 13). Build it from
tokens, put it in the kit, add it to the Style guide panel and the
showcase, list it here, and set its catalogue entry to `kit`.

---

## 9. Patterns

### The component menu — ask before building a section

When building a feature or a section of a page, **ask the user first:
"What existing component do you want to use for this feature or section's
styling?"** — with a handful of fitting options from this menu (and
"something new"). Don't pick silently, and don't invent a new component when
one here fits.

| For… | Options |
| --- | --- |
| **Opening a page** (every page has one, L11) | `PageHeader` (a compact hero) · `HeroSection` (full-width, blur, no photo) · `HeroCarousel` (several of them, one at a time) · `Banner` / `Hero` (over a blurred photo) |
| **A list of things** | `List` + `EventRow` (dated, with date tickets) · `List` + `EntityRow` (people, places, with avatars) · `RankedList` (top-N with counts) · `MediaGrid` of `MediaCard`s (image-led, three sizes) · `LinkCard` stack (a few destinations) |
| **Things in order over time** | `Timeline` (milestones along a line, grouped by year or month) · `List` + `EventRow` grouped with `ListGroupLabel` (dated entries, many of them) |
| **Numbers** | `StatGrid` + `StatTile` (headline numbers, coloured dots) · `RankedList` (counts in a list) · `Section` with big `font-display` numbers |
| **A block of content** | `Section` (titled card; side by side in `Columns`) · plain `.card` · `FullBleed` band (`surface`, or a brand colour) · `Sheet` (when it's a choice or a short flow) |
| **Calls to action** | primary `Button` · `LinkCard` with `accent` · `FullBleed` band in a brand colour · `HeroSection` actions |
| **Switching views** | `Tabs` (2–4, segmented) · `PillTabs` (wrapping filters) · `ViewSwitch` (list ⇄ map) · `SelectField` (many options on phones) |
| **Finding things** | `SearchField` (one list) · `CommandPalette` with providers (app-wide, Spotlight) · `SearchTrigger` (a page's search bar that opens it) · `PillTabs` filters · `SelectField` sort · `Autocomplete` (pick or add a record) |
| **Picking several** | `ToggleGrid` (a small fixed set) · `Autocomplete` with chips (many records) · `SwitchRow`s (named on/off settings) |
| **Related things** | `LinkChips` (a wrapping row) · `LinkCard` stack (a few, with a line each) · `List` + `EntityRow` |
| **Empty or loading** | `EmptyState` (with `ThemeDots`) · `Loading` skeleton |
| **Status** | `Badge` (detail pages) · status dot on rows · `DateBlock` ticket |
| **Taking input** | `TextField` · `TextArea` · `DateField` · `FileDrop` · `SelectField` · `RangeField` · `SwitchRow` |
| **Actions on one thing** | `Menu` (⋯) · `Popover` (a few controls) · `Tooltip` on icon buttons · `CommandPalette` (⌘K, app-wide) |
| **After an action** | `toast()` (done, Undo) · `ConfirmSheet` (before a destructive one) · inline `TextField` errors |
| **Work in progress** | `JobTile`s in `List layout="tiles"` (jobs running now) · `ProgressBar` (known length) · `Stepper` (a flow of steps) · `FloatingBar` (running now) · `OfflineBanner` / `UpdateBanner` |
| **Many records** | `DataTable` (several facts each, sortable) · `List` + rows (one or two facts) · `Accordion` (content to fold away) |
| **Settings** | `SwitchRow` (on/off), `KeyValue` (read-only), `TextField`, `SelectField`, `RangeField`, `Tabs`, `Section` cards |
| **Page width** | column (default) · wide · full (`AppShell width`) |
| **Places** | `MapView` (`compact` inline, `full` in a section, `fill` as a map page) + `MapPinCard` · `List` + `EntityRow` with `ViewSwitch` list ⇄ map |

Ask with the options as choices (Claude Code's question tool where it's
available), one question per feature or section, recommending one. Then
build with that component and its variants, adapted to the app's content.

### App-wide search (Spotlight)

One search for the whole app: `CommandPalette` with `providers`, opened by
⌘K / Ctrl+K, a top-bar search button (`TopBarButton` + `SearchIcon`; phones
have no ⌘K) and, on a page that's mostly searching, a `SearchTrigger`.

- **Providers** are the app's: `{ id, label, search(query, signal), pick,
  preview?, more?, limit?, debounce? }`. `search` gets `{ text, filters }`
  and an `AbortSignal` (pass it to `fetch`); it runs after `debounce` ms
  (120) and is aborted when the query moves on. Each provider is a group,
  in the order given, `limit` rows (5) and *See all* (`more`) to a results
  page that holds the query in its URL. A provider returns nothing for a
  filter it doesn't know.
- **Results** are plain data (`SpotlightItem`: `id`, `title`, `subtitle`,
  `meta`, `image`, `round`, `data`), kept as recent picks. `image: null`
  draws the theme's motif in the thumbnail; leave `image` out for none.
- **Filters** are `key:value` tokens for the `facets` the app declares
  (`{ key, label, values?, hint? }`): finished ones become chips (tap to
  take off, Backspace in an empty field takes the last), `values` are
  offered as you type, ranges are the app's to read (`size:2-4`).
  `parseQuery` / `formatQuery` read and write the same text.
- **Empty**, it shows recent picks (under the app's storage prefix,
  `recentKey`; *Clear* empties them), `suggestions` (searches to try) and
  the facets, then the commands.
- **Preview**: a provider's `preview(item)` fills a pane beside the results
  at 768 px and up; phones don't show it, so a result's row says enough on
  its own.
- **Keys**: arrows move, Tab / Shift+Tab jump between groups, Enter opens,
  Escape closes. Every row is 44 px or more, rows with a thumbnail 56 px.
- **URL**: `useSpotlight()` keeps the query in `?find=` (replacing the
  entry), so a refresh or a shared link reopens the same search. Spread its
  `bind` into the palette. Picking closes it, then calls `pick`.
- **Commands** still work as before (`commands`), listed after the results
  and hidden while a filter is set.

### App archetypes — ask before starting an app

A new app starts from an archetype: a ready-made shape (tabs, width, the
component for each main page, a backdrop) that the component menu then
fills in. **Ask which one fits** (with the closest recommended), or mix two.

| Archetype | For | Tabs (dock) | Width | Main pages | Backdrop |
| --- | --- | --- | --- | --- | --- |
| **Catalogue** ★ | A log of dated entries, the people and places in them, and numbers about it all (from the pilot app) | Home · Entries · People · Places | column | Home: `HeroSection`, `StatGrid`, "Coming up" `EventRow`, `RankedList`; Entries: `SearchField`, `PillTabs`, grouped `List` + `EventRow`, select mode, `Pager`; Entry: `Hero`, `Section`s, a compact `MapView`, edit in a `Sheet`; People: `EntityRow`; Places: list ⇄ map (`ViewSwitch`, `MapView fill`, `MapPinCard`) | ripples |
| **Single-page dashboard** ★ | One screen that answers "is everything fine?" for jobs it watches (reports, syncs, checks, builds) | none, or Home · Runs · Settings | column | One page: a verdict line (accent fine, highlight needs a look), `StatGrid` with `trend` sparklines, jobs as rows or tiles (`List` + `LayoutSwitch`: status dot that pulses while running, last run, a Run button, errors inline), charts (`BarChart` of runs per day, `TrendChart` of run times), recent runs as `EventRow` opening a log in a `Sheet`, settings as label / value rows | dots or none |
| **Status monitor** ★ | The services you run — are they up, how fast do they answer, how are they reached — with a way into each (self-hosted apps, sites, devices, APIs) | none, or Status · Settings | column | One page: `PageHeader`; the connection they go out through (`Section` of `KeyValue` rows, a status `Badge` in its action slot); `StatGrid` (up, average response, uptime, checks, with `trend`); services as rows or tiles (`List` + `LayoutSwitch`: status dot, name and what it is, how it's reached, its last answer, recent checks as a row of flat dots, an *Open* button disabled while it's down); history over a range (`Tabs size="sm"`) as `TrendChart`s and `BarChart`s | contours or none |
| **Tracker** | Logging things you do, see or collect over time | Home · List · Add · Stats · Me | column | Home: `HeroSection` or `PageHeader`, `StatGrid`, "Coming up" `List` + `EventRow`; List: `SearchField`, `PillTabs`, grouped `List` + `EventRow`, select mode; Detail: `Hero` / `Banner`, `Section`s; Stats: `StatGrid`, `RankedList` | glow or dots |
| **Collection** | A library of items with pictures (records, books, recipes, gear) | Home · Browse · Add · Lists · Me | wide | Browse: `SearchField`, filters, `MediaCard` grid; Detail: `Hero` with the image; Lists: `LinkCard`s | geometry or none |
| **Dashboard** | Numbers and status at a glance (finance, health, ops) | Today · Trends · Alerts · Settings | wide | `StatGrid` (with `trend`) first, `Section` cards with `TrendChart` and `BarChart`, `RankedList`, `Badge` statuses, `FullBleed` band for the headline | dots or contours |
| **Directory** | People, places or groups to find and visit | Find · Map · Saved · Me | column | `SearchField`, `List` + `EntityRow` (avatars), `ViewSwitch` list ⇄ map, Detail `Hero` (square) | contours |
| **Planner** | Plans, events and schedules ahead | Upcoming · Calendar · Add · Me | column | Upcoming: `List` + `EventRow` grouped by month (date tickets); Detail: `Banner`; adding in a `Sheet` | waves or ripples |
| **Showcase** | A public face: a landing page, a portfolio, an event site | Home · About · Work · Contact | full | `HeroSection` (`lg`), `FullBleed` bands, `MediaCard` grid, `LinkCard` calls to action | burst or shapes |
| **Tool** | One job done well (a calculator, converter, generator) | — (or ≤ 3) | column | One `Section` with fields, `RangeField`s and `Tabs`; the result in a `card`; history in a `List` | dots or none |

★ **Templates you can copy:** `reference/web/src/archetypes/catalogue.tsx`,
`dashboard.tsx` and `status.tsx` are working pages built from the kit with neutral
example content (try them on the showcase's Archetypes tab). Copy the file,
rename the nouns, map the statuses, swap the sample data for the app's API,
and drop or add tabs. The other archetypes are shapes to build from the
menu.

Every archetype keeps the jimbo-ui config section and the rules above; the
archetype only sets the starting shape.

- **Theme editor:** templates first, in categories with a search box (tap
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
- **Confirm before destructive or surprising actions** (`ConfirmSheet` /
  `useConfirm`), in plain words; say what survives ("Its events stay in
  your list"), and name the action on its button ("Delete list", never
  "OK"). After it, a toast with Undo where the action can be undone.
- **Toasts** (`toast()`) say that something happened, briefly, and offer one
  action at most. They're the one way to pop up a notice — a result after an
  action ("Saved"), or a request that didn't go through ("Couldn't start a
  sync · a sync is already running", tone `error`). Always the `Toaster`'s:
  top right, timed, never a card of the app's own floating over the page.
  Never for errors that need fixing in a form (those are inline) or
  anything that must stay to be read (a banner or the page itself).
- **Background work** (uploads, syncing) shows as a small progress ring in a
  corner: never block the
  screen; allow pause/cancel; warn before closing with work pending.
- **Gestures:** pull to refresh at the top of a page; horizontal swipe between
  siblings (days of a multi-day event); swipe down to close full-screen media. Mark
  carousels/maps `data-no-swipe`.
- **Charts:** always the kit's (`TrendChart`, `BarChart`, `Sparkline`,
  `StatTile trend`), in a `Section` titled with what's plotted. Pick the
  form first: one number is a `StatTile`, a few amounts are bars, change
  over time is a line. Series take accent, support and highlight in that
  order, three at most — more is a table or several charts — and one
  y-axis only. Colour is never the only way to tell series apart (theme
  colours are brighter than a chart palette would be, and people pick their
  own): one series has no legend, two or three are named in the readout
  beside a line key, and every chart carries a hidden table of its numbers.
  Text stays in text colours; only marks take the series colour. Nothing is
  hover-only: a tap reads a value too.
- **Rows or tiles:** a list people scan by name is rows; one where each
  item has more to show (a status, a button, a line of detail) can offer
  tiles too, with `LayoutSwitch` — same children, remembered per list.
- **Lists:** newest first for the past, soonest first for the future; group by
  month; status as a small flat dot in rows (`STATUS_DOT` + the tone's
  `dot`: a 10 px circle with a slight dark outline), a badge on detail pages.
- **Counts on tabs:** a small highlight badge with on-highlight text.
- **Errors:** inline, near what failed, in the highlight colour; keep the
  user's input.
- **Offline / pending:** a slim yellow banner under the top bar
  (`OfflineBanner`); a waiting service worker shows `UpdateBanner`.
- **Maps:** always `MapView`, in the theme's map style with flat highlight
  pins. A map page fills the page under the top bar, with `ViewSwitch`
  (List | Map) floating top-left and `MapPinCard` for the chosen place above
  the dock; inline maps are `size="compact"` inside a `Section`. Pick a
  place from a list to focus it on the map. The Maps key is
  `VITE_GOOGLE_MAPS_API_KEY`; without it the preview still shows the pins.

---

## 10. Icons

- `lucide-react` (shadcn's icon set): stroked in `currentColor` with round
  caps and joins, 24 px in the dock and top bar, 16–20 px inline (`size-4`,
  `size-5`); components size the icons inside them. A dock's own tab icons
  may be inline SVG paths in the same style (`DockIcon`).
- Active dock icons get a 22% fill (`fill="currentColor" fillOpacity={0.22}`).
- Icon-only buttons need `aria-label` (and `title` for shortcuts).

---

## 11. Accessibility checklist

- Readability targets in section 3 (the Colours tab warns when they're missed;
  every template passes).
- Focus is visible: `focus-visible:ring-[3px] ring-ring/50` on every
  control (the primitives do it).
- Every interactive element is a real `button`/`a`; toggles use
  `aria-pressed`/`role="switch"`; tabs use `role="tab"`/`aria-selected`;
  the picker's field and hue bar are `role="slider"`.
- Images: meaningful ones get `alt`; decorative ones `alt=""`.
- Nothing is hover-only — touch screens show controls (`[@media(hover:none)]`).

---

## 12. Don'ts

- No raw hex, `rgb()`, arbitrary colour values or Tailwind palette colours
  (`bg-zinc-900`, `text-white`, `bg-black/50`) — use the token names and the
  `-foreground` colours.
- No shadows, gradients, glows or blur on components, and no see-through
  surfaces (S8). No `.glass`, `.card`, `.btn`, `.field` or `.chip` classes —
  they're gone; use `Card`, `Button`, `Input`, `Badge`.
- No `npx shadcn` in an app, no shadcn component jimbo.ui doesn't ship, no
  other UI library, and no restyling a jimbo.ui component through
  `className` (J2, J3). Missing something? Section 14.
- No second modal style, no full-screen blocking spinners.
- No hard bottom edge on a full-width image or gradient header: no border
  under it, no fade to solid `bg`, no `overflow-hidden` cut. Fade its
  background layer out with `.fade-out` (section 7).
- No horizontal scrolling rows, no hover-only actions.
- No hidden scrollbars, and no cards side by side at different heights.
- No native colour inputs, and no browser alerts except as a last-resort
  error.
- No new font sizes outside the scale in section 5.
- No circle inside a box, and no two controls side by side at different
  sizes.
- No button that opens choices without looking like a dropdown.
- No glyphs or letters as icons (`✕`, `‹ ›`, `★`, `i`), no `href="#"`, no
  `uppercase` utilities (use `.eyebrow`).
- No content that changes by itself.

---

## 13. One library, no duplicates

The UI library grows in one place and every app feels the same. **Each
fact lives in one place:**

- **jimbo-ui** keeps the list of apps (`registry/apps.json`: name, repo,
  when it registered — nothing else) and its **catalogue**
  (`registry/components.json`): the shared components (each with the
  `shadcn` primitive it's built on) and the generic candidates an app has
  built.
- **Each app** keeps everything about itself in its `jimbo-ui.json`:
  version, auth, web root, the catalogue components it uses, and its own
  components (domain or candidate, and what they match).
- **`node scripts/inventory.mjs`** puts them together when you need the
  whole picture — reading each app's `jimbo-ui.json` as pushed to GitHub
  (`gh`), and its checkout for the code checks (`~/Development/<name>`, or
  `--apps-dir` / `JIMBO_APPS_DIRS`; a checkout that disagrees with GitHub
  is flagged as stale). `--json` prints the assembled registry, with the
  apps that use each component.

So updating an app never touches jimbo-ui, nothing drifts, and app details
stay out of jimbo-ui.

Each catalogue entry has an `id`, a canonical `name`, its `purpose` (one
sentence on what it's *for*, not what it looks like), a `tier`, its
`source` (the kit path), `aliases` (other names the same thing goes by —
"Modal", "Drawer", "BottomSheet" → `Sheet`) and `variants` (the props
that cover differences between apps).

| Tier | Means |
| --- | --- |
| `foundation` | Copied into every app, never edited there: the shadcn primitives (`Button`, `Card`, `Input`…), the engine, `globals.css` |
| `kit` | In `reference/`, composed from the primitives; an app adapts wiring only, never looks (J3) |
| `pattern` | A behaviour the guide describes (save bar, offline banner, background work ring) |
| `candidate` | Built in an app, generic — may be promoted. In the catalogue with a neutral name; the app's copy is in its `jimbo-ui.json` |
| `domain` | Only that app's (its add flows, its data tools). Listed in the app's `jimbo-ui.json` only — **never in jimbo-ui** |
| `pending` | A temporary local version while its PR to jimbo-ui is open (J5). In the app's `jimbo-ui.json` (`components.pending`) only, removed on release |

**The dedupe rules:**

1. **Match by purpose and behaviour, not by name.** Before anything is
   added, compare it against every catalogue entry and its aliases, and
   what the other apps have built (`inventory.mjs --json`). A
   "HistoryRow" that shows a dated thing with a status is an `EventRow`; a
   "StateChip" that shows a status as a short label is a `Badge`.
2. **A match is that component.** Record the app's name as an alias. If it
   needs to differ, add a variant prop to the canonical component. **Never
   add a second component.**
3. **Promotion:** a component moves into the kit when two or more apps need
   it, or at once if it's clearly generic. Promotion means a generic rewrite
   with neutral names, plus the kit, this guide, the showcase and the Style
   guide panel, released as a feature (a 0.x.PATCH, drop-in) with "Apps must: Nothing" and an
   **Available** list. Apps adopt it when they consolidate.
4. **Domain components stay in the app.** They're listed in its
   `jimbo-ui.json` so nobody rebuilds them as something generic by mistake,
   but they never come here.
5. **An app session writes only to its own `jimbo-ui.json`.** jimbo-ui
   changes only when an app registers (its line in `apps.json`) or a new
   generic candidate joins the catalogue — pull jimbo-ui first.

`node scripts/inventory.mjs` prints the component × app table, candidates
more than one app has built, kit components no app uses, apps behind the
latest release, raw hex or palette colours in app code (split into
hand-written status tones, black or white overlays, and raw colours), and
apps whose config section is missing, split up or gated wrong.
`registry/apps.json` holds app names and repos only, so it's the one
place app names appear in jimbo-ui.

---

## 14. Amending jimbo.ui (the PR route)

jimbo.ui is binding (J1), so an app can't add its own rules, tokens,
variants or components. When it needs something jimbo.ui doesn't have, the
**only** route is a pull request to `ryanjpeterson/jimbo-ui` proposing a
generic amendment (J4). The skill's "Amend jimbo.ui" workflow walks it.

**Stay generic.** jimbo.ui never holds an app's code, names, artwork,
sample content or domain terms. Bring back only the pattern, rewritten
with neutral names and examples ("a rating field", not the app's word for
it). Before committing, the stay-generic scan in jimbo-ui's `CLAUDE.md`
must print nothing. A component that matches an existing one by purpose is
a variant of it (section 13), never a second one.

**What goes in the PR:**
- **The need**, in generic words, and why the existing rules and
  components don't cover it.
- **A rule**, if it's one: a line in `rulebook.md` in its group, with the
  next free number in that group. Numbers are never reused or reordered —
  a rule that goes away leaves its number empty; rules are listed in the
  order they were added within a group where reading order matters
  (L7, L10, L11, L8…). A new kind of rule gets a new group with a new
  letter, agreed with Ryan. The guide section it points to explains it.
- **A token:** added to the one mapping in `globals.css` (and to the
  engine if it's a new derived colour), with `node scripts/contrast.mjs
  --check` passing for every template.
- **A component or variant:** a new shadcn primitive goes into foundation
  with `node scripts/shadcn-add.mjs <name>`, then jimbo's hand edits
  (section 8: control heights, radius, flat surfaces, solid selected
  states); a composed component goes into the kit, built only from the
  primitives and tokens. Either way: the Style guide panel, the showcase,
  section 8, and a `registry/components.json` entry with its `shadcn` base.
- **The record:** a `CHANGELOG.md` entry under Unreleased with its
  **Update** type (breaking, feature or fix) and **Apps must**; this
  guide's change log, the README and `docs/explain` in step.
- **The checks:** typecheck, contrast, `versions.mjs`,
  `claude plugin validate --strict .`, the stay-generic scan, and
  `test:screens` (screenshots at 375 px in a light, mid and dark look go
  in the PR).

Ryan reviews, merges and releases it; a PR never sets a version number.

**Meanwhile, in the app (J5):** wait for the release, or build a temporary
local version in `src/components/jimbo-pending/`, its first line
`// jimbo-ui pending: <PR url>`, made only from jimbo.ui components and
tokens, and listed in `jimbo-ui.json` `components.pending` (`name`,
`path`, `pr`, and `replaces` if it stands in for something). The update
that brings the release deletes it and uses jimbo.ui's version; an audit
flags any pending file that isn't listed, or whose PR has shipped.

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
- **0.7.0 (2026-10-30)** — Circles: every circle flat (no orbs, outlines or rings),
  side by side, at fixed sizes; `.dot-*`. Backdrops: abstract patterns (ripples, waves, contours,
  geometry, light burst, dots, arrows, shapes) over a solid, gradient or glow
  base, with strength and size. Full width: `FullBleed`, `HeroSection`,
  `AppShell width`. The component menu: ask which component to use before
  building a section; app archetypes to start from. *Share this look*: export and import themes (a theme
  file, the brand.config line, tokens.css), so the showcase is a playground
  for apps; Docker compose for the showcase. Themes use only real colours (and their shades); every
  team has Home and Away looks, some Toronto and Ottawa teams Retro ones;
  provinces sit on their flag's field. Tonal inference, vibrancy and contrast
  sliders. 25 fonts (incl. blackletter and Marcellus) with weight and spacing
  sliders. No dots above page titles. Templates in five categories (Everyday, Holidays,
  Countries, Provinces, Sports) with search; 169 new themes from real
  colours (every NHL, NBA, MLB and NFL team, Toronto, Ottawa and Chicago
  teams in other leagues, more countries, the provinces and territories) via
  `scripts/template-from-colours.mjs`. Every app has the admin theming pages (Brand & theme
  and Style guide) built in, nearly identical to the reference and adapted
  to the app; an app without a server saves the theme in the browser. Flat fills: every coloured shape (buttons, active tabs
  and pills, date bands, orbs, avatars, status dots, swatches) is flat with a
  slight outline — no gloss, gradients or glows. Less glassy and less round: mostly solid frosted surfaces
  and a smaller radius scale (cards 14, buttons 10, chips 8; circles kept for
  the motif). Type styles: sans, mono or serif for headings and body.
  Clearer separation: borders step to 1.8:1 against cards
  (was 1.55:1) and cards to 1.2:1 against the page (was 1.16:1); rows are
  divided by etched lines (`.divide-etched`), including rows grouped under a
  label, and are a little taller (76 px).
- **0.8.0** — One library, no duplicates: `registry/` (apps and every UI
  element across them, with purpose, tier, aliases and variants), the
  dedupe and promotion rules (section 13) and `scripts/inventory.mjs`. One
  **jimbo-ui config** section per app at `/jimbo-ui` (Theme, Brand, Style
  guide, About, App) replaces the Brand & theme and Style guide pages;
  admin-only when the app has auth, checked on the server too. `MapView`
  and `MapPinCard` for every map, `ThemeScope` and `themeVars` for theming
  part of a page. Two archetypes as templates to copy: Catalogue and
  Single-page dashboard. The showcase opens on looks to step through, with
  Components, Archetypes and Settings tabs. Promoted to the kit: `KeyValue`,
  `SwitchRow`, `Autocomplete`, `Badge dot`, `EventRow onOpen` and live
  statuses (`LIVE`). Every look comes once, in light, mid and dark
  (`FAMILY_SETS`, `atTone`), replacing Home / Away and Everyday's three
  lists; a Games category with Legend of Zelda looks. Backdrops in four
  groups (abstract, geo, vintage, texture — 21 patterns) with contrast and
  saturation sliders.
- **0.8.1** — Full screen on phones: `viewport-fit=cover` required
  (and added by `applyTheme` when missing), the backdrop a fixed
  full-screen layer, page colour on `html`, `100dvh` minimum height, and
  the safe-area variables (`--safe-top` … `--above-dock`) for everything
  at a screen edge.
- **0.8.2** — A solid status bar (`default`, coloured by `theme-color`)
  instead of `black-translucent`, whose iOS 26.1+ system blur covered the
  header text.
- **0.8.3** — `html`, `body` and `#root` keep `height: 100%` again, so
  `min-h-full` pages (sign-in screens) fill the screen.
- **0.8.4** — Full-width openers fade into the page: their background
  layer is masked out (`.fade-out`, `.fade-both`) so the page's backdrop
  shows through, instead of ending on a border or a fade to solid page
  colour. `pullUp={false}` for heroes with something above them.
  Charts in the kit: `TrendChart`, `BarChart` (promoted from a candidate),
  `Sparkline` and `StatTile trend`, with a Charts pattern (form first;
  accent, support, highlight; three series at most; never colour alone).
  Lists can be rows or tiles (`List layout`, `LayoutSwitch`,
  `useListLayout`; `Section plain`, `Tabs size="sm"`), and the dashboard
  archetypes use both. `divide-etched` only reaches into list groups now,
  not into a `<div>` row's own children.
- **0.9.0** — The jimbo-ui config section says when a newer release is
  out and what updating would change for the app (About tab and the config
  link), from `releases.json`, which `scripts/releases.mjs` writes from the
  changelog at each release. The config section's Theme tab is now four
  tabs — Looks, Colours, Type and Backdrop — sharing one unsaved look and
  save bar, on a tab row that scrolls sideways on phones (`PillTabs scroll`).
- **0.10.0** — Nine fonts per group: Oswald, Pixel, Bungee, Neon and Script out; IBM
  Plex Sans, Work Sans, Avenir (Nunito Sans off Apple), Figtree,
  Baskerville, Cormorant, Lora, five monos, Old print and Uncial in.
  Headings and body each get a size (± em) that every text size follows.
  Twelve backdrops per group (48 patterns). The iOS home-screen icon
  follows the theme (`applyFavicon` sets `apple-touch-icon` to a themed PNG).
  A Brands category, starting with Marcone (red and mSupply navy). A third
  archetype to copy, **Status monitor** (`archetypes/status.tsx`).
- **0.11.0** — Each fact in one place: an app's details live only in
  its `jimbo-ui.json`; `registry/apps.json` is just names and repos, and
  `registry/components.json` is jimbo-ui's catalogue (no `usedBy`, no
  domain entries). `inventory.mjs` reads the apps' pushed `jimbo-ui.json`
  with `gh`, flags stale checkouts, and `--json` prints the assembled
  registry. App sessions no longer commit to jimbo-ui.
- **0.11.1** — The number says what an update takes: Semantic
  Versioning read for 0.x (breaking → 0.MINOR, feature or fix →
  0.x.PATCH; MAJOR / MINOR / PATCH from 1.0.0). Every changelog entry has an
  **Update:** line; `versions.mjs` enforces it and `--next` gives the
  number; the session-start check and the About tab show each release's
  type, and the update workflow takes a drop-in update straight through.
- **0.11.2** — Three kit components from jimbo-theory: `ToggleGrid`
  (several picks from a small set), `LinkChips` (related things to go to)
  and `FloatingBar` (a status and its actions above the dock; the save bar
  uses it). `EntityRow avatarText` shows a code or number in the avatar.
  The component menu gains Picking several and Related things.
- **0.11.3** — The showcase steps through its looks with Previous and Next.
- **0.11.4** — Coloured shapes are one solid colour: `.lit-*` and
  `.btn-primary` lose their darker outline, and selected pills, tabs,
  switches, ticks and the dock's active tab are the solid fill with no
  coloured border. Anything sitting straight on the backdrop is `.glass`
  (unselected pills included). The Style guide shows its blocks in sections
  with toggles (`more` adds an app's own). The showcase's Home holds every
  component while ten random looks take turns every 15 seconds.
- **0.11.5** — Paper backdrop from two offset noise layers, so it doesn't
  repeat in a grid; `HeroSection pattern="none"` draws no layer of its own.
- **0.12.0** — The URL holds the view: routes, plus tabs, filters,
  searches and pages as search parameters (`useUrlState`). Motif shapes
  (`Theme.motif`: circles, triforce, sparkles, stars and more) for
  `ThemeDots`. Slow backdrop motion (drift, breathe, sway, pulse), off for
  reduced motion. Games gets sub-tabs with Super Mario, Donkey Kong, more
  Nintendo, Sly Cooper and Tony Hawk's Underground looks. Calmer fonts:
  Geist, Plus Jakarta, Newsreader, Literata, Instrument Serif, Bebas Neue,
  Unbounded and Syne replace IBM Plex Sans, Work Sans, Fraunces, Marcellus,
  Cormorant, Rocker, Uncial and Carved caps. The showcase drops its
  Archetypes tab.
- **0.13.0** — The motif saves (`withDefaults` passes every saved field
  through; the server stores the theme as sent). Alive backdrop motion:
  each pattern's lines and shapes move on their own; pulse is per element
  too. The favicon is the motif (`motifFavicon`). Brands use only their
  own site's colours, each its own look, fewer than four when that's all
  they have.
- **0.14.0** — Tailwind 4: the theme moves from `tailwind.config.js` into
  `globals.css` (`@theme inline`, so utilities follow a `ThemeScope`), through
  `@tailwindcss/vite` with no PostCSS; a bare `border` is the theme's line
  colour; `glass` is a utility; legacy colour names removed. New kit files:
  `forms.tsx` (`TextField`, `TextArea`, `DateField`, `FileDrop`),
  `overlays.tsx` (`Menu`, `Popover`, `Tooltip`, `CommandPalette`),
  `feedback.tsx` (`toast` / `Toaster`, `ConfirmSheet` / `useConfirm`,
  `ProgressBar`, `Stepper`, `OfflineBanner`, `UpdateBanner`) and `data.tsx`
  (`DataTable`, `Accordion`). Layers at 45 (overlays) and 60 (toasts).
  Screenshot checks of every Style guide section in a light, mid and dark
  look (`npm --prefix showcase run test:screens`).
- **0.14.1** — Games gets a Consoles sub-tab: eleven consoles' hardware
  and menu colours, each with a menu font, backdrop and motif
  (`Template.style`), which picking the look applies. A Panels backdrop
  joins Abstract. `.font-display` is a Tailwind `@utility`, so `.h-page` and
  `.h-section` keep the heading weight, tracking and size.
- **0.14.2** — An Apocalypse category of looks (Nuclear, Undead,
  Wasteland, Cosmic, Collapse), each with a style. A fifth backdrop group,
  **Ruin**: embers, ash, cracks, hazard, skyline, fallout, smog, barbed,
  static and shockwave. Four motifs: skulls, trefoils, flames, hazards.
- **0.14.3** — Space and Halloween categories of looks, each with a
  style. Two backdrop groups, **Cosmos** (starfield, nebula, galaxy, orbits,
  aurora, comets, constellations, eclipse, milky way, planetrise) and
  **Haunt** (bats, webs, moonlit, graveyard, mist, candles, damask, drips,
  briars, arches); when alive, many move their own way — turning,
  breathing, twinkling, flickering, orbiting. Twelve motifs: planets,
  comets, suns, rockets, spirals, bats, pumpkins, ghosts, fangs, coffins,
  spiders, drops.
- **0.14.4** — No zoom in the installed app: pinch-zoom and double-tap
  zoom are off from the Home Screen, like a native app; browser tabs keep
  pinch-zoom. `isInstalledApp()` in `viewport.ts`.
  App-wide search: `CommandPalette` becomes Spotlight for the app — the
  app's search providers (debounced, cancellable, grouped, thumbnails, a
  preview pane on wide screens), `key:value` facet chips with value
  completion, recent picks and suggestions; `useSpotlight` keeps it in the
  URL; `SearchTrigger` and `SearchIcon`. Commands work as before.
- **0.14.5 (2026-11-05)** — `MediaGrid`: the grid for `MediaCard`s, in three sizes
  (`sm`, `md`, `lg`); cards take smaller type at `sm`. Vertical `BarChart`
  columns link (`to`), with an *Open* link in the readout. New rule: text
  never overflows — the kit trims every text slot (one line or a 2–3 line
  clamp), and apps do the same.
- **0.14.6 (2026-11-06)** — Symmetry: `Section`s side by side go in
  `Columns`, and each card stretches to its row's tallest, content at the
  top; `MediaGrid`, `List layout="tiles"` and `StatGrid` rows are one size.
  Scrollbars always show: every scrollbar inside the page is themed and
  stays visible (macOS too), with `.scroll-area`, `.scroll-area-x` and
  `List maxHeight`; `PillTabs scroll` and sheets show theirs. `JobTile`
  for jobs running now (big percentage, thick bar, the item it's on, facts
  below; a compact finished state) and `ProgressBar size="lg"`. `Page` and
  `fill`; `Pending` for results being replaced; an item's page is a path.
- **0.14.7 (2026-11-06)** — One control height (`h-control`, `--control-h`) for
  buttons, fields, selects and switches; `.controls` rows and
  `.control-grid` make controls side by side one size, and `PageHeader`
  and `Section` action slots are control rows. Paths nest under their
  tab, one segment per step; every page below a tab's own page has Back
  (`PageHeader back`, `useRememberPages`, `parentPath`). `ShareSliders`
  for shares of one total. Lists with more than a name per item
  offer rows or tiles (`LayoutSwitch`).
- **0.15.0 (2026-11-06)** — Toasts are the one way to pop up a notice,
  failed requests included: top right under the top bar (full width on
  phones), newest on top, and every one timed — 4 s, 6 s with an action,
  8 s for an error — with a line showing the time left; hover holds it.
- **0.16.0 (2026-11-08)** — The **rulebook** (`rulebook.md`): every rule numbered
  and checkable, cited by audits; the guide explains. New rules: a circle
  is never inside a box (S4; `EntityRow`'s placeholder is the bare
  circle); neighbours are one size (K2; `.controls` evens padding and type
  too, and steps through bare wrappers); anything that opens choices looks
  like a dropdown (K5; `DropdownButton`); nothing changes by itself (M2).
  Stricter readability: accent and highlight 3.5:1 on the page, colours
  22 / 15 apart; tones that miss are remade from their own colours or not
  offered, and every look passes.
- **0.17.0 (2026-11-08)** — `Timeline` in the kit (promoted from the catalogue's
  candidates): milestones along a line, the 10 px dot on the line outside
  the card, its kind named in the `when` line, one tap target each.
  Pictures that fail to load fall back to the placeholder in `MediaCard`,
  `EntityRow`, `EventRow` and `Hero` (`useImageOrFallback`). `Columns` is
  one column on phones even with a long trimmed line, and `PageHeader` /
  `Section` action rows wrap on phones instead of running off the screen.
  `HeroSection`'s pattern is always a blur (L7); `HeroCarousel` — slides as
  tall as the fullest (L10), prev / next arrows, a 10 s timer on Next, pause
  — the one exception to M2. `MediaCard` fills its cell even inside a
  wrapper (L2), and its title and sub line are one line each
  (`ScrollingLine`, L5). Every page opens with a hero (L11): `PageHeader` is
  now a compact one (its blur the full width, a big title; `plain` for
  demos), with its own `pattern` per kind of page (L12). `HeroCarousel`
  slides are facts only (no `actions`); its controls sit at the top left
  and its timer runs the screen's full width along its bottom. `JumpMenu`
  (N7) puts every page in a series, or every data page, one tap away;
  `Menu` items take `current` and `{ heading }`, and long menus scroll.
  `LinkCard size="sm"` for a row of quick ways in. The shell sets
  `--page-max`, so a full-width hero's text lines up with the page column.
- **0.18.0 (2026-11-11)** — **jimbo.ui on shadcn/ui, and binding.** Components
  are shadcn/ui primitives in foundation (section 8, with jimbo's edits)
  and a kit composed from them; one token mapping onto shadcn's variable
  names in `globals.css` (section 3: the theme's accent is `primary`,
  shadcn's `accent` is the hover surface). A flatter look: solid surfaces,
  hairline borders, no shadows or blur on components (S6, S8; section 7).
  lucide icons (P4). The rules are binding (group J): jimbo.ui's
  components and tokens only, no restyles, no local shadcn, and anything
  new through a PR (section 14), with tracked pending versions (J5); every
  app has the config page (P5, J6). React 19.
  Also: stricter text contrast, measured on fields: muted
  5.5:1, labels 4.5:1 (C6). Hero scrims (C8): the page colour over a
  hero's picture or blur, sized per theme. `BackButton` is a solid button
  with body text; `Hero` uses tokens, not white and black.
  Desktop grid columns (L13): an app-wide setting in the config's Brand
  tab (`Theme.gridColumns`) and `ColumnsPicker` + `useGridColumns` for
  one grid. The config section fills the page column, like the header.
- **Unreleased** — `HeroCarousel` `timerAt` and `controlsAt`;
  `StatTile to`; `PageHeader lede` and `updated`, with `Lede`,
  `UpdatedLine` and `timeAgo`; `Part`; `Timeline` items' `action`;
  `Heatmap` and `CodeBlock` move from candidates into the kit.
