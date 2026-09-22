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
  mergeClasses,
  tokens,
} from '@fluentui/react-components'
import { MoreHorizontalRegular } from '@fluentui/react-icons'
import type { Post } from '../types'
import { drafts as fixtureDrafts, TODAY } from '../fixtures'
import { displayTitle, formatDateTime } from '../format'
import { Card } from './Card'
import { Chip } from './Chip'
import { IconButton } from './IconButton'

// §8 — the drafts card. Equal in height to §7's latest post card, with a list
// that scrolls *inside* it and clips its last row.
//
// How the height is bounded: the component renders a frame that takes part in
// the parent's two-column row, and the card fills that frame absolutely. Being
// out of flow, the list's height can never feed back into the row, so the row is
// sized by the latest post card alone and this card "does not grow to fit the
// list" (§8.2, §14.7). The frame's min-height only matters when the card is
// alone in its row — the narrow, stacked layout of §16 — where there is no
// neighbour to take the height from.
const useStyles = makeStyles({
  frame: {
    position: 'relative',
    minWidth: 0,
    // fills the row's height when the parent stretches its cells, whether this
    // frame is the grid item itself or sits inside one
    height: '100%',
    // no design token describes a layout height; deliberately short of the
    // latest post card so it never drives the side-by-side row's height.
    minHeight: '17rem',
  },
  card: {
    position: 'absolute',
    inset: 0,
  },
  // the card body is the scroll region: it takes the height the header leaves
  // and scrolls, rather than stretching the card.
  scroller: {
    overflowY: 'auto',
    paddingInline: tokens.spacingHorizontalXL,
  },
  list: {
    listStyleType: 'none',
    marginBlock: 0,
    marginInline: 0,
    paddingInline: 0,
    paddingBlock: tokens.spacingVerticalS,
  },
  // no dividers between rows (§8.3) — separation is spacing alone. The roomy
  // rhythm of §13 is also what makes five rows outrun the card's height, which
  // is the point: the list scrolls and clips its last row (§8.2).
  row: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalXL,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXXS,
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  edited: {
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
    flexShrink: 0,
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

export interface DraftsCardProps {
  /** defaults to the fixture, in fixture order — never sorted (§8.4). */
  drafts?: Post[]
  /** the clock the §10.3 relative-year rule is measured against. */
  now?: string | Date
  className?: string
}

export function DraftsCard({
  drafts = fixtureDrafts,
  now = TODAY,
  className,
}: DraftsCardProps) {
  const styles = useStyles()

  return (
    <div className={mergeClasses(styles.frame, className)}>
      <Card
        heading="Drafts"
        className={styles.card}
        bodyPadding="none"
        bodyClassName={styles.scroller}
        // §14.9 — the header link opens a stub sheet rather than no-opping
        headerAction={
          <Popover trapFocus withArrow>
            <PopoverTrigger disableButtonEnhancement>
              <Link as="button" appearance="subtle">
                View all
              </Link>
            </PopoverTrigger>
            <PopoverSurface aria-label="All drafts">
              <div className={styles.sheet}>
                <Text weight="semibold">All drafts</Text>
                <Text size={200} className={styles.sheetBody}>
                  The full drafts list lives on the publish page. This prototype
                  stops at the five most recent.
                </Text>
              </div>
            </PopoverSurface>
          </Popover>
        }
      >
        <ul className={styles.list}>
          {drafts.map((draft) => {
            // an empty title renders the literal `Untitled` as real text, in the
            // same style as a real title (§8.3) — not italic, not muted.
            const title = displayTitle(draft.title)

            return (
              <li key={draft.id} className={styles.row}>
                <div className={styles.text}>
                  <Text
                    block
                    truncate
                    wrap={false}
                    weight="semibold"
                    className={styles.title}
                  >
                    {title}
                  </Text>
                  {draft.editedAt ? (
                    <Text block size={200} className={styles.edited}>
                      {`Edited ${formatDateTime(draft.editedAt, now)}`}
                    </Text>
                  ) : null}
                </div>
                <div className={styles.actions}>
                  <Chip>Draft</Chip>
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <IconButton
                        icon={<MoreHorizontalRegular />}
                        label={`More actions for ${title}`}
                      />
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem>Continue editing</MenuItem>
                        <MenuItem>Duplicate</MenuItem>
                        <MenuItem>Delete draft</MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
