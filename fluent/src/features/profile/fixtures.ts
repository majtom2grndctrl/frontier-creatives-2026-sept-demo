// seed data for the developer profile overview screen (spec §11).
//
// everything here is fictional — no real person's name, handle, photograph, or
// likeness. values are used verbatim per §11, except that every pinned repo
// carries a description (the spec leaves three absent to exercise the stretch
// rule — that state is no longer covered here). the two absent tab counts are
// `undefined`, not `0` / `''` (§9.1, §16.3).
//
// colours below fall into exactly two buckets, both intentional:
// 1. inlined decorative svg artwork (avatars, achievement badges, org marks) —
//    these are prototype images, not design values, so they carry raw hex the
//    same way the publication fixture's cover art does.
// 2. per-record DATA colours the types.ts contract calls out explicitly —
//    `PinnedRepo.language.color` and `Achievement.pillColor` (§12.1
//    `data/language-*`, §4.5) — never design tokens, per §17.

import type {
  Achievement,
  ActivityOverview,
  ContributionDay,
  ContributionYear,
  Identity,
  MetaRow,
  Organization,
  PinnedRepo,
  Profile,
  TimelineMonth,
} from './types'

/** inlines artwork as a data uri so the prototype makes no network calls. */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`
}

// ---------------------------------------------------------------------------
// identity
// ---------------------------------------------------------------------------

/** abstract geometric monogram — never a photograph (§10, "generic placeholder"). */
const avatarUrl = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="presentation">
  <rect width="96" height="96" fill="#2b3a55"/>
  <circle cx="48" cy="48" r="30" fill="#3d5375"/>
  <path d="M32 62 L48 30 L64 62 Z" fill="#e7ecf5"/>
</svg>`)

const identity: Identity = {
  displayName: 'Rowan Alvarez',
  handle: 'quietstack-nine',
  pronouns: 'they/them',
  // a hard line break between the role line and the short location line — the
  // second line is deliberately short and must not be padded (§4.2).
  bio: 'Design Engineer | Platform Engineer\nPortland, OR',
  avatarUrl,
  statusEmoji: '😐',
}

// ---------------------------------------------------------------------------
// meta rows
// ---------------------------------------------------------------------------

const metaRows: MetaRow[] = [
  { kind: 'location', primary: 'Portland' },
  { kind: 'localTime', primary: '16:51', secondary: '(UTC −07:00)' },
  {
    kind: 'website',
    primary: 'https://rowan.example.com',
    href: 'https://rowan.example.com',
  },
  {
    kind: 'social',
    primary: 'in/rowanalvarez',
    href: 'https://www.linkedin.com/in/rowanalvarez',
    brand: 'linkedin',
  },
]

// ---------------------------------------------------------------------------
// readme
// ---------------------------------------------------------------------------

const readmeMarkdown = `# Rowan Alvarez

**I prototype in code at the intersection of design, engineering, and AI.**

I build testable product hypotheses — from customer problem to working interface. I think in
systems, ship in React with live AI-powered backends, and design the agent workflows that
make modern teams move faster.`

const readme = {
  path: 'quietstack-nine / README.md',
  markdown: readmeMarkdown,
}

// ---------------------------------------------------------------------------
// pinned repositories
// ---------------------------------------------------------------------------

const typescript = { name: 'TypeScript', color: '#3178c6' }
const rust = { name: 'Rust', color: '#dea584' } // deliberately non-default vs. typescript (§11)

const pinned: PinnedRepo[] = [
  {
    name: 'cadence-deck',
    visibility: 'public',
    description:
      'A keyboard-driven presentation tool that builds slide decks from plain Markdown files.',
    language: typescript,
    stars: 4,
  },
  {
    name: 'interest-mapping-workshop',
    visibility: 'public',
    description:
      'Facilitation materials and a live clustering board for running interest-mapping sessions with distributed teams, remote or in person.',
    language: typescript,
    stars: 0,
  },
  {
    name: 'inventory-forecast-prototype',
    visibility: 'public',
    description:
      'A demand-forecasting sandbox for testing reorder thresholds against synthetic sales histories.',
    language: typescript,
    stars: 0,
  },
  {
    name: 'nested-details',
    visibility: 'public',
    description:
      'An HTML custom element for progressive disclosure, designed for long-form text content such as case-study write-ups.',
    language: typescript,
    stars: 0,
  },
  {
    name: 'focus-timer',
    visibility: 'public',
    description: 'A lightweight desktop timer that manufactures deadline pressure.',
    language: rust,
    stars: 0,
  },
]

// ---------------------------------------------------------------------------
// contributions
// ---------------------------------------------------------------------------

const CONTRIBUTION_RANGE_START = '2025-09-14' // a Sunday — the leading week renders in full
const CONTRIBUTION_RANGE_END = '2026-09-14' // a Monday — the trailing week is truncated
const CONTRIBUTION_DAY_COUNT = 366 // 52 full weeks + a 2-day trailing column (§11)

/** adds `offset` days to an iso `YYYY-MM-DD` string, returning the same format. */
function addIsoDays(iso: string, offset: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  date.setDate(date.getDate() + offset)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * deterministic day generator (§11): a small seeded LCG, not `Math.random`, so
 * the fixture is stable across reloads. produces the required density
 * gradient — sparse for the first ~14 weeks, mixed through the middle, dense
 * for the last ~20 — while guaranteeing every level 0-4 appears at least once
 * and every `count` stays consistent with its `level`.
 */
function generateContributionDays(): ContributionDay[] {
  let state = 42
  function nextRand(): number {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }

  // cumulative thresholds for levels [0, 1, 2, 3, 4] per density phase.
  const SPARSE = [0.72, 0.9, 0.98, 1, 1] as const
  const MIXED = [0.2, 0.42, 0.66, 0.85, 1] as const
  const DENSE = [0.04, 0.14, 0.4, 0.68, 1] as const

  function pickLevel(weekIndex: number): 0 | 1 | 2 | 3 | 4 {
    const thresholds = weekIndex < 14 ? SPARSE : weekIndex < 33 ? MIXED : DENSE
    const r = nextRand()
    for (let level = 0; level < thresholds.length; level++) {
      if (r <= thresholds[level]) return level as 0 | 1 | 2 | 3 | 4
    }
    return 4
  }

  function countForLevel(level: 0 | 1 | 2 | 3 | 4): number {
    const r = nextRand()
    switch (level) {
      case 0:
        return 0
      case 1:
        return 1 + Math.floor(r * 3) // 1-3
      case 2:
        return 4 + Math.floor(r * 5) // 4-8
      case 3:
        return 9 + Math.floor(r * 7) // 9-15
      case 4:
        return 16 + Math.floor(r * 10) // 16-25
    }
  }

  const days: ContributionDay[] = []
  for (let i = 0; i < CONTRIBUTION_DAY_COUNT; i++) {
    const weekIndex = Math.floor(i / 7)
    const level = pickLevel(weekIndex)
    const count = countForLevel(level)
    days.push({ date: addIsoDays(CONTRIBUTION_RANGE_START, i), count, level })
  }
  return days
}

const contributions: ContributionYear = {
  // §11 fixes the total at 3,847 independent of the generated days — do not
  // derive this from a sum of `days[].count`.
  total: 3847,
  rangeStart: CONTRIBUTION_RANGE_START,
  rangeEnd: CONTRIBUTION_RANGE_END,
  days: generateContributionDays(),
}

const availableYears: number[] = Array.from({ length: 2026 - 2012 + 1 }, (_, i) => 2026 - i)

const selectedYear = 2026

// ---------------------------------------------------------------------------
// activity overview
// ---------------------------------------------------------------------------

const activityOverview: ActivityOverview = {
  contributedTo: {
    named: [
      'quietstack-nine/retro-board',
      'quietstack-nine/skiffa',
      'quietstack-nine/market-scout',
    ],
    otherCount: 13,
  },
  breakdown: {
    commits: 85,
    pullRequests: 15,
    codeReview: 0,
    issues: 0,
  },
}

// ---------------------------------------------------------------------------
// timeline
// ---------------------------------------------------------------------------

const timeline: TimelineMonth[] = [
  {
    month: 'September',
    year: 2026,
    items: [
      {
        kind: 'commits',
        count: 194,
        repositoryCount: 1,
        details: [
          {
            repo: 'quietstack-nine/retro-board',
            href: '#',
            countLabel: '194 commits',
            bar: 194,
          },
        ],
      },
      {
        kind: 'pullRequests',
        count: 37,
        repositoryCount: 1,
        details: [
          {
            repo: 'quietstack-nine/retro-board',
            href: '#',
            statusPill: { count: 37, label: 'merged', tone: 'merged' },
            collapsible: true,
          },
        ],
      },
      // [prescribed] — not in the source rendering (§11 item 3). added so the
      // fixture proves a detail row's bar is proportional *within* its item
      // (22:9) and that an item can carry more than one detail row.
      {
        kind: 'commits',
        count: 31,
        repositoryCount: 2,
        details: [
          {
            repo: 'quietstack-nine/skiffa',
            href: '#',
            countLabel: '22 commits',
            bar: 22,
          },
          {
            repo: 'quietstack-nine/market-scout',
            href: '#',
            countLabel: '9 commits',
            bar: 9,
          },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// achievements
// ---------------------------------------------------------------------------

// four distinct silhouettes on purpose — §4.5 says artwork must not be clipped
// to a common shape.
const achievementCircle = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="presentation">
  <circle cx="24" cy="24" r="20" fill="#2f6f4f"/>
  <circle cx="24" cy="24" r="12" fill="#7fcf9f"/>
</svg>`)

const achievementShield = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="presentation">
  <path d="M24 4 L42 11 V22 C42 34 34 42 24 45 C14 42 6 34 6 22 V11 Z" fill="#7a4fa8"/>
  <path d="M24 12 L34 16 V23 C34 31 30 36 24 39 C18 36 14 31 14 23 V16 Z" fill="#c8a6ec"/>
</svg>`)

const achievementStar = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="presentation">
  <path
    d="M24 3 L29.5 17.5 L45 18.5 L33 28.5 L37 44 L24 35 L11 44 L15 28.5 L3 18.5 L18.5 17.5 Z"
    fill="#c98a1f"
  />
</svg>`)

const achievementHexagon = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="presentation">
  <path d="M24 4 L42 14 V34 L24 44 L6 34 V14 Z" fill="#1f6f8f"/>
  <path d="M24 13 L35 19.5 V32.5 L24 39 L13 32.5 V19.5 Z" fill="#7fd0e8"/>
</svg>`)

const achievements: Achievement[] = [
  {
    id: 'achievement-pull-shark',
    name: 'Pull Shark',
    imageUrl: achievementCircle,
    count: 2,
    pillColor: '#1f6feb',
  },
  {
    id: 'achievement-galaxy-brain',
    name: 'Galaxy Brain',
    imageUrl: achievementShield,
    // no count => no pill (§11)
  },
  {
    id: 'achievement-quickdraw',
    name: 'Quickdraw',
    imageUrl: achievementStar,
    // no count => no pill (§11)
  },
  {
    id: 'achievement-yolo',
    name: 'YOLO',
    imageUrl: achievementHexagon,
    count: 3,
    // visibly different fill from badge 1 — proves the fill travels with the
    // data rather than a token (§11, §4.5).
    pillColor: '#8957e5',
  },
]

// ---------------------------------------------------------------------------
// organizations
// ---------------------------------------------------------------------------

/** placeholder square (not circular) org marks, per §4.6 / §12.3. */
function orgAvatar(fill: string, glyphFill: string): string {
  return svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" role="presentation">
  <rect width="40" height="40" fill="${fill}"/>
  <rect x="12" y="12" width="16" height="16" fill="${glyphFill}"/>
</svg>`)
}

const organizations: Organization[] = [
  {
    id: 'org-northwind-labs',
    name: 'Northwind Labs',
    avatarUrl: orgAvatar('#33475b', '#e7ecf5'),
  },
  {
    id: 'org-harbor-type-co',
    name: 'Harbor Type Co',
    avatarUrl: orgAvatar('#4a3b2a', '#f0decb'),
  },
  {
    id: 'org-meridian-systems',
    name: 'Meridian Systems',
    avatarUrl: orgAvatar('#2a4a3f', '#cdeee0'),
  },
]

// ---------------------------------------------------------------------------
// tabs
// ---------------------------------------------------------------------------

const tabs: Profile['tabs'] = [
  { id: 'overview', label: 'Overview' },
  { id: 'repositories', label: 'Repositories', count: 26 },
  { id: 'projects', label: 'Projects' },
  { id: 'packages', label: 'Packages' },
  { id: 'stars', label: 'Stars', count: 78 },
]

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------

export const profile: Profile = {
  identity,
  counts: { followers: 31, following: 47 },
  metaRows,
  achievements,
  organizations,
  readme,
  pinned,
  contributions,
  availableYears,
  selectedYear,
  activityOverview,
  timeline,
  hasMoreActivity: true,
  isOwner: true,
  tabs,
}
