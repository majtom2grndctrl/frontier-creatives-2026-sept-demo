import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * Spec §7.3 — the year rail.
 *
 * A vertical list of years, newest first, with even vertical pitch. It fills
 * whatever width the orchestrator's grid column gives it — it sets no width of
 * its own — so the selected chip's right edge lands flush with the main
 * column's right edge (§18, composition checklist).
 *
 * §13 calls this a single-selection control; §14 resolves *how*: "a list of
 * links, one marked `aria-current='page'`. Not a tablist — it navigates."
 * So each entry is a `next/link` to `/profile?year=<year>`; the page reads the
 * search param and swaps the heatmap, the header count, the activity overview
 * and the timeline. The rail itself never changes.
 *
 * Every entry carries the *same* horizontal padding and only the selected one
 * takes a fill, so the unselected years' text left edges line up with the
 * selected chip's label structurally rather than by eye (§7.3, [observed]).
 * `rounded-2xl` sits one rung above a card's `rounded-xl` on §12.3's radius
 * ladder. No header, no "show all", no dividers, no shadow (§16.10).
 *
 * Responsive (§15): at `lg` and up the rail is the vertical column above, with
 * no scrollbar of its own (§16.25). Below `lg` it becomes a horizontally
 * scrolling row of chips — the one scroll container the screen is allowed, and
 * only below the wide breakpoint.
 */
export function YearRail({
  years,
  selectedYear,
}: {
  years: number[]
  selectedYear: number
}) {
  return (
    <nav aria-label="Contribution years">
      <ul className="flex flex-row gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {years.map((year) => {
          const isSelected = year === selectedYear

          return (
            <li key={year} className="shrink-0 lg:shrink lg:w-full">
              <Link
                href={`/profile?year=${year}`}
                aria-current={isSelected ? "page" : undefined}
                className={cn(
                  "block rounded-2xl px-3 py-1.5 text-left text-sm whitespace-nowrap no-underline transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {year}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
