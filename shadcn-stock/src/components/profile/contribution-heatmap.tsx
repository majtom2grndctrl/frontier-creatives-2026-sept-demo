"use client"

import * as React from "react"

import {
  CONTRIBUTION_LEVEL_CLASS,
  contributionCellLabel,
} from "@/lib/profile/format"
import type { ContributionDay, ContributionYear } from "@/lib/profile/types"
import { cn } from "@/lib/utils"

/**
 * Heatmap region of the contributions card (spec §7.2a).
 *
 * Rendered as a real `<table>` — 7 day rows × 53 week columns — so the grid is
 * traversable by a screen reader (§14). Each populated cell carries its value
 * in its accessible name; colour is never the only channel.
 *
 * The hover tooltip (§13) is the native `title` attribute, deliberately *not*
 * the Radix `Tooltip` component: there are ~366 cells, and mounting 366 tooltip
 * instances (each with its own portal, popper and event wiring) is a real
 * performance problem for no semantic gain — `title` and `aria-label` already
 * carry the same string.
 */

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

/** Rows are Sunday-first; only Mon/Wed/Fri are labelled visibly (§7.2a). */
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const
const VISIBLE_DAY_ROWS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" }

/** A month label only renders when its run of columns is at least this long
 *  — that is what drops the label on the trailing partial month (§16.13). */
const MIN_LABELLED_COLUMNS = 3

const LEVELS = [0, 1, 2, 3, 4] as const

/**
 * Cells and legend swatches are the same size and radius (§7.2a). Sized so
 * that 53 columns plus the day-label gutter fit the contributions card at the
 * wide breakpoint — which is what keeps the scroll container below from ever
 * producing a scrollbar there (§16.25).
 */
const CELL_CLASS = "block size-[9px] rounded-xs"

/** Chunk the flat, ascending day array into Sunday-first week columns. The
 *  trailing column is short and is never padded (§16.12). */
function toWeekColumns(days: ContributionDay[]): ContributionDay[][] {
  const columns: ContributionDay[][] = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))
  return columns
}

interface MonthGroup {
  key: string
  label: string
  span: number
}

/** Group consecutive columns by the month of each column's first day. */
function toMonthGroups(columns: ContributionDay[][]): MonthGroup[] {
  const groups: MonthGroup[] = []
  for (const column of columns) {
    const date = column[0].date
    const key = date.slice(0, 7)
    const previous = groups[groups.length - 1]
    if (previous && previous.key === key) {
      previous.span += 1
      continue
    }
    groups.push({
      key,
      label: MONTH_SHORT[Number(date.slice(5, 7)) - 1],
      span: 1,
    })
  }
  return groups
}

function formatRangeDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function ContributionHeatmap({
  year,
}: {
  year: ContributionYear
}): React.JSX.Element {
  const columns = React.useMemo(() => toWeekColumns(year.days), [year.days])
  const monthGroups = React.useMemo(() => toMonthGroups(columns), [columns])

  // §15 — below the wide breakpoint the grid is its own horizontal scroll
  // container, opened on the newest week. `overflow-x-auto` is self-regulating:
  // at the wide breakpoint the grid fits, so no scrollbar appears (§16.25).
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Watched rather than run once: whether the grid overflows depends on the
    // viewport, so a window that narrows after mount must still land on the
    // newest week rather than the oldest.
    const toNewest = () => {
      if (el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth
    }
    toNewest()
    const observer = new ResizeObserver(toNewest)
    observer.observe(el)
    return () => observer.disconnect()
  }, [year.rangeEnd])

  const tableLabel = `Contribution activity from ${formatRangeDay(
    year.rangeStart
  )} to ${formatRangeDay(year.rangeEnd)}`

  return (
    <div className="flex flex-col gap-3 p-4">
      <div ref={scrollRef} className="overflow-x-auto">
        <table
          aria-label={tableLabel}
          className="border-separate border-spacing-[2px]"
        >
          <thead>
            <tr>
              {/* Empty corner cell, above the day-label column. */}
              <th
                scope="col"
                className="sticky left-0 bg-background p-0"
              />
              {monthGroups.map((group) => (
                <th
                  key={group.key}
                  scope="col"
                  colSpan={group.span}
                  className="p-0 text-left text-xs leading-none font-normal whitespace-nowrap text-muted-foreground"
                >
                  {group.span >= MIN_LABELLED_COLUMNS ? group.label : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAY_NAMES.map((dayName, rowIndex) => (
              <tr key={dayName}>
                <th
                  scope="row"
                  className="sticky left-0 bg-background p-0 pr-1 text-right align-middle text-xs leading-none font-normal whitespace-nowrap text-muted-foreground"
                >
                  {VISIBLE_DAY_ROWS[rowIndex] ?? (
                    <span className="sr-only">{dayName}</span>
                  )}
                </th>
                {columns.map((column, columnIndex) => {
                  const day = column[rowIndex]
                  // The trailing week stops at the newest day: the remaining
                  // rows render an empty cell, never a placeholder (§16.12).
                  if (!day) {
                    return <td key={`${dayName}-${columnIndex}`} className="p-0" />
                  }
                  const label = contributionCellLabel(day.date, day.count)
                  return (
                    <td
                      key={day.date}
                      tabIndex={0}
                      aria-label={label}
                      title={label}
                      className="rounded-xs p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                    >
                      <div
                        aria-hidden
                        className={cn(
                          CELL_CLASS,
                          CONTRIBUTION_LEVEL_CLASS[day.level]
                        )}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Quiet text, not an accent-coloured link (§16.22). */}
        <a
          href="#"
          className="text-xs text-muted-foreground hover:underline focus-visible:underline"
        >
          Learn how we count contributions
        </a>
        {/* A legend only — every cell already names its own value (§14). */}
        <div
          aria-hidden
          className="flex items-center gap-[2px] text-xs text-muted-foreground"
        >
          <span className="mr-1">Less</span>
          {LEVELS.map((level) => (
            <span
              key={level}
              className={cn("inline-block", CELL_CLASS, CONTRIBUTION_LEVEL_CLASS[level])}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  )
}
