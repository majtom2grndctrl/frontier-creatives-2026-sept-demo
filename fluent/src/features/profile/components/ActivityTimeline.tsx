import { Button, Text, makeStyles, mergeClasses, tokens, useId } from '@fluentui/react-components'
import type { TimelineMonth } from '../types'
import { SectionHeader } from './SectionHeader'
import { TIMELINE_BADGE_SIZE, TimelineItem } from './TimelineItem'

// §8 — region: contribution activity.
//
// This section lives in the same narrow left sub-column as the contributions
// card, so it is narrower than the README and Pinned sections above it (§16.24).
// That constraint belongs to the page's grid: this component sets NO width and
// simply fills the column it is handed.
//
// Vertical order: section heading, month header + rule, the item stack with its
// rail, then the "Show more activity" button. The footer note below it is not
// ours — §8 puts it outside this region.

// Layout geometry, not tokens (see `fluent-v9-notes.md`). The rail sits on the
// centre-line of `TimelineItem`'s badge, which is that item's first grid column,
// so half the badge's width is exactly where the line belongs.
const RAIL_OFFSET = TIMELINE_BADGE_SIZE / 2

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    // deliberately no width: the page's sub-column supplies it (§16.24).
  },

  // §8 — the month header is slightly inset from the section heading.
  monthHeader: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    marginInlineStart: tokens.spacingHorizontalS,
    marginBlockEnd: tokens.spacingVerticalM,
  },
  monthLabel: {
    marginBlock: 0,
    flexShrink: 0,
    color: tokens.colorNeutralForeground1,
  },
  // ` 2026` is regular weight in `text/muted`; the month name beside it is bold.
  monthYear: {
    color: tokens.colorNeutralForeground2,
  },
  // a `border/default` rule filling the remaining width, vertically centred on
  // the label — a flex child with a top border does exactly that.
  monthRule: {
    flexGrow: 1,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
  },

  // §8 — the rail: a thin vertical line in `border/subtle`, lighter than the
  // month rule above it. It is a pseudo-element of the item STACK, not of the
  // section, so its extent is exactly the stack's: it starts below the month
  // header (the stack's top margin is the gap, so the rail never touches the
  // month rule) and the stack's bottom padding stops it just past the last
  // item — well short of the "Show more activity" button.
  stack: {
    position: 'relative',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    paddingBlockEnd: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    '::before': {
      content: '""',
      position: 'absolute',
      insetBlockStart: 0,
      insetBlockEnd: 0,
      insetInlineStart: `${RAIL_OFFSET}px`,
      // longhand: griffel rejects the `borderInlineStart` shorthand.
      borderInlineStartWidth: tokens.strokeWidthThin,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: tokens.colorNeutralStroke2,
    },
  },

  month: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  // §16.21 — an OUTLINE button, never a solid accent one: `surface/base` fill, a
  // `border/default` outline, and a bold `accent/primary` centred label.
  showMore: {
    width: '100%',
    justifyContent: 'center',
    marginBlockStart: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    color: tokens.colorBrandForegroundLink,
    fontWeight: tokens.fontWeightBold,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
      color: tokens.colorBrandForegroundLink,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },

  // §13 empty state — a single muted line, and nothing else.
  empty: {
    color: tokens.colorNeutralForeground2,
  },
})

export interface ActivityTimelineProps {
  timeline: TimelineMonth[]
  hasMoreActivity: boolean
  className?: string
}

export function ActivityTimeline({
  timeline,
  hasMoreActivity,
  className,
}: ActivityTimelineProps) {
  const styles = useStyles()
  const headingId = useId('activity-heading-')

  // a month with no items contributes no header and no rail.
  const months = timeline.filter((month) => month.items.length > 0)
  const isEmpty = months.length === 0

  return (
    <section className={mergeClasses(styles.root, className)} aria-labelledby={headingId}>
      {/* §9.2 — regular weight, no action slot, no rule beneath (§16.6). */}
      <SectionHeader title="Contribution activity" as="h2" id={headingId} />

      {/* §13 — no timeline items for the selected year: the heading and ONE
          muted line. No month header, no rail, no "Show more" button. */}
      {isEmpty ? (
        <Text size={300} className={styles.empty}>
          No contribution activity to show for this year.
        </Text>
      ) : (
        <>
          {months.map((month) => (
            <div key={`${month.month}-${month.year}`} className={styles.month}>
              <div className={styles.monthHeader}>
                <Text as="h3" size={300} weight="regular" className={styles.monthLabel}>
                  <Text size={300} weight="semibold">
                    {month.month}
                  </Text>{' '}
                  <Text size={300} weight="regular" className={styles.monthYear}>
                    {month.year}
                  </Text>
                </Text>
                <span className={styles.monthRule} aria-hidden />
              </div>

              {/* a real list — items stack with no dividers between them (§16.19) */}
              <ul className={styles.stack}>
                {month.items.map((item, index) => (
                  <TimelineItem key={`${item.kind}-${index}`} item={item} />
                ))}
              </ul>
            </div>
          ))}

          {hasMoreActivity ? (
            <Button appearance="outline" className={styles.showMore}>
              Show more activity
            </Button>
          ) : null}
        </>
      )}
    </section>
  )
}
