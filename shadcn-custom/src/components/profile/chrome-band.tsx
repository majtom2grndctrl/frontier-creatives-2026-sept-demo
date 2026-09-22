import type { ComponentType } from "react"
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  CircleDot,
  GitPullRequest,
  Inbox,
  Mail,
  Menu,
  Package,
  Plus,
  Search,
  Sparkles,
  Star,
  Table2,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ChromeIconButton, ChromeSplitButton, CountBadge } from "@/components/profile/primitives"
import type { ProfileTab } from "@/lib/profile/types"
import { cn } from "@/lib/utils"

/**
 * The fixture's tab ids are fixed (spec §11), but `ProfileTab` carries no
 * icon field — each tab's leading glyph is a presentation choice, not data.
 * Falls back to a generic dot for any id the fixture doesn't cover.
 */
const TAB_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  overview: BookOpen,
  repositories: BookMarked,
  projects: Table2,
  packages: Package,
  stars: Star,
}

/* -------------------------------------------------------------------------
   Region A — Chrome band (spec §3)
   ---------------------------------------------------------------------- */

export function ChromeBand({
  handle,
  viewerAvatarUrl,
  tabs,
  activeTabId,
}: {
  handle: string
  viewerAvatarUrl: string
  tabs: ProfileTab[]
  activeTabId: string
}) {
  return (
    // `bleed-area` runs the band full viewport width inside the page's
    // `grid-canvas`; `banner` landmark per §14. One surface, one hairline —
    // row 1 and row 2 below share this element instead of each drawing
    // their own border (§16.2, §16.17).
    <header className="bleed-area border-b border-border bg-muted">
      {/* Row 1 — global header */}
      <div className="flex items-center justify-between gap-s3 px-s3 py-s2">
        <div className="flex min-w-0 items-center gap-s2">
          <ChromeIconButton label="Open navigation menu">
            <Menu className="size-4" />
          </ChromeIconButton>
          {/* Platform mark: a circle, deliberately not a button (§3). */}
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground"
          />
          {/* Bold, text/default — not link-colored, unlike the repo links elsewhere on this screen. */}
          <span className="truncate text-t1 font-bold text-foreground">
            {handle}
          </span>
        </div>

        <div className="flex items-center gap-s2">
          {/* Search field: filled with the band's own tone (surface/raised-chrome),
              so only the border reads as an edge (§3). Placeholder text and the
              key-cap chip are rendered as a pointer-events-none overlay because a
              native placeholder can't carry a styled inline chip; the input keeps
              a real accessible name via aria-label. */}
          <div className="relative hidden items-center lg:flex">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-s2xs size-4 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search or jump to..."
              className="w-s13 rounded-xs border-border bg-muted pl-s6 pr-s2 text-sm shadow-none"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-s6 right-s2xs flex items-center gap-s2xs text-sm text-muted-foreground"
            >
              <span className="truncate">Search or jump to...</span>
              <kbd className="ml-auto shrink-0 rounded-xs border border-border px-s4xs font-sans text-xs text-muted-foreground">
                /
              </kbd>
            </span>
          </div>

          {/* Everything between the search field and the avatar collapses
              behind the menu button below the wide breakpoint (§15). The menu
              button and the avatar stay — they are the two things a narrow
              header still has to offer. */}
          <div className="hidden items-center gap-s2 lg:flex">
            <ChromeSplitButton
              segments={[
                { label: "Ask Copilot", icon: <Sparkles className="size-4" /> },
                { label: "Open Copilot menu", icon: <ChevronDown className="size-4" /> },
              ]}
            />

            <Separator orientation="vertical" className="h-8" />

            <ChromeSplitButton
              segments={[
                { label: "Create new", icon: <Plus className="size-4" /> },
                { label: "Show create options", icon: <ChevronDown className="size-4" /> },
              ]}
            />
          </div>

          <div className="hidden items-center gap-s2 lg:flex">
            <ChromeIconButton label="Issues">
              <CircleDot className="size-4" />
            </ChromeIconButton>
            <ChromeIconButton label="Pull requests">
              <GitPullRequest className="size-4" />
            </ChromeIconButton>
            <ChromeIconButton label="Notifications">
              <Inbox className="size-4" />
            </ChromeIconButton>
            <ChromeIconButton label="Messages">
              <Mail className="size-4" />
            </ChromeIconButton>
          </div>

          {/* Viewer avatar: circular, no border, no button chrome (§3) — unlike
              every other cluster item, this is not an affordance. There's no
              viewer name in props to hang meaning on, so it's decorative. */}
          <Avatar>
            <AvatarImage src={viewerAvatarUrl} alt="" />
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Row 2 — profile tab bar. Links to distinct URLs, not ARIA tabs (§14):
          plain <nav>/<a>, aria-current marks the active one. */}
      {/* Below the wide breakpoint the five tabs stop fitting. They scroll
          rather than wrap, so the active indicator keeps sitting on the band's
          bottom edge; §16.25 only forbids independent scrolling at the wide
          breakpoint, where they fit. */}
      <nav
        aria-label="Profile"
        className="flex items-center gap-s1 overflow-x-auto px-s3 lg:overflow-x-visible"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const Icon = TAB_ICONS[tab.id] ?? CircleDot
          // Count must be part of the link's accessible name, e.g. "Repositories, 26"
          // (§14) — aria-label on the anchor covers it without a duplicate sr-only node.
          const accessibleLabel =
            tab.count !== undefined ? `${tab.label}, ${tab.count}` : undefined

          return (
            <a
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={accessibleLabel}
              className={cn(
                "relative flex items-center gap-s1 px-s1 py-s2 text-t1 text-foreground",
                isActive ? "font-medium" : "font-normal"
              )}
            >
              <Icon aria-hidden className="size-4 text-muted-foreground" />
              <span>{tab.label}</span>
              {/* Only Repositories and Stars carry a count — driven off the data,
                  never hardcoded to specific tab ids (§16.3). */}
              {tab.count !== undefined ? <CountBadge>{tab.count}</CountBadge> : null}
              {isActive ? (
                // Sits on the same line as the band's bottom border and overlays it
                // there (§3) — `inset-x-0` rides the anchor's own padding, which is
                // what gives the bar its "just before the glyph, just past the
                // label" reach for free. `accent/attention`, not the link accent
                // (§16.27): magenta, never azure.
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-magenta-500"
                />
              ) : null}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
