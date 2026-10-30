/** The showcase app: the reference AppShell with four tabs, two top-bar actions, the demo routes and the jimbo-ui config section under Settings. */

import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell, TopBarButton, type ShellTab } from "@/routes/AppShell";
import { Sheet, SearchField } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { useApplyBrand } from "@/lib/useBrand";
import { JimboConfigPage } from "@/routes/JimboConfigPage";
import { CatalogueRoutes } from "@/archetypes/catalogue";
import { DashboardPage } from "@/archetypes/dashboard";
import { HomeDemo } from "./Home";
import { ArchetypesPage, CatalogueNav, ComponentsPage, SettingsPage } from "./pages";

const TABS: ShellTab[] = [
  { to: "/", label: "Home", icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  { to: "/components", label: "Components", icon: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></> },
  { to: "/archetypes", label: "Archetypes", icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></> },
  { to: "/settings", label: "Settings", also: ["/jimbo-ui"], icon: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></> },
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
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/archetypes" element={<ArchetypesPage />} />
        <Route path="/archetypes/catalogue/*" element={<CatalogueRoutes base="/archetypes/catalogue" nav={(current) => <CatalogueNav current={current} />} />} />
        <Route path="/archetypes/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* No sign-in here, so like an app with auth "none" the section is open. */}
        <Route path="/jimbo-ui" element={<JimboConfigPage canConfigure />} />
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
        <Sheet title="Add an entry" subtitle="The + button opens the app's main add flow in a sheet." onClose={() => setSheet(null)}>
          <div className="space-y-3 p-5">
            <label className="label" htmlFor="add-title">Title</label>
            <input id="add-title" className="field h-12 w-full sm:h-11" placeholder="What's happening?" />
            <Button className="w-full" onClick={() => setSheet(null)}>Add entry</Button>
          </div>
        </Sheet>
      )}
    </AppShell>
  );
}
