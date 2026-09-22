"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The contributions band's year switcher (spec §7.3). §14 calls this a list
 * of links with one `aria-current="page"`; §13 calls its click behaviour an
 * in-place data swap, not navigation. Both are true at once here: real
 * anchors carry the link semantics, and the click handler prevents the
 * default navigation and hands off to `onSelectYear` instead.
 *
 * Composed from a bare `<a>` rather than `Button asChild`: the button's
 * `justify-center` and numeric-scale padding fight two requirements at
 * once — the label must sit left-aligned in a chip that hugs nothing, and
 * every entry (selected or not) needs identical padding so the unselected
 * text lines up with the chip's label without hand-tuned indents.
 */
export function YearRail({
  years,
  selectedYear,
  onSelectYear,
}: {
  years: number[]
  selectedYear: number
  onSelectYear?: (year: number) => void
}): React.JSX.Element {
  return (
    <nav aria-label="Contribution years" className="w-full">
      {/* No header, no "show all", no divider lines, and at the wide
          breakpoint no scroll container either (spec §7.3, §16.25) — just the
          list. Below wide the rail drops beneath the contributions card, where
          fifteen stacked years would be a wall; §15 turns it into a
          horizontally scrolling row of chips, one of only two places on this
          screen allowed its own scrollbar. */}
      <ul className="flex w-full flex-row gap-s2xs overflow-x-auto lg:flex-col lg:gap-0 lg:overflow-x-visible">
        {years.map((year) => {
          const selected = year === selectedYear

          return (
            <li key={year} className="shrink-0 lg:shrink">
              <a
                href={`#contributions-${year}`}
                aria-current={selected ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onSelectYear?.(year)
                }}
                className={cn(
                  // Same width, padding and alignment on every entry —
                  // selected/unselected differ only in fill and text color,
                  // which is what keeps the unselected left edge exactly
                  // under the chip's label (spec §7.3).
                  "flex w-full items-center justify-center rounded-lg px-s2 py-s2xs text-t1 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:justify-start",
                  selected
                    ? "bg-accent-solid text-white"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {year}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
