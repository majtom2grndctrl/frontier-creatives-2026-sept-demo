"use client"

/**
 * Trend chart — spec §6.3.
 *
 * A hand-rolled SVG step-area chart (`stepAfter` interpolation). The series is a cumulative
 * count, so the path only ever emits horizontal runs and vertical risers — never a diagonal
 * or a curve, which would assert values that never existed (§6.3, §17).
 *
 * Renders only the chart region and its own padding; the bordered container and the hairline
 * divider above it belong to the Overview section (§6.3 "occupies the lower portion of the
 * same bordered container"). `role="tabpanel"` and its `aria-label` are supplied by the caller
 * (§15), so the decorative <svg> here is `aria-hidden` and the meaning is carried by the
 * sr-only summary + data table below it.
 */

import * as React from "react"

import { publication } from "@/data/dashboard"
import {
  PERIOD_OPTIONS,
  formatAxisDate,
  formatMetricValue,
  formatTooltipDate,
  metricLabel,
  sliceSeries,
} from "@/lib/dashboard/format"
import type { Metric, Period, SeriesPoint } from "@/lib/dashboard/types"

// viewBox units. The chart scales with its container via `w-full h-auto`; strokes are pinned
// to device pixels with vector-effect so they never fatten as the box grows.
const VIEW_W = 720
const VIEW_H = 260
const PLOT_LEFT = 48
const PLOT_RIGHT = 706
const PLOT_TOP = 16
const PLOT_BOTTOM = 214
const PLOT_W = PLOT_RIGHT - PLOT_LEFT
const PLOT_H = PLOT_BOTTOM - PLOT_TOP
const X_LABEL_Y = 236
const X_TICK_COUNT = 7
const MAX_Y_INTERVALS = 5 // → 4–6 tick labels
const DAY_MS = 24 * 60 * 60 * 1000

/** 2dp is plenty at this scale, and keeps the `d` string short and readable. */
function r(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Integer tick values inside [min, max]. Steps come from the 1/2/5 × 10ⁿ ladder so the labels
 * are always whole numbers — a 33→38 domain lands on 33,34,35,36,37,38, not fractions.
 */
function integerTicks(min: number, max: number): number[] {
  const span = max - min
  if (span <= 0) return [min]
  let step = 1
  const ladder = [1, 2, 5]
  for (let power = 0; power < 12; power += 1) {
    let found = false
    for (const base of ladder) {
      const candidate = base * 10 ** power
      if (span / candidate <= MAX_Y_INTERVALS) {
        step = candidate
        found = true
        break
      }
    }
    if (found) break
  }
  const ticks: number[] = []
  const first = Math.ceil(min / step) * step
  for (let value = first; value <= max + step / 1000; value += step) {
    ticks.push(Math.round(value))
  }
  if (ticks.length === 0) ticks.push(min)
  return ticks
}

type PlotPoint = SeriesPoint & { t: number; x: number; y: number }

interface Geometry {
  points: PlotPoint[]
  lineD: string
  areaD: string
  yTicks: { value: number; y: number }[]
  xTicks: { label: string; x: number; anchor: "start" | "middle" | "end" }[]
  yMin: number
  yMax: number
}

function buildGeometry(series: SeriesPoint[]): Geometry | null {
  if (series.length === 0) return null

  // A single plotted point still has to draw: hold its value across a one-day domain so the
  // step path has somewhere to run and no span divides by zero.
  const source =
    series.length === 1
      ? [series[0], { date: series[0].date, value: series[0].value }]
      : series

  const times = source.map((point) => new Date(point.date).getTime())
  const t0 = times[0]
  const t1 = series.length === 1 ? t0 + DAY_MS : times[times.length - 1]
  const tSpan = t1 - t0 > 0 ? t1 - t0 : DAY_MS

  const values = source.map((point) => point.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  // §6.3: the domain starts at the series MINIMUM, not at zero. The empty metric is a flat run
  // of zeros, so min === max — pad by one unit rather than dividing by a zero span (§14.3).
  const yMin = rawMin
  const yMax = rawMax > rawMin ? rawMax : rawMin + 1

  const scaleX = (t: number) => PLOT_LEFT + ((t - t0) / tSpan) * PLOT_W
  const scaleY = (value: number) => PLOT_BOTTOM - ((value - yMin) / (yMax - yMin)) * PLOT_H

  const points: PlotPoint[] = source.map((point, index) => {
    const t = series.length === 1 && index === 1 ? t1 : times[index]
    return { ...point, t, x: r(scaleX(t)), y: r(scaleY(point.value)) }
  })

  // stepAfter: hold the previous value across to the new x (H), then rise (V). No command in
  // this string moves in x and y at once.
  let lineD = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i += 1) {
    lineD += ` H ${points[i].x}`
    if (points[i].y !== points[i - 1].y) lineD += ` V ${points[i].y}`
  }
  const areaD = `${lineD} V ${PLOT_BOTTOM} H ${points[0].x} Z`

  const yTicks = integerTicks(yMin, yMax)
    .filter((value) => value >= yMin && value <= yMax)
    .map((value) => ({ value, y: r(scaleY(value)) }))

  const xTicks = Array.from({ length: X_TICK_COUNT }, (_, i) => {
    const fraction = i / (X_TICK_COUNT - 1)
    const date = new Date(t0 + fraction * tSpan)
    const anchor = i === 0 ? "start" : i === X_TICK_COUNT - 1 ? "end" : "middle"
    return { label: formatAxisDate(date), x: r(PLOT_LEFT + fraction * PLOT_W), anchor } as const
  })

  return { points, lineD, areaD, yTicks, xTicks, yMin, yMax }
}

export function TrendChart({
  metric,
  period,
}: {
  metric: Metric
  period: Period
}): React.JSX.Element {
  const [hoverX, setHoverX] = React.useState<number | null>(null)
  const svgRef = React.useRef<SVGSVGElement | null>(null)

  const series = React.useMemo(
    () => sliceSeries(metric.series, period),
    [metric.series, period]
  )
  const geometry = React.useMemo(
    () => buildGeometry(series),
    [series]
  )

  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? period
  // §6.2: the third metric's label embeds the period, so the alt text must too.
  const label = metricLabel(metric, period)

  const handlePointerMove = React.useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return
    const viewX = ((event.clientX - rect.left) / rect.width) * VIEW_W
    setHoverX(Math.min(PLOT_RIGHT, Math.max(PLOT_LEFT, viewX)))
  }, [])

  const handlePointerLeave = React.useCallback(() => setHoverX(null), [])

  // The step in force at the hovered x: the last point at or before it. On a step chart the
  // value holds from its own riser until the next one.
  const hovered = React.useMemo(() => {
    if (geometry === null || hoverX === null) return null
    let current = geometry.points[0]
    for (const point of geometry.points) {
      if (point.x <= hoverX) current = point
      else break
    }
    return current
  }, [geometry, hoverX])

  if (geometry === null) {
    return (
      <div className="px-4 py-10 text-center text-xs text-muted-foreground">
        No data for this period.
      </div>
    )
  }

  const first = geometry.points[0]
  const last = geometry.points[geometry.points.length - 1]
  const direction =
    last.value > first.value ? "rising" : last.value < first.value ? "falling" : "flat"
  const summary = `${label} over ${periodLabel}: ${
    formatMetricValue(first.value, metric.format) ?? ""
  } on ${formatTooltipDate(new Date(first.date))}, ${direction} to ${
    formatMetricValue(last.value, metric.format) ?? ""
  } on ${formatTooltipDate(new Date(last.date))}.`

  // Watermark: the domain is right-aligned inside the plot with the bookmark glyph ahead of it.
  // Text width is estimated from the character count — it only positions a decorative glyph.
  const watermark = publication.domain.toUpperCase()
  const watermarkWidth = watermark.length * 6
  const watermarkX = PLOT_RIGHT - 6
  const watermarkY = PLOT_BOTTOM - 10

  const hoverLeftPct = hoverX === null ? 0 : (hoverX / VIEW_W) * 100
  const hoverTopPct = hovered === null ? 0 : (hovered.y / VIEW_H) * 100
  const tooltipBelow = hoverTopPct < 40

  return (
    <div className="px-4 pt-4 pb-2">
      {/* The relative box wraps the <svg> alone, so the tooltip's percentage offsets resolve
          against the viewBox and not against this component's padding. */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto touch-none"
          aria-hidden="true"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {/* Very light horizontal gridlines, labels only — no tick marks (§6.3). */}
          {geometry.yTicks.map((tick) => (
            <g key={`y-${tick.value}`}>
              <line
                x1={PLOT_LEFT}
                y1={tick.y}
                x2={PLOT_RIGHT}
                y2={tick.y}
                className="stroke-border"
                strokeWidth={1}
                strokeOpacity={0.6}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PLOT_LEFT - 10}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                className="fill-muted-foreground"
              >
                {formatMetricValue(tick.value, metric.format)}
              </text>
            </g>
          ))}

          {/* Faint vertical rule at the plot's left edge, and the plot-floor rule. */}
          <line
            x1={PLOT_LEFT}
            y1={PLOT_TOP}
            x2={PLOT_LEFT}
            y2={PLOT_BOTTOM}
            className="stroke-border"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={PLOT_LEFT}
            y1={PLOT_BOTTOM}
            x2={PLOT_RIGHT}
            y2={PLOT_BOTTOM}
            className="stroke-border"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {/* Tonal accent area, then the solid accent step line. No dots, no legend (§6.3). */}
          <path d={geometry.areaD} className="fill-primary" fillOpacity={0.1} stroke="none" />
          <path
            d={geometry.lineD}
            className="stroke-primary"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Crosshair (§14.5). No transition — instant by construction, so §15's reduced-motion
              requirement needs no override. */}
          {hoverX !== null ? (
            <line
              x1={hoverX}
              y1={PLOT_TOP}
              x2={hoverX}
              y2={PLOT_BOTTOM}
              className="stroke-muted-foreground"
              strokeWidth={1}
              strokeOpacity={0.7}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {/* X axis: evenly spaced date labels below the floor rule, no tick marks. */}
          {geometry.xTicks.map((tick, index) => (
            <text
              key={`x-${index}-${tick.label}`}
              x={tick.x}
              y={X_LABEL_Y}
              textAnchor={tick.anchor}
              fontSize={10}
              className="fill-muted-foreground"
            >
              {tick.label}
            </text>
          ))}

          {/* Watermark (§6.3): bookmark glyph + domain, bottom-right inside the plot. */}
          <g className="fill-muted-foreground" opacity={0.55}>
            <path
              d="M0 0 h7 v10 l-3.5 -2.6 L0 10 Z"
              transform={`translate(${watermarkX - watermarkWidth - 12} ${watermarkY - 8})`}
            />
            <text
              x={watermarkX}
              y={watermarkY}
              textAnchor="end"
              fontSize={8}
              letterSpacing={0.8}
            >
              {watermark}
            </text>
          </g>
        </svg>

        {/* Follow-the-cursor readout — deliberately not a Radix Tooltip (§14.5). */}
        {hovered !== null && hoverX !== null ? (
          <div
            className="pointer-events-none absolute rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm"
            style={{
              left: `${Math.min(92, Math.max(8, hoverLeftPct))}%`,
              top: `${hoverTopPct}%`,
              transform: tooltipBelow
                ? "translate(-50%, 12px)"
                : "translate(-50%, calc(-100% - 12px))",
            }}
          >
            <div className="text-muted-foreground">
              {formatTooltipDate(new Date(hovered.date))}
            </div>
            <div className="font-medium tabular-nums">
              {formatMetricValue(hovered.value, metric.format)}
            </div>
          </div>
        ) : null}
      </div>

      {/* §15 text alternative: a prose summary plus the plotted points as a real table. */}
      <p className="sr-only">{summary}</p>
      <table className="sr-only">
        <caption>{`${label} — plotted points over ${periodLabel}`}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.date}>
              <td>{formatTooltipDate(new Date(point.date))}</td>
              <td>{formatMetricValue(point.value, metric.format)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
