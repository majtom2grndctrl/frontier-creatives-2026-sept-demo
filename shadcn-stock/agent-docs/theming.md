# Theming

## Where the theme lives

- `src/app/globals.css` — all design tokens: color, radius, spacing, shadow, motion.
- `src/app/layout.tsx` — font setup.

There is no `tailwind.config.js`. This project uses Tailwind v4's CSS-first theming: tokens are plain CSS custom properties, registered with Tailwind via `@theme inline`.

## Consume tokens, don't invent them

Use the existing utilities: `bg-primary`, `text-muted-foreground`, `rounded-lg`, `border-border`, and so on. Never hardcode a hex/rgb value or reach for a raw Tailwind palette class like `bg-blue-500` or `text-gray-600` — every color a component needs already has a semantic token.

Do not edit the token definitions in `globals.css` unless explicitly asked to change the theme. The palette, radius, and dark-mode values are a fixed design system input, not something to adjust while building a feature.

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

Every semantic variable has a light value in `:root` and a dark override in `.dark`. Components never branch on theme — they just use the token utilities, and the variable swap does the rest.

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

`--radius` (`0.625rem`) controls border radius globally. The `@theme inline` block derives the scale from it: `radius-sm` = `radius - 4px`, `radius-md` = `radius - 2px`, `radius-lg` = `radius`, `radius-xl` = `radius + 4px`. Use the corresponding utilities (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`) rather than arbitrary values.

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

