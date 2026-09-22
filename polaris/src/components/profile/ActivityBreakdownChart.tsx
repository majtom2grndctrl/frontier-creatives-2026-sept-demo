// Activity breakdown chart (profile spec §7.2b). A four-axis kite plot, hand
// drawn as inline SVG: four `line`s for the frame, one `polygon` for the
// series, a `circle` on each non-zero vertex. Polaris ships no charts and the
// plot has no rings, ticks or scales worth configuring.
//
// Every stroke and fill is `currentColor` at an opacity, so the chart inherits
// the Polaris text colour instead of introducing a palette — the same contract
// `TrendChart` works under. The spec draws the axes, the fill and the markers
// from the dark end of the contribution ramp; with no data-visualisation
// palette to draw from, the ramp is monochrome ink, so "the darkest step" is a
// high opacity and the translucent fill a low one.
//
// Geometry numbers below are SVG user units inside a fixed viewBox, not CSS
// values. `.radar` sizes the element and `preserveAspectRatio` stays at its
// default, so the plot scales with its container without distorting.

import { useId, type ReactElement } from "react";
import type { ActivityOverview } from "@/data/profile-types";

const VIEW_WIDTH = 240;
const VIEW_HEIGHT = 180;
const CX = 120;
const CY = 90;
/** Arm length. Always drawn in full — the arms are the frame, not the series. */
const ARM = 52;
const MARKER_RADIUS = 3.6;
/** Distance from an arm's end to the near edge of its label block. */
const LABEL_GAP = 8;
const LABEL_SIZE = 11;
const LABEL_LINE = 12;
/** Baseline offset that centres one line of `LABEL_SIZE` caps on the axis. */
const CAP_CENTRE = 4;

type BreakdownKey = keyof ActivityOverview["breakdown"];

interface Axis {
  key: BreakdownKey;
  name: string;
  /** Unit vector: 12 / 3 / 6 / 9 o'clock, y growing downward. */
  ux: number;
  uy: number;
}

/** Clockwise from the top, per the spec's axis order. */
const AXES: readonly Axis[] = [
  { key: "codeReview", name: "Code review", ux: 0, uy: -1 },
  { key: "issues", name: "Issues", ux: 1, uy: 0 },
  { key: "pullRequests", name: "Pull requests", ux: 0, uy: 1 },
  { key: "commits", name: "Commits", ux: -1, uy: 0 },
];

/** A circle written as a path subpath, so markers can be punched out of the fill. */
function holeSubpath(x: number, y: number, r: number): string {
  return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
}

export function ActivityBreakdownChart({
  breakdown,
}: {
  breakdown: ActivityOverview["breakdown"];
}): ReactElement {
  const clipId = useId();
  const descriptionId = useId();

  // The radial domain is `0 … max(series)`, not `0 … 100`: the largest category
  // lands exactly at its arm's end and every other is that same fraction of an
  // arm. Scaling to 100 would collapse an 85 / 15 split into an invisible
  // sliver. `max === 0` is the degenerate case — no polygon, no markers.
  const max = Math.max(...AXES.map((axis) => breakdown[axis.key]));

  const plotted = AXES.map((axis) => {
    const value = breakdown[axis.key];
    const radius = max > 0 ? (value / max) * ARM : 0;
    return {
      ...axis,
      value,
      x: CX + axis.ux * radius,
      y: CY + axis.uy * radius,
      armX: CX + axis.ux * ARM,
      armY: CY + axis.uy * ARM,
    };
  });

  const polygonPoints = plotted
    .map((node) => `${node.x.toFixed(2)},${node.y.toFixed(2)}`)
    .join(" ");
  const markers = plotted.filter((node) => node.value > 0);

  // A marker's centre has to read as the card's surface so its ring stays
  // legible against the fill. No Polaris surface token is reachable from SVG,
  // so rather than paint a backing the fill is clipped: an outer rect plus one
  // circular subpath per marker, wound `evenodd`, punches a real hole through
  // to the card beneath. Geometry only — no colour named.
  const clipPath =
    `M 0 0 H ${VIEW_WIDTH} V ${VIEW_HEIGHT} H 0 Z ` +
    markers.map((node) => holeSubpath(node.x, node.y, MARKER_RADIUS)).join(" ");

  const summary = `Activity breakdown: ${plotted
    .map((node) => `${node.name.toLowerCase()} ${node.value}%`)
    .join(", ")}.`;

  return (
    <svg
      className="radar"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={summary}
      aria-describedby={descriptionId}
    >
      {/*
        A sighted reader can see the two unlabelled axes, so the zeros are
        named outright rather than left to inference (spec §14). `desc` keeps
        the text alternative inside the graphic, where it costs no layout.
      */}
      <desc id={descriptionId}>{summary}</desc>

      {markers.length > 0 ? (
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={clipPath} clipRule="evenodd" />
          </clipPath>
        </defs>
      ) : null}

      {/* The frame: four arms at 12 / 3 / 6 / 9 o'clock, always at full length. */}
      {plotted.map((node) => (
        <line
          key={`arm-${node.key}`}
          x1={CX}
          y1={CY}
          x2={node.armX}
          y2={node.armY}
          stroke="currentColor"
          strokeOpacity="0.88"
        />
      ))}

      {max > 0 ? (
        <polygon
          points={polygonPoints}
          fill="currentColor"
          fillOpacity="0.18"
          clipPath={markers.length > 0 ? `url(#${clipId})` : undefined}
        />
      ) : null}

      {/* One marker per non-zero vertex. A zero vertex sits at the origin and
          gets none. */}
      {markers.map((node) => (
        <circle
          key={`marker-${node.key}`}
          cx={node.x}
          cy={node.y}
          r={MARKER_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.88"
          strokeWidth="1.6"
        />
      ))}

      {plotted.map((node) => (
        <AxisLabel
          key={`label-${node.key}`}
          name={node.name}
          value={node.value}
          ux={node.ux}
          uy={node.uy}
        />
      ))}
    </svg>
  );
}

/**
 * A label sits just beyond its arm's end, aligned away from the centre: the
 * left one right-aligned toward its arm, the right one left-aligned, the top
 * and bottom centred on the arm's axis. A non-zero category stacks its
 * percentage above its name; a category at zero shows only the name — no "0%".
 */
function AxisLabel({
  name,
  value,
  ux,
  uy,
}: {
  name: string;
  value: number;
  ux: number;
  uy: number;
}): ReactElement {
  const stacked = value > 0;

  let x = CX;
  let anchor: "start" | "middle" | "end" = "middle";
  let firstBaseline: number;

  if (uy === -1) {
    // Top: the block grows upward, so the name sits nearest the arm's end and
    // the percentage rides a line above it.
    firstBaseline = CY - ARM - LABEL_GAP - (stacked ? LABEL_LINE : 0);
  } else if (uy === 1) {
    firstBaseline = CY + ARM + LABEL_GAP + CAP_CENTRE + LABEL_SIZE / 2;
  } else {
    x = CX + ux * (ARM + LABEL_GAP + 2);
    anchor = ux === 1 ? "start" : "end";
    // Centre the block on the arm's axis.
    firstBaseline = stacked ? CY - LABEL_LINE / 2 + CAP_CENTRE : CY + CAP_CENTRE;
  }

  return (
    <>
      {stacked ? (
        <text
          x={x}
          y={firstBaseline}
          textAnchor={anchor}
          fontSize={LABEL_SIZE}
          fill="currentColor"
          fillOpacity="0.55"
        >
          {`${value}%`}
        </text>
      ) : null}
      <text
        x={x}
        y={stacked ? firstBaseline + LABEL_LINE : firstBaseline}
        textAnchor={anchor}
        fontSize={LABEL_SIZE}
        fill="currentColor"
        fillOpacity="0.55"
      >
        {name}
      </text>
    </>
  );
}
