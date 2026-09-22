import type { TimelineItem, TimelineKind } from "./types"

/** Thousands-separated, e.g. 3847 -> "3,847" (spec §7.1). */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US")
}

/** "1 repository" / "2 repositories" (spec §10, derived not stored). */
export function pluralizeRepositories(n: number): string {
  return `${n} ${n === 1 ? "repository" : "repositories"}`
}

const KIND_PHRASE: Record<TimelineKind, (count: number) => string> = {
  commits: (c) => `Created ${c} commit${c === 1 ? "" : "s"}`,
  pullRequests: (c) => `Opened ${c} pull request${c === 1 ? "" : "s"}`,
  issues: (c) => `Opened ${c} issue${c === 1 ? "" : "s"}`,
  reviews: (c) => `Reviewed ${c} pull request${c === 1 ? "" : "s"}`,
  createdRepository: (c) => `Created ${c} repositor${c === 1 ? "y" : "ies"}`,
}

/**
 * `createdRepository` counts repositories already, so appending the repository
 * clause would read "Created 1 repository in 1 repository". It is the one kind
 * that carries no suffix.
 */
const KINDS_WITHOUT_REPOSITORY_CLAUSE = new Set<TimelineKind>(["createdRepository"])

/**
 * The timeline item's title sentence — composed, never stored (spec §10).
 * "Created 194 commits in 1 repository".
 */
export function timelineTitle(item: TimelineItem): string {
  const phrase = KIND_PHRASE[item.kind](item.count)
  if (KINDS_WITHOUT_REPOSITORY_CLAUSE.has(item.kind)) return phrase
  return `${phrase} in ${pluralizeRepositories(item.repositoryCount)}`
}

/**
 * A detail row's volume-bar length as a fraction of its track — normalized
 * *within the item*, so the item's largest repository fills the track (§9.3).
 */
export function barFraction(item: TimelineItem, value: number | undefined): number {
  if (value === undefined) return 0
  const max = Math.max(...item.details.map((d) => d.bar ?? 0))
  return max > 0 ? value / max : 0
}

/**
 * `data/contribution-N` (spec §12.1): a four-step sequential ramp in one hue,
 * built by stepping the alpha of a single chart token. Level 0 is deliberately
 * NOT step 0 of the ramp — it is the neutral recessed surface (§16.11).
 */
export const CONTRIBUTION_LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-border",
  1: "bg-chart-2/25",
  2: "bg-chart-2/50",
  3: "bg-chart-2/75",
  4: "bg-chart-2",
}

/** "3 contributions on Tuesday, September 9, 2026" (spec §14). */
export function contributionCellLabel(date: string, count: number): string {
  const [y, m, d] = date.split("-").map(Number)
  const full = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  return count === 0
    ? `No contributions on ${full}`
    : `${count} contribution${count === 1 ? "" : "s"} on ${full}`
}
