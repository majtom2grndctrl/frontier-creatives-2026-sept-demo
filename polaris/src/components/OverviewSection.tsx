// Section 1 — Overview (spec §6). Its heading sits *outside* the bordered panel,
// on the pane surface; the three cards below use the attached-heading pattern.

import { MetricTabs } from "@/components/MetricTabs";
import { TrendChart } from "@/components/TrendChart";
import { publication } from "@/data/fixtures";
import type { Metric, Period } from "@/data/types";
import { PERIODS, periodOption, periodWindow, resolveMetricLabel, sliceSeries } from "@/lib/format";

interface Props {
  metrics: Metric[];
  period: Period;
  selectedId: string;
  onSelect: (id: string) => void;
  onPeriodChange: (period: Period) => void;
}

export function OverviewSection({ metrics, period, selectedId, onSelect, onPeriodChange }: Props) {
  const selected = metrics.find((metric) => metric.id === selectedId) ?? metrics[0]!;
  const window = periodWindow(period, selected.series);
  const series = sliceSeries(selected.series, window);
  const label = resolveMetricLabel(selected.label, period);
  const periodLabel = periodOption(period).label;

  return (
    <s-stack gap="base">
      <s-grid gridTemplateColumns="minmax(0, 1fr) auto auto" gap="small-200" alignItems="center">
        <s-heading>Overview</s-heading>
          <s-select
            label="Period"
            labelAccessibilityVisibility="exclusive"
            value={period}
            onChange={(event) => onPeriodChange(event.currentTarget.value as Period)}
          >
            {PERIODS.map((option) => (
              <s-option key={option.id} value={option.id}>
                {option.label}
              </s-option>
            ))}
          </s-select>
        <s-button
          variant="secondary"
          icon="menu-horizontal"
          accessibilityLabel="Overview options"
          commandFor="overview-menu"
        />
        <s-menu id="overview-menu" accessibilityLabel="Overview options">
          <s-button icon="export">Export CSV</s-button>
          <s-button icon="link">Embed</s-button>
        </s-menu>
      </s-grid>

      <s-box background="base" border="base" borderRadius="base" overflow="hidden">
        <MetricTabs metrics={metrics} period={period} selectedId={selectedId} onSelect={onSelect} />
        <s-divider />
        <s-box padding="base" accessibilityRole="region" accessibilityLabel={`${label} over ${periodLabel}`}>
          <TrendChart
            // Remount on a new plot so no hover state survives from the old one.
            key={`${selected.id}-${period}`}
            series={series}
            window={window}
            format={selected.format}
            label={label}
            periodLabel={periodLabel}
            domain={publication.domain}
          />
        </s-box>
      </s-box>
    </s-stack>
  );
}
