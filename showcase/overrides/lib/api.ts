/**
 * Showcase stand-in for an app's API client. An app saves its theme and logo
 * uploads on its server; the showcase keeps them in this browser instead, so
 * the real Brand page works unchanged.
 */
import type { Theme } from "./theme";

type Saved = { theme?: Theme; logo?: string; favicon?: string };
const KEY = "jimbo-showcase.saved";

function read(): Saved {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Saved; } catch { return {}; }
}
function write(v: Saved): void {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage unavailable: changes last until reload */ }
}
const asDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result));
  r.onerror = () => reject(new Error("Couldn't read that file. Try another image."));
  r.readAsDataURL(file);
});

export const api = {
  async getTheme(): Promise<{ theme: Partial<Record<keyof Theme, string | null>>; logoUrl: string | null; faviconUrl: string | null }> {
    const s = read();
    return { theme: s.theme ?? {}, logoUrl: s.logo ?? null, faviconUrl: s.favicon ?? null };
  },
  async setTheme(theme: Theme): Promise<{ theme: Theme }> {
    write({ ...read(), theme });
    return { theme };
  },
  async resetTheme(): Promise<{ ok: true }> {
    const { theme: _drop, ...rest } = read();
    write(rest);
    return { ok: true };
  },
  async uploadBrandAsset(asset: "logo" | "favicon", file: File): Promise<{ ok: true }> {
    if (file.size > 1_000_000) throw new Error("That file is over 1 MB. Upload an SVG, PNG or WebP under 1 MB.");
    write({ ...read(), [asset]: await asDataUrl(file) });
    return { ok: true };
  },
  async removeBrandAsset(asset: "logo" | "favicon"): Promise<{ ok: true }> {
    const s = read();
    delete s[asset];
    write(s);
    return { ok: true };
  },
};
