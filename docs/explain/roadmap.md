# Roadmap

## Now

- **shadcn rebuild (Unreleased, breaking):** components on shadcn/ui, a flat look, binding rules and the PR route — waiting for a release.

## Next

- **Bring the apps up to date:** most registered apps are on 0.11.0–0.14.5 (the inventory lists them); each update is that app's own session (large overall).
- **Registry tidy:** add the apps that say they're registered but aren't listed, and drop entries for repos that no longer use jimbo-ui (small).

## Later

- 1.0.0 once breaking changes slow down.
- Vite 6 for the kit and apps.

## Ideas

- Publish the kit as a package instead of copies. Worth it if update sessions keep costing more than the copy model saves.

## Decided against

- **Logos per app** — the brand is the name as header text with an accent dot.
- **Gloss, glows and orbs** — flat shapes.
- **Frosted glass and shadows on components** — flat surfaces and hairlines since the shadcn update.
- **Apps adding their own shadcn components** — everything comes from jimbo.ui, by PR.
- **White or grey brand colours.**
- **App details in this repo** — each app's `jimbo-ui.json` is the record.
