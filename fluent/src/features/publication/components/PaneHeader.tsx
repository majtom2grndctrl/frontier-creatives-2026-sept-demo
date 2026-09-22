import type { ReactElement } from 'react'
import {
  Avatar,
  Body1,
  Caption1,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import {
  Alert20Regular,
  Chat20Regular,
  ChevronDown12Filled,
  Navigation20Regular,
  Search20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons'
import { IconButton } from '@/features/publication/components/IconButton'
import type { Author } from '@/features/publication/types'
import { useThemeMode } from '@/theme/AppThemeProvider'

// §4 — region B1. Page title left, icon cluster right, hairline bottom divider,
// and it spans the *full* pane width — it is not constrained to the content
// column (§18). §4 also assumes it stays put while the column scrolls beneath
// it, so it is sticky and the divider carries the seam.

const useStyles = makeStyles({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalL,
    boxSizing: 'border-box',
    width: '100%',
    // opaque, because the content column scrolls underneath it.
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalXL,
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  title: {
    marginBlock: 0,
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  // §4: the four icon buttons are evenly spaced and share one size.
  cluster: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  // §4.5: a circular avatar with a small caret badge overlapping its
  // bottom-right corner, so it reads as a menu trigger.
  account: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginInlineStart: tokens.spacingHorizontalS,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: tokens.borderRadiusCircular,
    cursor: 'pointer',
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },
  caretBadge: {
    position: 'absolute',
    insetInlineEnd: `calc(0px - ${tokens.spacingHorizontalXXS})`,
    insetBlockEnd: `calc(0px - ${tokens.spacingVerticalXXS})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusCircular,
    color: tokens.colorNeutralForeground2,
  },
  stub: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
    maxWidth: '280px',
  },
})

export interface PaneHeaderProps {
  /** the page title, in the §13 page-title type step. */
  title: string
  /** the signed-in author, for the §4.5 account avatar. */
  author: Author
  /**
   * Opens the navigation drawer. The shell passes it only in the narrow §16
   * layout, where the sidebar is a drawer; the button is absent otherwise.
   */
  onOpenNav?: () => void
}

/**
 * §14.9 — a header control that has nothing real behind it still has to open
 * something, so each one gets a stub popover rather than a silent no-op.
 */
function StubPopover({
  icon,
  label,
  body,
}: {
  icon: ReactElement
  label: string
  body: string
}) {
  const styles = useStyles()

  return (
    <Popover>
      <PopoverTrigger disableButtonEnhancement>
        <IconButton icon={icon} label={label} />
      </PopoverTrigger>
      <PopoverSurface aria-label={label}>
        <div className={styles.stub}>
          <Body1>{label}</Body1>
          <Caption1>{body}</Caption1>
        </div>
      </PopoverSurface>
    </Popover>
  )
}

export function PaneHeader({ title, author, onOpenNav }: PaneHeaderProps) {
  const styles = useStyles()
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        {onOpenNav ? (
          <IconButton
            icon={<Navigation20Regular />}
            label="Open navigation"
            onClick={onOpenNav}
          />
        ) : null}
        <Title3 as="h1" className={styles.title} truncate wrap={false}>
          {title}
        </Title3>
      </div>

      <div className={styles.cluster}>
        {/* §14.11 — the theme toggle; every §13 role resolves in both themes. */}
        <IconButton
          icon={isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
          label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleMode}
        />
        <StubPopover
          icon={<Search20Regular />}
          label="Search"
          body="Search is a stub in this prototype."
        />
        <StubPopover
          icon={<Chat20Regular />}
          label="Messages"
          body="You have no new messages."
        />
        <StubPopover
          icon={<Alert20Regular />}
          label="Notifications"
          body="You have no new notifications."
        />

        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <button
              type="button"
              className={styles.account}
              aria-label={`Account menu for ${author.name}`}
            >
              <Avatar
                size={32}
                name={author.name}
                image={{ src: author.avatarUrl }}
                aria-hidden="true"
              />
              <span className={styles.caretBadge} aria-hidden="true">
                <ChevronDown12Filled />
              </span>
            </button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </header>
  )
}
