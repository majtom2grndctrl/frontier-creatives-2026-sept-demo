/**
 * Seed data for the developer profile Overview screen (spec §11).
 *
 * Every name, handle, repository, URL and number here is fictional. The
 * *shapes* are load-bearing: a star count of zero that suppresses its
 * affordance, a singular "1 repository", a heatmap week that ends early. The
 * table in the spec's "States this fixture guarantees" section is the contract
 * — changing the content is fine, flattening a shape is not.
 *
 * One shape is deliberately dropped: every pinned repo carries a description,
 * so the spec's description-less card states are not exercised here.
 */

import type {
  Achievement,
  ContributionDay,
  ContributionYear,
  Organization,
  PinnedRepo,
  Profile,
  ProfileTab,
  TimelineMonth,
} from "./types"

/* -------------------------------------------------------------------------
   Contribution heatmap
   ---------------------------------------------------------------------- */

const HEATMAP_END = "2026-09-14"
const HEATMAP_WEEKS = 53
/** The newest column stops after its second day — no placeholder cells. */
const HEATMAP_TRAILING_DAYS = 2
const HEATMAP_TOTAL = 3847
/** Fixed, so the server and the client generate the same grid. */
const HEATMAP_SEED = 20260914

/** Deterministic PRNG. Any stable generator would do; this one is small. */
function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Count → intensity step. Level 0 is "no contributions", never "a few". */
function levelFor(count: number): ContributionDay["level"] {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 9) return 2
  if (count <= 19) return 3
  return 4
}

/**
 * A year of days with a visible density gradient: sparse and mostly empty
 * through the opening weeks, dense and mostly levels 2–4 through the closing
 * ones. Raw counts are scaled to land the year on exactly `HEATMAP_TOTAL`, so
 * the header's figure and the grid can never drift apart.
 */
function buildContributionYear(): ContributionYear {
  const dayCount = (HEATMAP_WEEKS - 1) * 7 + HEATMAP_TRAILING_DAYS

  const end = new Date(`${HEATMAP_END}T00:00:00Z`)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (dayCount - 1))

  const random = mulberry32(HEATMAP_SEED)
  const counts: number[] = []
  for (let i = 0; i < dayCount; i += 1) {
    const t = Math.floor(i / 7) / (HEATMAP_WEEKS - 1)
    const activeOdds = 0.18 + 0.74 * t
    const peak = 4 + 30 * t * t
    counts.push(
      random() > activeOdds ? 0 : 1 + Math.floor(Math.pow(random(), 1.4) * peak)
    )
  }

  const raw = counts.reduce((a, b) => a + b, 0)
  const scale = HEATMAP_TOTAL / raw
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] > 0) counts[i] = Math.max(1, Math.round(counts[i] * scale))
  }

  /* Rounding leaves a handful either way; walk backwards spending it on days
     that are already active, so no empty day acquires a phantom commit. */
  let delta = HEATMAP_TOTAL - counts.reduce((a, b) => a + b, 0)
  let cursor = counts.length - 1
  while (delta !== 0) {
    const step = Math.sign(delta)
    if (counts[cursor] > 1 || (step > 0 && counts[cursor] > 0)) {
      counts[cursor] += step
      delta -= step
    }
    cursor = cursor === 0 ? counts.length - 1 : cursor - 1
  }

  const days: ContributionDay[] = counts.map((count, i) => {
    const date = new Date(start)
    date.setUTCDate(date.getUTCDate() + i)
    return { date: toISODate(date), count, level: levelFor(count) }
  })

  return {
    total: HEATMAP_TOTAL,
    rangeStart: days[0].date,
    rangeEnd: days[days.length - 1].date,
    days,
  }
}

export const contributions = buildContributionYear()

/* -------------------------------------------------------------------------
   Profile content
   ---------------------------------------------------------------------- */

export const tabs: ProfileTab[] = [
  { id: "overview", label: "Overview", href: "/profile" },
  { id: "repositories", label: "Repositories", href: "#", count: 26 },
  { id: "projects", label: "Projects", href: "#" },
  { id: "packages", label: "Packages", href: "#" },
  { id: "stars", label: "Stars", href: "#", count: 78 },
]

const pinned: PinnedRepo[] = [
  {
    name: "cadence-deck",
    visibility: "public",
    description:
      "A keyboard-driven presentation tool that builds slide decks from plain Markdown files.",
    language: { name: "TypeScript", color: "#3178c6" },
    stars: 4,
  },
  {
    name: "interest-mapping-workshop",
    visibility: "public",
    description:
      "Facilitation materials and a live clustering board for running interest-mapping sessions with distributed teams, remote or in person.",
    language: { name: "TypeScript", color: "#3178c6" },
    stars: 0,
  },
  {
    name: "inventory-forecast-prototype",
    visibility: "public",
    description:
      "A demand-forecasting sandbox for testing reorder thresholds against synthetic sales histories.",
    language: { name: "TypeScript", color: "#3178c6" },
    stars: 0,
  },
  {
    name: "nested-details",
    visibility: "public",
    description:
      "An HTML custom element for progressive disclosure, designed for long-form text content such as case-study write-ups.",
    language: { name: "TypeScript", color: "#3178c6" },
    stars: 0,
  },
  {
    name: "focus-timer",
    visibility: "public",
    description:
      "A lightweight desktop timer that manufactures deadline pressure.",
    language: { name: "Rust", color: "#dea584" },
    stars: 0,
  },
]

/** `pillColor` travels with the artwork — it is content, not a design token. */
const achievements: Achievement[] = [
  {
    id: "pair-extraordinaire",
    name: "Pair Extraordinaire",
    imageUrl: "/profile/achievement-1.svg",
    count: 2,
    pillColor: "#2f5d9e",
  },
  {
    id: "quickdraw",
    name: "Quickdraw",
    imageUrl: "/profile/achievement-2.svg",
  },
  {
    id: "yolo",
    name: "YOLO",
    imageUrl: "/profile/achievement-3.svg",
  },
  {
    id: "starstruck",
    name: "Starstruck",
    imageUrl: "/profile/achievement-4.svg",
    count: 3,
    pillColor: "#c0682a",
  },
]

const organizations: Organization[] = [
  { id: "northsound", name: "Northsound Labs", avatarUrl: "/profile/org-1.svg" },
  { id: "kiln", name: "Kiln Collective", avatarUrl: "/profile/org-2.svg" },
  { id: "twelvebar", name: "Twelvebar", avatarUrl: "/profile/org-3.svg" },
]

const timeline: TimelineMonth[] = [
  {
    month: "September",
    year: 2026,
    items: [
      {
        kind: "commits",
        count: 194,
        repositoryCount: 1,
        details: [
          {
            repo: "quietstack-nine/retro-board",
            href: "#",
            countLabel: "194 commits",
            bar: 194,
          },
        ],
      },
      {
        kind: "pullRequests",
        count: 37,
        repositoryCount: 1,
        details: [
          {
            repo: "quietstack-nine/retro-board",
            href: "#",
            statusPill: { count: 37, label: "merged", tone: "merged" },
            collapsible: true,
          },
        ],
      },
      /* Not in the source rendering. Kept because it is the only thing that
         proves a volume bar is proportional *within* an item, and the only
         item with more than one detail row. */
      {
        kind: "commits",
        count: 31,
        repositoryCount: 2,
        details: [
          {
            repo: "quietstack-nine/skiffa",
            href: "#",
            countLabel: "22 commits",
            bar: 22,
          },
          {
            repo: "quietstack-nine/market-scout",
            href: "#",
            countLabel: "9 commits",
            bar: 9,
          },
        ],
      },
    ],
  },
]

export const profile: Profile = {
  identity: {
    displayName: "Rowan Alvarez",
    handle: "quietstack-nine",
    pronouns: "they/them",
    bio: "Design Engineer | Platform Engineer\nPortland, OR",
    avatarUrl: "/profile/avatar.svg",
    statusEmoji: "😐",
    statusLabel: "Set status",
  },
  counts: { followers: 31, following: 47 },
  metaRows: [
    { kind: "location", primary: "Portland" },
    { kind: "localTime", primary: "16:51", secondary: "(UTC −07:00)" },
    {
      kind: "website",
      primary: "https://rowan.example.com",
      href: "https://rowan.example.com",
    },
    {
      kind: "social",
      primary: "in/rowanalvarez",
      href: "#",
      brand: "linkedin",
    },
  ],
  achievements,
  organizations,
  readme: {
    path: "quietstack-nine/README.md",
    markdown: [
      "# Rowan Alvarez",
      "",
      "**I prototype in code at the intersection of design, engineering, and AI.**",
      "",
      "I build testable product hypotheses — from customer problem to working interface. I think in systems, ship in React with live AI-powered backends, and design the agent workflows that make modern teams move faster.",
    ].join("\n"),
  },
  pinned,
  contributions,
  availableYears: [
    2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
    2014, 2013, 2012,
  ],
  selectedYear: 2026,
  activityOverview: {
    contributedTo: {
      named: [
        "quietstack-nine/retro-board",
        "quietstack-nine/skiffa",
        "quietstack-nine/market-scout",
      ],
      otherCount: 13,
    },
    breakdown: { commits: 85, codeReview: 0, pullRequests: 15, issues: 0 },
  },
  timeline,
  hasMoreActivity: true,
  isOwner: true,
}

/* -------------------------------------------------------------------------
   Other years
   ---------------------------------------------------------------------- */

/**
 * The year rail is a real single-selection control (spec §13), not a row of
 * dead affordances — but the fixture only carries 2026. Rather than show 2026's
 * numbers under another year's label, every other year renders the empty states
 * the spec already defines (§13): a full grid at level 0, a header reading
 * "No contributions in <year>", and a timeline with no items. Selecting 2019 is
 * therefore a live demonstration of two documented empty states.
 *
 * The grid runs from the Sunday on or before 1 January to 31 December, so its
 * trailing week is usually partial — the same truncation the live year shows.
 */
export function emptyContributionYear(year: number): ContributionYear {
  const first = new Date(Date.UTC(year, 0, 1))
  const start = new Date(first)
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  const last = new Date(Date.UTC(year, 11, 31))

  const days: ContributionDay[] = []
  for (const d = new Date(start); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push({ date: toISODate(d), count: 0, level: 0 })
  }

  return {
    total: 0,
    rangeStart: days[0].date,
    rangeEnd: days[days.length - 1].date,
    days,
  }
}

/** An overview with nothing in it, for a year the fixture has no data for. */
export const emptyActivityOverview: Profile["activityOverview"] = {
  contributedTo: { named: [], otherCount: 0 },
  breakdown: { commits: 0, codeReview: 0, pullRequests: 0, issues: 0 },
}
