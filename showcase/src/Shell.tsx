/** The showcase app: the reference AppShell with two tabs (Home holds every component), two top-bar actions, a ⌘K search palette (looks and backdrops, in the URL as ?find=) and the jimbo-ui config section under Settings. */

import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppShell, TopBarButton, type ShellTab } from "@/routes/AppShell";
import { Sheet } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { CommandPalette, SearchIcon, useSpotlight, type Command } from "@/components/ui/overlays";
import { toast } from "@/components/ui/feedback";
import { useApplyBrand } from "@/lib/useBrand";
import { JimboConfigPage } from "@/routes/JimboConfigPage";
import { HomeDemo } from "./Home";
import { SettingsPage } from "./pages";
import { useShowcaseSearch } from "./search";

const TABS: ShellTab[] = [
  { to: "/", label: "Home", icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  { to: "/settings", label: "Settings", also: ["/jimbo-ui"], icon: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></> },
];

const CONFIG_TABS = [["theme", "Looks"], ["colours", "Colours"], ["type", "Type"], ["backdrop", "Backdrop"], ["brand", "Brand"], ["style", "Style guide"], ["about", "About"]] as const;
const KIT_SECTIONS = [["brand", "Brand and type"], ["controls", "Controls"], ["forms", "Forms"], ["overlays", "Menus and overlays"], ["feedback", "Feedback"], ["data", "Tables and steps"], ["lists", "Lists"], ["numbers", "Numbers and charts"], ["states", "States"]] as const;

export function Shell() {
  useApplyBrand();
  const [sheet, setSheet] = useState<"add" | null>(null);
  const spotlight = useSpotlight();
  const search = useShowcaseSearch();
  const navigate = useNavigate();
  const commands: Command[] = [
    { id: "home", group: "Go to", label: "Home", run: () => navigate("/") },
    { id: "settings", group: "Go to", label: "Settings", run: () => navigate("/settings") },
    ...CONFIG_TABS.map(([tab, label]): Command => ({ id: `cfg-${tab}`, group: "jimbo-ui config", label, keywords: ["theme", "look"], run: () => navigate(`/jimbo-ui?tab=${tab}`) })),
    ...KIT_SECTIONS.map(([section, label]): Command => ({ id: `kit-${section}`, group: "Components", label, keywords: ["kit", "style guide"], run: () => navigate(`/?section=${section}`) })),
    { id: "toast", group: "Actions", label: "Show a toast", run: () => toast("Hello from the palette") },
    { id: "add", group: "Actions", label: "Add an entry", hint: "+", run: () => setSheet("add") },
  ];

  return (
    <AppShell tabs={TABS} onRefresh={() => new Promise((r) => setTimeout(r, 700))} actions={<>
      <TopBarButton label="Search" onClick={() => spotlight.setOpen(true)}><SearchIcon /></TopBarButton>
      <TopBarButton label="Add" primary onClick={() => setSheet("add")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </TopBarButton>
    </>}>
      <Routes>
        <Route path="/" element={<HomeDemo />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* No sign-in here, so like an app with auth "none" the section is open. */}
        <Route path="/jimbo-ui" element={<JimboConfigPage canConfigure />} />
        {/* Anything else (old /components and /archetypes links too) goes home, and the URL says so. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CommandPalette {...spotlight.bind} commands={commands} {...search} />
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
