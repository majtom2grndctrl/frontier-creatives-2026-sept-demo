"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AppWindow,
  ArrowUpRight,
  ChartNoAxesColumn,
  ChevronDown,
  CircleDollarSign,
  House,
  Send,
  Users,
} from "lucide-react"

import { publication } from "@/data/dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StubMenu, StubPopover } from "@/components/dashboard/stub-menu"
import { cn } from "@/lib/utils"

/**
 * Spec §3 — Region A, the sidebar rail. Renders inner content only; the
 * orchestrator owns the rail's fixed width and positioning.
 */
export function AppSidebar() {
  const pathname = usePathname()

  const primaryNav = [
    { label: "Home", href: "/publication", icon: House, external: false },
  ]

  const secondaryNav = [
    { label: "Publish", href: "/publication/publish", icon: Send },
    { label: "Audience", href: "/publication/audience", icon: Users },
    { label: "Analytics", href: "/publication/analytics", icon: ChartNoAxesColumn },
    { label: "Revenue", href: "/publication/revenue", icon: CircleDollarSign },
  ]

  return (
    <div className="flex h-full flex-col gap-6 bg-surface-recessed p-4">
      {/* 1. Publication identity card */}
      <StubPopover
        title="Switch publication"
        description="Choose a different publication to manage."
      >
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg border p-3 text-left outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Avatar size="sm" className="rounded-md">
            <AvatarImage src={publication.avatarUrl} alt="" />
            <AvatarFallback className="rounded-md">
              {publication.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-semibold">
            {publication.name}
          </span>
        </button>
      </StubPopover>

      {/* 2. Primary nav group */}
      <nav aria-label="Primary" className="flex flex-col gap-1">
        {primaryNav.map((item) => {
          const isSelected = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isSelected
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
        <a
          href="https://meridiannotes.example.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Website (opens in a new tab)"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <AppWindow className="size-4" />
          Website
          <ArrowUpRight className="ml-auto size-4" />
        </a>
      </nav>

      {/* 3. Create button */}
      <StubMenu label="Create" items={["New post", "New note", "Import"]}>
        <Button className="w-full justify-between font-semibold">
          Create
          <ChevronDown className="size-4" />
        </Button>
      </StubMenu>

      {/* 4. Secondary nav group */}
      <nav aria-label="Secondary" className="flex flex-col gap-1">
        {secondaryNav.map((item) => {
          const isSelected = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isSelected
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
