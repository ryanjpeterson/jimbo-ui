/**
 * Showcase pages besides Home: the components, the archetypes (mounted from
 * reference/archetypes), and a settings page that leads to the jimbo-ui
 * config section, the way every app reaches it.
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LinkCard, PageHeader, Section, SwitchRow, Tabs, ViewSwitch } from "@/components/ui/kit";
import { StyleGuidePanel } from "@/routes/config/StyleGuidePanel";
import { JimboUpdates } from "@/routes/config/UpdatesPanel";
import type { Releases } from "@/lib/jimbo";
import releasesJson from "@/releases.json";
import { JimboConfigLink } from "@/routes/JimboConfigPage";

export function ComponentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Kit" title="Components" />
      <StyleGuidePanel />
      <UpdatesDemo />
    </div>
  );
}

const RELEASES = releasesJson as Releases;
/** A sample app's kit components, so the demo can tell "yours" from the rest. */
const SAMPLE_USES = ["banner", "hero", "page-header", "list", "list-group-label", "section", "tabs", "badge", "stat-tile", "event-row", "app-shell"];

/** The About tab's update check, for an app that's current, one release behind and several behind. */
function UpdatesDemo() {
  const versions = RELEASES.releases.map((r) => r.version);
  const [at, setAt] = useState<"current" | "one" | "several">("one");
  const current = at === "current" ? versions[0]! : at === "one" ? (versions[1] ?? versions[0]!) : (versions[4] ?? versions.at(-1)!);
  return (
    <section className="space-y-3">
      <div className="px-0.5">
        <h2 className="h-section">Release updates</h2>
        <p className="meta mt-1">The About tab of the jimbo-ui config section, when an app is behind. It reads <code>releases.json</code> from GitHub and sorts what the update changes for that app.</p>
      </div>
      <Tabs value={at} onChange={setAt} options={[{ value: "current", label: "Up to date" }, { value: "one", label: "1 behind" }, { value: "several", label: "4 behind" }]} />
      <JimboUpdates releases={RELEASES} current={current} uses={SAMPLE_USES} />
    </section>
  );
}

export function ArchetypesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Start here" title="Archetypes" />
      <p className="meta -mt-3 max-w-xl">Ready-made app shapes to copy and remix. Each one is real pages built from the kit, with neutral example content.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard to="/archetypes/catalogue" eyebrow="Catalogue" title="A log of things, people and places" sub="Home · Entries · People · Places, with a map" accent />
        <LinkCard to="/archetypes/dashboard" eyebrow="Single-page dashboard" title="Is everything fine?" sub="Jobs as rows or tiles, charts, recent runs, settings" />
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
