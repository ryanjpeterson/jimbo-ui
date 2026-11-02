/**
 * The showcase's front page: a hero with looks to step through (Previous /
 * Next), each fading slowly into the next. Each look shows a different piece
 * of the kit in a different theme, font and backdrop — all inside
 * ThemeScope, so the rest of the page keeps its own.
 */

import { useState, type ReactNode } from "react";
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
  { template: "Gig poster", tone: "light", headings: "work-sans", body: "dm-sans", backdrop: "halftone", base: "solid", show: "The name as the brand", Render: Brand },
  { template: "The Wind Waker", tone: "mid", headings: "playfair", body: "manrope", backdrop: "stripes", base: "gradient", show: "Forms and fields", Render: Form },
  { template: "Sage", tone: "mid", headings: "space-mono", body: "ibm-plex-mono", backdrop: "contours", base: "solid", show: "Maps in the theme", Render: MapSlide },
  { template: "Majora's Mask", tone: "light", headings: "libre-baskerville", body: "lora", backdrop: "deco", base: "gradient", show: "Dated lists, light", Render: Rows },
  { template: "Dusk", tone: "dark", headings: "fraunces", body: "eb-garamond", backdrop: "grain", base: "glow", show: "Headline numbers, serif", Render: Stats },
  { template: "Canada", tone: "light", headings: "dm-serif", body: "source-serif", backdrop: "paper", base: "solid", show: "Tabs, badges, buttons", Render: Controls },
];

const themeOf = (s: Slide): Theme => {
  const f = ALL_FAMILIES.find((x) => x.name === s.template) ?? ALL_FAMILIES[0]!;
  return { ...familyLook(f, s.tone).template.theme, fonts: { headings: s.headings, body: s.body }, backdrop: { pattern: s.backdrop as never, base: s.base } };
};

function LookStepper() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const qc = useQueryClient();
  const s = SLIDES[i]!;
  const go = (step: number) => {
    setPrev(i);
    setI((i + step + SLIDES.length) % SLIDES.length);
    setApplied(false);
  };
  const useIt = async () => {
    await api.setTheme(themeOf(s));
    await qc.invalidateQueries({ queryKey: ["brand"] });
    setApplied(true);
  };

  return (
    <div className="space-y-3">
      {/* Every look sits in the same cell, so the box is always the tallest one's height. The new
          look fades in slowly over the one before it; the rest stay hidden underneath. */}
      <div className="grid overflow-hidden rounded-2xl border border-border">
        {SLIDES.map((x, n) => {
          const theme = themeOf(x);
          return (
            <ThemeScope key={n} theme={theme}
              className={cn("p-4 sm:p-6 [grid-area:1/1]",
                n === i ? "z-20 opacity-100 transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none"
                  : n === prev ? "z-10 opacity-100" : "invisible opacity-0")}>
              <div aria-hidden={n !== i}>
                <div className="mb-4 flex h-8 items-baseline justify-between gap-3 overflow-hidden">
                  <p className="font-display text-2xl leading-none text-text-base">{x.template} <span className="font-body text-sm font-semibold capitalize text-text-subtle">{x.tone}</span></p>
                  <p className="truncate text-xs text-text-subtle">{x.show}</p>
                </div>
                <x.Render theme={theme} />
                <p className="mt-4 line-clamp-2 min-h-[2lh] text-xs text-text-muted">
                  {FONTS[x.headings]?.label ?? x.headings} headings · {FONTS[x.body]?.label ?? x.body} body · {BACKDROPS.find((b) => b.key === x.backdrop)?.label ?? x.backdrop} on {x.base}
                </p>
              </div>
            </ThemeScope>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" onClick={() => go(-1)} aria-label="Previous look">← Previous</Button>
        <span className="meta tabular-nums" aria-live="polite">{i + 1} of {SLIDES.length}</span>
        <Button size="sm" variant="secondary" onClick={() => go(1)} aria-label="Next look">Next →</Button>
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => void useIt()}>{applied ? "Using it — undo in config" : "Use this look"}</Button>
      </div>
    </div>
  );
}

export function HomeDemo() {
  return (
    <div className="space-y-8">
      <HeroSection eyebrow={`jimbo.ui ${__JIMBO_VERSION__} · showcase`} title="One kit, any look" pattern="none"
        actions={<>
          <Link to="/components" className="btn btn-primary">See every component</Link>
          <Link to="/jimbo-ui" className="btn btn-secondary">Make a look</Link>
        </>}>
        The same components in {ALL_FAMILIES.length} looks — each light, mid or dark — {Object.keys(FONTS).length} typefaces and {BACKDROPS.length - 1} backdrops. Every look below is
        the real code; tap <em>Use this look</em> to wear it across the showcase.
      </HeroSection>

      <LookStepper />

      <section className="space-y-3">
        <h2 className="h-section px-0.5">Start an app from an archetype</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkCard to="/archetypes/catalogue" eyebrow="Archetype" title="Catalogue" sub="Entries, people, places, numbers — with a map" accent />
          <LinkCard to="/archetypes/dashboard" eyebrow="Archetype" title="Single-page dashboard" sub="Is everything fine? Jobs, runs, settings" />
          <LinkCard to="/archetypes/status" eyebrow="Archetype" title="Status monitor" sub="Is every service up? Checks, response, history" />
        </div>
      </section>
    </div>
  );
}
