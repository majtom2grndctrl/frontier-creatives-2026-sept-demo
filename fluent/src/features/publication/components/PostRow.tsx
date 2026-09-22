import type { ReactNode } from 'react'
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import {
  ArrowUpRightRegular,
  CommentRegular,
  HeartRegular,
  MoreHorizontalRegular,
  TextBulletListLtrRegular,
} from '@fluentui/react-icons'
import type { Author, Post } from '../types'
import {
  displayTitle,
  formatCount,
  formatDate,
  formatDateTime,
  formatPercent,
  postAccessibleName,
} from '../format'
import { IconButton } from './IconButton'

// §10.2 — one post row with two variants.
//
// Truncation is a layout outcome, never baked into the string: both variants use
// the same single-line ellipsis, so the §12.3 title clips in the half-width
// compact card and shows in full in the full-width row.
const useStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    columnGap: tokens.spacingHorizontalL,
    rowGap: tokens.spacingVerticalM,
    flexWrap: 'wrap',
    minWidth: 0,
    paddingBlock: tokens.spacingVerticalM,
  },
  // fixed landscape thumbnail. No token describes a component's intrinsic size,
  // so these two values are literal by necessity (see CLAUDE.md).
  thumbnail: {
    width: '72px',
    height: '48px',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusMedium,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground4,
  },
  cover: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
  },
  // a post with no cover: neutral tint plus a centred muted "lines of text" glyph
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase400,
  },
  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXXS,
    flexGrow: 1,
    flexBasis: '12rem',
    minWidth: 0,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
  engagement: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXXS,
    color: tokens.colorNeutralForeground3,
  },
  engagementItem: {
    display: 'inline-flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXXS,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
  stacks: {
    display: 'flex',
    alignItems: 'flex-start',
    columnGap: tokens.spacingHorizontalL,
    marginBlock: 0,
    marginInline: 0,
    flexShrink: 0,
  },
  // dt before dd keeps the html valid and the reading order label-then-value;
  // column-reverse puts the value above the label as §10.2 draws it.
  stack: {
    display: 'flex',
    flexDirection: 'column-reverse',
    width: '56px',
    minWidth: '56px',
  },
  stackLabel: {
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase100,
    lineHeight: tokens.lineHeightBase100,
  },
  stackValue: {
    marginInlineStart: 0,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
})

export interface PostRowProps {
  post: Post
  author: Author
  /** `compact` is §7's summary row; `full` is §9's row with metric stacks. */
  variant?: 'full' | 'compact'
  /** the clock the relative-year date rule is measured against (§10.3). */
  now?: string | Date
  /** the ↗ open-in-place button, full variant only. */
  onOpenClick?: () => void
  onOverflowClick?: () => void
  /** replace the default ↗ button, e.g. to hang a menu off it. */
  openSlot?: ReactNode
  /** replace the default `⋯` button, e.g. with a `MenuTrigger`-wrapped one. */
  overflowSlot?: ReactNode
  className?: string
}

export function PostRow({
  post,
  author,
  variant = 'full',
  now,
  onOpenClick,
  onOverflowClick,
  openSlot,
  overflowSlot,
  className,
}: PostRowProps) {
  const styles = useStyles()

  const title = displayTitle(post.title)
  const dateText = post.publishedAt
    ? formatDate(post.publishedAt, now)
    : post.editedAt
      ? formatDateTime(post.editedAt, now)
      : ''

  const stats = post.stats

  return (
    <article
      className={mergeClasses(styles.row, className)}
      // §15 — one accessible name combining title, date and author
      aria-label={postAccessibleName(post.title, dateText, author.name)}
    >
      <div className={styles.thumbnail}>
        {post.coverUrl ? (
          <img className={styles.cover} src={post.coverUrl} alt="" />
        ) : (
          <span className={styles.placeholder}>
            <TextBulletListLtrRegular aria-hidden />
          </span>
        )}
      </div>

      <div className={styles.textBlock}>
        <Text
          block
          truncate
          wrap={false}
          weight="semibold"
          className={styles.title}
        >
          {title}
        </Text>
        <Text block truncate wrap={false} size={200} className={styles.meta}>
          {dateText ? `${dateText} • ${author.name}` : author.name}
        </Text>
        <div className={styles.engagement}>
          {/* zero counts still render rather than collapsing (§10.2) */}
          <span
            className={styles.engagementItem}
            aria-label={`${post.likes} likes`}
          >
            <HeartRegular aria-hidden />
            {formatCount(post.likes)}
          </span>
          <span
            className={styles.engagementItem}
            aria-label={`${post.comments} comments`}
          >
            <CommentRegular aria-hidden />
            {formatCount(post.comments)}
          </span>
        </div>
      </div>

      {variant === 'full' && stats ? (
        <dl className={styles.stacks}>
          <div className={styles.stack}>
            <dt className={styles.stackLabel}>Subs</dt>
            <dd className={styles.stackValue}>
              {formatCount(stats.newSubscribers)}
            </dd>
          </div>
          <div className={styles.stack}>
            <dt className={styles.stackLabel}>Views</dt>
            <dd className={styles.stackValue}>{formatCount(stats.views)}</dd>
          </div>
          <div className={styles.stack}>
            <dt className={styles.stackLabel}>Opened</dt>
            <dd className={styles.stackValue}>
              {formatPercent(stats.openRate)}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className={styles.actions}>
        {variant === 'full'
          ? (openSlot ?? (
              <IconButton
                icon={<ArrowUpRightRegular />}
                label={`Open ${title}`}
                onClick={onOpenClick}
              />
            ))
          : null}
        {overflowSlot ?? (
          <IconButton
            icon={<MoreHorizontalRegular />}
            label={`More actions for ${title}`}
            onClick={onOverflowClick}
          />
        )}
      </div>
    </article>
  )
}
