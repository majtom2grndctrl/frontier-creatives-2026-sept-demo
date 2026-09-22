/**
 * Seed fixture for the Publication Home dashboard — spec §12.
 * ALL CONTENT IS FICTIONAL. Do not substitute real personal data.
 */

import type { Author, Metric, Post, Publication } from "@/lib/dashboard/types"

export const publication: Publication = {
  id: "meridian-notes",
  name: "Meridian Notes",
  domain: "meridiannotes.example.com",
  avatarUrl: "/avatars/publication.svg",
}

export const author: Author = {
  id: "jordan",
  name: "Jordan Avery",
  avatarUrl: "/avatars/jordan.svg",
}

// §12.2 — subscriber series: cumulative, y-domain 33 → 38, a long flat run then three
// risers clustered in the last third.
const subscriberSeries = [
  { date: "2025-09-04T00:00:00", value: 33 },
  { date: "2026-04-12T00:00:00", value: 34 },
  { date: "2026-05-06T00:00:00", value: 35 },
  { date: "2026-08-30T00:00:00", value: 38 },
]

// §11 — pledged revenue still carries a series so the empty-state chart is valid: a flat
// run of zeros across the same one-year date range.
const pledgedRevenueSeries = [
  { date: "2025-09-04T00:00:00", value: 0 },
  { date: "2026-04-12T00:00:00", value: 0 },
  { date: "2026-05-06T00:00:00", value: 0 },
  { date: "2026-08-30T00:00:00", value: 0 },
]

// Own plausible cumulative, monotonic series across the same one-year range, ending at 208.
const viewsSeries = [
  { date: "2025-09-04T00:00:00", value: 12 },
  { date: "2025-11-01T00:00:00", value: 34 },
  { date: "2026-01-15T00:00:00", value: 58 },
  { date: "2026-03-10T00:00:00", value: 95 },
  { date: "2026-05-06T00:00:00", value: 140 },
  { date: "2026-06-25T00:00:00", value: 175 },
  { date: "2026-08-10T00:00:00", value: 196 },
  { date: "2026-08-30T00:00:00", value: 208 },
]

export const metrics: Metric[] = [
  {
    id: "subscribers",
    label: "Total subscribers",
    value: 38,
    format: "integer",
    priorValue: 33,
    deltaPct: 15.2,
    series: subscriberSeries,
    infoText: "Everyone currently subscribed to Meridian Notes, free and paid.",
  },
  {
    id: "pledged-revenue",
    label: "Pledged annualized revenue",
    value: null,
    format: "currency",
    priorValue: 0,
    deltaPct: null,
    series: pledgedRevenueSeries,
    infoText: "Annualized value of pledged paid subscriptions that haven't gone live yet.",
  },
  {
    id: "views",
    label: "1y views",
    labelTemplate: "{period} views",
    value: 208,
    format: "integer",
    priorValue: 12,
    deltaPct: 1633,
    series: viewsSeries,
    infoText: "Total post views across the selected period.",
  },
]

export const DEFAULT_METRIC_ID = "subscribers"

// §12.5 — Recent posts, in order.
export const recentPosts: Post[] = [
  {
    id: "post-quiet-layer",
    title: "The Quiet Layer: What Fast Prototyping Overlooks",
    status: "published",
    authorId: "jordan",
    coverUrl: "/covers/quiet-layer.svg",
    publishedAt: "2026-04-22T00:00:00",
    likes: 1,
    comments: 0,
    stats: { newSubscribers: 3, views: 96, openRate: 0.1875 },
  },
  {
    id: "post-checklist-process",
    title: "A checklist is not the same thing as a process",
    status: "published",
    authorId: "jordan",
    publishedAt: "2026-02-24T00:00:00",
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 4, openRate: 0.21 },
  },
  {
    id: "post-shared-vocabulary",
    title: "Shared vocabulary beats shared components, most of the time",
    status: "published",
    authorId: "jordan",
    coverUrl: "/covers/shared-vocabulary.svg",
    publishedAt: "2024-07-18T00:00:00",
    likes: 0,
    comments: 0,
    stats: { newSubscribers: 0, views: 11, openRate: 0.15 },
  },
]

// §12.3 — same record as recentPosts[0], by reference, so §7 and §9 never disagree.
export const latestPost: Post = recentPosts[0]

// §12.4 — Drafts, in fixture order. Deliberately not chronological; do not sort.
export const drafts: Post[] = [
  {
    id: "draft-1",
    title: "",
    status: "draft",
    authorId: "jordan",
    editedAt: "2026-09-03T12:10:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-2",
    title: "What theme parks can teach us about onboarding…",
    status: "draft",
    authorId: "jordan",
    editedAt: "2026-07-29T11:28:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-3",
    title: "Start the migration in the smallest place that…",
    status: "draft",
    authorId: "jordan",
    editedAt: "2026-07-21T16:07:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-4",
    title: "",
    status: "draft",
    authorId: "jordan",
    editedAt: "2026-06-01T14:32:00",
    likes: 0,
    comments: 0,
  },
  {
    id: "draft-5",
    title: "The future of generated interfaces and design roles…",
    status: "draft",
    authorId: "jordan",
    editedAt: "2026-07-03T11:24:00",
    likes: 0,
    comments: 0,
  },
]
