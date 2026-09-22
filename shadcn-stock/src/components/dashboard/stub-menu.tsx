"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Spec §14.9 — no interactive element on this screen is a silent no-op. This is
 * the prototype stand-in: a real menu whose items acknowledge the action.
 *
 * Radix handles the focus trap and focus restore that §15 requires.
 */
export function StubMenu({
  label,
  items,
  align = "end",
  children,
}: {
  /** Names the menu for screen readers and heads the item list. */
  label: string
  items: string[]
  align?: "start" | "center" | "end"
  /** The trigger. Composed with `asChild`. */
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-44">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem
              key={item}
              onSelect={() => toast(`${item} — prototype stub`)}
            >
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The other §14.9 stand-in, for triggers that open a panel rather than a list
 * of commands (`Share post`, `View stats`, the publication switcher).
 */
export function StubPopover({
  title,
  description,
  align = "start",
  className,
  children,
  footer,
}: {
  title: string
  description: string
  align?: "start" | "center" | "end"
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className={className}>
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-none font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
          {footer}
        </div>
      </PopoverContent>
    </Popover>
  )
}
