/**
 * Admin brand & theme — /admin/brand
 *
 * Pick a look from the Everyday (dark, mid, light), Flags and Holidays templates (each card is
 * a miniature of the app in that theme), then fine-tune any of the four colours with the
 * inline picker.
 * Everything previews live across the app; the save bar appears when there's
 * something unsaved, and leaving the page without saving puts the saved
 * theme back. The favicon can be replaced with an upload.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { applyTheme, contrast, fullTheme, themeHex, type FullTheme, type Theme } from "@/lib/theme";
import { sameTheme, TEMPLATE_SETS } from "@/lib/themes";
import { BRAND } from "@/lib/brand.config";
import { useBrand } from "@/lib/useBrand";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ColorPicker";
import { PageHeader, Tabs } from "@/components/ui/kit";

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────

const same = sameTheme;

/** A miniature of the app in a theme: top bar with the app's name, a label, a card, buttons, a date, an avatar. */
function ThemeCard({ name, vibe, theme: input, selected, onPick }: { name: string; vibe: string; theme: Theme; selected: boolean; onPick: () => void }) {
  const theme = fullTheme(input);
  const c = themeHex(theme);
  return (
    <button type="button" onClick={onPick} aria-pressed={selected}
      className={`group block w-full overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97] ${selected ? "ring-[3px] ring-offset-2 ring-offset-bg" : "ring-1 ring-border hover:ring-text-subtle"}`}
      style={selected ? { ["--tw-ring-color" as string]: theme.accent } : undefined}>
      <div className="space-y-2.5 p-3" style={{ background: theme.background, color: c.text }}>
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] leading-none tracking-[-0.02em]" style={{ color: c.text }}>
            {BRAND.name.split(".").map((part, i) => (
              <Fragment key={i}>{i > 0 && <span style={{ color: theme.accent }}>.</span>}{part}</Fragment>
            ))}
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: theme.support, color: c["on-support"] }}>A</span>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.support }}>Coming up</p>
        <div className="rounded-lg p-2" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2">
            <span className="w-6 text-center leading-none">
              <span className="block text-[7px] font-bold" style={{ color: theme.highlight }}>JUL</span>
              <span className="block font-display text-sm">12</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block h-1.5 w-4/5 rounded-full" style={{ background: c.text }} />
              <span className="mt-1 block h-1.5 w-1/2 rounded-full" style={{ background: c["text-subtle"] }} />
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded-full px-2.5 py-1 text-[9px] font-bold" style={{ background: theme.accent, color: c["on-accent"] }}>Save</span>
          <span className="rounded-full px-2.5 py-1 text-[9px] font-bold" style={{ background: c["surface-2"], color: c.text }}>Cancel</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-3 py-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{name}</span>
          <span className="block truncate text-[11px] text-text-subtle">{vibe}</span>
        </span>
        {selected && <span className="shrink-0 text-xs font-bold text-accent">✓</span>}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const FIELDS: { key: keyof FullTheme; label: string; short?: string; hint: string; swatches: string[] }[] = [
  { key: "accent", label: "Accent", hint: "Buttons, active tabs, “done” states, big numbers, the dot in the name",
    swatches: ["#A8FF3E", "#2EF2FF", "#F5FF2E", "#FF8A3D", "#B48CFF", "#3DFFC5", "#F2F2F2", "#1F7A4D"] },
  { key: "highlight", label: "Highlight", hint: "Dates, badges, map pins, warnings",
    swatches: ["#FF3D6E", "#FF2ED1", "#FF5A1F", "#FF3D3D", "#FF7A59", "#FF5FA2", "#1E4FD7", "#FFC23D"] },
  { key: "support", label: "Support", hint: "Page labels, avatars, third place — the third voice",
    swatches: ["#2EC5FF", "#FFE53D", "#B98CFF", "#3DDCC8", "#5CF2B8", "#8CFF4F", "#1D4ED8", "#0F766E"] },
  { key: "background", label: "Background", short: "Page", hint: "The page — cards, borders and text follow it",
    swatches: ["#141416", "#000000", "#0A0A12", "#1A0F1F", "#071A1F", "#17110D", "#F6F4EF", "#F3EAD6"] },
];

export function BrandPage() {
  const qc = useQueryClient();
  const brand = useBrand();
  const [draft, setDraft] = useState<FullTheme>(fullTheme(brand.theme));
  const [editing, setEditing] = useState<keyof FullTheme>("accent");
  const [set, setSet] = useState(() => TEMPLATE_SETS.find((s) => s.groups.some((g) => g.templates.some((x) => same(x.theme, brand.theme))))?.label ?? TEMPLATE_SETS[0]!.label);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const dirty = !same(draft, brand.theme);

  // Live preview while editing; leaving the page puts the saved theme back.
  useEffect(() => { applyTheme(draft); }, [draft]);
  const saved = useRef(brand.theme);
  saved.current = brand.theme;
  useEffect(() => () => applyTheme(saved.current), []);

  const refresh = () => qc.invalidateQueries({ queryKey: ["brand"] });
  const save = async () => {
    setSaving(true);
    setNote(null);
    try {
      await api.setTheme(draft);
      await refresh();
      setNote("Saved — everyone sees the new look.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  // Readability (WCAG): body text 4.5:1; accent / highlight 3:1 on the page; text on buttons 4.5:1.
  const hex = themeHex(draft);
  const warnings = [
    contrast(hex.text!, draft.background) < 4.5 && "Body text is hard to read on this background.",
    contrast(draft.accent, draft.background) < 3 && "The accent blends into the background.",
    contrast(draft.highlight, draft.background) < 3 && "The highlight blends into the background.",
    contrast(draft.support, hex.surface!) < 4.5 && "Support text is hard to read on cards.",
    contrast(hex["on-accent"]!, draft.accent) < 4.5 && "Button text is hard to read on the accent.",
  ].filter((w): w is string => !!w);

  const field = FIELDS.find((f) => f.key === editing)!;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <PageHeader eyebrow="Admin" title="Brand & theme" />

      {/* 1. Templates */}
      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="h-section">Pick a look</h2>
          <p className="meta mt-1">Tap one to try it — the whole app changes. Nothing's saved until you say so.</p>
        </div>
        <Tabs value={set} onChange={setSet} options={TEMPLATE_SETS.map((s) => ({ value: s.label, label: s.label }))} />
        {TEMPLATE_SETS.find((s) => s.label === set)!.groups.map((g) => (
          <div key={g.label} className="space-y-2 pt-1">
            {g.label !== set && <p className="eyebrow px-0.5">{g.label}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {g.templates.map((tpl) => (
                <ThemeCard key={tpl.name} {...tpl} selected={same(draft, tpl.theme)} onPick={() => setDraft(fullTheme(tpl.theme))} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 2. Fine-tune */}
      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="h-section">Make it yours</h2>
          <p className="meta mt-1">Pick a colour to change, then drag.</p>
        </div>
        <div className="card space-y-5 p-4 sm:p-5">
          <div className="grid grid-cols-4 gap-2" role="tablist">
            {FIELDS.map((f) => {
              const active = f.key === editing;
              return (
                <button key={f.key} type="button" role="tab" aria-selected={active} onClick={() => setEditing(f.key)}
                  className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border p-2 transition-colors ${active ? "border-text-base bg-surface-2" : "border-border hover:border-text-subtle"}`}>
                  <span className="h-10 w-10 rounded-full border-2 border-black/30 shadow-inner sm:h-12 sm:w-12" style={{ background: draft[f.key] }} />
                  <span className="max-w-full truncate text-xs font-semibold">
                    {f.short ? <><span className="sm:hidden">{f.short}</span><span className="hidden sm:inline">{f.label}</span></> : f.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-text-muted">{field.hint}</p>
          <ColorPicker
            value={draft[editing]}
            swatches={field.swatches}
            onChange={(hexValue) => setDraft((d) => ({ ...d, [editing]: hexValue }))}
          />
          {warnings.length > 0 && (
            <div className="rounded-xl bg-highlight-950 px-3 py-2 text-sm text-highlight">
              {warnings.map((w) => <p key={w}>! {w}</p>)}
            </div>
          )}
        </div>
      </section>

      <FaviconUpload faviconUrl={brand.faviconUrl} onChange={refresh} />

      <Link to="/admin/style" className="card flex items-center justify-between gap-3 p-4 hover:border-accent">
        <span>
          <span className="eyebrow block">Reference</span>
          <span className="mt-0.5 block text-[15px] font-semibold">Style guide — every component in these colours</span>
        </span>
        <span className="text-text-subtle">›</span>
      </Link>

      {/* Save bar — floats above the tab bar while there's something unsaved */}
      {(dirty || note) && (
        <div className="fixed inset-x-0 z-40 flex justify-center px-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] sm:bottom-6">
          <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-surface/95 p-2 pl-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{dirty ? "Unsaved look" : note}</p>
            {dirty ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setDraft(fullTheme(brand.theme))}>Undo</Button>
                <Button size="sm" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save"}</Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setNote(null)}>OK</Button>
            )}
          </div>
        </div>
      )}
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
