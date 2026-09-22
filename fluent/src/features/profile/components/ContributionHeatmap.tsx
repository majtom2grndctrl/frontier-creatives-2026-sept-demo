import { useMemo } from 'react'
import { Text, Tooltip, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import type { ContributionDay, ContributionYear } from '../types'
import type { ContributionLevel } from '../palette'
import { contributionCellLabel } from '../format'
import { rampVar } from '../palette'
import { breakpoints, media } from '@/styles/breakpoints'

// §7.2a — the heatmap region's contents: the calendar grid, its labels and the
// footer row. The card around it belongs to `ContributionsBand`; this component
// renders no border, no fill and no padding of its own.
//
// CELL_EDGE / CELL_GAP / DAY_LABEL_WIDTH below are chart geometry, not design
// values — the same exemption `fluent-v9-notes.md` grants a chart's intrinsic
// sizes. There is no token for "how wide a heatmap cell is", and rounding one to
// the nearest spacing step would break the square. Every *colour*, radius, type
// step and stroke below still comes from a token.

/** a cell's edge, in px. */
const CELL_EDGE = 11
/** the gap between cells — roughly a quarter of the edge (§7.2a). */
const CELL_GAP = 2
/** the leading day-label column. Wide enough for a three-letter weekday. */
const DAY_LABEL_WIDTH = 30

/** §16.13 — the final month keeps its label only if its column run reaches this. */
const MIN_LABEL_COLUMNS = 3

const DAYS_IN_WEEK = 7
/** the widest a year's grid gets: 52 full weeks plus a partial leading/trailing
 *  one. Only used as the narrow-breakpoint width floor, so an exact column count
 *  is not needed — this is the upper bound. */
const WEEKS_IN_YEAR = 53
/** Monday, Wednesday and Friday are labelled; the other four rows are blank. */
const LABELLED_WEEKDAYS = new Set([1, 3, 5])

const monthName = new Intl.DateTimeFormat(undefined, { month: 'short' })
const weekdayName = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

/**
 * ISO dates are parsed as local midnight, matching `format.ts` — otherwise a
 * date west of greenwich lands on the previous weekday and the whole grid
 * shears by one row.
 */
function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/** the seven row labels, derived from a reference week rather than hardcoded. */
const WEEKDAY_LABELS = Array.from({ length: DAYS_IN_WEEK }, (_, weekday) =>
  // 2026-09-13 is a Sunday, so index 0 is Sunday.
  LABELLED_WEEKDAYS.has(weekday) ? weekdayName.format(new Date(2026, 8, 13 + weekday)) : '',
)

type Column = (ContributionDay | null)[]

interface Grid {
  columns: Column[]
  /** column index -> the month label that starts there. */
  monthLabels: Map<number, string>
}

/**
 * Buckets the days into week columns and decides which columns carry a month
 * label.
 *
 * Column rule: a day sits in the row matching its weekday, so a range that does
 * not begin on a Sunday leaves leading nulls in column 0 and a truncated newest
 * week leaves trailing nulls in the last column (§16.12).
 *
 * Label rule: a column's month is the month of its first day. A month is
 * labelled at the first column belonging to it, and the *final* month's label is
 * dropped when its column run is shorter than `MIN_LABEL_COLUMNS` (§16.13). With
 * the fixture's 2025-09-14 .. 2026-09-14 range that keeps September 2025
 * (3 columns) and drops September 2026 (2 columns), leaving exactly twelve
 * labels — which §18 checks. Nothing here hardcodes a list of months.
 */
function buildGrid(days: ContributionDay[]): Grid {
  const columns: Column[] = []
  let current: Column = new Array<ContributionDay | null>(DAYS_IN_WEEK).fill(null)
  let started = false

  for (const day of days) {
    const weekday = parseIso(day.date).getDay()
    current[weekday] = day
    started = true
    if (weekday === DAYS_IN_WEEK - 1) {
      columns.push(current)
      current = new Array<ContributionDay | null>(DAYS_IN_WEEK).fill(null)
      started = false
    }
  }
  if (started) columns.push(current)

  // one run per contiguous stretch of columns sharing a month.
  const runs: { startColumn: number; span: number; date: Date }[] = []
  columns.forEach((column, index) => {
    const first = column.find((day): day is ContributionDay => day !== null)
    if (!first) return
    const date = parseIso(first.date)
    const previous = runs[runs.length - 1]
    if (
      previous &&
      previous.date.getFullYear() === date.getFullYear() &&
      previous.date.getMonth() === date.getMonth()
    ) {
      previous.span += 1
    } else {
      runs.push({ startColumn: index, span: 1, date })
    }
  })

  const monthLabels = new Map<number, string>()
  runs.forEach((run, index) => {
    const isFinalRun = index === runs.length - 1
    if (isFinalRun && run.span < MIN_LABEL_COLUMNS) return
    monthLabels.set(run.startColumn, monthName.format(run.date))
  })

  return { columns, monthLabels }
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalM,
  },
  // §15 — the heatmap may become its own horizontal scroll container, but only
  // *below* the wide breakpoint. At wide it must not have a scrollbar (§16.25).
  scroller: {
    overflowX: 'auto',
    [media.lg]: {
      overflowX: 'visible',
    },
  },
  // §15 narrow — below the wide step the grid stops shrinking and the wrapper
  // above scrolls instead. Without a floor the fluid columns keep dividing the
  // viewport, and at phone width the squares collapse to a few px of mush.
  // 53 columns at their nominal size, plus the day-label column.
  tableFloor: {
    minWidth: `${DAY_LABEL_WIDTH + WEEKS_IN_YEAR * (CELL_EDGE + CELL_GAP)}px`,
    [media.lg]: {
      minWidth: 'auto',
    },
  },
  table: {
    // `fixed` is what keeps a month label from widening its column: the widths
    // come from the header row, and a nowrap label simply overflows to the
    // right, which is the alignment the spec asks for.
    tableLayout: 'fixed',
    // §16.25 — the grid must FIT the contributions card at the wide breakpoint,
    // not overflow and get clipped by it. 53 fixed 11px columns are wider than
    // the ~83% sub-column §2 gives this card, so the columns are fluid: the
    // table takes its width from the card and each square derives its size from
    // its column via `aspect-ratio`. The day-label column keeps a fixed width.
    width: '100%',
    borderCollapse: 'separate',
    // the inter-cell gap, applied on both axes so the grid stays square.
    borderSpacing: `${CELL_GAP}px`,
  },
  caption: {
    // an accessibility utility, so the 1px values here are correctly literal.
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
  dayLabelCol: {
    width: `${DAY_LABEL_WIDTH}px`,
  },
  // the 53 week columns share whatever the day-label column leaves.
  weekCol: {
    width: 'auto',
  },
  // the corner cell above the day labels, and the day-label column itself.
  dayLabelCell: {
    width: `${DAY_LABEL_WIDTH}px`,
    padding: '0',
    // anchors the absolutely positioned label below.
    position: 'relative',
    // §15 narrow — "day labels stay pinned" while the grid scrolls under them.
    // This is scoped to the scroll container, so it does not contradict §13's
    // "nothing on this page is sticky", which is about the page's own chrome.
    [`@media (max-width: ${breakpoints.lg - 1}px)`]: {
      position: 'sticky',
      insetInlineStart: 0,
      zIndex: 1,
      backgroundColor: tokens.colorNeutralBackground1,
    },
  },
  // absolute so the label's line box never stretches the row past a cell edge —
  // rows stay exactly CELL_EDGE tall and the squares stay square.
  dayLabel: {
    position: 'absolute',
    insetInlineEnd: tokens.spacingHorizontalXS,
    top: '50%',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
  monthCell: {
    padding: '0',
    textAlign: 'start',
    verticalAlign: 'bottom',
    fontWeight: tokens.fontWeightRegular,
  },
  monthLabel: {
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
  },
  cell: {
    // no width: `table-layout: fixed` divides the remaining width across the 53
    // week columns, and the swatch below squares itself against whatever it gets.
    padding: '0',
  },
  swatch: {
    width: '100%',
    aspectRatio: '1 / 1',
    // an upper bound so a wide viewport does not inflate the squares past the
    // spec's "small squares" — the lower bound is the column itself.
    maxWidth: `${CELL_EDGE}px`,
    // §12.3 — the shallowest rung of the radius ladder: softly rounded, clearly
    // not a circle.
    borderRadius: tokens.borderRadiusSmall,
    // §14 — the ring sits outside the square so it reads against both the cell
    // fill and the card surface behind the grid.
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
  // §16.11 — level 0 is `surface/recessed`, a neutral, and NOT the faintest step
  // of the sequential ramp. Do not "fix" this to rampVar(1).
  level0: { backgroundColor: tokens.colorNeutralBackground4 },
  level1: { backgroundColor: rampVar(1) },
  level2: { backgroundColor: rampVar(2) },
  level3: { backgroundColor: rampVar(3) },
  level4: { backgroundColor: rampVar(4) },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalS,
  },
  // §16.22 — quiet text, not `accent/primary`, despite being a link.
  footerLink: {
    color: tokens.colorNeutralForeground2,
    textDecorationLine: 'none',
    borderRadius: tokens.borderRadiusSmall,
    ':hover': {
      textDecorationLine: 'underline',
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground2,
  },
  legendSwatches: {
    display: 'flex',
    alignItems: 'center',
    columnGap: `${CELL_GAP}px`,
  },
  // the legend sits outside the table, so it keeps the nominal cell size rather
  // than inheriting the grid's fluid one (§7.2a: "the same size and radius as
  // grid cells").
  legendSwatch: {
    width: `${CELL_EDGE}px`,
    height: `${CELL_EDGE}px`,
    flexShrink: 0,
  },
})

const LEVELS: ContributionLevel[] = [0, 1, 2, 3, 4]

export interface ContributionHeatmapProps {
  contributions: ContributionYear
}

export function ContributionHeatmap({ contributions }: ContributionHeatmapProps) {
  const styles = useStyles()
  const levelClass = [
    styles.level0,
    styles.level1,
    styles.level2,
    styles.level3,
    styles.level4,
  ]

  const { columns, monthLabels } = useMemo(
    () => buildGrid(contributions.days),
    [contributions.days],
  )

  // §13 empty state — a year with nothing in it still renders the full grid, at
  // level 0 throughout, and still keeps the legend. The heading that reads "No
  // contributions in <year>" belongs to the band, not here.
  const isEmpty = contributions.total === 0

  return (
    <div className={styles.root}>
      <div className={styles.scroller}>
        {/* §14/§17 — a real table, so a screen reader can traverse weeks and days. */}
        <table className={mergeClasses(styles.table, styles.tableFloor)}>
          {/* with `table-layout: fixed` the column widths come from the first
              row, which makes them hostage to whatever that row's cells carry.
              A colgroup states them outright: a fixed day-label column, then 53
              equal week columns that absorb the rest. */}
          <colgroup>
            <col className={styles.dayLabelCol} />
            {columns.map((_, index) => (
              <col key={index} className={styles.weekCol} />
            ))}
          </colgroup>
          <caption className={styles.caption}>
            Contribution activity by day, {contributions.rangeStart} to{' '}
            {contributions.rangeEnd}
          </caption>
          <thead>
            <tr>
              {/* the corner above the day labels carries no meaning. */}
              <td className={styles.dayLabelCell} aria-hidden="true" />
              {columns.map((_, index) => {
                const label = monthLabels.get(index)
                return (
                  <th
                    key={index}
                    scope="col"
                    className={styles.monthCell}
                    // an empty column header would otherwise announce as "blank".
                    aria-hidden={label ? undefined : 'true'}
                  >
                    {label ? (
                      // type/small, text/muted (§12.2)
                      <Text size={200} weight="regular" className={styles.monthLabel}>
                        {label}
                      </Text>
                    ) : null}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* seven rows are always rendered, labelled or not (§7.2a). */}
            {WEEKDAY_LABELS.map((dayLabel, weekday) => (
              <tr key={weekday}>
                <th
                  scope="row"
                  className={styles.dayLabelCell}
                  // the four unlabelled rows are structurally present but carry
                  // nothing to announce.
                  aria-hidden={dayLabel ? undefined : 'true'}
                >
                  {dayLabel ? (
                    <Text size={200} weight="regular" className={styles.dayLabel}>
                      {dayLabel}
                    </Text>
                  ) : null}
                </th>
                {columns.map((column, index) => {
                  const day = column[weekday]
                  // §16.12 — the truncated newest week. The <td> stays so the
                  // column keeps its alignment, but it holds no swatch, so
                  // nothing is painted: the last column has fewer *cells* than
                  // the others rather than paler ones.
                  if (!day) return <td key={index} className={styles.cell} />

                  const level = isEmpty ? 0 : day.level
                  const label = contributionCellLabel(day.count, day.date)

                  return (
                    <td key={index} className={styles.cell}>
                      {/*
                        §13/§14 — one Fluent Tooltip per cell. `relationship="label"`
                        makes the tooltip text the swatch's accessible name too, so
                        the hover string and the screen-reader string cannot drift,
                        and Fluent opens it on focus as well as hover, which covers
                        the keyboard path with no second mechanism. A shared
                        hover-state tooltip would need its own aria-label on every
                        cell anyway; Tooltip renders no popup surface until it is
                        visible, so ~366 of them cost listeners, not DOM.
                      */}
                      <Tooltip content={label} relationship="label" withArrow>
                        <div
                          // §14 — every painted cell is focusable in DOM order.
                          tabIndex={0}
                          className={mergeClasses(
                  styles.swatch,
                  styles.legendSwatch,
                  levelClass[level],
                )}
                        />
                      </Tooltip>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <a href="#" className={styles.footerLink}>
          <Text size={200} weight="regular">
            Learn how we count contributions
          </Text>
        </a>

        <div className={styles.legend}>
          <Text size={200} weight="regular">
            Less
          </Text>
          {/* decorative — "Less" and "More" carry the meaning (§14). */}
          <div className={styles.legendSwatches} aria-hidden="true">
            {LEVELS.map((level) => (
              <div
                key={level}
                className={mergeClasses(
                  styles.swatch,
                  styles.legendSwatch,
                  levelClass[level],
                )}
              />
            ))}
          </div>
          <Text size={200} weight="regular">
            More
          </Text>
        </div>
      </div>
    </div>
  )
}
