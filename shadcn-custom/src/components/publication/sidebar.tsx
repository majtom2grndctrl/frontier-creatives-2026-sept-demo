"use client"

import * as React from "react"
import {
  AppWindow,
  ChartColumn,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  House,
  Send,
  Users,
} from "lucide-react"

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
import type { Publication } from "@/lib/publication/types"
import { cn } from "@/lib/utils"

/**
 * Sidebar (spec §3). A recessed rail carrying the publication identity card,
 * two nav groups, and the one solid-accent control on the screen.
 *
 * It has no footer: everything below `Revenue` is empty rail.
 */

type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "website", label: "Website", icon: AppWindow, external: true },
]

const SECONDARY_NAV: NavItem[] = [
  { id: "publish", label: "Publish", icon: Send },
  { id: "audience", label: "Audience", icon: Users },
  { id: "analytics", label: "Analytics", icon: ChartColumn },
  { id: "revenue", label: "Revenue", icon: CircleDollarSign },
]

export function PublicationSidebar({
  publication,
  activeNavId,
  onNavigate,
}: {
  publication: Publication
  activeNavId: string
  onNavigate: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col gap-s4 bg-surface-recessed p-s2">
      <PublicationCard publication={publication} />

      <nav aria-label="Primary" className="flex flex-col gap-s4xs">
        {PRIMARY_NAV.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={item.id === activeNavId}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <CreateButton />

      <nav aria-label="Manage" className="flex flex-col gap-s4xs">
        {SECONDARY_NAV.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={item.id === activeNavId}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  )
}

/** A bordered box, not a plain nav row — it opens the publication switcher. */
function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-s1 rounded-md border border-border bg-surface-raised p-s2xs text-left outline-none hover:bg-foreground/[0.03] focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <img
            src={publication.avatarUrl}
            alt=""
            className="size-s3 shrink-0 rounded-xs"
          />
          <span className="truncate text-t1 font-semibold">
            {publication.name}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverTitle className="text-t1 font-semibold">
          Switch publication
        </PopoverTitle>
        <PopoverDescription className="mt-s3xs text-sm">
          {publication.name} is the only publication on this account in the
          prototype.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  onNavigate: (id: string) => void
}) {
  const Icon = item.icon

  /* Website is the only row that leaves the app, and the only one with a
     trailing arrow pushed to the row's right edge. */
  if (item.external) {
    return (
      <a
        href="#"
        target="_blank"
        rel="noreferrer"
        className={navRowClasses(false)}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        <ExternalLink aria-hidden className="ml-auto size-3.5 shrink-0" />
      </a>
    )
  }

  return (
    <a
      href="#"
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(item.id)
      }}
      className={navRowClasses(active)}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </a>
  )
}

/**
 * Selected rows take the raised surface. The brand guide has no
 * `selected-subtle` role that stays visible on a recessed rail — `accent` and
 * the rail resolve to the same value in the light theme — so the selected row
 * borrows the same recessed/raised relationship the metric strip uses, which
 * inverts correctly in dark mode.
 */
function navRowClasses(active: boolean) {
  return cn(
    "flex items-center gap-s1 rounded-md px-s2xs py-s3xs text-t1 outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "motion-safe:transition-colors",
    active
      ? "bg-surface-raised font-medium text-foreground"
      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
  )
}

/** The rail's visual anchor and its only solid-accent control. */
function CreateButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="w-full bg-accent-solid font-semibold text-accent-solid-foreground hover:bg-accent-solid/90"
          size="lg"
        >
          Create
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width)"
      >
        <DropdownMenuItem>New post</DropdownMenuItem>
        <DropdownMenuItem>New note</DropdownMenuItem>
        <DropdownMenuItem>Import</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
