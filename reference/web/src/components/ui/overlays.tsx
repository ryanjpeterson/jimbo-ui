/**
 * Overlays that float by something on the page: Menu (a list of actions),
 * Popover (a small panel of controls), Tooltip (a label for an icon button)
 * and CommandPalette (⌘K: Spotlight for the app — search everything, go
 * anywhere, run an action).
 *
 * Built on jimbo.ui's shadcn primitives (components/ui: dropdown-menu,
 * popover, tooltip, dialog): Radix places each one against the thing that
 * opened it, keeps it on screen, closes it on Escape or a press outside and
 * gives focus back. For a choice or a short flow, use a Sheet instead.
 *
 * jimbo-ui reference: copy into an app as is (rule J3: no restyling).
 */

import {
  forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState,
  type ButtonHTMLAttributes, type KeyboardEvent as ReactKeyboardEvent, type ReactElement, type ReactNode,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckIcon, ChevronDownIcon, EllipsisIcon, SearchIcon as LucideSearch, XIcon } from "lucide-react";
import { BRAND } from "@/lib/brand.config";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover as PopoverRoot, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip as TooltipRoot, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * What a trigger gets. Radix puts the ref, the click and the aria state on
 * the element a `trigger` returns, so spread these on it (they may be empty)
 * and make sure it forwards its ref — `Button`, `DropdownButton`,
 * `MoreButton` and `TopBarButton` all do.
 */
export type TriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The kit's "more" button (⋯): a 44 px ghost icon button. For a row's own actions. */
export const MoreButton = forwardRef<HTMLButtonElement, TriggerProps & { label?: string }>(({ label = "More", ...props }, ref) => (
  <Button ref={ref} type="button" variant="ghost" size="icon" aria-label={label} {...props}>
    <EllipsisIcon className="size-5" />
  </Button>
));
MoreButton.displayName = "MoreButton";

/**
 * The trigger for anything that opens a list of choices — a sort, a filter,
 * "more ways to do this…" — drawn as a dropdown, not a button (K5): the
 * field's surface and border, its text, and a down arrow that turns while
 * it's open. One control high (`h-control`, or `h-control-sm` with
 * `size="sm"`), so it sits level in a `.controls` row. A ⋯ `MoreButton`
 * stays only for a row's own actions.
 */
export const DropdownButton = forwardRef<HTMLButtonElement, TriggerProps & {
  children: ReactNode;
  /** Muted text before the value: "Sort" in "Sort: Newest". */
  label?: ReactNode;
  size?: "sm" | "md";
}>(({ children, label, size = "md", className, ...props }, ref) => (
  <button ref={ref} type="button" data-slot="select-trigger" {...props}
    className={cn(
      "group inline-flex max-w-full shrink-0 items-center gap-2 rounded-lg border border-input bg-muted text-left font-semibold text-foreground transition-colors outline-none hover:border-subtle-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:border-ring data-[state=open]:border-ring",
      size === "sm" ? "h-control-sm px-3 text-sm" : "h-control pl-4 pr-3 text-15",
      className,
    )}>
    {label && <span className="shrink-0 font-medium text-muted-foreground">{label}</span>}
    <span className="min-w-0 truncate">{children}</span>
    <ChevronDownIcon aria-hidden="true" className="ml-auto size-4.5 shrink-0 text-subtle-foreground transition-transform group-data-[state=open]:rotate-180" />
  </button>
));
DropdownButton.displayName = "DropdownButton";

// ─────────────────────────────────────────────────────────────────────────────
// Menu — a short list of actions on one thing
// ─────────────────────────────────────────────────────────────────────────────

export type MenuItem =
  | { label: string; onSelect: () => void; hint?: ReactNode; icon?: ReactNode; danger?: boolean; disabled?: boolean;
      /** The one you're on (a JumpMenu's current page): primary text and a tick. */
      current?: boolean }
  | { heading: string }
  | "divider";

/**
 * A list of actions on one thing (a row's Edit / Duplicate / Delete), opened
 * from a button — the ⋯ `MoreButton` unless `trigger` draws another. Arrow
 * keys move, Home and End jump, a letter goes to the next item starting with
 * it, Enter picks (shadcn `DropdownMenu`). `danger` items are in the
 * highlight colour and go last, after a divider; confirm them with
 * `ConfirmSheet`.
 */
export function Menu({ items, label = "More", trigger, align = "end" }: {
  items: MenuItem[];
  /** Names the button for screen readers. */
  label?: string;
  trigger?: (props: TriggerProps) => ReactNode;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {(trigger ? trigger({}) : <MoreButton label={label} />) as ReactElement}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} aria-label={label}
        className="scroll-area max-h-[min(30rem,70dvh)] min-w-[12rem] max-w-[calc(100vw-16px)]">
        {items.map((item, i) => item === "divider"
          ? <DropdownMenuSeparator key={i} />
          : "heading" in item
          ? <DropdownMenuLabel key={i} className="eyebrow px-2.5 pt-3 pb-1 text-support">{item.heading}</DropdownMenuLabel>
          : (
            <DropdownMenuItem key={i} disabled={item.disabled} onSelect={item.onSelect}
              variant={item.danger ? "destructive" : "default"}
              aria-current={item.current ? "page" : undefined}
              className={cn("min-h-11 gap-3 px-2.5 text-15 font-semibold", item.danger ? "text-highlight" : item.current && "text-primary")}>
              {item.icon && <span aria-hidden="true" className="flex w-5 shrink-0 justify-center text-subtle-foreground">{item.icon}</span>}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.hint && <span className="shrink-0 text-xs font-medium text-subtle-foreground">{item.hint}</span>}
              {item.current && <CheckIcon aria-hidden="true" className="shrink-0" />}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JumpMenu — one tap to any page in a series, or to every page of a kind
// ─────────────────────────────────────────────────────────────────────────────

export type JumpItem = { label: string; to: string; hint?: ReactNode; current?: boolean } | { heading: string } | "divider";

/**
 * Pages in a series (years, months, seasons, chapters) and every page of a
 * kind are one tap away (rulebook N7): a `Menu` of links. By default its
 * trigger is a `DropdownButton` showing where you are ("Year: 2019"); pass
 * `trigger` for a top-bar ☰ (a `TopBarButton` spread with the props) that
 * lists every page. `{ heading }` items group a long list; the menu scrolls.
 */
export function JumpMenu({ items, label, value, trigger, align = "start", size }: {
  items: JumpItem[];
  /** What the pages are ("Year", "Pages"): the button's muted label and the menu's name. */
  label: string;
  /** Where you are now, shown on the button. */
  value?: ReactNode;
  trigger?: (props: TriggerProps) => ReactNode;
  align?: "start" | "end";
  size?: "sm" | "md";
}) {
  const navigate = useNavigate();
  return (
    <Menu label={label} align={align}
      items={items.map((it) => (it === "divider" || "heading" in it ? it
        : { label: it.label, hint: it.hint, current: it.current, onSelect: () => navigate(it.to) }))}
      trigger={trigger ?? ((p) => <DropdownButton {...p} label={label} size={size}>{value ?? "Pick one"}</DropdownButton>)} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Popover — a small panel of controls by its button
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A small panel by its button — a few filters, a quick setting, a short
 * explanation — that stays open while you use it and closes on a press
 * outside or Escape. More than a few controls, or anything that saves, is a
 * Sheet. `trigger` draws the button (spread the props it's given).
 */
export function Popover({ label, trigger, children, align = "start", className }: {
  /** Names the panel for screen readers. */
  label: string;
  trigger: (props: TriggerProps) => ReactNode;
  /** The panel's content, or a function of `close` for content with a Done button. */
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end" | "center";
  /** Layout only (a width); J3. */
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger({}) as ReactElement}</PopoverTrigger>
      <PopoverContent align={align} aria-label={label} className={cn("max-w-[calc(100vw-16px)]", className)}>
        {typeof children === "function" ? children(close) : children}
      </PopoverContent>
    </PopoverRoot>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip — a short label for an icon button, on hover or keyboard focus
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A short label for an icon-only control, shown after a moment's hover or on
 * keyboard focus. Never the only place something is said (A3): the control
 * has its own `aria-label`, and touch screens don't show tooltips at all.
 * Wraps one element that forwards its ref.
 */
export function Tooltip({ text, children }: { text: string; children: ReactElement }) {
  return (
    <TooltipProvider delayDuration={450}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-60 text-xs font-semibold">{text}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CommandPalette — ⌘K search: Spotlight for the app
// ─────────────────────────────────────────────────────────────────────────────

export type Command = {
  id: string;
  label: string;
  /** Heading it's listed under ("Go to", "Actions"). */
  group?: string;
  /** Other words it should match ("theme" for "Change the look"). */
  keywords?: string[];
  /** Shown on the right: a shortcut or where it goes. */
  hint?: ReactNode;
  run: () => void;
};

/** One `facet:value` token from the query (`size:2-4` → `{ key: "size", value: "2-4" }`). */
export type SpotlightFilter = { key: string; value: string };
/** What providers search with: the free text, and the filters parsed out of it. */
export type SpotlightQuery = { text: string; filters: SpotlightFilter[] };

/** One result. Plain data (no functions), so it can be kept with recent picks. */
export type SpotlightItem = {
  id: string;
  title: string;
  subtitle?: string;
  /** Short and on the right: a count, a year, a duration. */
  meta?: string;
  /** A 40 px thumbnail: an image URL, or `null` for the theme's motif in its place. Leave it out for no thumbnail. */
  image?: string | null;
  /** A round thumbnail (people). */
  round?: boolean;
  /** Anything else `pick` and `preview` need. Kept with recent picks, so plain JSON. */
  data?: unknown;
};

/** A source of results, listed under its `label`. Results are debounced, and a newer query aborts `signal`. */
export type SearchProvider<T extends SpotlightItem = SpotlightItem> = {
  id: string;
  label: string;
  /** Results for the query, best first. Return nothing for a filter it doesn't know. */
  search: (query: SpotlightQuery, signal: AbortSignal) => T[] | Promise<T[]>;
  /** Open it: usually navigate to its page. The palette has closed by then. */
  pick: (item: T) => void;
  /** The preview pane for the highlighted result (wide screens). */
  preview?: (item: T) => ReactNode;
  /** "See all": the full results page for this query (put the query in its URL). */
  more?: (query: SpotlightQuery) => void;
  /** Rows shown (5). */
  limit?: number;
  /** Wait after typing, in ms (120). */
  debounce?: number;
};

/** A filter the query understands as `key:value`. `values` are offered as you type; `hint` shows the form ("2-4"). */
export type Facet = { key: string; label: string; values?: string[]; hint?: string };

/** A search to try, shown while the query is empty: picking it fills the query. */
export type Suggestion = { id: string; title: string; subtitle?: string; query: string };

type Token = { raw: string; facet?: Facet; value?: string };

function tokenize(raw: string, facets: Facet[]): Token[] {
  const out: Token[] = [];
  for (const m of raw.matchAll(/([A-Za-z][\w-]*):(?:"([^"]*)"?|(\S*))|\S+/g)) {
    const facet = m[1] ? facets.find((f) => f.key.toLowerCase() === m[1]!.toLowerCase()) : undefined;
    out.push(facet ? { raw: m[0], facet, value: m[2] ?? m[3] ?? "" } : { raw: m[0] });
  }
  return out;
}

const formatFilter = (f: SpotlightFilter) => `${f.key}:${/\s/.test(f.value) ? `"${f.value}"` : f.value}`;

/** Splits a query into the app's facet filters and free text. `10:30` or an unknown `x:y` stays text. */
export function parseQuery(raw: string, facets: Facet[] = []): SpotlightQuery {
  const filters: SpotlightFilter[] = [];
  const words: string[] = [];
  for (const t of tokenize(raw, facets)) {
    if (!t.facet) words.push(t.raw);
    else if (t.value) filters.push({ key: t.facet.key, value: t.value });
  }
  return { text: words.join(" "), filters };
}

/** A query written back as text: filters first, then the words (for a results page's URL). */
export function formatQuery(q: SpotlightQuery): string {
  return [...q.filters.map(formatFilter), q.text].filter(Boolean).join(" ");
}

/** Chips (finished filters) and what's left for the field, which keeps the token still being typed. */
function splitQuery(raw: string, facets: Facet[]): { chips: SpotlightFilter[]; text: string } {
  const ts = tokenize(raw, facets);
  const typing = raw.length > 0 && !/\s$/.test(raw);
  const chips: SpotlightFilter[] = [];
  const rest: string[] = [];
  ts.forEach((t, i) => {
    if (t.facet && t.value && !(typing && i === ts.length - 1)) chips.push({ key: t.facet.key, value: t.value });
    else rest.push(t.raw);
  });
  return { chips, text: rest.join(" ") + (rest.length && !typing ? " " : "") };
}

const joinQuery = (chips: SpotlightFilter[], text: string) => chips.map((c) => `${formatFilter(c)} `).join("") + text.trimStart();

/** Toggles on ⌘K or Ctrl+K, from anywhere. */
function useShortcut(toggle: () => void) {
  const latest = useRef(toggle);
  latest.current = toggle;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); latest.current(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}

/** Opens the palette on ⌘K or Ctrl+K, from anywhere. `[open, setOpen]`. Use `useSpotlight` to keep it in the URL. */
export function useCommandPalette(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);
  useShortcut(() => setOpen((o) => !o));
  return [open, setOpen];
}

/**
 * The palette's open state and query in the URL (`?find=size:2 blue`), so
 * a refresh or a shared link reopens the same search; ⌘K / Ctrl+K toggles it.
 * Spread `bind` into `CommandPalette`.
 */
export function useSpotlight(param = "find") {
  const [params, setParams] = useSearchParams();
  const write = useCallback((change: (p: URLSearchParams) => void) => setParams((p) => {
    const next = new URLSearchParams(p);
    change(next);
    return next;
  }, { replace: true }), [setParams]);
  const setOpen = useCallback((open: boolean) => write((p) => {
    if (!open) p.delete(param);
    else if (!p.has(param)) p.set(param, "");
  }), [write, param]);
  const setQuery = useCallback((q: string) => write((p) => p.set(param, q)), [write, param]);
  useShortcut(() => write((p) => { if (p.has(param)) p.delete(param); else p.set(param, ""); }));
  const open = params.has(param);
  const query = params.get(param) ?? "";
  return { open, setOpen, query, setQuery, bind: { open, onClose: () => setOpen(false), query, onQueryChange: setQuery } };
}

const MOD = typeof navigator !== "undefined" && /Mac|iP(hone|ad|od)/.test(navigator.platform) ? "⌘" : "Ctrl ";

/** The magnifier, 18 px: for a top-bar search button (`TopBarButton`) that opens the palette on phones. */
export function SearchIcon({ size = 18 }: { size?: number }) {
  return <LucideSearch aria-hidden="true" className="shrink-0" style={{ width: size, height: size }} strokeWidth={2.25} />;
}

/** Looks like a search field and opens the palette: the search bar at the top of an explore or library page. */
export function SearchTrigger({ onClick, label = "Search", className }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("flex h-control w-full items-center gap-3 rounded-lg border border-input bg-muted px-4 text-left text-15 text-subtle-foreground transition-colors outline-none hover:border-subtle-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}>
      <SearchIcon />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-11 sm:block">{MOD}K</kbd>
    </button>
  );
}

function Thumb({ image, round }: { image: string | null; round?: boolean }) {
  return (
    // With no picture, the motif alone — never a circle in a box (S4).
    image ? (
      <span className={cn("flex h-10 w-10 shrink-0 overflow-hidden", round ? "rounded-full" : "rounded-lg")}>
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </span>
    ) : <span className="flex h-10 w-10 shrink-0 items-center justify-center"><span className="motif-support h-4 w-4" /></span>
  );
}

type Row = {
  key: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  image?: string | null;
  round?: boolean;
  preview?: () => ReactNode;
  /** Picking it changes the query and the palette stays open. */
  keep?: boolean;
  /** Kept as a recent pick. */
  recent?: Recent;
  pick: () => void;
};
type Group = { key: string; label: string; rows: Row[]; loading?: boolean; error?: boolean; action?: { label: string; run: () => void } };
type Recent = { p: string; item: SpotlightItem };
type Found = { status: "loading" | "done" | "error"; items: SpotlightItem[] };

const RECENT_MAX = 6;
const readRecents = (key: string): Recent[] => {
  try { return (JSON.parse(localStorage.getItem(key) ?? "[]") as Recent[]).filter((r) => r?.p && r.item?.id); } catch { return []; }
};

const commandWords = (c: Command) => [c.label, c.group ?? "", ...(c.keywords ?? [])].join(" ").toLowerCase();

/**
 * Spotlight for the app: one search field over everything. Results come live
 * from the app's `providers` (debounced, cancelled when the query moves on),
 * grouped under each one's label, with thumbnails and a preview pane for the
 * highlighted result on wide screens. `facets` turn `key:value` tokens into
 * removable chips and offer their values as you type; providers get the text
 * and the filters apart. With an empty query it shows recent picks (kept under
 * the app's storage prefix), `suggestions` and the facets. `commands` (go to a
 * page, run an action) are matched by name and listed after the results.
 *
 * Arrow keys move, Tab jumps to the next group, Enter opens, Escape closes,
 * Backspace in an empty field takes off the last chip. Open it with
 * `useSpotlight` (in the URL) or `useCommandPalette`, and a top-bar search
 * button on phones, where there's no ⌘K.
 */
export function CommandPalette({
  open, onClose, commands = [], providers = [], facets = [], suggestions = [], query, onQueryChange,
  recentKey = "spotlight.recent", placeholder,
}: {
  open: boolean;
  onClose: () => void;
  commands?: Command[];
  // Each provider's own item type; the palette only passes its items back to it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers?: SearchProvider<any>[];
  facets?: Facet[];
  suggestions?: Suggestion[];
  /** The query as text, to hold it in the URL (`useSpotlight`); leave out to keep it here. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Where recent picks are kept, after the storage prefix; `null` keeps none. */
  recentKey?: string | null;
  placeholder?: string;
}) {
  const [own, setOwn] = useState("");
  const raw = query ?? own;
  const setRaw = (v: string) => { if (query === undefined) setOwn(v); onQueryChange?.(v); };
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [found, setFound] = useState<Record<string, Found>>({});
  const storeKey = recentKey === null ? null : `${BRAND.storagePrefix}.${recentKey}`;
  const [recents, setRecents] = useState<Recent[]>([]);
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const live = useRef({ providers, raw, setRaw });
  live.current = { providers, raw, setRaw };

  useEffect(() => {
    if (!open) return;
    // A query from the URL comes back as chips, ready for more words.
    const { raw: r, setRaw: set } = live.current;
    if (query === undefined) set("");
    else if (r.trim() && !/\s$/.test(r)) set(`${r.trim()} `);
    setActiveKey(null);
    setRecents(storeKey ? readRecents(storeKey) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { chips, text } = useMemo(() => splitQuery(raw, facets), [raw, facets]);
  const parsed = useMemo(() => parseQuery(raw, facets), [raw, facets]);
  const empty = !parsed.text && parsed.filters.length === 0;
  const qKey = JSON.stringify(parsed);
  const providerIds = providers.map((p) => p.id).join("\n");

  // Ask each provider after its debounce; a newer query aborts the last one.
  useEffect(() => {
    if (!open) return;
    const q = JSON.parse(qKey) as SpotlightQuery;
    const ps = live.current.providers;
    if (!q.text && !q.filters.length) { setFound({}); return; }
    const ctl = new AbortController();
    setFound((prev) => Object.fromEntries(ps.map((p) => [p.id, { status: "loading", items: prev[p.id]?.items ?? [] }])));
    const timers = ps.map((p) => window.setTimeout(async () => {
      try {
        const items = await p.search(q, ctl.signal);
        if (!ctl.signal.aborted) setFound((f) => ({ ...f, [p.id]: { status: "done", items } }));
      } catch {
        if (!ctl.signal.aborted) setFound((f) => ({ ...f, [p.id]: { status: "error", items: [] } }));
      }
    }, p.debounce ?? 120));
    return () => { ctl.abort(); timers.forEach(clearTimeout); };
  }, [open, qKey, providerIds]);

  const groups = useMemo((): Group[] => {
    const out: Group[] = [];
    const setText = (t: string) => live.current.setRaw(joinQuery(chips, t));
    const itemRow = (p: SearchProvider<SpotlightItem>, item: SpotlightItem, key: string): Row => ({
      key, title: item.title, subtitle: item.subtitle, meta: item.meta, image: item.image, round: item.round,
      preview: p.preview && (() => p.preview!(item)), recent: { p: p.id, item }, pick: () => p.pick(item),
    });
    const cmdRow = (c: Command, key = `c:${c.id}`): Row => ({
      key, title: c.label, meta: c.hint, recent: { p: "command", item: { id: c.id, title: c.label } }, pick: c.run,
    });
    const commandGroups = (match: (c: Command) => boolean) => {
      for (const c of commands.filter(match)) {
        const g = c.group ?? "";
        (out.find((x) => x.key === `cg:${g}`) ?? out[out.push({ key: `cg:${g}`, label: g, rows: [] }) - 1]!).rows.push(cmdRow(c));
      }
    };

    if (empty) {
      const rows = recents.flatMap((r): Row[] => {
        if (r.p === "command") { const c = commands.find((x) => x.id === r.item.id); return c ? [cmdRow(c, `r:command:${c.id}`)] : []; }
        const p = providers.find((x) => x.id === r.p);
        return p ? [itemRow(p, r.item, `r:${p.id}:${r.item.id}`)] : [];
      });
      if (rows.length) out.push({ key: "recent", label: "Recent", rows, action: storeKey ? { label: "Clear", run: () => { try { localStorage.removeItem(storeKey); } catch { /* fine */ } setRecents([]); } } : undefined });
      if (suggestions.length) out.push({ key: "suggest", label: "Try", rows: suggestions.map((s) => ({ key: `s:${s.id}`, title: s.title, subtitle: s.subtitle, keep: true, pick: () => live.current.setRaw(`${s.query.trim()} `) })) });
      if (facets.length) out.push({ key: "facets", label: "Filters", rows: facets.map((f) => ({ key: `f:${f.key}`, title: `${f.key}:`, subtitle: f.label, meta: f.hint, keep: true, pick: () => setText(`${f.key}:`) })) });
      commandGroups(() => true);
      return out;
    }

    // The word being typed: complete a facet's value, or offer facets it could be.
    const typing = /\S$/.test(raw) ? text.split(" ").pop() ?? "" : "";
    const head = text.slice(0, text.length - typing.length);
    const [, key, partial] = /^([A-Za-z][\w-]*):(.*)$/.exec(typing) ?? [];
    const facet = key ? facets.find((f) => f.key.toLowerCase() === key.toLowerCase()) : undefined;
    if (facet?.values?.length) {
      const p = partial!.toLowerCase();
      const values = facet.values.filter((v) => v.toLowerCase().startsWith(p) && v.toLowerCase() !== p).slice(0, 8);
      if (values.length) out.push({ key: "values", label: facet.label, rows: values.map((v) => ({ key: `v:${v}`, title: v, subtitle: `${facet.key}:${v}`, keep: true, pick: () => setText(`${head}${formatFilter({ key: facet.key, value: v })} `) })) });
    }

    for (const p of providers) {
      const f = found[p.id];
      if (!f) continue;
      const limit = p.limit ?? 5;
      const rows = f.items.slice(0, limit).map((item) => itemRow(p, item, `p:${p.id}:${item.id}`));
      if (p.more && f.items.length > limit) rows.push({ key: `m:${p.id}`, title: `See all in ${p.label}`, meta: "→", pick: () => p.more!(parsed) });
      if (rows.length || f.status !== "done") out.push({ key: `p:${p.id}`, label: p.label, rows, loading: f.status === "loading", error: f.status === "error" });
    }

    if (!parsed.filters.length) {
      const words = parsed.text.toLowerCase().split(/\s+/).filter(Boolean);
      commandGroups((c) => words.every((w) => commandWords(c).includes(w)));
    }

    if (typing && !typing.includes(":")) {
      const t = typing.toLowerCase();
      const fs = facets.filter((f) => f.key.toLowerCase().startsWith(t) || f.label.toLowerCase().startsWith(t));
      if (fs.length) out.push({ key: "facets", label: "Filters", rows: fs.map((f) => ({ key: `f:${f.key}`, title: `${f.key}:`, subtitle: f.label, meta: f.hint, keep: true, pick: () => setText(`${head}${f.key}:`) })) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empty, recents, suggestions, facets, commands, providers, found, raw, text, chips, parsed, storeKey]);

  const rows = useMemo(() => groups.flatMap((g) => g.rows), [groups]);
  const at = Math.max(0, rows.findIndex((r) => r.key === activeKey));
  const active = rows[at];
  const busy = groups.some((g) => g.loading);
  const hasPreview = providers.some((p) => p.preview);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${at}"]`)?.scrollIntoView({ block: "nearest" });
  }, [at]);

  const pick = (r?: Row) => {
    if (!r) return;
    if (r.keep) { r.pick(); setActiveKey(null); input.current?.focus(); return; }
    if (r.recent && storeKey) {
      const same = (x: Recent) => x.p === r.recent!.p && x.item.id === r.recent!.item.id;
      const next = [r.recent, ...readRecents(storeKey).filter((x) => !same(x))].slice(0, RECENT_MAX);
      try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* fine */ }
    }
    onClose();
    r.pick();
  };
  const move = (i: number) => setActiveKey(rows[Math.min(Math.max(i, 0), rows.length - 1)]?.key ?? null);
  const jumpGroup = (dir: 1 | -1) => {
    const withRows = groups.filter((g) => g.rows.length);
    if (withRows.length < 2) return;
    const g = withRows.findIndex((x) => x.rows.some((r) => r.key === active?.key));
    const next = withRows[(g + dir + withRows.length) % withRows.length]!;
    setActiveKey(next.rows[0]!.key);
  };
  const removeChip = (i: number) => { setRaw(joinQuery(chips.filter((_, j) => j !== i), text)); setActiveKey(null); input.current?.focus(); };
  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(at - 1); }
    else if (e.key === "Enter") { e.preventDefault(); pick(active); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "Tab") { e.preventDefault(); jumpGroup(e.shiftKey ? -1 : 1); }
    else if (e.key === "Backspace" && !text && chips.length && e.currentTarget.selectionStart === 0) { e.preventDefault(); removeChip(chips.length - 1); }
  };
  const label = (key: string) => facets.find((f) => f.key === key)?.label ?? key;
  const shown = placeholder ?? (providers.length ? "Search" : "Search pages and actions");

  // shadcn Dialog: focus trap, Escape, scroll lock and focus back on close.
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} aria-describedby={undefined}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn("top-[calc(var(--safe-top)+12px)] flex max-h-[min(34rem,calc(100dvh-var(--safe-top)-24px))] w-[calc(100%-1.5rem)] max-w-lg translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[12vh] sm:max-w-lg",
          hasPreview && "md:h-[min(34rem,calc(100dvh-var(--safe-top)-24px))] md:max-w-3xl")}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="shrink-0 border-b border-border">
          <label className="flex items-center gap-3 px-4 text-subtle-foreground">
            <SearchIcon />
            <span className="sr-only">{shown}</span>
            <input ref={input} autoFocus value={text} onKeyDown={onKey}
              onChange={(e) => { setRaw(joinQuery(chips, e.target.value)); setActiveKey(null); }}
              placeholder={chips.length ? "Add words or filters" : shown} role="combobox" aria-expanded="true" aria-controls={id}
              aria-autocomplete="list" aria-activedescendant={active ? `${id}-${at}` : undefined}
              enterKeyHint="go" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              className="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-hidden placeholder:text-subtle-foreground" />
            {busy && <span className="dot-primary h-2.5 w-2.5 shrink-0 animate-pulse" aria-hidden="true" />}
            <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-11 text-subtle-foreground sm:block">esc</kbd>
          </label>
          {chips.length > 0 && (
            <div className="-mt-1 flex flex-wrap gap-2 px-4 pb-3">
              {chips.map((c, i) => (
                <Badge key={`${c.key}:${c.value}:${i}`} variant="secondary" asChild>
                  <button type="button" onClick={() => removeChip(i)} aria-label={`Remove filter ${label(c.key)} ${c.value}`}
                    className="relative min-h-9 px-3 text-sm before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']">
                    <span className="text-subtle-foreground">{label(c.key)}</span>
                    <span className="font-semibold text-foreground">{c.value}</span>
                    <XIcon aria-hidden="true" className="-mr-1 size-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1">
          <div ref={list} id={id} role="listbox" aria-label="Results" className="min-w-0 flex-1 overflow-y-auto overscroll-contain py-1.5 pb-[max(0.375rem,var(--safe-bottom))]">
            {groups.map((g) => (
              <div key={g.key} role="group" aria-labelledby={`${id}-${g.key}`}>
                {(g.label || g.action) && (
                  <div className={cn("flex items-center justify-between gap-3 px-4", g.action ? "min-h-11" : "pb-1 pt-2.5")}>
                    <p id={`${id}-${g.key}`} className="eyebrow">{g.label}</p>
                    {g.loading && g.rows.length > 0 && <span className="meta">Searching…</span>}
                    {g.action && <button type="button" onClick={() => { g.action!.run(); input.current?.focus(); }} className="link-action -mr-2 min-h-11 px-2 text-sm">{g.action.label}</button>}
                  </div>
                )}
                {g.rows.map((r) => {
                  const i = rows.indexOf(r);
                  return (
                    <div key={r.key} id={`${id}-${i}`} data-index={i} role="option" aria-selected={i === at}
                      onPointerMove={() => setActiveKey(r.key)} onClick={() => pick(r)}
                      className={cn("mx-1.5 flex cursor-pointer items-center gap-3 rounded-lg px-2.5", r.subtitle || r.image !== undefined ? "min-h-14 py-2" : "min-h-11",
                        i === at ? "bg-muted" : "")}>
                      {r.image !== undefined && <Thumb image={r.image} round={r.round} />}
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-15 font-semibold", i === at ? "text-foreground" : "text-muted-foreground")}>{r.title}</span>
                        {r.subtitle && <span className="block truncate text-sm text-subtle-foreground">{r.subtitle}</span>}
                      </span>
                      {r.meta && <span className="shrink-0 text-xs font-medium text-subtle-foreground">{r.meta}</span>}
                    </div>
                  );
                })}
                {g.loading && g.rows.length === 0 && (
                  <div aria-hidden="true" className="mx-1.5 flex min-h-14 items-center gap-3 px-2.5">
                    <span className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
                    <span className="flex-1 space-y-2"><span className="block h-3 w-1/2 animate-pulse rounded-sm bg-muted" /><span className="block h-2.5 w-1/3 animate-pulse rounded-sm bg-muted" /></span>
                  </div>
                )}
                {g.error && <p className="px-4 pb-2 text-sm text-muted-foreground">Couldn't search {g.label.toLowerCase()}. Try again in a moment.</p>}
              </div>
            ))}
            {!empty && rows.length === 0 && !busy && (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <span aria-hidden="true" className="inline-flex gap-1">{(["motif-primary", "motif-highlight", "motif-support"] as const).map((m) => <span key={m} className={cn(m, "h-2 w-2")} />)}</span>
                <p className="text-sm text-muted-foreground">Nothing matches “{formatQuery(parsed)}”.{chips.length > 0 && " Try taking off a filter."}</p>
              </div>
            )}
            {empty && rows.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">Type to search.</p>}
          </div>
          {hasPreview && (
            <aside aria-label="Preview" className="hidden w-80 shrink-0 overflow-y-auto overscroll-contain border-l border-border md:block">
              {active?.preview ? active.preview() : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-subtle-foreground">Highlight a result to see it here.</div>
              )}
            </aside>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-4 border-t border-border px-4 py-2 text-11 text-subtle-foreground sm:flex">
          {[["↑↓", "move"], ["↵", "open"], ["tab", "next group"], ["esc", "close"]].map(([k, v]) => (
            <span key={v} className="flex items-center gap-1.5"><kbd className="rounded-md border border-border px-1.5 py-0.5 font-mono">{k}</kbd>{v}</span>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{busy ? "Searching" : empty ? "" : `${rows.length} results`}</p>
      </DialogContent>
    </Dialog>
  );
}
