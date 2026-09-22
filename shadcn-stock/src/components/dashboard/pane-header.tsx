"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Bell, ChevronDown, MessageSquare, Moon, Search, Sun } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconButton } from "@/components/dashboard/icon-button"
import { StubMenu } from "@/components/dashboard/stub-menu"
import { author } from "@/data/dashboard"

/**
 * Spec §4, Region B1 — the pane header. Spans the full pane width (not the
 * centered content column) and stays sticky while the content column scrolls
 * beneath it, per §4's stated assumption. `bg-card` keeps scrolled content
 * from showing through, and the hairline `border-b` carries the scroll seam.
 */
export function PaneHeader({
  title,
  leading,
}: {
  title: string
  /** Slot before the title — carries the §16 drawer trigger below `lg`. */
  leading?: React.ReactNode
}) {
  return (
    <div className="bg-card border-b sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex min-w-0 items-center gap-2">
        {leading}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <IconButton label="Search">
          <Search />
        </IconButton>
        <IconButton label="Messages">
          <MessageSquare />
        </IconButton>
        <IconButton label="Notifications">
          <Bell />
        </IconButton>
        <AccountMenu />
      </div>
    </div>
  )
}

/**
 * §14.11 — toggles light/dark via next-themes. `resolvedTheme` is undefined
 * during SSR, so a `mounted` flag guards against rendering the wrong glyph
 * before hydration (a hydration mismatch) — until then, show a stable
 * placeholder icon and label.
 */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <IconButton label="Toggle theme">
        <Sun />
      </IconButton>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <IconButton
      label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon /> : <Sun />}
    </IconButton>
  )
}

/**
 * §4.5 — circular avatar with a caret badge overlapping its bottom-right
 * corner, indicating it opens a menu. Per §13 the avatar is the only fully
 * rounded shape on this screen, so the badge uses `rounded-sm` rather than
 * `rounded-full`.
 */
function AccountMenu() {
  const initials = author.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <StubMenu label="Account" items={["Profile", "Settings", "Sign out"]}>
      <button
        type="button"
        aria-label={`Account menu for ${author.name}`}
        className="relative ml-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar>
          <AvatarImage src={author.avatarUrl} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-sm border bg-card"
        >
          <ChevronDown className="size-3 text-muted-foreground" />
        </span>
      </button>
    </StubMenu>
  )
}
