# shadcn-custom — reserved

Same component primitives as `../shadcn-stock/`, but with a custom theme layer: type scale, spacing, radius/shadow/motion tokens — the stuff Tailwind's defaults flatten out. Dan's putting this together separately; nothing auto-pulled here.

## Runnable project — same 38 components, stock theme (for now)

Same scaffold as `../shadcn-stock/` (Next.js 15 + Tailwind v4, identical `src/components/ui/` set of 38 components, same `components.json`) copied over as your starting point. The visual theme in `src/app/globals.css` is still the stock neutral one — that's the part you said you'd build yourself (custom type scale, spacing, radius/shadow/motion). When you do, that file plus `src/app/layout.tsx`'s font setup are where it lands.

Same deal as shadcn-stock: no `node_modules` here (see that folder's README for why) — run:

```
cd shadcn-custom && pnpm install
```
