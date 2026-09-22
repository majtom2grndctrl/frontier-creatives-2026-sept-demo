import type { ReactElement, ReactNode } from 'react'
import {
  Avatar,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components'
import {
  Add20Regular,
  Alert20Regular,
  Board20Regular,
  Book20Regular,
  Box20Regular,
  BranchFork20Regular,
  ChevronDown12Regular,
  Mail20Regular,
  Navigation20Regular,
  Person20Regular,
  Search20Regular,
  Sparkle20Regular,
  Star20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons'
import { useThemeMode } from '@/theme/AppThemeProvider'
import type { ProfileTab } from '../types'

// §3 — region A. One block on surface/raised-chrome, full viewport width,
// carrying two stacked rows with NO rule between them (§16.2, §16.17) and a
// single border/default hairline closing the bottom of the whole block.
//
// The band is the only tinted surface on the screen: the page below it is
// surface/base (§2). Nothing here is sticky (§13) — the document scrolls as one.

// §15 narrow — below this the row-1 cluster no longer fits and collapses behind
// the menu button. `@/styles/breakpoints` tops out at lg (1024), which is this
// screen's *wide* step, so this band-local width lives here (the pattern
// `features/publication/components/AppShell.tsx` uses for the same reason).
const CLUSTER_COLLAPSES = '@media (max-width: 859px)'

const useStyles = makeStyles({
  // the band's own paddingInline IS the viewport inset that row 2 aligns to —
  // deliberately not the content column below it (§3 row 2).
  band: {
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground3,
    // the one hairline in the whole band; the active tab indicator replaces it
    // for the width of that tab (see `activeTab`).
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    paddingInline: tokens.spacingHorizontalXL,
  },

  // row 1 — global header. It owns all the band's vertical padding above row 2,
  // and has no bottom border of its own (§16.2).
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
    rowGap: tokens.spacingVerticalS,
    paddingBlock: tokens.spacingVerticalM,
  },
  leftCluster: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    minWidth: 0,
  },
  rightCluster: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  // §3: bold, text/default, and pointedly NOT accent/primary — it is an
  // identity label here, not a link.
  handle: {
    color: tokens.colorNeutralForeground1,
    minWidth: 0,
  },

  // the platform mark: a circular graphic, not a button. 28px is the disc's
  // diameter — layout geometry, not a token value.
  mark: {
    width: '28px',
    height: '28px',
    flexShrink: 0,
    display: 'block',
  },
  markDisc: {
    fill: tokens.colorNeutralForeground1,
  },
  // the glyph is knocked out of the disc in the band's own tone, so the mark
  // resolves in both themes without a second colour.
  markGlyph: {
    fill: 'none',
    stroke: tokens.colorNeutralBackground3,
    // 2 is svg geometry inside a 24-unit viewBox, not a stroke token.
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },

  // §9.4 — the one icon button shared by the whole band: border/default
  // outline, transparent fill, text/muted glyph, square footprint,
  // radius/control. 32px is the square footprint — layout geometry.
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    // §13: a light background wash on hover, no movement.
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },

  // §9.4 split variant — ONE bordered container, two segments, one internal
  // vertical hairline. The container owns the outline; the segments do not.
  split: {
    display: 'inline-flex',
    alignItems: 'stretch',
    flexShrink: 0,
    boxSizing: 'border-box',
    height: '32px',
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  splitSegment: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // 32px / 24px are the two segments' footprints — layout geometry.
    minWidth: '32px',
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
    // pulled inside the container so the ring is not cropped by its corners.
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: `calc(0px - ${tokens.strokeWidthThick})`,
    },
  },
  splitActionSegment: {
    borderStartStartRadius: tokens.borderRadiusMedium,
    borderEndStartRadius: tokens.borderRadiusMedium,
  },
  splitCaretSegment: {
    minWidth: '24px',
    // the internal divider — the only rule inside the container. Written out
    // longhand because griffel rejects the `borderInlineStart` shorthand.
    borderInlineStartWidth: tokens.strokeWidthThin,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: tokens.colorNeutralStroke1,
    borderStartEndRadius: tokens.borderRadiusMedium,
    borderEndEndRadius: tokens.borderRadiusMedium,
  },

  // §3 right cluster item 3 — a bare rule, not a button. 20px is its height.
  // §15 narrow — the search field, the two split buttons, the separator and the
  // three inert notification buttons fold away; the menu button stands in for
  // them. The theme toggle and the avatar stay: the toggle is the band's one
  // live control, and hiding it would strand the page in whichever theme it
  // loaded in.
  // `contents` so the members stay direct flex children of the cluster and the
  // wrapper adds no box of its own; `none` then folds the whole group away.
  collapsible: {
    display: 'contents',
    [CLUSTER_COLLAPSES]: {
      display: 'none',
    },
  },
  separator: {
    flexShrink: 0,
    width: tokens.strokeWidthThin,
    height: '20px',
    backgroundColor: tokens.colorNeutralStroke1,
    marginInline: tokens.spacingHorizontalXXS,
  },

  // §3 right cluster item 1 — the search field reads as an inset of the tone
  // the band already uses, so the border is what makes it legible. 240px is
  // the field's resting width — layout geometry.
  searchField: {
    width: '240px',
    maxWidth: '100%',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    // §14 requires 4.5:1, so the placeholder sits on text/muted rather than
    // fluent's lighter default.
    '& input::placeholder': {
      color: tokens.colorNeutralForeground2,
    },
  },
  fieldGlyph: {
    display: 'inline-flex',
    color: tokens.colorNeutralForeground2,
  },
  // the key-cap chip: a small bordered rounded rect around one character.
  // 16px square is the cap's footprint — layout geometry.
  keyCap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '16px',
    height: '16px',
    paddingInline: tokens.spacingHorizontalXXS,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusSmall,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },

  // row 2 — the profile tab bar. No vertical padding of its own: its bottom
  // edge has to meet the band's closing hairline so the active indicator can
  // land on that exact line.
  tabList: {
    display: 'flex',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    // §16.17: tabs are spaced, never separated — there is no rule between them.
    columnGap: tokens.spacingHorizontalXXS,
  },
  tabLink: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
    boxSizing: 'border-box',
    paddingInline: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalS,
    // §3: inactive tabs are text/default at regular weight — NOT muted.
    color: tokens.colorNeutralForeground1,
    textDecorationLine: 'none',
    borderStartStartRadius: tokens.borderRadiusMedium,
    borderStartEndRadius: tokens.borderRadiusMedium,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      textDecorationLine: 'none',
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: `calc(0px - ${tokens.strokeWidthThick})`,
    },
  },
  tabGlyph: {
    display: 'inline-flex',
    color: tokens.colorNeutralForeground2,
  },
  // the indicator spans only this tab's own box — from just before its glyph
  // to just past its label — and is dropped one hairline so it sits on, and
  // replaces, the band's closing border. accent/attention is a different hue
  // from accent/primary, which is what §16.27 is about.
  activeTab: {
    '::after': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0,
      insetInlineEnd: 0,
      insetBlockEnd: `calc(0px - ${tokens.strokeWidthThin})`,
      height: tokens.strokeWidthThick,
      backgroundColor: tokens.colorPaletteDarkOrangeBorderActive,
    },
  },
  tabLabel: {
    color: tokens.colorNeutralForeground1,
  },

  // §9.5 — the count badge: fully rounded, surface/recessed fill (one step
  // deeper than the band it sits on), text/default numerals at type/small.
  // 18px min-width keeps one- and two-digit counts on the same footprint.
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    paddingInline: tokens.spacingHorizontalXS,
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: tokens.borderRadiusCircular,
    color: tokens.colorNeutralForeground1,
  },
})

/**
 * §9.4 — the band's icon button. Local on purpose: the publication feature's
 * `IconButton` is a subtle fluent `Button` with no outline, and §3 wants every
 * control in this band bordered and square. Do not swap one for the other.
 */
function BandIconButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactElement
  label: string
  onClick?: () => void
}) {
  const styles = useStyles()

  return (
    <button
      type="button"
      className={styles.iconButton}
      aria-label={label}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}

/**
 * §9.4 split variant — an action segment and a caret segment sharing one
 * bordered container. The caret is a real `MenuTrigger`; the items behind it
 * are inert stubs, since everything they would open is out of scope (§0).
 */
function BandSplitButton({
  icon,
  actionLabel,
  menuLabel,
  items,
}: {
  icon: ReactElement
  actionLabel: string
  menuLabel: string
  items: string[]
}) {
  const styles = useStyles()

  return (
    <div className={styles.split}>
      <button
        type="button"
        className={mergeClasses(styles.splitSegment, styles.splitActionSegment)}
        aria-label={actionLabel}
      >
        {icon}
      </button>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <button
            type="button"
            className={mergeClasses(
              styles.splitSegment,
              styles.splitCaretSegment,
            )}
            aria-label={menuLabel}
          >
            <ChevronDown12Regular />
          </button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {items.map((item) => (
              <MenuItem key={item}>{item}</MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  )
}

/** §9.5 — used by the tab bar and nowhere else. */
function CountBadge({ children }: { children: ReactNode }) {
  const styles = useStyles()

  // type/small (§12.2). The anchor carries the spoken count via `aria-label`,
  // so the numerals themselves need no extra announcement.
  return (
    <Text size={200} weight="regular" className={styles.countBadge}>
      {children}
    </Text>
  )
}

/**
 * The leading glyph for each tab, keyed by `ProfileTab.id`. Outline weight
 * throughout (§3 row 2); an unknown id falls back to the repository glyph
 * rather than rendering a hole in the strip.
 */
const TAB_GLYPHS: Record<string, ReactElement | undefined> = {
  overview: <Person20Regular />,
  repositories: <Book20Regular />,
  projects: <Board20Regular />,
  packages: <Box20Regular />,
  stars: <Star20Regular />,
}

export interface ChromeBandProps {
  /** the profile handle, shown bold beside the platform mark (§3 row 1). */
  handle: string
  /** the tab strip, in order. `count` absent => no badge (§16.3). */
  tabs: ProfileTab[]
  /** the id of the tab marked `aria-current="page"` (§14). */
  activeTabId: string
}

export function ChromeBand({ handle, tabs, activeTabId }: ChromeBandProps) {
  const styles = useStyles()
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <header role="banner" className={styles.band}>
      {/* row 1 — global header. */}
      <div className={styles.headerRow}>
        <div className={styles.leftCluster}>
          <BandIconButton
            icon={<Navigation20Regular />}
            label="Open global navigation"
          />

          {/* the platform mark: decorative, circular, and not a control. */}
          <svg
            className={styles.mark}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="12" className={styles.markDisc} />
            <path
              d="M9.8 8.4 6.4 12l3.4 3.6M14.2 8.4 17.6 12l-3.4 3.6"
              className={styles.markGlyph}
            />
          </svg>

          <Text size={300} weight="semibold" className={styles.handle} truncate>
            {handle}
          </Text>
        </div>

        <div className={styles.rightCluster}>
          <div className={styles.collapsible}>
          {/* 1 — a real focusable text input; the key-cap rides as trailing
              content because a native placeholder cannot carry markup. */}
          <Input
            appearance="outline"
            className={styles.searchField}
            aria-label="Search this platform"
            placeholder="Search or jump to…"
            contentBefore={
              <span className={styles.fieldGlyph} aria-hidden="true">
                <Search20Regular />
              </span>
            }
            contentAfter={
              <span className={styles.keyCap} aria-hidden="true">
                /
              </span>
            }
          />

          {/* 2 */}
          <BandSplitButton
            icon={<Sparkle20Regular />}
            actionLabel="Open assistant"
            menuLabel="Assistant options"
            items={['Ask about this profile', 'Summarise recent activity']}
          />

          {/* 3 — a bare rule, not a button (§3). */}
          <span className={styles.separator} aria-hidden="true" />

          {/* 4 */}
          <BandSplitButton
            icon={<Add20Regular />}
            actionLabel="Create new"
            menuLabel="Create menu"
            items={['New repository', 'Import repository', 'New project']}
          />
          </div>

          {/* 5 — four standalone icon buttons. The first is the theme toggle:
              this screen mounts outside the app's root layout, so it is the
              only theme control on the page and has to be live. The other
              three are inert notification-style glyphs. */}
          <BandIconButton
            icon={isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
            label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleMode}
          />
          <div className={styles.collapsible}>
            <BandIconButton icon={<Alert20Regular />} label="Notifications" />
            <BandIconButton icon={<BranchFork20Regular />} label="Pull requests" />
            <BandIconButton icon={<Mail20Regular />} label="Inbox" />
          </div>

          {/* 6 — the viewer's avatar: circular, no border, no button chrome. */}
          <Avatar size={28} name={handle} aria-label={`Signed in as ${handle}`} />
        </div>
      </div>

      {/* row 2 — profile tab bar. Tabs are links to distinct URLs, not ARIA
          tabs (§14), so this is a nav landmark and a list of anchors rather
          than fluent's `TabList` — `Tab`'s root is a `<button>`. The hrefs are
          stubs: the other profile tabs are navigation targets, not screens (§0). */}
      <nav aria-label={`${handle}'s profile`}>
        <ul className={styles.tabList}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            const hasCount = tab.count !== undefined

            return (
              <li key={tab.id}>
                <a
                  href="#"
                  className={mergeClasses(
                    styles.tabLink,
                    isActive && styles.activeTab,
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  // §14: the count belongs to the link's accessible name —
                  // "Repositories, 26".
                  aria-label={hasCount ? `${tab.label}, ${tab.count}` : undefined}
                >
                  <span className={styles.tabGlyph} aria-hidden="true">
                    {TAB_GLYPHS[tab.id] ?? <Book20Regular />}
                  </span>
                  <Text
                    size={300}
                    weight={isActive ? 'semibold' : 'regular'}
                    className={styles.tabLabel}
                  >
                    {tab.label}
                  </Text>
                  {/* §16.3: only tabs that carry a count get a badge — Projects
                      and Packages render nothing here, not a zero. */}
                  {hasCount ? <CountBadge>{tab.count}</CountBadge> : null}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
