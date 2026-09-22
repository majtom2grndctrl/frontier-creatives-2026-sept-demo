import type {
  ContributionDay,
  ContributionYear,
  Profile,
  ProfileTab,
} from "@/lib/profile/types"

/**
 * Fixture for the Developer Profile Overview screen (spec §11).
 *
 * Every name, handle, repository, URL and number here is fictional. The
 * *shapes* are load-bearing, though — a zero star count, a singular
 * "1 repository", a truncated trailing week. Substituting content is fine;
 * flattening those shapes stops the fixture testing what it was built to test.
 *
 * Departure from the spec: every pinned repo carries a description, so the
 * description-less-card states the spec enumerates are not exercised here.
 */

/** The newest cell. Its week is truncated here — Sunday + Monday, no more. */
const RANGE_END = "2026-09-14"
/** 53 columns back: 2026-09-13 (the trailing week's Sunday) minus 364 days. */
const RANGE_START = "2025-09-14"

const DAY_MS = 86_400_000

function isoDay(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}

/**
 * Levels are quantiles of the year's own non-zero distribution, not fixed
 * count thresholds — that is what keeps all five steps of the ramp populated
 * whatever the year's volume happens to be.
 */
function levelAssigner(counts: number[]) {
  const nonZero = counts.filter((n) => n > 0).sort((a, b) => a - b)
  const at = (p: number) => nonZero[Math.floor((nonZero.length - 1) * p)] ?? 0
  const [t1, t2, t3] = [at(0.3), at(0.55), at(0.8)]
  return (count: number): ContributionDay["level"] => {
    if (count === 0) return 0
    if (count <= t1) return 1
    if (count <= t2) return 2
    if (count <= t3) return 3
    return 4
  }
}

/**
 * §11 asks for a visible density gradient — sparse and mostly level 0 through
 * the first ~14 weeks, dense and mostly levels 2–4 through the last ~20 — and
 * a total of exactly 3,847. Generated from a seeded LCG so the server and the
 * client agree on every cell.
 */
function generateContributionDays(total: number): ContributionDay[] {
  const start = Date.parse(`${RANGE_START}T00:00:00Z`)
  const end = Date.parse(`${RANGE_END}T00:00:00Z`)
  const dayCount = Math.round((end - start) / DAY_MS) + 1

  let seed = 0x9e3779b9
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0x100000000
  }

  const raw: number[] = []
  for (let i = 0; i < dayCount; i += 1) {
    const week = Math.floor(i / 7)
    const dow = (i + 0) % 7
    // Ramps from a sparse opening to a dense close, with weekends quieter.
    const ramp = 0.1 + 0.9 * Math.pow(week / 52, 1.6)
    const weekend = dow === 0 || dow === 6 ? 0.5 : 1
    const r = rand()
    const silent = r > 0.25 + 0.65 * ramp
    raw.push(silent ? 0 : Math.max(1, Math.round(r * 24 * ramp * weekend)))
  }

  // Scale to the specified total, then walk the busiest days to land on it
  // exactly — the headline count and the grid must not disagree.
  const rawSum = raw.reduce((a, b) => a + b, 0)
  const scaled = raw.map((n) => (n === 0 ? 0 : Math.max(1, Math.round((n * total) / rawSum))))
  const order = scaled
    .map((n, i) => [n, i] as const)
    .filter(([n]) => n > 0)
    .sort((a, b) => b[0] - a[0])
    .map(([, i]) => i)

  let drift = total - scaled.reduce((a, b) => a + b, 0)
  let cursor = 0
  while (drift !== 0 && order.length > 0) {
    const i = order[cursor % order.length]
    if (drift > 0) {
      scaled[i] += 1
      drift -= 1
    } else if (scaled[i] > 1) {
      scaled[i] -= 1
      drift += 1
    }
    cursor += 1
  }

  const levelFor = levelAssigner(scaled)
  return scaled.map((count, i) => ({
    date: isoDay(start + i * DAY_MS),
    count,
    level: levelFor(count),
  }))
}

const CONTRIBUTIONS_2026: ContributionYear = {
  total: 3847,
  rangeStart: RANGE_START,
  rangeEnd: RANGE_END,
  days: generateContributionDays(3847),
}

/** 2026 → 2012, descending; [0] is the newest. */
export const AVAILABLE_YEARS: number[] = Array.from(
  { length: 2026 - 2012 + 1 },
  (_, i) => 2026 - i
)

/**
 * Only 2026 carries fixture data. Any other year returns a full grid at level
 * 0, which is what §13's "zero contributions in the selected year" empty state
 * is specified against.
 */
export function getContributionYear(year: number): ContributionYear {
  if (year === 2026) return CONTRIBUTIONS_2026
  const start = Date.parse(`${year - 1}-01-05T00:00:00Z`)
  const days: ContributionDay[] = Array.from({ length: 365 }, (_, i) => ({
    date: isoDay(start + i * DAY_MS),
    count: 0,
    level: 0 as const,
  }))
  return {
    total: 0,
    rangeStart: days[0].date,
    rangeEnd: days[days.length - 1].date,
    days,
  }
}

export const PROFILE_TABS: ProfileTab[] = [
  { label: "Overview", href: "/profile", current: true },
  { label: "Repositories", href: "/profile?tab=repositories", count: 26 },
  { label: "Projects", href: "/profile?tab=projects" },
  { label: "Packages", href: "/profile?tab=packages" },
  { label: "Stars", href: "/profile?tab=stars", count: 78 },
]

const BASE: Omit<Profile, "contributions" | "selectedYear" | "timeline" | "activityOverview"> = {
  identity: {
    displayName: "Rowan Alvarez",
    handle: "quietstack-nine",
    pronouns: "they/them",
    bio: "Design Engineer | Platform Engineer\nPortland, OR",
    avatarUrl: "/profile/avatar.svg",
    statusEmoji: "😐",
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
      href: "https://www.example.com/in/rowanalvarez",
      brand: "linkedin",
    },
  ],
  achievements: [
    {
      id: "pull-shark",
      name: "Pull Shark",
      imageUrl: "/profile/achievement-1.svg",
      count: 2,
      pillColor: "#1b4fbd",
    },
    { id: "quickdraw", name: "Quickdraw", imageUrl: "/profile/achievement-2.svg" },
    { id: "yolo", name: "YOLO", imageUrl: "/profile/achievement-3.svg" },
    {
      id: "starstruck",
      name: "Starstruck",
      imageUrl: "/profile/achievement-4.svg",
      count: 3,
      pillColor: "#9a6700",
    },
  ],
  organizations: [
    { id: "northbeam", name: "Northbeam Labs", avatarUrl: "/profile/org-1.svg" },
    { id: "skiffa", name: "Skiffa Collective", avatarUrl: "/profile/org-2.svg" },
    { id: "dunelight", name: "Dunelight", avatarUrl: "/profile/org-3.svg" },
  ],
  readme: {
    path: "quietstack-nine / README.md",
    markdown: `# Rowan Alvarez

**I prototype in code at the intersection of design, engineering, and AI.**

I build testable product hypotheses — from customer problem to working interface. I think in systems, ship in React with live AI-powered backends, and design the agent workflows that make modern teams move faster.`,
  },
  pinned: [
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
      description: "A lightweight desktop timer that manufactures deadline pressure.",
      language: { name: "Rust", color: "#dea584" },
      stars: 0,
    },
  ],
  availableYears: AVAILABLE_YEARS,
  hasMoreActivity: true,
  isOwner: true,
}

const ACTIVITY_2026: Profile["activityOverview"] = {
  contributedTo: {
    named: [
      "quietstack-nine/retro-board",
      "quietstack-nine/skiffa",
      "quietstack-nine/market-scout",
    ],
    otherCount: 13,
  },
  breakdown: { commits: 85, codeReview: 0, pullRequests: 15, issues: 0 },
}

const TIMELINE_2026: Profile["timeline"] = [
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
      // Not in the source rendering. Kept deliberately (§11) so the fixture
      // proves the volume bar normalizes *within* an item and that an item can
      // carry more than one detail row.
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

/**
 * The second page of timeline items, revealed by "Show more activity" (§13).
 *
 * Not in the source rendering — added the same way §11 adds timeline item 3,
 * and for the same reason: `hasMoreActivity: true` is meaningless without a
 * page to load, and these months are the only place the remaining three
 * `TimelineKind` values, a bare detail row, and a three-repository item get
 * exercised at all. [prescribed]
 */
const TIMELINE_MORE_2026: Profile["timeline"] = [
  {
    month: "August",
    year: 2026,
    items: [
      // Three detail rows, so the volume bar's within-item normalization is
      // proved against more than a pair.
      {
        kind: "reviews",
        count: 21,
        repositoryCount: 3,
        details: [
          { repo: "quietstack-nine/retro-board", href: "#", countLabel: "11 reviews", bar: 11 },
          { repo: "quietstack-nine/skiffa", href: "#", countLabel: "7 reviews", bar: 7 },
          { repo: "quietstack-nine/market-scout", href: "#", countLabel: "3 reviews", bar: 3 },
        ],
      },
      {
        kind: "issues",
        count: 8,
        repositoryCount: 1,
        details: [
          { repo: "quietstack-nine/retro-board", href: "#", countLabel: "8 issues", bar: 8 },
        ],
      },
      // Two status pills in one item — the first fixture case where a pill row
      // is not also the item's only row.
      {
        kind: "pullRequests",
        count: 12,
        repositoryCount: 2,
        details: [
          {
            repo: "quietstack-nine/skiffa",
            href: "#",
            statusPill: { count: 9, label: "merged", tone: "merged" },
            collapsible: true,
          },
          {
            repo: "quietstack-nine/market-scout",
            href: "#",
            statusPill: { count: 3, label: "merged", tone: "merged" },
          },
        ],
      },
    ],
  },
  {
    month: "July",
    year: 2026,
    items: [
      // `createdRepository` takes no "in N repositories" clause, and this
      // detail row carries neither a bar nor a pill — both shapes the first
      // page leaves untested.
      {
        kind: "createdRepository",
        count: 1,
        repositoryCount: 1,
        details: [{ repo: "quietstack-nine/focus-timer", href: "#" }],
      },
      {
        kind: "commits",
        count: 64,
        repositoryCount: 1,
        details: [
          { repo: "quietstack-nine/retro-board", href: "#", countLabel: "64 commits", bar: 64 },
        ],
      },
    ],
  },
]

/**
 * The next page of activity for `year`, or nothing when there is none. Kept
 * separate from `getProfile` because §10's `Profile` models only the page
 * currently on screen plus a `hasMoreActivity` flag.
 */
export function getAdditionalTimeline(year: number): Profile["timeline"] {
  return year === 2026 ? TIMELINE_MORE_2026 : []
}

/** The profile as of `year`. Years other than 2026 exercise the empty states. */
export function getProfile(year: number = 2026): Profile {
  const isSeeded = year === 2026
  return {
    ...BASE,
    selectedYear: year,
    contributions: getContributionYear(year),
    activityOverview: isSeeded
      ? ACTIVITY_2026
      : {
          contributedTo: { named: [], otherCount: 0 },
          breakdown: { commits: 0, codeReview: 0, pullRequests: 0, issues: 0 },
        },
    timeline: isSeeded ? TIMELINE_2026 : [],
    hasMoreActivity: isSeeded,
  }
}
