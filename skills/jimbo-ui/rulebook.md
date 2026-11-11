# jimbo.ui rulebook

The rules every app on jimbo.ui follows. Each is numbered, short and
checkable: an audit cites the number ("breaks K3"), an update fixes it, and a
new rule gets the next free number in its group (numbers are never reused or
reordered). **The rulebook decides; the guide explains.** Where they seem to
disagree, the rulebook wins and the guide is fixed. *§* points to the guide
section with the detail and the components that do it for you.

How to use it:
- **Building UI:** keep the groups you're touching in mind; the kit already
  follows them, so a hand-built element is where breaks creep in.
- **Auditing an app:** go group by group, list each break as
  `rule · file:line · what · fix`, then fix them or hand the list to the
  update workflow.
- **Changing a rule:** edit it here, then the guide, the changelog
  (**Apps must** says what apps fix) and the guide's change log.

---

## B · Brand

- **B1** No logo. The brand is the app's name as header text (`HeaderTitle`) with a dot in the accent. *§2*
- **B2** The favicon is the only graphic: one motif shape in the accent on the page colour. *§2*
- **B3** Copy is plain, short and in sentence case — titles, buttons, tabs. Caps only through `.eyebrow`, never `uppercase` utilities. *§2*
- **B4** Buttons are verbs; an ellipsis (*Add…*) means a sheet or choice follows. *§2*
- **B5** Things are named the way the person names them, never by internal names. *§2*

## C · Colour and contrast

- **C1** Colours come from tokens only. No raw hex, no Tailwind palette colours (`bg-zinc-900`, `text-white`, `bg-black/55`) on anything branded. *§12*
- **C2** Text on a brand fill uses its `on-*` colour. *§2*
- **C3** Two to four source colours; none of them white or grey. A brand look uses only the colours on that brand's own site. *§2*
- **C4** Colour comes from opaque shapes, not thin washes of another hue. *§2*
- **C5** Status colours are the fixed tones (`Tone`), never theme colours. *§2*
- **C6** Every template passes `node scripts/contrast.mjs --check` in each tone it comes in: body text ≥ 7:1 on cards, muted ≥ 4.5:1 on `surface-2` (fields, chips — the lightest place it sits), labels and eyebrows ≥ 4.5:1 on cards (they're small type); card border ≥ 1.75:1; card on page ≥ 1.19:1; **accent and highlight ≥ 3.5:1** on the page; support ≥ 4.5:1 on cards; text on the accent ≥ 4.5:1; text over a picture or blur as C8 (`photo`, `blur` ≥ 1). *§3*
- **C7** **Colours stand apart.** Accent and highlight are at least 22 apart (ΔE), and no two of accent, highlight and support closer than 15 — closer than that, an eyebrow reads as a link and a badge as a button. A tone that can't do this is remade from the look's own colours or not offered. *§3*
- **C8** **Text over a picture or a blur knows what's under it.** Heroes and banners (`Hero`, `Banner`, `HeroSection`) keep the page's own text colours and lay a veil of the page colour over their picture or blur, as strong as it needs for the title to reach 7:1 and every other line (eyebrow, subtitle, links, meta) 4.5:1 on its every part: `photoScrim` with the picture's cells (`useImageCells`), its worst case (black and white, up to a 0.9 veil) when the picture can't be read, the blur's brightest wash for `HeroSection`. Never `text-white`, `bg-black/…` or a fixed dim on them; anything else on a hero is `.glass`. *§3, §7*

## S · Shapes and circles

- **S1** Coloured shapes are flat: one solid fill, no gradient, gloss, glow, outline or tint-plus-border. *§2, §7*
- **S2** Corners are softly rounded from the radius scale. Full rounding is for circles only — never a pill-shaped button, tag or chip. *§7*
- **S3** Circles sit side by side (4 px apart, 6 px from 16 px up), never overlapping, at the fixed sizes: 8, 10, 16, 40–48 px. *§2*
- **S4** **A circle is never inside a box.** No square, rounded square, border, ring, tile or background behind a circle — an avatar placeholder, status dot or swatch is the bare circle. A picture keeps its own frame (square for places and covers, round for people); with no picture the placeholder is the circle alone. *§2*
- **S5** Circles go only where §2 lists them: motif rows, stat and month dots, status dots, avatars, swatches, the favicon. Never decoration. *§2*
- **S6** Anything straight on the backdrop (floating controls, unselected tabs, the pager) is `.glass`, never a bare outline or see-through. *§7*
- **S7** A selected thing is a solid fill with `border-transparent` (plus a tick or `aria-pressed`), not an outline or a ring. *§7*

## K · Controls

- **K1** **One control height.** Buttons, fields, selects, tabs and dropdowns are `h-control` (`h-control-sm` inside rows and cards). Never a height set by hand. *§6*
- **K2** **Neighbours are one size.** Two controls side by side never differ in height, padding or type size — no `lg` primary beside a `sm` ghost, no full-size field beside a small button. Put them in a `.controls` row (or `.control-grid` for columns), which sizes them all alike. *§6*
- **K3** **Nothing between a control row and its controls.** Actions passed to `PageHeader`, `Section`, `Hero`, `Banner` or `HeroSection` are a fragment, not a classed `div`/`span` wrapper; a component used there returns its control, not a box around it. *§6*
- **K4** **A row of actions uses primary and secondary only** — one primary at most. Ghost buttons are for actions inside rows and cards, not beside a primary. *§8*
- **K5** **Anything that opens choices looks like a dropdown.** A trigger for a menu of options, a sort, a filter popover or "more ways to…" is a `DropdownButton` (field surface, its current value or label, a down arrow) or a `SelectField` — never a plain or ghost button, and never "Or…" on its own. The ⋯ `MoreButton` is kept for a row's own actions, and — round glass (`Menu glass`, `MoreButton glass`) — for a page's or part's own options in its header, named for its item ("Options for *name*"). A header's own + is a 44 px `TopBarButton size="md"`. *§8*
- **K6** Touch targets are at least 44 px; chips that go somewhere or toggle are `LinkChips` or `ToggleGrid`, not `.chip` with hand padding. *§6*
- **K7** A row has one tap target, plus at most one 44 px icon button or `Menu`. *§8*
- **K8** Several choices from a short fixed set are a `ToggleGrid`; one of 2–4 views is `Tabs`; many options on phones a `SelectField`. *§9*
- **K9** No native colour inputs; no browser alerts except as a last-resort error. *§12*

## L · Layout

- **L1** Phone first: designed at 375 px, relaxed from `sm:`. Full screen edge to edge, insets from the `--safe-*` variables, never `env()`. *§6*
- **L2** **Symmetry.** Cards and sections side by side are one height: `Columns`, `StatGrid`, `MediaGrid`, `List layout="tiles"` — a card wrapped in a box of its own (to lay a button over it) still fills its cell (the wrapper and the card `h-full`); never a bare `grid lg:grid-cols-*` of cards, never `items-start` across a row of cards. *§6*
- **L3** No horizontal scrolling: no sideways strips, no sideways-scrolling tables (use `DataTable`). `PillTabs scroll` for a page's own sections is the one exception. *§6*
- **L4** Anything that scrolls inside the page shows its scrollbar (`.scroll-area`, `List maxHeight`). Never hide one. *§6*
- **L5** Text never overflows: one line with `truncate`, or a 2–3 line clamp; numbers and units never split. A card's title and sub line in a grid are one line (`ScrollingLine`: an ellipsis, the rest scrolling into view on hover), so the cards stay one size. *§6*
- **L6** Every page is a `Page`; its one growing block fills down to the dock (`fill`). *§6*
- **L7** Full-width openers fade into the page (`.fade-out`); never a hard edge, a border under them, or a fade to solid `bg`. A `HeroSection`'s pattern is always a blur — never crisp lines behind the title. *§7*
- **L10** **Steps of one thing are one height.** Slides, pages or steps shown one at a time in the same place are as tall as the fullest of them (`HeroCarousel` lays every slide in one cell), so nothing below moves when they change. *§6*
- **L11** **Every page opens with a hero.** A tab's home opens with `HeroSection` or `HeroCarousel`, an item's page with `Hero` / `Banner` (its picture), and every other page with `PageHeader`, which is itself a compact hero (the theme's blur the full width, a big title, pulled up under the top bar) — never a bare title in the column (`PageHeader plain` is for demos and headers inside a card). A `HeroCarousel` is facts only: its slides carry an eyebrow, a big value and a line, never buttons; what you'd do about them lives in the page below. Its arrows, pause and count sit at the top left, and its timer is a thin bar the screen's full width along its bottom edge. *§6*
- **L12** **Different data, different look.** Pages that show different kinds of data don't look alike: each kind gets its own hero `pattern` and `tone` (and its own opening block — stats, a chart, a timeline, a list), so you know where you are before reading. Pages of the same kind (every year, every month) share theirs. *§6*
- **L8** Rows are at least 76 px tall, divided by an etched line (`.divide-etched`). *§6*
- **L9** Font sizes come from the type scale; no `text-[10px]`-style sizes. *§5*

## N · Navigation and the URL

- **N1** The URL holds the view: tab, sub-tab, segmented control, filter, sort, search, page and open sheet are search params (`useUrlState`). Never `useState` for what the page shows. *§6*
- **N2** An item's page is a path (`/kind/name`), nested under the tab it belongs to, one segment per step in. *§6*
- **N3** Every page below a tab's own page has Back to its parent (`PageHeader back`, `Hero`/`Banner back`). *§6*
- **N7** **Every data page is one tap away.** Pages in a series (years, months, seasons, chapters) have a `JumpMenu` in their header to any other one, not just earlier / later; and an app with more data pages than its tabs show lists them all in one place — a top-bar ☰ `JumpMenu`, grouped with headings, the current page ticked. A page someone visits often enough to ask for gets a tab (within N's five). *§6*
- **N4** A link goes somewhere real: no `href="#"`, no link drawn as text with an arrow beside a button. A stat that opens something is a `StatTile` with `to`; a destination is a `LinkCard` or a `Button`. *§8*

## M · Motion and feedback

- **M1** Motion is quick and physical: press scale, colour transitions. No page transitions, parallax, bouncing or decorative hover zoom. *§7*
- **M2** **Nothing changes by itself.** Content moves only when the person acts — no auto-advancing carousels or rotating panels. Two exceptions: `HeroCarousel` (a page opener's slides, 10 s each, with prev / next arrows and a pause button at its top left, the timer a full-width bar along its bottom edge, and stopped while hovered or focused), and the showcase's rotating looks (a demo of the themes). *§7*
- **M3** Nothing looks like it did nothing: a result being replaced is `Pending`; long jobs show live progress (`JobTile`, `ProgressBar`). *§7*
- **M4** Every pop-up notice is a `toast()`: top right, timed. Errors to fix in a form are inline. *§9*
- **M5** Destructive or surprising actions confirm first (`ConfirmSheet`), naming the action on its button. *§9*
- **M6** A pulsing status dot is the 10 px `STATUS_DOT` with `LIVE`. *§9*

## P · Parts

- **P1** One library: use the kit's component when one fits (catalogue first, §13). A second version of a kit component is a break — `ProgressBar` not a hand-made meter, `DataTable` not a hand-made table, `EntityRow`/`List` not hand-made rows. *§8, §13*
- **P2** Every modal is a `Sheet`; every chart is the kit's (`TrendChart`, `BarChart`, `Sparkline`), at most three series, one y-axis. *§9*
- **P3** Every map is `MapView`. *§9*
- **P4** Icons are inline SVG (`stroke="currentColor"`, round caps), never glyphs or letters (`✕`, `‹ ›`, `★`, `i`). *§10*
- **P5** Every app has exactly one jimbo-ui config section at `/jimbo-ui`, linked once from settings (`JimboConfigLink`), never a dock tab. *§1*

## A · Accessibility

- **A1** Every interactive element is a real `button` or `a`, with a visible focus ring. *§11*
- **A2** Icon-only controls have an `aria-label`. *§10*
- **A3** Nothing is hover-only — actions, values, rings and readouts all show on touch. *§11*
- **A4** Toggles use `aria-pressed` or `role="switch"`; tabs `role="tab"` and `aria-selected`. *§11*
