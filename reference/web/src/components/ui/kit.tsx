/**
 * The UI kit — the shared building blocks every page is assembled from.
 *
 * Mobile first: full-width rows with 44px+ tap targets, nothing that scrolls
 * sideways, and type that steps up a size on phones rather than down.
 * Look: bold heading font, image heroes with a dark gradient, ticket-style
 * date blocks on dated rows, chevrons on anything that navigates.
 *
 * Built on jimbo.ui's shadcn primitives (components/ui: Button, Card, Badge,
 * Input, Select, Switch, Slider, Tabs, ToggleGroup, Drawer, Dialog,
 * Skeleton, Empty): flat surfaces with hairline borders, no shadows or blur
 * (S8). Colours are the shadcn token names (guide §3); a prop that names a
 * theme colour still says "accent" (the theme's), drawn as `primary`.
 *
 * jimbo-ui reference: copy into an app. An app changes wiring only (its
 * statuses, routes, copy), never looks (J3); anything new is a PR to
 * jimbo-ui (J4).
 */

import { Children, createContext, useCallback, useContext, useId, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs as UiTabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { backdropCss, fullTheme, GRID_COLUMNS, loadFonts, themeHex, themeVars, type BackdropPattern, type Theme } from "@/lib/theme";
import { useBrand } from "@/lib/useBrand";
import { useUrlState } from "@/lib/useUrlState";
import { BRAND } from "@/lib/brand.config";

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

/** "2026-10-14" → { month: "OCT", day: "14", year: "2026", weekday: "Wed" } (UTC, so dates don't shift). */
export function dateParts(iso: string): { month: string; day: string; year: string; weekday: string } {
  const date = /^\d{4}-\d{2}-\d{2}/.test(iso) ? new Date(`${iso.slice(0, 10)}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime())) return { month: "", day: "?", year: iso.slice(0, 4), weekday: "" };
  return {
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    day: String(date.getUTCDate()),
    year: String(date.getUTCFullYear()),
    weekday: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
  };
}

/** Up to two initials for an avatar placeholder: "Main Hall" → "MH". */
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Tones — fixed colours for states that carry meaning (statuses, badges)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status colours are fixed, not themed, because they carry meaning. The
 * "done" state uses the accent. An app maps its own statuses onto these
 * (e.g. done / going / maybe / missed / cancelled).
 */
export type Tone = "accent" | "yellow" | "purple" | "red" | "muted";

export const TONES: Record<Tone, { text: string; chip: string; border: string; tint: string; dot: string }> = {
  accent: { text: "text-primary",      chip: "bg-primary-950 text-primary border-primary-700",      border: "border-primary-700", tint: "bg-primary-950", dot: "bg-primary" },
  yellow: { text: "text-yellow-400",  chip: "bg-yellow-950 text-yellow-400 border-yellow-700", border: "border-yellow-600", tint: "bg-yellow-950", dot: "bg-yellow-400" },
  purple: { text: "text-purple-400",  chip: "bg-purple-950 text-purple-400 border-purple-800", border: "border-purple-700", tint: "bg-purple-950", dot: "bg-purple-400" },
  red:    { text: "text-red-400",     chip: "bg-red-950 text-red-400 border-red-800",          border: "border-red-700",    tint: "bg-red-950",    dot: "bg-red-400" },
  muted:  { text: "text-subtle-foreground", chip: "bg-muted text-subtle-foreground border-border",      border: "border-border",     tint: "bg-muted",  dot: "bg-subtle-foreground" },
};

/** A status dot: a 10 px flat circle (add a tone's `dot`). */
export const STATUS_DOT = "h-2.5 w-2.5 shrink-0 rounded-full";

/** A status dot that pulses while something is happening (running, syncing) — movement keeps it apart from a same-coloured still dot. */
export const LIVE = "animate-pulse";

/**
 * A status as a labelled chip — for detail pages, headers and settings
 * (shadcn `Badge` in a fixed status tone, C5). `dot`: a status dot before the
 * label (`live` pulses it). The plain primitive (brand fills) is
 * `components/ui/badge`.
 */
export function Badge({ tone, children, dot = false, live = false, className }: { tone: Tone; children: ReactNode; dot?: boolean; live?: boolean; className?: string }) {
  return (
    <UiBadge variant="secondary" className={cn("min-w-0 max-w-full gap-1.5 text-11", TONES[tone].chip, className)}>
      {dot && <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", TONES[tone].dot, live && LIVE)} />}
      <span className="min-w-0 truncate">{children}</span>
    </UiBadge>
  );
}

/** A status on a row: a tone plus the words a screen reader and tooltip use; `live` pulses the dot (running now). */
export type RowStatus = { tone: Tone; label: string; live?: boolean };

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

/** A lucide chevron, 20 px: on anything that navigates. */
export function Chevron({ dir = "right", className }: { dir?: "left" | "right" | "down"; className?: string }) {
  const Icon = dir === "left" ? ChevronLeftIcon : dir === "down" ? ChevronDownIcon : ChevronRightIcon;
  return <Icon aria-hidden="true" className={cn("size-5 shrink-0", className)} strokeWidth={2.25} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme dots — the motif
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The theme's colours (accent, highlight, support) as flat shapes side by side —
 * jimbo.ui's motif: circles, or the shape the theme picks (`theme.motif`:
 * triforce, sparkles, stars…). In empty states and brand moments only; never
 * above a page title. Decorative; follows the live theme.
 */
export function ThemeDots({ size = 8, className }: { size?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex shrink-0 items-center", className)} style={{ gap: size >= 16 ? 6 : 4 }}>
      {(["motif-primary", "motif-highlight", "motif-support"] as const).map((dot) => (
        <span key={dot} className={dot} style={{ width: size, height: size }} />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full width — edge-to-edge sections inside the page column
// ─────────────────────────────────────────────────────────────────────────────

const BLEED_TONES = {
  none: "",
  surface: "border-y border-border bg-card",
  accent: "bg-primary text-primary-foreground",
  highlight: "bg-highlight text-highlight-foreground",
  support: "bg-support text-support-foreground",
} as const;

/**
 * Part of the page in another theme — its colours, type and backdrop — without
 * touching the rest (a carousel of looks, a preview). Loads the theme's fonts.
 */
export function ThemeScope({ theme, className, children }: { theme: Theme; className?: string; children: ReactNode }) {
  useEffect(() => { const f = fullTheme(theme).fonts; loadFonts([f.headings!, f.body!]); }, [theme]);
  return <div className={cn("theme-scope", className)} style={themeVars(theme) as React.CSSProperties}>{children}</div>;
}

/**
 * Breaks out of the page column to the full screen width — a band, a strip of
 * media, a hero. Its content lines up with the page column again unless
 * `flush`. `tone` fills it: the surface, or a flat brand colour (with its
 * `on-` text). The app shell clips sideways overflow, so 100vw is safe.
 */
export function FullBleed({ children, tone = "none", flush = false, pad = true, className, style }: {
  children: ReactNode;
  tone?: keyof typeof BLEED_TONES;
  /** Content runs edge to edge too (media, maps). */
  flush?: boolean;
  /** Vertical padding (24 / 32 px). */
  pad?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={cn("relative ml-[calc(50%-50vw)] w-screen", BLEED_TONES[tone], pad && "py-6 sm:py-8", className)} style={style}>
      <div className={flush ? "" : "mx-auto max-w-[var(--page-max,64rem)] px-4 sm:px-6"}>{children}</div>
    </section>
  );
}

/**
 * A full-width page opener without a photo: big title, a line, actions, over
 * a soft blur of the theme's colours (a backdrop pattern on a glow, blurred
 * until no line of it shows — never the pattern's crisp lines). Use at the top
 * of a landing or home page; `size="lg"` fills most of the first screen. Pulls
 * up under the top bar like `Banner`. `pattern="none"` draws no layer of its
 * own: the page's backdrop shows through. Several to step through: `HeroCarousel`.
 */
export function HeroSection({ eyebrow, title, children, actions, pattern = "ripples", tone, size = "md", align = "left", pullUp = true }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** A line or two under the title. */
  children?: ReactNode;
  actions?: ReactNode;
  /** The backdrop the blur is made from (it decides the colours' layout, not lines). */
  pattern?: BackdropPattern;
  /** The brand colour that leads the blur. */
  tone?: HeroTone;
  size?: "md" | "lg";
  align?: "left" | "center";
  /** Tuck up under the top bar (the default, when it opens the page). Turn off when something sits above it. */
  pullUp?: boolean;
}) {
  return (
    <HeroFrame pattern={pattern} tone={tone} size={size} align={align} pullUp={pullUp}>
      <HeroText eyebrow={eyebrow} title={title} actions={actions} align={align}>{children}</HeroText>
    </HeroFrame>
  );
}

/** Which brand colour leads a hero's blur. Kinds of page each get their own (with `pattern`, L12). */
export type HeroTone = "accent" | "highlight" | "support";

const WASH_AT: Record<HeroTone, string> = { accent: "18% 30%", highlight: "82% 25%", support: "35% 85%" };
/** A hex colour at 40%, for the hero's wash. */
function washOf(hex: string): string {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / 0.4)`;
}

/** The theme with `tone` swapped into the accent's place, so the blur is led by that colour. */
function leadWith(theme: Theme, tone: HeroTone): Theme {
  if (tone === "accent") return theme;
  const hex = themeHex(theme);
  return { ...theme, accent: hex[tone]!, highlight: tone === "highlight" ? hex.accent : hex.highlight, support: tone === "support" ? hex.accent : hex.support };
}

/** HeroSection's full-width box and its blurred layer. `under` sits along its bottom edge, the screen's full width. */
function HeroFrame({ pattern, tone = "accent", size, align, pullUp, under, children, className, ...rest }: {
  pattern: BackdropPattern;
  tone?: HeroTone;
  size: "sm" | "md" | "lg";
  align: "left" | "center";
  pullUp: boolean;
  under?: ReactNode;
  children: ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className">) {
  const { theme } = useBrand();
  const look = backdropCss({ ...leadWith(theme, tone), backdrop: { pattern, base: "glow", intensity: 0.9, scale: 0.8 } });
  // A wash of the leading colour, somewhere of its own per tone, so kinds of page read apart at a glance (L12).
  const wash = `radial-gradient(55% 90% at ${WASH_AT[tone]}, ${washOf(themeHex(theme)[tone] ?? "#888888")}, transparent 72%)`;
  return (
    <FullBleed pad={false} className={cn("isolate", size === "sm" ? "mb-4 sm:mb-6" : "mb-2", pullUp && "-mt-6 sm:-mt-8")}>
      {/* Always a blur: the layer is blurred and scaled up a little so its edges don't show, and it fades
          out top and bottom (.fade-out, plus .fade-both when something sits above) into the page's backdrop. */}
      {pattern !== "none" && (
        <div aria-hidden="true" className={cn("fade-out pointer-events-none absolute inset-0 -z-10 overflow-hidden", !pullUp && "fade-both")}>
          <div className="absolute -inset-16 blur-3xl saturate-150"
            style={{ backgroundImage: `${wash}, ${look.image}`, backgroundSize: `100% 100%, ${look.size}`,
              backgroundPosition: `0 0, ${look.position}`, backgroundRepeat: `no-repeat, ${look.repeat}` }} />
          {/* The page colour over the blur, as much as this theme needs for its text to read on it (C8). */}
          <div className="hero-scrim-blur absolute inset-0" />
        </div>
      )}
      <div {...rest} className={cn("flex flex-col justify-end",
        size === "sm" ? "min-h-[24dvh] gap-2 pt-10 pb-6 sm:min-h-[28dvh] sm:pt-14 sm:pb-8" : "gap-3 py-10 sm:py-14",
        size === "lg" ? "min-h-[62dvh]" : size === "md" && "min-h-[34dvh]", align === "center" && "items-center text-center", className)}>
        {children}
      </div>
      {under}
    </FullBleed>
  );
}

function HeroText({ eyebrow, title, children, actions, align }: {
  eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; actions?: ReactNode; align: "left" | "center";
}) {
  return (
    <>
      {eyebrow && <p className="eyebrow text-support">{eyebrow}</p>}
      <h1 className="line-clamp-3 break-words font-display text-40 leading-[1.02] text-foreground sm:text-6xl">{title}</h1>
      {children && <div className={cn("max-w-xl text-17 text-muted-foreground", align === "center" && "mx-auto")}>{children}</div>}
      {actions && <div className="controls mt-2">{actions}</div>}
    </>
  );
}

export interface HeroSlide {
  /** Stable id (kept in the URL by the caller, if it likes). */
  id: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  /** The fact's line. Slides are facts only: no buttons (rulebook L11). */
  children?: ReactNode;
}

/**
 * Several HeroSection slides, one at a time. Every slide is laid out in the
 * same cell, so the hero is always as tall as its fullest slide and nothing
 * under it moves when it changes. Slides are facts, never buttons (L11). The
 * prev / next arrows, the pause button and "3 / 29" sit at the hero's top
 * left (or right, `controlsAt`); it moves on by itself every `interval` (10 s), the time left drawn as
 * a thin bar the screen's full width along the hero's bottom edge (or its top, `timerAt`), and stops
 * while it's hovered or has focus, or for good with the pause button
 * (rulebook M2's one exception). Reduced
 * motion: slides swap without the fade. `index` / `onIndex` to control it
 * (a URL parameter); without them it keeps its own.
 */
export function HeroCarousel({ slides, index, onIndex, interval = 10_000, label = "Highlights", pattern = "ripples", tone, size = "md", align = "left", pullUp = true, timerAt = "bottom", controlsAt = "left" }: {
  slides: HeroSlide[];
  index?: number;
  onIndex?: (i: number) => void;
  /** Milliseconds each slide stays; 0 never moves on by itself. */
  interval?: number;
  /** What the carousel is, for screen readers. */
  label?: string;
  pattern?: BackdropPattern;
  tone?: HeroTone;
  size?: "md" | "lg";
  align?: "left" | "center";
  pullUp?: boolean;
  /** Where the timer bar runs: along the hero's bottom edge (the default) or its top, right under the top bar. */
  timerAt?: "top" | "bottom";
  /** Which side the arrows, pause and "3 / 29" sit on (ignored with align="center"). */
  controlsAt?: "left" | "right";
}) {
  const [own, setOwn] = useState(0);
  const n = slides.length;
  const i = n ? (((index ?? own) % n) + n) % n : 0;
  const go = (to: number) => { const v = ((to % n) + n) % n; onIndex ? onIndex(v) : setOwn(v); };
  const goRef = useRef(go);
  goRef.current = go;
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState({ hover: false, focus: false });
  const stopped = paused || held.hover || held.focus;
  const bar = useRef<HTMLSpanElement>(null);
  const run = useRef<Animation | null>(null);

  // The timer is the bar's own animation: when it finishes, the next slide. Pausing pauses it, so the time
  // left is kept; a new slide starts it again.
  useEffect(() => {
    const el = bar.current;
    if (!el || n < 2 || !interval || typeof el.animate !== "function") return;
    const a = el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: interval, easing: "linear", fill: "forwards" });
    a.onfinish = () => goRef.current(i + 1);
    run.current = a;
    return () => { a.onfinish = null; a.cancel(); run.current = null; };
  }, [i, n, interval]);
  useEffect(() => { if (stopped) run.current?.pause(); else run.current?.play(); }, [stopped, i]);
  useEffect(() => {
    const onVis = () => { if (document.hidden) run.current?.pause(); else if (!stopped) run.current?.play(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [stopped]);

  if (!n) return null;
  const arrow = "border border-border bg-card relative inline-flex h-control w-control items-center justify-center overflow-hidden rounded-control text-foreground transition-colors hover:border-primary active:scale-95";
  // The timer: the screen's full width, along the hero's bottom (or top) edge. Only the fill shows, no track (L7).
  const timer = n > 1 && interval > 0 && (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 h-[3px]", timerAt === "top" ? "top-0" : "bottom-0")}>
      <span ref={bar} className={cn("block h-full origin-left bg-primary", stopped && "opacity-50")} style={{ transform: "scaleX(0)" }} />
    </span>
  );
  return (
    <HeroFrame pattern={pattern} tone={tone} size={size} align={align} pullUp={pullUp} under={timer}
      role="region" aria-roledescription="carousel" aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld((h) => ({ ...h, hover: true }))}
      onPointerLeave={() => setHeld((h) => ({ ...h, hover: false }))}
      onFocus={() => setHeld((h) => ({ ...h, focus: true }))}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld((h) => ({ ...h, focus: false })); }}>
      {/* The controls, top left or right (centred with align="center"); the count sits on the outer side. */}
      {n > 1 && (
        <div className={cn("flex items-center gap-2", align === "center" ? "justify-center" : controlsAt === "right" && "justify-end")}>
          {controlsAt === "right" && align !== "center" && <p className="mr-2 text-sm tabular-nums text-muted-foreground">{i + 1} / {n}</p>}
          <button type="button" className={arrow} onClick={() => go(i - 1)} aria-label="Previous"><Chevron dir="left" /></button>
          <button type="button" className={arrow} onClick={() => go(i + 1)} aria-label="Next"><Chevron /></button>
          {interval > 0 && (
            <button type="button" className={cn(arrow, "text-muted-foreground")} onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"} aria-pressed={paused}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {paused ? <path d="M8 5.5v13l11-6.5z" /> : <><rect x="6.5" y="5" width="3.5" height="14" rx="1" /><rect x="14" y="5" width="3.5" height="14" rx="1" /></>}
              </svg>
            </button>
          )}
          {(controlsAt === "left" || align === "center") && <p className="ml-2 text-sm tabular-nums text-muted-foreground">{i + 1} / {n}</p>}
        </div>
      )}
      {/* Every slide in one cell: the tallest decides the height. Only the current one shows or takes focus. */}
      <div className="mt-auto grid pt-6" aria-live={stopped ? "polite" : "off"}>
        {slides.map((s, k) => (
          <div key={s.id} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}
            aria-hidden={k !== i} {...(k !== i ? { inert: "" } as object : {})}
            className={cn("col-start-1 row-start-1 flex flex-col justify-end gap-3 motion-safe:transition-opacity motion-safe:duration-500",
              align === "center" && "items-center text-center", k === i ? "opacity-100" : "invisible opacity-0")}>
            <HeroText eyebrow={s.eyebrow} title={s.title} align={align}>{s.children}</HeroText>
          </div>
        ))}
      </div>
    </HeroFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page scaffolding
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every page's opener (rulebook L11): a compact hero — the full-width blur of
 * the theme's colours, a big title, the eyebrow, a count and the page's
 * controls — pulled up under the top bar. `pattern` picks the blur's layout
 * and `tone` the colour that leads it: give each kind of page its own pair,
 * so pages of different data look different (L12). `lede` is a line or two under the title saying what
 * the page is for, and `updated` a freshness line ("Updated 12 min ago") for data worked out ahead of
 * time. `plain` is the old in-column header, for demos and headers inside a card; never at the top of a page.
 */
export function PageHeader({ eyebrow, title, count, actions, back, lede, updated, pattern = "ripples", tone, pullUp = true, plain = false, className }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  count?: number;
  /** Buttons, switches and jump menus, laid out as one `.controls` row: every one the same height. */
  actions?: ReactNode;
  /** The page this one sits under (its path minus the last part). Every page below a dock tab's own page has one. */
  back?: { to: string; label: string };
  /** What the page is for, in a sentence or two: a reading-width line under the title. */
  lede?: ReactNode;
  /** When the data shown was last worked out (a Date, or ms since the epoch), with an optional note after it. */
  updated?: { at: Date | number; note?: ReactNode };
  /** The backdrop the hero's blur is made from. */
  pattern?: BackdropPattern;
  /** The brand colour that leads the blur. `pattern` and `tone` together tell kinds of page apart (L12). */
  tone?: HeroTone;
  /** Tuck up under the top bar (the default). Turn off when something sits above it. */
  pullUp?: boolean;
  /** No hero: a header in the column (demos, inside a card). */
  plain?: boolean;
  className?: string;
}) {
  const heading = (big: boolean) => (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h1 className={cn("min-w-0 line-clamp-2 break-words", big ? "font-display text-4xl leading-[1.05] text-foreground sm:text-5xl" : "h-page")}>
        {title}
        {count != null && count > 0 && (
          <span className={cn("ml-2 align-middle text-base font-body font-medium", big ? "text-muted-foreground" : "text-subtle-foreground")}>{count.toLocaleString()}</span>
        )}
      </h1>
      {actions && <div className="controls max-w-full shrink-0 justify-end">{actions}</div>}
    </div>
  );
  if (plain) {
    return (
      <header className={cn("mb-5 sm:mb-6", className)}>
        {back && <div className="mb-2"><BackButton to={back.to} label={back.label} /></div>}
        {eyebrow && <p className="eyebrow mb-1 text-support">{eyebrow}</p>}
        {heading(false)}
        {lede && <Lede className="mt-2">{lede}</Lede>}
        {updated && <UpdatedLine at={updated.at} note={updated.note} className="mt-1" />}
      </header>
    );
  }
  return (
    <HeroFrame pattern={pattern} tone={tone} size="sm" align="left" pullUp={pullUp} className={className}>
      {back && <div className="mb-auto"><BackButton to={back.to} label={back.label} /></div>}
      {eyebrow && <p className="eyebrow text-support">{eyebrow}</p>}
      {heading(true)}
      {lede && <Lede>{lede}</Lede>}
      {updated && <UpdatedLine at={updated.at} note={updated.note} />}
    </HeroFrame>
  );
}

/**
 * What a page or part is for, in a sentence or two: one reading width, muted.
 * `PageHeader lede` and `Part lede` use it; on its own it goes straight
 * under a header that has none. `className` is layout only (J3).
 */
export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("max-w-3xl px-0.5 text-15 leading-relaxed text-muted-foreground", className)}>{children}</p>;
}

/** "just now", "12 min ago", "3 h ago", "2 days ago", then the date. */
export function timeAgo(at: Date | number, now = Date.now()): string {
  const d = typeof at === "number" ? new Date(at) : at;
  const min = Math.max(0, Math.round((now - d.getTime()) / 60_000));
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

/** A freshness line for data worked out ahead of time: "Updated 12 min ago · note", the exact time on hover. */
export function UpdatedLine({ at, note, className }: { at: Date | number; note?: ReactNode; className?: string }) {
  const d = typeof at === "number" ? new Date(at) : at;
  return (
    <p className={cn("meta", className)} title={d.toLocaleString()}>
      Updated {timeAgo(d)}{note && <> · {note}</>}
    </p>
  );
}

// The last full URL (path and search) seen for each path, so Back to a page
// lands on it as it was left — its tab, filters and page — not a bare path.
const lastUrl = new Map<string, string>();

/** Call once in the app shell: remembers where each page was left, for `BackButton`. */
export function useRememberPages() {
  const { pathname, search } = useLocation();
  useEffect(() => { lastUrl.set(pathname, pathname + search); }, [pathname, search]);
}

/** Where Back to `to` goes: that page as it was last left, or `to` itself. */
export function backHref(to: string): string {
  return to.includes("?") ? to : lastUrl.get(to) ?? to;
}

/** A path's parent: "/library/import/review" → "/library/import"; "/library" → "/". */
export function parentPath(pathname: string): string {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  return "/" + parts.slice(0, -1).join("/");
}

/**
 * Back to the page above this one — on heroes and above a `PageHeader` (its
 * `back` prop). Always flat card with body text, so it reads on a photo, a blur
 * or the page alike (S6, C8); a long label is cut short. It goes to the
 * parent as it was left (`useRememberPages` in the shell), so filters and
 * tabs there survive. `overlay` is kept for older calls: it looks the same.
 */
export function BackButton({ to, label }: { to: string; label: string; overlay?: boolean }) {
  return (
    <Button asChild variant="secondary" className="min-w-0 max-w-full gap-1 bg-card pl-2 pr-3.5 text-sm">
      <Link to={backHref(to)} aria-label={`Back to ${label}`}>
        <Chevron dir="left" className="shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  );
}

/**
 * Full-width banner at the top of a page: the backdrop runs edge to edge of
 * the screen with no frame, while its content lines up with the page column.
 */
export function Banner({ backdrop, glow = "accent", back, badge, children, pullUp = true }: {
  /** Image blurred to fill the banner; falls back to a soft accent gradient. */
  backdrop?: string | null;
  glow?: "accent" | "highlight" | "support" | "yellow" | "purple";
  back?: { to: string; label: string };
  /** Top-right of the banner, opposite the back button (e.g. a status flag). */
  badge?: ReactNode;
  children: ReactNode;
  /** Tuck up under the top bar (the default, when it opens the page). Turn off when something sits above it. */
  pullUp?: boolean;
}) {
  const glowCls = {
    accent: "from-primary-900/70",
    highlight: "from-highlight-900/70",
    support: "from-support-900/70",
    yellow: "from-yellow-900/70",
    purple: "from-purple-900/70",
  }[glow];

  return (
    // Breaks out of the page column to the full screen width and up against the app bar.
    <section className={cn("relative isolate mb-6 ml-[calc(50%-50vw)] w-screen overflow-hidden sm:mb-8", pullUp && "-mt-6 sm:-mt-8")}>
      {/* Backdrop: the image itself, blurred and scaled up so it fills the whole
          banner edge to edge (scaling hides the soft edges blur leaves behind),
          under the page colour — as much as the theme needs for text to read on any picture (C8). The whole layer fades out at the bottom (.fade-out), so
          the page's own backdrop shows through — never a hard edge or a band of page colour. */}
      <div aria-hidden="true" className={cn("fade-out absolute inset-0 -z-10 overflow-hidden", !pullUp && "fade-both")}>
        {backdrop ? (
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full scale-150 object-cover blur-2xl saturate-150" />
        ) : (
          <div className={cn("absolute inset-0 bg-linear-to-br via-support-950/60 to-transparent", glowCls)} />
        )}
        <div className={cn("absolute inset-0", backdrop ? "hero-scrim-image" : "hero-scrim-blur")} />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {(back || badge) && (
          <div className="flex min-h-[56px] items-center justify-between gap-3 pt-3 sm:pt-4">
            {back ? <BackButton to={back.to} label={back.label} overlay /> : <span />}
            {badge}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Full-size image over the page (shadcn `Dialog`); tap anywhere or press Escape to close. */
export function ImageViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} aria-describedby={undefined} onClick={onClose}
        className="flex h-[100dvh] max-h-none w-screen max-w-none items-center justify-center rounded-none border-0 bg-transparent p-4 pt-[calc(1rem+var(--safe-top))] sm:max-w-none">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img src={src} alt={alt} className="max-h-full max-w-full rounded-lg object-contain" />
        <DialogClose asChild>
          <Button variant="secondary" size="icon" aria-label="Close" className="absolute right-4 top-[calc(1rem+var(--safe-top))]"><XIcon className="size-5" /></Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Banner for detail pages: thumbnail (tap for full size), eyebrow, big title,
 * meta lines and pill actions over the blurred image.
 */
export function Hero({ imageUrl, imageAlt, eyebrow, title, children, actions, back, badge, accent = "accent", square = false, pullUp = true }: {
  imageUrl?: string | null;
  imageAlt?: string;
  eyebrow?: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  /** Shown top-right, e.g. a status Badge. */
  badge?: ReactNode;
  accent?: "accent" | "highlight" | "support" | "yellow" | "purple";
  /** Square thumbnail (people, places) instead of a portrait one (posters). */
  square?: boolean;
  /** As `Banner`'s: off when something sits above the hero. */
  pullUp?: boolean;
}) {
  const glow = {
    accent: "from-primary-900/70",
    highlight: "from-highlight-900/70",
    support: "from-support-900/70",
    yellow: "from-yellow-900/70",
    purple: "from-purple-900/70",
  }[accent];
  const [viewing, setViewing] = useState(false);
  // A picture that fails to load gives the initials thumbnail and the plain glow, not a broken image.
  const shown = useImageOrFallback(imageUrl);
  const thumbCls = cn(
    "shrink-0 overflow-hidden rounded-xl border border-border bg-muted",
    square ? "h-24 w-24 sm:h-44 sm:w-44" : "h-32 w-24 sm:h-60 sm:w-44",
  );

  return (
    <Banner backdrop={shown.src} glow={accent} back={back} badge={badge} pullUp={pullUp}>
      {viewing && shown.src && <ImageViewer src={shown.src} alt={imageAlt ?? title} onClose={() => setViewing(false)} />}
      <div className="flex items-end gap-4 pb-6 pt-6 sm:gap-8 sm:pb-8 sm:pt-10">
        <div className={thumbCls}>
          {shown.src ? (
            <button type="button" onClick={() => setViewing(true)} aria-label="View full size"
              className="group relative block h-full w-full cursor-zoom-in">
              <img src={shown.src} alt={imageAlt ?? title} onError={shown.onError} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              {/* Small expand hint in the corner */}
              <span className="border border-border bg-card absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </span>
            </button>
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center bg-linear-to-br to-muted", glow)}>
              <span className="font-display text-3xl text-subtle-foreground sm:text-5xl">{initials(title)}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="eyebrow mb-1.5 text-muted-foreground">{eyebrow}</p>}
          <h1 className="line-clamp-3 font-display text-28 leading-[1.05] text-foreground break-words sm:text-6xl">{title}</h1>
          {children && <div className="mt-2 line-clamp-3 space-y-0.5 break-words text-15 text-muted-foreground sm:mt-3 sm:text-lg">{children}</div>}
        </div>
      </div>
      {actions && <div className="controls pb-6 sm:pb-8">{actions}</div>}
    </Banner>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sections and lists
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Titled block. `flush` drops the inner padding for edge-to-edge lists; `plain` drops the card (for a grid of tiles under a title).
 * Side by side in a grid (`Columns`) its card stretches to the row's tallest, content at the top: one size per row.
 */
export function Section({ title, count, action, children, flush = false, plain = false, fill = false, className }: {
  title?: ReactNode;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  plain?: boolean;
  /** Take the rest of the page's height (inside a `Page`), so a short last section reaches the dock instead of stopping halfway. */
  fill?: boolean;
  className?: string;
}) {
  return (
    // A column, so in a grid row (which stretches every cell to the tallest) the card takes the spare height.
    <section className={cn("flex min-w-0 flex-col gap-3", fill && "flex-1", className)}>
      {(title || action) && (
        // One control high whether or not it has actions, so sections side by side start their cards level.
        <div className="flex min-h-control flex-wrap items-center justify-between gap-x-3 gap-y-2 px-0.5">
          {title && (
            // Shrinks (and trims) before the actions wrap: they only drop below once the title would be under 8 rem.
            <h2 className="h-section min-w-[8rem] flex-1 basis-0 truncate">
              {title}
              {count != null && <span className="ml-2 text-sm font-body font-medium text-subtle-foreground">{count.toLocaleString()}</span>}
            </h2>
          )}
          {action && <div className="controls ml-auto max-w-full shrink-0 justify-end">{action}</div>}
        </div>
      )}
      {plain ? children : <Card className={cn("flex-1 gap-0 py-0", flush ? "overflow-hidden" : "p-4 sm:p-5")}>{children}</Card>}
    </section>
  );
}

/**
 * A part of a long page, bigger than a `Section`: a rule above (none on the
 * page's first), an eyebrow with an 8 px dot in its tone, a big heading, at
 * most one action on the right, an optional `lede`, then the sections in
 * it. For pages that read as a few parts with sections inside them, rather
 * than one long run of sections.
 */
export function Part({ id, eyebrow, title, lede, tone = "support", action, first = false, children }: {
  /** For aria-labelledby; one is made up when left out. */
  id?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "accent" | "highlight" | "support";
  /** One action at most (a Button, a `Menu`). */
  action?: ReactNode;
  /** The page's first part: no rule above it. */
  first?: boolean;
  children: ReactNode;
}) {
  const auto = useId();
  const hid = id ?? `part-${auto}`;
  const text = { accent: "text-primary", highlight: "text-highlight", support: "text-support" }[tone];
  return (
    <section aria-labelledby={hid} className={cn("min-w-0 space-y-6", !first && "border-t border-border pt-6")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("eyebrow flex min-w-0 items-center gap-2", text)}>
            <span aria-hidden="true" className={cn(DOT[tone], "h-2 w-2 shrink-0")} />
            <span className="min-w-0 truncate">{eyebrow}</span>
          </p>
          <h2 id={hid} className="line-clamp-2 break-words font-display text-3xl leading-tight text-foreground sm:text-4xl">{title}</h2>
        </div>
        {action && <div className="controls ml-auto max-w-full shrink-0 justify-end">{action}</div>}
      </div>
      {lede && <Lede className="-mt-3">{lede}</Lede>}
      {children}
    </section>
  );
}

/**
 * Sections or cards side by side: one column on phones, `count` (2 or 3)
 * from `lg:` (`sm:` with `from="sm"`). Every row is as tall as its tallest
 * cell and each `Section`'s card stretches to it, content at the top — so
 * two charts side by side are one size even when one has a line under it.
 */
export function Columns({ count = 2, from = "lg", children, className }: { count?: 2 | 3; from?: "sm" | "lg"; children: ReactNode; className?: string }) {
  const cols = {
    sm: { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" },
    lg: { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" },
  }[from][count];
  // One column on phones, minmax(0, 1fr), so a card's trimmed line can't widen it past the screen.
  return <div className={cn("grid grid-cols-1 items-stretch gap-6", cols, className)}>{children}</div>;
}

export type ListLayout = "rows" | "tiles";

/**
 * Divided list inside a card — pair with EventRow / EntityRow. `layout="tiles"`
 * shows the same items as a grid of cards instead (one column on phones, two
 * or three wider); `bare` leaves out the card around rows, for use inside a
 * `Section flush`. Let people pick with `LayoutSwitch` + `useListLayout`.
 * `maxHeight` (rows) caps the card and scrolls inside it, with the bar
 * always showing (`.scroll-area`) so it's plain there's more.
 */
export function List({ children, layout = "rows", bare = false, maxHeight, columns, className }: {
  children: ReactNode;
  layout?: ListLayout;
  /** Tiles only: columns on desktop (from `lg`), from `useGridColumns`; left out, the theme's `gridColumns` or 3. */
  columns?: number | null;
  bare?: boolean;
  /** Rows only: the most the list grows to (px or a CSS length), then it scrolls. */
  maxHeight?: number | string;
  className?: string;
}) {
  if (layout === "tiles") {
    return (
      <div className={cn("grid auto-rows-fr gap-3 sm:grid-cols-2", DESKTOP_COLS[3], className)} style={gridColumnsStyle(columns)}>
        {Children.toArray(children).map((child, i) => <div key={i} className="rounded-xl border border-border bg-card h-full overflow-hidden">{child}</div>)}
      </div>
    );
  }
  if (maxHeight != null) {
    // The card clips its corners; the box inside scrolls, so the bar sits within the card's edge.
    return (
      <div className={cn(!bare && "rounded-xl border border-border bg-card overflow-hidden", className)}>
        <div className="scroll-area divide-etched" style={{ maxHeight }}>{children}</div>
      </div>
    );
  }
  return <div className={cn(!bare && "rounded-xl border border-border bg-card overflow-hidden", "divide-etched", className)}>{children}</div>;
}

/** Rows or tiles, remembered per list (`key`) in this browser. */
export function useListLayout(key: string, initial: ListLayout = "rows"): [ListLayout, (l: ListLayout) => void] {
  const storageKey = `${BRAND.storagePrefix}.layout.${key}`;
  const [layout, setLayout] = useState<ListLayout>(() => {
    try { const v = localStorage.getItem(storageKey); return v === "rows" || v === "tiles" ? v : initial; } catch { return initial; }
  });
  const set = (l: ListLayout) => {
    setLayout(l);
    try { localStorage.setItem(storageKey, l); } catch { /* storage unavailable: the choice lasts until reload */ }
  };
  return [layout, set];
}

/**
 * One grid's desktop columns, in the URL (`?<key>-cols=6`, N1): `null`
 * follows the app-wide setting (`Theme.gridColumns`). Pass the value to
 * `MediaGrid columns` or `List columns`, and both to a `ColumnsPicker`.
 */
export function useGridColumns(key: string): [number | null, (n: number | null) => void] {
  const [raw, set] = useUrlState(`${key}-cols`, "auto", ["auto", ...GRID_COLUMNS.map(String)]);
  const value = raw === "auto" ? null : Number(raw);
  return [value, useCallback((n: number | null) => set(n ? String(n) : "auto"), [set])];
}

/**
 * How many columns a tile grid shows on desktop — for content that wants
 * more (covers, swatches) or fewer (cards with text). A small `SelectField`
 * for a `Section`'s action slot, shown from `lg` only (phones and tablets
 * keep the grid's own count). "Auto" follows the app-wide setting.
 */
export function ColumnsPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  return (
    <div className="hidden lg:block">
      <SelectField size="sm" label="Columns on desktop" value={value ? String(value) : "auto"}
        onChange={(v) => onChange(v === "auto" ? null : Number(v))}
        options={[{ value: "auto", label: "Auto columns" }, ...GRID_COLUMNS.map((n) => ({ value: String(n), label: `${n} columns` }))]} />
    </div>
  );
}

/** The rows ⇄ tiles switch for a `List` — small `Tabs`, sized for a `Section`'s action slot. */
export function LayoutSwitch({ value, onChange }: { value: ListLayout; onChange: (l: ListLayout) => void }) {
  return <Tabs size="sm" value={value} onChange={onChange} options={[{ value: "rows", label: "List" }, { value: "tiles", label: "Tiles" }]} />;
}

/** Sticky-style group label between rows (month headers etc.). */
export function ListGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="list-group-label flex items-center gap-2 bg-linear-to-r from-support-900/50 via-support-950/40 to-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-support">
      <span aria-hidden="true" className="dot-support h-2 w-2" />
      {children}
    </div>
  );
}

/**
 * A tear-off calendar ticket: the month on a solid, lit highlight band, the day
 * big below it, then the year or weekday. Opaque colour on purpose — a thin
 * wash of the highlight would go grey on a background of the opposite hue.
 */
export function DateBlock({ date, showYear = false, approximate = false }: { date: string; showYear?: boolean; approximate?: boolean }) {
  const p = dateParts(date);
  return (
    <div className="flex w-[52px] shrink-0 flex-col items-center overflow-hidden rounded-xl border border-border bg-muted leading-none sm:w-14">
      <span className="bg-highlight text-highlight-foreground w-full py-[3px] text-center text-10 font-bold tracking-wider">{p.month}</span>
      <span className="pt-1 font-display text-24 leading-[1.05] text-foreground sm:text-26">{approximate ? "~" : p.day}</span>
      <span className="pb-1.5 text-10.5 font-medium text-subtle-foreground">{showYear ? p.year : p.weekday}</span>
    </div>
  );
}

const rowBase = "group flex items-center gap-3 px-4 py-3.5 min-h-[76px] transition-colors hover:bg-accent active:bg-accent sm:gap-4";

/** A dated item as a row: date block, optional thumb, title, sub lines, status dot, chevron. */
export function EventRow({ to, onOpen, date, title, subtitle, meta, imageUrl, status, showYear = true, approximate, selected, onSelect }: {
  /** Where the row goes. Or give `onOpen` instead, to open something in place (a log in a Sheet). */
  to?: string;
  onOpen?: () => void;
  date: string;
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  imageUrl?: string | null;
  status?: RowStatus | null;
  showYear?: boolean;
  approximate?: boolean;
  /** Selection mode: the row toggles instead of opening the item. */
  selected?: boolean;
  onSelect?: () => void;
}) {
  const thumb = useImageOrFallback(imageUrl);
  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={!!selected}
        className={cn(rowBase, "w-full text-left", selected && "bg-primary/10")}>
        <span className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "bg-primary text-primary-foreground border-transparent" : "border-border",
        )}>
          {selected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
          )}
        </span>
        <DateBlock date={date} showYear={showYear} approximate={approximate} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-15 font-semibold leading-snug text-foreground sm:text-base">{title}</p>
          {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
          {meta && <p className="mt-0.5 truncate text-xs text-subtle-foreground">{meta}</p>}
        </div>
      </button>
    );
  }
  const body = (
    <>
      <DateBlock date={date} showYear={showYear} approximate={approximate} />
      {imageUrl !== undefined && (
        <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
          {thumb.src && <img src={thumb.src} alt="" loading="lazy" onError={thumb.onError} className="h-full w-full object-cover" />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-15 font-semibold leading-snug text-foreground group-hover:text-primary sm:text-base">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
        {meta && <p className="mt-0.5 truncate text-xs text-subtle-foreground">{meta}</p>}
      </div>
      {/* Status as a quiet dot — the label is in the tooltip and on the detail page */}
      {status && <span title={status.label} aria-label={status.label} className={cn(STATUS_DOT, TONES[status.tone].dot, status.live && LIVE)} />}
      <Chevron className="text-subtle-foreground group-hover:text-primary" />
    </>
  );
  return onOpen || !to
    ? <button type="button" onClick={onOpen} className={cn(rowBase, "w-full text-left")}>{body}</button>
    : <Link to={to} className={rowBase}>{body}</Link>;
}

/**
 * A read-only label and its value: `inline` (label left, value right — settings, a job's details)
 * or `stacked` (a small label above — a detail page's facts). Put several in a `List` or `Section flush`.
 */
export function KeyValue({ label, children, layout = "inline" }: { label: ReactNode; children: ReactNode; layout?: "inline" | "stacked" }) {
  return layout === "inline" ? (
    <div className="flex min-h-[56px] items-center justify-between gap-4 px-4 py-3">
      <span className="min-w-0 truncate text-15 font-semibold text-foreground">{label}</span>
      <span className="min-w-0 max-w-[65%] shrink-0 truncate whitespace-nowrap text-right text-sm text-muted-foreground">{children}</span>
    </div>
  ) : (
    <div className="px-4 py-3">
      <p className="truncate text-xs font-semibold text-subtle-foreground">{label}</p>
      <div className="mt-0.5 line-clamp-3 break-words text-15 text-foreground">{children}</div>
    </div>
  );
}

/** One setting turned on or off, as a whole-row switch (44 px+ tall) with a label and an optional hint (shadcn `Switch`, A4). */
export function SwitchRow({ label, hint, checked, onChange, disabled }: {
  label: ReactNode; hint?: ReactNode; checked: boolean; onChange: (on: boolean) => void; disabled?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex min-h-[60px] w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent", disabled && "cursor-default opacity-60")}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-15 font-semibold">{label}</span>
        {hint && <span className="line-clamp-2 block text-sm text-muted-foreground">{hint}</span>}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} className="shrink-0" />
    </label>
  );
}

export type AutocompleteOption = { id: string; label: string; sub?: ReactNode };

/**
 * Pick an existing record as you type, or make a new one: a field with a list of matches
 * under it (arrow keys, Enter, Escape). `onCreate` adds "Add “…”" when nothing matches
 * exactly. For several (a lineup, tags), keep the picks as chips above it and clear the text on pick.
 */
export function Autocomplete({ label, value, onChange, options, onPick, onCreate, placeholder }: {
  label?: string;
  value: string;
  onChange: (text: string) => void;
  /** The matches for `value` (the app filters or fetches them). */
  options: AutocompleteOption[];
  onPick: (option: AutocompleteOption) => void;
  onCreate?: (text: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const text = value.trim();
  const canCreate = !!onCreate && !!text && !options.some((o) => o.label.toLowerCase() === text.toLowerCase());
  const count = options.length + (canCreate ? 1 : 0);
  const choose = (i: number) => {
    if (i < options.length) onPick(options[i]!);
    else if (canCreate) onCreate!(text);
    setOpen(false);
  };
  return (
    <div className="relative">
      {label && <Label htmlFor={id} className="mb-1.5">{label}</Label>}
      <Input id={id} value={value} placeholder={placeholder} role="combobox" aria-expanded={open && count > 0} aria-autocomplete="list"
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, count - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && open && count) { e.preventDefault(); choose(active); }
          else if (e.key === "Escape") setOpen(false);
        }}
        />
      {open && count > 0 && text && (
        <ul role="listbox" className="scroll-area absolute inset-x-0 top-full z-30 mt-1 max-h-64 rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-md">
          {options.map((o, i) => (
            <li key={o.id} role="option" aria-selected={i === active}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}
                className={cn("block min-h-[44px] w-full px-3 py-2 text-left", i === active && "bg-accent")}>
                <span className="block truncate text-15 font-semibold">{o.label}</span>
                {o.sub && <span className="block truncate text-xs text-subtle-foreground">{o.sub}</span>}
              </button>
            </li>
          ))}
          {canCreate && (
            <li role="option" aria-selected={active === options.length}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(options.length)}
                className={cn("block min-h-[44px] w-full px-3 py-2 text-left text-15 font-semibold text-primary", active === options.length && "bg-accent")}>
                Add “{text}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * An image URL that falls back when it fails to load: `src` is null once the
 * browser reports an error for that URL, so the caller shows its placeholder
 * instead of a broken image. A new URL gets a fresh try.
 */
export function useImageOrFallback(url?: string | null): { src: string | null; onError: () => void } {
  const [failed, setFailed] = useState<string | null>(null);
  const src = url && failed !== url ? url : null;
  return { src, onError: () => setFailed(src) };
}

/** A named thing (person, place, group) as a row with an avatar. */
export function EntityRow({ to, name, imageUrl, sub, meta, round = false, avatarText }: {
  to: string;
  name: string;
  imageUrl?: string | null;
  sub?: ReactNode;
  meta?: ReactNode;
  round?: boolean;
  /** What the placeholder avatar shows instead of the name's initials: a short code, a number, a symbol. */
  avatarText?: string;
}) {
  const shown = useImageOrFallback(imageUrl);
  return (
    <Link to={to} className={rowBase}>
      {/* A picture keeps its shape (square for places and covers, round for people);
          with none (or one that fails to load), the placeholder is a bare flat circle — never a circle in a box. */}
      {shown.src ? (
        <div className={cn("h-12 w-12 shrink-0 overflow-hidden bg-muted", round ? "rounded-full" : "rounded-lg")}>
          <img src={shown.src} alt="" loading="lazy" onError={shown.onError} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div aria-hidden="true" className="dot-support flex h-12 w-12 shrink-0 items-center justify-center font-display text-base text-support-foreground">{avatarText ?? initials(name)}</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-15 font-semibold text-foreground group-hover:text-primary sm:text-base">{name}</p>
        {sub && <p className="mt-0.5 truncate text-sm text-muted-foreground">{sub}</p>}
      </div>
      {meta && <span className="max-w-[40%] shrink-0 truncate text-sm font-medium text-subtle-foreground">{meta}</span>}
      <Chevron className="text-subtle-foreground group-hover:text-primary" />
    </Link>
  );
}

export type MediaSize = "sm" | "md" | "lg";
const MediaSizeContext = createContext<MediaSize>("md");
/**
 * Desktop (from `lg`) columns for a tile grid: the grid's own `--grid-cols`
 * (a `columns` prop), else the theme's (`Theme.gridColumns`, set app-wide in
 * the jimbo-ui config), else the grid's own count here. Written out in full
 * so Tailwind finds each class.
 */
const DESKTOP_COLS = {
  3: "lg:[grid-template-columns:repeat(var(--grid-cols,3),minmax(0,1fr))]",
  4: "lg:[grid-template-columns:repeat(var(--grid-cols,4),minmax(0,1fr))]",
  6: "lg:[grid-template-columns:repeat(var(--grid-cols,6),minmax(0,1fr))]",
} as const;

/** The style that sets one grid's desktop columns, or nothing to follow the theme. */
function gridColumnsStyle(columns?: number | null): CSSProperties | undefined {
  return columns ? ({ "--grid-cols": columns } as CSSProperties) : undefined;
}

const MEDIA_COLS: Record<MediaSize, string> = {
  sm: cn("grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5", DESKTOP_COLS[6]),
  md: cn("grid-cols-2 gap-3 sm:grid-cols-3", DESKTOP_COLS[4]),
  lg: cn("grid-cols-1 gap-3 sm:grid-cols-2", DESKTOP_COLS[3]),
};

/**
 * The grid for `MediaCard`s. `size` sets how big each card is: `sm` (three
 * across on phones, up to six wide — covers, a big collection to scan),
 * `md` (two, up to four — the default) or `lg` (one, up to three — a few
 * things to feature). Cards inside take the size: smaller type and padding
 * at `sm`. Never a sideways scroll strip.
 */
export function MediaGrid({ size = "md", columns, children, className }: {
  size?: MediaSize;
  /** Columns on desktop (from `lg`), from `useGridColumns`; left out, the theme's `gridColumns`, else the size's own. */
  columns?: number | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <MediaSizeContext.Provider value={size}>
      {/* Every row as tall as the tallest and every card filling its cell: one size of card. */}
      <div className={cn("grid auto-rows-fr [&>*]:h-full", MEDIA_COLS[size], className)} style={gridColumnsStyle(columns)}>{children}</div>
    </MediaSizeContext.Provider>
  );
}

/**
 * One line of text that never wraps: cut with an ellipsis, and while its card (the nearest `group`) is
 * hovered or focused, the rest of it scrolls into view and back when the pointer leaves. Text that fits
 * stays still. Reduced motion: the ellipsis only, the whole line in the tooltip.
 */
export function ScrollingLine({ children, className }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const measure = () => setShift(Math.max(0, Math.ceil(i.scrollWidth - o.clientWidth)));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    return () => ro.disconnect();
  }, [children]);
  return (
    <span ref={outer} className={cn("block overflow-hidden whitespace-nowrap", className)}
      title={typeof children === "string" && shift ? children : undefined}>
      <span ref={inner}
        className={cn("inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap align-top",
          shift > 0 && "motion-safe:transition-transform motion-safe:ease-linear motion-safe:group-hover:max-w-none motion-safe:group-hover:overflow-visible motion-safe:group-hover:[transform:translateX(var(--scroll-by))] motion-safe:group-hover:delay-300 motion-safe:group-focus-visible:max-w-none motion-safe:group-focus-visible:overflow-visible motion-safe:group-focus-visible:[transform:translateX(var(--scroll-by))]")}
        style={shift ? ({ "--scroll-by": `-${shift}px`, transitionDuration: `${Math.max(600, shift * 30)}ms` } as React.CSSProperties) : undefined}>
        {children}
      </span>
    </span>
  );
}

/** Image-led card for grids — put it in a `MediaGrid`, which sets its size. */
export function MediaCard({ to, name, imageUrl, sub, meta, aspect = "video", contain = false, badge }: {
  to: string;
  name: string;
  imageUrl?: string | null;
  sub?: ReactNode;
  meta?: ReactNode;
  aspect?: "video" | "square" | "portrait";
  /** Fit the whole image (posters) over a blurred copy instead of cropping. */
  contain?: boolean;
  badge?: ReactNode;
}) {
  const aspectCls = aspect === "square" ? "aspect-square" : aspect === "portrait" ? "aspect-[3/4]" : "aspect-video";
  const small = useContext(MediaSizeContext) === "sm";
  // An image that fails to load (missing, moved, offline) falls back to the initials, not a broken image.
  const shown = useImageOrFallback(imageUrl);
  return (
    <Link to={to} className="group rounded-xl border border-border bg-card flex h-full flex-col overflow-hidden transition-colors hover:border-primary/60">
      <div className={cn("relative overflow-hidden bg-muted", aspectCls)}>
        {shown.src ? (
          contain ? (
            <>
              <img src={shown.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-lg" />
              <img src={shown.src} alt={name} loading="lazy" onError={shown.onError} className="relative h-full w-full object-contain" />
            </>
          ) : (
            <img src={shown.src} alt={name} loading="lazy" onError={shown.onError} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-card">
            <span className={cn("font-display text-subtle-foreground/50", small ? "text-xl" : "text-3xl")}>{initials(name)}</span>
          </div>
        )}
        {badge && <div className="absolute left-2 top-2">{badge}</div>}
      </div>
      <div className={cn("flex flex-1 flex-col gap-0.5", small ? "p-2 sm:p-2.5" : "p-3")}>
        <ScrollingLine className={cn("font-semibold leading-snug text-foreground group-hover:text-primary", small ? "text-sm" : "text-15")}>{name}</ScrollingLine>
        {sub && <ScrollingLine className={cn("text-muted-foreground", small ? "text-xs" : "text-sm")}>{sub}</ScrollingLine>}
        {meta && <p className={cn("mt-auto truncate pt-1 font-medium text-subtle-foreground", small ? "text-11" : "text-xs")}>{meta}</p>}
      </div>
    </Link>
  );
}

/** Tappable summary card: eyebrow, title, sub line, chevron. */
const DOT = { accent: "dot-primary", highlight: "dot-highlight", support: "dot-support" } as const;
export function LinkCard({ to, eyebrow, title, sub, accent = false, size = "md" }: {
  to?: string;
  /** "sm": tighter padding and type, for a row of quick ways in. */
  size?: "sm" | "md";
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Primary border — for the one card on a page that should stand out. */
  accent?: boolean;
}) {
  const body = (
    <>
      <div className="min-w-0 flex-1">
        <p className={cn("eyebrow", size === "md" && "mb-1")}>{eyebrow}</p>
        <p className={cn("truncate font-semibold text-foreground group-hover:text-primary", size === "md" ? "text-base sm:text-lg" : "text-15")}>{title}</p>
        {sub && <p className="mt-0.5 truncate text-sm text-muted-foreground">{sub}</p>}
      </div>
      {to && <Chevron className="text-subtle-foreground group-hover:text-primary" />}
    </>
  );
  const cls = cn("group flex-row items-center gap-3 py-0", size === "md" ? "min-h-[84px] p-4 sm:p-5" : "min-h-[64px] px-4 py-3", accent && "border-primary");
  return to
    ? <Card asChild className={cn(cls, "transition-colors hover:border-primary")}><Link to={to}>{body}</Link></Card>
    : <Card className={cls}>{body}</Card>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Numbers
// ─────────────────────────────────────────────────────────────────────────────

export function StatTile({ label, value, sub, accent = "muted", trend, to }: {
  label: string;
  value: string | number;
  sub?: ReactNode;
  accent?: "accent" | "highlight" | "support" | "muted";
  /** Recent values, oldest first: a sparkline under the number, its latest point in the tile's colour. */
  trend?: number[];
  /** Where the stat goes: the whole tile is the one link, no arrow text (N4). */
  to?: string;
}) {
  const col = { accent: "text-primary", highlight: "text-highlight", support: "text-support", muted: "text-foreground" }[accent];
  const cls = "relative block gap-0 overflow-hidden p-4 sm:p-5";
  const body = (
    <>
      <p className="eyebrow mb-1 flex min-w-0 items-center gap-1.5">
        {accent !== "muted" && <span aria-hidden="true" className={cn(DOT[accent], "h-2 w-2 shrink-0")} />}
        <span className="min-w-0 truncate">{label}</span>
      </p>
      <p className={cn("truncate font-display text-32 leading-tight sm:text-4xl", col)}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {trend && trend.length > 1 && <Sparkline values={trend} tone={accent === "muted" ? "accent" : accent} className="mt-3" />}
      {sub && <p className="mt-1.5 line-clamp-2 text-sm text-subtle-foreground">{sub}</p>}
    </>
  );
  return to
    ? <Card asChild className={cn(cls, "h-full transition-[border-color,transform] hover:border-primary/60 active:scale-[0.98]")}><Link to={to}>{body}</Link></Card>
    : <Card className={cls}>{body}</Card>;
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>;
}

/**
 * A page's frame: its sections a gap apart, at least as tall as the screen
 * between the top bar and the dock. A page low on content still fills it —
 * its last `Section fill` or `EmptyState fill` stretches down — rather than
 * stopping short with the backdrop showing under it.
 */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-1 flex-col gap-6", className)}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts — flat SVG in the theme's colours. Series take accent, support and
// highlight in that order (three at most); a chart never relies on colour
// alone: one series needs no legend, two or three get a readout that names
// each with its line key and value. Every chart has a hidden table of its
// numbers for screen readers, and a readout row instead of a hover-only
// tooltip, so a tap shows a value as well as a hover.
// ─────────────────────────────────────────────────────────────────────────────

export type ChartTone = "accent" | "support" | "highlight";
const SERIES_TONES: ChartTone[] = ["accent", "support", "highlight"];
const STROKE: Record<ChartTone, string> = { accent: "stroke-primary", support: "stroke-support", highlight: "stroke-highlight" };
const FILL: Record<ChartTone, string> = { accent: "fill-primary", support: "fill-support", highlight: "fill-highlight" };
const WASH: Record<ChartTone, string> = { accent: "fill-primary/10", support: "fill-support/10", highlight: "fill-highlight/10" };
const KEY: Record<ChartTone, string> = { accent: "bg-primary", support: "bg-support", highlight: "bg-highlight" };

/** 1,284 → "1,284"; 12,900 → "12.9K". */
export function compactNumber(n: number): string {
  return Math.abs(n) >= 10_000 ? new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n) : n.toLocaleString();
}

/** Round axis ticks from 0 up past `max`: 0 / 5 / 10 / 15, 0 / 1K / 2K… */
function niceTicks(max: number, count = 3): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * pow >= raw) ?? 10) * pow;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => +(i * step).toPrecision(12));
}

/** The element's width, kept up to date (charts draw in real pixels, so lines and dots never stretch). */
function useWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setWidth(e?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** The numbers behind a chart, for screen readers. (In a hidden div: a table ignores sr-only's 1 px width and would widen the page.) */
function ChartTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => (j === 0 ? <th key={j} scope="row">{v}</th> : <td key={j}>{v}</td>))}</tr>)}</tbody>
      </table>
    </div>
  );
}

/**
 * A small trend line with no axes — under a StatTile's number, or beside a
 * row. A 2 px line in the subtle text colour, the latest point as a dot in
 * the tone, so "now" stands out from the history.
 */
export function Sparkline({ values, tone = "accent", height = 28, className }: { values: number[]; tone?: ChartTone; height?: number; className?: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const pad = 5;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
  const y = (v: number) => pad + (max === min ? 0.5 : 1 - (v - min) / (max - min)) * (height - pad * 2);
  const last = values.length - 1;
  return (
    <div ref={ref} className={cn("w-full", className)} style={{ height }}
      role="img" aria-label={`Trend: ${values[0]?.toLocaleString()} to ${values[last]?.toLocaleString()}`}>
      {width > 0 && values.length > 1 && (
        <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
          <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="stroke-subtle-foreground/70" />
          <circle cx={x(last)} cy={y(values[last]!)} r={4} strokeWidth={2} className={cn(FILL[tone], "stroke-card")} />
        </svg>
      )}
    </div>
  );
}

export type TrendSeries = { label: string; values: number[]; tone?: ChartTone };

/**
 * Change over time: one to three lines over the same labels (days, weeks).
 * One series gets a soft wash under its line. Drag, tap or use the arrow keys
 * to move the crosshair; the readout above shows the values there (the
 * latest by default) and names each series, so it doubles as the legend.
 * One y-axis only — two measures of different sizes are two charts.
 */
export function TrendChart({ labels, series, format = compactNumber, height = 180, title }: {
  labels: string[];
  series: TrendSeries[];
  format?: (n: number) => string;
  height?: number;
  /** What's plotted, for screen readers (the Section title usually says it on screen). */
  title?: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const last = labels.length - 1;
  const [active, setActive] = useState<number | null>(null);
  const at = active ?? last;
  const lines = series.slice(0, 3).map((s, i) => ({ ...s, tone: s.tone ?? SERIES_TONES[i]! }));
  const ticks = niceTicks(Math.max(...lines.flatMap((l) => l.values), 0));
  const top = ticks[ticks.length - 1]!;
  const gutter = Math.max(...ticks.map((t) => format(t).length)) * 7 + 10;
  const pad = { top: 8, right: 8, bottom: 24, left: gutter };
  const plotW = Math.max(width - pad.left - pad.right, 1);
  const plotH = height - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (labels.length > 1 ? (i / last) * plotW : plotW / 2);
  const y = (v: number) => pad.top + (1 - v / top) * plotH;
  const nearest = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    return Math.min(last, Math.max(0, Math.round(((clientX - r.left - pad.left) / plotW) * last)));
  };
  const onPointer = (e: ReactPointerEvent<SVGRectElement>) => setActive(nearest(e.clientX, e.currentTarget.ownerSVGElement!));
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive(Math.min(last, Math.max(0, at + (e.key === "ArrowRight" ? 1 : -1))));
    }
  };
  // First, middle and last labels: enough to read the span without collisions.
  const xLabels = [...new Set([0, Math.round(last / 2), last])].filter((i) => labels.length > 1 || i === 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1" aria-live="polite">
        <span className="text-xs font-semibold text-subtle-foreground">{labels[at]}</span>
        {lines.map((l) => (
          <span key={l.label} className="flex items-baseline gap-2">
            {lines.length > 1 && <span aria-hidden="true" className={cn("h-0.5 w-3 self-center rounded-full", KEY[l.tone])} />}
            <span className="text-lg font-semibold tabular-nums text-foreground">{l.values[at] != null ? format(l.values[at]!) : "—"}</span>
            {lines.length > 1 && <span className="text-sm text-muted-foreground">{l.label}</span>}
          </span>
        ))}
      </div>
      <div ref={ref} tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`${title ?? lines.map((l) => l.label).join(", ")}: use the arrow keys to read each point`}
        className="rounded-lg outline-hidden focus-visible:ring-2 focus-visible:ring-primary" style={{ height }} data-no-swipe>
        {width > 0 && (
          <svg width={width} height={height} aria-hidden="true" className="touch-pan-y select-none overflow-visible">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} strokeWidth={1} className="stroke-border/70" />
                <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-subtle-foreground text-11 tabular-nums">{format(t)}</text>
              </g>
            ))}
            {xLabels.map((i) => (
              <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} className="fill-subtle-foreground text-11">{labels[i]}</text>
            ))}
            {lines.length === 1 && lines[0]!.values.length > 1 && (
              <path className={WASH[lines[0]!.tone]}
                d={`M${x(0)},${y(0)} ${lines[0]!.values.map((v, i) => `L${x(i)},${y(v)}`).join(" ")} L${x(lines[0]!.values.length - 1)},${y(0)} Z`} />
            )}
            {lines.map((l) => (
              <polyline key={l.label} points={l.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none"
                strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className={STROKE[l.tone]} />
            ))}
            <line x1={x(at)} x2={x(at)} y1={pad.top} y2={pad.top + plotH} strokeWidth={1} className="stroke-subtle-foreground/60" />
            {lines.map((l) => l.values[at] != null && (
              <circle key={l.label} cx={x(at)} cy={y(l.values[at]!)} r={4.5} strokeWidth={2} className={cn(FILL[l.tone], "stroke-card")} />
            ))}
            {/* The hit area: the whole plot, so the pointer only has to be near a point. */}
            <rect x={pad.left} y={0} width={plotW} height={height} fill="transparent"
              onPointerDown={onPointer} onPointerMove={onPointer} onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(null); }} />
          </svg>
        )}
      </div>
      <ChartTable caption={title ?? "Values over time"} columns={["", ...lines.map((l) => l.label)]}
        rows={labels.map((lab, i) => [lab, ...lines.map((l) => (l.values[i] != null ? format(l.values[i]!) : "—"))])} />
    </div>
  );
}

export type BarItem = { id: string; label: string; value: number; to?: string };

/**
 * Compares a few amounts as bars, in one tone. `horizontal` (the default):
 * a row each, label left, the value at the bar's tip — good for long names
 * and lists that link (`to`). `vertical`: columns over a short run (days,
 * months); tap or hover a column, or tab to it, to read its value above the
 * chart (the largest shows until you do). Columns with a `to` go there on a
 * click or Enter; on touch the first tap reads the value and a second tap on
 * the same column goes, and the readout carries a link either way.
 */
export function BarChart({ items, direction = "horizontal", tone = "accent", format = compactNumber, height = 160, title }: {
  items: BarItem[];
  direction?: "horizontal" | "vertical";
  tone?: ChartTone;
  format?: (n: number) => string;
  /** Vertical only: the plot's height in px. */
  height?: number;
  title?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 0) || 1;
  const biggest = items.reduce((b, it, i) => (it.value > (items[b]?.value ?? -Infinity) ? i : b), 0);
  const [active, setActive] = useState<number | null>(null);
  const navigate = useNavigate();
  /** The last pointer that pressed a column, and the column a finger last read. */
  const pointer = useRef<string>("mouse");
  const read = useRef<number | null>(null);
  const table = <ChartTable caption={title ?? "Amounts"} columns={["", "Value"]} rows={items.map((i) => [i.label, format(i.value)])} />;

  if (direction === "horizontal") {
    return (
      <div className="space-y-1">
        {items.map((it) => {
          const body = (
            <>
              <span className="w-[32%] shrink-0 truncate text-sm font-semibold text-muted-foreground group-hover:text-foreground">{it.label}</span>
              <span className="flex h-3 flex-1 items-center">
                {/* Square at the baseline, a 4 px round on the data end. */}
                <span className={cn("block h-full min-w-[2px] rounded-r-[4px]", KEY[tone])} style={{ width: `${(it.value / max) * 100}%` }} />
              </span>
              <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">{format(it.value)}</span>
            </>
          );
          const cls = "group flex h-11 items-center gap-3 rounded-lg px-1";
          return it.to
            ? <Link key={it.id} to={it.to} className={cn(cls, "transition-colors hover:bg-accent")}>{body}</Link>
            : <div key={it.id} className={cls}>{body}</div>;
        })}
        {table}
      </div>
    );
  }

  const shown = active ?? biggest;
  const every = Math.ceil(items.length / 8);
  return (
    <div className="space-y-3">
      <p className="flex min-h-7 items-baseline gap-2" aria-live="polite">
        <span className="text-lg font-semibold tabular-nums">{items[shown] ? format(items[shown]!.value) : "—"}</span>
        <span className="min-w-0 truncate text-sm text-muted-foreground">{items[shown]?.label}{active == null && items.length > 1 ? " · highest" : ""}</span>
        {items[shown]?.to && (
          <Link to={items[shown]!.to!} className="-my-2 ml-auto inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-accent">
            Open <Chevron className="h-3.5 w-3.5" />
          </Link>
        )}
      </p>
      {/* A finger lifting also "leaves", so only a mouse moving away puts the readout back. */}
      <div className="flex border-b border-border" style={{ height }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(null); }} data-no-swipe>
        {items.map((it, i) => (
          <button key={it.id} type="button" aria-label={`${it.label}: ${format(it.value)}${it.to ? ", open" : ""}`}
            onPointerEnter={() => setActive(i)} onPointerDown={(e) => { pointer.current = e.pointerType; setActive(i); }} onFocus={() => setActive(i)}
            onClick={() => {
              const finger = pointer.current !== "mouse";
              pointer.current = "mouse"; // Enter / Space on a focused column count as a click
              if (!it.to) return;
              if (finger && read.current !== i) { read.current = i; return; }
              navigate(it.to);
            }}
            className={cn("group flex h-full min-w-0 flex-1 items-end justify-center px-[1px] outline-hidden", it.to && "cursor-pointer")}>
            <span className={cn("block w-full max-w-6 rounded-t-[4px] transition-opacity", KEY[tone],
              shown === i ? "opacity-100" : "opacity-70 group-hover:opacity-100", "group-focus-visible:ring-2 group-focus-visible:ring-foreground")}
              style={{ height: `${Math.max((it.value / max) * 100, it.value > 0 ? 2 : 0)}%` }} />
          </button>
        ))}
      </div>
      <div className="flex">
        {items.map((it, i) => (
          <span key={it.id} className="min-w-0 flex-1 truncate text-center text-11 text-subtle-foreground">{i % every === 0 ? it.label : ""}</span>
        ))}
      </div>
      {table}
    </div>
  );
}

export type RankedItem = {
  id: string;
  name: string;
  sub?: string;
  count: number;
  href: string;
};

/** Leaderboard rows: rank, name, sub line, count. Two columns from sm up. */
export function RankedList({ items, unit = "item" }: { items: RankedItem[]; unit?: string }) {
  if (items.length === 0) return <p className="p-4 text-sm text-subtle-foreground">Nothing here yet.</p>;
  const rankColor = (rank: number) =>
    rank === 1 ? "text-primary" : rank === 2 ? "text-highlight" : rank === 3 ? "text-support" : "text-subtle-foreground";
  return (
    <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-border">
      {[items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))].map((col, ci) => (
        <div key={ci} className={cn("divide-etched", ci === 1 && "border-t border-border sm:border-t-0")}>
          {col.map((item, i) => {
            const rank = ci * Math.ceil(items.length / 2) + i + 1;
            return (
              <Link key={item.id} to={item.href} className={rowBase}>
                <span className={cn("w-7 shrink-0 text-right font-display text-xl", rankColor(rank))}>{rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-15 font-semibold text-foreground group-hover:text-primary">{item.name}</p>
                  {item.sub && <p className="truncate text-sm text-subtle-foreground">{item.sub}</p>}
                </div>
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                  {item.count}
                  <span className="ml-1 font-normal text-subtle-foreground">{item.count === 1 ? unit : `${unit}s`}</span>
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export type TimelineTone = "accent" | "highlight" | "support" | "muted";

export interface TimelineItem {
  id: string;
  /**
   * The short line above the title: the date, and what kind of milestone it
   * is ("Mar 2024 · Started"). It names what the dot's colour means, so the
   * colour is never the only cue.
   */
  when: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  meta?: ReactNode;
  /** Where the milestone goes: the whole card is the one tap target. */
  to?: string;
  /** The dot's colour, one per kind of milestone. Default `accent`. */
  tone?: TimelineTone;
  /** At the end of the `when` line, e.g. a "Now" or "New" `Badge`. */
  badge?: ReactNode;
  /** One small button under the card, outside its link (a card with `to` stays one tap target). */
  action?: ReactNode;
}

export interface TimelineGroup {
  /** A year, a month, a phase. Leave it out for one ungrouped run. */
  label?: ReactNode;
  items: TimelineItem[];
}

const TIMELINE_DOT: Record<TimelineTone, string> = {
  accent: "dot-primary",
  highlight: "dot-highlight",
  support: "dot-support",
  muted: "rounded-full bg-subtle-foreground",
};

function TimelineMilestone({ item }: { item: TimelineItem }) {
  const inner = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <p className="eyebrow min-w-0 flex-1 truncate">{item.when}</p>
        {item.badge && <span className="shrink-0">{item.badge}</span>}
      </div>
      <p className="mt-1 line-clamp-2 break-words font-semibold leading-snug text-foreground group-hover:text-primary">{item.title}</p>
      {item.body && <p className="mt-1 line-clamp-3 break-words text-sm text-muted-foreground">{item.body}</p>}
      {item.meta && <p className="mt-1.5 truncate text-xs font-medium text-subtle-foreground">{item.meta}</p>}
    </>
  );
  return (
    <li className="relative pl-7">
      {/* The 10 px status dot sits on the line, on the page — never inside the card. */}
      <span aria-hidden="true" className={cn("absolute left-0 top-5 h-2.5 w-2.5", TIMELINE_DOT[item.tone ?? "accent"])} />
      {item.to ? (
        <Link to={item.to} className="group rounded-xl border border-border bg-card block min-h-11 px-4 py-3 transition-colors hover:border-primary/60">{inner}</Link>
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-3">{inner}</div>
      )}
      {item.action && <div className="controls mt-2">{item.action}</div>}
    </li>
  );
}

/**
 * Milestones in order along a vertical line, in groups (a year, a month).
 * Each milestone is a card beside the line with its 10 px dot on the line,
 * outside the card; the dot's colour is one per kind of milestone, and the
 * `when` line names the kind too. A milestone with `to` is one tap target.
 * Text is trimmed: `when` and `meta` on one line, the title at two, the body
 * at three. Put it straight on the page or in a `Section plain`.
 */
export function Timeline({ groups, className }: { groups: TimelineGroup[]; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((g, i) => (
        <section key={i} className="min-w-0">
          {g.label != null && <h3 className="h-section mb-3 truncate pl-7">{g.label}</h3>}
          <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[4.5px] before:top-2 before:w-px before:bg-border">
            {g.items.map((it) => <TimelineMilestone key={it.id} item={it} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Heatmap — how much happened each day
// ─────────────────────────────────────────────────────────────────────────────

export interface HeatDay { date: string; value: number }

const HEAT_SHADES = ["bg-muted", "bg-primary-900", "bg-primary-800", "bg-primary-700", "bg-primary"];
const HEAT_DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
const HEAT_MIN_CELL = 11;
const heatWeekday = (iso: string) => (new Date(`${iso}T12:00`).getDay() + 6) % 7;

/** Steps at the 50th, 75th and 90th percentile of the days with something, so one huge day doesn't flatten the rest. */
function heatSteps(values: number[]): number[] {
  const v = values.filter((x) => x > 0).sort((a, b) => a - b);
  if (!v.length) return [1, 1, 1];
  const q = (p: number) => v[Math.min(v.length - 1, Math.floor(p * v.length))]!;
  return [q(0.5), q(0.75), q(0.9)];
}
const heatShade = (x: number, s: number[]) => (!x ? 0 : x <= s[0]! ? 1 : x <= s[1]! ? 2 : x <= s[2]! ? 3 : 4);

/**
 * A calendar heatmap: a square per day, a column per week (Monday at the
 * top), in five solid steps of the accent's shades. Days in order, oldest
 * first, one per day. Each day with something in it opens `to(date)`. Fills
 * its width and never scrolls sideways (L3): with `trim` a narrow screen
 * leaves off the earliest weeks; without it, weeks that don't fit wrap onto
 * more blocks of one width. A caption gives the totals and the key.
 */
export function Heatmap({ days: all, to, unit = "events", title, trim = true }: {
  days: HeatDay[];
  /** Where a day with something in it goes; left out, days aren't links. */
  to?: (date: string) => string;
  /** What a day's value counts, for labels and the caption ("visits"). */
  unit?: string;
  /** Names the figure for screen readers. */
  title?: string;
  /** On a narrow screen, show the latest weeks that fit (off: every week, wrapping). */
  trim?: boolean;
}) {
  const box = useRef<HTMLElement>(null);
  const [fit, setFit] = useState(60);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFit(Math.max(8, Math.floor(((e?.contentRect.width ?? 600) - 28) / HEAT_MIN_CELL))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const last = all[all.length - 1];
  const keep = last ? heatWeekday(last.date) + 1 + (fit - 1) * 7 : 0;
  const days = trim && all.length > keep ? all.slice(all.length - keep) : all;
  if (!days.length) return null;
  const s = heatSteps(all.map((d) => d.value));
  const cells: (HeatDay | null)[] = [...Array(heatWeekday(days[0]!.date)).fill(null), ...days];
  const weeks = Math.ceil(cells.length / 7);
  const months: { col: number; label: string }[] = [];
  cells.forEach((c, i) => {
    if (c && c.date.endsWith("-01")) months.push({ col: Math.floor(i / 7), label: new Date(`${c.date}T12:00`).toLocaleDateString([], { month: "short" }) });
  });
  const total = days.reduce((a, d) => a + d.value, 0);
  const active = days.filter((d) => d.value).length;
  const count = Math.max(1, Math.ceil(weeks / Math.max(fit, 1)));
  const per = Math.ceil(weeks / count);
  return (
    <figure ref={box} className="space-y-2" aria-label={title ?? `${active} days with ${unit}`}>
      <div className="space-y-3">
        {Array.from({ length: count }, (_, b) => b * per).map((from) => {
          const n = Math.min(per, weeks - from);
          return (
            <div key={from} className="grid gap-0.5 text-10 text-subtle-foreground" style={{ gridTemplateColumns: `1.75rem repeat(${per}, minmax(0, 1fr))` }}>
              <span />
              {Array.from({ length: per }, (_, k) => (
                <span key={k} className="h-3 overflow-visible whitespace-nowrap leading-3">{k < n ? months.find((x) => x.col === from + k)?.label ?? "" : ""}</span>
              ))}
              {Array.from({ length: 7 }, (_, row) => (
                <HeatRow key={row} row={row} from={from} weeks={n} cols={per} cells={cells} s={s} to={to} unit={unit} />
              ))}
            </div>
          );
        })}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-sm text-subtle-foreground">
        <span>{active.toLocaleString()} days with {unit} · {total.toLocaleString()} {unit}</span>
        <span className="inline-flex items-center gap-1" aria-hidden="true">
          Less {HEAT_SHADES.map((c) => <span key={c} className={cn("h-2.5 w-2.5 rounded-sm", c)} />)} More
        </span>
      </figcaption>
    </figure>
  );
}

function HeatRow({ row, from, weeks, cols, cells, s, to, unit }: {
  row: number; from: number; weeks: number; cols: number; cells: (HeatDay | null)[]; s: number[]; to?: (date: string) => string; unit: string;
}) {
  return (
    <>
      <span className="leading-none">{HEAT_DAYS[row]}</span>
      {Array.from({ length: cols }, (_, k) => {
        const w = from + k;
        const c = k < weeks ? cells[w * 7 + row] : null;
        if (!c) return <span key={w} />;
        const label = `${new Date(`${c.date}T12:00`).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" })}: ${c.value.toLocaleString()} ${unit}`;
        const cls = cn("block aspect-square w-full rounded-sm", HEAT_SHADES[heatShade(c.value, s)]);
        return c.value && to
          ? <Link key={w} to={to(c.date)} title={label} aria-label={label} className={cn(cls, "transition-opacity hover:opacity-70 active:opacity-70")} />
          : <span key={w} title={label} className={cls} />;
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CodeBlock — text to read or copy as it is
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw text (a command, a config line, a log excerpt) in monospace, wrapped,
 * on the field surface, with a Copy button beside it that says "Copied" for
 * two seconds. `prominent` makes Copy the primary button, for the one thing
 * on the page to do. `onCopy(ok)` lets the page say more (a toast), or say
 * it couldn't (the clipboard can refuse).
 */
export function CodeBlock({ code, label = "Copy", prominent = false, onCopy, className }: {
  code: string;
  /** Names the Copy button for screen readers ("Copy the command"). */
  label?: string;
  prominent?: boolean;
  onCopy?: (ok: boolean) => void;
  /** Layout only (J3). */
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onCopy?.(true);
    } catch {
      onCopy?.(false);
    }
  };
  return (
    <div className={cn("flex min-w-0 items-stretch gap-2", className)}>
      <code className="min-w-0 flex-1 select-all whitespace-pre-wrap break-all rounded-lg border border-border bg-muted px-3 py-2 font-mono text-13 text-foreground">{code}</code>
      <Button size="sm" variant={prominent ? "default" : "secondary"} onClick={() => void copy()} aria-label={label}>{copied ? "Copied" : "Copy"}</Button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────────────────────

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">{placeholder}</span>
      <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-subtle-foreground" strokeWidth={2.25} />
      <Input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-10" />
    </label>
  );
}

/**
 * A labelled slider (weight, spacing, vibrancy…): the label and current value
 * above, a full-width track in the primary below, 44 px tall for thumbs.
 */
export function RangeField({ label, value, onChange, min, max, step, format = String, className }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  /** How the value reads beside the label ("800", "+0.04 em", "120%"). */
  format?: (v: number) => string;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-subtle-foreground">{format(value)}</span>
      </span>
      {/* shadcn Slider, in a control-high box so its thumb is easy to catch. */}
      <Slider aria-label={label} min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v ?? value)} className="h-control" />
    </div>
  );
}

/**
 * Spread `total` over shares after one moves: share `i` becomes `value`
 * (kept between 0 and `total`, on a `step`), and the others split what's
 * left in proportion to what they had (evenly if they had nothing), rounded
 * to whole steps by largest remainder. The result always adds up to `total`.
 */
export function rebalance(values: number[], i: number, value: number, total: number, step = 1): number[] {
  const units = Math.round(total / step);
  if (values.length === 0) return [];
  if (values.length === 1) return [units * step];
  const mine = Math.max(0, Math.min(units, Math.round(value / step)));
  const others = values.map((_, j) => j).filter((j) => j !== i);
  const weights = others.map((j) => Math.max(0, values[j]!));
  const sum = weights.reduce((a, b) => a + b, 0);
  const share = spread(units - mine, sum > 0 ? weights : weights.map(() => 1));
  const out = values.slice();
  out[i] = mine * step;
  others.forEach((j, k) => { out[j] = share[k]! * step; });
  return out;
}

/** Shares scaled to add up to `total` (on a `step`), keeping their proportions — for a total that changed, or values from a link. */
export function normaliseShares(values: number[], total: number, step = 1): number[] {
  if (values.length === 0) return [];
  const sum = values.reduce((a, b) => a + Math.max(0, b), 0);
  return spread(Math.round(total / step), sum > 0 ? values.map((v) => Math.max(0, v)) : values.map(() => 1)).map((u) => u * step);
}

/** `units` whole units split by `weights`, largest remainder first. */
function spread(units: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const exact = weights.map((w) => (units * w) / sum);
  const out = exact.map(Math.floor);
  let left = units - out.reduce((a, b) => a + b, 0);
  const order = exact.map((e, k) => [e - Math.floor(e), k] as const).sort((a, b) => b[0] - a[0]);
  for (let n = 0; left > 0; n = (n + 1) % order.length, left--) out[order[n]![1]]! += 1;
  return out;
}

export type ShareItem = { id: string; label: ReactNode; sub?: ReactNode; value: number; action?: ReactNode };

/**
 * Linked sliders that split one total (100%, 60 items, a budget): moving
 * one moves the others the other way, in proportion, so they always add up
 * to `total` and never go past it. Each shows its percentage and its amount
 * ("40% · 24 items"). One share alone is the whole total. `onChange` gets
 * every value, in order. Pair with `normaliseShares` when the total changes.
 */
export function ShareSliders({ items, total, step = 1, unit, onChange, className }: {
  items: ShareItem[];
  total: number;
  step?: number;
  /** What the total counts ("items", "hours"); left out, only the percentage shows. */
  unit?: string;
  onChange: (values: number[]) => void;
  className?: string;
}) {
  const values = items.map((it) => it.value);
  const sum = values.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className={cn("divide-etched", className)}>
      {items.map((it, i) => (
        <div key={it.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex min-h-control items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-15 font-semibold">{it.label}</p>
              {it.sub && <p className="meta truncate">{it.sub}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap font-mono text-xs text-subtle-foreground">
                {Math.round((100 * it.value) / sum)}%{unit ? ` · ${it.value} ${unit}` : ""}
              </span>
              {it.action}
            </div>
          </div>
          <Slider min={0} max={total} step={step} value={[it.value]} disabled={items.length < 2}
            aria-label={`Share for ${typeof it.label === "string" ? it.label : it.id}`}
            onValueChange={([v]) => onChange(rebalance(values, i, v ?? it.value, total, step))}
            className="h-control" />
        </div>
      ))}
    </div>
  );
}

/** One pick from many (a filter, a sort on phones): shadcn `Select`, one control high (K1, K8). */
export function SelectField<T extends string>({ value, onChange, options, label, size = "md", className }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  size?: "md" | "sm";
  /** Layout only (J3). */
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger aria-label={label} size={size === "sm" ? "sm" : "default"} className={cn("w-full font-semibold", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/**
 * Two to four tabs for views of one thing (Upcoming / Past): shadcn `Tabs`,
 * the chosen one a solid primary fill (S7). Full width on phones;
 * `size="sm"` is a compact inline switch for a section's action slot.
 */
export function Tabs<T extends string>({ value, onChange, options, size = "md" }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  size?: "md" | "sm";
}) {
  const many = options.length > 3;
  return (
    <UiTabs value={value} onValueChange={(v) => onChange(v as T)} className={size === "sm" ? "shrink-0" : "w-full sm:w-auto"}>
      <TabsList className={cn(size === "sm" ? "" : "w-full sm:min-w-[320px]")}>
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value}
            className={cn("min-w-0 truncate font-semibold", size === "sm" ? "px-3" : many ? "px-2.5 sm:px-4" : "px-4 text-15 sm:text-sm")}>
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </UiTabs>
  );
}

/**
 * Tab buttons for desktop filters (softly rounded `Button`s, not pills); wraps rather than scrolling. `scroll` keeps
 * them on one row that scrolls sideways (to the screen's edges on phones) —
 * for a page's own sections when there are more than fit, so they don't stack
 * into rows that look like the filters under them. Its scrollbar always shows
 * under the row (`.scroll-area-x`), so it's plain there are more.
 */
export function PillTabs<T extends string>({ value, onChange, options, scroll = false }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; activeClass?: string }[];
  scroll?: boolean;
}) {
  const row = useRef<HTMLDivElement>(null);
  // Keep the chosen tab in view when it changes (or opens from a link).
  useEffect(() => {
    if (!scroll) return;
    const box = row.current, tab = box?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (!box || !tab) return;
    const [left, right] = [tab.offsetLeft - box.offsetLeft, tab.offsetLeft - box.offsetLeft + tab.offsetWidth];
    if (left < box.scrollLeft) box.scrollTo({ left: left - 16, behavior: "smooth" });
    else if (right > box.scrollLeft + box.clientWidth) box.scrollTo({ left: right - box.clientWidth + 16, behavior: "smooth" });
  }, [scroll, value]);
  return (
    <div ref={row} className={scroll
      ? "scroll-area-x -mx-4 flex gap-2 px-4 sm:mx-0 sm:px-0"
      : "flex flex-wrap gap-2"}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Button key={o.value} type="button" aria-pressed={active} onClick={() => onChange(o.value)}
            variant={active ? "default" : "secondary"}
            className={cn("shrink-0 px-4 text-sm", active ? o.activeClass : "bg-card text-muted-foreground hover:text-foreground")}>
            {o.label}
          </Button>
        );
      })}
    </div>
  );
}

export function Pager({ page, totalPages, total, pageSize, onPage }: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav className="mt-6 flex items-center gap-3" aria-label="Pagination">
      <Button variant="secondary" className="flex-1 bg-card sm:flex-none" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <Chevron dir="left" /> Prev
      </Button>
      <p className="shrink-0 text-center text-sm text-subtle-foreground sm:flex-1">
        <span className="hidden sm:inline">{from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()} · </span>
        Page {page} of {totalPages}
      </p>
      <Button variant="secondary" className="flex-1 bg-card sm:flex-none" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next <Chevron />
      </Button>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Picks, related links and the floating bar
// ─────────────────────────────────────────────────────────────────────────────

export interface ToggleOption<T extends string | number> {
  value: T;
  label: ReactNode;
  /** A small second line (an alternative name, a count). */
  sub?: ReactNode;
  /** Spoken name, when the label is a symbol. */
  ariaLabel?: string;
}

/**
 * Several picks from a small fixed set (days of the week, tags, sizes), as
 * a grid of toggle buttons 44 px tall that wraps, never a scroll strip.
 * Picked ones are a flat accent fill and aria-pressed. For one pick, use Tabs.
 */
export function ToggleGrid<T extends string | number>({ options, selected, onToggle, columns = 4, smColumns, className }: {
  options: ToggleOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  /** Columns on phones. */
  columns?: number;
  /** Columns from `sm:` up (defaults to the phone count). */
  smColumns?: number;
  className?: string;
}) {
  return (
    // shadcn ToggleGroup (type multiple): each item aria-pressed, picked ones a flat primary fill (S7).
    <ToggleGroup type="multiple" spacing={2} value={selected.map(String)}
      onValueChange={(next) => {
        const changed = options.find((o) => next.includes(String(o.value)) !== selected.includes(o.value));
        if (changed) onToggle(changed.value);
      }}
      className={cn("grid w-full gap-2 [grid-template-columns:repeat(var(--tg),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--tg-sm),minmax(0,1fr))]", className)}
      style={{ ["--tg" as string]: columns, ["--tg-sm" as string]: smColumns ?? columns }}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <ToggleGroupItem key={String(o.value)} value={String(o.value)} aria-label={o.ariaLabel}
            className="h-auto min-h-11 flex-col border border-border bg-muted px-1 py-1.5 text-15 font-semibold leading-tight text-muted-foreground active:scale-95">
            <span>{o.label}</span>
            {o.sub && <span className={cn("text-11 font-medium", on ? "text-primary-foreground/80" : "text-subtle-foreground")}>{o.sub}</span>}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

export interface LinkChip {
  to: string;
  label: ReactNode;
  /** Muted text after the label ("relative", "3 items"). */
  sub?: ReactNode;
  tone?: "accent" | "highlight" | "support";
}

const CHIP_DOTS = { accent: "dot-primary", highlight: "dot-highlight", support: "dot-support" } as const;

/**
 * Related things as a wrapping row of linked chips (44 px tall), each with an
 * optional 8 px dot in a theme colour and a short second label, so colour is
 * never the only cue. For "see also", neighbours, tags that go somewhere.
 */
export function LinkChips({ items, className }: { items: LinkChip[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((c, i) => (
        <UiBadge key={`${c.to}-${i}`} variant="secondary" asChild>
          <Link to={c.to} className="min-h-11 min-w-0 max-w-full gap-2 rounded-lg px-3 text-sm text-foreground hover:border-primary hover:text-primary active:scale-95">
            {c.tone && <span aria-hidden="true" className={cn(CHIP_DOTS[c.tone], "h-2 w-2 shrink-0")} />}
            <span className="min-w-0 truncate font-semibold">{c.label}</span>
            {c.sub && <span className="shrink-0 font-normal text-subtle-foreground">{c.sub}</span>}
          </Link>
        </UiBadge>
      ))}
    </div>
  );
}

/**
 * A bar floating above the dock (`--above-dock`): a status line and its
 * actions. The save bar, a select-mode action bar, a player's Start/Stop.
 * `live` pulses an accent dot while something is running. Give the page
 * some bottom padding (pb-20) so the bar never covers the last section.
 */
export function FloatingBar({ children, actions, live }: { children: ReactNode; actions: ReactNode; live?: boolean }) {
  return (
    <div className="fixed inset-x-0 z-40 flex justify-center px-3 bottom-[var(--above-dock)]">
      <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-4">
        {live != null && <span aria-hidden="true" className={cn(STATUS_DOT, live ? cn("dot-primary", LIVE) : "bg-subtle-foreground")} />}
        <p className="min-w-0 flex-1 truncate text-sm font-semibold" aria-live="polite">{children}</p>
        {actions}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sheet — the one modal: a drawer up from the bottom on phones, a dialog from sm
// ─────────────────────────────────────────────────────────────────────────────

/** Whether a media query matches, kept up to date. */
export function useMediaQuery(query: string): boolean {
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const update = () => setOn(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, [query]);
  return on;
}

/**
 * The one modal (P2): shadcn `Drawer` on phones (drag down to close, a grab
 * handle, up to 92 dvh) and `Dialog` from `sm` (centred, `max-w-lg`, or
 * `max-w-xl` when `wide`). Open while it's rendered; `onClose` when it's
 * dismissed. Focus is trapped, Escape closes, the page behind doesn't scroll.
 */
export function Sheet({ title, subtitle, onClose, children, wide = false }: {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const desktop = useMediaQuery("(min-width: 640px)");
  const close = (open: boolean) => { if (!open) onClose(); };
  const header = (Title: typeof DialogTitle, Desc: typeof DialogDescription, Close: typeof DialogClose) => (
    <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 pb-4 pt-3 sm:pt-5">
      <div className="min-w-0">
        <Title className="h-section line-clamp-2 break-words">{title}</Title>
        {subtitle ? <Desc className="meta mt-1 line-clamp-2">{subtitle}</Desc> : <Desc className="sr-only">{typeof title === "string" ? title : "Sheet"}</Desc>}
      </div>
      <Close asChild>
        <Button variant="ghost" size="icon" aria-label="Close" className="-mr-2 shrink-0"><XIcon className="size-5" /></Button>
      </Close>
    </header>
  );
  if (desktop) {
    return (
      <Dialog open onOpenChange={close}>
        <DialogContent showCloseButton={false} className={cn("flex max-h-[88dvh] flex-col gap-0 overflow-hidden p-0", wide ? "sm:max-w-xl" : "sm:max-w-lg")}>
          {header(DialogTitle, DialogDescription, DialogClose)}
          <div className="scroll-area flex-1">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open onOpenChange={close}>
      <DrawerContent>
        {header(DrawerTitle as typeof DialogTitle, DrawerDescription as typeof DialogDescription, DrawerClose as typeof DialogClose)}
        <div className="scroll-area flex-1 pb-[var(--safe-bottom)]">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// States
// ─────────────────────────────────────────────────────────────────────────────

/** Placeholder shaped like a page — a title and a list of rows — while it loads (shadcn `Skeleton`). */
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5 py-2">
      <span className="sr-only">{label}</span>
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 max-w-[70%]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Card className="divide-etched gap-0 overflow-hidden py-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5" style={{ width: `${70 - i * 8}%` }} />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/**
 * The last value whose data arrived. Pass the view (a URL's search string, a
 * sort) and whether its data is in; while a change is loading this still
 * returns the old view, so Cancel can go back to it.
 */
export function useSettled<T>(value: T, settled: boolean): T {
  const last = useRef(value);
  if (settled) last.current = value;
  return last.current;
}

/**
 * Content being replaced because a control changed (a sort, a filter, a
 * page): the old result stays, dimmed, under a flat card bar saying what's
 * happening. The bar shows after 150 ms, so fast answers don't flicker, and
 * offers Cancel after a second. Cancel should abort the request and put the
 * control back (`useSettled`). Never leave a control looking like it did
 * nothing.
 */
export function Pending({ pending, label = "Loading…", onCancel, children, className }: {
  pending: boolean;
  label?: string;
  onCancel?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    if (!pending) { setStage(0); return; }
    const a = setTimeout(() => setStage(1), 150);
    const b = setTimeout(() => setStage(2), 1000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [pending]);
  const shown = pending && stage > 0;
  return (
    <div aria-busy={pending} className={cn("relative", className)}>
      {shown && (
        <div className="pointer-events-none sticky top-3 z-10 -mb-14 flex h-14 justify-center">
          <div role="status" className="border border-border bg-card pointer-events-auto flex h-11 items-center gap-3 rounded-control pl-4 pr-1.5 text-sm font-semibold">
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => <span key={i} className="dot-primary h-2 w-2 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
            </span>
            <span>{label}</span>
            {onCancel && stage === 2
              ? <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
              : <span className="w-1.5" />}
          </div>
        </div>
      )}
      <div className={cn("transition-opacity duration-150", shown && "pointer-events-none opacity-40")}>{children}</div>
    </div>
  );
}

/** Nothing here yet, or something went wrong: shadcn `Empty` on a card, the motif above the title. */
export function EmptyState({ title, body, action, tone = "muted", fill = false }: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  tone?: "muted" | "error";
  /** Take the rest of the page's height (inside a `Page`), centred. */
  fill?: boolean;
}) {
  return (
    <Empty className={cn("rounded-xl border border-solid border-border bg-card px-6 py-14", fill && "flex-1")}>
      <EmptyHeader>
        <EmptyMedia><ThemeDots size={12} /></EmptyMedia>
        <EmptyTitle className={cn("text-lg font-semibold", tone === "error" ? "text-highlight" : "text-foreground")}>{title}</EmptyTitle>
        {body && <EmptyDescription className="max-w-sm">{body}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent className="flex-row justify-center">{action}</EmptyContent>}
    </Empty>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View switch — two or three views of one page as links (List | Map)
// ─────────────────────────────────────────────────────────────────────────────

export function ViewSwitch({ options, current, floating = false }: {
  options: { to: string; label: string }[];
  /** The `to` of the view showing now. */
  current: string;
  /** Solid, for sitting over a map or image. */
  floating?: boolean;
}) {
  return (
    <div className={cn(
      "flex h-control rounded-xl p-0.5",
      floating ? "border border-border bg-background" : "border border-border bg-card",
    )}>
      {options.map((o) => (
        <Link key={o.to} to={o.to} replace aria-current={o.to === current ? "page" : undefined}
          className={cn(
            "flex h-full items-center rounded-lg px-4 text-sm font-semibold transition-colors",
            o.to === current ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}
