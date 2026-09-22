import { useState } from 'react'
import {
  Button,
  Link,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components'
import {
  CopyRegular,
  MoreHorizontalRegular,
  ShareRegular,
} from '@fluentui/react-icons'
import type { Author, Post, Publication } from '../types'
import {
  author as fixtureAuthor,
  publication as fixturePublication,
  latestPost,
  TODAY,
} from '../fixtures'
import {
  displayTitle,
  formatCount,
  formatPercent,
  formatSignedCount,
} from '../format'
import { Card } from './Card'
import { IconButton } from './IconButton'
import { PostRow } from './PostRow'

// §7 — the latest post card. An attached-heading card (§5.1) whose body is three
// blocks separated by hairline dividers: the §10.2 post row in its compact
// variant, a metric list, and the tonal `Share post` button.
//
// The card is deliberately half-column wide, which is what makes the §12.3 title
// truncate here and run in full in the §9 full-width row — truncation is a
// layout outcome, never baked into the string.
const useStyles = makeStyles({
  // the two-column row of §5 stretches its cells; filling the cell keeps this
  // card and Drafts the same height.
  card: {
    height: '100%',
  },
  block: {
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalXL,
  },
  divided: {
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  // the post row carries its own vertical padding, so the block only pads inline
  summaryBlock: {
    paddingBlock: tokens.spacingVerticalS,
  },
  // §7.3 — label/value pairs with generous rhythm and no dividers between them
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalL,
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: tokens.spacingVerticalS,
  },
  metricRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
  },
  // `Text` cannot render as `dt`/`dd`, so the body typography role is applied
  // from tokens here instead (the same approach `PostRow`'s metric stacks take).
  metricText: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
  },
  metricLabel: {
    color: tokens.colorNeutralForeground2,
  },
  metricValue: {
    marginInlineStart: 0,
    textAlign: 'end',
    color: tokens.colorNeutralForeground1,
  },
  // §7.4 — tonal accent, visibly not the sidebar's solid `Create` button
  shareButton: {
    width: '100%',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    border: 'none',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
      color: tokens.colorBrandForeground2Hover,
    },
    ':hover:active': {
      backgroundColor: tokens.colorBrandBackground2Pressed,
      color: tokens.colorBrandForeground2Pressed,
    },
  },
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: tokens.spacingVerticalM,
    maxWidth: '18rem',
  },
  sheetUrl: {
    color: tokens.colorNeutralForeground3,
    wordBreak: 'break-all',
  },
  statsSheet: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
    maxWidth: '18rem',
  },
  statsLine: {
    color: tokens.colorNeutralForeground2,
  },
})

export interface LatestPostCardProps {
  /** defaults to the fixture's latest post — the same record as §12.5's first row. */
  post?: Post
  author?: Author
  /** the publication whose domain builds the share url. */
  publication?: Publication
  /** the clock the §10.3 relative-year rule is measured against. */
  now?: string | Date
  className?: string
}

export function LatestPostCard({
  post = latestPost,
  author = fixtureAuthor,
  publication = fixturePublication,
  now = TODAY,
  className,
}: LatestPostCardProps) {
  const styles = useStyles()
  const [copied, setCopied] = useState(false)

  const title = displayTitle(post.title)
  const stats = post.stats
  const shareUrl = `https://${publication.domain}/p/${post.id}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      // clipboard access can be denied; the url stays visible to copy by hand
      setCopied(false)
    }
  }

  return (
    <Card
      heading="Latest post"
      className={mergeClasses(styles.card, className)}
      bodyPadding="none"
      // §14.9 — the header link opens a stub sheet rather than no-opping
      headerAction={
        <Popover trapFocus withArrow>
          <PopoverTrigger disableButtonEnhancement>
            <Link as="button" appearance="subtle">
              View stats
            </Link>
          </PopoverTrigger>
          <PopoverSurface aria-label={`Stats for ${title}`}>
            <div className={styles.statsSheet}>
              <Text weight="semibold">{title}</Text>
              <Text size={200} className={styles.statsLine}>
                Full post analytics live on the stats page. This prototype stops
                at the summary below.
              </Text>
            </div>
          </PopoverSurface>
        </Popover>
      }
    >
      <div className={mergeClasses(styles.block, styles.summaryBlock, styles.divided)}>
        <PostRow
          post={post}
          author={author}
          variant="compact"
          now={now}
          overflowSlot={
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <IconButton
                  icon={<MoreHorizontalRegular />}
                  label={`More actions for ${title}`}
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem>Edit post</MenuItem>
                  <MenuItem>Copy link</MenuItem>
                  <MenuItem>Unpublish</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          }
        />
      </div>

      {stats ? (
        <dl className={mergeClasses(styles.block, styles.metricList, styles.divided)}>
          <div className={styles.metricRow}>
            <dt className={mergeClasses(styles.metricText, styles.metricLabel)}>
              Total views
            </dt>
            <dd className={mergeClasses(styles.metricText, styles.metricValue)}>
              {formatCount(stats.views)}
            </dd>
          </div>
          <div className={styles.metricRow}>
            <dt className={mergeClasses(styles.metricText, styles.metricLabel)}>
              New subscribers
            </dt>
            {/* rendered with an explicit `+` sign (§7.3) */}
            <dd className={mergeClasses(styles.metricText, styles.metricValue)}>
              {formatSignedCount(stats.newSubscribers)}
            </dd>
          </div>
          <div className={styles.metricRow}>
            <dt className={mergeClasses(styles.metricText, styles.metricLabel)}>
              Open rate
            </dt>
            {/* two decimals here, none in the §9 column — one record, two precisions */}
            <dd className={mergeClasses(styles.metricText, styles.metricValue)}>
              {formatPercent(stats.openRate, 2)}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className={styles.block}>
        {/* §14.8 — a stub share sheet with a copy-link action */}
        <Popover
          trapFocus
          withArrow
          onOpenChange={(_, data) => {
            if (!data.open) setCopied(false)
          }}
        >
          <PopoverTrigger disableButtonEnhancement>
            <Button
              appearance="transparent"
              className={styles.shareButton}
              icon={<ShareRegular />}
            >
              Share post
            </Button>
          </PopoverTrigger>
          <PopoverSurface aria-label="Share post">
            <div className={styles.sheet}>
              <Text weight="semibold">Share this post</Text>
              <Text size={200} className={styles.sheetUrl}>
                {shareUrl}
              </Text>
              <Button icon={<CopyRegular />} onClick={copyLink}>
                {copied ? 'Link copied' : 'Copy link'}
              </Button>
            </div>
          </PopoverSurface>
        </Popover>
      </div>
    </Card>
  )
}
