// data model for the developer profile overview screen (spec §10).
//
// this is the contract every region component codes against — names here match
// the spec exactly. two fields carry raw colour rather than a token, and that is
// deliberate in both cases (§17): a language dot and an achievement count pill
// are supplied by the data, not by the design system.

export type Visibility = 'public' | 'private'

export interface Identity {
  displayName: string
  handle: string
  pronouns?: string
  /** free text; may contain hard line breaks. */
  bio?: string
  avatarUrl: string
  /** present => the overlapping status button renders (§4.1). */
  statusEmoji?: string
}

export interface MetaRow {
  kind: 'location' | 'localTime' | 'website' | 'social'
  primary: string
  /** muted trailing text, e.g. a UTC offset. */
  secondary?: string
  href?: string
  /** 'social' only: selects the filled brand mark. */
  brand?: string
}

export interface PinnedRepo {
  name: string
  visibility: Visibility
  /** absent, not empty-string, when there is none (§9.1). */
  description?: string
  /** `color` is DATA, not a token (§12.1 `data/language-*`). */
  language?: { name: string; color: string }
  /** 0 suppresses the star affordance entirely — no glyph, no "0" (§16.8). */
  stars: number
}

export interface Achievement {
  id: string
  /** alt text only; never rendered as a visible label (§4.5). */
  name: string
  imageUrl: string
  /** absent => no pill. */
  count?: number
  /** supplied with the artwork; DATA, not a token (§4.5). */
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
  /** 0 is the neutral recessed surface, not step 0 of the ramp (§16.11). */
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionYear {
  /** rendered thousands-separated. */
  total: number
  /** ISO date of the first cell. */
  rangeStart: string
  /** ISO date of the last cell; the trailing week is truncated here, with no
   *  placeholder cells (§16.12). */
  rangeEnd: string
  days: ContributionDay[]
}

export interface ActivityOverview {
  contributedTo: { named: string[]; otherCount: number }
  /** percentages of total activity; sum to 100. a zero-valued key renders its
   *  axis label with no percentage and no marker (§16.15). */
  breakdown: {
    commits: number
    codeReview: number
    pullRequests: number
    issues: number
  }
}

export type TimelineKind =
  | 'commits'
  | 'pullRequests'
  | 'issues'
  | 'reviews'
  | 'createdRepository'

export interface TimelineDetail {
  repo: string
  href: string
  /** e.g. "194 commits"; its own link. */
  countLabel?: string
  /** raw value; normalised against the item's max at render time (§10). */
  bar?: number
  statusPill?: { count: number; label: string; tone: 'merged' | 'open' | 'closed' }
  /** renders a second collapse control on this row (§9.3). */
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

/** one tab in the profile tab bar (§3 row 2). `count` absent => no badge (§16.3). */
export interface ProfileTab {
  id: string
  label: string
  count?: number
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
  /** descending; [0] is the newest. */
  availableYears: number[]
  selectedYear: number
  activityOverview: ActivityOverview
  timeline: TimelineMonth[]
  hasMoreActivity: boolean
  /** gates the four edit affordances (§1). */
  isOwner: boolean
  /** the chrome band's tab strip (§3 row 2). */
  tabs: ProfileTab[]
}
