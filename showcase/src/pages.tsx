/**
 * Showcase pages besides Home: the components, the archetypes (mounted from
 * reference/archetypes), and a settings page that leads to the jimbo-ui
 * config section, the way every app reaches it.
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LinkCard, PageHeader, Section, SwitchRow, ViewSwitch } from "@/components/ui/kit";
import { StyleGuidePanel } from "@/routes/config/StyleGuidePanel";
import { JimboConfigLink } from "@/routes/JimboConfigPage";

export function ComponentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Kit" title="Components" />
      <StyleGuidePanel />
    </div>
  );
}

export function ArchetypesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Start here" title="Archetypes" />
      <p className="meta -mt-3 max-w-xl">Ready-made app shapes to copy and remix. Each one is real pages built from the kit, with neutral example content.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard to="/archetypes/catalogue" eyebrow="Catalogue" title="A log of things, people and places" sub="Home · Entries · People · Places, with a map" accent />
        <LinkCard to="/archetypes/dashboard" eyebrow="Single-page dashboard" title="Is everything fine?" sub="Jobs with a Run button, recent runs, settings" />
      </div>
      <p className="meta">The guide lists the rest (Tracker, Collection, Directory, Planner, Showcase, Tool) by their shape.</p>
    </div>
  );
}

/** The catalogue's own tabs, shown in the page since the showcase's dock is taken. */
export function CatalogueNav({ current }: { current: string }) {
  const base = "/archetypes/catalogue";
  const at = (p: string) => (p === "/" ? base : `${base}${p}`);
  return (
    <div className="mb-5 space-y-2">
      <Link to="/archetypes" className="link-action">‹ Archetypes</Link>
      <ViewSwitch current={at(current)} options={[
        { to: at("/"), label: "Home" }, { to: at("/entries"), label: "Entries" }, { to: at("/people"), label: "People" }, { to: at("/places"), label: "Places" },
      ]} />
    </div>
  );
}

export function SettingsPage() {
  const { pathname } = useLocation();
  const [notify, setNotify] = useState(true);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Showcase" title="Settings" />
      <Section title="Notifications" flush>
        <SwitchRow label="Daily summary" hint="An app's own settings go here." checked={notify} onChange={setNotify} />
      </Section>
      <div className="space-y-2">
        <p className="eyebrow px-0.5">Look</p>
        {/* Every app: the one entry to its jimbo-ui config section, here in settings, admin-only when the app has auth. */}
        <JimboConfigLink canConfigure />
      </div>
      <p className="meta" hidden={pathname !== "/settings"}>The showcase has no sign-in, so like an app with no auth, the section is open to everyone.</p>
    </div>
  );
}
