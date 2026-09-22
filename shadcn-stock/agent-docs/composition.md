# Component Composition

## Contents

- Picking a component
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
