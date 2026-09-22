# shadcn/ui — stock reference (new-york-v4 style)

Pulled from https://github.com/shadcn-ui/ui @ 683a5a9b370acdb7785a0529434e6a3b8c7e0441 (2026-08-26)
License: MIT

- `docs-site-content/` — full ui.shadcn.com docs (installation, theming, dark mode, component pages)
- `component-source/ui/` — actual component source (Radix primitives + Tailwind + cva variants) for every component, in shadcn's current default style (new-york-v4 — "default" style was deprecated upstream)
- `component-source/lib/` — utils.ts (cn() helper, etc.)

This is the vanilla baseline. `../shadcn-custom/` is where the designer-forward variant (custom type scale, spacing, radii — Tailwind defaults deliberately overridden) goes — Dan's building that one himself.

## agent-docs/

Agent-facing docs for this project, trimmed to what actually applies here:

- `agent-docs/styling.md` — semantic colors, spacing, sizing, `cn()`, icons
- `agent-docs/composition.md` — which component to reach for, and how they nest
- `agent-docs/theming.md` — how the token layer works

`AGENTS.md` at the root is the entry point — point your coding agent there.

## Runnable project (Next.js 15 + Tailwind v4 + shadcn "new-york")

This folder is now a real Next.js app, hand-scaffolded (not via `npx shadcn init` — that command calls out to `ui.shadcn.com` to resolve presets, which is blocked on this network; the CLI's component registry fetch is too, so `shadcn add` won't work here either). Everything below was built from the actual component source already sitting in `component-source/ui/`, so it's the same code the CLI would have given you.

**38 components pre-installed** in `src/components/ui/`: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, checkbox, collapsible, command, dialog, dropdown-menu, form, hover-card, input, label, navigation-menu, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.

Also wired up: `src/lib/utils.ts` (cn helper), `src/hooks/use-mobile.ts` (sidebar dep), `src/components/theme-provider.tsx` + `next-themes` (dark mode), sonner's `<Toaster />` mounted in the root layout, and `src/app/page.tsx` — the prototype index, listing every screen built here and linking to it.

Dependencies are installed (`pnpm install`, already run). `package.json` and `pnpm-lock.yaml` are pinned to exact working versions. If `pnpm` isn't on your PATH, `corepack enable && corepack prepare pnpm@latest --activate` gets it (corepack ships with Node, no npm-installed global needed).

```
cd shadcn-stock && pnpm dev
```

Not included on purpose (heavier deps, less likely to come up from an audience prompt): carousel (embla), chart (recharts), sidebar's drag-reorder friends, input-otp, drawer, resizable, context-menu, menubar. Easy to add later — the source for all of them is already sitting in `component-source/ui/` if you want to wire one in by hand (same import-path fix pattern: swap `@/registry/new-york-v4/...` for `@/components/...`).
