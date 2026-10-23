#!/usr/bin/env bash
# Build dist/jimbo-ui-skill.zip for claude.ai (Settings → Capabilities → Skills).
# The zip holds the skill folder plus the foundation, starter and reference code
# and the changelog, so a chat has everything without the repo.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/jimbo-ui" "$root/dist"
cp -R "$root/skills/jimbo-ui/." "$tmp/jimbo-ui/"
cp -R "$root/foundation" "$root/starter" "$root/reference" "$root/scripts" "$root/CHANGELOG.md" "$tmp/jimbo-ui/"
rm -f "$root/dist/jimbo-ui-skill.zip"
(cd "$tmp" && zip -qr "$root/dist/jimbo-ui-skill.zip" jimbo-ui)
echo "Built dist/jimbo-ui-skill.zip ($(du -h "$root/dist/jimbo-ui-skill.zip" | cut -f1))"
