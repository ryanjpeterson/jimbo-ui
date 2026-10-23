/**
 * This app's brand settings — the only theme values that differ between apps
 * built on jimbo-ui. Owned by the app: jimbo-ui updates never overwrite it.
 */

import type { Theme } from "./theme";

export const BRAND = {
  /** The app's name: screen readers, the default theme's card on the Brand page. */
  name: "My app",
  /** The built-in wordmark: a main word (accent) over a second line (highlight). */
  logo: { word: "MY APP", line: "the second line" },
  /** The look before an admin changes anything. Keep src/styles/tokens.css in step (jimbo-ui: scripts/tokens.mjs). */
  defaultTheme: { accent: "#A8FF3E", highlight: "#FF3D6E", background: "#141416" } satisfies Theme,
  /** localStorage key prefix; index.html's pre-paint script reads `<prefix>.themeVars`. */
  storagePrefix: "myapp",
};
