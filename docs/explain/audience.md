# Audience

## Who it's for

Self: Ryan, and the Claude Code sessions building and updating his apps. The people who see the result are each app's users.

## How they use it

- "Start an app with jimbo-ui", "update this app to the latest jimbo-ui", "audit this app", "add this to the registry".
- A session in an app hears at start when a newer release is out (`hooks/check-version.mjs`).
- The showcase, to try themes and export them.

## Access and accounts

The GitHub repo is public; the plugin installs from it. The showcase's published page is private. No accounts.

## What that means for decisions

- Rules can be opinionated (one person's taste); no theming API for strangers.
- Breaking changes are fine as long as the Apps must list is exact.
