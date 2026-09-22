"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatFullDate, pluralize } from "@/lib/profile/format"
import { CELL_CLASS, CONTRIBUTION_LEVEL_BG } from "@/lib/profile/ramp"
import type { ContributionDay, ContributionYear } from "@/lib/profile/types"
import { cn } from "@/lib/utils"

/**
 * The gutter between cells is roughly a quarter of a cell's edge (spec §7.2a).
 * The spacing series bottoms out at `s4xs` (5.24px), half a cell — too wide.
 * This is the one-off micro-adjustment AGENTS.md sanctions the numeric scale
 * for, so the grid's gutter and the legend's gutter are both `0.5` (2px).
 */
const CELL_GUTTER = "border-spacing-0.5"

/** A month earns a label only once it owns this many columns (spec §16.13). */
const MIN_LABELLED_COLUMNS = 3

function monthShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
  })
}

function weekdayShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  })
}

/** "1 contribution on …" / "312 contributions on …" / "No contributions on …". */
function cellLabel(day: ContributionDay): string {
  const when = formatFullDate(day.date)
  return day.count === 0
    ? `No contributions on ${when}`
    : `${pluralize(day.count, "contribution", "contributions")} on ${when}`
}

/**
 * The heatmap region of the contributions card (spec §7.2a): the grid plus the
 * legend row beneath it. The card shell, its divider, and the activity
 * overview below belong to the card, not here.
 *
 * Every dimension is read off the data. `days` is one flat chronological run
 * starting on a Sunday, so chunking by seven *is* the column derivation — the
 * leading week comes out full and the trailing one short, which is exactly
 * what §7.2a asks for. Nothing counts weeks or days.
 */
export function ContributionHeatmap({
  contributions,
}: {
  contributions: ContributionYear
}) {
  const weeks: ContributionDay[][] = []
  for (let i = 0; i < contributions.days.length; i += 7) {
    weeks.push(contributions.days.slice(i, i + 7))
  }

  /* Only the second, fourth and sixth rows are labelled — Mon/Wed/Fri on a
     Sunday-first grid. The names come from the first week's own dates so the
     column can't drift out of step with the rows it labels. */
  const rowLabels = weeks[0].map((day, row) =>
    row % 2 === 1 ? weekdayShort(day.date) : ""
  )

  /* A column belongs to the month of its first day; consecutive columns with
     the same month form one run. A run shorter than MIN_LABELLED_COLUMNS has
     nowhere to put the name, which is why the trailing partial month goes
     unlabelled (§16.13) — no special case for "last". */
  const monthRuns: { key: string; label: string; span: number }[] = []
  for (const week of weeks) {
    const key = week[0].date.slice(0, 7)
    const previous = monthRuns[monthRuns.length - 1]
    if (previous && previous.key === key) {
      previous.span += 1
    } else {
      monthRuns.push({ key, label: monthShort(week[0].date), span: 1 })
    }
  }

  return (
    /* One provider for the whole grid rather than one per cell. 366 Radix
       tooltip roots is a real cost, but a closed root renders no DOM, and §13
       prescribes tooltip *text* that a native `title` would show late,
       unstyled, and never on focus. */
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col gap-s2">
        {/* `Table`'s own overflow-x-auto container is wanted: §15 makes the
            heatmap one of two elements allowed a scrollbar, and only below the
            wide breakpoint, where the grid still fits (§16.25). */}
        {/* Two sizing modes, one per spec clause. Below the wide breakpoint
            the cells hold their token size and the table keeps its intrinsic
            ~690px width, so `Table`'s own container scrolls — §15 names the
            heatmap as one of only two elements allowed to. At wide the table
            goes fluid instead (`table-fixed w-full`, square cells sized by
            their column) so it always fits its sub-column: §16.25 forbids any
            element its own scrollbar there, and a 53-week grid does not fit a
            1024px layout at a fixed cell size. */}
        <Table
          aria-label="Contribution activity by day"
          className={cn("w-auto border-separate lg:w-full lg:table-fixed", CELL_GUTTER)}
        >
          <TableHeader className="[&_tr]:border-b-0">
            <TableRow className="border-b-0 hover:bg-transparent">
              {/* Corner cell. Under `table-fixed` the first row sets the
                  column widths, so this is where the day-label column's width
                  is declared. */}
              <TableHead className="h-auto w-s7 p-0" />
              {monthRuns.map((run) => (
                <TableHead
                  key={run.key}
                  colSpan={run.span}
                  className="h-auto p-0 pb-s4xs text-left align-bottom text-sm font-normal text-muted-foreground"
                >
                  {run.span >= MIN_LABELLED_COLUMNS ? run.label : null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowLabels.map((label, row) => (
              <TableRow key={row} className="border-b-0 hover:bg-transparent">
                <TableHead
                  scope="row"
                  className="h-auto p-0 pr-s3xs align-middle font-normal"
                >
                  {/* Body rows are one cell tall. `text-sm` has a taller line
                      box than a cell, so the label is pinned to a cell-height
                      box and allowed to spill — otherwise the three labelled
                      rows would stretch and the grid would go uneven. */}
                  <span className="flex h-sxs items-center justify-end text-sm leading-none text-muted-foreground">
                    {label}
                  </span>
                </TableHead>
                {weeks.map((week, column) => {
                  const day = week[row]
                  /* The newest column stops where the year does; its remaining
                     rows are empty, never a level-0 square (§16.12). */
                  if (!day) {
                    return <TableCell key={column} className="p-0" />
                  }
                  const label = cellLabel(day)
                  return (
                    <TableCell key={column} className="p-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={label}
                            className={cn(
                              CELL_CLASS,
                              "lg:size-auto lg:aspect-square lg:w-full",
                              CONTRIBUTION_LEVEL_BG[day.level],
                              /* The ring is wider than the gutter, so the
                                 focused cell has to paint over its neighbours
                                 (§14: a visible ring on every cell). */
                              "relative block outline-none focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{label}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-s2">
          {/* Quiet text, not a link colour (§16.22). */}
          <a
            href="#"
            className="rounded-xs text-sm text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Learn how we count contributions
          </a>
          {/* Decorative: the cells already announce their own counts (§14). */}
          <div
            aria-hidden
            className="flex items-center gap-s3xs text-sm text-muted-foreground"
          >
            Less
            <span className="flex items-center gap-0.5">
              {CONTRIBUTION_LEVEL_BG.map((background, level) => (
                <span key={level} className={cn(CELL_CLASS, background)} />
              ))}
            </span>
            More
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
