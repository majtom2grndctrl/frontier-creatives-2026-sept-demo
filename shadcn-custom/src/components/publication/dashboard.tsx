"use client"

import * as React from "react"

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DraftsCard } from "./drafts-card"
import { LatestPostCard } from "./latest-post-card"
import { OverviewSection } from "./overview-section"
import { PaneHeader } from "./pane-header"
import { RecentPostsCard } from "./recent-posts-card"
import { PublicationSidebar } from "./sidebar"
import {
  DEFAULT_METRIC_ID,
  author,
  drafts,
  getMetrics,
  latestPost,
  posts,
  publication,
} from "@/lib/publication/fixture"
import type { Period } from "@/lib/publication/types"

/**
 * The app shell (spec §2) plus the small amount of state the screen owns:
 * which metric the chart plots, over what period, and which nav row is
 * selected. Everything else is fixture data passed down.
 */

const NAV_TITLES: Record<string, string> = {
  home: "Home",
  publish: "Publish",
  audience: "Audience",
  analytics: "Analytics",
  revenue: "Revenue",
}

export function PublicationDashboard() {
  const [selectedMetricId, setSelectedMetricId] =
    React.useState(DEFAULT_METRIC_ID)
  const [period, setPeriod] = React.useState<Period>("1y")
  const [activeNavId, setActiveNavId] = React.useState("home")
  const [navOpen, setNavOpen] = React.useState(false)

  /* Rebuilt per period: the third segment's label embeds the selected range. */
  const metrics = React.useMemo(() => getMetrics(period), [period])

  function navigate(id: string) {
    setActiveNavId(id)
    setNavOpen(false)
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-surface-recessed">
        {/* Region A — fixed rail, roughly a seventh of a wide viewport. */}
        <aside className="hidden w-s14 shrink-0 overflow-y-auto lg:block">
          <PublicationSidebar
            publication={publication}
            activeNavId={activeNavId}
            onNavigate={navigate}
          />
        </aside>

        {/* Below the wide breakpoint the same rail becomes a drawer. */}
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent side="left" className="w-s14 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <PublicationSidebar
              publication={publication}
              activeNavId={activeNavId}
              onNavigate={navigate}
            />
          </SheetContent>
        </Sheet>

        {/* Region B — raised pane, inset from the rail. */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-xl border-l border-border bg-surface-raised">
          <PaneHeader
            title={NAV_TITLES[activeNavId] ?? "Home"}
            author={author}
            onOpenNav={() => setNavOpen(true)}
          />

          <div className="flex-1 overflow-y-auto">
            {/* Region B2 — a centred column with bare pane surface either
                side. The cap is wider than the source's half-pane column
                because this brand guide's body role is 18px: a post title has
                to fit at full width without truncating, and the measure has
                to scale with the type. */}
            <div className="mx-auto flex max-w-5xl flex-col gap-s5 px-s3 py-s5">
              {activeNavId === "home" ? (
                <>
                  <OverviewSection
                    metrics={metrics}
                    selectedMetricId={selectedMetricId}
                    onSelectMetric={setSelectedMetricId}
                    period={period}
                    onPeriodChange={setPeriod}
                    domain={publication.domain}
                  />

                  {/* Equal-height pair: Drafts takes its height from here. */}
                  <div className="grid gap-s3 md:grid-cols-2">
                    <LatestPostCard post={latestPost} author={author} />
                    <DraftsCard drafts={drafts} />
                  </div>

                  <RecentPostsCard posts={posts} author={author} />
                </>
              ) : (
                <StubPage title={NAV_TITLES[activeNavId] ?? activeNavId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

/** Other destinations are out of scope for this screen; they render a stub. */
function StubPage({ title }: { title: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-raised p-s5 text-center">
      <h2 className="text-t2 font-semibold">{title}</h2>
      <p className="mt-s1 text-t1 text-muted-foreground">
        This prototype builds the Home dashboard only.
      </p>
    </div>
  )
}
