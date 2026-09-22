# Component Composition

## Contents

- Picking a component
- Building a screen
- Layout utilities
- Items always inside their Group component
- Callouts use Alert
- Toast notifications use Sonner
- Choosing between overlay components
- Dialog and Sheet always need a Title
- Card structure
- TabsTrigger must be inside TabsList
- Avatar always needs AvatarFallback
- Use Separator instead of raw hr or border divs
- Use Skeleton for loading placeholders
- Use Badge instead of custom styled spans

---

## Picking a component

| Need | Component |
|------|-----------|
| Single choice from a short list | `Select` |
| Command palette / searchable list | `Command` |
| Confirm a destructive action | `AlertDialog` |
| Side panel with details or filters | `Sheet` |
| Transient feedback after an action | Sonner `toast` |
| Loading placeholder | `Skeleton` |
| Tabular data | `Table` |
| Collapsible section | `Collapsible` or `Accordion` |
| Menu of actions from a button | `DropdownMenu` |

---

## Building a screen

Start from the use case, not the component:

**Settings page** — `Tabs` + `Card` + `Input`/`Select`/`Switch`/`RadioGroup` + `Button`.
Tabs separate setting groups; each Card owns one group and its own save Button.

**Dashboard** — `Sidebar` + `Card` + `Table` + `Badge` + `Skeleton`.
Sidebar carries navigation; Cards hold metrics, Table holds recent activity, Badge marks status, Skeleton fills each region while data loads.

**Data table view** — `Table` + `Input` + `DropdownMenu` + `Pagination` + `Checkbox`.
Input filters above the table, Checkbox selects rows, DropdownMenu holds per-row actions, Pagination bounds the result set.

**Create / edit record** — `Dialog` or `Sheet` + `Form` + `Input`/`Textarea`/`Select` + `Button`.
Dialog for short forms, Sheet for long ones. Form wires validation; the submit Button lives in the footer.

**Destructive confirm** — `AlertDialog`. Never `Dialog`; AlertDialog traps focus and forces an explicit cancel or confirm.

**Onboarding / multi-step** — `Tabs` or `Progress` + `Card` + `Button`.
Tabs when steps are freely navigable, Progress when they are linear. Card frames one step; Buttons move between them.

**Search / command palette** — `Command` inside `Dialog`. Command supplies the filtered list and keyboard handling; Dialog makes it a global overlay.

**Detail page** — `Breadcrumb` + `Card` + `Separator` + `Tabs` + `Badge`.
Breadcrumb shows where the record sits, Badge shows its state, Tabs split related views, Separator divides sections inside a Card.

**List with filters** — `Input` + `ToggleGroup` or `Select` + `Card` or `Table` + `Pagination`.
ToggleGroup for a few visible filters, Select for many. Cards for rich items, Table for dense ones.

**Empty and loading states** — `Skeleton` while loading; `Alert` or a `Card` with a `Button` when empty.
Skeleton preserves layout during fetch. An empty state needs a next action, so pair the message with a Button.

**Notifications / feedback** — Sonner `toast` for transient, `Alert` for persistent. Toast confirms an action and disappears; Alert stays inline while the condition holds.

**Navigation** — `Sidebar` for the app shell, `NavigationMenu` for top-level sections, `Breadcrumb` for hierarchy, `Tabs` for sibling views inside one page.
Each covers a different level. Don't substitute one for another.

---

## Layout utilities

The project uses a 19-column grid:

| Class | Spans |
|---|---|
| `grid-canvas` | The 19-column grid container |
| `content-area` | The 17 live content columns (2-18) |
| `bleed-area` | All 19 columns, edge to edge |

Wrap a page section in `grid-canvas`. Put normal content in `content-area`. Use `bleed-area` for full-width elements like hero images and section backgrounds.

```tsx
<section className="grid-canvas py-s6">
  <div className="bleed-area">
    <img src="/hero.jpg" alt="" />
  </div>
  <div className="content-area flex flex-col gap-s4">
    <h2 className="text-t4">Team</h2>
    <Card>...</Card>
    <Card>...</Card>
  </div>
</section>
```

Use the spacing ramp for gaps between composed pieces: `gap-s2` inside a group, `gap-s4` between cards, `py-s6` for section padding. Type: `text-t1` for body, `text-t2` for card titles, `text-t4` for section headings. Full tables live in `styling.md`.

---

## Items always inside their Group component

Never render items directly inside the content container — wrap them in the matching group:

```tsx
<SelectContent>
  <SelectGroup>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectGroup>
</SelectContent>
```

This applies to all group-based components:

| Item | Group |
|------|-------|
| `SelectItem`, `SelectLabel` | `SelectGroup` |
| `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSub` | `DropdownMenuGroup` |
| `CommandItem` | `CommandGroup` |

---

## Callouts use Alert

```tsx
<Alert>
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Something needs attention.</AlertDescription>
</Alert>
```

---

## Toast notifications use Sonner

```tsx
import { toast } from "sonner"

toast.success("Changes saved.")
toast.error("Something went wrong.")
```

---

## Choosing between overlay components

| Use case | Component |
|----------|-----------|
| Focused task that requires input | `Dialog` |
| Destructive action confirmation | `AlertDialog` |
| Side panel with details or filters | `Sheet` |
| Quick info on hover | `HoverCard` |
| Small contextual content on click | `Popover` |
| Short label on hover/focus | `Tooltip` |

---

## Dialog and Sheet always need a Title

`DialogTitle` and `SheetTitle` are required for accessibility. Use `className="sr-only"` if visually hidden.

```tsx
<DialogHeader>
  <DialogTitle>Edit Profile</DialogTitle>
</DialogHeader>
```

---

## Card structure

Use full composition — don't dump everything into `CardContent`:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Team Members</CardTitle>
    <CardDescription>Manage your team.</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>
    <Button>Invite</Button>
  </CardFooter>
</Card>
```

---

## TabsTrigger must be inside TabsList

Never render `TabsTrigger` directly inside `Tabs` — always wrap in `TabsList`:

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
</Tabs>
```

---

## Avatar always needs AvatarFallback

Always include `AvatarFallback` for when the image fails to load:

```tsx
<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

## Use existing components instead of custom markup

| Instead of | Use |
|---|---|
| `<hr>` or `<div className="border-t">` | `<Separator />` |
| `<div className="animate-pulse">` with styled divs | `<Skeleton className="h-4 w-3/4" />` |
| `<span className="rounded-full bg-green-100 ...">` | `<Badge variant="secondary">` |
