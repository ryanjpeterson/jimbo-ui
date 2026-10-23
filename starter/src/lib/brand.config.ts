/**
 * This app's brand settings — the only theme values that differ between apps
 * built on jimbo-ui. Owned by the app: jimbo-ui updates never overwrite it.
 */

import type { Theme } from "./theme";

export const BRAND = {
  /** The app's name — the header text in the top bar; a dot in it takes the accent ("jimbo.ui"). */
  name: "My app",
  /** The look before an admin changes anything. Keep src/styles/tokens.css in step (jimbo-ui: scripts/tokens.mjs). */
  defaultTheme: { accent: "#A8FF3E", highlight: "#FF3D6E", background: "#141416" } satisfies Theme,
  /** localStorage key prefix; index.html's pre-paint script reads `<prefix>.themeVars`. */
  storagePrefix: "myapp",
};
