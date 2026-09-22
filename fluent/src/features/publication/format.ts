// pure formatting helpers for the dashboard. no DOM, no react — testable directly.
//
// §10.3 is the important one: dates use a relative-year format, implemented once
// here rather than hardcoded per row.

import type { MetricFormat } from './types'

/** the dash shown where a metric has no value (§6.2). */
export const EMPTY_VALUE = '—'

/** what the empty metric announces to assistive tech instead of the dash (§15). */
export const EMPTY_VALUE_LABEL = 'No data'

/** the literal placeholder for a draft with no title (§8.3). Real text, never a `::after`. */
export const UNTITLED = 'Untitled'

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

const currentYearDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const priorYearDate = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const timeOfDay = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

/**
 * §10.3 — the one shared date formatter.
 *
 * A date in the current year renders as month + day (`Apr 22`); a date in a prior
 * year renders as full month + day + year (`July 18, 2024`). `now` is a parameter
 * so the branch can be exercised without mocking the clock.
 */
export function formatDate(
  value: string | Date,
  now: string | Date = new Date(),
): string {
  const date = toDate(value)
  const isCurrentYear = date.getFullYear() === toDate(now).getFullYear()
  return isCurrentYear ? currentYearDate.format(date) : priorYearDate.format(date)
}

/**
 * Date plus time of day, for the drafts list's `Edited …` line (§8.3) — e.g.
 * `Sep 3, 12:10 PM`. Follows the same relative-year rule as `formatDate`.
 */
export function formatDateTime(
  value: string | Date,
  now: string | Date = new Date(),
): string {
  const date = toDate(value)
  return `${formatDate(date, now)}, ${timeOfDay.format(date)}`
}

const integer = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

const signedInteger = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
  signDisplay: 'always',
})

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** grouped whole numbers: likes, comments, views, subscriber counts. */
export function formatCount(value: number): string {
  return integer.format(value)
}

/** `New subscribers` renders with an explicit sign (§7.3) — `+3`. */
export function formatSignedCount(value: number): string {
  return signedInteger.format(value)
}

export function formatCurrency(value: number): string {
  return currency.format(value)
}

/**
 * A 0–1 rate as a percentage. `Open rate` shows two decimals in the latest-post
 * card (`18.75%`) and none in the recent-posts column (`19%`) — same record,
 * different precision (§12.3).
 */
export function formatPercent(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/**
 * A metric's value in its own format, or the muted dash when it is null (§6.2).
 * `percent`-formatted metrics carry a 0–1 fraction, like `PostStats.openRate`.
 */
export function formatMetricValue(
  value: number | null,
  format: MetricFormat,
): string {
  if (value === null) return EMPTY_VALUE
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percent':
      return formatPercent(value)
    case 'integer':
    default:
      return formatCount(value)
  }
}

/** what a metric value announces: the dash reads as `No data` (§15). */
export function metricValueAccessibleText(
  value: number | null,
  format: MetricFormat,
): string {
  return value === null ? EMPTY_VALUE_LABEL : formatMetricValue(value, format)
}

export type DeltaDirection = 'up' | 'down'

export function deltaDirection(deltaPct: number): DeltaDirection {
  return deltaPct < 0 ? 'down' : 'up'
}

/**
 * A percentage delta, already in percent units (`15.2` → `15.2%`). Deltas of 100%
 * or more drop the decimal so a four-digit delta stays short: `1,633%` (§12.1).
 * Negative deltas keep their minus sign, so direction never rests on colour alone.
 */
export function formatDeltaPct(deltaPct: number): string {
  const magnitude = Math.abs(deltaPct)
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: magnitude >= 100 ? 0 : 1,
  }).format(deltaPct)
  return `${formatted}%`
}

/** §15 — the delta pill's accessible name spells out `up` or `down`. */
export function deltaAccessibleText(deltaPct: number): string {
  const magnitude = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(deltaPct) >= 100 ? 0 : 1,
  }).format(Math.abs(deltaPct))
  return `${deltaDirection(deltaPct)} ${magnitude} percent`
}

/** `From <prior value>` under a metric value (§6.2). */
export function formatComparison(
  priorValue: number,
  format: MetricFormat,
): string {
  return `From ${formatMetricValue(priorValue, format)}`
}

/** an empty title renders the literal `Untitled` — real text, in the title's own style. */
export function displayTitle(title: string): string {
  return title.trim() === '' ? UNTITLED : title
}

/**
 * §15 — a post row exposes one accessible name combining title, date and author,
 * rather than making a screen reader stitch three fragments together.
 */
export function postAccessibleName(
  title: string,
  dateText: string,
  authorName: string,
): string {
  return `${displayTitle(title)}, ${dateText}, by ${authorName}`
}
