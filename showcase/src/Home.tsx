/**
 * The showcase's front page: a hero with a carousel of looks. Each slide
 * shows a different piece of the kit in a different theme, font and
 * backdrop — all inside ThemeScope, so the rest of the page keeps its own.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Badge, EventRow, HeroSection, LinkCard, List, StatGrid, StatTile, ThemeDots, ThemeScope, Tabs,
} from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/HeaderTitle";
import { MapView } from "@/components/MapView";
import { api } from "@/lib/api";
import { BACKDROPS, FONTS, type PageTone, type Theme } from "@/lib/theme";
import { ALL_FAMILIES, familyLook } from "@/lib/themes";
import { cn } from "@/lib/cn";

type Slide = { template: string; tone: PageTone; headings: string; body: string; backdrop: string; base: "solid" | "gradient" | "glow"; show: string; Render: (p: { theme: Theme }) => ReactNode };

const PINS = [
  { id: "a", label: "North", lat: 43.67, lng: -79.39 }, { id: "b", label: "Harbour", lat: 43.64, lng: -79.38 },
  { id: "c", label: "West", lat: 43.65, lng: -79.42 }, { id: "d", label: "East", lat: 43.66, lng: -79.35 },
];

function Stats() {
  return (
    <StatGrid>
      <StatTile label="Done" value={128} accent="accent" />
      <StatTile label="People" value={342} accent="support" />
      <StatTile label="Places" value={27} accent="highlight" />
      <StatTile label="This year" value={41} />
    </StatGrid>
  );
}

function Rows() {
  return (
    <List>
      <EventRow to="/archetypes/catalogue/entries/1" date="2026-11-14" title="Winter planning day" subtitle="Main hall" status={{ tone: "yellow", label: "Going" }} />
      <EventRow to="/archetypes/catalogue/entries/2" date="2026-10-19" title="Design review" subtitle="Studio B" status={{ tone: "accent", label: "Done" }} />
    </List>
  );
}

function Controls() {
  const [tab, setTab] = useState<"list" | "grid">("list");
  return (
    <div className="card space-y-4 p-5">
      <Tabs value={tab} onChange={setTab} options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />
      <div className="flex flex-wrap gap-2">
        <Badge tone="accent">Done</Badge><Badge tone="yellow">Going</Badge><Badge tone="purple">Maybe</Badge><Badge tone="red">Missed</Badge>
      </div>
      <div className="flex flex-wrap gap-2"><Button size="sm">Save</Button><Button size="sm" variant="secondary">Share</Button><Button size="sm" variant="ghost">Undo</Button></div>
    </div>
  );
}

function Brand() {
  return (
    <div className="card space-y-4 p-6">
      <HeaderTitle size="lg" />
      <p className="font-display text-2xl leading-tight">The name is the brand.</p>
      <ThemeDots size={16} />
    </div>
  );
}

function Form() {
  return (
    <div className="card space-y-3 p-5">
      <p className="font-display text-xl">Add an entry</p>
      <label className="label" htmlFor="slide-title">Title</label>
      <input id="slide-title" className="field h-12 w-full" defaultValue="Saturday swim" readOnly />
      <Button className="w-full">Add entry</Button>
    </div>
  );
}

function MapSlide({ theme }: { theme: Theme }) {
  return <MapView pins={PINS} selected="b" size="full" theme={theme} />;
}

const SLIDES: Slide[] = [
  { template: "Pilot", tone: "dark", headings: "archivo", body: "inter", backdrop: "ripples", base: "glow", show: "Headline numbers", Render: Stats },
  { template: "Breath of the Wild", tone: "dark", headings: "marcellus", body: "manrope", backdrop: "hexagons", base: "gradient", show: "Dated lists", Render: Rows },
  { template: "Halloween", tone: "dark", headings: "old-english", body: "space-grotesk", backdrop: "burst", base: "glow", show: "Tabs, badges, buttons", Render: Controls },
  { template: "Gig poster", tone: "light", headings: "bungee", body: "dm-sans", backdrop: "halftone", base: "solid", show: "The name as the brand", Render: Brand },
  { template: "The Wind Waker", tone: "mid", headings: "playfair", body: "manrope", backdrop: "stripes", base: "gradient", show: "Forms and fields", Render: Form },
  { template: "Sage", tone: "mid", headings: "space-mono", body: "ibm-plex-mono", backdrop: "contours", base: "solid", show: "Maps in the theme", Render: MapSlide },
  { template: "Majora's Mask", tone: "light", headings: "oswald", body: "inter", backdrop: "deco", base: "gradient", show: "Dated lists, light", Render: Rows },
  { template: "Dusk", tone: "dark", headings: "fraunces", body: "eb-garamond", backdrop: "grain", base: "glow", show: "Headline numbers, serif", Render: Stats },
  { template: "Canada", tone: "light", headings: "dm-serif", body: "source-serif", backdrop: "paper", base: "solid", show: "Tabs, badges, buttons", Render: Controls },
];

const themeOf = (s: Slide): Theme => {
  const f = ALL_FAMILIES.find((x) => x.name === s.template) ?? ALL_FAMILIES[0]!;
  return { ...familyLook(f, s.tone).template.theme, fonts: { headings: s.headings, body: s.body }, backdrop: { pattern: s.backdrop as never, base: s.base } };
};

function LookCarousel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [applied, setApplied] = useState(false);
  const qc = useQueryClient();
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 3600);
    return () => clearInterval(t);
  }, [playing]);
  const s = SLIDES[i]!;
  const theme = themeOf(s);
  const useIt = async () => {
    await api.setTheme(theme);
    await qc.invalidateQueries({ queryKey: ["brand"] });
    setApplied(true);
    setPlaying(false);
  };

  return (
    <div className="space-y-3">
      <ThemeScope theme={theme} className="overflow-hidden rounded-2xl border border-border p-4 transition-colors duration-500 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl leading-none text-text-base">{s.template} <span className="font-body text-sm font-semibold capitalize text-text-subtle">{s.tone}</span></p>
          <p className="truncate text-xs text-text-subtle">{s.show}</p>
        </div>
        <div key={i} className="animate-[fadein_.5s_ease]"><s.Render theme={theme} /></div>
        <p className="mt-4 text-xs text-text-muted">
          {FONTS[s.headings]?.label ?? s.headings} headings · {FONTS[s.body]?.label ?? s.body} body · {BACKDROPS.find((b) => b.key === s.backdrop)?.label ?? s.backdrop} on {s.base}
        </p>
      </ThemeScope>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" role="tablist" aria-label="Looks">
          {SLIDES.map((x, n) => (
            <button key={x.template + n} type="button" role="tab" aria-selected={n === i} aria-label={x.template}
              onClick={() => { setI(n); setPlaying(false); setApplied(false); }}
              className="flex h-11 w-6 items-center justify-center">
              <span className={cn("h-2 w-2 rounded-full", n === i ? "bg-accent" : "bg-surface-2")} />
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</Button>
        <Button size="sm" variant="secondary" onClick={() => void useIt()}>{applied ? "Using it — undo in config" : "Use this look"}</Button>
      </div>
    </div>
  );
}

export function HomeDemo() {
  return (
    <div className="space-y-8">
      <HeroSection eyebrow={`jimbo.ui ${__JIMBO_VERSION__} · showcase`} title="One kit, any look" pattern="ripples"
        actions={<>
          <Link to="/components" className="btn btn-primary">See every component</Link>
          <Link to="/jimbo-ui" className="btn btn-secondary">Make a look</Link>
        </>}>
        The same components in {ALL_FAMILIES.length} looks — each light, mid or dark — {Object.keys(FONTS).length} typefaces and {BACKDROPS.length - 1} backdrops. Every slide below is
        the real code; tap <em>Use this look</em> to wear it across the showcase.
      </HeroSection>

      <LookCarousel />

      <section className="space-y-3">
        <h2 className="h-section px-0.5">Start an app from an archetype</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkCard to="/archetypes/catalogue" eyebrow="Archetype" title="Catalogue" sub="Entries, people, places, numbers — with a map" accent />
          <LinkCard to="/archetypes/dashboard" eyebrow="Archetype" title="Single-page dashboard" sub="Is everything fine? Jobs, runs, settings" />
        </div>
      </section>
    </div>
  );
}
