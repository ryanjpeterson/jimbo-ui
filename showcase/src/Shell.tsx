/** The showcase app: the reference AppShell with four tabs, two top-bar actions and the demo routes. */

import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell, TopBarButton, type ShellTab } from "@/routes/AppShell";
import { Sheet, SearchField } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { useApplyBrand } from "@/lib/useBrand";
import { BrandPage } from "@/routes/BrandPage";
import { StyleGuidePage } from "@/routes/StyleGuidePage";
import { DetailDemo, HomeDemo, ListDemo } from "./pages";

const TABS: ShellTab[] = [
  { to: "/", label: "Home", icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  { to: "/events", label: "List", icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></> },
  { to: "/admin/style", label: "Kit", icon: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></> },
  { to: "/admin/brand", label: "Theme", icon: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" /><circle cx="7.5" cy="11" r="1.2" /><circle cx="10.5" cy="7" r="1.2" /><circle cx="15" cy="7.5" r="1.2" /></> },
];

export function Shell() {
  useApplyBrand();
  const [sheet, setSheet] = useState<"search" | "add" | null>(null);
  const [q, setQ] = useState("");

  return (
    <AppShell tabs={TABS} onRefresh={() => new Promise((r) => setTimeout(r, 700))} actions={<>
      <TopBarButton label="Search" onClick={() => setSheet("search")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </TopBarButton>
      <TopBarButton label="Add" primary onClick={() => setSheet("add")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </TopBarButton>
    </>}>
      <Routes>
        <Route path="/" element={<HomeDemo />} />
        <Route path="/events" element={<ListDemo />} />
        <Route path="/events/:id" element={<DetailDemo />} />
        <Route path="/admin/style" element={<StyleGuidePage />} />
        <Route path="/admin/brand" element={<BrandPage />} />
        <Route path="*" element={<HomeDemo />} />
      </Routes>

      {sheet === "search" && (
        <Sheet title="Search" subtitle="One field; results appear as you type." onClose={() => setSheet(null)}>
          <div className="space-y-3 p-5">
            <SearchField value={q} onChange={setQ} placeholder="Search everything" />
            <p className="meta">{q ? `Nothing matches “${q}” in the showcase.` : "Start typing."}</p>
          </div>
        </Sheet>
      )}
      {sheet === "add" && (
        <Sheet title="Add an event" subtitle="The + button opens the app's main add flow in a sheet." onClose={() => setSheet(null)}>
          <div className="space-y-3 p-5">
            <label className="label" htmlFor="add-title">Title</label>
            <input id="add-title" className="field h-12 w-full sm:h-11" placeholder="What's happening?" />
            <Button className="w-full" onClick={() => setSheet(null)}>Add event</Button>
          </div>
        </Sheet>
      )}
    </AppShell>
  );
}
