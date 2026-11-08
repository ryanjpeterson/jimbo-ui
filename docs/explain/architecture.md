# Architecture

## Shape

    jimbo-ui repo
      foundation/ ──copy verbatim──► app
      starter/    ──copy once──────► app
      reference/  ──adapt──────────► app
      skills/jimbo-ui (rulebook, guide, SKILL.md) ──► Claude Code sessions in apps
      hooks/check-version.mjs ──► session start in an app: "you're behind"
      releases.json ──► each app's Updates tab (via GitHub)
      registry/apps.json + each app's jimbo-ui.json ──► scripts/inventory.mjs
      showcase/ = reference → foundation → starter → overrides

## Data flow

1. A pattern is tried in an app, brought back generic, added to the rulebook, guide and kit.
2. Release: CHANGELOG with Apps must, versions bumped, `releases.json` regenerated, tag.
3. Apps hear about it at session start and update in their own sessions; `jimbo-ui.json` records version and components.

## Where data lives

Git only. Nothing precious outside it.

## Jobs and schedules

None.

## Deploy

Releases: tag with `claude plugin tag .`, push when asked, rebuild the claude.ai zip, republish the showcase page. Apps pick up the plugin with `claude plugin marketplace update` and `plugin update`.
