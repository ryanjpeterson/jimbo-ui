/**
 * jimbo-ui config — /jimbo-ui
 *
 * The one place for every brand, theme and style guide option, the same in
 * every app: Looks, Colours, Type, Backdrop, Brand, Style guide, About, and an
 * optional App tab for the app's own additions. Reached from the app's settings or admin area, never a
 * dock tab. The app passes `canConfigure`: its admin check when it has auth
 * (the server checks admin on every save too), or `true` when it has none.
 * Without it the section redirects home and its link doesn't render.
 *
 * All panels stay mounted and share one draft, so an unsaved look follows you
 * from Looks through Colours, Type and Backdrop into the Style guide; the save
 * bar floats over every tab.
 */

import { useState, type ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BRAND } from "@/lib/brand.config";
import { JIMBO_APP, JIMBO_UI } from "@/lib/jimbo";
import { useBrand } from "@/lib/useBrand";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Badge, LinkCard, PageHeader, PillTabs } from "@/components/ui/kit";
import { BackdropPanel, ColoursPanel, LooksPanel, ThemeSaveBar, TypePanel, useThemeDraft } from "./config/ThemePanel";
import { StyleGuidePanel } from "./config/StyleGuidePanel";
import { JimboUpdates, useJimboUpdates } from "./config/UpdatesPanel";

type Tab = "theme" | "colours" | "type" | "backdrop" | "brand" | "style" | "about" | "app";

export function JimboConfigPage({ canConfigure, app }: { canConfigure: boolean; app?: { label?: string; content: ReactNode } }) {
  if (!canConfigure) return <Navigate to="/" replace />;
  return <ConfigSection app={app} />;
}

function ConfigSection({ app }: { app?: { label?: string; content: ReactNode } }) {
  const [params, setParams] = useSearchParams();
  const draft = useThemeDraft();
  const tabs: { value: Tab; label: string }[] = [
    { value: "theme", label: "Looks" }, { value: "colours", label: "Colours" }, { value: "type", label: "Type" }, { value: "backdrop", label: "Backdrop" },
    { value: "brand", label: "Brand" }, { value: "style", label: "Style guide" }, { value: "about", label: "About" },
    ...(app ? [{ value: "app" as const, label: app.label ?? "App" }] : []),
  ];
  const tab = (tabs.find((t) => t.value === params.get("tab"))?.value ?? "theme") as Tab;
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <PageHeader eyebrow="Settings" title="jimbo-ui config" />
      <PillTabs scroll value={tab} onChange={(v) => setParams({ tab: v }, { replace: true })} options={tabs} />
      <div hidden={tab !== "theme"}><LooksPanel d={draft} /></div>
      <div hidden={tab !== "colours"}><ColoursPanel d={draft} /></div>
      <div hidden={tab !== "type"}><TypePanel d={draft} /></div>
      <div hidden={tab !== "backdrop"}><BackdropPanel d={draft} /></div>
      <div hidden={tab !== "brand"}><BrandPanel /></div>
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

function BrandPanel() {
  const brand = useBrand();
  const qc = useQueryClient();
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="h-section">Name</h2>
          <p className="meta mt-1">The brand is the app's name as header text; a dot takes the accent. Set in <code>brand.config.ts</code>.</p>
        </div>
        <div className="card space-y-4 p-5">
          {(["sm", "md", "lg"] as const).map((s) => <div key={s}><HeaderTitle size={s} /></div>)}
          <p className="meta">{BRAND.name}</p>
        </div>
      </section>
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
      <div className="card divide-y divide-border">
        {rows.map(([k, v]) => (
          <p key={k} className="flex min-h-[56px] items-center justify-between gap-4 px-4 py-3">
            <span className="text-[15px] font-semibold">{k}</span><span className="text-right text-sm text-text-muted">{v}</span>
          </p>
        ))}
      </div>
      <a href={JIMBO_UI.showcase} target="_blank" rel="noreferrer" className="card flex items-center justify-between gap-3 p-4 hover:border-accent">
        <span><span className="eyebrow block">Showcase</span><span className="mt-0.5 block text-[15px] font-semibold">See this release in action</span></span>
        <span className="text-text-subtle">›</span>
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
        <p className="meta mt-1">The built-in one follows your colours. Upload an SVG, PNG or WebP under 1 MB to replace it.</p>
      </div>
      <div className="card flex items-center gap-4 p-4 sm:p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2">
          <img src={faviconUrl ?? (document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ?? "/favicon.svg")} alt="" className="h-10 w-10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-subtle">{faviconUrl ? "Custom upload" : "Built-in — recoloured from the theme"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <label className={`btn btn-sm btn-secondary cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
              {busy ? "Uploading…" : faviconUrl ? "Replace" : "Upload"}
              <input type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" className="sr-only"
                onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {faviconUrl && <button onClick={() => void remove()} className="btn btn-sm btn-ghost">Use built-in</button>}
          </div>
          {error && <p className="mt-2 text-sm text-highlight">{error}</p>}
        </div>
      </div>
    </section>
  );
}

