import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ReactNode } from 'react'
import { css } from '@emotion/react'
import {
  Body1,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Subtitle1,
  tokens,
} from '@fluentui/react-components'
import { Dismiss20Regular } from '@fluentui/react-icons'
import { IconButton } from '@/features/publication/components/IconButton'
import { PaneHeader } from '@/features/publication/components/PaneHeader'
import { Sidebar, navLabel } from '@/features/publication/components/Sidebar'
import type { SelectableNavId } from '@/features/publication/components/Sidebar'
import { author, publication } from '@/features/publication/fixtures'

// §2 — the screen's two regions. The sidebar (A) is a fixed left rail at full
// viewport height on the recessed surface, and does not scroll. The content
// pane (B) is the raised surface, inset from the rail with a rounded top-left
// corner and a hairline left border; it is the scroll container, holding the
// full-width pane header (B1) and the centred content column (B2).
//
// Emotion carries this file because the shell is exactly the responsive wrapper
// case CLAUDE.md reserves it for. Sidebar and PaneHeader internals use griffel.

// §16 works in ~768 / ~1200 steps. `@/styles/breakpoints` stops at lg (1024) and
// is shared with other features, so the two layout-only widths live here.
const MEDIUM_QUERY = '(min-width: 768px)'
const WIDE_QUERY = '(min-width: 1200px)'

// layout widths are not tokenised by fluent — same reasoning as breakpoints.ts.
// §3: the full rail is roughly one-seventh of a wide desktop viewport.
const RAIL_WIDTH = '224px'
const RAIL_COLLAPSED_WIDTH = '68px'
// §2 B2: roughly half the pane width at the reference size, leaving wide gutters.
const COLUMN_MAX_WIDTH = '640px'

type LayoutMode = 'wide' | 'medium' | 'narrow'

function useMediaQuery(query: string): boolean {
  const subscribe = useMemo(
    () => (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // no dom to measure: assume the wide layout the spec is written against.
    () => true,
  )
}

/**
 * §16 — the sidebar changes structure, not just size, at each step: full rail,
 * icon rail, drawer. That is a rendering decision, so it is read in js; the
 * pane and column keep their responsive rules in css.
 */
function useLayoutMode(): LayoutMode {
  const isWide = useMediaQuery(WIDE_QUERY)
  const isMedium = useMediaQuery(MEDIUM_QUERY)
  if (isWide) return 'wide'
  return isMedium ? 'medium' : 'narrow'
}

function useStyles() {
  return {
    shell: css({
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      // §13 surface/recessed — the app background, the same value as the rail.
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    }),
    rail: css({
      flexShrink: 0,
      width: RAIL_WIDTH,
      height: '100vh',
      // §2 A: the rail does not scroll.
      overflow: 'hidden',
    }),
    railCollapsed: css({
      flexShrink: 0,
      width: RAIL_COLLAPSED_WIDTH,
      height: '100vh',
      overflow: 'hidden',
    }),
    pane: css({
      flexGrow: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      // §2 B: the pane is the scroll container; the header sticks inside it.
      overflowY: 'auto',
      // §13 surface/raised.
      backgroundColor: tokens.colorNeutralBackground1,
    }),
    paneInset: css({
      // §2 B: rounded top-left corner and a hairline left border. borderRadiusLarge
      // is a step above the card radius, which is the nearest token to the source's
      // pane corner (§0.1 substitution).
      borderTopLeftRadius: tokens.borderRadiusLarge,
      borderLeft: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    }),
    column: css({
      width: '100%',
      boxSizing: 'border-box',
      marginInline: 'auto',
      paddingInline: tokens.spacingHorizontalL,
      paddingBlock: tokens.spacingVerticalXXL,
      // §16 narrow/medium: the gutters give way before the column narrows, so the
      // max width only applies once there is room for visible gutters again.
      [`@media ${WIDE_QUERY}`]: {
        maxWidth: COLUMN_MAX_WIDTH,
        paddingInline: tokens.spacingHorizontalXL,
      },
    }),
    stub: css({
      display: 'flex',
      flexDirection: 'column',
      rowGap: tokens.spacingVerticalS,
    }),
  }
}

export interface AppShellProps {
  /** the pane title for the page in `children` (§4 left slot). */
  title: string
  /** the dashboard, rendered into the centred content column (§2 B2). */
  children: ReactNode
}

/**
 * The app shell: sidebar, pane header, and the centred content column the
 * dashboard page renders into.
 */
export function AppShell({ title, children }: AppShellProps) {
  const styles = useStyles()
  const layout = useLayoutMode()
  const [selectedId, setSelectedId] = useState<SelectableNavId>('home')
  const [isNavOpen, setNavOpen] = useState(false)

  // the drawer only exists in the narrow layout, so a resize past the breakpoint
  // closes it rather than leaving it primed to reopen on the way back down.
  useEffect(() => {
    if (layout !== 'narrow') setNavOpen(false)
  }, [layout])

  // §14.12 — picking a destination switches the selected row; anything but
  // `Home` renders a stub page.
  const handleSelect = useCallback((id: SelectableNavId) => {
    setSelectedId(id)
    setNavOpen(false)
  }, [])

  const isHome = selectedId === 'home'
  const paneTitle = isHome ? title : navLabel(selectedId)

  const sidebar = (
    <Sidebar
      publication={publication}
      selectedId={selectedId}
      onSelect={handleSelect}
      variant={layout === 'medium' ? 'rail' : 'full'}
    />
  )

  return (
    <div css={styles.shell}>
      {layout === 'wide' ? <div css={styles.rail}>{sidebar}</div> : null}
      {layout === 'medium' ? (
        <div css={styles.railCollapsed}>{sidebar}</div>
      ) : null}

      {/* §16 narrow: the rail becomes a drawer, opened from the pane header. */}
      {layout === 'narrow' ? (
        <OverlayDrawer
          position="start"
          size="small"
          open={isNavOpen}
          onOpenChange={(_, data) => setNavOpen(data.open)}
        >
          <DrawerHeader>
            <DrawerHeaderTitle
              action={
                <IconButton
                  icon={<Dismiss20Regular />}
                  label="Close navigation"
                  onClick={() => setNavOpen(false)}
                />
              }
            >
              {publication.name}
            </DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>{sidebar}</DrawerBody>
        </OverlayDrawer>
      ) : null}

      <div
        css={[styles.pane, layout !== 'narrow' ? styles.paneInset : undefined]}
      >
        <PaneHeader
          title={paneTitle}
          author={author}
          onOpenNav={
            layout === 'narrow' ? () => setNavOpen(true) : undefined
          }
        />
        <div css={styles.column}>
          {isHome ? (
            children
          ) : (
            <div css={styles.stub}>
              <Subtitle1 as="h2">{navLabel(selectedId)}</Subtitle1>
              <Body1>
                This destination is a stub — the prototype only builds out Home.
              </Body1>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
