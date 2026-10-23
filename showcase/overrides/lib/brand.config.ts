/** The showcase's brand settings (an app's own copy of this file is app-owned). */
import type { Theme } from "./theme";

export const BRAND = {
  name: "jimbo-ui",
  logo: { word: "JIMBO", line: "ui showcase" },
  defaultTheme: { accent: "#A8FF3E", highlight: "#FF3D6E", background: "#141416" } satisfies Theme,
  storagePrefix: "jimbo-showcase",
};
