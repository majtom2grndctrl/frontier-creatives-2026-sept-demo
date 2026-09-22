"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Spec §10.4 — every `⋯`, `↗`, and pane-header button shares one size, a
 * transparent resting background, a subtle hover fill, a visible focus ring,
 * an `aria-label`, and a tooltip reachable by keyboard focus.
 *
 * Radix's Tooltip opens on focus as well as hover, which is what §15 requires.
 */
export function IconButton({
  label,
  size = "icon-sm",
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          aria-label={label}
          className={cn("text-muted-foreground", className)}
          asChild={asChild}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
