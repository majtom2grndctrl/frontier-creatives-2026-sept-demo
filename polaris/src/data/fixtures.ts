// Seed data for the publication home dashboard (spec §12). Entirely fictional.
// It is chosen to exercise every rendering state: an empty metric, a four-digit
// percentage delta, an untitled draft, a post with no cover, a title that
// truncates at half width and fits at full width, and a prior-year date.

import type { Author, Metric, Post, Publication, SeriesPoint } from "@/data/types";

/** The fixture's "today". Everything relative-dated is measured from here. */
export const TODAY = new Date("2026-09-03T00:00:00");

export const publication: Publication = {
  id: "pub-1",
  name: "Meridian Notes",
  domain: "meridiannotes.example.com",
  initials: "MN",
};

export const author: Author = {
  id: "author-1",
  name: "Jordan Avery",
  initials: "JA",
};

/** Cumulative subscriber count over the past year: a long flat run, then three risers. */
const subscriberSeries: SeriesPoint[] = [
  { date: "2025-09-04", value: 33 },
  { date: "2026-04-12", value: 34 },
  { date: "2026-05-06", value: 35 },
  { date: "2026-08-30", value: 38 },
];

/** The empty metric still carries a series — a flat run of zeros plots a valid empty state. */
const pledgedRevenueSeries: SeriesPoint[] = [
  { date: "2025-09-04", value: 0 },
  { date: "2026-09-03", value: 0 },
];

const viewSeries: SeriesPoint[] = [
  { date: "2025-09-04", value: 12 },
  { date: "2025-11-19", value: 23 },
  { date: "2026-02-24", value: 41 },
  { date: "2026-04-22", value: 137 },
  { date: "2026-07-08", value: 186 },
  { date: "2026-08-27", value: 208 },
];

export const metrics: Metric[] = [
  {
    id: "subscribers",
    label: "Total subscribers",
    value: 38,
    format: "integer",
    priorValue: 33,
    deltaPct: 15.2,
    series: subscriberSeries,
    infoText: "Everyone receiving the newsletter, free and paid.",
  },
  {
    id: "pledged-revenue",
    label: "Pledged annualized revenue",
    value: null,
    format: "currency",
    priorValue: 0,
    deltaPct: null,
    series: pledgedRevenueSeries,
    infoText: "What pledged subscriptions would earn over a year once billing starts.",
  },
  {
    id: "views",
    // %period% resolves against the selected period, so changing the period relabels it.
    label: "%period% views",
    value: 208,
    format: "integer",
    priorValue: 12,
    deltaPct: 1633,
    series: viewSeries,
    infoText: "Times a post was opened on the web or in email.",
  },
];

export const posts: Post[] = [
  {
    id: "post-1",
    title: "The Quiet Layer: What Fast Prototyping Overlooks",
    status: "published",
    authorId: author.id,
    cover: "diagram",
    publishedAt: "2026-04-22",
    likes: 1,
    comments: 0,
    stats: { newSubscribers: 3, views: 96, openRate: 0.1875 },
  },
  {
    id: "post-2",
    title: "A checklist is not the same thing as a process",
    status: "published",
    authorId: author.id,
    publishedAt: "2026-02-24",
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 4, openRate: 0.2105 },
  },
  {
    id: "post-3",
    title: "Shared vocabulary beats shared components, most of the time",
    status: "published",
    authorId: author.id,
    cover: "chart",
    publishedAt: "2024-07-18",
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 11, openRate: 0.1489 },
  },
];

/** Order is the fixture's, deliberately not chronological — no component sorts. */
export const drafts: Post[] = [
  {
    id: "draft-1",
    title: "",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-09-03T12:10:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-2",
    title: "What theme parks can teach us about onboarding",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-07-29T11:28:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-3",
    title: "Start the migration in the smallest place that will still tell you something",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-07-21T16:07:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-4",
    title: "",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-06-01T14:32:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-5",
    title: "The future of generated interfaces and design roles",
    status: "draft",
    authorId: author.id,
    editedAt: "2026-07-03T11:24:00",
    likes: 0,
    comments: 0,
  },
];

/** The Latest post card and the first Recent posts row are the same record. */
export const latestPost = posts[0]!;
