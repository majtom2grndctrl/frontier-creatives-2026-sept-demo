import type * as React from "react"

import { cn } from "@/lib/utils"
import { RAMP_STRONG } from "@/lib/profile/ramp"
import type { ActivityOverview } from "@/lib/profile/types"

/* -------------------------------------------------------------------------
   Activity breakdown chart (spec §7.2b)
   ---------------------------------------------------------------------- */

/**
 * A four-axis radar/kite plot, hand-rolled as inline SVG. The repo ships no
 * charting library and this doesn't want one (spec §17): there are no ticks,
 * no gridlines and no configurable scale — four lines, one polygon, a handful
 * of markers, and the arithmetic below.
 *
 * Geometry lives in viewBox units, not CSS pixels: the SVG is sized by its
 * container (`h-auto w-full`) and the numbers below were picked so the plot
 * reads at roughly 1:1 in the card's right pane, which keeps the `text-sm`
 * labels near their nominal size.
 */

/** Centre of the plot, in viewBox units. */
const CX = 160
const CY = 106
/**
 * Axis arm length. §16.16: the arms are the *frame*, not the series — they
 * are always drawn at full length, whatever the data says.
 */
const R = 62
/** Clearance between an arm's end and the nearest edge of its label. */
const GAP = 12
/** Baseline-to-baseline step for a stacked two-line label. */
const LINE = 17
/** Approximate cap height at `text-sm`; used to sit glyphs, not baselines. */
const CAP = 10
/** Marker radius — big enough to read, small enough not to swallow the 15%. */
const MARKER_R = 4

type BreakdownKey = keyof ActivityOverview["breakdown"]

type Axis = {
  key: BreakdownKey
  label: string
  /** Unit vector from the centre. */
  dx: number
  dy: number
  /** Labels align *away* from the centre (spec §7.2b). */
  anchor: "middle" | "start" | "end"
}

/** Clockwise from 12 o'clock — the order is normative (spec §7.2b). */
const AXES: readonly Axis[] = [
  { key: "codeReview", label: "Code review", dx: 0, dy: -1, anchor: "middle" },
  { key: "issues", label: "Issues", dx: 1, dy: 0, anchor: "start" },
  { key: "pullRequests", label: "Pull requests", dx: 0, dy: 1, anchor: "middle" },
  { key: "commits", label: "Commits", dx: -1, dy: 0, anchor: "end" },
]

/**
 * Baselines for a label's one or two lines, stacked away from the centre.
 *
 * The horizontal arms centre their block on the arm's y; the vertical arms
 * centre theirs on the arm's x and grow away from the plot, so the line
 * nearest the arm end is the *last* one at the top and the *first* one at the
 * bottom. Either way the percentage ends up above the category name.
 */
function labelBaselines(axis: Axis, lineCount: number): number[] {
  const endY = CY + axis.dy * R
  if (axis.dy < 0) {
    const nearest = endY - GAP
    return Array.from({ length: lineCount }, (_, i) => nearest - (lineCount - 1 - i) * LINE)
  }
  if (axis.dy > 0) {
    const nearest = endY + GAP + CAP
    return Array.from({ length: lineCount }, (_, i) => nearest + i * LINE)
  }
  const first = CY - ((lineCount - 1) * LINE) / 2 + CAP / 2
  return Array.from({ length: lineCount }, (_, i) => first + i * LINE)
}

export function ActivityBreakdownChart({
  breakdown,
}: {
  breakdown: ActivityOverview["breakdown"]
}): React.JSX.Element {
  /**
   * The radial domain is `0 … max(series)`, NOT `0 … 100` (spec §7.2b).
   *
   * This is the one line a future reader will want to "fix". Don't. These are
   * percentages of a developer's activity, and real distributions are lopsided
   * — the fixture's largest slice is 85%, but a quiet month might top out at
   * 12%. Normalising against 100 would pin every marker within an eighth of
   * the origin and collapse the kite into an invisible sliver. Normalising
   * against the series maximum means the biggest category always lands exactly
   * on its arm's end and the rest are read as fractions of it: 15/85 puts the
   * pull-requests marker about a sixth of an arm out — displaced from the
   * origin, which is the whole point (spec §18).
   */
  const max = Math.max(...AXES.map((axis) => breakdown[axis.key]))

  const points = AXES.map((axis) => {
    // All-zero series: `max` is 0, so skip the divide and collapse to the
    // centre. The frame still draws at full length.
    const t = max > 0 ? breakdown[axis.key] / max : 0
    return {
      axis,
      value: breakdown[axis.key],
      x: CX + axis.dx * R * t,
      y: CY + axis.dy * R * t,
    }
  })

  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ")

  /**
   * §14: a sighted reader can see the two unlabelled axes, so the zeros are
   * spoken explicitly rather than omitted the way the visible labels omit them.
   */
  const description = `Activity breakdown: ${AXES.map(
    (axis) => `${axis.label} ${breakdown[axis.key]}%`
  ).join(", ")}.`

  return (
    <svg
      viewBox="0 0 320 220"
      preserveAspectRatio="xMidYMid meet"
      className="h-auto w-full"
      role="img"
      aria-label={description}
    >
      {/* The geometry is decorative: the aria-label above carries the data. */}
      <g aria-hidden="true">
        {/* §16.14: no rings, gridlines, ticks, legend or axis numbers — the
            four arms are the entire frame. */}
        {AXES.map((axis) => (
          <line
            key={axis.key}
            x1={CX}
            y1={CY}
            x2={CX + axis.dx * R}
            y2={CY + axis.dy * R}
            strokeWidth={1.5}
            strokeLinecap="round"
            className={RAMP_STRONG.stroke}
          />
        ))}

        <polygon points={polygon} fillOpacity={0.25} className={RAMP_STRONG.fill} />

        {/* §16.15: a zero vertex sits at the origin and gets no marker. */}
        {points
          .filter((point) => point.value > 0)
          .map((point) => (
            <circle
              key={point.axis.key}
              cx={point.x}
              cy={point.y}
              r={MARKER_R}
              strokeWidth={2}
              className={cn("fill-background", RAMP_STRONG.stroke)}
            />
          ))}
      </g>

      {/* `fill` inherits in SVG, so `fill-current` + the muted token here
          colours every <text> below without repeating the pair. */}
      <g aria-hidden="true" className="fill-current text-sm text-muted-foreground">
        {AXES.map((axis) => {
          const value = breakdown[axis.key]
          // §16.15: a category at zero shows only its name — never "0%".
          const lines = value > 0 ? [`${value}%`, axis.label] : [axis.label]
          const baselines = labelBaselines(axis, lines.length)
          const x = CX + axis.dx * (R + GAP)
          return lines.map((line, i) => (
            <text key={`${axis.key}-${line}`} x={x} y={baselines[i]} textAnchor={axis.anchor}>
              {line}
            </text>
          ))
        })}
      </g>
    </svg>
  )
}
