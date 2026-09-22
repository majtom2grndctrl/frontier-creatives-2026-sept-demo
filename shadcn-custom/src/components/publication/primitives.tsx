"use client"

import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatDeltaPct } from "@/lib/publication/format"

/* -------------------------------------------------------------------------
   Card shell (spec §10.1)
   ---------------------------------------------------------------------- */

/**
 * Raised surface, hairline border, medium radius, no shadow. Used by every
 * section on the dashboard, and by the Overview panel minus its header band.
 */
export function SectionCard({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-surface-raised",
        className
      )}
      {...props}
    />
  )
}

/**
 * The attached-heading pattern (spec §5.1): a heading band inside the card,
 * above a hairline divider, with a muted text link on the right. Overview
 * deliberately does not use this — its heading sits outside its panel.
 */
export function CardHeaderBand({
  title,
  headingId,
  action,
}: {
  title: string
  headingId: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-s2 border-b border-border px-s3 py-s2">
      <h2 id={headingId} className="text-t2 font-semibold">
        {title}
      </h2>
      {action}
    </div>
  )
}

/* -------------------------------------------------------------------------
   Icon buttons (spec §10.4)
   ---------------------------------------------------------------------- */

/**
 * One size, transparent at rest, subtle hover fill, a visible focus ring, an
 * accessible name and a tooltip that a keyboard focus also reaches.
 */
function IconButtonBase({
  label,
  className,
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label={label}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  )
}

export function IconButton({
  label,
  ...props
}: React.ComponentProps<typeof IconButtonBase>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButtonBase label={label} {...props} />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * An icon button that opens a menu. The tooltip and the menu both attach to
 * the button itself, so `aria-haspopup` and focus land in the right place.
 * Prototype menus are stubs, but never silent no-ops.
 */
export function OverflowMenu({
  label = "More actions",
  items,
  icon,
  align = "end",
  className,
}: {
  label?: string
  items: string[]
  icon: React.ReactNode
  align?: "start" | "end"
  className?: string
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <IconButtonBase label={label} className={className}>
              {icon}
            </IconButtonBase>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={align}>
        {items.map((item) => (
          <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------
   Card header links (spec §7.1, §8.1, §9.1)
   ---------------------------------------------------------------------- */

/**
 * "View stats" / "View all". Muted, not accent-coloured — these are secondary
 * actions, and the screen's one accent belongs to Create, Share post, and the
 * chart.
 */
export function CardHeaderLink({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-s13">
        <PopoverTitle className="text-t1 font-semibold">{title}</PopoverTitle>
        <PopoverDescription className="text-sm">
          {description}
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------
   Chips and pills (spec §6.2, §8.3)
   ---------------------------------------------------------------------- */

/**
 * The delta chip beside a metric value. A rounded rectangle at the small
 * radius, not a capsule — the avatar is the only fully-rounded thing here.
 * Direction is carried by the arrow glyph and spelled out in the accessible
 * name, so it never rests on colour alone.
 */
export function DeltaPill({ deltaPct }: { deltaPct: number }) {
  const rising = deltaPct >= 0
  const Arrow = rising ? ArrowUp : ArrowDown
  return (
    <span className="inline-flex items-center gap-s4xs rounded-sm bg-positive px-s2xs py-s4xs text-xs font-medium text-positive-foreground">
      <Arrow aria-hidden className="size-3" />
      <span className="sr-only">{rising ? "up" : "down"} </span>
      {formatDeltaPct(deltaPct)}
    </span>
  )
}

/** The neutral `Draft` chip. Same radius rule as the delta pill. */
export function StatusChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-sm bg-muted px-s2xs py-s4xs text-xs font-medium text-foreground">
      {children}
    </span>
  )
}
