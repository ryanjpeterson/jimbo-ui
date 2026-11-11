# Stack

## Summary

TypeScript and React 19 source copied into apps, on shadcn/ui (Radix) primitives; Tailwind 4 theme and token mapping in CSS; Node scripts with no dependencies; a Vite 5 showcase with Playwright screen tests; Markdown rules.

## Runtime and hosting

Nothing runs in production from here. The showcase runs locally (Vite on 4455, Docker on 4460 / 4461) and is published as a private page each release.

## Languages and frameworks

| What | Version | Used for |
|-|-|-|
| TypeScript | 5.6 | foundation, reference, showcase |
| React | 19 | kit and shell |
| shadcn/ui | CLI 4.23 (components copied into foundation) | primitives |
| Tailwind CSS | 4.3 | theme and styling |
| Vite | 5.4 | showcase |
| Node | 22 | scripts, hook |
| Playwright | 1.64 | screen tests |

## Data and storage

Files only: `registry/*.json`, `releases.json` (generated), the templates in `themes.ts`.

## Dependencies

### `showcase/package.json` (what apps also need)

| Package | Version | Why it's here |
|-|-|-|
| react, react-dom | ^19.2 | UI |
| radix-ui | ^1.8.1 | shadcn primitives |
| class-variance-authority | ^0.7.1 | primitive variants |
| lucide-react | ^1.72.0 | icons |
| cmdk, vaul, sonner | ^1.1.1, ^1.1.2, ^2.0.8 | command list, phone sheet, toasts |
| tw-animate-css | ^1.4.0 | primitives' enter/leave animations |
| react-router-dom | ^6.28.0 | routes and URL state |
| @tanstack/react-query | ^5.62.0 | data in the shell and config section |
| clsx, tailwind-merge | ^2.1.1, ^3.7.0 | `cn` |
| @vis.gl/react-google-maps | ^1.8.3 | MapView |
| tailwindcss, @tailwindcss/vite | ^4.3.4 | CSS |
| vite, @vitejs/plugin-react | ^5.4.11, ^4.3.4 | build |
| @playwright/test | ^1.64.1 | screen tests |
| typescript, @types/react* | ^5.6.3 | types |

## Tooling

`npm --prefix showcase run dev | typecheck | build | test:screens`; `node scripts/contrast.mjs --check`; `node scripts/versions.mjs [--next]`; `node scripts/releases.mjs`; `node scripts/inventory.mjs [--json]`; `claude plugin validate --strict .`; `claude plugin tag .`. No CI.

## Upgrade watch

Vite 6 and React Router 7 would be a breaking release for every app. React 19 arrived with the shadcn update.
