"use client"

import * as React from "react"
import { Bell, ChevronDown, MessageCircle, Moon, PanelLeft, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconButton } from "./primitives"
import type { Author } from "@/lib/publication/types"

/**
 * Pane header (spec §4). Spans the full pane width — it is not constrained to
 * the content column — and stays put while the dashboard scrolls beneath it.
 * The hairline divider carries that seam.
 */
export function PaneHeader({
  title,
  author,
  onOpenNav,
}: {
  title: string
  author: Author
  onOpenNav: () => void
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-s2 border-b border-border bg-surface-raised px-s3 py-s2">
      <div className="flex items-center gap-s1">
        <IconButton
          label="Open navigation"
          className="lg:hidden"
          onClick={onOpenNav}
        >
          <PanelLeft />
        </IconButton>
        <h1 className="text-t3 font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-s3xs">
        <ThemeToggle />
        <IconButton label="Search">
          <Search />
        </IconButton>
        <IconButton label="Messages">
          <MessageCircle />
        </IconButton>
        <IconButton label="Notifications">
          <Bell />
        </IconButton>
        <AccountMenu author={author} />
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const dark = mounted && resolvedTheme === "dark"
  const label = dark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <IconButton label={label} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Moon /> : <Sun />}
    </IconButton>
  )
}

/**
 * A generic placeholder avatar with a caret badge overlapping its corner —
 * the badge is what says this opens a menu. The avatar is the only fully
 * rounded thing on the screen.
 */
function AccountMenu({ author }: { author: Author }) {
  const initials = author.name
    .split(" ")
    .map((part) => part[0])
    .join("")

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Account menu for ${author.name}`}
              className="relative ml-s3xs rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Avatar className="size-s3">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span
                aria-hidden
                className="absolute -right-s4xs -bottom-s4xs inline-flex size-s1 items-center justify-center rounded-full bg-muted ring-2 ring-surface-raised"
              >
                <ChevronDown className="size-3" />
              </span>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{author.name}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
