# jimbo.ui

Ryan's shared brand and UI system for web apps (repo and plugin name:
`jimbo-ui`): a theme engine
that turns two to four colours into a full palette with shades, 237 looks — each in light, mid and dark — (everyday, holidays,
countries, provinces, sports teams and Zelda games), 21 backdrops, frosted glass and a circle motif, Tailwind tokens, a UI kit, a phone-first app shell with a
floating tab dock, maps in the theme, two app archetypes to copy, the
patterns that make the apps feel alike, and a **registry** of every app and
every UI element across them so nothing gets built twice. It's
generic on purpose: no app's code, names or artwork live here.

It is also a **Claude Code plugin**: the `jimbo-ui` skill teaches Claude the
rules and how to start, update and release.

**See it:** the [showcase](https://claude.ai/artifact/F4KAFYCkxZGZB7zKdaWjWC)
(private page) is a working demo built from the latest release's code — every
theme, component and pattern an app gets. Run it locally with
`npm --prefix showcase install && npm --prefix showcase run dev` (port 4455),
or with Docker:

```bash
docker compose up --build
```

(http://localhost:4460; `docker compose --profile dev up` for live reload on
4461). It opens on a carousel of looks — the kit in different themes, fonts
and backdrops — with Components, Archetypes and Settings tabs. It's also a
**playground**: design a theme in Settings → jimbo-ui config, then
*Share this look* exports a theme file to import into an app's config section, or
the `brand.config.ts` line and `tokens.css` to paste into the app.

## What's here

| Path | What |
| --- | --- |
| `skills/jimbo-ui/guide.md` | **The guide** — every rule, value and pattern |
| `skills/jimbo-ui/SKILL.md` | The skill: core rules + workflows |
| `foundation/` | Code copied verbatim into apps (never edited there) |
| `starter/` | Code copied once into a new app, then app-owned |
| `reference/` | Generic kit, shell, header text, maps, the jimbo-ui config section and the archetypes, adapted per app |
| `registry/` | Every app on jimbo-ui and every UI element across them |
| `scripts/inventory.mjs` | Registry report: component × app table, what to promote, raw colours, config-section checks |
| `showcase/` | Demo app built only from a release's code ([published](https://claude.ai/artifact/F4KAFYCkxZGZB7zKdaWjWC)) |
| `scripts/tokens.mjs` | Prints an app's `tokens.css` for its three colours |
| `scripts/contrast.mjs` | Contrast and colour-separation report for every template (`--check` for releases) |
| `scripts/versions.mjs` | Checks the plugin, foundation, skill and changelog versions agree |
| `hooks/` | Session-start check that tells an app when a newer jimbo.ui is out |
| `scripts/build-zip.sh` | Builds `dist/jimbo-ui-skill.zip` for claude.ai |
| `CHANGELOG.md` | Every version and what apps must do |

## Install the skill

Claude Code (once per machine):

```bash
claude plugin marketplace add ryanjpeterson/jimbo-ui
```

```bash
claude plugin install jimbo-ui@jimbo-ui
```

claude.ai: run `scripts/build-zip.sh` and upload `dist/jimbo-ui-skill.zip` in
Settings → Capabilities → Skills.

## The loop

1. **Change** the guide and code here (often after trying it in an app).
2. **Release:** changelog entry with "Apps must", bump the version in
   `.claude-plugin/plugin.json`, `marketplace.json`, `foundation/src/lib/jimbo.ts` and the skill's
   "This is jimbo.ui" line (`node scripts/versions.mjs`),
   `claude plugin validate .`, commit, `claude plugin tag .`,
   `git push --follow-tags`, and rebuild the claude.ai zip.
3. **Pick it up:** `claude plugin marketplace update jimbo-ui` and
   `claude plugin update jimbo-ui@jimbo-ui`.
4. **Hear about it:** a Claude Code session in an app whose `jimbo-ui.json`
   is behind says so at the start and lists what's new. You can also ask
   "are there new brand guidelines?".
5. **Preview, then update each app:** in the app, ask Claude "what would the
   latest jimbo-ui change here?" for a report that touches nothing. Then ask
   "update to the latest jimbo-ui": it reads the app's `jimbo-ui.json`, applies every changelog
   entry since that version, copies the foundation, ports reference changes,
   typechecks and commits.

6. **Register and consolidate:** in an app, "register this app with
   jimbo-ui" inventories its UI into the registry (changing no app code);
   "consolidate this app with jimbo-ui" swaps its own copies for the kit's
   and moves its brand and theme options into the jimbo-ui config section.

Ask Claude in this repo to "release a jimbo-ui change" and it follows the
skill's release workflow.
