import type { ReactElement } from 'react'
import {
  Avatar,
  Body1,
  Caption1,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components'
import {
  Add20Regular,
  ArrowUpRight16Regular,
  DataTrending20Regular,
  Home20Filled,
  Home20Regular,
  Money20Regular,
  People20Regular,
  Send20Regular,
  Window20Regular,
} from '@fluentui/react-icons'
import type { Publication } from '@/features/publication/types'

// §3 — region A. The rail is a *recessed* surface (the same value as the app
// background) holding, top → bottom: the publication identity card, the primary
// nav group, the solid `Create` button, and the secondary nav group.
//
// §3 again, and §18: the sidebar has NO footer. Nothing goes below `Revenue`.

/** every destination the rail can point at. `website` is an external link, never selected. */
export type NavId =
  | 'home'
  | 'website'
  | 'publish'
  | 'audience'
  | 'analytics'
  | 'revenue'

/** the ids that can become the selected row (§14.12) — `website` leaves the app. */
export type SelectableNavId = Exclude<NavId, 'website'>

interface NavItem {
  id: NavId
  label: string
  icon: ReactElement
  /** the filled counterpart, used while the row is selected. */
  selectedIcon?: ReactElement
}

const primaryNav: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home20Regular />,
    selectedIcon: <Home20Filled />,
  },
  { id: 'website', label: 'Website', icon: <Window20Regular /> },
]

const secondaryNav: NavItem[] = [
  { id: 'publish', label: 'Publish', icon: <Send20Regular /> },
  { id: 'audience', label: 'Audience', icon: <People20Regular /> },
  { id: 'analytics', label: 'Analytics', icon: <DataTrending20Regular /> },
  { id: 'revenue', label: 'Revenue', icon: <Money20Regular /> },
]

const labels: Record<NavId, string> = [...primaryNav, ...secondaryNav].reduce(
  (all, item) => ({ ...all, [item.id]: item.label }),
  {} as Record<NavId, string>,
)

/** the visible name of a destination — the shell titles its pane with it. */
export function navLabel(id: NavId): string {
  return labels[id]
}

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalM,
    minWidth: 0,
    // §3: recessed surface, one step below the content pane. In dark mode
    // background3 is darker than background1, so the relationship inverts on its own.
    backgroundColor: tokens.colorNeutralBackground3,
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalM,
    // §2 region A: the rail does not scroll at the reference height.
    overflow: 'hidden',
  },
  rootRail: {
    alignItems: 'center',
    paddingInline: tokens.spacingHorizontalS,
  },
  identity: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalSNudge,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    // §3.1: a bordered, rounded box — deliberately not a plain nav row.
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    paddingBlock: tokens.spacingVerticalSNudge,
    paddingInline: tokens.spacingHorizontalSNudge,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },
  identityRail: {
    justifyContent: 'center',
    width: 'auto',
  },
  identityName: {
    minWidth: 0,
    fontWeight: tokens.fontWeightSemibold,
  },
  group: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXXS,
  },
  // §3.4: the secondary group is separated from the button by whitespace —
  // no divider rule and no section label.
  secondaryGroup: {
    marginTop: tokens.spacingVerticalM,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalMNudge,
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: tokens.borderRadiusMedium,
    paddingBlock: tokens.spacingVerticalSNudge,
    paddingInline: tokens.spacingHorizontalMNudge,
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    fontFamily: 'inherit',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorNeutralForeground1,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },
  rowRail: {
    justifyContent: 'center',
    paddingInline: tokens.spacingHorizontalSNudge,
  },
  // §3.2: the selected row is a filled rounded row on the subtle-selected surface.
  rowSelected: {
    backgroundColor: tokens.colorSubtleBackgroundSelected,
    color: tokens.colorNeutralForeground1,
  },
  rowIcon: {
    display: 'flex',
    flexShrink: 0,
  },
  rowLabel: {
    flexGrow: 1,
    minWidth: 0,
  },
  // §3.2: the external-link arrow is pushed to the row's right edge, and is the
  // only trailing affordance in either group.
  externalIcon: {
    display: 'flex',
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  createButton: {
    width: '100%',
    justifyContent: 'center',
  },
  switcher: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
    maxWidth: '260px',
  },
})

export interface SidebarProps {
  publication: Publication
  /** the row rendered in the selected style (§3.2); exactly one at a time. */
  selectedId: SelectableNavId
  onSelect: (id: SelectableNavId) => void
  /**
   * `rail` is the §16 medium collapse: icons only, every label moved into a
   * tooltip so the row keeps its accessible name.
   */
  variant?: 'full' | 'rail'
}

export function Sidebar({
  publication,
  selectedId,
  onSelect,
  variant = 'full',
}: SidebarProps) {
  const styles = useStyles()
  const isRail = variant === 'rail'

  function renderRow(item: NavItem) {
    const isExternal = item.id === 'website'
    const isSelected = !isExternal && item.id === selectedId
    const icon = isSelected && item.selectedIcon ? item.selectedIcon : item.icon

    const inner = (
      <>
        <span className={styles.rowIcon} aria-hidden="true">
          {icon}
        </span>
        {isRail ? null : (
          <Body1 as="span" className={styles.rowLabel} truncate wrap={false}>
            {item.label}
          </Body1>
        )}
        {isExternal && !isRail ? (
          <span className={styles.externalIcon} aria-hidden="true">
            <ArrowUpRight16Regular />
          </span>
        ) : null}
      </>
    )

    const className = mergeClasses(
      styles.row,
      isRail && styles.rowRail,
      isSelected && styles.rowSelected,
    )

    // §3.2: `Website` opens the public site in a new tab, so it is a real anchor
    // and never becomes the selected row.
    const control = isExternal ? (
      <a
        className={className}
        href={`https://${publication.domain}`}
        target="_blank"
        rel="noreferrer"
        aria-label={isRail ? `${item.label} (opens in a new tab)` : undefined}
      >
        {inner}
      </a>
    ) : (
      <button
        type="button"
        className={className}
        aria-current={isSelected ? 'page' : undefined}
        aria-label={isRail ? item.label : undefined}
        onClick={() => onSelect(item.id as SelectableNavId)}
      >
        {inner}
      </button>
    )

    return (
      <li key={item.id}>
        {isRail ? (
          <Tooltip
            content={
              isExternal ? `${item.label} (opens in a new tab)` : item.label
            }
            relationship="description"
            positioning="after"
            withArrow
          >
            {control}
          </Tooltip>
        ) : (
          control
        )}
      </li>
    )
  }

  return (
    <nav
      className={mergeClasses(styles.root, isRail && styles.rootRail)}
      aria-label="Publication"
    >
      {/* §3.1 — identity card; clicking it opens the publication switcher (stub). */}
      <Popover>
        <PopoverTrigger disableButtonEnhancement>
          <button
            type="button"
            className={mergeClasses(
              styles.identity,
              isRail && styles.identityRail,
            )}
            aria-label={`${publication.name} — switch publication`}
          >
            <Avatar
              shape="square"
              size={24}
              name={publication.name}
              image={{ src: publication.avatarUrl }}
              aria-hidden="true"
            />
            {isRail ? null : (
              <Body1
                as="span"
                className={styles.identityName}
                truncate
                wrap={false}
              >
                {publication.name}
              </Body1>
            )}
          </button>
        </PopoverTrigger>
        <PopoverSurface aria-label="Switch publication">
          <div className={styles.switcher}>
            <Body1>{publication.name}</Body1>
            <Caption1>
              The publication switcher is a stub in this prototype.
            </Caption1>
          </div>
        </PopoverSurface>
      </Popover>

      {/* §3.2 — primary nav group, no section label. */}
      <ul className={styles.group}>{primaryNav.map(renderRow)}</ul>

      {/* §3.3 / §14.10 — one control: the label and the caret belong to the same
          button, which opens the create menu. */}
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          {isRail ? (
            <MenuButton
              appearance="primary"
              icon={<Add20Regular />}
              aria-label="Create"
            />
          ) : (
            <MenuButton appearance="primary" className={styles.createButton}>
              Create
            </MenuButton>
          )}
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>New post</MenuItem>
            <MenuItem>New note</MenuItem>
            <MenuItem>Import</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      {/* §3.4 — secondary nav group. Nothing renders below `Revenue` (§18). */}
      <ul className={mergeClasses(styles.group, styles.secondaryGroup)}>
        {secondaryNav.map(renderRow)}
      </ul>
    </nav>
  )
}
