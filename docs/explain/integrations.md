# Integrations

## Summary

Four outside systems, none needed at runtime by the repo itself.

## Services

| Name | Kind | What for | Direction | Required | Auth |
|-|-|-|-|-|-|
| GitHub | service | the plugin source, releases read by apps' Updates tab, each app's pushed `jimbo-ui.json` for the inventory | both | yes | `gh` login |
| Google Fonts | service | fonts picked in an app's Type tab | read | no | none |
| Google Maps | service | `MapView` in apps that use it | read | no | each app's key |
| claude.ai artifacts | service | the published showcase page | write | no | Ryan's account |

## jimbo standards

It is one: jimbo-ui 0.17.0. Seven apps are registered; jimbo-notify builds on it; jimbo-explain 0.1.0 documents it.

## Secrets and config

None.

## When one is down

GitHub down: apps can't check for updates; the inventory can't read apps. Nothing else depends on it.
