import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------
   Card shell (spec §12.1, §16.1, §16.10)
   ---------------------------------------------------------------------- */

/**
 * shadcn `Card` with the screen's two surface rules applied once, here,
 * instead of at five call sites: the fill is the *page* surface, so a card is
 * distinguished by its hairline border alone, and nothing on this screen casts
 * a shadow. Padding is deliberately left off — the spec has each card type
 * carry its own (README roomiest, pinned tightest, §12.3).
 *
 * `py-0` below cancels `Card`'s own `py-6`, and cancelling it is what makes
 * "each card carries its own padding" true. It also sets a trap: **give this
 * component `px-*` and `py-*`, never the `p-*` shorthand.** Tailwind emits the
 * whole `p` group before the `px`/`py` groups, so `p-s5` loses to `py-0` and
 * the card renders with no vertical padding at all — and `cn`'s
 * tailwind-merge cannot save you, because it does not recognise `p-s5` as a
 * padding utility and so never drops the `py-0` it conflicts with. The failure
 * is silent: horizontal padding lands, vertical padding is zero, and what
 * looks like a little breathing room is only line-box leading.
 */
export function ProfileCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-md border-border bg-background py-0 shadow-none",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------
   Section header (spec §9.2)
   ---------------------------------------------------------------------- */

/**
 * The main column's section heading: body size at *regular* weight, with an
 * optional bare text action on the right. Deliberately not the sidebar's
 * heading, which is the same size but bold (§12.2) — do not normalise them.
 */
export function SectionHeader({
  title,
  id,
  action,
  className,
}: {
  title: string
  id?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-s2", className)}>
      <h2 id={id} className="text-t1 font-normal text-foreground">
        {title}
      </h2>
      {action}
    </div>
  )
}

/**
 * The right-hand half of a `SectionHeader` — accent-coloured, no button
 * chrome, no underline at rest. Edit flows are out of scope, so it is a
 * deliberate no-op button rather than a link to nowhere (§1 non-goals).
 */
export function SectionHeaderAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-xs text-sm text-accent-solid underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------
   Count badge (spec §9.5)
   ---------------------------------------------------------------------- */

/**
 * The tab bar's count pill: fully rounded, filled with the sunken surface —
 * one step deeper than the chrome band it sits on — and default-coloured
 * numerals. Not a status badge; it never takes a hue.
 */
export function CountBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge
      className={cn(
        "bg-surface-sunken px-s2xs font-normal text-foreground tabular-nums",
        className
      )}
    >
      {children}
    </Badge>
  )
}

/* -------------------------------------------------------------------------
   Chrome-band icon buttons (spec §9.4)
   ---------------------------------------------------------------------- */

/**
 * One style for every icon button in the chrome band: square, hairline
 * outline, transparent fill, muted glyph. `variant="outline"` would bring a
 * shadow and a dark-mode fill with it, so the outline is composed on `ghost`.
 *
 * `rounded-xs`, not the button's own `rounded-md`: these are 32px boxes and
 * `--radius-md` is 16px, which rounds them into circles. The spec's radius
 * ladder (§12.3) puts controls *below* cards, and §3 calls for a square
 * footprint — 10.24px keeps the corner soft and the shape legibly square.
 */
export function ChromeIconButton({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      className={cn(
        "rounded-xs border border-border text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

/**
 * The split variant: two segments inside one bordered container, divided by an
 * internal hairline. The container owns the border and the radius; the
 * segments are borderless so the divider is the only rule between them.
 */
export function ChromeSplitButton({
  segments,
}: {
  segments: { label: string; icon: React.ReactNode }[]
}) {
  return (
    <div className="flex h-8 items-stretch overflow-hidden rounded-xs border border-border">
      {segments.map((segment, i) => (
        <React.Fragment key={segment.label}>
          {i > 0 ? <Separator orientation="vertical" /> : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={segment.label}
            className="h-full rounded-none px-s2xs text-muted-foreground hover:text-foreground"
          >
            {segment.icon}
          </Button>
        </React.Fragment>
      ))}
    </div>
  )
}
