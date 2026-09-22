"use client"

import * as React from "react"
import { Bookmark } from "lucide-react"

import {
  formatAxisDate,
  formatMetricValue,
  formatPostDate,
} from "@/lib/publication/format"
import {
  axisDates,
  computeYScale,
  periodLabel,
  sliceSeries,
  valueAt,
} from "@/lib/publication/series"
import type { Metric, Period } from "@/lib/publication/types"

/**
 * Step-area trend chart (spec §6.3), hand-rolled SVG — the repo ships no
 * charting library, and this is one monotonic series.
 *
 * The interpolation is deliberately `stepAfter`: the series is a cumulative
 * count, so a straight diagonal between two readings would assert subscriber
 * numbers that never existed. Flat runs, then vertical risers.
 */

/** Plot gutters in SVG px, taken from the spacing ramp: s6 / s2 / s2 / s4. */
const PAD = { left: 39, top: 16, right: 16, bottom: 25 }
/** Widest the axis gets; a narrow plot drops labels rather than overlap them. */
const MAX_X_LABELS = 7
const MIN_X_LABEL_SPACING = 95

export function TrendChart({
  metric,
  period,
  domain,
  id,
  labelledBy,
}: {
  metric: Metric
  period: Period
  domain: string
  id: string
  labelledBy: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  const [hover, setHover] = React.useState<{
    x: number
    date: Date
    value: number
  } | null>(null)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const sliced = React.useMemo(
    () => sliceSeries(metric.series, period),
    [metric.series, period]
  )
  const scale = React.useMemo(
    () => computeYScale(sliced.points.map((point) => point.value)),
    [sliced]
  )
  const plotWidth = Math.max(size.width - PAD.left - PAD.right, 0)
  const labelCount = Math.max(
    2,
    Math.min(MAX_X_LABELS, Math.floor(plotWidth / MIN_X_LABEL_SPACING))
  )
  const labelDates = React.useMemo(
    () => axisDates(sliced.start, sliced.end, labelCount),
    [sliced, labelCount]
  )

  const plotHeight = Math.max(size.height - PAD.top - PAD.bottom, 0)
  const floorY = PAD.top + plotHeight
  const spanMs = sliced.end.getTime() - sliced.start.getTime() || 1
  const spanValue = scale.max - scale.min || 1

  const toX = (date: Date) =>
    PAD.left + ((date.getTime() - sliced.start.getTime()) / spanMs) * plotWidth
  const toY = (value: number) =>
    PAD.top + (1 - (value - scale.min) / spanValue) * plotHeight

  const linePath = React.useMemo(() => {
    if (plotWidth === 0 || sliced.points.length === 0) return ""
    const [first, ...rest] = sliced.points
    let path = `M ${toX(first.date)} ${toY(first.value)}`
    for (const point of rest) {
      path += ` H ${toX(point.date)} V ${toY(point.value)}`
    }
    // Hold the final reading out to the right edge of the plot.
    return `${path} H ${PAD.left + plotWidth}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliced, scale, plotWidth, plotHeight])

  const areaPath = linePath
    ? `${linePath} V ${floorY} H ${PAD.left} Z`
    : ""

  const firstValue = sliced.points[0]?.value ?? 0
  const lastValue = sliced.points.at(-1)?.value ?? 0
  const direction =
    lastValue > firstValue
      ? "rising"
      : lastValue < firstValue
        ? "falling"
        : "flat"
  const summary = `${metric.label} over ${periodLabel(period).toLowerCase()}: ${direction}, from ${formatMetricValue(firstValue, metric.format)} on ${formatPostDate(sliced.start)} to ${formatMetricValue(lastValue, metric.format)} on ${formatPostDate(sliced.end)}.`

  function handlePointer(event: React.PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const offset = Math.min(
      Math.max(event.clientX - bounds.left, 0),
      bounds.width
    )
    const date = new Date(
      sliced.start.getTime() + (offset / (bounds.width || 1)) * spanMs
    )
    setHover({ x: PAD.left + offset, date, value: valueAt(sliced.points, date) })
  }

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-label={summary}
      tabIndex={0}
      className="relative outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div ref={containerRef} className="h-s13 w-full">
        {size.width > 0 && (
          <svg
            width={size.width}
            height={size.height}
            role="img"
            aria-hidden
            className="overflow-visible"
          >
            {/* Gridlines — lighter than the data line, no tick marks. */}
            {scale.ticks.map((tick) => (
              <line
                key={tick}
                x1={PAD.left}
                x2={PAD.left + plotWidth}
                y1={toY(tick)}
                y2={toY(tick)}
                className="stroke-border"
                strokeWidth={1}
              />
            ))}
            {scale.ticks.map((tick) => (
              <text
                key={`label-${tick}`}
                x={PAD.left - 8}
                y={toY(tick)}
                dominantBaseline="middle"
                textAnchor="end"
                className="fill-current text-xs text-muted-foreground"
              >
                {formatMetricValue(tick, metric.format)}
              </text>
            ))}

            {/* The plot's left edge and floor. */}
            <line
              x1={PAD.left}
              x2={PAD.left}
              y1={PAD.top}
              y2={floorY}
              className="stroke-border"
              strokeWidth={1}
            />
            <line
              x1={PAD.left}
              x2={PAD.left + plotWidth}
              y1={floorY}
              y2={floorY}
              className="stroke-border"
              strokeWidth={1}
            />

            <path d={areaPath} className="fill-accent-graphic/15" />
            <path
              d={linePath}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              className="stroke-accent-graphic"
            />

            {hover && (
              <g className="stroke-muted-foreground" strokeWidth={1}>
                <line
                  x1={hover.x}
                  x2={hover.x}
                  y1={PAD.top}
                  y2={floorY}
                  strokeDasharray="3 3"
                />
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotWidth}
                  y1={toY(hover.value)}
                  y2={toY(hover.value)}
                  strokeDasharray="3 3"
                />
              </g>
            )}

            {/* X axis — evenly spaced dates derived from the period window. */}
            {labelDates.map((date, index) => (
              <text
                key={date.toISOString()}
                x={toX(date)}
                y={size.height - 6}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === labelDates.length - 1
                      ? "end"
                      : "middle"
                }
                className="fill-current text-xs text-muted-foreground"
              >
                {formatAxisDate(date)}
              </text>
            ))}

            <rect
              x={PAD.left}
              y={PAD.top}
              width={plotWidth}
              height={plotHeight}
              fill="transparent"
              onPointerMove={handlePointer}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}
      </div>

      {/* Watermark — inside the plot, bottom right. */}
      <div className="pointer-events-none absolute right-s3 bottom-s5 hidden items-center gap-s4xs text-muted-foreground sm:flex">
        <Bookmark aria-hidden className="size-3" />
        <span className="text-xs tracking-widest uppercase">{domain}</span>
      </div>

      {hover && (
        <div
          className="pointer-events-none absolute top-s2 -translate-x-1/2 rounded-md border border-border bg-popover px-s2xs py-s4xs text-xs whitespace-nowrap text-popover-foreground shadow-md"
          style={{ left: hover.x }}
        >
          <span className="text-muted-foreground">
            {formatAxisDate(hover.date)}
          </span>{" "}
          <span className="font-semibold tabular-nums">
            {formatMetricValue(hover.value, metric.format)}
          </span>
        </div>
      )}

      {/* Text alternative: the summary, then the series itself. */}
      <div className="sr-only">
        <p>{summary}</p>
        <table>
          <caption>{metric.label} by date</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{metric.label}</th>
            </tr>
          </thead>
          <tbody>
            {sliced.points.map((point) => (
              <tr key={point.date.toISOString()}>
                <th scope="row">{formatPostDate(point.date)}</th>
                <td>{formatMetricValue(point.value, metric.format)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
