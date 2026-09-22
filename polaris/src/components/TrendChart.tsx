// Step-area trend chart (spec §6.3). Hand-drawn SVG rather than a chart library:
// the series is one cumulative run, so the path is a short `d` string, and
// Polaris ships no charts.
//
// Every stroke and fill is `currentColor` at an opacity, so the chart inherits
// the Polaris text color instead of introducing a palette of its own. Geometry
// numbers below are SVG user units inside a fixed viewBox, not CSS values.

import { useId, useState, type MouseEvent } from "react";
import type { MetricFormat, SeriesPoint } from "@/data/types";
import {
  axisDates,
  formatAxisDate,
  formatChartDate,
  formatMetricValue,
  parseDate,
  yTicks,
  type SeriesWindow,
} from "@/lib/format";
import { useMeasuredSize } from "@/lib/useMeasuredSize";

const FALLBACK_WIDTH = 720;
const VIEW_HEIGHT = 300;
const PAD_LEFT = 46;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PLOT_BOTTOM = 254;
const AXIS_LABEL_Y = 274;
const X_LABEL_COUNT = 7;
/** Rough advance width of the watermark's letter-spaced 9px caps. */
const WATERMARK_CHAR_WIDTH = 6.4;

interface Props {
  series: SeriesPoint[];
  window: SeriesWindow;
  format: MetricFormat;
  label: string;
  periodLabel: string;
  domain: string;
}

interface Plotted {
  x: number;
  y: number;
  point: SeriesPoint;
}

export function TrendChart({ series, window, format, label, periodLabel, domain }: Props) {
  const tableId = useId();
  // The viewBox tracks the rendered width, so the chart keeps a fixed height and
  // unscaled type instead of stretching with the column.
  const [containerRef, measured] = useMeasuredSize<HTMLDivElement>({ width: FALLBACK_WIDTH, height: 0 });
  const width = measured.width || FALLBACK_WIDTH;
  const [hover, setHover] = useState<Plotted | null>(null);

  const ticks = yTicks(series);
  const yMin = ticks[0]!;
  const yMax = ticks[ticks.length - 1]!;
  const plotWidth = width - PAD_LEFT - PAD_RIGHT;

  const startTime = window.start.getTime();
  const span = Math.max(1, window.end.getTime() - startTime);

  const toX = (date: string) => PAD_LEFT + ((parseDate(date).getTime() - startTime) / span) * plotWidth;
  const toY = (value: number) =>
    PLOT_BOTTOM - ((value - yMin) / Math.max(1, yMax - yMin)) * (PLOT_BOTTOM - PAD_TOP);

  const plotted: Plotted[] = series.map((point) => ({ x: toX(point.date), y: toY(point.value), point }));
  const first = plotted[0];
  const last = plotted[plotted.length - 1];

  // stepAfter: a flat run at each value, then a riser to the next. A cumulative
  // count never held the in-between values a diagonal would assert.
  const steps = plotted
    .map((node, index) => (index === 0 ? `M ${node.x} ${node.y}` : `L ${node.x} ${plotted[index - 1]!.y} L ${node.x} ${node.y}`))
    .join(" ");
  const linePath = last ? `${steps} L ${width - PAD_RIGHT} ${last.y}` : "";
  const areaPath =
    first && last
      ? `${linePath} L ${width - PAD_RIGHT} ${PLOT_BOTTOM} L ${first.x} ${PLOT_BOTTOM} Z`
      : "";

  const xLabels = axisDates(window, X_LABEL_COUNT);

  const startValue = series[0]?.value ?? 0;
  const endValue = series[series.length - 1]?.value ?? 0;
  const direction = endValue > startValue ? "rising" : endValue < startValue ? "falling" : "flat";
  const summary = `${label} over ${periodLabel}: ${direction} from ${formatMetricValue(startValue, format)} to ${formatMetricValue(endValue, format)}.`;

  function trackHover(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    // stepAfter means the value in force at x is the last point at or before it.
    const found = [...plotted].reverse().find((node) => node.x <= x) ?? plotted[0] ?? null;
    setHover(found);
  }

  // Keep the tooltip's 116-unit box inside the plot at either edge.
  const tooltipMin = PAD_LEFT + 60;
  const tooltipMax = Math.max(tooltipMin, width - PAD_RIGHT - 60);
  const tooltipAnchor = hover ? Math.min(Math.max(hover.x, tooltipMin), tooltipMax) : 0;

  return (
    <div ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${VIEW_HEIGHT}`}
        width={width}
        height={VIEW_HEIGHT}
        role="img"
        aria-label={summary}
        aria-describedby={tableId}
        style={{ display: "block", overflow: "visible" }}
        onMouseMove={trackHover}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={width - PAD_RIGHT}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <text
              x={PAD_LEFT - 10}
              y={toY(tick) + 4}
              textAnchor="end"
              fontSize="11"
              fill="currentColor"
              fillOpacity="0.55"
            >
              {formatMetricValue(tick, format)}
            </text>
          </g>
        ))}

        <line x1={PAD_LEFT} x2={PAD_LEFT} y1={PAD_TOP} y2={PLOT_BOTTOM} stroke="currentColor" strokeOpacity="0.12" />
        <line
          x1={PAD_LEFT}
          x2={width - PAD_RIGHT}
          y1={PLOT_BOTTOM}
          y2={PLOT_BOTTOM}
          stroke="currentColor"
          strokeOpacity="0.16"
        />

        {areaPath ? <path d={areaPath} fill="currentColor" fillOpacity="0.07" /> : null}
        {linePath ? (
          <path d={linePath} fill="none" stroke="currentColor" strokeOpacity="0.85" strokeWidth="2" strokeLinejoin="round" />
        ) : null}

        {xLabels.map((date) => (
          <text
            key={date.toISOString()}
            x={PAD_LEFT + ((date.getTime() - startTime) / span) * plotWidth}
            y={AXIS_LABEL_Y}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            fillOpacity="0.55"
          >
            {formatAxisDate(date)}
          </text>
        ))}

        {/* Watermark: bookmark glyph plus the publication domain, bottom-right inside the plot. */}
        <g opacity="0.32" transform={`translate(${width - PAD_RIGHT - 26 - domain.length * WATERMARK_CHAR_WIDTH}, ${PLOT_BOTTOM - 19})`}>
          <path d="M0 0 L0 11 L4 8 L8 11 L8 0 Z" fill="currentColor" />
        </g>
        <text
          x={width - PAD_RIGHT - 12}
          y={PLOT_BOTTOM - 10}
          textAnchor="end"
          fontSize="9"
          letterSpacing="1.2"
          fill="currentColor"
          fillOpacity="0.32"
        >
          {domain.toUpperCase()}
        </text>

        {hover ? (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD_TOP}
              y2={PLOT_BOTTOM}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeDasharray="3 3"
            />
            <circle cx={hover.x} cy={hover.y} r="3.5" fill="currentColor" />
            <g transform={`translate(${tooltipAnchor}, ${PAD_TOP + 4})`}>
              <rect
                x="-58"
                y="0"
                width="116"
                height="40"
                rx="8"
                fill="currentColor"
                fillOpacity="0.06"
                stroke="currentColor"
                strokeOpacity="0.18"
              />
              <text x="0" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.6">
                {formatChartDate(hover.point.date)}
              </text>
              <text x="0" y="31" textAnchor="middle" fontSize="13" fill="currentColor">
                {formatMetricValue(hover.point.value, format)}
              </text>
            </g>
          </g>
        ) : null}
      </svg>

      {/*
        The same series as a table, for readers who cannot use the plot. This is
        a native table rather than `s-table`: in its stacked list layout every
        row emits a heading, which would put five phantom entries in the
        document outline for a table nobody sees.
      */}
      <s-box accessibilityVisibility="exclusive" id={tableId}>
        <table>
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{label}</th>
            </tr>
          </thead>
          <tbody>
            {series.map((point) => (
              <tr key={point.date}>
                <th scope="row">{formatChartDate(point.date)}</th>
                <td>{formatMetricValue(point.value, format)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </s-box>
    </div>
  );
}
