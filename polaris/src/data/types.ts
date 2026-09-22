// Data model for the publication home dashboard (spec §11).

export type ID = string;

export interface Publication {
  id: ID;
  name: string;
  /** Rendered as the trend chart watermark. */
  domain: string;
  initials: string;
}

export interface Author {
  id: ID;
  name: string;
  initials: string;
}

export interface PostStats {
  newSubscribers: number;
  views: number;
  /** 0–1. Formatted to a percentage at render time. */
  openRate: number;
}

/** Cover art is drawn locally as inline SVG — the demo makes no network requests. */
export type CoverArt = "diagram" | "chart";

export interface Post {
  id: ID;
  /** Empty string renders as "Untitled". */
  title: string;
  status: "published" | "draft";
  authorId: ID;
  /** Absent renders the placeholder glyph. */
  cover?: CoverArt;
  /** ISO 8601. Published posts only. */
  publishedAt?: string;
  /** ISO 8601 with time. Drafts only. */
  editedAt?: string;
  likes: number;
  comments: number;
  /** Published posts only. */
  stats?: PostStats;
}

export type MetricFormat = "integer" | "currency" | "percent";

/** ISO date, cumulative. */
export interface SeriesPoint {
  date: string;
  value: number;
}

export interface Metric {
  id: ID;
  /** `%period%` is replaced with the selected period's short label. */
  label: string;
  /** `null` is the empty state — a dash and no delta pill. Never model it as 0. */
  value: number | null;
  format: MetricFormat;
  priorValue: number;
  /** Stored, not derived, so a zero prior value cannot produce Infinity or NaN. */
  deltaPct: number | null;
  /** Cumulative and monotonic, which is what makes step interpolation correct. */
  series: SeriesPoint[];
  /** The ⓘ tooltip. */
  infoText: string;
}

export type Period = "30d" | "90d" | "1y" | "all";
