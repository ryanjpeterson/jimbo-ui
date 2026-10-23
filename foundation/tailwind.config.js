// Part of jimbo-ui (foundation — don't edit here; change jimbo-ui and update).
/** A theme token: `rgb(var(--c-name) / <alpha>)`. */
const tok = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
/** A brand colour and its derived tokens (see src/lib/theme.ts). */
const family = (name) => ({
  DEFAULT: tok(name),
  ...Object.fromEntries(["hover", "lighter", "light", "dark", "darker", "top", "bottom", "950", "900", "800", "700"].map((k) => [k, tok(`${name}-${k}`)])),
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Every colour is a theme token (CSS variable of "R G B" channels, set by
      // src/lib/theme.ts from the brand colours) so opacity modifiers like
      // bg-accent/15 keep working. Defaults: src/styles/globals.css.
      colors: {
        bg: tok("bg"),
        "bg-deep": tok("bg-deep"),
        surface: tok("surface"),
        "surface-2": tok("surface-2"),
        border: tok("border"),
        text: {
          base: tok("text"),
          muted: tok("text-muted"),
          subtle: tok("text-subtle"),
        },
        // accent / highlight / support: the theme's brand colours, each with hover,
        // shades (lighter … darker), a lit two-stop fill (top → bottom, for
        // bg-gradient-to-b) and washes mixed into the page (950 … 700):
        // bg-accent, text-highlight-light, from-support-top, bg-accent-950…
        accent: {
          ...family("accent"),
          // Legacy names from before 0.3 (lime = accent, pink = highlight); kept so older apps still build.
          lime:         tok("accent"),
          "lime-hover": tok("accent-hover"),
          pink:         tok("highlight"),
          "pink-hover": tok("highlight-hover"),
          cyan:         "#3DFFE8",
          "cyan-hover": "#70FFF0",
          orange:       "#FF8C3A",
        },
        highlight: family("highlight"),
        support: family("support"),
        // Text on an accent / highlight / support fill: dark or light, whichever reads.
        "on-accent": tok("on-accent"),
        "on-highlight": tok("on-highlight"),
        "on-support": tok("on-support"),
        // Legacy wash names (lime = accent, rose = highlight).
        lime: { 700: tok("accent-700"), 900: tok("accent-900"), 950: tok("accent-950") },
        rose: { 800: tok("highlight-800"), 900: tok("highlight-900"), 950: tok("highlight-950") },
        danger: "#FF5252",
      },
      fontFamily: {
        // Heavy grotesque for headings — set to weight 800 in globals.css.
        display: ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["'Caveat Brush'", "cursive"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        "2xl": "18px",
        xl: "14px",
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};
