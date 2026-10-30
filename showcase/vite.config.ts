import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";

const version = (JSON.parse(readFileSync(path.resolve(__dirname, "../.claude-plugin/plugin.json"), "utf8")) as { version: string }).version;

export default defineConfig({
  base: "./",
  define: {
    __JIMBO_VERSION__: JSON.stringify(version),
    // What an app passes from its jimbo-ui.json, for the config section's About tab.
    __JIMBO_APP__: JSON.stringify({ name: "showcase", version, auth: "none" }),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".jimbo"),
    },
  },
});
