// Seed data for the developer profile Overview screen (profile spec §11).
// Entirely fictional. It is chosen to exercise every rendering state the spec
// enumerates: a zero star count that suppresses its affordance, a singular
// "1 repository", a truncated trailing week, a radar category at exactly zero,
// and two achievement badges whose count pills differ.
//
// Departure from the spec: every pinned repo carries a description here, so the
// spec's description-less card states (§11 "States this fixture guarantees")
// are not exercised. The card's stretch rule still handles an absent
// description — this fixture just no longer covers it.

import type {
  ContributionDay,
  ContributionYear,
  Profile,
} from "@/data/profile-types";
import { DAY_MS, isoDay, parseDay } from "@/lib/contributions";

/** The fixture's "today" — a Monday, so the trailing week holds two days. */
const RANGE_END = "2026-09-14";
/** 52 whole weeks back, which lands on a Sunday. */
const RANGE_START = "2025-09-14";
const TOTAL_CONTRIBUTIONS = 3847;

/** Deterministic, so the heatmap is identical on every load. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Level 0 carries no count; the rest widen as they climb. */
const LEVEL_RANGE: Record<number, [number, number]> = {
  0: [0, 0],
  1: [1, 4],
  2: [6, 14],
  3: [15, 26],
  4: [27, 48],
};

/**
 * A year of days with a visible density gradient: sparse and mostly level 0
 * through the first fourteen weeks, dense and mostly levels 2–4 through the
 * last twenty. Counts are then nudged, within their own level's range, until the
 * year sums to exactly `TOTAL_CONTRIBUTIONS` — so the header and the grid agree.
 */
function generateDays(): ContributionDay[] {
  const random = mulberry32(20260914);
  const start = parseDay(RANGE_START);
  const end = parseDay(RANGE_END);
  const count = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;

  const days: ContributionDay[] = [];

  for (let index = 0; index < count; index += 1) {
    // Step by calendar day, not by a fixed 24 hours: adding `DAY_MS` across a
    // daylight-saving boundary lands on the previous date again, which would
    // collapse two days onto one and leave a hole in the grid.
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const week = Math.floor(index / 7);
    // 0 at the start of the year, 1 at the end.
    const ramp = Math.min(1, Math.max(0, (week - 5) / 34));
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const activity = random() * (0.26 + 1.2 * ramp) * (weekend ? 0.6 : 1);

    const level: ContributionDay["level"] =
      activity < 0.17 ? 0 : activity < 0.36 ? 1 : activity < 0.62 ? 2 : activity < 0.9 ? 3 : 4;

    const [low, high] = LEVEL_RANGE[level]!;
    days.push({
      date: isoDay(date),
      count: low + Math.floor(random() * (high - low + 1)),
      level,
    });
  }

  reconcileTotal(days);
  return days;
}

/**
 * Spend (or reclaim) the difference across the days that can absorb it without
 * leaving their own level's range, so the grid's gradient survives the
 * reconciliation. Walking the list in a fixed order keeps it deterministic.
 */
function reconcileTotal(days: ContributionDay[]): void {
  let sum = days.reduce((running, day) => running + day.count, 0);
  const adjustable = days.filter((day) => day.level > 0);

  while (sum !== TOTAL_CONTRIBUTIONS) {
    const delta = sum < TOTAL_CONTRIBUTIONS ? 1 : -1;
    let moved = 0;

    for (const day of adjustable) {
      if (sum === TOTAL_CONTRIBUTIONS) break;
      const [low, high] = LEVEL_RANGE[day.level]!;
      const next = day.count + delta;
      if (next < low || next > high) continue;
      day.count = next;
      sum += delta;
      moved += 1;
    }

    // Every adjustable day is pinned at its bound; the fixture cannot reach the
    // target without changing a level, so stop rather than spin.
    if (moved === 0) break;
  }
}

const contributions2026: ContributionYear = {
  total: TOTAL_CONTRIBUTIONS,
  rangeStart: RANGE_START,
  rangeEnd: RANGE_END,
  days: generateDays(),
};

const README = `# Rowan Alvarez

**I prototype in code at the intersection of design, engineering, and AI.**

I build testable product hypotheses — from customer problem to working interface. I think in systems, ship in React with live AI-powered backends, and design the agent workflows that make modern teams move faster.`;

export const profile: Profile = {
  isOwner: true,

  identity: {
    displayName: "Rowan Alvarez",
    handle: "quietstack-nine",
    pronouns: "they/them",
    bio: "Design Engineer | Platform Engineer\nPortland, OR",
    avatarSeed: "rowan-alvarez",
    statusEmoji: "😐",
    statusLabel: "Set status: heads down this week",
  },

  counts: { followers: 31, following: 47 },

  metaRows: [
    { kind: "location", primary: "Portland" },
    { kind: "localTime", primary: "16:51", secondary: "(UTC −07:00)" },
    { kind: "website", primary: "https://rowan.example.com", href: "https://rowan.example.com" },
    { kind: "social", primary: "in/rowanalvarez", href: "https://example.com/in/rowanalvarez" },
  ],

  // `pillColor` travels with the badge rather than coming from a token — the two
  // different fills below are the point of the fixture.
  achievements: [
    { id: "a1", name: "Pull Shark", art: "shield", count: 2, pillColor: "#3b6fd4" },
    { id: "a2", name: "Quickdraw", art: "ring" },
    { id: "a3", name: "YOLO", art: "star" },
    { id: "a4", name: "Starstruck", art: "hex", count: 3, pillColor: "#b8590f" },
  ],

  organizations: [
    { id: "o1", name: "Northbank Labs", initials: "NL" },
    { id: "o2", name: "Cedar Interactive", initials: "CI" },
    { id: "o3", name: "Fieldnote Collective", initials: "FC" },
  ],

  readme: { path: "quietstack-nine/README.md", markdown: README },

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
      language: { name: "Rust", color: "#c8642c" },
      stars: 0,
    },
  ],

  contributions: contributions2026,

  availableYears: Array.from({ length: 15 }, (_, index) => 2026 - index),
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
    breakdown: { commits: 85, pullRequests: 15, codeReview: 0, issues: 0 },
  },

  timeline: [
    {
      month: "September",
      year: 2026,
      items: [
        {
          id: "t1",
          kind: "commits",
          count: 194,
          repositoryCount: 1,
          details: [
            {
              repo: "quietstack-nine/retro-board",
              href: "#/quietstack-nine/retro-board",
              countLabel: "194 commits",
              bar: 194,
            },
          ],
        },
        {
          id: "t2",
          kind: "pullRequests",
          count: 37,
          repositoryCount: 1,
          details: [
            {
              repo: "quietstack-nine/retro-board",
              href: "#/quietstack-nine/retro-board",
              statusPill: { count: 37, label: "merged", tone: "merged" },
              collapsible: true,
            },
          ],
        },
        // Not in the source rendering. It proves the volume bar is proportional
        // *within* an item, and that an item can carry more than one detail row.
        {
          id: "t3",
          kind: "commits",
          count: 31,
          repositoryCount: 2,
          details: [
            {
              repo: "quietstack-nine/skiffa",
              href: "#/quietstack-nine/skiffa",
              countLabel: "22 commits",
              bar: 22,
            },
            {
              repo: "quietstack-nine/market-scout",
              href: "#/quietstack-nine/market-scout",
              countLabel: "9 commits",
              bar: 9,
            },
          ],
        },
      ],
    },
  ],

  hasMoreActivity: true,

  tabs: [
    { id: "overview", label: "Overview", icon: "book-open" },
    { id: "repositories", label: "Repositories", icon: "git-repository", count: 26 },
    { id: "projects", label: "Projects", icon: "layout-block" },
    { id: "packages", label: "Packages", icon: "package" },
    { id: "stars", label: "Stars", icon: "star", count: 78 },
  ],
};

export const FOOTER_NOTE = {
  before: "Seeing something unexpected? Take a look at the ",
  linkLabel: "profile guide",
  after: ".",
};
