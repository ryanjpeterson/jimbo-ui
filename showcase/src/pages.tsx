/**
 * Showcase pages besides Home: the release-updates demo Home shows, and a
 * settings page that leads to the jimbo-ui config section, the way every app
 * reaches it.
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PageHeader, Section, SwitchRow, Tabs } from "@/components/ui/kit";
import { JimboUpdates } from "@/routes/config/UpdatesPanel";
import type { Releases } from "@/lib/jimbo";
import releasesJson from "@/releases.json";
import { JimboConfigLink } from "@/routes/JimboConfigPage";
import { useUrlState } from "@/lib/useUrlState";

const RELEASES = releasesJson as Releases;
/** A sample app's kit components, so the demo can tell "yours" from the rest. */
const SAMPLE_USES = ["banner", "hero", "page-header", "list", "list-group-label", "section", "tabs", "badge", "stat-tile", "event-row", "app-shell"];

/** The About tab's update check, for an app that's current, one release behind and several behind. */
export function UpdatesDemo() {
  const versions = RELEASES.releases.map((r) => r.version);
  const [at, setAt] = useUrlState("behind", "one", ["current", "one", "several"] as const);
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
