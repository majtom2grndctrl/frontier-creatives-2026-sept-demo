// seed data for the publication home dashboard (spec §12).
//
// everything here is fictional and is used verbatim — values are not rounded,
// the draft order is deliberately not chronological, and the empty metric stays
// empty. see §18: "the fixture in §12 is used verbatim".
//
// dates are written as local-time ISO 8601 (no trailing `Z`) on purpose: a bare
// `2026-04-22` parses as UTC midnight and would render as "apr 21" west of
// greenwich, which would break the §10.3 current-year/prior-year examples.

import type {
  Author,
  DashboardData,
  Metric,
  Post,
  Publication,
  SeriesPoint,
} from './types'

/** inlines artwork as a data uri so the prototype makes no network calls (§14.1). */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`
}

const diagramCover = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" role="presentation">
  <rect width="160" height="120" fill="#e8eaf0"/>
  <rect x="18" y="24" width="42" height="26" rx="4" fill="#c3c9d6"/>
  <rect x="100" y="24" width="42" height="26" rx="4" fill="#c3c9d6"/>
  <rect x="59" y="72" width="42" height="26" rx="4" fill="#aab2c4"/>
  <path d="M39 50 L39 62 L80 62 L80 72" fill="none" stroke="#8f98ad" stroke-width="3"/>
  <path d="M121 50 L121 62 L80 62" fill="none" stroke="#8f98ad" stroke-width="3"/>
</svg>`)

const chartCover = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" role="presentation">
  <rect width="160" height="120" fill="#eae8f0"/>
  <path d="M16 96 L16 20" stroke="#c3c0d6" stroke-width="2"/>
  <path d="M16 96 L146 96" stroke="#c3c0d6" stroke-width="2"/>
  <rect x="30" y="66" width="18" height="30" fill="#b3aecd"/>
  <rect x="58" y="48" width="18" height="48" fill="#a09ac0"/>
  <rect x="86" y="56" width="18" height="40" fill="#b3aecd"/>
  <rect x="114" y="30" width="18" height="66" fill="#8f88b4"/>
</svg>`)

const publicationAvatar = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" role="presentation">
  <rect width="40" height="40" rx="8" fill="#3b4a6b"/>
  <path d="M10 27 L20 13 L30 27" fill="none" stroke="#f2f4f8" stroke-width="3" stroke-linejoin="round"/>
</svg>`)

const authorAvatar = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" role="presentation">
  <rect width="40" height="40" rx="20" fill="#d5d9e2"/>
  <circle cx="20" cy="16" r="7" fill="#9aa3b5"/>
  <path d="M6 38 a14 12 0 0 1 28 0 z" fill="#9aa3b5"/>
</svg>`)

/** the fixture's "today" (§12) — kept explicit so date formatting is deterministic. */
export const TODAY = '2026-09-03T09:00:00'

export const publication: Publication = {
  id: 'pub-meridian',
  name: 'Meridian Notes',
  domain: 'meridiannotes.example.com',
  avatarUrl: publicationAvatar,
}

export const author: Author = {
  id: 'author-jordan',
  name: 'Jordan Avery',
  avatarUrl: authorAvatar,
}

/** §12.2 — cumulative, one year, y-domain 33 → 38. */
export const subscriberSeries: SeriesPoint[] = [
  { date: '2025-09-04T00:00:00', value: 33 },
  { date: '2026-04-12T00:00:00', value: 34 },
  { date: '2026-05-06T00:00:00', value: 35 },
  { date: '2026-08-30T00:00:00', value: 38 },
]

// §11 requires every metric to carry a series, including the empty one: a flat
// run of zeros so selecting it plots a valid empty-state chart rather than crashing.
export const pledgedRevenueSeries: SeriesPoint[] = [
  { date: '2025-09-04T00:00:00', value: 0 },
  { date: '2026-04-12T00:00:00', value: 0 },
  { date: '2026-05-06T00:00:00', value: 0 },
  { date: '2026-08-30T00:00:00', value: 0 },
]

// §12 spells out the subscriber series only; this one is invented to the same
// rules (cumulative, monotonic) so the third segment has something to plot,
// ending on the fixture's 208 and starting from its prior value of 12.
export const viewsSeries: SeriesPoint[] = [
  { date: '2025-09-04T00:00:00', value: 12 },
  { date: '2025-11-15T00:00:00', value: 31 },
  { date: '2026-01-20T00:00:00', value: 58 },
  { date: '2026-04-22T00:00:00', value: 96 },
  { date: '2026-06-08T00:00:00', value: 141 },
  { date: '2026-08-30T00:00:00', value: 208 },
]

/** §12.1 — the three segments of the metric strip. */
export const metrics: Metric[] = [
  {
    id: 'total-subscribers',
    label: 'Total subscribers',
    value: 38,
    format: 'integer',
    priorValue: 33,
    deltaPct: 15.2,
    series: subscriberSeries,
    infoText: 'Everyone subscribed to this publication, free and paid.',
  },
  {
    id: 'pledged-revenue',
    label: 'Pledged annualized revenue',
    value: null,
    format: 'currency',
    priorValue: 0,
    deltaPct: null,
    series: pledgedRevenueSeries,
    infoText:
      'What pledges would be worth over a year if you turned on payments.',
  },
  {
    id: 'views',
    label: '1y views',
    value: 208,
    format: 'integer',
    priorValue: 12,
    deltaPct: 1633,
    series: viewsSeries,
    infoText: 'Views across every post in the selected period.',
  },
]

/** §12.5 — published posts, in fixture order. The first row is also §12.3's latest post. */
export const posts: Post[] = [
  {
    id: 'post-quiet-layer',
    title: 'The Quiet Layer: What Fast Prototyping Overlooks',
    status: 'published',
    authorId: author.id,
    coverUrl: diagramCover,
    publishedAt: '2026-04-22T09:00:00',
    likes: 1,
    comments: 0,
    stats: { newSubscribers: 3, views: 96, openRate: 0.1875 },
  },
  {
    id: 'post-checklist',
    title: 'A checklist is not the same thing as a process',
    status: 'published',
    authorId: author.id,
    // no coverUrl — exercises the placeholder glyph (§10.2)
    publishedAt: '2026-02-24T09:00:00',
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 4, openRate: 0.21 },
  },
  {
    id: 'post-shared-vocabulary',
    title: 'Shared vocabulary beats shared components, most of the time',
    status: 'published',
    authorId: author.id,
    coverUrl: chartCover,
    publishedAt: '2024-07-18T09:00:00', // prior year — exercises §10.3's second branch
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 11, openRate: 0.15 },
  },
]

/** §12.4 — order as listed, deliberately not chronological. Never sort this. */
export const drafts: Post[] = [
  {
    id: 'draft-untitled-sep',
    title: '', // renders as "Untitled"
    status: 'draft',
    authorId: author.id,
    editedAt: '2026-09-03T12:10:00',
    likes: 0,
    comments: 0,
  },
  {
    id: 'draft-theme-parks',
    title: 'What theme parks can teach us about onboarding…',
    status: 'draft',
    authorId: author.id,
    editedAt: '2026-07-29T11:28:00',
    likes: 0,
    comments: 0,
  },
  {
    id: 'draft-migration',
    title: 'Start the migration in the smallest place that…',
    status: 'draft',
    authorId: author.id,
    editedAt: '2026-07-21T16:07:00',
    likes: 0,
    comments: 0,
  },
  {
    id: 'draft-untitled-jun',
    title: '', // renders as "Untitled"
    status: 'draft',
    authorId: author.id,
    editedAt: '2026-06-01T14:32:00',
    likes: 0,
    comments: 0,
  },
  {
    id: 'draft-generated-interfaces',
    title: 'The future of generated interfaces and design roles…',
    status: 'draft',
    authorId: author.id,
    editedAt: '2026-07-03T11:24:00',
    likes: 0,
    comments: 0,
  },
]

/**
 * §12.3 — the latest post is the same record as the first recent-posts row, so
 * the two sections cannot disagree.
 */
export const latestPost: Post = posts[0]

export const dashboardData: DashboardData = {
  publication,
  author,
  metrics,
  posts,
  drafts,
  latestPostId: latestPost.id,
  today: TODAY,
}
