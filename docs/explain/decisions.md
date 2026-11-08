# Decisions

## Log

### 2026-11-08 — A numbered rulebook decides

- **Decision:** every rule numbered in nine groups; the guide explains, the rulebook wins.
- **Why:** audits and updates can cite rules ("breaks K3").
- **Alternatives:** the guide alone.
- **Consequences:** new rules take the next number; numbers never reused.

### 2026-11-03 — Tailwind 4

- **Decision:** the theme in CSS via `@tailwindcss/vite`; no config files.
- **Why:** current Tailwind; tokens in one place.
- **Alternatives:** stay on 3.
- **Consequences:** a breaking update for every app.

### 2026-11-02 — App details live in each app

- **Decision:** `registry/apps.json` holds names and repos only; everything else is the app's `jimbo-ui.json`.
- **Why:** no drift between two records; keeps this repo generic.
- **Alternatives:** a central registry of everything.
- **Consequences:** the inventory reads apps from GitHub.

### 2026-11-02 — The version number says what an update takes

- **Decision:** breaking = 0.MINOR, drop-in = 0.x.PATCH.
- **Why:** apps can tell from the number how big an update is.
- **Consequences:** many minors while the system is young.

### 2026-10-23 — Copy code, don't publish a package

- **Decision:** foundation copied verbatim, starter once, reference adapted.
- **Why:** apps can bend the reference; no package publishing.
- **Alternatives:** an npm package.
- **Consequences:** every update is a session in each app.
