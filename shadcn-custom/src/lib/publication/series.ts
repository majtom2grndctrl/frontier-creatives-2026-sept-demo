import { TODAY } from "./format"
import type { Period, SeriesPoint } from "./types"

/**
 * Pure series maths for the trend chart (spec §6.3). No DOM, no React — the
 * period slicing and the scale are testable on their own.
 */

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "all", label: "All time" },
]

/** The token the "<period> views" metric label is built from (spec §6.2). */
export const PERIOD_METRIC_TOKEN: Record<Period, string> = {
  "30d": "30d",
  "90d": "90d",
  "1y": "1y",
  all: "All-time",
}

export function periodLabel(period: Period): string {
  return PERIOD_OPTIONS.find((option) => option.value === period)!.label
}

/** Start of the period window, or `null` for "all time". */
export function periodStart(period: Period, today: Date = TODAY): Date | null {
  const start = new Date(today)
  switch (period) {
    case "30d":
      start.setDate(start.getDate() - 30)
      return start
    case "90d":
      start.setDate(start.getDate() - 90)
      return start
    case "1y":
      start.setFullYear(start.getFullYear() - 1)
      return start
    case "all":
      return null
  }
}

export interface SlicedSeries {
  /** Plot domain, left to right. */
  start: Date
  end: Date
  /** Step vertices: the first sits on `start`, carrying the running total. */
  points: { date: Date; value: number }[]
}

/**
 * Clip a cumulative series to a period window.
 *
 * The window's first point is synthesised from the running total at the
 * window start, so a 30-day view of a year-long series still plots the count
 * the reader had on day one rather than starting from nothing.
 */
export function sliceSeries(
  series: SeriesPoint[],
  period: Period,
  today: Date = TODAY
): SlicedSeries {
  const parsed = series
    .map((point) => ({ date: new Date(point.date), value: point.value }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const firstDate = parsed[0]?.date ?? today
  const windowStart = periodStart(period, today)
  // The domain never starts before the data does, so a one-year view of a
  // one-year series lines up with its first reading instead of leading it.
  const start =
    windowStart && windowStart > firstDate ? windowStart : firstDate

  const inWindow = parsed.filter(
    (point) => point.date >= start && point.date <= today
  )
  const carried = parsed.filter((point) => point.date <= start).at(-1)
  const opening = {
    date: start,
    value: carried?.value ?? parsed[0]?.value ?? 0,
  }

  const points =
    inWindow[0] && inWindow[0].date.getTime() === start.getTime()
      ? inWindow
      : [opening, ...inWindow]

  return { start, end: today, points }
}

export interface YScale {
  /** Domain floor — the series minimum, not zero (spec §6.3). */
  min: number
  max: number
  /** Integer gridline values inside the domain. */
  ticks: number[]
}

const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]

/**
 * A y scale whose domain starts at the series minimum. A flat series (the
 * empty metric's run of zeros) gets a padded domain and a single tick so it
 * plots a valid line down the middle instead of collapsing.
 */
export function computeYScale(values: number[], maxTicks = 6): YScale {
  if (values.length === 0) return { min: 0, max: 1, ticks: [0] }

  const min = Math.min(...values)
  const max = Math.max(...values)
  // A flat run still starts its domain at the series minimum, so the line
  // rests on the plot floor rather than floating mid-plot.
  if (min === max) return { min, max: min + 1, ticks: [min] }

  const step =
    NICE_STEPS.find((candidate) => (max - min) / candidate <= maxTicks - 1) ??
    Math.ceil((max - min) / (maxTicks - 1))

  const ticks: number[] = []
  for (let tick = Math.ceil(min / step) * step; tick <= max; tick += step) {
    ticks.push(tick)
  }
  return { min, max, ticks: ticks.length > 0 ? ticks : [min, max] }
}

/** `count` evenly spaced dates across the domain, for the x axis. */
export function axisDates(start: Date, end: Date, count = 7): Date[] {
  const span = end.getTime() - start.getTime()
  return Array.from(
    { length: count },
    (_, index) => new Date(start.getTime() + (span * index) / (count - 1))
  )
}

/** The step value in force at `date` — what the crosshair reads off. */
export function valueAt(points: SlicedSeries["points"], date: Date): number {
  const held = points.filter((point) => point.date <= date).at(-1)
  return (held ?? points[0]).value
}
