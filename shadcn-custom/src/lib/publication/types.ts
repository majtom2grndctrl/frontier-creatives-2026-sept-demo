/**
 * Data model for the publication Home dashboard (spec §11).
 *
 * Nothing here is fetched — the whole screen renders from the fixture in
 * `./fixture.ts`.
 */

export type ID = string

export interface Publication {
  id: ID
  name: string
  /** Rendered as the trend chart's watermark. */
  domain: string
  avatarUrl: string
}

export interface Author {
  id: ID
  name: string
  avatarUrl: string
}

export interface PostStats {
  newSubscribers: number
  views: number
  /** 0–1; formatted to a percentage at render time. */
  openRate: number
}

export interface Post {
  id: ID
  /** An empty string renders as the literal text "Untitled". */
  title: string
  status: "published" | "draft"
  authorId: ID
  /** Absent → the placeholder glyph, never a broken image. */
  coverUrl?: string
  /** ISO 8601; published posts only. */
  publishedAt?: string
  /** ISO 8601 with time; drafts only. */
  editedAt?: string
  likes: number
  comments: number
  /** Published posts only. */
  stats?: PostStats
}

/** One point of a cumulative, monotonic series. */
export interface SeriesPoint {
  date: string
  value: number
}

export type MetricFormat = "integer" | "currency" | "percent"

/**
 * One segment of the metric strip (spec §6.2).
 *
 * `value: null` is the empty state — a dash and no delta pill. It is not
 * modelled as 0, which would render a "0" and a "0%" pill.
 */
export interface Metric {
  id: ID
  label: string
  value: number | null
  format: MetricFormat
  priorValue: number
  /** Stored, not derived, so a zero prior value cannot produce Infinity/NaN. */
  deltaPct: number | null
  /** Plotted when this metric is selected. Cumulative and monotonic. */
  series: SeriesPoint[]
  /** The ⓘ tooltip. */
  infoText: string
}

export type Period = "30d" | "90d" | "1y" | "all"

export interface DashboardState {
  /** Drives the chart. */
  selectedMetricId: ID
  period: Period
}
