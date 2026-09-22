# Styling & Customization

See [theming.md](theming.md) for theming, CSS variables, and adding custom colors.

## Contents

- Semantic colors
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

For status/state indicators, use Badge variants or `text-destructive` instead of raw Tailwind colors like `text-emerald-600` or `text-red-600`. If you need a positive/success color that doesn't exist as a semantic token, ask about adding a custom CSS variable (see [theming.md](theming.md)).

---

## Built-in variants first

Use `variant="outline"` rather than hand-composing `className="border border-input bg-transparent hover:bg-accent"`.

```tsx
<Button variant="outline">Click me</Button>
```

---

## className for layout only

Use `className` for layout (`max-w-md`, `mx-auto`, `mt-4`), **not** for overriding component colors or typography — don't write `className="bg-blue-100 text-blue-900 font-bold"` on a `Card`.

```tsx
<Card className="max-w-md mx-auto">
  <CardContent>Dashboard</CardContent>
</Card>
```

To customize appearance, prefer in order: built-in variants (`variant="outline"`), semantic color tokens (`bg-primary`), then CSS variables in `src/app/globals.css`.

---

## No space-x-* / space-y-*

Use `gap-*` instead. `space-y-4` → `flex flex-col gap-4`. `space-x-2` → `flex gap-2`.

```tsx
<div className="flex flex-col gap-4">
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
