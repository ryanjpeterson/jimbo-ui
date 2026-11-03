/**
 * Each style guide section, in the first look that's written in each tone,
 * at 375 px. The look is saved the way the showcase saves one (in this
 * browser), so the page opens in it; the look stepper is paused.
 */
import { expect, test, type Page } from "@playwright/test";

const TONES = ["light", "mid", "dark"] as const;
const SECTIONS = ["brand", "controls", "forms", "overlays", "feedback", "data", "lists", "numbers", "states"] as const;
/** The shell's fixed bars (top bar, dock and its fade, the look stepper) would land mid-section in a long capture. */
const HIDE_SHELL = "header, main ~ *, [aria-label=Looks] { visibility: hidden !important; }";

/** Saves the first look written in `tone` (from the running app's own templates) and returns its name. */
async function useLook(page: Page, tone: (typeof TONES)[number]): Promise<string> {
  await page.goto("/");
  return page.evaluate(async (tone) => {
    const { ALL_FAMILIES } = await import(/* @vite-ignore */ "/.jimbo/lib/themes.ts");
    const f = ALL_FAMILIES.find((x: { authored: Record<string, unknown> }) => x.authored[tone])!;
    localStorage.setItem("jimbo-showcase.saved", JSON.stringify({ theme: f.authored[tone].theme }));
    return f.name as string;
  }, tone);
}

for (const tone of TONES) {
  test.describe(tone, () => {
    for (const section of SECTIONS) {
      test(section, async ({ page }) => {
        const look = await useLook(page, tone);
        test.info().annotations.push({ type: "look", description: look });
        // Only the hash changes, so reload for the page to open in the saved look.
        await page.goto(`/#/?section=${section}`);
        await page.reload();
        await page.getByRole("button", { name: "Pause looks" }).click();
        await page.addStyleTag({ content: HIDE_SHELL });
        await page.evaluate(() => document.fonts.ready);
        const kit = page.locator("#kit");
        await kit.scrollIntoViewIfNeeded();
        await expect(kit).toHaveScreenshot(`${tone}-${section}.png`);
      });
    }
  });
}
