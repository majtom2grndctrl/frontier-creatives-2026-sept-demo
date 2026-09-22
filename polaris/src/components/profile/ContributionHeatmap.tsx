// Contribution heatmap (profile spec §7.2a). A real `<table>` — weeks as
// columns, days as rows — so a screen reader can traverse it and every cell is
// a tab stop (§14). The maths lives in `lib/contributions`; this file is layout,
// labels and accessible names.
//
// Per-cell tooltips are a native `title` plus a matching `aria-label`. An
// `s-tooltip` wired by `interestFor` would mean one overlay element per day —
// 366 of them — for text the cell's accessible name already carries.

import type { ReactElement } from "react";
import type { ContributionYear } from "@/data/profile-types";
import { DAY_ROWS, dayAccessibleName, monthLabels, toWeeks } from "@/lib/contributions";

/**
 * Pins a day label to the height of a grid cell (`.heatmap__cell`, 11px) and
 * centres the larger body-size text on it, so Mon/Wed/Fri do not stretch their
 * rows out of the grid's rhythm. Geometry the stylesheet does not cover.
 */
const DAY_LABEL_BOX = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  blockSize: "11px",
} as const;

export function ContributionHeatmap({
  contributions,
}: {
  contributions: ContributionYear;
}): ReactElement {
  const weeks = toWeeks(contributions.days);
  const months = new Map(monthLabels(weeks).map((month) => [month.column, month.label]));

  return (
    <div className="heatmap-scroll">
      <table className="heatmap" aria-label="Contributions by day">
        <thead>
          <tr>
            {/* Corner: sits above the day-label column. */}
            <th className="heatmap__corner" />
            {weeks.map((_week, column) => (
              <th key={column} scope="col" className="heatmap__month">
                {/* Taken out of flow so the label's text width cannot inflate
                    its 10px column; it overflows to the right, across the run
                    of columns its month actually covers. */}
                {months.has(column) ? (
                  <span className="heatmap__month-label">
                    <s-text color="subdued">{months.get(column)}</s-text>
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_ROWS.map((row) => (
            <tr key={row.index}>
              <th scope="row" className="heatmap__day-label" style={{ paddingBlock: 0 }}>
                {row.label ? (
                  <span style={DAY_LABEL_BOX}>
                    <s-text color="subdued">{row.label}</s-text>
                  </span>
                ) : null}
              </th>
              {weeks.map((week, column) => {
                // The trailing week ends after the last day that has occurred:
                // the row simply has no cell there, not a placeholder (§16.12).
                if (row.index >= week.length) return null;

                const day = week[row.index];
                if (!day) return <td key={column} className="heatmap__cell" />;

                const name = dayAccessibleName(day);
                return (
                  <td
                    key={column}
                    className="heatmap__cell"
                    tabIndex={0}
                    title={name}
                    aria-label={name}
                  >
                    <span className="heatmap__swatch" data-level={day.level} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
