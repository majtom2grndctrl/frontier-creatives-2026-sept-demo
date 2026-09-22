import type { MetricFormat } from "./types"

/**
 * The fixture's "today" (spec §12). Pinned so the relative-year date rule and
 * the period windows stay deterministic rather than drifting with the clock.
 */
export const TODAY = new Date(2026, 8, 3)

const LOCALE = "en-US"

const currentYearDate = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
})
const priorYearDate = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  day: "numeric",
  year: "numeric",
})
const timeOfDay = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  minute: "2-digit",
})

/**
 * Relative-year format (spec §10.3): a date in the current year renders as
 * month + day, a date in a prior year adds the full month name and the year.
 * One formatter, both branches — never hardcoded per row.
 */
export function formatPostDate(input: string | Date): string {
  const date = toDate(input)
  return date.getFullYear() === TODAY.getFullYear()
    ? currentYearDate.format(date)
    : priorYearDate.format(date)
}

/** "Sep 3, 12:10 PM" — the relative-year date plus a time. */
export function formatEditedAt(input: string | Date): string {
  const date = toDate(input)
  return `${formatPostDate(date)}, ${timeOfDay.format(date)}`
}

/** Short axis-label form, used for the chart's x axis and its tooltip. */
export function formatAxisDate(input: string | Date): string {
  return currentYearDate.format(toDate(input))
}

export function formatMetricValue(
  value: number,
  format: MetricFormat
): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    case "percent":
      return `${new Intl.NumberFormat(LOCALE).format(value)}%`
    case "integer":
    default:
      return new Intl.NumberFormat(LOCALE).format(value)
  }
}

/** "15.2%" / "1,633%" — trailing zeros dropped, thousands grouped. */
export function formatDeltaPct(deltaPct: number): string {
  return `${new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 1,
  }).format(Math.abs(deltaPct))}%`
}

/** A 0–1 rate as a percentage. `decimals` controls the precision. */
export function formatRate(rate: number, decimals = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rate)
}

/** Signed integer, so "New subscribers" reads "+3". */
export function formatSigned(value: number): string {
  const formatted = new Intl.NumberFormat(LOCALE).format(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input)
}
