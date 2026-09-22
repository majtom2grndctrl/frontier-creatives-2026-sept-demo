import Link from "next/link"
import {
  Bell,
  BookMarked,
  BookOpen,
  ChevronDown,
  CircleDot,
  GitPullRequest,
  Hexagon,
  Inbox,
  KanbanSquare,
  Menu,
  Package,
  Plus,
  Search,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import type { ProfileTab } from "@/lib/profile/types"
import { cn } from "@/lib/utils"

/**
 * Spec §9.4 — the one icon-button style the chrome band uses everywhere:
 * `border/default` outline, transparent fill, `text/muted` glyph, square
 * footprint, `radius/control`. Built on the shadcn `Button` so focus ring and
 * disabled handling come for free; `shadow-none` because §16.10 forbids
 * elevation anywhere on this screen. Hover is a background wash only — no
 * movement.
 */
function IconButton({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      className={cn(
        "size-8 rounded-md border-border bg-transparent text-muted-foreground shadow-none",
        "hover:bg-accent hover:text-foreground",
        "dark:border-border dark:bg-transparent dark:hover:bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

/** Leading glyph per tab. Outline lucide marks, `text/muted` like every other glyph. */
const TAB_ICON: Record<string, LucideIcon> = {
  Overview: BookOpen,
  Repositories: BookMarked,
  Projects: KanbanSquare,
  Packages: Package,
  Stars: Star,
}

function initialsFor(handle: string) {
  const letters = handle.replace(/[^\p{L}\p{N}]/gu, "")
  return (letters.slice(0, 2) || "??").toUpperCase()
}

/**
 * Spec §3 — Region A, the chrome band.
 *
 * ONE block on `surface/raised-chrome`, full viewport width (full-bleed — it
 * does not sit inside region B's centred column), holding two stacked rows with
 * **no rule between them** (§16.2, §16.17). A single `border/default` hairline
 * closes the bottom of the whole block. Inner padding is a *viewport* inset,
 * deliberately not aligned to the content column. Nothing here is sticky (§13).
 */
export function ChromeBand({
  handle,
  tabs,
}: {
  handle: string
  tabs: ProfileTab[]
}): React.JSX.Element {
  return (
    <header role="banner" className="w-full border-b border-border bg-muted">
      {/* Row 1 — global header. */}
      <div className="flex h-14 items-center gap-3 px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton label="Open global navigation menu">
            <Menu />
          </IconButton>
          {/* Platform mark — circular, NOT a button (§3 row 1). */}
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
          >
            <Hexagon className="size-4" />
          </span>
          {/* The handle is bold `text/default` — deliberately not link-coloured. */}
          <span className="truncate text-sm font-bold text-foreground">
            {handle}
          </span>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          {/* 1. Search field — bordered, filled with the band's own tone, so the
              border is what makes it legible. The placeholder carries an inline
              key-cap chip for the shortcut character. */}
          <div className="relative w-36 shrink sm:w-56 lg:w-72">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              aria-label="Search or jump to"
              placeholder="Type / to search"
              className="peer h-8 rounded-md border-border bg-muted pr-2 pl-8 text-sm shadow-none placeholder:text-transparent dark:bg-muted"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-8 flex items-center gap-1.5 text-sm text-foreground/60 opacity-0 peer-placeholder-shown:opacity-100"
            >
              <span className="hidden sm:inline">Type</span>
              <Kbd className="rounded-sm border border-border bg-background text-muted-foreground">
                /
              </Kbd>
              <span className="hidden sm:inline">to search</span>
            </span>
          </div>

          {/* 2–4. Two split buttons with a bare rule between them. Below `md`
              the cluster collapses behind the menu button (§15). */}
          <div className="hidden items-center gap-2 md:flex">
            <ButtonGroup>
              <IconButton label="Ask the assistant">
                <Sparkles />
              </IconButton>
              <ButtonGroupSeparator className="bg-border" />
              <IconButton label="Open assistant menu">
                <ChevronDown />
              </IconButton>
            </ButtonGroup>

            <Separator
              orientation="vertical"
              className="mx-1 bg-border data-[orientation=vertical]:h-6"
            />

            <ButtonGroup>
              <IconButton label="Create new">
                <Plus />
              </IconButton>
              <IconButton label="Open create menu">
                <ChevronDown />
              </IconButton>
            </ButtonGroup>
          </div>

          {/* 5. Four standalone icon buttons. */}
          <div className="hidden items-center gap-2 md:flex">
            <IconButton label="Issues">
              <CircleDot />
            </IconButton>
            <IconButton label="Pull requests">
              <GitPullRequest />
            </IconButton>
            <IconButton label="Inbox">
              <Inbox />
            </IconButton>
            <IconButton label="Notifications">
              <Bell />
            </IconButton>
          </div>

          {/* 6. The viewer's avatar — circular, no border, no button chrome. */}
          <Avatar
            role="img"
            aria-label="Your account"
            className="size-8 shrink-0"
          >
            <AvatarFallback className="bg-border text-xs font-medium text-foreground">
              {initialsFor(handle)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Row 2 — profile tab bar. No rule above it: the band is one continuous
          surface (§16.2). Left-aligned to the same *viewport* inset as row 1.
          `-mb-px` seats the row's bottom edge on the band's bottom hairline so
          the active indicator can replace it across that tab's width. */}
      <nav
        aria-label={`${handle} profile`}
        className="-mb-px flex items-center gap-1 overflow-x-auto px-6 lg:px-8"
      >
        {tabs.map((tab) => {
          const Icon = TAB_ICON[tab.label] ?? BookOpen
          const hasCount = typeof tab.count === "number"

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.current ? "page" : undefined}
              aria-label={hasCount ? `${tab.label}, ${tab.count}` : undefined}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground",
                "outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                tab.current ? "font-semibold" : "font-normal"
              )}
            >
              <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
              <span>{tab.label}</span>
              {hasCount ? (
                /* Spec §9.5 — `CountBadge`: fully rounded pill, `surface/recessed`
                   fill, `text/default` numerals. Only Repositories and Stars get
                   one (§16.3). The value reaches assistive tech through the
                   link's aria-label ("Repositories, 26"). */
                <span
                  aria-hidden="true"
                  className="rounded-full bg-border px-2 py-0.5 text-xs font-normal text-foreground tabular-nums"
                >
                  {tab.count}
                </span>
              ) : null}
              {tab.current ? (
                /* Short indicator bar, only as wide as this tab, sitting on the
                   band's bottom border line and replacing it there.
                   `accent/attention` — a different hue from the link accent (§16.27). */
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-chart-1"
                />
              ) : null}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
