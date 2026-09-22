import { PERIOD_METRIC_TOKEN } from "./series"
import type {
  Author,
  Metric,
  Period,
  Post,
  Publication,
  SeriesPoint,
} from "./types"

/**
 * Seed data (spec §12). Every value here is fictional, and the set is chosen
 * to exercise each rendering state on the screen: an empty metric, a
 * four-digit delta, an untitled draft, a post with no cover, a title that
 * truncates in one place and fits in another, and both branches of the
 * relative-year date rule.
 */

export const publication: Publication = {
  id: "pub-meridian",
  name: "Meridian Notes",
  domain: "meridiannotes.example.com",
  avatarUrl: "/publication-avatar.svg",
}

export const author: Author = {
  id: "author-jordan",
  name: "Jordan Avery",
  avatarUrl: "",
}

const subscriberSeries: SeriesPoint[] = [
  { date: "2025-09-04T00:00:00", value: 33 },
  { date: "2026-04-12T00:00:00", value: 34 },
  { date: "2026-05-06T00:00:00", value: 35 },
  { date: "2026-08-30T00:00:00", value: 38 },
]

const viewsSeries: SeriesPoint[] = [
  { date: "2025-09-04T00:00:00", value: 12 },
  { date: "2025-11-18T00:00:00", value: 24 },
  { date: "2026-01-27T00:00:00", value: 41 },
  { date: "2026-04-22T00:00:00", value: 137 },
  { date: "2026-06-09T00:00:00", value: 168 },
  { date: "2026-08-30T00:00:00", value: 208 },
]

/** A flat run of zeros, so the empty metric still plots a valid chart. */
const pledgedRevenueSeries: SeriesPoint[] = [
  { date: "2025-09-04T00:00:00", value: 0 },
  { date: "2026-08-30T00:00:00", value: 0 },
]

export const posts: Post[] = [
  {
    id: "post-quiet-layer",
    title: "The Quiet Layer: What Fast Prototyping Overlooks",
    status: "published",
    authorId: author.id,
    coverUrl: "/covers/diagram.svg",
    publishedAt: "2026-04-22T09:00:00",
    likes: 1,
    comments: 0,
    stats: { newSubscribers: 3, views: 96, openRate: 0.1875 },
  },
  {
    id: "post-checklist",
    title: "A checklist is not the same thing as a process",
    status: "published",
    authorId: author.id,
    publishedAt: "2026-02-24T09:00:00",
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 4, openRate: 0.21 },
  },
  {
    id: "post-shared-vocabulary",
    title: "Shared vocabulary beats shared components, most of the time",
    status: "published",
    authorId: author.id,
    coverUrl: "/covers/chart.svg",
    publishedAt: "2024-07-18T09:00:00",
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 11, openRate: 0.15 },
  },
]

/**
 * The Latest post section and the first row of Recent posts are the same
 * record, so the two can never disagree.
 */
export const latestPost = posts[0]

/**
 * Deliberately not in reverse-chronological order: ordering is a data
 * concern, and no component on this screen sorts.
 */
export const drafts: Post[] = [
  {
    id: "draft-untitled-sep",
    title: "",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-09-03T12:10:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-theme-parks",
    title: "What theme parks can teach us about onboarding new subscribers",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-07-29T11:28:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-migration",
    title: "Start the migration in the smallest place that could possibly work",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-07-21T16:07:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-untitled-jun",
    title: "",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-06-01T14:32:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-generated-interfaces",
    title: "The future of generated interfaces and the design roles around them",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-07-03T11:24:00",
    likes: 0,
    comments: 0,
  },
]

export const DEFAULT_METRIC_ID = "total-subscribers"

/**
 * The three metric segments. Built per period rather than held as a constant,
 * because the third label embeds the selected range — changing the period
 * relabels it.
 */
export function getMetrics(period: Period): Metric[] {
  return [
    {
      id: DEFAULT_METRIC_ID,
      label: "Total subscribers",
      value: 38,
      format: "integer",
      priorValue: 33,
      deltaPct: 15.2,
      series: subscriberSeries,
      infoText:
        "Everyone receiving Meridian Notes by email, free and paid together.",
    },
    {
      id: "pledged-revenue",
      label: "Pledged annualized revenue",
      value: null,
      format: "currency",
      priorValue: 0,
      deltaPct: null,
      series: pledgedRevenueSeries,
      infoText:
        "What readers have pledged to pay once paid subscriptions are switched on.",
    },
    {
      id: "views",
      label: `${PERIOD_METRIC_TOKEN[period]} views`,
      value: 208,
      format: "integer",
      priorValue: 12,
      deltaPct: 1633,
      series: viewsSeries,
      infoText: "Times a post was opened on the web or in the app.",
    },
  ]
}
