# Theming

## Where the theme lives

- `src/app/globals.css` — every design token: color, radius, the type ramp, the spacing ramp, and the grid scale.
- `src/app/layout.tsx` — loads the Roboto Flex variable font.

There is no `tailwind.config.js`. This project uses Tailwind v4's CSS-first theming: tokens are plain CSS custom properties, registered with Tailwind via `@theme inline` (colors) and `@theme` (the type ramp, the spacing ramp, and radius).

See every token rendered together at `/styleguide` (`src/app/styleguide/page.tsx`) — the grid, the full type ramp, and the full spacing ramp.

## Consume tokens, don't invent them

Use the existing utilities: `bg-primary`, `text-muted-foreground`, `rounded-md`, `border-border`, `text-t1`…`text-t14`, `p-s4xs`…`p-s14` (and `gap-s*`, `m-s*`, `w-s*`, etc.), `grid-canvas`, `content-area`, `bleed-area`. The three brand scales — `magenta`, `azure`, `gold` — cover deliberate color: `bg-azure-500`, `text-magenta-700`. Never hardcode a hex/rgb value, a raw Tailwind palette class like `bg-blue-500`/`text-gray-600`, or a one-off pixel/rem size — every color, size, and layout a component needs already has a token or utility. Status colors are the one exception, and [styling.md](styling.md) sets out the rule.

Do not edit the token definitions in `globals.css` unless explicitly asked to change the theme. The palette, radius, type ramp, spacing ramp, and grid values are a fixed design system input, not something to adjust while building a feature.

## How It Works

CSS variables are defined once in `:root` (light) and `.dark` (dark mode) in `globals.css`. The `@theme inline` block maps each one to a Tailwind utility — `--color-primary: var(--primary)` powers `bg-primary` / `text-primary`. Components use these utilities, so changing a variable changes every component that references it.

## Color Variables

Every color follows the `name` / `name-foreground` convention: the base variable is for backgrounds, `-foreground` is for text/icons on that background.

| Variable                                     | Purpose                          |
| --------------------------------------------- | --------------------------------- |
| `--background` / `--foreground`              | Page background and default text |
| `--card` / `--card-foreground`               | Card surfaces                    |
| `--popover` / `--popover-foreground`         | Popover/dropdown surfaces        |
| `--primary` / `--primary-foreground`         | Primary buttons and actions      |
| `--secondary` / `--secondary-foreground`     | Secondary actions                |
| `--muted` / `--muted-foreground`             | Muted/disabled states            |
| `--accent` / `--accent-foreground`           | Hover and accent states          |
| `--destructive` / `--destructive-foreground` | Error and destructive actions    |
| `--border`, `--input`, `--ring`              | Borders, input borders, focus ring |
| `--chart-1` through `--chart-5`              | Chart/data visualization         |
| `--sidebar` / `--sidebar-foreground`         | Sidebar surface                  |
| `--sidebar-primary`/`-foreground`, `--sidebar-accent`/`-foreground` | Sidebar actions and hover state |
| `--sidebar-border`, `--sidebar-ring`         | Sidebar border and focus ring    |

Colors use OKLCH: `--primary: oklch(0% 0 0)`, where values are lightness (0–1), chroma (0 = gray), and hue (0–360).

## Dark Mode

Class-based toggle via `.dark` on the root element, driven by `next-themes`. The provider lives in `src/components/theme-provider.tsx` and wraps the app in `src/app/layout.tsx`:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>
```

Every semantic variable has a light value in `:root` and a dark override in `.dark`. Components never branch on theme. They use the token utilities; the variable swap does the rest.

## Palette Scales

Three 11-step scales sit directly in the `@theme` block as `--color-*` variables, so Tailwind generates the utilities: `bg-magenta-500`, `text-azure-700`, `border-gold-300`.

| Scale     | Hue | Character                                  |
| --------- | --- | ------------------------------------------ |
| `magenta` | 328 | Highest chroma of the three; loudest        |
| `azure`   | 237 | Cool and recessive                          |
| `gold`    | 85  | Warm                                        |

Each scale carries the same 11 steps, sharing one lightness ramp. Note the leading zero on `050`.

| Step  | Lightness |
| ----- | --------- |
| `050` | 0.971     |
| `100` | 0.936     |
| `200` | 0.874     |
| `300` | 0.795     |
| `400` | 0.706     |
| `500` | 0.624     |
| `600` | 0.551     |
| `700` | 0.472     |
| `800` | 0.395     |
| `900` | 0.317     |
| `950` | 0.223     |

Chroma arcs from near-neutral at the ends to a peak in the middle, then is pulled back per step to the most saturated value that still lands inside sRGB. Azure and gold run out of gamut earlier than magenta, so their peaks sit lower.

These are raw palettes, not semantic tokens. They are defined once, in `@theme`, with no `:root` / `.dark` pair and no dark-mode override — `bg-azure-500` is the same color in both themes. Pick the step that suits the surface instead: dark steps on light backgrounds, light steps on dark ones.

See [styling.md](styling.md) for which scale to reach for, how much color a screen can carry, and which steps pass contrast.


## Adding Custom Colors

Add new variables to `src/app/globals.css`. Never create a new CSS file for this.

```css
/* 1. Define in :root and .dark. */
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

/* 2. Register in the existing @theme inline block. */
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

```tsx
// 3. Use in components.
<div className="bg-warning text-warning-foreground">Warning</div>
```

## Border Radius

Radius is drawn from the spacing series, so corners share the layout rhythm. The five `--radius-*` tokens in the `@theme` block sit on five consecutive steps starting at `sxs`, and drive the standard Tailwind radius utilities.

| Utility      | Token          | Spacing step | px    |
| ------------ | -------------- | ------------ | ----- |
| `rounded-xs` | `--radius-xs`  | `sxs`        | 10.24 |
| `rounded-sm` | `--radius-sm`  | `s1`         | 12.80 |
| `rounded-md` | `--radius-md`  | `s2`         | 16.00 |
| `rounded-lg` | `--radius-lg`  | `s3`         | 20.00 |
| `rounded-xl` | `--radius-xl`  | `s4`         | 24.99 |

The family sits three steps up the series from the sub-base steps it used to occupy. On a ×1.25 ratio three steps is ×1.953 — the nearest the scale comes to doubling, which is the point: the corners get noticeably rounder without leaving the series.

`:root` also defines `--radius: var(--spacing-s3)` (16.00px), tracking `--radius-lg`. `src/components/ui/sonner.tsx` reads it directly, so keep it.

Use the utilities rather than arbitrary values: `rounded-sm` for badges and small controls, `rounded-md` for cards and inputs, `rounded-lg` for dialogs and popovers, `rounded-xl` for large surfaces.

## Typeface

Roboto Flex, loaded as a variable font in `src/app/layout.tsx` via `next/font/google`, exposed as the `--font-roboto-flex` CSS variable and mapped to `--font-sans` in the `@theme inline` block. `body` sets its variation axes from `:root` variables:

| Axis  | Variable       | Value |
| ----- | -------------- | ----- |
| slnt  | `--font-slnt`  | 0     |
| wdth  | `--font-wdth`  | 111   |
| wght  | `--font-wght`  | 460   |
| GRAD  | `--font-GRAD`  | 0     |
| XOPQ  | `--font-XOPQ`  | 91    |

Change the typeface's look by editing these `:root` values — never hardcode a `font-variation-settings` or `font-weight` on a component.

## Type Ramp

14 steps in the `--text-*` namespace, so the utilities are `text-t1` through `text-t14`. Base is `--type-base: 0.9rem` (14.4px); each step multiplies the previous by `--scale-ratio: 1.25`.

Every step is paired with a `--text-t*--line-height`, and every one of those resolves to a `--spacing-*` token, so leading is a spacing value rather than a floating multiplier. Setting `text-t4` sets both.

| Utility  | px     | Line height     | px     | Ratio |
| -------- | ------ | --------------- | ------ | ----- |
| text-t1  | 14.40  | `--spacing-s4`  | 20.00  | 1.389 |
| text-t2  | 18.00  | `--spacing-s5`  | 24.99  | 1.389 |
| text-t3  | 22.50  | `--spacing-s6`  | 31.24  | 1.389 |
| text-t4  | 28.12  | `--spacing-s6`  | 31.24  | 1.111 |
| text-t5  | 35.16  | `--spacing-s7`  | 39.05  | 1.111 |
| text-t6  | 43.95  | `--spacing-s8`  | 48.82  | 1.111 |
| text-t7  | 54.93  | `--spacing-s9`  | 61.02  | 1.111 |
| text-t8  | 68.66  | `--spacing-s10` | 76.28  | 1.111 |
| text-t9  | 85.83  | `--spacing-s11` | 95.34  | 1.111 |
| text-t10 | 107.29 | `--spacing-s12` | 119.18 | 1.111 |
| text-t11 | 134.11 | `--spacing-s13` | 148.98 | 1.111 |
| text-t12 | 167.64 | `--spacing-s14` | 186.22 | 1.111 |
| text-t13 | 209.55 | `--spacing-s15` | 232.77 | 1.111 |
| text-t14 | 261.93 | `--spacing-s16` | 290.97 | 1.111 |

The ratio column only has two values because it can only have a few: both series step by ×1.25 and the spacing ramp is offset from the type ramp by the optical ratio, so the achievable leadings are 0.889, 1.111, 1.389, 1.736 — nothing in between. 0.889 clips descenders and 1.736 is airy enough to break a heading apart, which leaves two usable rungs. `t1`–`t3` take the looser one because they are read in paragraphs; `t4` and up take the tighter one because they are looked at.

A `--leading-s1` … `--leading-s16` set mirrors the spacing ramp for the rare override, so `leading-s6` is exactly as tall as `gap-s6` is wide. Tailwind's own `leading-none` / `leading-tight` / `leading-snug` still exist and the installed shadcn components use them; do not add more.

## Spacing Ramp

**Every non-typographic size comes from this series: margin, padding, gap, width, height, and radius.** Font sizes come from the type ramp.

20 steps in `--spacing-*`, prefixed `s` — four sub-base steps (`--spacing-s4xs` … `--spacing-sxs`) below the optical base, then `--spacing-s1` … `--spacing-s16` above it. The prefix keeps them alongside Tailwind's numeric scale instead of shadowing it: `p-4`, `gap-2`, and `text-sm` still mean what they always meant, which is what keeps the installed shadcn components rendering correctly. Utilities take the suffix on every spacing property — `p-sxs`, `px-s3`, `gap-s4`, `m-s2`, `mt-s6`, `h-s1`, `w-s5`.

Base is `--space-base: calc(var(--type-base) * var(--optical-ratio))`, then each step multiplies or divides by the same `--scale-ratio: 1.25` as the type ramp. `--optical-ratio: 0.71094` is Roboto Flex's cap height divided by its em, read from the font's OS/2 table (`sCapHeight 1456 / unitsPerEm 2048`) — the spacing rhythm is tied to the optical height of the actual typeface rather than a round number picked in the abstract.

| Utility | px     |
| ------- | ------ |
| s4xs    | 4.19   |
| s3xs    | 5.24   |
| s2xs    | 6.55   |
| sxs     | 8.19   |
| s1      | 10.24  |
| s2      | 12.80  |
| s3      | 16.00  |
| s4      | 20.00  |
| s5      | 24.99  |
| s6      | 31.24  |
| s7      | 39.05  |
| s8      | 48.82  |
| s9      | 61.02  |
| s10     | 76.28  |
| s11     | 95.34  |
| s12     | 119.18 |
| s13     | 148.98 |
| s14     | 186.22 |
| s15     | 232.77 |
| s16     | 290.97 |

`s15` and `s16` are past anything you would pad with; they exist so `text-t13` and `text-t14` have a line height on the series.

The series continues below the base rather than handing off to Tailwind because the ramp is geometric (×1.25) and Tailwind's numeric scale is linear (n × 0.25rem), so mixing the two breaks the rhythm. Numeric spacing is the exception for a one-off micro-adjustment inside a component, not the default for layout.

## Grid

`:root` defines `--grid-columns: 19`, `--grid-content-columns: 17`, `--grid-gutter: var(--spacing-s3)`. Three `@utility` classes built on them:

| Utility        | Does                                                                |
| -------------- | -------------------------------------------------------------------- |
| `grid-canvas`  | `display: grid`, 19 equal columns, `column-gap: var(--grid-gutter)` |
| `content-area` | `grid-column: 2 / span 17` — the live content area                  |
| `bleed-area`   | `grid-column: 1 / -1` — full width, edge to edge                    |

19 columns total: one gutter column on each side, 17 live in between. Wrap a section in `grid-canvas`, then place children in `content-area` for normal content or `bleed-area` for anything that should run edge to edge.

## Customizing Components

See also: [styling.md](styling.md) for Incorrect/Correct examples.

Prefer these approaches in order:

### 1. Built-in variants

```tsx
<Button variant="outline" size="sm">
  Click
</Button>
```

### 2. Tailwind classes via `className`

```tsx
<Card className="mx-auto max-w-md">...</Card>
```

Classes passed via `className` are merged with `cn()`, so they win over the component's default classes — order them after any conflicting default.

### 3. Add a new variant

Edit the component source in `src/components/ui/` to add a variant via `cva`:

```tsx
// src/components/ui/button.tsx
warning: "bg-warning text-warning-foreground hover:bg-warning/90",
```

### 4. Wrapper components

Compose shadcn/ui primitives into higher-level components:

```tsx
export function ConfirmDialog({ title, onConfirm, children }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

