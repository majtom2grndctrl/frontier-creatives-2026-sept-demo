import { css } from '@emotion/react'
import { tokens } from '@fluentui/react-components'
import { AppShell } from './components/AppShell'
import { DraftsCard } from './components/DraftsCard'
import { LatestPostCard } from './components/LatestPostCard'
import { OverviewSection } from './components/OverviewSection'
import { RecentPostsCard } from './components/RecentPostsCard'

// §16 stacks the latest post and drafts pair below this width. The shared
// breakpoints module tops out at lg (1024); the dashboard's own scale comes
// from the spec, so its one extra query lives here rather than in the shared file.
const pairStacks = '@media (max-width: 767px)'

// emotion carries the column because the section rhythm and the pair grid are
// responsive layout; the sections themselves are griffel.
function useStyles() {
  return {
    column: css({
      display: 'flex',
      flexDirection: 'column',
      rowGap: tokens.spacingVerticalXXL,
    }),
    // stretch keeps the two cards equal height (§14.7); drafts fills that
    // height and scrolls inside itself rather than growing the row.
    pair: css({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'stretch',
      columnGap: tokens.spacingHorizontalL,
      rowGap: tokens.spacingVerticalL,
      [pairStacks]: {
        gridTemplateColumns: '1fr',
      },
    }),
  }
}

export function PublicationDashboard() {
  const styles = useStyles()

  return (
    <div css={styles.column}>
      <OverviewSection />
      <div css={styles.pair}>
        <LatestPostCard />
        <DraftsCard />
      </div>
      <RecentPostsCard />
    </div>
  )
}

export function PublicationDashboardPage() {
  return (
    <AppShell title="Home">
      <PublicationDashboard />
    </AppShell>
  )
}
