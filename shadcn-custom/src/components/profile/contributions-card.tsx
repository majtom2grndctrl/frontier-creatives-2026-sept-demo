import * as React from "react"
import { Book } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { ProfileCard } from "@/components/profile/primitives"
import { ContributionHeatmap } from "@/components/profile/contribution-heatmap"
import { ActivityBreakdownChart } from "@/components/profile/activity-breakdown-chart"
import { pluralize } from "@/lib/profile/format"
import type { ActivityOverview, ContributionYear } from "@/lib/profile/types"

/* -------------------------------------------------------------------------
   Region padding (spec §12.3)

   ProfileCard ships no padding on purpose, so the divider between §7.2a and
   §7.2b can run edge to edge. One value stands in for the card's "roughly
   uniform" internal padding and is reused for both regions and for the
   §7.2b vertical rule's inset, since the spec ties that inset to this same
   figure.
   ---------------------------------------------------------------------- */
const REGION_PADDING = "p-s4"

/* -------------------------------------------------------------------------
   "Contributed to …" sentence (spec §7.2b)
   ---------------------------------------------------------------------- */

/**
 * English list join with no Oxford comma — "a, b and c" — built from
 * whatever nodes are handed in rather than assuming a fixed shape, so the
 * repository links and the trailing "N other repositories" text share one
 * code path.
 */
function joinAsSentence(parts: React.ReactNode[]): React.ReactNode {
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 ? (i === parts.length - 1 ? " and " : ", ") : null}
      {part}
    </React.Fragment>
  ))
}

function ContributedToSentence({
  contributedTo,
}: {
  contributedTo: ActivityOverview["contributedTo"]
}) {
  const { named, otherCount } = contributedTo

  const parts: React.ReactNode[] = named.slice(0, 3).map((repo) => (
    // whitespace-nowrap: a link may not break across lines (spec §7.2b).
    <a
      key={repo}
      href="#"
      className="whitespace-nowrap font-bold text-accent-solid hover:underline"
    >
      {repo}
    </a>
  ))

  if (otherCount > 0) {
    parts.push(
      <React.Fragment key="other">
        {pluralize(otherCount, "other repository", "other repositories")}
      </React.Fragment>
    )
  }

  return <p className="text-t1 text-foreground">Contributed to {joinAsSentence(parts)}</p>
}

/* -------------------------------------------------------------------------
   Contributions card (spec §7.2)
   ---------------------------------------------------------------------- */

export function ContributionsCard({
  contributions,
  activityOverview,
}: {
  contributions: ContributionYear
  activityOverview: ActivityOverview
}): React.JSX.Element {
  return (
    <ProfileCard>
      <div className={REGION_PADDING}>
        <ContributionHeatmap contributions={contributions} />
      </div>

      {/* Full-bleed border/default rule, touching both card edges — the
          opposite treatment from the inset vertical rule below (spec §16.18). */}
      <Separator />

      <div className={REGION_PADDING}>
        {/* Single column below md so the chart falls under the text (spec
            §15); the vertical rule only makes sense once there are two
            side-by-side panes, so it appears at the same breakpoint. */}
        <div className="grid grid-cols-1 gap-s3 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-s1">
            <h3 className="text-t1 font-normal text-foreground">
              Activity overview
            </h3>
            {/* Glyph as a flex sibling of the paragraph, not inline within
                it, so a wrapped second line lands under the paragraph's own
                left edge — clearing the glyph — instead of under the icon
                (spec §7.2b hanging indent). */}
            <div className="flex items-start gap-s1">
              <Book
                aria-hidden="true"
                className="mt-s4xs size-4 shrink-0 text-muted-foreground"
              />
              <ContributedToSentence contributedTo={activityOverview.contributedTo} />
            </div>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="mx-auto w-full max-w-s15">
            <ActivityBreakdownChart breakdown={activityOverview.breakdown} />
          </div>
        </div>
      </div>
    </ProfileCard>
  )
}
