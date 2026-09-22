// pure formatting helpers for the profile screen. no DOM, no react.
//
// §10 is explicit that two things are derived rather than stored: a timeline
// item's title sentence, and a detail row's bar length. Both live here so the
// halves cannot drift.

import type { TimelineDetail, TimelineItem, TimelineKind } from './types'

const grouped = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

/** thousands-separated whole numbers: 3847 -> "3,847". */
export function formatCount(value: number): string {
  return grouped.format(value)
}

/** `1 repository` / `2 repositories` (§9.3). */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`
}

/** the verb phrase each timeline kind opens with. */
const KIND_PHRASE: Record<TimelineKind, (count: number) => string> = {
  commits: (n) => `Created ${pluralize(n, 'commit', 'commits')}`,
  pullRequests: (n) => `Opened ${pluralize(n, 'pull request', 'pull requests')}`,
  issues: (n) => `Opened ${pluralize(n, 'issue', 'issues')}`,
  reviews: (n) => `Reviewed ${pluralize(n, 'pull request', 'pull requests')}`,
  createdRepository: (n) => `Created ${pluralize(n, 'repository', 'repositories')}`,
}

/**
 * §10 — the item title, composed from `kind`, `count` and `repositoryCount`.
 * `createdRepository` names repositories in its own count, so it takes no
 * trailing "in N repositories" clause.
 */
export function timelineItemTitle(item: TimelineItem): string {
  const phrase = KIND_PHRASE[item.kind](item.count)
  if (item.kind === 'createdRepository') return phrase
  return `${phrase} in ${pluralize(item.repositoryCount, 'repository', 'repositories')}`
}

/**
 * §10 — a detail row's bar length as a fraction of the *item's* largest bar, so
 * the comparison is within the item rather than across the page.
 * Returns null for a row with no bar.
 */
export function barFraction(detail: TimelineDetail, details: TimelineDetail[]): number | null {
  if (detail.bar === undefined) return null
  const max = Math.max(...details.map((d) => d.bar ?? 0))
  return max > 0 ? detail.bar / max : 0
}

const fullDate = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/** a heatmap cell's accessible name and tooltip (§13, §14). */
export function contributionCellLabel(count: number, isoDate: string): string {
  // ISO dates are parsed as local midnight so the label never slips a day west
  // of greenwich — same reasoning as the publication fixture's date handling.
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  const when = fullDate.format(date)
  return count === 0
    ? `No contributions on ${when}`
    : `${pluralize(count, 'contribution', 'contributions')} on ${when}`
}

/** §7.1 header, and its zero-contribution empty state (§13). */
export function contributionsHeading(total: number, year: number): string {
  return total === 0
    ? `No contributions in ${year}`
    : `${formatCount(total)} contributions in the last year`
}

/**
 * §7.2b — the activity-overview sentence's trailing clause. Returns null when
 * there are no further repositories, so the caller renders no " and …" tail.
 */
export function otherRepositoriesClause(otherCount: number): string | null {
  if (otherCount <= 0) return null
  return ` and ${pluralize(otherCount, 'other repository', 'other repositories')}`
}
