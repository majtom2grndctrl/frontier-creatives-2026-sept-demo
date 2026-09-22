/**
 * Data model for the Developer Profile Overview screen (spec §10).
 *
 * Two things here are deliberately *not* stored, because storing them invites
 * the halves to drift: a timeline item's title sentence (derive it from `kind`,
 * `count` and `repositoryCount`) and a detail row's bar length (derive it from
 * `bar / max(item.details.bar)`). Both derivations live in `./format`.
 */

export type Visibility = "public" | "private"

export interface Identity {
  displayName: string
  handle: string
  pronouns?: string
  /** May contain hard line breaks. */
  bio?: string
  avatarUrl: string
  /** Renders the status button overlapping the avatar's lower-right edge. */
  statusEmoji?: string
}

export interface MetaRow {
  kind: "location" | "localTime" | "website" | "social"
  primary: string
  /** Muted trailing text, e.g. a UTC offset. */
  secondary?: string
  href?: string
  /** `social` only — selects the filled brand mark. */
  brand?: string
}

export interface PinnedRepo {
  name: string
  visibility: Visibility
  /** Absent, not empty-string, when there is none. */
  description?: string
  /** `color` is DATA, not a design token. */
  language?: { name: string; color: string }
  /** 0 suppresses the star affordance entirely — no glyph, no "0". */
  stars: number
}

export interface Achievement {
  id: string
  /** Alt text only; never rendered as a visible label. */
  name: string
  imageUrl: string
  /** Absent => no pill. */
  count?: number
  /** Travels with the artwork. DATA, not a token. */
  pillColor?: string
}

export interface Organization {
  id: string
  name: string
  avatarUrl: string
}

export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionYear {
  /** Rendered thousands-separated. */
  total: number
  /** ISO date of the first cell. */
  rangeStart: string
  /** ISO date of the last cell. The trailing week stops here, with no
   *  placeholder cells for the days that have not happened yet. */
  rangeEnd: string
  days: ContributionDay[]
}

export interface ActivityOverview {
  contributedTo: { named: string[]; otherCount: number }
  /** Percentages of total activity; sum to 100. A zero-valued key renders its
   *  axis label with no percentage and no marker. */
  breakdown: {
    commits: number
    codeReview: number
    pullRequests: number
    issues: number
  }
}

export type TimelineKind =
  | "commits"
  | "pullRequests"
  | "issues"
  | "reviews"
  | "createdRepository"

export interface TimelineDetail {
  repo: string
  href: string
  /** e.g. "194 commits"; its own link. */
  countLabel?: string
  /** Raw value; normalized against the item's max. */
  bar?: number
  statusPill?: { count: number; label: string; tone: "merged" | "open" | "closed" }
  /** Renders a second collapse control on this row. */
  collapsible?: boolean
}

export interface TimelineItem {
  kind: TimelineKind
  count: number
  /** 1 -> "1 repository"; 2 -> "2 repositories". */
  repositoryCount: number
  details: TimelineDetail[]
}

export interface TimelineMonth {
  month: string
  year: number
  items: TimelineItem[]
}

export interface Profile {
  identity: Identity
  counts: { followers: number; following: number }
  metaRows: MetaRow[]
  achievements: Achievement[]
  organizations: Organization[]
  readme: { path: string; markdown: string } | null
  /** 0–6; laid out 2-up. */
  pinned: PinnedRepo[]
  contributions: ContributionYear
  /** Descending; [0] is the newest. */
  availableYears: number[]
  selectedYear: number
  activityOverview: ActivityOverview
  timeline: TimelineMonth[]
  hasMoreActivity: boolean
  /** Gates the four edit affordances. */
  isOwner: boolean
}

/** Tab-bar destinations (spec §3 row 2). `count` absent => no count badge. */
export interface ProfileTab {
  label: string
  href: string
  count?: number
  current?: boolean
}
