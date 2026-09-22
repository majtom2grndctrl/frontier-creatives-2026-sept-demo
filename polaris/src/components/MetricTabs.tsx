// The metric segment strip (spec §6.2). It is a selector, not three stat tiles:
// the selection drives the chart below it.
//
// Substitution, noted per spec §0.1: Polaris exposes no `tab`/`tablist` role —
// `s-box`'s accessibilityRole union has no such value and every host is
// `display: contents`, so an ARIA role written on one is not reliably exposed.
// This uses the substitute `gaps.md` sanctions for Tabs: a labelled region of
// real buttons whose selected state is spoken in each button's accessible name,
// with arrow-key movement between them and a chart region named after the
// current selection. The selection/plot relationship survives; the tablist
// pattern itself does not.

import { useRef, type KeyboardEvent } from "react";
import { DeltaPill } from "@/components/DeltaPill";
import type { Metric, Period } from "@/data/types";
import { formatMetricValue, resolveMetricLabel } from "@/lib/format";

interface Props {
  metrics: Metric[];
  period: Period;
  selectedId: string;
  onSelect: (id: string) => void;
}

function Segment({
  metric,
  period,
  selected,
  onSelect,
  register,
}: {
  metric: Metric;
  period: Period;
  selected: boolean;
  onSelect: () => void;
  register: (element: HTMLElement | null) => void;
}) {
  const label = resolveMetricLabel(metric.label, period);
  const tooltipId = `metric-info-${metric.id}`;
  const empty = metric.value === null;

  return (
    <s-clickable ref={register} onClick={onSelect} background={selected ? "base" : "transparent"}>
      {/* The indicator is a child rather than an overlay, so the container's
          radius and `overflow="hidden"` clip it at the outer corners. */}
      <s-stack gap="none">
        <div className="metric-segment__indicator" data-selected={selected} />
        <s-box padding="base">
          <s-stack gap="small-200">
            <s-grid gridTemplateColumns="minmax(0, 1fr) auto" gap="small-200" alignItems="center">
              <s-paragraph color="subdued" lineClamp={1}>
                {label}
              </s-paragraph>
              <s-icon type="info" size="small" color="subdued" interestFor={tooltipId} />
            </s-grid>

            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-heading accessibilityRole="presentation">
                {empty ? (
                  <>
                    <s-text accessibilityVisibility="hidden">—</s-text>
                    <s-text accessibilityVisibility="exclusive">No data</s-text>
                  </>
                ) : (
                  formatMetricValue(metric.value!, metric.format)
                )}
              </s-heading>
              {metric.deltaPct === null ? null : <DeltaPill deltaPct={metric.deltaPct} />}
            </s-stack>

            <s-paragraph color="subdued">
              From {formatMetricValue(metric.priorValue, metric.format)}
            </s-paragraph>

            {/* Spoken state, and the ⓘ definition for readers who cannot hover. */}
            <s-text accessibilityVisibility="exclusive">
              {`${metric.infoText} ${selected ? "Selected, plotted below." : "Not selected."}`}
            </s-text>
          </s-stack>
        </s-box>
      </s-stack>

      <s-tooltip id={tooltipId}>{metric.infoText}</s-tooltip>
    </s-clickable>
  );
}

export function MetricTabs({ metrics, period, selectedId, onSelect }: Props) {
  const segments = useRef<(HTMLElement | null)[]>([]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();
    const index = metrics.findIndex((metric) => metric.id === selectedId);
    const next = metrics[(index + step + metrics.length) % metrics.length];
    if (!next) return;

    onSelect(next.id);
    segments.current[metrics.indexOf(next)]?.focus();
  }

  return (
    <div onKeyDown={moveFocus}>
      <s-box background="subdued" accessibilityRole="region" accessibilityLabel="Overview metrics">
        {/* Segments stack rather than shrink once the strip narrows (spec §16). */}
        <s-query-container>
          <s-grid gridTemplateColumns="@container (inline-size > 620px) 1fr 1fr 1fr, 1fr">
            {metrics.map((metric, index) => (
              <Segment
                key={metric.id}
                metric={metric}
                period={period}
                selected={metric.id === selectedId}
                onSelect={() => onSelect(metric.id)}
                register={(element) => {
                  segments.current[index] = element;
                }}
              />
            ))}
          </s-grid>
        </s-query-container>
      </s-box>
    </div>
  );
}
