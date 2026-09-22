"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActivityTimeline } from "./activity-timeline"
import { ChromeBand } from "./chrome-band"
import { ContributionsCard } from "./contributions-card"
import { PinnedGrid } from "./pinned-grid"
import { ProfileSidebar } from "./profile-sidebar"
import { ReadmeCard } from "./readme-card"
import { YearRail } from "./year-rail"
import {
  emptyActivityOverview,
  emptyContributionYear,
  profile,
  tabs,
} from "@/lib/profile/fixture"
import { formatCount } from "@/lib/profile/format"

/**
 * The Overview tab of a public developer profile (spec §2).
 *
 * Two structural decisions carry most of the layout, and both are easy to undo
 * by accident:
 *
 *  - Region B is a two-column grid with `items-start`. That single declaration
 *    is what lets the sidebar hug its content and end well above the main
 *    column, with bare page background beneath it (§16.4). `stretch` would
 *    quietly turn it into a full-height rail.
 *  - Region H nests a second two-column grid *inside* the main column, whose
 *    left sub-column owns the contributions card, the activity timeline and the
 *    "Show more" button, and whose right sub-column holds only the year rail.
 *    That is why the timeline is narrower than the README and Pinned sections
 *    above it (§16.24) and why the rail's lower entries end up alongside the
 *    timeline rather than the card (§7.3).
 *
 * `content-start` on the outer grid is load-bearing: `min-h-screen` gives the
 * grid surplus height whenever the document is shorter than the viewport, and
 * grid's default `align-content: stretch` would spend that surplus growing the
 * rows — inflating the chrome band into a tall block of tinted surface. Start
 * alignment parks the surplus below the content instead, where §16.4 wants it.
 *
 * Nothing on this page is sticky and nothing scrolls on its own; the document
 * scrolls as a single unit (§13, §16.25).
 */
export function ProfileOverview() {
  const [selectedYear, setSelectedYear] = React.useState(profile.selectedYear)

  /* Only the fixture's own year carries data. Every other year renders the
     empty states the spec already specifies rather than relabelling 2026's
     numbers (§13; see `emptyContributionYear`). */
  const isFixtureYear = selectedYear === profile.selectedYear
  const contributions = isFixtureYear
    ? profile.contributions
    : emptyContributionYear(selectedYear)
  const activityOverview = isFixtureYear
    ? profile.activityOverview
    : emptyActivityOverview
  const timeline = isFixtureYear ? profile.timeline : []

  const contributionSummary =
    contributions.total > 0
      ? `${formatCount(contributions.total)} contributions in the last year`
      : `No contributions in ${selectedYear}`

  return (
    <div className="grid-canvas min-h-screen content-start bg-background">
      <ChromeBand
        handle={profile.identity.handle}
        viewerAvatarUrl={profile.identity.avatarUrl}
        tabs={tabs}
        activeTabId="overview"
      />

      <main className="content-area pb-s8">
        {/* Region B — sidebar hugs, main column runs long. */}
        {/* `grid-cols-1` is not redundant: without an explicit template the
            single column is an implicit `auto` track, which sizes to
            max-content and lets a wide child (the heatmap) push the whole
            document sideways. The `minmax(0, …)` on the wide template is the
            same guard — a bare `1fr` keeps an auto minimum. */}
        <div className="grid grid-cols-1 items-start gap-s6 py-s6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <ProfileSidebar profile={profile} />

          {/* Region E */}
          <div className="flex min-w-0 flex-col gap-s6">
            {profile.readme ? (
              <ReadmeCard readme={profile.readme} isOwner={profile.isOwner} />
            ) : null}

            <PinnedGrid pinned={profile.pinned} isOwner={profile.isOwner} />

            {/* Region H — the narrower sub-column plus the year rail. Both
                columns are top-aligned at the header row below. */}
            <div className="grid grid-cols-1 items-start gap-s6 lg:grid-cols-[minmax(0,86fr)_minmax(0,14fr)]">
              <div className="flex min-w-0 flex-col gap-s6">
                {/* The summary line labels the card, so it binds to it at the
                    heading step rather than sitting a section's width away.
                    §7.1 — above the card's top border, not inside it. */}
                <div className="flex flex-col gap-s1">
                  <div className="flex flex-wrap items-baseline justify-between gap-s2">
                    <h2 className="text-t1 font-normal text-foreground">
                      {contributionSummary}
                    </h2>
                    <ContributionSettingsMenu />
                  </div>

                  <ContributionsCard
                    contributions={contributions}
                    activityOverview={activityOverview}
                  />
                </div>

                <ActivityTimeline
                  timeline={timeline}
                  hasMoreActivity={isFixtureYear && profile.hasMoreActivity}
                />

                {/* The capture ends here. This note is not a site footer, and
                    §16.26 says not to invent one below it. */}
                <p className="text-sm text-foreground">
                  Seeing something unexpected? Take a look at the{" "}
                  <a
                    href="#"
                    className="text-accent-solid underline underline-offset-4"
                  >
                    profile guide
                  </a>
                  .
                </p>
              </div>

              <YearRail
                years={profile.availableYears}
                selectedYear={selectedYear}
                onSelectYear={setSelectedYear}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/** Bare muted text plus a caret — a menu trigger with no border and no fill. */
function ContributionSettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-s4xs rounded-xs text-t1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
        Contribution settings
        <ChevronDown aria-hidden className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>Private contributions</DropdownMenuItem>
          <DropdownMenuItem>Activity overview</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
