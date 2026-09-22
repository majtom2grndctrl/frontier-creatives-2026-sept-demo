/**
 * Data model for the Publication Home dashboard — spec §11.
 * All content that fills these shapes is fictional (see src/data/dashboard.ts).
 */

export type ID = string

export interface Publication {
  id: ID
  name: string
  /** Rendered as the chart watermark (§6.3). */
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
  /** Empty string renders as "Untitled" (§8.3). */
  title: string
  status: "published" | "draft"
  authorId: ID
  /** Absent → placeholder glyph (§10.2). */
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

/** ISO date, cumulative and monotonic — this is what makes step interpolation correct (§6.3). */
export interface SeriesPoint {
  date: string
  value: number
}

export type MetricFormat = "integer" | "currency" | "percent"

/**
 * One segment of the §6.2 strip. `value: null` is the empty state — a dash and
 * no delta pill. Never model it as 0, which would render a "0" and a "0%" pill.
 */
export interface Metric {
  id: ID
  /** May embed the selected period; see `labelTemplate`. */
  label: string
  /**
   * When present, the label is derived from the period rather than constant —
   * `{period}` is substituted with the short period label (§6.2 inference).
   */
  labelTemplate?: string
  value: number | null
  format: MetricFormat
  priorValue: number
  /** Stored, not derived, so an empty state cannot produce Infinity/NaN. */
  deltaPct: number | null
  /** Plotted when this metric is selected. */
  series: SeriesPoint[]
  /** The ⓘ tooltip copy. */
  infoText: string
}

export type Period = "30d" | "90d" | "1y" | "all"

export interface DashboardState {
  /** Drives the chart. */
  selectedMetricId: ID
  period: Period
}
