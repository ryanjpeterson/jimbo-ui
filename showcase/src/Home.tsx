/**
 * The showcase's front page: a hero and every kit component, a section at a
 * time, while ten looks picked at random on each load take turns on the whole
 * page — colours, type and backdrop — every 15 seconds, fading slowly from
 * the last. A floating control top right steps, pauses and keeps one.
 */

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { HeroSection, LinkCard } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/MapView";
import { cn } from "@/lib/cn";
import { StyleGuidePanel } from "@/routes/config/StyleGuidePanel";
import { api } from "@/lib/api";
import { applyTheme, BACKDROPS, FONTS, fullTheme, loadFonts, type PageTone, type Theme } from "@/lib/theme";
import { ALL_FAMILIES, familyLook } from "@/lib/themes";
import type { Brand } from "@/lib/useBrand";
import { UpdatesDemo } from "./pages";

type Look = { name: string; tone: PageTone; headings: string; body: string; backdrop: string; base: string; theme: Theme };

const LOOK_COUNT = 10;
const TONES: PageTone[] = ["light", "mid", "dark"];
const BASES = ["solid", "gradient", "glow"] as const;
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]!;

/** Ten different looks, each in a random tone with random fonts and backdrop. Decorative faces only head. */
function randomLooks(n: number): Look[] {
  const families = [...ALL_FAMILIES];
  for (let k = families.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [families[k], families[j]] = [families[j]!, families[k]!];
  }
  const fonts = Object.keys(FONTS);
  const bodyFonts = fonts.filter((k) => FONTS[k]!.group !== "Decorative");
  const patterns = BACKDROPS.filter((b) => b.key !== "none");
  return families.slice(0, n).map((f) => {
    const tone = pick(TONES), headings = pick(fonts), body = pick(bodyFonts), backdrop = pick(patterns), base = pick(BASES);
    const theme = { ...familyLook(f, tone).template.theme, fonts: { headings, body }, backdrop: { pattern: backdrop.key, base } };
    return { name: f.name, tone, headings, body, backdrop: backdrop.label, base, theme };
  });
}

// Picked once per page load.
const LOOKS = randomLooks(LOOK_COUNT);

const PINS = [
  { id: "a", label: "North", lat: 43.67, lng: -79.39 }, { id: "b", label: "Harbour", lat: 43.64, lng: -79.38 },
  { id: "c", label: "West", lat: 43.65, lng: -79.42 }, { id: "d", label: "East", lat: 43.66, lng: -79.35 },
];

function Maps() {
  return (
    <>
      <div className="px-0.5">
        <h2 className="h-section">MapView</h2>
        <p className="meta mt-1">The theme's own map style and flat highlight pins; MapPinCard for the chosen place.</p>
      </div>
      <MapView pins={PINS} selected="b" size="full" />
    </>
  );
}

type Settled = { then: (done: () => void, failed: () => void) => unknown };
type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => { ready: Settled; finished: Settled } };

// While a fade runs the browser sends every tap to the page root, not the button under it.
let fading = false;
let fades = 0;

/** Runs `update`, fading slowly from the old page to the new where the browser can (view transitions). */
function fadeTo(update: () => void) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update();
  // A quick second tap skips the fade in progress; that's fine, not an error.
  const t = doc.startViewTransition(update);
  const id = ++fades;
  fading = true;
  // A fade cut short by the next one ends too, but the page is still fading.
  const done = () => { if (id === fades) fading = false; };
  t.ready.then(() => {}, done);
  t.finished.then(done, done);
}

const LOOK_SECONDS = 15;

/**
 * The look control, top right. It sits in the page above the hero, so it
 * covers nothing, then sticks under the top bar as the page scrolls — on
 * phones as a full-width frosted strip, like the bar, so content slides
 * under it rather than into it. Every 15 seconds the next look goes on the whole page as a
 * preview — nothing is saved until "Use". The arrows (buttons or ← → keys)
 * step by hand and pause the timer; play starts it again. The preview goes
 * in as the brand everything reads (the hero, the map, the colour values),
 * so every part follows; leaving the page fetches the saved look back.
 */
function LookStepper() {
  // null is the saved look the page opened in.
  const [i, setI] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [left, setLeft] = useState(LOOK_SECONDS);
  const [applied, setApplied] = useState(false);
  const qc = useQueryClient();
  const prevBtn = useRef<HTMLButtonElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const goRef = useRef<(step: number, byHand?: boolean) => void>(() => {});
  const bar = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = bar.current;
      if (el) setStuck(el.getBoundingClientRect().top <= parseFloat(getComputedStyle(el).top) + 1);
    };
    check();
    addEventListener("scroll", check, { passive: true, capture: true });
    addEventListener("resize", check);
    return () => { removeEventListener("scroll", check, { capture: true }); removeEventListener("resize", check); };
  }, []);
  useEffect(() => {
    // A tap on an arrow mid-fade lands on the page root; send it on to the button it was on.
    const onTap = (e: MouseEvent) => {
      if (!fading || e.target !== document.documentElement) return;
      const on = (b: HTMLButtonElement | null) => {
        const r = b?.getBoundingClientRect();
        return !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      };
      if (on(nextBtn.current)) goRef.current(1);
      else if (on(prevBtn.current)) goRef.current(-1);
    };
    // ← → step through the looks, unless someone is typing.
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = e.target as HTMLElement;
      if (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.key === "ArrowRight") goRef.current(1);
      else if (e.key === "ArrowLeft") goRef.current(-1);
    };
    document.addEventListener("click", onTap);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onTap); document.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    loadFonts(LOOKS.flatMap((x) => [x.headings, x.body]));
    return () => void qc.invalidateQueries({ queryKey: ["brand"] });
  }, [qc]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [playing]);
  useEffect(() => { if (playing && left <= 0) goRef.current(1, false); }, [playing, left]);

  const go = (step: number, byHand = true) => {
    const n = i === null ? (step > 0 ? 0 : LOOKS.length - 1) : (i + step + LOOKS.length) % LOOKS.length;
    const { theme } = LOOKS[n]!;
    setI(n);
    setLeft(LOOK_SECONDS);
    if (byHand) setPlaying(false);
    setApplied(false);
    fadeTo(() => {
      flushSync(() => qc.setQueryData<Brand>(["brand"], (b) => ({ theme, colors: fullTheme(theme), faviconUrl: b?.faviconUrl ?? null })));
      applyTheme(theme);
    });
  };
  goRef.current = go;
  const useIt = async () => {
    if (i === null) return;
    await api.setTheme(LOOKS[i]!.theme);
    await qc.invalidateQueries({ queryKey: ["brand"] });
    setApplied(true);
    setPlaying(false);
  };
  const s = i === null ? null : LOOKS[i]!;
  const arrow = "flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-2 hover:text-text-base";

  return (
    // Same size stuck or not (only the strip's paint changes), so sticking never moves the page.
    <div ref={bar} className={cn(
      "sticky top-[calc(var(--safe-top)+3.5rem)] z-30 ml-[calc(50%-50vw)] flex w-screen justify-end border-b px-3 py-1.5 transition-colors",
      "sm:top-[calc(var(--safe-top)+4.75rem)] sm:ml-0 sm:w-auto sm:border-0 sm:p-0",
      stuck ? "border-border bg-bg/90 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none" : "border-transparent",
    )}>
    <div role="group" aria-label="Looks"
      className="glass flex max-w-full items-center gap-0.5 rounded-control p-0.5 shadow-lg">
      <button ref={prevBtn} type="button" className={arrow} onClick={() => go(-1)} aria-label="Previous look">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <div className="min-w-0 px-1 leading-tight" title={s ? `${FONTS[s.headings]?.label ?? s.headings} headings · ${FONTS[s.body]?.label ?? s.body} body · ${s.backdrop} on ${s.base}` : undefined}>
        <p className="max-w-[9rem] truncate text-sm font-semibold sm:max-w-[12rem]" aria-live="polite">{s ? s.name : "Your look"}</p>
        <p className="text-xs tabular-nums text-text-subtle">
          {s && <span className="capitalize">{s.tone} · </span>}
          {i !== null && `${i + 1}/${LOOKS.length} · `}{playing ? `next in ${left}s` : "paused"}
        </p>
      </div>
      <button ref={nextBtn} type="button" className={arrow} onClick={() => go(1)} aria-label="Next look">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
      <button type="button" className={arrow} onClick={() => { setPlaying((p) => !p); setLeft(LOOK_SECONDS); }} aria-label={playing ? "Pause looks" : "Play looks"}>
        {playing
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 7 5.5z" /></svg>}
      </button>
      {s && (
        <button type="button" onClick={() => void useIt()} aria-label="Use this look"
          className="h-11 shrink-0 rounded-control px-3 text-sm font-semibold text-accent transition-colors hover:bg-surface-2">
          {applied ? "Using" : "Use"}
        </button>
      )}
    </div>
    </div>
  );
}

export function HomeDemo() {
  return (
    <div className="space-y-8">
      <LookStepper />

      <HeroSection pullUp={false} eyebrow={`jimbo.ui ${__JIMBO_VERSION__} · showcase`} title="One kit, any look" pattern="none"
        actions={<>
          <button type="button" className="btn btn-primary" onClick={() => document.getElementById("kit")?.scrollIntoView({ behavior: "smooth" })}>See every component</button>
          <Link to="/jimbo-ui" className="btn btn-secondary">Make a look</Link>
        </>}>
        The same components in {ALL_FAMILIES.length} looks — each light, mid or dark — {Object.keys(FONTS).length} typefaces and {BACKDROPS.length - 1} backdrops. Ten of them take
        turns on the whole page, a new one every {LOOK_SECONDS} seconds — the arrows top right (or ← →) step by hand; <em>Use</em> keeps one.
      </HeroSection>

      <section id="kit" className="scroll-mt-20 space-y-4">
        <h2 className="h-page px-0.5">Every component</h2>
        <StyleGuidePanel more={[
          { value: "maps", label: "Maps", content: <Maps /> },
          { value: "updates", label: "Release updates", content: <UpdatesDemo /> },
        ]} />
      </section>

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
