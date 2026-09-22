import { Link, Text, makeStyles, tokens, useId } from '@fluentui/react-components'
import {
  Book16Regular,
  ReOrderDotsVertical20Regular,
  Star16Regular,
} from '@fluentui/react-icons'
import { pluralize } from '../format'
import type { PinnedRepo } from '../types'

// §9.1 `PinnedRepoCard` — header row, optional two-line description, and a
// bottom-anchored meta footer.
//
// The stretch rule is the whole point of this component: the card is a column
// flex container, the description slot is `flex: 1`, and the footer follows. A
// card with no description still gets the flexible slot (as an empty spacer), so
// in a row where its sibling has two lines of description, the free space opens
// *between the header and the footer* and the two footers land on the same line.
//
// §12.3: pinned cards are the tightest of the three card types — the smallest
// internal padding on the screen.
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    // fills the grid row's height, which the `<li>` stretches to (§6).
    flexGrow: 1,
    boxSizing: 'border-box',
    // §16.1 — card fill and page background are the same value.
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    // §16.10 — no elevation, no shadow. §13: hover changes nothing here either,
    // so there is deliberately no `:hover` rule on this card.
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalL,
    rowGap: tokens.spacingVerticalS,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  repoGlyph: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
  },
  // §9.1 — accent, bold, type/body. §13 hover: an underline appears and the
  // colour does not change, so both states pin the same colour.
  repoLink: {
    minWidth: 0,
    color: tokens.colorBrandForegroundLink,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    fontWeight: tokens.fontWeightSemibold,
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
  // §9.1 — an outline chip: fully rounded, transparent fill, hairline outline,
  // muted label. Never Fluent's filled `Badge`.
  visibilityPill: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusCircular,
    paddingBlock: tokens.spacingVerticalXXS,
    paddingInline: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  // §16.9 — present at rest on every card. `auto` margin, not a spacer element,
  // parks it at the header row's right end.
  dragHandle: {
    flexShrink: 0,
    marginInlineStart: 'auto',
    display: 'inline-flex',
    color: tokens.colorNeutralForeground2,
  },
  // §9.1 — type/small, muted, clamped to two lines. The flexible slot.
  description: {
    flexGrow: 1,
    marginBlock: 0,
    minWidth: 0,
    color: tokens.colorNeutralForeground2,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  // the same flexible slot when there is no description (§9.1 stretch rule).
  // It reserves no space of its own — it only absorbs whatever the row has spare.
  spacer: {
    flexGrow: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalL,
    minWidth: 0,
  },
  metaGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground2,
  },
  // §17 — the dot's colour arrives as data, so only its geometry is tokenised.
  // 10px is a component intrinsic size, which fluent does not tokenise.
  languageDot: {
    flexShrink: 0,
    width: '10px',
    height: '10px',
    borderRadius: tokens.borderRadiusCircular,
  },
  // the standard clip idiom; its 1px box is geometry, not a spacing value.
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
})

export interface PinnedRepoCardProps {
  repo: PinnedRepo
  /** §9.1 — owner view only; a visitor's card carries no drag handle. */
  isOwner: boolean
}

export function PinnedRepoCard({ repo, isOwner }: PinnedRepoCardProps) {
  const styles = useStyles()
  const nameId = useId('pinned-repo-')

  const visibilityLabel = repo.visibility === 'public' ? 'Public' : 'Private'
  // §16.8 — a zero count renders nothing at all: no glyph, no "0", not a dimmed
  // one. This is a presence test, not a formatting branch.
  const hasStars = repo.stars > 0

  return (
    <article className={styles.card} aria-labelledby={nameId}>
      <div className={styles.header}>
        <Book16Regular className={styles.repoGlyph} aria-hidden />
        <Link id={nameId} href={`#/${repo.name}`} className={styles.repoLink}>
          {repo.name}
        </Link>
        <Text size={200} className={styles.visibilityPill}>
          {visibilityLabel}
        </Text>
        {isOwner ? (
          // §14 — a drag handle needs either a keyboard reorder path or an
          // explicit `aria-hidden`. There is no reorder UI in this build, so it
          // is hidden from assistive tech. An alternative reordering UI (a
          // "move up / move down" menu on each card, or a reorder dialog behind
          // "Customize your pins") is owed before drag is wired up.
          <span className={styles.dragHandle} aria-hidden>
            <ReOrderDotsVertical20Regular />
          </span>
        ) : null}
      </div>

      {/* §9.1 — omitted entirely when absent, but the flexible slot is not:
          the spacer is what bottom-anchors the footer in a stretched row. */}
      {repo.description ? (
        <Text as="p" size={200} className={styles.description}>
          {repo.description}
        </Text>
      ) : (
        <div className={styles.spacer} aria-hidden />
      )}

      {repo.language || hasStars ? (
        <div className={styles.footer}>
          {repo.language ? (
            <span className={styles.metaGroup}>
              {/* §17 — `language.color` is DATA, not a design token, so it is set
                  inline rather than added to the token set. */}
              <span
                className={styles.languageDot}
                style={{ backgroundColor: repo.language.color }}
                aria-hidden
              />
              <Text size={200}>{repo.language.name}</Text>
            </span>
          ) : null}
          {hasStars ? (
            <span className={styles.metaGroup}>
              <Star16Regular aria-hidden />
              {/* the glyph carries no text, so the visible numeral steps aside
                  and the unit is spelled out once for screen readers. */}
              <Text size={200} aria-hidden>
                {repo.stars}
              </Text>
              <span className={styles.visuallyHidden}>
                {pluralize(repo.stars, 'star', 'stars')}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
