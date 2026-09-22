import type * as React from "react"

import type { ActivityOverview } from "@/lib/profile/types"

/**
 * Spec §7.2b (right pane) — the activity breakdown chart.
 *
 * A hand-rolled four-axis radar/kite plot: four full-length arms at 12/3/6/9
 * o'clock, one translucent polygon, a marker on every non-zero vertex, and the
 * labels. No charting library (§17), and nothing else — no rings, gridlines,
 * ticks, legend or numeric axis (§16.14).
 *
 * Two details carry the whole chart:
 *
 * - The radial domain is `0 … max(series)`, **not** `0 … 100`. The largest
 *   category lands exactly on its arm's end and everything else is a fraction
 *   of that maximum, so an 85/15 split reads as a kite rather than collapsing
 *   into an invisible sliver near the origin.
 * - The arms are the frame, not the series (§16.16): they are always drawn at
 *   full length, whatever the data does.
 *
 * Colour comes from the contribution ramp's darkest step (`chart-2`), read as a
 * CSS variable so the SVG stays theme-aware.
 */

/** Unit vectors, clockwise from the top: Code review, Issues, Pull requests, Commits. */
const AXES = [
  { key: "codeReview", label: "Code review", dx: 0, dy: -1 },
  { key: "issues", label: "Issues", dx: 1, dy: 0 },
  { key: "pullRequests", label: "Pull requests", dx: 0, dy: 1 },
  { key: "commits", label: "Commits", dx: -1, dy: 0 },
] as const satisfies readonly {
  key: keyof ActivityOverview["breakdown"]
  label: string
  dx: number
  dy: number
}[]

/** Generous margins so "Pull requests" and "Code review" never clip. */
const VIEW_W = 340
const VIEW_H = 250
const CX = VIEW_W / 2
const CY = 120
/** Arm length. Equal on all four axes, always drawn in full. */
const R = 68
/** Gap between an arm's end and the start of its label block. */
const LABEL_GAP = 10
const LINE_HEIGHT = 14

export function ActivityBreakdownChart({
  breakdown,
}: {
  breakdown: ActivityOverview["breakdown"]
}): React.JSX.Element {
  const max = Math.max(...AXES.map((axis) => breakdown[axis.key]))

  const points = AXES.map((axis) => {
    const value = breakdown[axis.key]
    // Guard the divide-by-zero: an all-zero series plots at the origin.
    const radius = max === 0 ? 0 : (value / max) * R
    return {
      ...axis,
      value,
      x: CX + axis.dx * radius,
      y: CY + axis.dy * radius,
      armX: CX + axis.dx * R,
      armY: CY + axis.dy * R,
    }
  })

  // Enumerates every category including the zeros — the two unlabelled axes are
  // visible to a sighted reader, so they must be spoken too (§14).
  const description = `Activity breakdown: ${points
    .map((point) => `${point.label} ${point.value}%`)
    .join(", ")}.`

  return (
    <svg
      role="img"
      aria-label={description}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
    >
      {/* The frame: four solid arms, always full length, in the ramp's dark end. */}
      {points.map((point) => (
        <line
          key={point.key}
          x1={CX}
          y1={CY}
          x2={point.armX}
          y2={point.armY}
          stroke="var(--color-chart-2)"
          strokeWidth={1}
        />
      ))}

      {/* The series: one translucent polygon through all four vertices, zeros included. */}
      <polygon
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        fill="var(--color-chart-2)"
        fillOpacity={0.2}
        stroke="var(--color-chart-2)"
        strokeWidth={1}
      />

      {/* A marker on every non-zero vertex only (§16.15). */}
      {points
        .filter((point) => point.value > 0)
        .map((point) => (
          <circle
            key={point.key}
            cx={point.x}
            cy={point.y}
            r={3.5}
            fill="var(--color-background)"
            stroke="var(--color-chart-2)"
            strokeWidth={1.5}
          />
        ))}

      {/* Labels just beyond each arm's end, aligned away from the centre. A
          non-zero axis stacks its percentage above the name; a zero axis shows
          the name alone — no "0%" (§16.15). */}
      {points.map((point) => {
        const lines =
          point.value > 0 ? [`${point.value}%`, point.label] : [point.label]

        const anchor =
          point.dx === 0 ? "middle" : point.dx > 0 ? "start" : "end"
        const x =
          point.dx === 0 ? CX : point.armX + point.dx * LABEL_GAP

        const baseline = (index: number) => {
          if (point.dy < 0) {
            // Above the top arm: stack upward so the last line sits nearest it.
            return point.armY - LABEL_GAP - (lines.length - 1 - index) * LINE_HEIGHT
          }
          if (point.dy > 0) {
            return point.armY + LABEL_GAP + 10 + index * LINE_HEIGHT
          }
          // Side arms: centre the block on the axis.
          return CY + 4 - ((lines.length - 1) * LINE_HEIGHT) / 2 + index * LINE_HEIGHT
        }

        return (
          <text
            key={point.key}
            className="text-xs"
            textAnchor={anchor}
            fill="var(--color-muted-foreground)"
          >
            {lines.map((line, index) => (
              <tspan key={line} x={x} y={baseline(index)}>
                {line}
              </tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}
