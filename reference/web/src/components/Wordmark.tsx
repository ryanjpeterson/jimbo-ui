/**
 * The logo: a two-line wordmark in the display face — the main word in the
 * accent colour, outlined in the text colour (white on dark themes, near-black
 * on light), with a second line in the highlight. The words come from
 * BRAND.logo; an uploaded logo replaces the whole thing.
 *
 * jimbo-ui reference: an app with drawn lettering swaps the text for its own
 * SVG paths and keeps the colour rules.
 */

import { cn } from "@/lib/cn";
import { BRAND } from "@/lib/brand.config";
import { useBrand } from "@/lib/useBrand";

/** Rendered height in px. */
const heightMap = { sm: 40, md: 60, lg: 88, xl: 120 } as const;

export function Wordmark({ size = "md", className }: { size?: keyof typeof heightMap; className?: string }) {
  const { logoUrl } = useBrand();
  const h = heightMap[size];
  if (logoUrl) return <img src={logoUrl} alt={BRAND.name} className={cn("w-auto", className)} style={{ height: h }} />;
  return (
    <span role="img" aria-label={BRAND.name}
      className={cn("inline-flex select-none flex-col justify-center font-display leading-[0.9]", className)} style={{ height: h }}>
      <span aria-hidden="true" style={{
        fontSize: h * 0.52, fontWeight: 900, letterSpacing: "-0.02em", color: "rgb(var(--c-accent))",
        WebkitTextStroke: `${Math.max(1, h / 44)}px rgb(var(--c-text))`, paintOrder: "stroke fill",
      }}>
        {BRAND.logo.word}
      </span>
      <span aria-hidden="true" style={{ fontSize: h * 0.28, fontWeight: 800, color: "rgb(var(--c-highlight))" }}>
        {BRAND.logo.line}
      </span>
    </span>
  );
}
