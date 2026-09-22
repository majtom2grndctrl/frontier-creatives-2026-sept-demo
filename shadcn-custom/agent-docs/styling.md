# Styling & Customization

See [theming.md](theming.md) for theming, CSS variables, and adding custom colors.

## Contents

- Semantic colors
- Choosing a color
- The custom scales
- Choosing a step
- Status colors
- Type ramp
- Spacing ramp
- Radius
- Built-in variants first
- className for layout only
- No space-x-* / space-y-*
- Prefer size-* over w-* h-* when equal
- Prefer truncate shorthand
- No manual dark: color overrides
- Use cn() for conditional classes
- No manual z-index on overlay components
- Icons

---

## Semantic colors

**Incorrect:**

```tsx
<div className="bg-blue-500 text-white">
  <p className="text-gray-600">Secondary text</p>
</div>
```

**Correct:**

```tsx
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

For status and state indicators, use Badge variants or `text-destructive` rather than raw Tailwind colors. Success and warning have no semantic token; see [Status colors](#status-colors) below.

---

## Choosing a color

Three sources of color, in strict order of preference.

1. **Semantic tokens.** Most UI is neutral. `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-primary`, `border-border`. They carry meaning and flip with the theme.
2. **The custom scales** — `magenta`, `azure`, `gold` — when an element needs deliberate color: a brand accent, emphasis, categorical distinction, data visualization.
3. **Stock Tailwind palette colors for status only**, and only where no semantic token covers it. That is the single sanctioned exception.

---

## The custom scales

Three 11-step scales in the `--color-*` namespace: `magenta` (hue 328), `azure` (hue 237), `gold` (hue 85). Steps run `050 100 200 300 400 500 600 700 800 900 950` — note the leading zero on `050`. The utilities behave like any Tailwind color: `bg-magenta-500`, `text-azure-700`, `border-gold-300`.

**azure** — the default accent. Informational emphasis, links, selected and active states, info callouts. The coolest and most recessive of the three, so it tolerates repetition better than the others.

**magenta** — the loudest, and the highest chroma. Reserve it for one brand moment per screen: a primary call to action, the active navigation indicator, a headline metric. Repeating it across a screen makes the UI shout.

**gold** — the warm counterweight. "New" and "Beta" badges, highlights, pull quotes, non-critical attention. Use sparingly.

### Restraint

Most screens need zero or one accent scale. Two is a deliberate choice. Three is almost always wrong.

If a color is not carrying meaning, do not use one. Neutral is the default, not a fallback.

Never tint body copy. Reserve color for elements a reader needs to find.

These three scales carry brand, not status. Magenta does not mean error. Gold does not mean warning.

---

## Choosing a step

| Steps | Use |
| --- | --- |
| `050`–`200` | Backgrounds, tints, subtle fills |
| `300`–`400` | Borders, dividers, disabled states |
| `500` | Large text, icons, UI boundaries — passes 3:1, not 4.5:1 |
| `600`–`950` | Text on light backgrounds |
| `050`–`500` | Text on dark backgrounds |

On a light background use 600 or darker for body text. On a dark background use 500 or lighter.

At the 600 boundary on white, measured contrast is magenta 5.33:1, azure 4.74:1, gold 4.88:1. At the 500 boundary on the dark background it is magenta 5.01:1, azure 5.64:1, gold 5.47:1. All clear WCAG AA. Step 500 on white lands at 3.5–3.95:1 — fine for large text, icons, and borders, not for body copy.

An info callout, built from one scale:

```tsx
<div className="rounded-md border border-azure-200 bg-azure-050 p-s3">
  <p className="text-azure-800">Changes save automatically.</p>
</div>
```

---

## Status colors

Error and destructive actions use the `destructive` semantic token — `text-destructive`, `bg-destructive`. Prefer it; it exists and it flips with the theme.

Success has no semantic token. Use Tailwind's stock `green` scale. Warning has no semantic token. Use Tailwind's stock `amber` scale. Where an error message needs a full tint range — background, border, and text together — that the single `destructive` token cannot provide, Tailwind's stock `red` scale is acceptable.

```tsx
<div className="rounded-md border border-green-200 bg-green-50 p-s3">
  <p className="text-green-700">Deployment finished in 42s.</p>
</div>
```

Status is the only place stock Tailwind palette colors are correct. Everywhere else a stock palette color is a mistake — reach for `azure` instead.

**Incorrect:**

```tsx
<Badge className="bg-blue-500 text-white">Featured</Badge>
```

**Correct:**

```tsx
<Badge className="bg-azure-500 text-white">Featured</Badge>
```

---

## Type ramp

This project ships a 14-step type ramp: `text-t1` … `text-t14`. Base is 14.4px, each step ×1.25. Pick sizes from the ramp first. Tailwind's `text-sm` / `text-base` / `text-lg` are the fallback for what the ramp does not cover.

**Each step carries its own line height, and that line height is a spacing step.** `text-t1` is 14.4px on 20.00px of leading, which is `s4`. Set the size and the leading is already right — you do not need a `leading-*` class.

| Step | px | Line height | Use |
| --- | --- | --- | --- |
| `text-t1` | 14.40 | `s4` — 20.00 | Body copy, form labels, table cells. The default. |
| `text-t2` | 18.00 | `s5` — 24.99 | Lead paragraph, card titles |
| `text-t3` | 22.50 | `s6` — 31.24 | Subsection heading (h3) |
| `text-t4` | 28.12 | `s6` — 31.24 | Section heading (h2) |
| `text-t5` | 35.16 | `s7` — 39.05 | Page title (h1) |
| `text-t6`, `text-t7` | 43.95, 54.93 | `s8`, `s9` | Hero heading, large hero |
| `text-t8`, `text-t9` | 68.66, 85.83 | `s10`, `s11` | Display |
| `text-t10` … `text-t14` | 107.29, 134.11, 167.64, 209.55, 261.93 | `s12` … `s16` | Editorial display. Rare in application UI. |

Both series step by ×1.25, so the gap between a type step and its leading step *is* the ratio. `t1`–`t3` sit three steps up (1.389, reading leading); `t4` and above sit two (1.111, display leading). The break falls where text stops being read in paragraphs and starts being looked at.

To override, take the value from the spacing series too: `leading-s1` … `leading-s16` are the same numbers as `gap-s1` … `gap-s16`. `leading-s5` on a `text-t3` gives that step display leading instead of reading leading. Reach for it deliberately — `leading-none`, `leading-tight`, and the rest are unitless multipliers that sit outside the system.

```tsx
<h2 className="text-t4">Recent activity</h2>
<dd className="text-t3 leading-s5 tabular-nums">1,284</dd>
```

**The ramp starts at 14.4px and has nothing below it.** For text smaller than body — captions, helper text, badge labels, table meta — use `text-xs` (12px). That is the intended escape hatch, not a violation. Tailwind's `text-sm` is 14px, within half a pixel of `text-t1`, so it no longer reads as a step down; write `text-t1` when you mean body.

```tsx
<p className="text-t1">Total revenue across all channels.</p>
<span className="text-xs text-muted-foreground">Updated 2 minutes ago</span>
```

---

## Spacing ramp

**Non-typographic sizes come from the spacing series: margin, padding, gap, width, height, and radius.** Font sizes come from the type ramp.

Every spacing utility takes an `s` suffix: `p-s3`, `px-s2`, `py-s6`, `m-s4`, `mt-s2`, `gap-s4`, `space-y-s2`, `w-s10`, `h-s8`, `leading-s4`. The optical base is the font's cap height, 10.24px, and each step multiplies by ×1.25. Four sub-base steps carry the same series below it.

| Step | px | Use |
| --- | --- | --- |
| `s4xs` | 4.19 | Hairline insets, icon nudges |
| `s3xs` | 5.24 | Tightest gap between adjacent glyph-scale elements |
| `s2xs` | 6.55 | Badge and chip padding |
| `sxs` | 8.19 | Compact control padding, dense list gaps |
| `s1` | 10.24 | Tight gaps inside a component, icon to label |
| `s2` | 12.80 | Gap between related elements. The default. |
| `s3` | 16.00 | Card padding, grid gutter |
| `s4` | 20.00 | Gap between cards or list items |
| `s5` | 24.99 | Subsection spacing |
| `s6` | 31.24 | Section padding |
| `s7` | 39.05 | Gap between major sections |
| `s8` | 48.82 | Page section rhythm |
| `s9`, `s10` | 61.02, 76.28 | Large section breaks |
| `s11` … `s14` | 95.34, 119.18, 148.98, 186.22 | Hero and editorial whitespace |
| `s15`, `s16` | 232.77, 290.97 | Line height for `text-t13` and `text-t14`. Too large to pad with. |

The series runs downward instead of handing off to Tailwind because the ramp is geometric (×1.25) and Tailwind's numeric scale is linear (n × 0.25rem), so mixing the two breaks the rhythm.

**Tailwind's numeric spacing still works.** `p-4` and `gap-2` mean exactly what they always meant — the ramp does not shadow them. The 38 installed shadcn components use the numeric scale internally; leave them alone. Reach for a numeric value as a one-off micro-adjustment inside a component, never as the default for layout you write.

**Incorrect:**

```tsx
<Card className="p-5">
  <h3 className="text-lg font-semibold">Monthly report</h3>
</Card>
```

**Correct:**

```tsx
<Card className="p-s3">
  <h3 className="text-t2 font-semibold">Monthly report</h3>
  <p className="text-t1">Generated on the first of each month.</p>
</Card>

<section className="flex flex-col gap-s4 py-s6">
  <h2 className="text-t4">Recent activity</h2>
  <ActivityList />
</section>
```

---

## Radius

Radius rides the same series, so corners share the spacing rhythm. These are the standard Tailwind radius utilities.

| Utility | px | Spacing step | Token |
| --- | --- | --- | --- |
| `rounded-xs` | 8.19 | `sxs` | `--radius-xs` |
| `rounded-sm` | 10.24 | `s1` | `--radius-sm` |
| `rounded-md` | 12.80 | `s2` | `--radius-md` |
| `rounded-lg` | 16.00 | `s3` | `--radius-lg` |
| `rounded-xl` | 20.00 | `s4` | `--radius-xl` |

Use `rounded-sm` for badges and small controls, `rounded-md` for cards and inputs, `rounded-lg` for dialogs and popovers, `rounded-xl` for large surfaces. Never write an arbitrary radius like `rounded-[6px]`.

```tsx
<Card className="rounded-md p-s3">
  <Badge className="rounded-sm px-s2xs">Active</Badge>
</Card>
```

---

## Built-in variants first

Use `variant="outline"` rather than hand-composing `className="border border-input bg-transparent hover:bg-accent"`.

```tsx
<Button variant="outline">Click me</Button>
```

---

## className for layout only

Use `className` for layout (`max-w-md`, `mx-auto`, `mt-s2`), **not** for overriding component colors or typography — don't write `className="bg-blue-100 text-blue-900 font-bold"` on a `Card`.

```tsx
<Card className="max-w-md mx-auto">
  <CardContent>Dashboard</CardContent>
</Card>
```

To customize appearance, prefer in order: built-in variants (`variant="outline"`), semantic color tokens (`bg-primary`), then CSS variables in `src/app/globals.css`.

---

## No space-x-* / space-y-*

Use `gap-*` instead. `space-y-4` → `flex flex-col gap-s2`. `space-x-2` → `flex gap-s2`. Take gap values from the spacing ramp: `gap-s2` between related elements, `gap-s4` between cards or list items.

```tsx
<div className="flex flex-col gap-s2">
  <Input />
  <Input />
  <Button>Submit</Button>
</div>
```

---

## Prefer size-* over w-* h-* when equal

`size-10` not `w-10 h-10`. Applies to icons, avatars, skeletons, etc.

---

## Prefer truncate shorthand

`truncate` not `overflow-hidden text-ellipsis whitespace-nowrap`.

---

## No manual dark: color overrides

Use semantic tokens — they handle light/dark via CSS variables. `bg-background text-foreground` not `bg-white dark:bg-gray-950`.

---

## Use cn() for conditional classes

Use the `cn()` utility for conditional or merged class names instead of manual ternaries in a template string.

```tsx
import { cn } from "@/lib/utils"

<div className={cn("flex items-center", isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>
```

---

## No manual z-index on overlay components

`Dialog`, `Sheet`, `AlertDialog`, `DropdownMenu`, `Popover`, `Tooltip`, `HoverCard` handle their own stacking. Never add `z-50` or `z-[999]`.

---

## Icons

Use `lucide-react`, imported by name:

```tsx
import { Check } from "lucide-react"
```

Size icons with `size-4` (or `size-5`, etc.) and let them inherit `currentColor` rather than setting an explicit `fill` or `stroke`. Pass icons as children, not as props:

```tsx
<Button>
  <Check />
  Save
</Button>
```
