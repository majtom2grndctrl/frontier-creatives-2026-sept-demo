# Agent instructions — fluent/ (Frontier Creatives demo)

You're building a UI with Fluent UI React v9 for a live demo. This is already a working Vite 8 + React 19 + react-router 8 project.

- `src/router.tsx` — the route table; add pages as children of the root route
- `src/routes/` — `RootLayout` is the shell, `Home` is the prototype index, `ErrorBoundary` catches route errors
- `src/prototypes.ts` — the prototype list; add a screen here and it appears on the index and in the header nav
- `src/theme/AppThemeProvider.tsx` — `FluentProvider` plus the light/dark toggle, exposed through `useThemeMode()`
- `src/styles/breakpoints.ts` — shared media queries for the emotion wrapper components
- `src/features/publication/` — the publication dashboard; the fullest worked example of these conventions
- `CLAUDE.md` — the styling and accessibility rules for this project; read it before writing any component
- `agent-docs/component-map.md` — which component to reach for, and what each type, color and spacing step means
- `agent-docs/token-lookup.md` — how to map a hardcoded css value to the right design token
- `agent-docs/fluent-v9-notes.md` — token and component behaviour the api does not make obvious
- `tokens/tokens-src/`, `theme/theme-library/` — the real token values and how they compose into themes
- `component-specs/` — upstream design specs, each with a banner saying what in it still holds; the accessibility and keyboard sections are reliable, the prop tables are not

**The package is `@fluentui/react-components`, not `@fluentui/react`** — the latter is Fluent v8, a different library with a different API. Import components, `makeStyles` and `tokens` from `@fluentui/react-components`. Import icons individually from `@fluentui/react-icons` (`import { Home24Regular } from '@fluentui/react-icons'`); v9 has no name-registered `Icon` component and no `initializeIcons()`.

## Package manager

**Use `pnpm` for everything — installs, dev server, adding packages, running scripts. Do not use `npm` or `yarn`.**

First command in this folder should be `pnpm install` (no `node_modules` yet — see README.md).
