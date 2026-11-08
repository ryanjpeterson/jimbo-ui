# Health

## Snapshot

Very active and central: every jimbo app with a UI depends on it. The cost is churn: 12 breaking minors in 17 days, and most apps are three or more minors behind. The one thing most worth doing next: slow the breaking releases and bring the apps up to 0.17.0.

## Risks

| Risk | Likelihood | What would soften it |
|-|-|-|
| Apps fall further behind with each breaking release | high | batch breaking changes; update apps in a sweep |
| Copied code drifts in apps | medium | `inventory.mjs` checks; verbatim foundation |
| App words leak into the repo | low | the scan before every commit |

## Tech debt

- The registry list and apps' `jimbo-ui.json` disagree (apps registered in their json but missing from `apps.json`; an entry for a repo that no longer has a UI).
- No CI; checks are run by hand.
- `guide.md` is 1,650 lines.

## Known issues

None tracked.

## Maintenance chores

- Each release: contrast, versions, validate, tag, zip, republish the showcase.
- Add a new app's words to the generic scan.

## Open questions

- When is it 1.0.0?
- Package instead of copies, as the app count grows?
