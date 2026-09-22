"use client"

import * as React from "react"

import { SectionHeader } from "@/components/profile/section-header"
import { TimelineItemRow } from "@/components/profile/timeline-item"
import { Button } from "@/components/ui/button"
import type { TimelineMonth } from "@/lib/profile/types"

/**
 * Spec §8 — Contribution activity.
 *
 * Lives in the same narrower left sub-column as the contributions card, so it is
 * deliberately narrower than README and Pinned above it (§16.24). The orchestrator's
 * grid enforces that width — this component never sets its own `max-w`.
 *
 * The page ends at the footer note. There is no site footer (§16.26).
 */
export function ActivityTimeline({
  months,
  hasMore,
  moreMonths,
}: {
  months: TimelineMonth[]
  hasMore: boolean
  moreMonths: TimelineMonth[]
}): React.JSX.Element {
  const headingId = React.useId()

  // §13 — clicking appends the next page *below* the existing items, so scroll
  // position is untouched, and the button disappears once `hasMoreActivity`
  // would go false. Appending rather than replacing is the whole point.
  const [showingMore, setShowingMore] = React.useState(false)
  const visibleMonths = showingMore ? [...months, ...moreMonths] : months
  const canLoadMore = hasMore && !showingMore && moreMonths.length > 0

  const isEmpty = months.length === 0

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <SectionHeader id={headingId} label="Contribution activity" />

      {isEmpty ? (
        // §13 empty state: heading + a single muted line. No month header, no rail,
        // no "Show more" button — but the footer note stays.
        <p className="text-sm text-muted-foreground">
          No contribution activity in this period.
        </p>
      ) : (
        <>
          {visibleMonths.map((month) => (
            <div key={`${month.month}-${month.year}`} className="flex flex-col pl-4">
              {/* Month header — slightly inset, with a border/default rule filling the
                  remaining width and vertically centred on the label. */}
              <div className="flex items-center gap-3">
                <h3 className="text-base whitespace-nowrap">
                  <span className="font-bold text-foreground">{month.month}</span>{" "}
                  <span className="text-muted-foreground">{month.year}</span>
                </h3>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>

              {/* Item stack. The rail lives here, not on the section, so it starts
                  below the month header and stops just past the last item — it never
                  reaches the button and never touches the month rule (§8). */}
              <div className="relative flex flex-col pt-3 pb-3">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-3.5 w-px -translate-x-1/2 bg-border/60"
                />
                {month.items.map((item, index) => (
                  <TimelineItemRow key={`${item.kind}-${index}`} item={item} />
                ))}
              </div>
            </div>
          ))}

          {canLoadMore ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowingMore(true)}
              className="w-full bg-background font-bold text-primary shadow-none"
            >
              Show more activity
            </Button>
          ) : null}
        </>
      )}

      {/* Footer note (§8, region I). The terminal full stop sits outside the link. */}
      <p className="text-sm text-foreground">
        Seeing something unexpected? Take a look at the{" "}
        <a href="#" className="text-primary underline underline-offset-4">
          profile guide
        </a>
        .
      </p>
    </section>
  )
}
