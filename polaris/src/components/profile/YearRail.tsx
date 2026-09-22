// Year rail (profile spec §7.3). A vertical list of years, newest first, that
// swaps the selected year's data in place rather than navigating to a new
// page (§13) — clicking one calls `onSelectYear` and lets the page swap the
// heatmap, header count, activity overview and timeline underneath it.
//
// The selected year is the one solid accent block on the page (see the token
// mapping table): a full-width `s-button variant="primary"`. Polaris centres
// a button's label and exposes no left-align override (`gaps.md`: "a button
// renders its slot as plain text," no layout props reach inside it), so the
// label sits centred rather than flush with the chip's own left edge as §7.3
// asks. Per this build's own guidance, the fallback is to keep the full-width
// primary button rather than inventing a replacement — see the report for
// this component.
//
// `s-button`/`s-link` carry no `aria-*` props in their typed surface (only
// `accessibilityLabel`), so the current-year marker lives on the wrapping
// `<li>` instead of the interactive element itself.

import type { ReactElement } from "react";

interface Props {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export function YearRail({ years, selectedYear, onSelectYear }: Props): ReactElement {
  return (
    <nav className="year-rail" aria-label="Contribution year">
      {/* `display: contents` keeps real list semantics (§14: "a list of
          links") without adding a second flex context on top of
          `.year-rail`'s own column layout. */}
      <ul style={{ display: "contents", listStyle: "none", margin: 0, padding: 0 }}>
        {years.map((year) => {
          const selected = year === selectedYear;

          return (
            <li key={year} aria-current={selected ? "page" : undefined} style={{ display: "contents" }}>
              {selected ? (
                <s-button type="button" variant="primary" inlineSize="fill">
                  {year}
                </s-button>
              ) : (
                // No fill, no border, `text/muted` — an `s-clickable` styled
                // with only Box props stays invisible at rest, and its
                // `paddingInlineStart` approximates the selected chip's own
                // internal inset (a shadow-DOM value this build can't read).
                <s-clickable
                  type="button"
                  onClick={() => onSelectYear(year)}
                  accessibilityLabel={`Show contributions from ${year}`}
                  paddingInlineStart="base"
                  paddingBlock="small-400"
                >
                  <s-text color="subdued">{year}</s-text>
                </s-clickable>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
