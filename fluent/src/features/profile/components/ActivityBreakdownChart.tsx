import { makeStyles, mergeClasses, tokens, useId } from '@fluentui/react-components'
import type { ActivityOverview } from '../types'
import { rampStrongest, rampWash } from '../palette'

// §7.2b — the activity breakdown, as a four-axis radar/kite plot.
//
// This is one chart, not four stat tiles. §17 is explicit that it stays
// hand-rolled: there are no rings, ticks, gridlines, legend or numeric axis to
// configure (§16.14), and the whole scale is three lines of arithmetic.
//
// The two rules that are easy to get wrong, both from §16:
//
//  * the arms are the *frame*. They are always drawn at full length, whatever
//    the data says (§16.16).
//  * the radial domain is `0 … max(series)`, NOT `0 … 100`. The largest
//    category lands exactly on its arm's end and everything else is a fraction
//    of that maximum. Scaling to 100 would collapse the fixture — 85 and 15 of
//    a notional 100 — into an invisible sliver near the origin.
//
// The numbers in the geometry block below are svg user units, i.e. chart
// geometry rather than design values — the brand guide has no token for "how
// far a radar label sits beyond its arm". Every *colour* and every type step
// still comes from a token or from the §12.1 contribution ramp.

const VIEW_WIDTH = 300
const VIEW_HEIGHT = 220
/** the common centre all four arms radiate from. */
const CENTRE = { x: 150, y: 105 }
/** one arm, centre to tip. Every arm is this long, always (§16.16). */
const ARM = 68
/** clearance between an arm's tip and the nearest edge of its label block. */
const LABEL_GAP = 12
/** vertical pitch of a stacked two-line label (percentage over name). */
const LABEL_LINE_HEIGHT = 15
const MARKER_RADIUS = 4
/** the arms read as a frame: present, but lighter than the marker outline. */
const AXIS_STROKE_WIDTH = 1.5
const MARKER_STROKE_WIDTH = 2

type Breakdown = ActivityOverview['breakdown']
type Placement = 'top' | 'right' | 'bottom' | 'left'

/**
 * §7.2b — clockwise from the top: Code review, Issues, Pull requests, Commits.
 * This array's order is also the polygon's winding order, so do not re-sort it.
 */
const AXES = [
  { key: 'codeReview', label: 'Code review', placement: 'top' },
  { key: 'issues', label: 'Issues', placement: 'right' },
  { key: 'pullRequests', label: 'Pull requests', placement: 'bottom' },
  { key: 'commits', label: 'Commits', placement: 'left' },
] as const satisfies readonly {
  key: keyof Breakdown
  label: string
  placement: Placement
}[]

/** unit vector per placement, in svg coordinates — y grows downward. */
const DIRECTION: Record<Placement, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

/**
 * §14 — the reading order of the accessible description, largest first. A
 * sighted reader can see the two unlabelled axes, so the zeros are spoken
 * explicitly rather than omitted.
 */
const DESCRIPTION_ORDER = [
  { key: 'commits', label: 'Commits' },
  { key: 'pullRequests', label: 'Pull requests' },
  { key: 'codeReview', label: 'Code review' },
  { key: 'issues', label: 'Issues' },
] as const satisfies readonly { key: keyof Breakdown; label: string }[]

const useStyles = makeStyles({
  svg: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
  // §12.1 `data/contribution-N`, darkest step — the ramp, never a neutral.
  axis: {
    stroke: rampStrongest,
    strokeLinecap: 'round',
  },
  // §7.2b — a translucent tint of the same ramp step, not a fifth colour.
  polygon: {
    fill: rampWash,
    stroke: 'none',
  },
  marker: {
    fill: tokens.colorNeutralBackground1,
    stroke: rampStrongest,
  },
  // type/small in text/muted (§12.2, §14 — Foreground2 clears 4.5:1).
  label: {
    fill: tokens.colorNeutralForeground2,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
  },
})

/** where a label block's lines start, and how they stack, for one placement. */
function labelLayout(placement: Placement, lineCount: number) {
  const direction = DIRECTION[placement]
  const anchorX = CENTRE.x + direction.x * (ARM + LABEL_GAP)
  const anchorY = CENTRE.y + direction.y * (ARM + LABEL_GAP)

  switch (placement) {
    // the block grows *upward* off its anchor, so the last line sits on it.
    case 'top':
      return {
        x: anchorX,
        textAnchor: 'middle' as const,
        dominantBaseline: 'auto' as const,
        yOf: (index: number) => anchorY - (lineCount - 1 - index) * LABEL_LINE_HEIGHT,
      }
    // the block grows downward off its anchor.
    case 'bottom':
      return {
        x: anchorX,
        textAnchor: 'middle' as const,
        dominantBaseline: 'hanging' as const,
        yOf: (index: number) => anchorY + index * LABEL_LINE_HEIGHT,
      }
    // §7.2b — the side labels align *away* from the centre, so each reads back
    // toward its own arm rather than drifting across the plot.
    default:
      return {
        x: anchorX,
        textAnchor: placement === 'left' ? ('end' as const) : ('start' as const),
        dominantBaseline: 'middle' as const,
        yOf: (index: number) =>
          anchorY + (index - (lineCount - 1) / 2) * LABEL_LINE_HEIGHT,
      }
  }
}

export interface ActivityBreakdownChartProps {
  /** percentages of total activity; they sum to 100 (§10). */
  breakdown: Breakdown
  className?: string
}

export function ActivityBreakdownChart({
  breakdown,
  className,
}: ActivityBreakdownChartProps) {
  const styles = useStyles()
  const titleId = useId('activity-breakdown-title-')
  const descriptionId = useId('activity-breakdown-desc-')

  // the domain: `0 … max(series)`. The guard is not theoretical — an account
  // with no activity at all sends four zeros, and every vertex then sits on the
  // origin rather than dividing by zero.
  const max = Math.max(...AXES.map((axis) => breakdown[axis.key]))

  const plotted = AXES.map((axis) => {
    const value = breakdown[axis.key]
    const radius = max > 0 ? (value / max) * ARM : 0
    const direction = DIRECTION[axis.placement]
    return {
      ...axis,
      value,
      x: CENTRE.x + direction.x * radius,
      y: CENTRE.y + direction.y * radius,
      tipX: CENTRE.x + direction.x * ARM,
      tipY: CENTRE.y + direction.y * ARM,
    }
  })

  const polygonPoints = plotted.map((point) => `${point.x},${point.y}`).join(' ')

  const description = `Activity breakdown: ${DESCRIPTION_ORDER.map(
    (entry) => `${entry.label} ${breakdown[entry.key]}%`,
  ).join(', ')}.`

  return (
    <svg
      className={mergeClasses(styles.svg, className)}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>Activity breakdown</title>
      {/* §14 — all four categories, the two zeros included. */}
      <desc id={descriptionId}>{description}</desc>

      {/* the frame: four arms at 12/3/6/9, always full length (§16.16). */}
      {plotted.map((axis) => (
        <line
          key={`arm-${axis.key}`}
          className={styles.axis}
          x1={CENTRE.x}
          y1={CENTRE.y}
          x2={axis.tipX}
          y2={axis.tipY}
          strokeWidth={AXIS_STROKE_WIDTH}
        />
      ))}

      {/* the series: one translucent kite through the four plotted vertices. */}
      <polygon className={styles.polygon} points={polygonPoints} />

      {/* §16.15 — a zero vertex sits on the origin and gets no marker. */}
      {plotted
        .filter((axis) => axis.value > 0)
        .map((axis) => (
          <circle
            key={`marker-${axis.key}`}
            className={styles.marker}
            cx={axis.x}
            cy={axis.y}
            r={MARKER_RADIUS}
            strokeWidth={MARKER_STROKE_WIDTH}
          />
        ))}

      {/* §16.15 — a zero category shows its name only, never "0%". */}
      {plotted.map((axis) => {
        const lines = axis.value > 0 ? [`${axis.value}%`, axis.label] : [axis.label]
        const layout = labelLayout(axis.placement, lines.length)
        return (
          <g key={`label-${axis.key}`}>
            {lines.map((line, index) => (
              <text
                key={line}
                className={styles.label}
                x={layout.x}
                y={layout.yOf(index)}
                textAnchor={layout.textAnchor}
                dominantBaseline={layout.dominantBaseline}
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
