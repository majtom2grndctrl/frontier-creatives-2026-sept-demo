/**
 * The sequential contribution ramp (spec §12.1, `data/contribution-N`).
 *
 * Four steps in one hue, defined as theme tokens in `globals.css` so they flip
 * with the theme instead of needing `dark:` overrides. Everything that plots
 * contribution intensity reads the ramp from here: the heatmap, its legend,
 * the activity breakdown chart, and the timeline volume bars.
 *
 * Level 0 is deliberately *not* a step of the ramp — it is the neutral sunken
 * surface (spec §16.11). Keeping it in this array means a cell can index the
 * array by its level and never branch.
 */
export const CONTRIBUTION_LEVEL_BG = [
  "bg-surface-sunken",
  "bg-contribution-1",
  "bg-contribution-2",
  "bg-contribution-3",
  "bg-contribution-4",
] as const

/**
 * The ramp's strong end. Strokes the breakdown chart's axis arms and markers,
 * fills its data polygon, and fills the timeline volume bars.
 */
export const RAMP_STRONG = {
  bg: "bg-contribution-4",
  fill: "fill-contribution-4",
  stroke: "stroke-contribution-4",
} as const

/**
 * Shared geometry for a heatmap cell and a legend swatch — the legend's
 * swatches are the same size and radius as the grid's cells (spec §7.2a).
 * `rounded-2xs` sits below the radius family's floor precisely because a cell
 * this small would otherwise round into a circle; see `globals.css`.
 */
export const CELL_CLASS = "size-sxs rounded-2xs"
