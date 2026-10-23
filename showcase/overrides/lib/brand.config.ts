/** The showcase's brand settings (an app's own copy of this file is app-owned). */
import type { Theme } from "./theme";

export const BRAND = {
  name: "jimbo.ui",
  defaultTheme: { accent: "#A8FF3E", highlight: "#FF3D6E", background: "#141416", support: "#2EC5FF" } satisfies Theme,
  storagePrefix: "jimbo-showcase",
};
