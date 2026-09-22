/**
 * Pure formatting + slicing helpers for the Publication Home dashboard — spec §10.3, §12, §14.4.
 * No JSX, no React — data/pure-function utilities only.
 */

import type { Metric, MetricFormat, Period, SeriesPoint } from "@/lib/dashboard/types"

/**
 * Spec §12 pins "today" as Sep 3, 2026. Everything date-relative derives from this, never
 * `new Date()`, so renders are deterministic and SSR/client agree.
 */
export const TODAY: Date = new Date(2026, 8, 3)

/** §10.3 relative-year format. Current year → "Apr 22". Prior year → "July 18, 2024". */
export function formatPostDate(iso: string, today: Date = TODAY): string {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === today.getFullYear()
  if (sameYear) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** Drafts "Edited …" line, e.g. "Sep 3, 12:10 PM". */
export function formatEditedAt(iso: string, today: Date = TODAY): string {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === today.getFullYear()
  const timeParts = { hour: "numeric", minute: "2-digit", hour12: true } as const
  if (sameYear) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      ...timeParts,
    }).format(date)
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...timeParts,
  }).format(date)
}

/** Chart x-axis tick, e.g. "Sep 4". */
export function formatAxisDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
}

/** Chart hover tooltip date, e.g. "Apr 12, 2026". */
export function formatTooltipDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** Thousands-separated integer, e.g. 1633 -> "1,633". */
export function formatInteger(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
}

/**
 * Metric value per its format. Returns null when value is null (the §6.2 empty state) so
 * callers render the dash themselves. 'integer' -> "38"; 'currency' -> "$1,240";
 * 'percent' -> "18.75%".
 */
export function formatMetricValue(value: number | null, format: MetricFormat): string | null {
  if (value === null) return null
  switch (format) {
    case "integer":
      return formatInteger(value)
    case "currency":
      return `$${formatInteger(value)}`
    case "percent":
      return `${value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}%`
  }
}

/** Delta pill percentage, no sign, e.g. 15.2 -> "15.2%", 1633 -> "1,633%". Drops a trailing ".0". */
export function formatDeltaPct(pct: number): string {
  return `${pct.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`
}

/** Open rate 0–1 -> percentage string. formatOpenRate(0.1875) -> "18.75%"; formatOpenRate(0.1875, 0) -> "19%". */
export function formatOpenRate(rate: number, decimals = 2): string {
  return `${(rate * 100).toFixed(decimals)}%`
}

/** Signed integer for "New subscribers", e.g. 3 -> "+3", 0 -> "0". */
export function formatSigned(n: number): string {
  if (n > 0) return `+${formatInteger(n)}`
  if (n < 0) return formatInteger(n)
  return "0"
}

export const PERIOD_OPTIONS: ReadonlyArray<{
  value: Period
  label: string
  shortLabel: string
}> = [
  { value: "30d", label: "30 days", shortLabel: "30d" },
  { value: "90d", label: "90 days", shortLabel: "90d" },
  { value: "1y", label: "1 year", shortLabel: "1y" },
  { value: "all", label: "All time", shortLabel: "all-time" },
]

function toLocalIsoString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * §14.4 — re-slice a cumulative series to a period. PURE and testable without the DOM.
 * Keeps points within [cutoff, today]. Because the series is cumulative, if the slice
 * would drop leading points, PREPEND a synthetic point at the cutoff date carrying the
 * cumulative value in force at that moment (the last value at or before the cutoff),
 * so the plot never starts at a false zero. '1y' and 'all' return the full series.
 * Always returns at least one point.
 */
export function sliceSeries(
  series: SeriesPoint[],
  period: Period,
  today: Date = TODAY
): SeriesPoint[] {
  if (series.length === 0) return series
  if (period === "1y" || period === "all") return series

  const days = period === "30d" ? 30 : 90
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - days)

  const kept = series.filter((point) => {
    const d = new Date(point.date)
    return d >= cutoff && d <= today
  })

  const firstDate = new Date(series[0].date)
  const droppedLeading = firstDate < cutoff

  if (!droppedLeading) {
    return kept.length > 0 ? kept : series
  }

  // Value in force at the cutoff: the last point at or before the cutoff.
  let valueAtCutoff = series[0].value
  for (const point of series) {
    const d = new Date(point.date)
    if (d <= cutoff) {
      valueAtCutoff = point.value
    } else {
      break
    }
  }

  const synthetic: SeriesPoint = { date: toLocalIsoString(cutoff), value: valueAtCutoff }
  return [synthetic, ...kept]
}

/**
 * §6.2: the third metric's label embeds the period ("1y views" while the select reads
 * "1 year"). Substitutes `{period}` in `metric.labelTemplate` with the period's shortLabel;
 * falls back to `metric.label`.
 */
export function metricLabel(metric: Metric, period: Period): string {
  if (!metric.labelTemplate) return metric.label
  const option = PERIOD_OPTIONS.find((o) => o.value === period)
  const shortLabel = option ? option.shortLabel : ""
  return metric.labelTemplate.replace("{period}", shortLabel)
}
