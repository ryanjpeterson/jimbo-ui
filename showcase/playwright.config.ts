/**
 * Screenshot checks: every style guide section at phone width in a light, a
 * mid and a dark look (tests/screens.spec.ts). The first run on a machine
 * writes the baselines (tests/__screens__, not committed: they depend on the
 * platform's fonts); later runs fail where a section's pixels changed, with a
 * diff in test-results/. Run on main first, then on your change.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 4471;

export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "tests/__screens__/{arg}{ext}",
  updateSnapshots: "missing",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  use: {
    ...devices["iPhone 13"],
    browserName: "chromium",
    viewport: { width: 375, height: 812 },
    baseURL: `http://localhost:${PORT}`,
    // Backdrops and motion stand still for reduced motion, so a screenshot is the same every time.
    reducedMotion: "reduce",
  },
  webServer: {
    command: `npm run assemble && npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
