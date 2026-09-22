# Agent instructions — shadcn-stock/

Next.js 15 + React 19 + Tailwind v4, running the stock shadcn/ui theme.

## Stock theme

This project uses shadcn/ui as it ships — `new-york` style, `neutral` base color, no custom design system layered on top. Build with the stock semantic tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `border-border`) and default Tailwind utilities. Don't hardcode hex/rgb values, and don't edit the token definitions in `src/app/globals.css` unless you're explicitly asked to change the theme.

## What's here

- `src/components/ui/` — 38 shadcn components (new-york style, Radix-based), ready to import: `@/components/ui/button`
- `src/lib/utils.ts` (`cn()`), `src/hooks/use-mobile.ts`, `src/components/theme-provider.tsx` — already wired in
- `src/app/page.tsx` — the prototype index; `src/lib/prototypes.ts` is its list. Add a screen there and it appears on the index.
- Each prototype is a whole site with its own chrome. `/publication` owns the dashboard shell (`AppShell` renders it only under that path); every other route renders bare.
- `agent-docs/styling.md` — semantic colors, spacing, sizing, `cn()`, icons
- `agent-docs/composition.md` — which component to reach for, and how they nest
- `agent-docs/theming.md` — how the token layer works
- `component-source/ui/` — 62 raw component sources, for anything not already installed
- `docs-site-content/` — a direct copy of the entire shadcn documentation site (329 files). Go here **only** when you need in-depth documentation that the files above don't cover, and read the specific page you need — don't search it broadly.

## Rules

**Use `pnpm`** for everything — installs, dev server, scripts. Not `npm`, not `yarn`.

**Don't run the `shadcn` CLI.** It calls out to `ui.shadcn.com`, which this network blocks. To add a component that isn't installed, copy it from `component-source/ui/` and fix the imports: swap `@/registry/new-york-v4/...` for `@/components/...`.

**Components are Radix-based.** This project does not use Base UI — no `render` prop, no `nativeButton`. Use `asChild` for composition.

```
pnpm dev
```
