# jimbo.ui

Ryan's shared brand and UI system for web apps (repo and plugin name:
`jimbo-ui`): a theme engine with up
to four colours and 47 templates (everyday, flags and holidays), Tailwind tokens, a UI kit, a phone-first app shell with a
floating tab dock, and the patterns that make the apps feel alike. It's
generic on purpose: no app's code, names or artwork live here.

It is also a **Claude Code plugin**: the `jimbo-ui` skill teaches Claude the
rules and how to start, update and release.

**See it:** the [showcase](https://claude.ai/artifact/F4KAFYCkxZGZB7zKdaWjWC)
(private page) is a working demo built from the latest release's code — every
theme, component and pattern an app gets. Run it locally with
`npm --prefix showcase install && npm --prefix showcase run dev` (port 4455).

## What's here

| Path | What |
| --- | --- |
| `skills/jimbo-ui/guide.md` | **The guide** — every rule, value and pattern |
| `skills/jimbo-ui/SKILL.md` | The skill: core rules + workflows |
| `foundation/` | Code copied verbatim into apps (never edited there) |
| `starter/` | Code copied once into a new app, then app-owned |
| `reference/` | Generic kit, shell, header text and admin pages, adapted per app |
| `showcase/` | Demo app built only from a release's code ([published](https://claude.ai/artifact/F4KAFYCkxZGZB7zKdaWjWC)) |
| `scripts/tokens.mjs` | Prints an app's `tokens.css` for its three colours |
| `scripts/contrast.mjs` | Contrast and colour-separation report for every template (`--check` for releases) |
| `scripts/versions.mjs` | Checks the plugin, skill and changelog versions agree |
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
   `.claude-plugin/plugin.json`, `marketplace.json` and the skill's
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

Ask Claude in this repo to "release a jimbo-ui change" and it follows the
skill's release workflow.
