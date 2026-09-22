import type { ReactNode } from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'

// §7.2 — ONE card holding two stacked regions.
//
// This component owns only the card and its two rules, because both rules are
// seams between pieces that are built separately:
//
//  - the horizontal rule is **full-bleed**: it touches both card edges, so it is
//    a border on the lower region rather than a `Divider` inside the padding.
//  - the vertical rule between the activity-overview panes is **inset** from the
//    horizontal rule above and from the card's bottom edge by the card's own
//    internal padding — it does not run corner to corner (§16.18). It is drawn
//    as a pseudo-element on the padded region, so the inset is the padding by
//    construction and cannot drift from it.
//
// The card fill is `surface/base`, the same value as the page background: cards
// are defined by their hairline border alone (§16.1). No shadow (§16.10).

// §15 medium — the two overview panes stack, chart below text, and the vertical
// rule goes with them. The shared breakpoints module tops out at lg (1024),
// which is the wide step this screen is specified against.
const PANES_STACK = '@media (max-width: 1023px)'

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    // keeps the full-bleed horizontal rule inside the rounded corners.
    overflow: 'hidden',
  },
  // §12.3 — the contributions card sits between the roomy README card and the
  // tight pinned cards. Both regions share this padding, and the inset rule
  // below reads it back, so the two stay locked together.
  heatmapRegion: {
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalL,
  },
  overviewRegion: {
    position: 'relative',
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalL,
    // §7.2 — the full-bleed rule between the two regions.
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    // §7.2b — the inset vertical rule. `top`/`bottom` are the region's own
    // padding, which is what "inset by the card's internal padding" means.
    '::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      top: tokens.spacingVerticalL,
      bottom: tokens.spacingVerticalL,
      width: tokens.strokeWidthThin,
      backgroundColor: tokens.colorNeutralStroke1,
    },
    [PANES_STACK]: {
      // the panes are stacked here, so a vertical rule between them would be
      // drawing a line through the middle of a single column.
      '::before': {
        content: 'none',
      },
    },
  },
})

export interface ContributionsCardProps {
  /** §7.2a — the calendar grid, its labels and its legend footer. */
  heatmap: ReactNode
  /** §7.2b — the two panes: the contributed-to sentence and the radar chart. */
  activityOverview: ReactNode
}

export function ContributionsCard({
  heatmap,
  activityOverview,
}: ContributionsCardProps) {
  const styles = useStyles()

  return (
    <div className={styles.card}>
      <div className={styles.heatmapRegion}>{heatmap}</div>
      <div className={styles.overviewRegion}>{activityOverview}</div>
    </div>
  )
}
