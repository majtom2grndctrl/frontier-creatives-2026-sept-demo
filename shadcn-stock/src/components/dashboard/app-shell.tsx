"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { PanelLeft } from "lucide-react"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { PaneHeader } from "@/components/dashboard/pane-header"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/** Region A/B of §2. One entry per sidebar destination; drives the pane title. */
const PAGE_TITLES: Record<string, string> = {
  "/publication": "Home",
  "/publication/publish": "Publish",
  "/publication/audience": "Audience",
  "/publication/analytics": "Analytics",
  "/publication/revenue": "Revenue",
}

/**
 * Spec §2 — the app shell.
 *
 * Region A is a fixed left rail on the *recessed* surface, full viewport height.
 * Region B is the raised content pane, inset from the rail with a rounded
 * top-left corner and a hairline left border, and it owns the scroll: the pane
 * header (B1) is sticky within it and the content column (B2) scrolls beneath.
 *
 * §16 — below `lg` the rail gives way to a drawer; the pane then runs full width.
 *
 * The shell belongs to the publication product alone. Every other route in this
 * workspace — the prototype index at `/`, and `/profile`, a different product
 * with its own full-bleed chrome band — renders outside it rather than
 * inheriting the dashboard's rail and pane header.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (!pathname.startsWith("/publication")) {
    return <>{children}</>
  }

  const title = PAGE_TITLES[pathname] ?? "Home"

  return (
    <div className="bg-surface-recessed flex h-svh w-full overflow-hidden">
      {/* Region A — roughly one-seventh of a wide desktop viewport. */}
      <div className="hidden w-56 shrink-0 lg:block">
        <AppSidebar />
      </div>

      {/* Region B — raised, inset, scroll container for B1 + B2. */}
      <div className="bg-card flex min-w-0 flex-1 flex-col overflow-y-auto border-l lg:rounded-tl-xl">
        <PaneHeader
          title={title}
          leading={
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <PanelLeft />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <AppSidebar />
              </SheetContent>
            </Sheet>
          }
        />
        {children}
      </div>
    </div>
  )
}

/**
 * Region B2 — the scrolling dashboard column. Centred with a max width, leaving
 * wide empty gutters of bare pane surface on both sides at the reference
 * viewport (§5). The gutters stay empty; no secondary rail goes in them.
 */
export function ContentColumn({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      {children}
    </main>
  )
}
