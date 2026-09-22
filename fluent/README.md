# Fluent — Microsoft Fluent UI React v9 demo

A Vite + React app built on Fluent UI React v9, one of four demo projects alongside `../shadcn-stock/`, `../shadcn-custom/` and `../polaris/`. `src/routes/Home.tsx` is the prototype index: it lists every screen built here and links to it.

The package is `@fluentui/react-components`. `@fluentui/react` is Fluent v8, a different library with a different API.

## Running it

```
pnpm install
pnpm dev
```

`node_modules` is not checked in — the connected-folder bridge is slow across that many small files, so install locally instead. Also available: `pnpm build`, `pnpm preview`, `pnpm typecheck`.

## The app

- `src/router.tsx` — the route table; add pages as children of the root route
- `src/routes/` — `RootLayout` (the shell), `Home` (the prototype index), `ErrorBoundary`
- `src/prototypes.ts` — the prototype list the index and the header nav both read
- `src/theme/AppThemeProvider.tsx` — `FluentProvider` and the light/dark toggle
- `src/styles/breakpoints.ts` — media queries for responsive wrappers
- `src/features/publication/` — the publication dashboard, built from a spec; the fullest worked example of these conventions
- `src/features/profile/` — the developer profile, built from a spec

Each prototype brings its own chrome and sits outside `RootLayout` rather than wearing this app's header.

Styling follows `CLAUDE.md`: griffel `makeStyles` by default, `@emotion/react` only for wrapper components that need responsive layout. Emotion is confined to the layout shells and the global body reset; components style with griffel. Fluent tokens are css custom properties, so `tokens.*` works in both.

## Reference docs

Pulled from https://github.com/microsoft/fluentui @ 25b0646fa18bb93e2d7ed052379b852a1f45d8f4 (2026-08-27). License: MIT, see the upstream repo.

- `component-specs/` — per-component specs from the Fabric to v9 convergence. These are pre-implementation RFCs, so each carries a banner marking what still holds: the accessibility, ARIA and keyboard sections are reliable, the prop tables and composition examples are not.
- `tokens/tokens-src/` — `@fluentui/tokens` source: the real color, spacing, typography, radius, shadow and motion values
- `theme/theme-library/` — `@fluentui/react-theme` source: how tokens compose into the light, dark and high-contrast themes

`agent-docs/` holds what this project learned rather than what upstream ships. `component-map.md` says which component to reach for and what each ramp step means, `token-lookup.md` maps a hardcoded css value to the right token, and `fluent-v9-notes.md` records behaviour the api does not make obvious.

Fluent's own `AGENTS.md` and its component-scaffolding skills are about contributing to the fluentui monorepo — Nx targets, Beachball change files, stacked PRs — so they are not included. Neither is a spec for `Pills`: that component never shipped in v9, and `Tag`/`TagGroup` covers the use case.

There is no public design-guideline repo for Fluent 2 — that content lives on fluent2.microsoft.design rather than in git. The specs and token source above are the closest portable equivalent.
