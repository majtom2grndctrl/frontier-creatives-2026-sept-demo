/**
 * Data model for the developer profile Overview screen (spec §10).
 *
 * Nothing here is fetched — the whole screen renders from the fixture in
 * `./fixture.ts`. Two fields carry colour as *data* rather than as a token:
 * `PinnedRepo.language.color` and `Achievement.pillColor`. They arrive with
 * the content and are set via inline style; they must never be promoted into
 * the design system (spec §12.1, §17).
 */

export type Visibility = "public" | "private"

export interface Identity {
  displayName: string
  handle: string
  pronouns?: string
  /** Free text; may contain hard line breaks. */
  bio?: string
  avatarUrl: string
  /** Present → the status button overlapping the avatar renders. */
  statusEmoji?: string
  /** Accessible label for the status button. */
  statusLabel?: string
}

export interface MetaRow {
  kind: "location" | "localTime" | "website" | "social"
  primary: string
  /** Muted trailing text, e.g. a UTC offset. */
  secondary?: string
  href?: string
  /** `social` only: selects the filled brand mark. */
  brand?: string
}

export interface PinnedRepo {
  name: string
  visibility: Visibility
  /** Absent, not empty-string, when there is none. */
  description?: string
  /** `color` is DATA, not a token. */
  language?: { name: string; color: string }
  /** 0 suppresses the star affordance entirely. */
  stars: number
}

export interface Achievement {
  id: string
  /** Alt text only; never rendered as a visible label. */
  name: string
  imageUrl: string
  /** Absent → no pill. */
  count?: number
  /** Supplied with the artwork; DATA, not a token. */
  pillColor?: string
}

export interface Organization {
  id: string
  name: string
  avatarUrl: string
}

export interface ContributionDay {
  /** ISO date. */
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionYear {
  /** Rendered thousands-separated. */
  total: number
  rangeStart: string
  /** The trailing week is truncated here, with no placeholder cells. */
  rangeEnd: string
  days: ContributionDay[]
}

export interface ActivityOverview {
  contributedTo: { named: string[]; otherCount: number }
  /**
   * Percentages of total activity. Sum to 100. Zero-valued keys render their
   * axis label with no percentage and no marker.
   */
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
  /** Raw value; normalised against the item's max at render time. */
  bar?: number
  statusPill?: { count: number; label: string; tone: "merged" | "open" | "closed" }
  /** Renders a second collapse control on this row. */
  collapsible?: boolean
}

export interface TimelineItem {
  kind: TimelineKind
  count: number
  /** 1 → "1 repository"; 2 → "2 repositories". */
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
  /** Gates the four edit affordances (spec §1). */
  isOwner: boolean
}

/** Tab bar entries (spec §3, row 2). A missing `count` renders no badge. */
export interface ProfileTab {
  id: string
  label: string
  href: string
  count?: number
}
