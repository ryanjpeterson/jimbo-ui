# jimbo-ui

Ryan's shared brand and UI system for web apps: a three-colour theme engine
with 25 templates, Tailwind tokens, a UI kit, a phone-first app shell with a
floating tab dock, and the patterns that make the apps feel alike. It grew out
of [Tinnitus A Go Go](https://github.com/ryanjpeterson/tinnitus-a-go-go).

It is also a **Claude Code plugin**: the `jimbo-ui` skill teaches Claude the
rules and how to start, update and release.

## What's here

| Path | What |
| --- | --- |
| `skills/jimbo-ui/guide.md` | **The guide** — every rule, value and pattern |
| `skills/jimbo-ui/SKILL.md` | The skill: core rules + workflows |
| `foundation/` | Code copied verbatim into apps (never edited there) |
| `starter/` | Code copied once into a new app, then app-owned |
| `reference/` | Tinnitus's implementations, adapted per app |
| `scripts/tokens.mjs` | Prints an app's `tokens.css` for its three colours |
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
   `.claude-plugin/plugin.json` and `marketplace.json`,
   `claude plugin validate .`, commit, `claude plugin tag .`,
   `git push --follow-tags`, and rebuild the claude.ai zip.
3. **Pick it up:** `claude plugin marketplace update jimbo-ui` and
   `claude plugin update jimbo-ui@jimbo-ui`.
4. **Update each app:** in the app, ask Claude to "update to the latest
   jimbo-ui". It reads the app's `jimbo-ui.json`, applies every changelog
   entry since that version, copies the foundation, ports reference changes,
   typechecks and commits.

Ask Claude in this repo to "release a jimbo-ui change" and it follows the
skill's release workflow.
