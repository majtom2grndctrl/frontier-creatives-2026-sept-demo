import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import {
  Caption1,
  LargeTitle,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components'
import { InfoRegular } from '@fluentui/react-icons'
import type { ID, Metric, Period } from '../types'
import {
  formatComparison,
  formatMetricValue,
  metricValueAccessibleText,
} from '../format'
import { metricLabelForPeriod } from '../series'
import { DeltaPill } from './DeltaPill'
import { IconButton } from './IconButton'

// §6.2 — the metric segment strip. It is *not* three stat cards: it is a single
// bordered container acting as a segmented tab control that chooses which series
// §6.3 plots, so §15 makes it a real tablist.
//
// Why this is hand-rolled rather than Fluent's `TabList`/`Tab`:
//   1. Fluent's `Tab` root is a `<button>`. Each segment carries its own ⓘ icon
//      button (§6.2, §14.6 — tooltip on hover *and* keyboard focus), and a button
//      cannot legally nest inside a button. Here the ⓘ is a sibling of the tab,
//      absolutely positioned in the segment's top-right corner, and it stays out
//      of the tablist's arrow-key cycle.
//   2. §15 wants the metric stack as a `<dl>` label/value pair, which is flow
//      content and so is not valid inside a `<button>` either.
//   3. Fluent's tab indicator is an animated bar owned by the tab; §6.2 needs a
//      thick accent bar on the *container's* top edge that follows the container's
//      corner radius, i.e. it belongs to the container's clipping context.
// Hand-rolling therefore means implementing the roles ourselves: `role="tablist"`,
// `role="tab"` + `aria-selected` + `aria-controls`, roving `tabindex`, and
// left/right/home/end navigation with selection following focus (APG automatic
// activation — the chart is cheap to re-plot).

const useStyles = makeStyles({
  strip: {
    position: 'relative',
    // §13 surface/recessed: the strip's resting fill, and every unselected segment.
    backgroundColor: tokens.colorNeutralBackground3,
  },
  // the accent top indicator. It is a child of the strip, which sits flush with
  // the card's top edge, so the card's radius + overflow clip it into the corner
  // rather than letting it run square to the edge (§6.2).
  indicator: {
    position: 'absolute',
    insetBlockStart: 0,
    insetInlineStart: 0,
    // the segments are positioned too, so the bar needs to win the paint order
    zIndex: 1,
    height: tokens.strokeWidthThicker,
    backgroundColor: tokens.colorBrandBackground,
    transitionProperty: 'transform',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    // §15 — reduced motion makes the indicator move instantly.
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  tablist: {
    display: 'grid',
  },
  // positioned wrapper so the ⓘ button can sit at the segment's right edge
  // without living inside the tab element itself.
  segment: {
    position: 'relative',
    display: 'flex',
    minWidth: 0,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
    rowGap: tokens.spacingVerticalXS,
    cursor: 'pointer',
    // §13 density: roomy, not compact.
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalXL,
    backgroundColor: tokens.colorTransparentBackground,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: `calc(-1 * ${tokens.strokeWidthThick})`,
    },
  },
  // §6.2 — no explicit vertical rules between segments. The selected segment is a
  // raised block on a recessed strip and its own edges read as the dividers, so
  // two adjacent unselected segments have nothing between them at all.
  tabSelected: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  tabUnselected: {
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground3Pressed,
    },
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
    marginBlock: 0,
    marginInline: 0,
    minWidth: 0,
  },
  term: {
    marginBlock: 0,
    marginInline: 0,
    minWidth: 0,
    // leaves room for the ⓘ button parked at the segment's right edge
    paddingInlineEnd: tokens.spacingHorizontalXXL,
    color: tokens.colorNeutralForeground2,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    marginBlock: 0,
    marginInline: 0,
    minWidth: 0,
  },
  value: {
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  // §6.2 — the dash occupies the numeral's line box so all three comparison lines
  // stay on one baseline; it is only muted, never a smaller step.
  valueEmpty: {
    color: tokens.colorNeutralForeground3,
  },
  comparison: {
    marginBlock: 0,
    marginInline: 0,
    color: tokens.colorNeutralForeground3,
  },
  info: {
    position: 'absolute',
    insetBlockStart: tokens.spacingVerticalM,
    insetInlineEnd: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
  },
  // the standard clip-out. The 1px values here are an accessibility utility, not
  // design values, so they are correctly literal.
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 'none',
  },
})

/** the DOM id of a metric's tab, so the chart panel can be wired to it (§15). */
export function metricTabId(prefix: string, metricId: ID): string {
  return `${prefix}tab-${metricId}`
}

export interface MetricTabsProps {
  metrics: Metric[]
  /** controlled selection — the id of the metric driving the chart. */
  selectedMetricId: ID
  onSelectMetric: (metricId: ID) => void
  /** §6.2 — the third label embeds the period (`1y views`), so it is derived. */
  period: Period
  /** the id of the `TrendChart` tabpanel each tab controls. */
  panelId: string
  /** namespaces the generated tab ids; pair with `metricTabId`. */
  idPrefix: string
  /** the tablist's accessible name. */
  label?: string
  className?: string
}

export function MetricTabs({
  metrics,
  selectedMetricId,
  onSelectMetric,
  period,
  panelId,
  idPrefix,
  label = 'Metric',
  className,
}: MetricTabsProps) {
  const styles = useStyles()
  const tabRefs = useRef(new Map<ID, HTMLDivElement | null>())

  const count = metrics.length
  const selectedIndex = Math.max(
    0,
    metrics.findIndex((metric) => metric.id === selectedMetricId),
  )

  function moveTo(index: number) {
    const next = metrics[(index + count) % count]
    if (!next) return
    onSelectMetric(next.id)
    // selection follows focus, so the roving tabindex has to follow it too
    tabRefs.current.get(next.id)?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number, id: ID) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveTo(index + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        moveTo(index - 1)
        break
      case 'Home':
        event.preventDefault()
        moveTo(0)
        break
      case 'End':
        event.preventDefault()
        moveTo(count - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelectMetric(id)
        break
      default:
        break
    }
  }

  return (
    <div className={mergeClasses(styles.strip, className)}>
      <span
        aria-hidden
        className={styles.indicator}
        // the strip has as many equal columns as there are metrics, so the bar is
        // one column wide and slides a whole column per step. Layout arithmetic,
        // not a design value.
        style={{
          width: `${100 / count}%`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      <div
        role="tablist"
        aria-label={label}
        className={styles.tablist}
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {metrics.map((metric, index) => {
          const isSelected = metric.id === selectedMetricId
          const metricLabel = metricLabelForPeriod(metric.label, period)
          const isEmpty = metric.value === null

          return (
            <div key={metric.id} role="presentation" className={styles.segment}>
              <div
                role="tab"
                id={metricTabId(idPrefix, metric.id)}
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                ref={(node) => {
                  tabRefs.current.set(metric.id, node)
                }}
                className={mergeClasses(
                  styles.tab,
                  isSelected ? styles.tabSelected : styles.tabUnselected,
                )}
                onClick={() => onSelectMetric(metric.id)}
                onKeyDown={(event) => handleKeyDown(event, index, metric.id)}
              >
                {/* §15 — a label/value pair, not a bare number. */}
                <dl className={styles.stack}>
                  <dt className={styles.term}>
                    <Caption1>{metricLabel}</Caption1>
                  </dt>
                  <dd className={styles.valueRow}>
                    <LargeTitle
                      aria-hidden
                      className={mergeClasses(
                        styles.value,
                        isEmpty && styles.valueEmpty,
                      )}
                    >
                      {formatMetricValue(metric.value, metric.format)}
                    </LargeTitle>
                    {/* the empty metric announces `No data`, never the dash glyph. */}
                    <span className={styles.visuallyHidden}>
                      {metricValueAccessibleText(metric.value, metric.format)}
                    </span>
                    {/* renders nothing when `deltaPct` is null — no `0%` pill. */}
                    <DeltaPill deltaPct={metric.deltaPct} />
                  </dd>
                  <dd className={styles.comparison}>
                    <Caption1>
                      {formatComparison(metric.priorValue, metric.format)}
                    </Caption1>
                  </dd>
                </dl>
              </div>
              <IconButton
                className={styles.info}
                icon={<InfoRegular />}
                label={`About ${metricLabel}`}
                tooltip={metric.infoText}
                size="small"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
