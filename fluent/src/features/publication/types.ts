// data model for the publication home dashboard (spec §11).
// this is the contract the shell, overview and card sections all code against —
// names here match the spec exactly.

export type ID = string

export interface Publication {
  id: ID
  name: string
  domain: string // rendered as the chart watermark
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
  openRate: number // 0–1; formatted to a percentage at render time
}

export interface Post {
  id: ID
  title: string // empty string renders as "untitled"
  status: 'published' | 'draft'
  authorId: ID
  coverUrl?: string // absent → placeholder glyph (§10.2)
  publishedAt?: string // ISO 8601; published posts only
  editedAt?: string // ISO 8601 with time; drafts only
  likes: number
  comments: number
  stats?: PostStats // published posts only
}

/** the number formats a metric value can take (§11 `Metric.format`). */
export type MetricFormat = 'integer' | 'currency' | 'percent'

// the three segments of §6.2. `value: null` is the empty state — a dash and
// no delta pill. do not model it as 0, which would render a "0" and a "0%" pill.
export interface Metric {
  id: ID
  label: string
  value: number | null
  format: MetricFormat
  priorValue: number
  deltaPct: number | null // null whenever value is null
  series: SeriesPoint[] // plotted when this metric is selected
  infoText: string // the ⓘ tooltip
}

export interface SeriesPoint {
  date: string // ISO date, cumulative
  value: number
}

export type Period = '30d' | '90d' | '1y' | 'all'

export interface DashboardState {
  selectedMetricId: ID // drives the chart
  period: Period
}

/**
 * the whole fixture, shaped so every section reads from one record (§12.3 —
 * latest post and the first recent-posts row must agree).
 */
export interface DashboardData {
  publication: Publication
  author: Author
  metrics: Metric[]
  posts: Post[] // published posts, fixture order (§11 notes — components never sort)
  drafts: Post[] // draft posts, fixture order (§8.4 — deliberately not chronological)
  latestPostId: ID
  today: string // the fixture's "today" (§12), so date formatting is deterministic
}
