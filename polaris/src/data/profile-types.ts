// Data model for the developer profile Overview screen (profile spec §10).
//
// Two colour fields below are deliberately raw strings: `language.color` and
// `achievement.pillColor`. The spec designates both as *data* rather than design
// tokens — the fixture has to prove a non-default language colour and two badges
// whose pills differ — so they arrive with the content, the way an image URL
// does, and are set inline. Nothing else in this app names a colour.

export type Visibility = "public" | "private";

export interface Identity {
  displayName: string;
  handle: string;
  pronouns?: string;
  /** May contain hard line breaks. */
  bio?: string;
  /** Drawn locally as inline SVG — the demo makes no network requests. */
  avatarSeed: string;
  /** Present renders the overlapping status button. */
  statusEmoji?: string;
  statusLabel?: string;
}

export type MetaRowKind = "location" | "localTime" | "website" | "social";

export interface MetaRow {
  kind: MetaRowKind;
  primary: string;
  /** Muted trailing text, e.g. a UTC offset. */
  secondary?: string;
  href?: string;
}

export interface Achievement {
  id: string;
  /** Alt text only; never rendered as a visible label. */
  name: string;
  /** Selects the locally drawn badge artwork. */
  art: "shield" | "ring" | "star" | "hex";
  /** Absent renders no pill. */
  count?: number;
  /** Supplied with the artwork. Data, not a token. */
  pillColor?: string;
}

export interface Organization {
  id: string;
  name: string;
  initials: string;
}

export interface PinnedRepo {
  name: string;
  visibility: Visibility;
  /** Absent, never an empty string, when there is none. */
  description?: string;
  /** `color` is data, not a token. */
  language?: { name: string; color: string };
  /** 0 suppresses the star affordance entirely. */
  stars: number;
}

export interface ContributionDay {
  /** ISO date. */
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionYear {
  /** Rendered thousands-separated. */
  total: number;
  /** ISO date of the first cell. */
  rangeStart: string;
  /** ISO date of the last cell. The trailing week truncates here. */
  rangeEnd: string;
  days: ContributionDay[];
}

export interface ActivityOverview {
  contributedTo: { named: string[]; otherCount: number };
  /** Percentages of total activity, summing to 100. A zero key renders its axis
   *  label with no percentage and no marker. */
  breakdown: { commits: number; codeReview: number; pullRequests: number; issues: number };
}

export type TimelineKind = "commits" | "pullRequests" | "issues" | "reviews" | "createdRepository";

export interface TimelineDetail {
  repo: string;
  href: string;
  /** e.g. "194 commits" — its own link. */
  countLabel?: string;
  /** Raw value; normalized against the item's own maximum. */
  bar?: number;
  statusPill?: { count: number; label: string; tone: "merged" | "open" | "closed" };
  /** Renders a second collapse control on this row. */
  collapsible?: boolean;
}

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  count: number;
  /** 1 -> "1 repository"; 2 -> "2 repositories". */
  repositoryCount: number;
  details: TimelineDetail[];
}

export interface TimelineMonth {
  month: string;
  year: number;
  items: TimelineItem[];
}

export interface ProfileTab {
  id: string;
  label: string;
  icon: "book-open" | "git-repository" | "layout-block" | "package" | "star";
  /** Absent renders no count badge. */
  count?: number;
}

export interface Profile {
  identity: Identity;
  counts: { followers: number; following: number };
  metaRows: MetaRow[];
  achievements: Achievement[];
  organizations: Organization[];
  readme: { path: string; markdown: string } | null;
  /** 0–6, laid out 2-up. */
  pinned: PinnedRepo[];
  contributions: ContributionYear;
  /** Descending; [0] is the newest. */
  availableYears: number[];
  selectedYear: number;
  activityOverview: ActivityOverview;
  timeline: TimelineMonth[];
  hasMoreActivity: boolean;
  /** Gates the four edit affordances. */
  isOwner: boolean;
  tabs: ProfileTab[];
}
