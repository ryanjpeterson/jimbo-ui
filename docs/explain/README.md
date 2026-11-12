# jimbo-ui explained

jimbo.ui (repo and plugin `jimbo-ui`) is Ryan's shared brand and UI system for his web apps: a theme engine that turns two to four colours into a full palette, 324 looks in light, mid and dark, 79 backdrops, a UI kit and phone-first app shell, three app archetypes, a numbered rulebook, a registry of apps and shared components, and a Claude Code plugin that teaches sessions to start, audit, update and release. It's for Ryan and the Claude sessions building his apps. What it does best: every app looks and behaves like the same family, and an update says exactly what each app must change.

## At a glance

| | |
|-|-|
| What | Shared brand and UI system for Ryan's web apps, as code to copy and a Claude Code plugin |
| For | Just me (self), through Claude Code; apps' users see the result |
| Status | Active: 0.18.1 on 2026-11-11, 35 releases in 20 days |
| Runs at | Local only (plugin); showcase at http://localhost:4460 via Docker, and a private published page |
| Built with | TypeScript, React 19, shadcn/ui (Radix), Tailwind 4, Vite 5, Node scripts, Playwright |
| Leans on | GitHub (releases and each app's `jimbo-ui.json`), Google Fonts, Google Maps (MapView) |
| Started | 2026-10-23 |
| Docs checked | 2026-11-08 at 8477686 |

## The docs

- [Overview](overview.md): what it is, why it exists, what it isn't
- [Audience](audience.md): who it's for and what that rules out
- [Features](features.md): everything it does, and where
- [History](history.md): how it got here
- [Roadmap](roadmap.md): now, next, later, and what's off the table
- [Stack](stack.md): what it's built on and every dependency
- [Integrations](integrations.md): every outside system it talks to
- [Architecture](architecture.md): the parts, the data, the deploy
- [Decisions](decisions.md): the choices that shaped it
- [Health](health.md): risks, debt, chores and open questions
