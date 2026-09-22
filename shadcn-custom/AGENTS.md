# Agent instructions — shadcn-custom/

Next.js 15 + React 19 + Tailwind v4, with a custom design system layered over shadcn/ui primitives.

## The design system comes first

The look and feel is defined up front, in two files:

- `src/app/globals.css` — design tokens (color, radius, type ramp, spacing ramp, grid) as CSS variables under `@theme inline` / `@theme`
- `src/app/layout.tsx` — loads Roboto Flex as the variable font

Typeface is Roboto Flex, a variable font with axes (`slnt`, `wdth`, `wght`, `GRAD`, `XOPQ`) set on `body` from `:root` tokens.

Type: `text-t1`…`text-t14`, 14.4px base, x1.25 per step. Each step carries its line height, and that line height is a spacing step — set the size and the leading is already right.

Spacing: 20 steps, x1.25 apart — `s4xs`, `s3xs`, `s2xs`, `sxs` below the optical (cap-height) base, then `s1`…`s16` above it — on every spacing property: `p-s3`, `gap-s2`, `m-s4`, `w-s10`, `h-s8`, `leading-s4`. Radius rides the same series: `rounded-xs` (8.19px) through `rounded-xl` (20.00px).

**Non-typographic sizes come from the spacing series: margin, padding, gap, width, height, radius, and line height. Font sizes come from the type ramp.** Tailwind's numeric scale is not redefined — `p-4` and `gap-2` still work and the installed components use them internally, but they are a one-off micro-adjustment inside a component, not the default for layout you write. Full tables: `agent-docs/styling.md`.

Color: three 11-step brand scales — `magenta` (hue 328, the loudest), `azure` (237, the default accent), `gold` (85, the warm one) — as `bg-azure-500`, `text-magenta-700`, `border-gold-300`, steps `050`…`950`. Semantic tokens come first; reach for a scale only when an element needs deliberate color, and hold a screen to one accent. Two is a deliberate choice, three is almost always wrong.

Status is the one exception to the no-palette-classes rule: `text-destructive` for errors, stock `green` for success, stock `amber` for warning. Everywhere else, `bg-azure-500`, never `bg-blue-500`. Full guidance: `agent-docs/styling.md`.

Layout: wrap a section in `grid-canvas` (19 columns), place content in `content-area` (17 live columns) or `bleed-area` (full width).

**Consume those tokens; don't redefine them.** Use `bg-primary`, `text-muted-foreground`, `rounded-lg`, `text-t*`, `p-s*`/`gap-s*`, `grid-canvas`/`content-area`/`bleed-area`. Never hardcode hex/rgb values, one-off pixel sizes, or Tailwind palette classes outside the status exception above. Don't edit the token definitions unless you're explicitly asked to change the theme. Full tables: `agent-docs/theming.md`.

## What's here

- `src/components/ui/` — 38 shadcn components (new-york style, Radix-based), ready to import: `@/components/ui/button`
- `src/lib/utils.ts` (`cn()`), `src/hooks/use-mobile.ts`, `src/components/theme-provider.tsx` — already wired in
- `src/app/page.tsx` — the prototype index; `src/lib/prototypes.ts` is its list. Add a screen there and it appears on the index.
- `agent-docs/styling.md` — color, spacing, sizing, `cn()`, icons
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
