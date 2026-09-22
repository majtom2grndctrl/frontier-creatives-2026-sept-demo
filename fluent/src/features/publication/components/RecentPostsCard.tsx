import {
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
  tokens,
} from '@fluentui/react-components'
import {
  ArrowUpRightRegular,
  MoreHorizontalRegular,
} from '@fluentui/react-icons'
import type { Author, Post } from '../types'
import {
  author as fixtureAuthor,
  posts as fixturePosts,
  TODAY,
} from '../fixtures'
import { displayTitle } from '../format'
import { Card } from './Card'
import { IconButton } from './IconButton'
import { PostRow } from './PostRow'

// §9 — the full-column recent posts card: §10.2's full variant, no dividers
// between rows, separation from vertical spacing alone.
//
// This is the wide context of the truncation pair: the same title that clips in
// §7's half-width card runs in full here, so the row is given as much inline
// room as the card can spare. At narrow widths `PostRow` wraps its metric stacks
// below the text block rather than shrinking them (§16).
const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    paddingBlock: tokens.spacingVerticalS,
    // one step tighter than the other cards' inline padding, which buys the
    // full-width row the width its untruncated title needs
    paddingInline: tokens.spacingHorizontalL,
  },
  // §10.2's own column gap, trimmed for the same reason
  row: {
    columnGap: tokens.spacingHorizontalM,
    // The text block is `PostRow`'s second child. Basing it on its own content
    // rather than the row's default 12rem is what keeps the §12.3 title whole
    // here: the row wraps its trailing items below (§16 already asks for that at
    // narrow widths) instead of squeezing the title. Truncation stays a layout
    // outcome — the string is never cut.
    '& > div:nth-of-type(2)': {
      flexBasis: 'max-content',
    },
  },
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
    maxWidth: '18rem',
  },
  sheetBody: {
    color: tokens.colorNeutralForeground2,
  },
})

export interface RecentPostsCardProps {
  /** defaults to the fixture's published posts, in fixture order (never sorted). */
  posts?: Post[]
  author?: Author
  /** the clock the §10.3 relative-year rule is measured against. */
  now?: string | Date
  className?: string
}

export function RecentPostsCard({
  posts = fixturePosts,
  author = fixtureAuthor,
  now = TODAY,
  className,
}: RecentPostsCardProps) {
  const styles = useStyles()

  return (
    <Card
      heading="Recent posts"
      className={className}
      bodyPadding="none"
      bodyClassName={styles.body}
      // §14.9 — the header link opens a stub sheet rather than no-opping
      headerAction={
        <Popover trapFocus withArrow>
          <PopoverTrigger disableButtonEnhancement>
            <Link as="button" appearance="subtle">
              View all
            </Link>
          </PopoverTrigger>
          <PopoverSurface aria-label="All posts">
            <div className={styles.sheet}>
              <Text weight="semibold">All posts</Text>
              <Text size={200} className={styles.sheetBody}>
                The full archive lives on the publish page. This prototype stops
                at the three most recent.
              </Text>
            </div>
          </PopoverSurface>
        </Popover>
      }
    >
      {posts.map((post) => {
        const title = displayTitle(post.title)

        return (
          <PostRow
            key={post.id}
            post={post}
            author={author}
            variant="full"
            now={now}
            className={styles.row}
            openSlot={
              <Popover trapFocus withArrow>
                <PopoverTrigger disableButtonEnhancement>
                  <IconButton
                    icon={<ArrowUpRightRegular />}
                    label={`Open ${title}`}
                    tooltip="Open the post"
                  />
                </PopoverTrigger>
                <PopoverSurface aria-label={`Open ${title}`}>
                  <div className={styles.sheet}>
                    <Text weight="semibold">{title}</Text>
                    <Text size={200} className={styles.sheetBody}>
                      The post opens in the editor. This prototype stops at the
                      dashboard.
                    </Text>
                  </div>
                </PopoverSurface>
              </Popover>
            }
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
                    <MenuItem>View stats</MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            }
          />
        )
      })}
    </Card>
  )
}
