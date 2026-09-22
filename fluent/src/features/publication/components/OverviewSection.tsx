import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Select,
  makeStyles,
  mergeClasses,
  tokens,
  useId,
} from '@fluentui/react-components'
import { MoreHorizontalRegular } from '@fluentui/react-icons'
import type { ID, Metric, Period } from '../types'
import { PERIODS, PERIOD_LABELS, getSeriesSlice, metricLabelForPeriod } from '../series'
import { TODAY, metrics as fixtureMetrics, publication } from '../fixtures'
import { Card } from './Card'
import { IconButton } from './IconButton'
import { SectionHeadingRow } from './SectionHeadingRow'
import { MetricTabs } from './MetricTabs'
import { TrendChart } from './TrendChart'

// §6 — the Overview section, and the one place on this screen using the *detached*
// heading pattern of §5.1: the heading row and its controls sit outside and above
// the bordered panel, on bare pane surface. The `Card` below therefore takes no
// `heading` prop — putting "Overview" inside the card is the §18 mistake.
//
// §17 — this owns the small piece of state the spec calls out (`selectedMetricId`
// and `period`); everything below it is a controlled component fed fixture data.

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  // the §6.1 select and `⋯` are two outlined controls of equal height sitting on
  // the pane surface with no panel behind them.
  select: {
    minWidth: '9rem',
  },
  panel: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
})

export interface OverviewSectionProps {
  /** defaults to the §12.1 fixture. */
  metrics?: Metric[]
  /** the publication domain, rendered as the chart watermark (§6.3). */
  watermark?: string
  /** the fixture's "today", so slicing and date labels are deterministic (§12). */
  now?: string | Date
  /** §12.1 — `Total subscribers` is selected by default. */
  defaultMetricId?: ID
  /** §6.1 sample reads `1 year`. */
  defaultPeriod?: Period
  className?: string
}

export function OverviewSection({
  metrics = fixtureMetrics,
  watermark = publication.domain,
  now = TODAY,
  defaultMetricId,
  defaultPeriod = '1y',
  className,
}: OverviewSectionProps) {
  const styles = useStyles()
  const baseId = useId('overview-')
  const headingId = `${baseId}-heading`
  const panelId = `${baseId}-panel`

  const [selectedMetricId, setSelectedMetricId] = useState<ID>(
    () => defaultMetricId ?? metrics[0]?.id ?? '',
  )
  const [period, setPeriod] = useState<Period>(defaultPeriod)

  const selectedMetric =
    metrics.find((metric) => metric.id === selectedMetricId) ?? metrics[0]

  // §17 — the slicing itself lives in a pure function, so this is only a lookup.
  const slice = useMemo(
    () => getSeriesSlice(selectedMetric?.series ?? [], period, now),
    [selectedMetric, period, now],
  )

  if (!selectedMetric) return null

  const metricLabel = metricLabelForPeriod(selectedMetric.label, period)

  return (
    <section
      aria-labelledby={headingId}
      className={mergeClasses(styles.section, className)}
    >
      <SectionHeadingRow title="Overview" id={headingId}>
        <Select
          className={styles.select}
          aria-label="Trend period"
          value={period}
          onChange={(_event: ChangeEvent<HTMLSelectElement>, data) => {
            // §14.4 — re-slices the series and re-labels the x axis, and because
            // the §6.2 labels are derived, relabels `1y views` too.
            setPeriod(data.value as Period)
          }}
        >
          {PERIODS.map((option) => (
            <option key={option} value={option}>
              {PERIOD_LABELS[option]}
            </option>
          ))}
        </Select>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <IconButton
              icon={<MoreHorizontalRegular />}
              label="Overview options"
              appearance="outline"
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Export CSV</MenuItem>
              <MenuItem>Embed</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </SectionHeadingRow>

      {/* §5.1 — no `heading` prop: this panel holds only the data. */}
      <Card
        as="div"
        bodyPadding="none"
        className={styles.panel}
      >
        <MetricTabs
          metrics={metrics}
          selectedMetricId={selectedMetric.id}
          onSelectMetric={setSelectedMetricId}
          period={period}
          panelId={panelId}
          idPrefix={baseId}
          label="Overview metric"
        />
        <TrendChart
          id={panelId}
          points={slice.points}
          yDomain={slice.yDomain}
          xDomain={slice.xDomain}
          metricLabel={metricLabel}
          format={selectedMetric.format}
          period={period}
          watermark={watermark}
          // §14.3 — the empty metric is selectable and plots a zero state.
          isEmpty={selectedMetric.value === null}
          now={now}
        />
      </Card>
    </section>
  )
}
