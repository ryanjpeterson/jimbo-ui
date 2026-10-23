/**
 * The showcase's app shell. It mirrors reference/web/src/routes/AppShell.tsx
 * (top bar, floating tab dock, main frame) with the showcase's own tabs —
 * keep the two in step when the shell changes.
 */

import { useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Wordmark } from "@/components/Wordmark";
import { Sheet, SearchField } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { useApplyBrand } from "@/lib/useBrand";
import { BrandPage } from "@/routes/BrandPage";
import { StyleGuidePage } from "@/routes/StyleGuidePage";
import { DetailDemo, HomeDemo, ListDemo } from "./pages";

const TABS = [
  { to: "/", label: "Home" },
  { to: "/shows", label: "List" },
  { to: "/admin/style", label: "Kit" },
  { to: "/admin/brand", label: "Theme" },
];

export function Shell() {
  useApplyBrand();
  const location = useLocation();
  const [sheet, setSheet] = useState<"search" | "add" | null>(null);
  const [q, setQ] = useState("");
  const inTab = (to: string) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));

  return (
    <div className="min-h-full overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <div className="flex h-full items-center gap-8">
            <Link to="/" aria-label="Home"><Wordmark size="sm" /></Link>
            <nav className="hidden h-full items-stretch gap-6 sm:flex">
              {TABS.filter((t) => t.to !== "/").map((t) => (
                <NavLink key={t.to} to={t.to}
                  className={`relative flex items-center text-[15px] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:transition-colors ${
                    inTab(t.to) ? "text-text-base after:bg-accent-lime" : "text-text-muted hover:text-text-base after:bg-transparent"}`}>
                  {t.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSheet("search")} aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent-lime hover:text-text-base active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <button onClick={() => setSheet("add")} aria-label="Add"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-lime text-on-accent transition-transform hover:brightness-110 active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <span className="flex h-10 items-center gap-2 rounded-full border border-border pl-1 pr-1 sm:pr-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-lime font-display text-sm text-on-accent">J</span>
              <span className="hidden text-sm font-semibold sm:inline">jimbo</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
        <Routes>
          <Route path="/" element={<HomeDemo />} />
          <Route path="/shows" element={<ListDemo />} />
          <Route path="/shows/:id" element={<DetailDemo />} />
          <Route path="/admin/style" element={<StyleGuidePage />} />
          <Route path="/admin/brand" element={<BrandPage />} />
          <Route path="*" element={<HomeDemo />} />
        </Routes>
      </main>

      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[calc(6rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-bg via-bg/70 to-transparent sm:hidden" />
      <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 select-none px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden">
        <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[28px] border border-white/10 bg-surface/75 p-1.5 shadow-[0_10px_40px_-8px_rgba(0,0,0,0.75)] ring-1 ring-black/40 backdrop-blur-2xl backdrop-saturate-150">
          {TABS.map((t) => {
            const active = inTab(t.to);
            return (
              <NavLink key={t.to} to={t.to} end={t.to === "/"} aria-current={active ? "page" : undefined}
                onClick={(e) => { if (location.pathname === t.to) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                className={`relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-[22px] transition-[background-color,color,transform] duration-200 active:scale-[0.92] ${
                  active ? "bg-accent-lime/15 text-accent-lime" : "text-text-muted active:bg-white/5"}`}>
                <TabIcon name={t.label} active={active} />
                <span className={`text-[10.5px] tracking-wide ${active ? "font-bold" : "font-semibold"}`}>{t.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {sheet === "search" && (
        <Sheet title="Search" subtitle="The search sheet: one field, results as you type." onClose={() => setSheet(null)}>
          <div className="space-y-3 p-5">
            <SearchField value={q} onChange={setQ} placeholder="Shows, artists, venues, songs" />
            <p className="meta">{q ? `Nothing here matches “${q}” — it's a showcase.` : "Start typing."}</p>
          </div>
        </Sheet>
      )}
      {sheet === "add" && (
        <Sheet title="Add a show" subtitle="The + button opens the main add flow in a sheet." onClose={() => setSheet(null)}>
          <div className="space-y-3 p-5">
            <label className="label" htmlFor="add-title">Headliner</label>
            <input id="add-title" className="field h-12 w-full sm:h-11" placeholder="Who did you see?" />
            <Button className="w-full" onClick={() => setSheet(null)}>Add show</Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const p = { width: 24, height: 24, viewBox: "0 0 24 24", fill: active ? "currentColor" : "none", fillOpacity: active ? 0.22 : undefined,
    stroke: "currentColor", strokeWidth: active ? 2.2 : 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "Home": return <svg {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>;
    case "List": return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>;
    case "Kit": return <svg {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></svg>;
    default: return <svg {...p}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" /><circle cx="7.5" cy="11" r="1.2" /><circle cx="10.5" cy="7" r="1.2" /><circle cx="15" cy="7.5" r="1.2" /></svg>;
  }
}
