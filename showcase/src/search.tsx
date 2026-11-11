/**
 * The showcase's search providers for the ⌘K palette: jimbo-ui's own looks and
 * backdrops, searched with a little made-up delay so loading, debouncing and
 * cancelling show. Facets: set, tone, colours (looks) and group (backdrops).
 * An app's providers would call its API instead.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeDots, ThemeScope } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/feedback";
import type { Facet, SearchProvider, SpotlightItem, SpotlightQuery, Suggestion } from "@/components/ui/overlays";
import { BACKDROP_GROUPS, BACKDROPS, PAGE_TONES, type BackdropPattern } from "@/lib/theme";
import { ALL_FAMILIES, FAMILY_SETS, familyLook, familyTones, type TemplateFamily } from "@/lib/themes";
import { useBrand } from "@/lib/useBrand";

/** Resolves after `ms`, or rejects as soon as the search is cancelled. */
const wait = (ms: number, signal: AbortSignal) => new Promise<void>((done, fail) => {
  const t = setTimeout(done, ms);
  signal.addEventListener("abort", () => { clearTimeout(t); fail(new DOMException("Aborted", "AbortError")); });
});

const SET_OF = new Map<string, string>();
for (const s of FAMILY_SETS) for (const g of s.groups) for (const f of g.families) if (!SET_OF.has(f.key)) SET_OF.set(f.key, s.label);
const FAMILIES = new Map(ALL_FAMILIES.map((f) => [f.key, f]));

/** A look's colours as a row of flat circles, for its thumbnail. */
function swatch(f: TemplateFamily): string {
  const look = familyLook(f, "dark").template.theme;
  const cs = f.colours.slice(0, 3);
  const circles = cs.map((c, i) => `<circle cx="${20 + (i - (cs.length - 1) / 2) * 11}" cy="20" r="5" fill="${c}"/>`).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${look.background}"/>${circles}</svg>`)}`;
}

/** Every word in the name or the other words; filters it doesn't know mean no results. */
const matches = (hay: string, text: string) => text.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
function inRange(n: number, value: string): boolean {
  const [lo, hi] = value.split("-").map(Number);
  return hi === undefined ? n === lo : n >= (lo ?? 0) && n <= (Number.isNaN(hi) ? Infinity : hi);
}

export const FACETS: Facet[] = [
  { key: "set", label: "Category", values: FAMILY_SETS.map((s) => s.label) },
  { key: "tone", label: "Page tone", values: [...PAGE_TONES] },
  { key: "colours", label: "Colours", values: ["2", "3", "4", "2-3"], hint: "2-4" },
  { key: "group", label: "Backdrop group", values: [...BACKDROP_GROUPS] },
];

export const SUGGESTIONS: Suggestion[] = [
  { id: "light-holidays", title: "Light holiday looks", subtitle: "set:Holidays tone:light", query: "set:Holidays tone:light" },
  { id: "two-colours", title: "Looks with two colours", subtitle: "colours:2", query: "colours:2" },
  { id: "geo", title: "Geometric backdrops", subtitle: "group:Geo", query: "group:Geo" },
];

function LookPreview({ f }: { f: TemplateFamily }) {
  const { template } = familyLook(f, "dark");
  const theme = { ...template.theme, ...template.style };
  return (
    <ThemeScope theme={theme} className="flex h-full flex-col gap-4 p-5">
      <div>
        <p className="eyebrow">{SET_OF.get(f.key)}</p>
        <h3 className="h-section mt-1">{f.name}</h3>
        <p className="meta mt-1">{f.vibe}</p>
      </div>
      <ThemeDots size={12} />
      <div className="rounded-xl border border-border bg-card space-y-2 p-4">
        <p className="text-15 font-semibold text-foreground">A rounded-xl border border-border bg-card in this look</p>
        <p className="text-sm text-muted-foreground">Comes in {familyTones(f).join(", ")}.</p>
      </div>
      <Button size="sm" className="self-start" tabIndex={-1}>Primary</Button>
    </ThemeScope>
  );
}

function BackdropPreview({ pattern, label, hint }: { pattern: BackdropPattern; label: string; hint: string }) {
  const { theme } = useBrand();
  return (
    <ThemeScope theme={{ ...theme, backdrop: { ...theme.backdrop, pattern } }} className="flex h-full flex-col justify-end p-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-15 font-semibold text-foreground">{label}</p>
        <p className="meta mt-1">{hint}</p>
      </div>
    </ThemeScope>
  );
}

/** The providers, facets and suggestions the showcase's palette searches with. */
export function useShowcaseSearch() {
  const navigate = useNavigate();
  return useMemo(() => {
    const looks: SearchProvider<SpotlightItem & { data: string }> = {
      id: "looks",
      label: "Looks",
      async search(q: SpotlightQuery, signal) {
        await wait(260, signal);
        if (q.filters.some((f) => !["set", "tone", "colours"].includes(f.key))) return [];
        return ALL_FAMILIES.filter((f) => matches(`${f.name} ${f.vibe} ${SET_OF.get(f.key)}`.toLowerCase(), q.text) && q.filters.every((x) =>
          x.key === "set" ? SET_OF.get(f.key)?.toLowerCase() === x.value.toLowerCase()
            : x.key === "tone" ? familyTones(f).includes(x.value.toLowerCase() as never)
              : inRange(f.colours.length + 1, x.value)))
          .map((f) => ({ id: f.key, title: f.name, subtitle: f.vibe, meta: SET_OF.get(f.key), image: swatch(f), data: f.key }));
      },
      pick: (item) => { navigate("/jimbo-ui?tab=theme"); toast(`${item.title} is under Looks`); },
      preview: (item) => { const f = FAMILIES.get(item.data); return f ? <LookPreview f={f} /> : null; },
      more: (q) => { navigate("/jimbo-ui?tab=theme"); toast(`All looks for “${q.text || "your filters"}”`); },
    };
    const backdrops: SearchProvider<SpotlightItem & { data: BackdropPattern }> = {
      id: "backdrops",
      label: "Backdrops",
      async search(q, signal) {
        await wait(160, signal);
        if (q.filters.some((f) => f.key !== "group")) return [];
        return BACKDROPS.filter((b) => b.key !== "none" && matches(`${b.label} ${b.hint} ${b.group ?? ""}`.toLowerCase(), q.text)
          && q.filters.every((x) => b.group?.toLowerCase() === x.value.toLowerCase()))
          .map((b) => ({ id: b.key, title: b.label, subtitle: b.hint, meta: b.group ?? undefined, image: null, data: b.key }));
      },
      pick: () => navigate("/jimbo-ui?tab=backdrop"),
      preview: (item) => { const b = BACKDROPS.find((x) => x.key === item.data); return b ? <BackdropPreview pattern={b.key} label={b.label} hint={b.hint} /> : null; },
    };
    return { providers: [looks, backdrops], facets: FACETS, suggestions: SUGGESTIONS };
  }, [navigate]);
}
