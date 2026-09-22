/** Formatting helpers for the developer profile screen. */

/** Thousands-separated, e.g. 3847 → "3,847" (spec §7.1). */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US")
}

/** "1 repository" / "2 repositories" (spec §9.3). */
export function pluralize(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/** e.g. "Saturday, September 12, 2026" — for heatmap cell accessible names. */
export function formatFullDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
