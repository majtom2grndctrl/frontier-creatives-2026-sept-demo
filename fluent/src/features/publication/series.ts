// pure series maths for the trend chart (§6.3, §12.2). No DOM, no react, so §17's
// "keep the series-slicing for a period in a pure function" stays testable.

import type { Period, SeriesPoint } from './types'

export const PERIODS: readonly Period[] = ['30d', '90d', '1y', 'all']

/** the §6.1 period select's option labels. */
export const PERIOD_LABELS: Record<Period, string> = {
  '30d': '30 days',
  '90d': '90 days',
  '1y': '1 year',
  all: 'All time',
}

/** the short form the third metric label embeds — `1y views` (§6.2). */
export const PERIOD_SHORT_LABELS: Record<Period, string> = {
  '30d': '30d',
  '90d': '90d',
  '1y': '1y',
  all: 'all time',
}

/** window length in days; `all` has none — it starts at the first point. */
export const PERIOD_DAYS: Record<Period, number | null> = {
  '30d': 30,
  '90d': 90,
  '1y': 365,
  all: null,
}

export interface YDomain {
  min: number
  max: number
}

export interface XDomain {
  start: Date
  end: Date
}

export interface SeriesSlice {
  points: SeriesPoint[]
  yDomain: YDomain
  xDomain: XDomain
}

const DAY_MS = 24 * 60 * 60 * 1000

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

/**
 * The y-domain starts at the series minimum, **not** at zero (§6.3), so the
 * shape of a 33 → 38 climb is readable. A flat series would collapse to a zero-
 * height domain, so it is widened by one unit — that keeps the empty metric's
 * all-zero series plottable (§14.3) instead of dividing by zero.
 */
export function computeYDomain(points: SeriesPoint[]): YDomain {
  if (points.length === 0) return { min: 0, max: 1 }
  let min = points[0].value
  let max = points[0].value
  for (const point of points) {
    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
  }
  return min === max ? { min, max: max + 1 } : { min, max }
}

/**
 * The points falling inside `period`, counted back from `now`.
 *
 * The series is cumulative (§11), so a window that opens mid-run carries the last
 * value from before the window forward to the window's start — otherwise a 30-day
 * slice of the §12.2 data would begin at its one riser and assert a jump from
 * nothing. `all` returns the series untouched.
 */
export function sliceSeries(
  series: SeriesPoint[],
  period: Period,
  now: string | Date = new Date(),
): SeriesPoint[] {
  const days = PERIOD_DAYS[period]
  if (days === null || series.length === 0) return [...series]

  const cutoff = new Date(toDate(now).getTime() - days * DAY_MS)
  const inWindow = series.filter((point) => toDate(point.date) >= cutoff)

  if (inWindow.length === series.length) return inWindow

  const lastBefore = series
    .filter((point) => toDate(point.date) < cutoff)
    .at(-1)

  if (!lastBefore) return inWindow

  return [{ date: cutoff.toISOString(), value: lastBefore.value }, ...inWindow]
}

/**
 * The §6.3 plot input: the slice for a period plus the domains it should be drawn
 * against. The x-domain runs from the first plotted point to `now`, so a series
 * whose final riser lands a few days short still reads as reaching the right edge.
 */
export function getSeriesSlice(
  series: SeriesPoint[],
  period: Period,
  now: string | Date = new Date(),
): SeriesSlice {
  const points = sliceSeries(series, period, now)
  const end = toDate(now)
  const lastPoint = points.at(-1)
  const lastDate = lastPoint ? toDate(lastPoint.date) : end

  return {
    points,
    yDomain: computeYDomain(points),
    xDomain: {
      start: points.length > 0 ? toDate(points[0].date) : end,
      end: lastDate > end ? lastDate : end,
    },
  }
}

const PERIOD_TOKEN = /^(30d|90d|1y|all time)\s+/i

/**
 * §6.2 — the third segment's label embeds the selected period (`1y views`), so it
 * is derived rather than constant: change the period and the label follows.
 */
export function metricLabelForPeriod(label: string, period: Period): string {
  return PERIOD_TOKEN.test(label)
    ? label.replace(PERIOD_TOKEN, `${PERIOD_SHORT_LABELS[period]} `)
    : label
}

/**
 * §15 — the sentence the chart uses as its text alternative: start value, end
 * value, direction and period.
 */
export function describeSeries(
  points: SeriesPoint[],
  metricLabel: string,
  period: Period,
): string {
  if (points.length === 0) {
    return `${metricLabel}: no data over the last ${PERIOD_LABELS[period].toLowerCase()}.`
  }
  const start = points[0].value
  const end = points[points.length - 1].value
  const direction = end > start ? 'up' : end < start ? 'down' : 'flat'
  return `${metricLabel} over the last ${PERIOD_LABELS[
    period
  ].toLowerCase()}: ${direction} from ${start} to ${end}.`
}
