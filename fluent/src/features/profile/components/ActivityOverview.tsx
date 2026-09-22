import { Fragment } from 'react'
import { css } from '@emotion/react'
import { Link, Text, makeStyles, tokens } from '@fluentui/react-components'
import { Book16Regular } from '@fluentui/react-icons'
import { media } from '@/styles/breakpoints'
import type { ActivityOverview as ActivityOverviewData } from '../types'
import { otherRepositoriesClause } from '../format'
import { ActivityBreakdownChart } from './ActivityBreakdownChart'

// §7.2b — the activity overview region: two roughly equal panes, text left and
// the breakdown chart right.
//
// What this component deliberately does NOT render: the contributions card
// around it, its padding, and the vertical rule between the panes. §16.18 wants
// that rule inset from the card's own edges by the card's own padding, which is
// a fact only the card knows — so `ContributionsCard` owns it and this renders
// the two panes' contents for the card to place.

/**
 * Emotion, per the house rule, because this wrapper is the region's responsive
 * pivot: §15 stacks the two panes at the medium breakpoint and below, chart
 * beneath the text. Everything inside a pane is griffel.
 */
function useStyles() {
  return {
    region: css({
      display: 'flex',
      flexDirection: 'column',
      rowGap: tokens.spacingVerticalXL,
      // no padding of its own — the card supplies it.
      [media.lg]: {
        flexDirection: 'row',
        columnGap: tokens.spacingHorizontalXXL,
      },
    }),
    // `1 1 0` rather than `1 1 auto`: the panes stay approximately equal
    // regardless of how long the sentence is.
    pane: css({
      flex: '1 1 0',
      minWidth: 0,
    }),
  }
}

const useClasses = makeStyles({
  heading: {
    marginBlock: 0,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground1,
  },
  // §7.2b — the hanging indent. The glyph is the non-shrinking first child and
  // the sentence the flexible second, which puts every wrapped line flush with
  // the first line's text instead of under the glyph. No `text-indent` needed.
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    columnGap: tokens.spacingHorizontalS,
  },
  glyph: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    // one body line tall, so the glyph optically centres on the first line
    // rather than on the whole wrapped block.
    height: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground2,
  },
  sentence: {
    marginBlock: 0,
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  // accent/primary, bold (§12.2). §13: hover adds an underline and leaves the
  // colour alone — Fluent's Link recolours on hover by default, so both hover
  // states are pinned back to the resting link colour here.
  repoLink: {
    // §7.2b — a repository name may not be broken across lines.
    whiteSpace: 'nowrap',
    color: tokens.colorBrandForegroundLink,
    fontWeight: tokens.fontWeightSemibold,
    ':hover': {
      color: tokens.colorBrandForegroundLink,
      textDecorationLine: 'underline',
    },
    ':hover:active': {
      color: tokens.colorBrandForegroundLink,
      textDecorationLine: 'underline',
    },
    ':focus-visible': {
      borderRadius: tokens.borderRadiusSmall,
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },
})

/**
 * The separator that precedes link `index`. §7.2b: links are comma-separated,
 * and there is no comma before "and".
 *
 *  - with a trailing clause: `a, b, c and 13 other repositories`
 *  - without one:           `a, b and c`
 */
function separatorBefore(index: number, count: number, hasClause: boolean): string {
  if (index === 0) return ''
  if (!hasClause && index === count - 1) return ' and '
  return ', '
}

export interface ActivityOverviewProps {
  overview: ActivityOverviewData
  /** placement hook for the contributions card that hosts the region. */
  className?: string
}

export function ActivityOverview({ overview, className }: ActivityOverviewProps) {
  const styles = useStyles()
  const classes = useClasses()
  const { named, otherCount } = overview.contributedTo
  const clause = otherRepositoriesClause(otherCount)

  return (
    <div css={styles.region} className={className}>
      <div css={styles.pane}>
        {/* type/body, regular weight, text/default (§7.2b) */}
        <Text as="h3" block size={300} weight="regular" className={classes.heading}>
          Activity overview
        </Text>

        {/* one entry, a flowing sentence rather than a list (§7.2b). */}
        <div className={classes.entry}>
          <span aria-hidden className={classes.glyph}>
            <Book16Regular />
          </span>
          <Text as="p" size={300} weight="regular" className={classes.sentence}>
            Contributed to{' '}
            {named.map((name, index) => (
              <Fragment key={name}>
                {separatorBefore(index, named.length, clause !== null)}
                {/* hrefs for the profile's repositories are out of scope (§13);
                    the path mirrors the `owner/repo` the data carries. */}
                <Link href={`/${name}`} className={classes.repoLink}>
                  {name}
                </Link>
              </Fragment>
            ))}
            {clause}
          </Text>
        </div>
      </div>

      <div css={styles.pane}>
        <ActivityBreakdownChart breakdown={overview.breakdown} />
      </div>
    </div>
  )
}
