// Pure formatters and series maths. No DOM, so all of it is testable directly.

import type { MetricFormat, Period, SeriesPoint } from "@/data/types";
import { TODAY } from "@/data/fixtures";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `new Date('2026-04-22')` is parsed as UTC midnight and then rendered in local
 * time, which shifts the day backwards west of Greenwich. Date-only strings are
 * calendar dates, so build them in local time.
 */
export function parseDate(iso: string): Date {
  const [datePart, timePart] = iso.split("T");
  const [year, month, day] = (datePart ?? "").split("-").map(Number);
  const [hour = 0, minute = 0] = (timePart ?? "").split(":").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, hour, minute);
}

/**
 * Relative-year date format (spec §10.3): month + day within the current year,
 * month + day + year in any prior year. One formatter, both branches.
 */
export function formatPostDate(iso: string, today: Date = TODAY): string {
  const date = parseDate(iso);
  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: sameYear ? "short" : "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** `Edited Jul 29, 11:28 AM` — the drafts list's timestamp. */
export function formatEditedAt(iso: string, today: Date = TODAY): string {
  const date = parseDate(iso);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${formatPostDate(iso, today)}, ${time}`;
}

/** Chart axis and tooltip dates: short month and day, plus the year outside the current one. */
export function formatChartDate(iso: string, today: Date = TODAY): string {
  const date = parseDate(iso);
  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function formatInteger(value: number): string {
  return value.toLocaleString();
}

export function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case "currency":
      return value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });
    case "percent":
      return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
    case "integer":
      return formatInteger(value);
  }
}

/** `18.75%` — the open rate on the Latest post card, two decimals. */
export function formatOpenRate(rate: number, fractionDigits = 2): string {
  return `${(rate * 100).toFixed(fractionDigits)}%`;
}

/** `+3` — new subscribers carry an explicit sign. */
export function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : "-"}${formatInteger(Math.abs(value))}`;
}

export function formatDeltaPct(deltaPct: number): string {
  return `${formatInteger(Math.round(deltaPct * 10) / 10)}%`;
}

export const PERIODS: { id: Period; label: string; shortLabel: string; days: number | null }[] = [
  { id: "30d", label: "30 days", shortLabel: "30d", days: 30 },
  { id: "90d", label: "90 days", shortLabel: "90d", days: 90 },
  { id: "1y", label: "1 year", shortLabel: "1y", days: 365 },
  { id: "all", label: "All time", shortLabel: "All time", days: null },
];

export function periodOption(period: Period) {
  return PERIODS.find((option) => option.id === period) ?? PERIODS[2]!;
}

/** Metric labels embed the period, so changing the period relabels them. */
export function resolveMetricLabel(label: string, period: Period): string {
  return label.replace("%period%", periodOption(period).shortLabel);
}

export interface SeriesWindow {
  start: Date;
  end: Date;
}

export function periodWindow(period: Period, series: SeriesPoint[], today: Date = TODAY): SeriesWindow {
  const days = periodOption(period).days;
  if (days === null) {
    const first = series[0];
    return { start: first ? parseDate(first.date) : today, end: today };
  }
  return { start: new Date(today.getTime() - days * DAY_MS), end: today };
}

/**
 * Slice a cumulative series to a window. The point in effect at the window's
 * start is carried forward as the opening value, so a window that begins in the
 * middle of a flat run still plots that run's height rather than starting at zero.
 */
/** Local-time `YYYY-MM-DD`, the inverse of `parseDate`. */
function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function sliceSeries(series: SeriesPoint[], window: SeriesWindow): SeriesPoint[] {
  const startTime = window.start.getTime();
  const endTime = window.end.getTime();

  const inWindow = series.filter((point) => {
    const time = parseDate(point.date).getTime();
    return time >= startTime && time <= endTime;
  });

  const preceding = series.filter((point) => parseDate(point.date).getTime() < startTime);
  const carried = preceding[preceding.length - 1] ?? series[0];
  const needsOpening = carried !== undefined && inWindow[0]?.date !== isoDate(window.start);

  return needsOpening
    ? [{ date: isoDate(window.start), value: carried.value }, ...inWindow]
    : inWindow;
}

/** Evenly spaced x-axis labels across the window. */
export function axisDates(window: SeriesWindow, count: number): Date[] {
  const span = window.end.getTime() - window.start.getTime();
  return Array.from({ length: count }, (_, index) => new Date(window.start.getTime() + (span * index) / count));
}

export function formatAxisDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Integer y ticks over the series' own range — the domain starts at the series
 * minimum, not at zero (spec §6.3). A flat series still gets a usable domain.
 */
export function yTicks(series: SeriesPoint[], maxTicks = 5): number[] {
  const values = series.map((point) => point.value);
  if (values.length === 0) return [0, 1];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) return [min, min + 1];

  const step = Math.max(1, Math.ceil((max - min) / (maxTicks - 1)));
  const ticks: number[] = [];
  for (let tick = min; tick < max + step; tick += step) ticks.push(tick);
  return ticks;
}
