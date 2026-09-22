import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Caption1, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import { BookmarkRegular } from '@fluentui/react-icons'
import type { MetricFormat, Period, SeriesPoint } from '../types'
import type { XDomain, YDomain } from '../series'
import { describeSeries } from '../series'
import { formatDate, formatMetricValue } from '../format'

// §6.3 — a hand-rolled step-area chart.
//
// `stepAfter` interpolation is the whole point: the series is a cumulative count,
// so a straight diagonal between two counts would assert values that never
// existed. Flat runs joined by vertical risers only.
//
// The numbers in PLOT_INSET / CHART_HEIGHT are svg user units, i.e. chart
// geometry rather than design values — the brand guide has no token for "how far
// the y-axis labels sit from the plot". Every *colour* and every type step below
// still comes from a token.

const CHART_HEIGHT = 260
const PLOT_INSET = { top: 20, right: 20, bottom: 32, left: 56 }
const FALLBACK_WIDTH = 640
/** the series stroke: heavier than the gridlines, lighter than a border (§6.3). */
const SERIES_STROKE_WIDTH = 2
const HAIRLINE_STROKE_WIDTH = 1

const monthDay = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const monthYear = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  year: 'numeric',
})

const DAY_MS = 24 * 60 * 60 * 1000

const useStyles = makeStyles({
  panel: {
    position: 'relative',
    // the hairline that separates the §6.2 strip from the plot
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: `calc(-1 * ${tokens.strokeWidthThick})`,
    },
  },
  plot: {
    position: 'relative',
    width: '100%',
  },
  svg: {
    display: 'block',
    width: '100%',
    touchAction: 'none',
  },
  // §13 accent/solid — the data line.
  line: {
    fill: 'none',
    stroke: tokens.colorBrandBackground,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  },
  // §13 accent/tonal — the area beneath it, at a lower opacity.
  area: {
    fill: tokens.colorBrandBackground2,
    fillOpacity: 0.6,
    stroke: 'none',
  },
  series: {
    animationName: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveEasyEase,
    // §15 — reduced motion makes the re-plot instant.
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },
  gridline: {
    stroke: tokens.colorNeutralStroke2,
    strokeOpacity: 0.6,
  },
  rule: {
    stroke: tokens.colorNeutralStroke2,
  },
  axisLabel: {
    fill: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase100,
  },
  crosshair: {
    stroke: tokens.colorNeutralForeground3,
    strokeDasharray: '3 3',
  },
  marker: {
    fill: tokens.colorBrandBackground,
    stroke: tokens.colorNeutralBackground1,
  },
  // §6.3 — bottom-right inside the plot: a bookmark glyph plus the publication
  // domain in uppercase letter-spaced micro type, in the tertiary role.
  watermark: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXXS,
    pointerEvents: 'none',
    color: tokens.colorNeutralForeground3,
    letterSpacing: '0.08em',
  },
  tooltip: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXXS,
    paddingBlock: tokens.spacingVerticalXS,
    paddingInline: tokens.spacingHorizontalS,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
    whiteSpace: 'nowrap',
  },
  tooltipDate: {
    color: tokens.colorNeutralForeground3,
  },
  tooltipValue: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  // §14.3 — the empty metric still plots: a flat zero-state run plus this caption,
  // rather than an absent axis or a crash.
  emptyState: {
    position: 'absolute',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    textAlign: 'center',
    pointerEvents: 'none',
    color: tokens.colorNeutralForeground3,
  },
  // an accessibility utility, so the 1px values here are correctly literal.
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 'none',
  },
})

/**
 * Integer ticks across a domain that starts at the series minimum, not at zero
 * (§6.3). Steps are 1/2/5 × a power of ten, and never smaller than 1 when the
 * domain itself is whole — the y axis of a count should not read `33.5`.
 */
function integerTicks(min: number, max: number, target = 4): number[] {
  const span = max - min
  if (!(span > 0)) return [min]

  const rough = span / target
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  let step =
    [1, 2, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ??
    10 * magnitude
  if (Number.isInteger(min) && Number.isInteger(max)) {
    step = Math.max(1, Math.round(step))
  }

  const ticks: number[] = []
  const first = Math.ceil(min / step) * step
  for (let value = first; value <= max + step * 1e-9; value += step) {
    ticks.push(Number(value.toPrecision(12)))
  }
  return ticks.length > 0 ? ticks : [min, max]
}

/** how many x labels fit; the §12.2 reference range shows 7. */
function xLabelCount(plotWidth: number): number {
  if (plotWidth < 320) return 3
  if (plotWidth < 440) return 4
  if (plotWidth < 600) return 5
  return 7
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export interface TrendChartProps {
  /** the sliced series to plot — use `getSeriesSlice`, do not re-derive it. */
  points: SeriesPoint[]
  yDomain: YDomain
  xDomain: XDomain
  /** the period-adjusted metric name, e.g. `1y views`. */
  metricLabel: string
  format: MetricFormat
  period: Period
  /** the publication domain, rendered as the plot watermark (§6.3). */
  watermark: string
  /** true when the selected metric has no value — plots the zero state (§14.3). */
  isEmpty?: boolean
  /** the tabpanel id the §6.2 tabs point at with `aria-controls`. */
  id: string
  /** the fixture's "today", so date labels are deterministic. */
  now?: string | Date
  className?: string
}

export function TrendChart({
  points,
  yDomain,
  xDomain,
  metricLabel,
  format,
  period,
  watermark,
  isEmpty = false,
  id,
  now,
  className,
}: TrendChartProps) {
  const styles = useStyles()
  const plotRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(FALLBACK_WIDTH)
  const [hover, setHover] = useState<{ x: number; point: SeriesPoint } | null>(null)

  useLayoutEffect(() => {
    const node = plotRef.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width
      if (measured && measured > 0) setWidth(measured)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const geometry = useMemo(() => {
    const plotLeft = PLOT_INSET.left
    const plotRight = Math.max(plotLeft + 1, width - PLOT_INSET.right)
    const plotTop = PLOT_INSET.top
    const plotBottom = CHART_HEIGHT - PLOT_INSET.bottom
    const plotWidth = plotRight - plotLeft
    const plotHeight = plotBottom - plotTop

    const startMs = xDomain.start.getTime()
    const endMs = xDomain.end.getTime()
    const spanMs = Math.max(1, endMs - startMs)
    const ySpan = Math.max(Number.EPSILON, yDomain.max - yDomain.min)

    const xOf = (ms: number) =>
      plotLeft + Math.min(1, Math.max(0, (ms - startMs) / spanMs)) * plotWidth
    const yOf = (value: number) =>
      plotBottom -
      Math.min(1, Math.max(0, (value - yDomain.min) / ySpan)) * plotHeight

    // the step path: horizontal run, then a riser, repeated — never a diagonal.
    let line = ''
    let area = ''
    if (points.length > 0) {
      const firstX = round(xOf(new Date(points[0].date).getTime()))
      const commands = [`M ${firstX} ${round(yOf(points[0].value))}`]
      for (let i = 1; i < points.length; i += 1) {
        commands.push(`H ${round(xOf(new Date(points[i].date).getTime()))}`)
        commands.push(`V ${round(yOf(points[i].value))}`)
      }
      // carry the last value flat to the right edge, so a final riser that lands a
      // few days short of "now" still reads as reaching the plot's edge.
      commands.push(`H ${round(plotRight)}`)
      line = commands.join(' ')
      area = `${line} L ${round(plotRight)} ${round(plotBottom)} L ${firstX} ${round(
        plotBottom,
      )} Z`
    }

    const yTicks = integerTicks(yDomain.min, yDomain.max)

    const count = xLabelCount(plotWidth)
    const xLabels = Array.from({ length: count }, (_, index) => {
      const ms = startMs + (spanMs * index) / count
      return { ms, x: xOf(ms) }
    })
    const useYear = spanMs / DAY_MS > 400

    return {
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
      xOf,
      yOf,
      line,
      area,
      yTicks,
      xLabels,
      useYear,
      startMs,
      endMs,
    }
  }, [points, width, xDomain, yDomain])

  const description = describeSeries(points, metricLabel, period)

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (points.length === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const localX = Math.min(
      geometry.plotRight,
      Math.max(geometry.plotLeft, event.clientX - rect.left),
    )
    const ratio =
      (localX - geometry.plotLeft) / (geometry.plotRight - geometry.plotLeft)
    const ms = geometry.startMs + ratio * (geometry.endMs - geometry.startMs)

    // step interpolation means the value at x is the last point at or before x.
    let match = points[0]
    for (const point of points) {
      if (new Date(point.date).getTime() <= ms) match = point
      else break
    }
    setHover({ x: localX, point: match })
  }

  return (
    <div
      id={id}
      role="tabpanel"
      // §15 — the panel names the metric it is currently plotting.
      aria-label={`${metricLabel} trend`}
      tabIndex={0}
      className={mergeClasses(styles.panel, className)}
    >
      <div ref={plotRef} className={styles.plot}>
        <svg
          className={styles.svg}
          width={width}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          role="img"
          aria-label={description}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
        >
          {/* very light horizontal gridlines spanning the plot width */}
          {geometry.yTicks.map((tick) => (
            <g key={`grid-${tick}`}>
              <line
                className={styles.gridline}
                x1={geometry.plotLeft}
                x2={geometry.plotRight}
                y1={geometry.yOf(tick)}
                y2={geometry.yOf(tick)}
                strokeWidth={HAIRLINE_STROKE_WIDTH}
              />
              {/* labels only — no tick marks */}
              <text
                className={styles.axisLabel}
                x={geometry.plotLeft - 10}
                y={geometry.yOf(tick)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatMetricValue(tick, format)}
              </text>
            </g>
          ))}

          {/* a faint vertical rule marks the plot's left edge */}
          <line
            className={styles.rule}
            x1={geometry.plotLeft}
            x2={geometry.plotLeft}
            y1={geometry.plotTop}
            y2={geometry.plotBottom}
            strokeWidth={HAIRLINE_STROKE_WIDTH}
          />
          {/* the plot floor the x labels sit below */}
          <line
            className={styles.rule}
            x1={geometry.plotLeft}
            x2={geometry.plotRight}
            y1={geometry.plotBottom}
            y2={geometry.plotBottom}
            strokeWidth={HAIRLINE_STROKE_WIDTH}
          />

          {/* re-keyed on the plotted metric + period so the re-plot fades in */}
          <g key={`${metricLabel}|${period}`} className={styles.series}>
            <path className={styles.area} d={geometry.area} />
            <path
              className={styles.line}
              d={geometry.line}
              strokeWidth={SERIES_STROKE_WIDTH}
            />
          </g>

          {geometry.xLabels.map(({ ms, x }, index) => (
            <text
              key={ms}
              className={styles.axisLabel}
              x={x}
              y={geometry.plotBottom + 18}
              textAnchor={index === 0 ? 'start' : 'middle'}
            >
              {(geometry.useYear ? monthYear : monthDay).format(new Date(ms))}
            </text>
          ))}

          {/* §14.5 — hover crosshair. No dots at rest; this marker is hover state. */}
          {hover ? (
            <g>
              <line
                className={styles.crosshair}
                x1={hover.x}
                x2={hover.x}
                y1={geometry.plotTop}
                y2={geometry.plotBottom}
                strokeWidth={HAIRLINE_STROKE_WIDTH}
              />
              <circle
                className={styles.marker}
                cx={hover.x}
                cy={geometry.yOf(hover.point.value)}
                r={4}
                strokeWidth={SERIES_STROKE_WIDTH}
              />
            </g>
          ) : null}
        </svg>

        {hover ? (
          <div
            aria-hidden
            className={styles.tooltip}
            // kept clear of the card's clipping edges
            style={{
              left: Math.min(Math.max(hover.x, 60), Math.max(60, width - 60)),
              top: PLOT_INSET.top,
            }}
          >
            <Caption1 block className={styles.tooltipDate}>
              {formatDate(hover.point.date, now)}
            </Caption1>
            <Caption1 block className={styles.tooltipValue}>
              {formatMetricValue(hover.point.value, format)}
            </Caption1>
          </div>
        ) : null}

        {isEmpty ? (
          <Caption1
            block
            className={styles.emptyState}
            style={{ top: (geometry.plotTop + geometry.plotBottom) / 2 }}
          >
            No data for this period
          </Caption1>
        ) : null}

        <div
          aria-hidden
          className={styles.watermark}
          style={{
            insetInlineEnd: PLOT_INSET.right + 8,
            insetBlockEnd: PLOT_INSET.bottom + 8,
          }}
        >
          <BookmarkRegular />
          <Caption1>{watermark.toUpperCase()}</Caption1>
        </div>
      </div>

      {/* §15 — the trend without vision: the plotted points as a real table. */}
      <table className={styles.visuallyHidden}>
        <caption>{description}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{metricLabel}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <th scope="row">{formatDate(point.date, now)}</th>
              <td>{formatMetricValue(point.value, format)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
