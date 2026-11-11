/**
 * jimbo-ui config — /jimbo-ui
 *
 * The one place for every brand, theme and style guide option, the same in
 * every app: Looks, Colours, Type, Backdrop, Brand (name, motif, favicon), Style guide, About, and an
 * optional App tab for the app's own additions. Reached from the app's settings or admin area, never a
 * dock tab. The app passes `canConfigure`: its admin check when it has auth
 * (the server checks admin on every save too), or `true` when it has none.
 * Without it the section redirects home and its link doesn't render.
 *
 * All panels stay mounted and share one draft, so an unsaved look follows you
 * from Looks through Colours, Type, Backdrop and the motif into the Style guide; the save
 * bar floats over every tab.
 */

import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BRAND } from "@/lib/brand.config";
import { JIMBO_APP, JIMBO_UI } from "@/lib/jimbo";
import { useBrand } from "@/lib/useBrand";
import { useUrlState } from "@/lib/useUrlState";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Badge, LinkCard, PageHeader, PillTabs } from "@/components/ui/kit";
import { BackdropPanel, ColoursPanel, LooksPanel, MotifPanel, ThemeSaveBar, TypePanel, useThemeDraft, type ThemeDraft } from "./config/ThemePanel";
import { StyleGuidePanel } from "./config/StyleGuidePanel";
import { JimboUpdates, useJimboUpdates } from "./config/UpdatesPanel";

type Tab = "theme" | "colours" | "type" | "backdrop" | "brand" | "style" | "about" | "app";

export function JimboConfigPage({ canConfigure, app }: { canConfigure: boolean; app?: { label?: string; content: ReactNode } }) {
  if (!canConfigure) return <Navigate to="/" replace />;
  return <ConfigSection app={app} />;
}

function ConfigSection({ app }: { app?: { label?: string; content: ReactNode } }) {
  const draft = useThemeDraft();
  const tabs: { value: Tab; label: string }[] = [
    { value: "theme", label: "Looks" }, { value: "colours", label: "Colours" }, { value: "type", label: "Type" }, { value: "backdrop", label: "Backdrop" },
    { value: "brand", label: "Brand" }, { value: "style", label: "Style guide" }, { value: "about", label: "About" },
    ...(app ? [{ value: "app" as const, label: app.label ?? "App" }] : []),
  ];
  // The tab (and each tab's own choices) live in the URL, so a refresh or a link opens the same view.
  const [tab, setTab] = useUrlState<Tab>("tab", "theme", tabs.map((t) => t.value));
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <PageHeader eyebrow="Settings" title="jimbo-ui config" />
      <PillTabs scroll value={tab} onChange={setTab} options={tabs} />
      <div hidden={tab !== "theme"}><LooksPanel d={draft} /></div>
      <div hidden={tab !== "colours"}><ColoursPanel d={draft} /></div>
      <div hidden={tab !== "type"}><TypePanel d={draft} /></div>
      <div hidden={tab !== "backdrop"}><BackdropPanel d={draft} /></div>
      <div hidden={tab !== "brand"}><BrandPanel d={draft} /></div>
      <div hidden={tab !== "style"}><StyleGuidePanel /></div>
      <div hidden={tab !== "about"}><AboutPanel /></div>
      {app && <div hidden={tab !== "app"}>{app.content}</div>}
      <ThemeSaveBar d={draft} />
    </div>
  );
}

/**
 * The entry in the app's settings or admin area; renders nothing for people
 * who can't configure. Says so when a newer jimbo-ui release is out.
 */
export function JimboConfigLink({ canConfigure }: { canConfigure: boolean }) {
  const { updates } = useJimboUpdates(canConfigure);
  if (!canConfigure) return null;
  return (
    <LinkCard to={updates ? "/jimbo-ui?tab=about" : "/jimbo-ui"} eyebrow="Look" title="jimbo-ui config"
      sub={updates ? <Badge tone="yellow" dot>jimbo-ui {updates.latest} is out</Badge> : "Theme, brand and style guide"} />
  );
}

/** Brand: the name as header text, the motif (part of the theme draft, so the save bar covers it) and the favicon. */
function BrandPanel({ d }: { d: ThemeDraft }) {
  const brand = useBrand();
  const qc = useQueryClient();
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="h-section">Name</h2>
          <p className="meta mt-1">The brand is the app's name as header text; a dot takes the accent. Set in <code>brand.config.ts</code>.</p>
        </div>
        <div className="rounded-xl border border-border bg-card space-y-4 p-5">
          {(["sm", "md", "lg"] as const).map((s) => <div key={s}><HeaderTitle size={s} /></div>)}
          <p className="meta">{BRAND.name}</p>
        </div>
      </section>
      <MotifPanel d={d} />
      <FaviconUpload faviconUrl={brand.faviconUrl} onChange={() => qc.invalidateQueries({ queryKey: ["brand"] })} />
    </div>
  );
}

function AboutPanel() {
  const { releases } = useJimboUpdates();
  const a = JIMBO_APP;
  const behind = a?.version && a.version !== JIMBO_UI.version;
  const local = a?.components?.local ?? [];
  const rows: [string, ReactNode][] = [
    ["jimbo-ui", `${JIMBO_UI.version}${behind ? ` (jimbo-ui.json says ${a!.version})` : ""}`],
    ["Access", a?.auth === "admin" ? "Admins only" : a?.auth === "none" ? "Anyone using the app" : "—"],
    ["Registered", a?.registry?.registered ?? "Not in the registry yet"],
    ["Last audited", a?.registry?.audited ?? "—"],
    ["Kit components used", a?.components?.uses?.length ?? "—"],
    ["Own components", a ? `${local.filter((l) => l.kind === "domain").length} domain, ${local.filter((l) => l.kind === "candidate").length} candidates` : "—"],
  ];
  return (
    <div className="space-y-4">
      <JimboUpdates releases={releases} />
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {rows.map(([k, v]) => (
          <p key={k} className="flex min-h-[56px] items-center justify-between gap-4 px-4 py-3">
            <span className="text-15 font-semibold">{k}</span><span className="text-right text-sm text-muted-foreground">{v}</span>
          </p>
        ))}
      </div>
      <a href={JIMBO_UI.showcase} target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-card flex items-center justify-between gap-3 p-4 hover:border-primary">
        <span><span className="eyebrow block">Showcase</span><span className="mt-0.5 block text-15 font-semibold">See this release in action</span></span>
        <span className="text-subtle-foreground">›</span>
      </a>
    </div>
  );
}

/** Upload or remove a custom favicon (the built-in one is recoloured from the theme). */
function FaviconUpload({ faviconUrl, onChange }: { faviconUrl: string | null; onChange: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try { await api.uploadBrandAsset("favicon", file); await onChange(); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.removeBrandAsset("favicon"); await onChange(); }
    finally { setBusy(false); }
  };

  return (
    <section className="space-y-3">
      <div className="px-0.5">
        <h2 className="h-section">Favicon</h2>
        <p className="meta mt-1">The built-in one is your motif in the accent, on your page colour. Upload an SVG, PNG or WebP under 1 MB to replace it.</p>
      </div>
      <div className="rounded-xl border border-border bg-card flex items-center gap-4 p-4 sm:p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
          <img src={faviconUrl ?? (document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ?? "/favicon.svg")} alt="" className="h-10 w-10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-subtle-foreground">{faviconUrl ? "Custom upload" : "Built-in — your motif in the accent"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary" className={busy ? "pointer-events-none opacity-50" : undefined}>
              <label className="cursor-pointer">
                {busy ? "Uploading…" : faviconUrl ? "Replace" : "Upload"}
                <input type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" className="sr-only"
                  onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            </Button>
            {faviconUrl && <Button size="sm" variant="ghost" onClick={() => void remove()}>Use built-in</Button>}
          </div>
          {error && <p className="mt-2 text-sm text-highlight">{error}</p>}
        </div>
      </div>
    </section>
  );
}

