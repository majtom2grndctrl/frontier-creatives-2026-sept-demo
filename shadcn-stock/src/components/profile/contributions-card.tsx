import { BookMarked, ChevronDown } from "lucide-react"

import { ActivityBreakdownChart } from "@/components/profile/activity-breakdown-chart"
import { ContributionHeatmap } from "@/components/profile/contribution-heatmap"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCount } from "@/lib/profile/format"
import type { ActivityOverview, ContributionYear } from "@/lib/profile/types"

/**
 * Spec §7.1 + §7.2 — the header row and the contributions card beneath it.
 *
 * §7.1's row sits *above* the card's top border, not inside it, so the two live
 * together here. The card itself is ONE card holding two stacked regions split
 * by a full-bleed rule that touches both card edges (§7.2).
 *
 * Card padding is set once, on each region, and the activity-overview pane
 * divider inherits that inset — which is what satisfies §16.18: the vertical
 * rule stops short of the card's top and bottom edges by the card's own
 * padding rather than running corner to corner.
 */
export function ContributionsCard({
  year,
  selectedYear,
  activityOverview,
}: {
  year: ContributionYear
  selectedYear: number
  activityOverview: ActivityOverview
}) {
  return (
    <section aria-labelledby="contributions-heading" className="flex flex-col gap-2">
      {/* §7.1 — outside the card. */}
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="contributions-heading" className="text-base font-normal text-foreground">
          {year.total > 0
            ? `${formatCount(year.total)} contributions in the last year`
            : `No contributions in ${selectedYear}`}
        </h2>
        {/* A menu trigger. Out of scope (§13) — rendered as a no-op. */}
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2 h-auto gap-1 px-2 py-1 text-sm font-normal text-muted-foreground shadow-none"
        >
          Contribution settings
          <ChevronDown className="size-4" />
        </Button>
      </div>

      {/* §16.1 — the card fill is the page surface; only the border separates them. */}
      <Card className="gap-0 rounded-xl border-border bg-background p-0 py-0 shadow-none">
        {/* The heatmap region owns its own `p-4`, which is the card's internal
            padding — the same inset the pane divider below inherits (§16.18). */}
        <ContributionHeatmap year={year} />

        {/* §7.2 — a full-bleed rule touching both card edges. */}
        <div className="grid grid-cols-1 border-t border-border p-4 sm:grid-cols-2">
          {/* Left pane — a flowing sentence, not a list (§7.2b). */}
          <div className="flex flex-col gap-3 sm:pr-4">
            <h3 className="text-base font-normal text-foreground">Activity overview</h3>
            {/* Hanging indent: the glyph is taken out of flow so wrapped lines
                align with the first line's text rather than the glyph. */}
            <p className="relative pl-6 text-sm text-foreground">
              <BookMarked
                aria-hidden
                className="absolute top-0.5 left-0 size-4 text-muted-foreground"
              />
              <ContributedToSentence contributedTo={activityOverview.contributedTo} />
            </p>
          </div>

          {/* Right pane. The divider is a border on this pane, so it spans only
              the padded content box — inset top and bottom (§16.18). */}
          <div className="mt-4 border-border pt-4 sm:mt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
            <ActivityBreakdownChart breakdown={activityOverview.breakdown} />
          </div>
        </div>
      </Card>
    </section>
  )
}

/**
 * "Contributed to a, b and c and N other repositories" (§7.2b).
 *
 * Links are `accent/primary`, bold, comma-separated — no comma before "and",
 * no trailing comma on the last link. A link may not break across lines, so
 * each carries `whitespace-nowrap`.
 */
function ContributedToSentence({
  contributedTo,
}: {
  contributedTo: ActivityOverview["contributedTo"]
}) {
  const { named, otherCount } = contributedTo

  if (named.length === 0 && otherCount === 0) {
    return <span className="text-muted-foreground">No repository activity in this period.</span>
  }

  return (
    <>
      Contributed to{" "}
      {named.map((repo, i) => (
        <span key={repo}>
          <a href="#" className="font-bold whitespace-nowrap text-primary hover:underline">
            {repo}
          </a>
          {i < named.length - 1 ? ", " : null}
        </span>
      ))}
      {otherCount > 0
        ? ` and ${otherCount} other ${otherCount === 1 ? "repository" : "repositories"}`
        : null}
    </>
  )
}
