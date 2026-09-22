// Contributions header row (§7.1) and the contributions card (§7.2).
//
// The card is one `s-box` at `padding="none"` holding two regions that pad
// themselves, so the `s-divider` between them is full-bleed and touches both
// card edges. The §7.1 row sits above the card's top border, outside it.

import { Fragment, type ReactElement } from "react";
import type { ActivityOverview, ContributionYear } from "@/data/profile-types";
import { ActivityBreakdownChart } from "@/components/profile/ActivityBreakdownChart";
import { ContributionHeatmap } from "@/components/profile/ContributionHeatmap";
import { LEVELS } from "@/lib/contributions";
import { formatInteger } from "@/lib/format";

/** "Contribution settings" is out of scope (§0) — the affordance opens a stub. */
const SETTINGS_ID = "contribution-settings";

/** A repository link may not be broken across lines (§7.2b). */
const NO_BREAK = { whiteSpace: "nowrap" } as const;

interface Props {
  contributions: ContributionYear;
  activityOverview: ActivityOverview;
  selectedYear: number;
}

export function ContributionsCard({
  contributions,
  activityOverview,
  selectedYear,
}: Props): ReactElement {
  // Zero contributions in the selected year keeps the grid and the legend and
  // only restates the count (§13).
  const headline =
    contributions.total === 0
      ? `No contributions in ${selectedYear}`
      : `${formatInteger(contributions.total)} contributions in the last year`;

  const { named, otherCount } = activityOverview.contributedTo;
  const shown = named.slice(0, 3);
  const others = otherCount + Math.max(0, named.length - shown.length);

  return (
    <s-stack direction="block" gap="small">
      <s-stack direction="inline" gap="small" alignItems="center" justifyContent="space-between">
        <s-paragraph>{headline}</s-paragraph>
        <s-clickable commandFor={SETTINGS_ID} accessibilityLabel="Contribution settings">
          <s-stack direction="inline" gap="small-400" alignItems="center">
            <s-text color="subdued">Contribution settings</s-text>
            <s-icon type="chevron-down" color="subdued" size="small" />
          </s-stack>
        </s-clickable>
      </s-stack>
      <s-popover id={SETTINGS_ID}>
        <s-paragraph color="subdued">Contribution settings are out of scope in this demo.</s-paragraph>
      </s-popover>

      <s-box background="base" border="base" borderRadius="base" padding="none">
        <s-box padding="base">
          <s-stack direction="block" gap="small">
            <ContributionHeatmap contributions={contributions} />

            <s-stack
              direction="inline"
              gap="small"
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Quiet text, not an accent-coloured link (§16.22). */}
              <s-link href="#" tone="neutral">
                <s-text color="subdued">Learn how we count contributions</s-text>
              </s-link>
              <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-text color="subdued">Less</s-text>
                <s-stack direction="inline" gap="small-500" alignItems="center">
                  {LEVELS.map((level) => (
                    <span
                      key={level}
                      className="heatmap__legend-swatch"
                      data-level={level}
                      aria-hidden="true"
                    />
                  ))}
                </s-stack>
                <s-text color="subdued">More</s-text>
              </s-stack>
            </s-stack>
          </s-stack>
        </s-box>

        <s-divider />

        <s-box padding="base">
          {/* Three grid children: pane, rule, pane. The rule is inside the
              padded box, so the card's own padding insets it (§16.18). */}
          <div className="activity-split">
            <div>
              <s-stack direction="block" gap="small">
                <h3 className="plain-heading">
                  <s-paragraph>Activity overview</s-paragraph>
                </h3>
                {/*
                  Deliberately not an `s-paragraph`: Polaris styles links inside
                  prose as underlined body text, so an `s-link` in a paragraph
                  never renders accent. Outside prose it does. The sentence is a
                  plain block instead, which keeps the links accent-coloured
                  (§7.2b) — the body type is identical either way.
                */}
                {/* A year with nothing to report has no sentence to write. */}
                {shown.length === 0 && others === 0 ? (
                  <s-paragraph color="subdued">No repository activity this year.</s-paragraph>
                ) : (
                <div>
                  <span className="hanging-indent">
                    <s-icon type="git-repository" color="subdued" size="small" />{" "}
                    Contributed to{" "}
                    {shown.map((repo, index) => {
                      const last = index === shown.length - 1;
                      // No comma before "and", none after the last link.
                      const conjunction = others === 0 && index === shown.length - 2;
                      return (
                        <Fragment key={repo}>
                          <span style={NO_BREAK}>
                            {/*
                              No `s-text type="strong"` inside: `s-text` sets
                              its own colour and overrides the link's accent, so
                              accent and bold are mutually exclusive here. The
                              accent carries "this is a link", so it wins.
                            */}
                            <s-link href="#">{repo}</s-link>
                            {last || conjunction ? null : ","}
                          </span>
                          {last ? null : conjunction ? " and " : " "}
                        </Fragment>
                      );
                    })}
                    {others > 0
                      ? ` and ${formatInteger(others)} other ${others === 1 ? "repository" : "repositories"}`
                      : null}
                  </span>
                </div>
                )}
              </s-stack>
            </div>
            <div className="activity-split__rule" />
            <div>
              <ActivityBreakdownChart breakdown={activityOverview.breakdown} />
            </div>
          </div>
        </s-box>
      </s-box>
    </s-stack>
  );
}
