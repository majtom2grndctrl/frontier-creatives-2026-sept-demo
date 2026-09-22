import { css } from '@emotion/react'
import { Link, makeStyles, tokens, useId } from '@fluentui/react-components'
import { media } from '@/styles/breakpoints'
import type { PinnedRepo } from '../types'
import { PinnedRepoCard } from './PinnedRepoCard'
import { SectionHeader } from './SectionHeader'

// §6 Region G — the pinned section: a header row with an accent action, and a
// two-up grid of §9.1 cards.
//
// §16.6: no rule beneath the header. §16.7: five cards means the last row holds
// one card in the left column and *nothing* in the right — no placeholder, no
// ghost tile, no "add a pin" affordance. That is expressed by simply not
// rendering a second child; there is no filler branch below.

// Emotion carries the grid because the column count is the one responsive
// decision in this region (§15: pinned collapses to one column at medium and
// below), which is exactly the wrapper case CLAUDE.md reserves it for. The card
// and the header action stay on griffel.
function useGridStyles() {
  return {
    grid: css({
      display: 'grid',
      // one column is the base; `media.lg` is min-width 1024px, so two columns
      // are a min-width rule rather than a max-width override (§15).
      gridTemplateColumns: '1fr',
      // a single `gap` is what guarantees the row gap equals the column gap (§6).
      gap: tokens.spacingHorizontalXL,
      listStyleType: 'none',
      marginBlock: 0,
      paddingInline: 0,
      [media.lg]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      // §6, §17: no `align-items: start` here. The default `stretch` is what
      // gives every card in a row the height of the tallest one, and rows stay
      // independently sized — a row holding one card is sized by that card alone.
    }),
    item: css({
      // the grid stretches this cell; `display: flex` passes that height down to
      // the card, whose own column layout then bottom-anchors its footer (§9.1).
      display: 'flex',
      minWidth: 0,
    }),
  }
}

const useStyles = makeStyles({
  // §6 — type/small, accent, no underline at rest, no button chrome. §13 hover:
  // the underline appears and the colour is unchanged.
  action: {
    color: tokens.colorBrandForegroundLink,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    textDecorationLine: 'none',
    ':hover': {
      color: tokens.colorBrandForegroundLink,
      textDecorationLine: 'underline',
    },
    ':hover:active': {
      color: tokens.colorBrandForegroundLink,
      textDecorationLine: 'underline',
    },
  },
})

export interface PinnedGridProps {
  /** §10 — 0 to 6 repositories, laid out 2-up. Empty omits the whole section. */
  pinned: PinnedRepo[]
  /** §1 — gates "Customize your pins" and the cards' drag handles. */
  isOwner: boolean
}

export function PinnedGrid({ pinned, isOwner }: PinnedGridProps) {
  const gridStyles = useGridStyles()
  const styles = useStyles()
  const headingId = useId('pinned-heading-')

  // §13 — no pinned repositories omits the whole section, header and all.
  if (pinned.length === 0) return null

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader
        title="Pinned"
        id={headingId}
        action={
          isOwner ? (
            // §0 — out of scope; render the affordance and wire it to a no-op.
            <Link as="button" className={styles.action} onClick={() => {}}>
              Customize your pins
            </Link>
          ) : undefined
        }
      />
      <ul css={gridStyles.grid}>
        {pinned.map((repo) => (
          <li key={repo.name} css={gridStyles.item}>
            <PinnedRepoCard repo={repo} isOwner={isOwner} />
          </li>
        ))}
      </ul>
    </section>
  )
}
