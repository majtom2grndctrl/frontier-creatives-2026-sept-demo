import { useCallback, useMemo, useState } from 'react'
import { css } from '@emotion/react'
import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  tokens,
} from '@fluentui/react-components'
import { ChevronDown16Regular } from '@fluentui/react-icons'
import { useThemeMode } from '@/theme/AppThemeProvider'
import { ActivityOverview } from './components/ActivityOverview'
import { ActivityTimeline } from './components/ActivityTimeline'
import { ChromeBand } from './components/ChromeBand'
import { ContributionHeatmap } from './components/ContributionHeatmap'
import { ContributionsCard } from './components/ContributionsCard'
import { FooterNote } from './components/FooterNote'
import { PinnedGrid } from './components/PinnedGrid'
import { ProfileSidebar } from './components/ProfileSidebar'
import { ReadmeCard } from './components/ReadmeCard'
import { YearRail } from './components/YearRail'
import { profile } from './fixtures'
import { contributionsHeading } from './format'
import { contributionRampVars } from './palette'
import type {
  ActivityOverview as ActivityOverviewData,
  ContributionYear,
  TimelineMonth,
} from './types'

// The developer profile overview screen.
//
// This page brings its own full-bleed chrome band, so it mounts *outside* the
// app's `RootLayout` rather than nesting a second header inside it — the same
// arrangement the publication dashboard uses, and the reason the theme toggle
// lives in the chrome band's icon cluster instead of the app header.
//
// §2 is the composition to preserve, and two of its facts are easy to get wrong:
//
//  - the tint lives on the CHROME BAND, not on the page. The page below is
//    `surface/base`, the same value as every card fill (§16.1). This is the
//    inverse of the usual "tinted page, plain cards" pattern.
//  - the sidebar HUGS ITS CONTENT. `align-items: start` on region B's grid is
//    the single declaration that does it (§17); `stretch` would give the sidebar
//    the main column's height and defeat §16.4.

// §15 — only the wide layout was observed; these are the two steps below it.
// `@/styles/breakpoints` tops out at lg (1024), which is this screen's wide
// step, so the one extra width lives here rather than in the shared file.
const MEDIUM_UP = '@media (min-width: 1024px)'
const WIDE_UP = '@media (min-width: 1280px)'

// layout proportions from §2's region table, as ratios of their container.
// fluent does not tokenise layout (see `agent-docs/fluent-v9-notes.md`), so
// these literals are correct.
const SIDEBAR_RATIO = '24%'
const MAIN_RATIO = '74%'
const CONTRIBUTIONS_RATIO = '83%'
const YEAR_RAIL_RATIO = '13%'
const CONTENT_WIDTH = '82%'
const CONTENT_MAX_WIDTH = '1280px'

// emotion carries this file: every rule in it is responsive layout, which is
// exactly the case CLAUDE.md reserves emotion for. The regions themselves are
// griffel.
function useStyles() {
  return {
    page: css({
      minHeight: '100vh',
      // §16.1 — the page background and every card fill are the same value.
      backgroundColor: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
    }),
    // region B — centred, and the only thing that constrains the page's width.
    content: css({
      width: CONTENT_WIDTH,
      maxWidth: CONTENT_MAX_WIDTH,
      marginInline: 'auto',
      paddingBlock: tokens.spacingVerticalXXL,
    }),
    regionB: css({
      display: 'grid',
      gridTemplateColumns: '1fr',
      rowGap: tokens.spacingVerticalXXL,
      [MEDIUM_UP]: {
        // §17 — `start`, never `stretch`: this is what makes the sidebar end
        // after Organizations and let the page background show beneath it.
        alignItems: 'start',
        gridTemplateColumns: `${SIDEBAR_RATIO} ${MAIN_RATIO}`,
        // the remaining ~2% is region D, the gutter.
        justifyContent: 'space-between',
      },
    }),
    mainColumn: css({
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      rowGap: tokens.spacingVerticalXXL,
    }),
    // region H — a nested two-column grid. The left column spans §7.2, §8 and
    // the "Show more activity" button; the right column holds only the rail,
    // so the rail's lower entries sit alongside the timeline (§7.3).
    regionH: css({
      display: 'grid',
      gridTemplateColumns: '1fr',
      rowGap: tokens.spacingVerticalL,
      [MEDIUM_UP]: {
        alignItems: 'start',
        gridTemplateColumns: `${CONTRIBUTIONS_RATIO} ${YEAR_RAIL_RATIO}`,
        justifyContent: 'space-between',
      },
    }),
    contributionsColumn: css({
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      rowGap: tokens.spacingVerticalL,
    }),
    // §7.1 — sits *above* the card's top border, not inside it.
    contributionsHeader: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: tokens.spacingHorizontalM,
      flexWrap: 'wrap',
    }),
    contributionsHeading: css({
      marginBlock: 0,
      color: tokens.colorNeutralForeground1,
    }),
    // a menu trigger with no border and no fill (§7.1).
    settingsTrigger: css({
      display: 'inline-flex',
      alignItems: 'center',
      columnGap: tokens.spacingHorizontalXXS,
      border: 'none',
      backgroundColor: 'transparent',
      padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalXS}`,
      borderRadius: tokens.borderRadiusMedium,
      color: tokens.colorNeutralForeground2,
      fontFamily: tokens.fontFamilyBase,
      fontSize: tokens.fontSizeBase200,
      lineHeight: tokens.lineHeightBase200,
      cursor: 'pointer',
      ':hover': {
        backgroundColor: tokens.colorSubtleBackgroundHover,
      },
      ':focus-visible': {
        outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
        outlineOffset: tokens.strokeWidthThin,
      },
    }),
    // §8 — the timeline and the footer note stay in the narrower sub-column
    // (§16.24), so they are children of `contributionsColumn`, not siblings.
    timelineBlock: css({
      display: 'flex',
      flexDirection: 'column',
      rowGap: tokens.spacingVerticalL,
      marginTop: tokens.spacingVerticalXL,
    }),
    // §14 — the profile's display name is rendered inside the sidebar, which is
    // a `complementary` landmark, so it cannot also be the document's h1. The
    // page claims one here instead, so the heading outline starts at level 1 and
    // the README's own h1 can sit at level 2 beneath it.
    visuallyHidden: css({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: 0,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      borderWidth: 0,
    }),
    wideOnly: css({
      [WIDE_UP]: {
        // the content column only reaches its full ratio once there is room for
        // visible gutters; below that it keeps the percentage width.
        paddingInline: 0,
      },
    }),
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * §13 — a year with no contributions: the full grid at level 0, the legend
 * kept, and the heading reading "No contributions in <year>".
 *
 * The fixture only carries 2026, so every other year in the rail resolves to
 * this. That is the honest rendering rather than inventing history, and it
 * exercises two of §13's prescribed empty states (the zero-contribution grid
 * and the empty timeline) instead of leaving them unbuilt.
 *
 * The range runs from the first Sunday on or before 1 January to 31 December,
 * so the leading week is full and the trailing week truncates — the same two
 * shapes the live year has.
 */
function emptyContributionYear(year: number): ContributionYear {
  const firstOfYear = new Date(year, 0, 1)
  const start = new Date(firstOfYear.getTime() - firstOfYear.getDay() * DAY_MS)
  const end = new Date(year, 11, 31)
  const days: ContributionYear['days'] = []
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    days.push({ date: toIso(new Date(t)), count: 0, level: 0 })
  }
  return { total: 0, rangeStart: toIso(start), rangeEnd: toIso(end), days }
}

const EMPTY_OVERVIEW: ActivityOverviewData = {
  contributedTo: { named: [], otherCount: 0 },
  breakdown: { commits: 0, codeReview: 0, pullRequests: 0, issues: 0 },
}

interface YearView {
  contributions: ContributionYear
  activityOverview: ActivityOverviewData
  timeline: TimelineMonth[]
  hasMoreActivity: boolean
}

function viewForYear(year: number): YearView {
  if (year === profile.selectedYear) {
    return {
      contributions: profile.contributions,
      activityOverview: profile.activityOverview,
      timeline: profile.timeline,
      hasMoreActivity: profile.hasMoreActivity,
    }
  }
  return {
    contributions: emptyContributionYear(year),
    activityOverview: EMPTY_OVERVIEW,
    timeline: [],
    hasMoreActivity: false,
  }
}

export function DeveloperProfile() {
  const styles = useStyles()
  const { mode } = useThemeMode()
  const [selectedYear, setSelectedYear] = useState(profile.selectedYear)

  const view = useMemo(() => viewForYear(selectedYear), [selectedYear])

  // §13 — the rail is a single-selection control, not links to separate pages;
  // picking a year replaces the heatmap, the header count, the activity
  // overview and the timeline, and the rail itself does not change.
  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(year)
  }, [])

  return (
    // the contribution ramp is emitted here as css custom properties, so every
    // griffel rule below can reference it statically. See `palette.ts`.
    <div css={[styles.page, contributionRampVars(mode)]}>
      <ChromeBand
        handle={profile.identity.handle}
        tabs={profile.tabs}
        activeTabId="overview"
      />

      {/* §14 — `main` for region B; the sidebar inside it is `complementary`. */}
      <main css={[styles.content, styles.wideOnly]}>
        <h1 css={styles.visuallyHidden}>
          {`${profile.identity.displayName} (${profile.identity.handle})`}
        </h1>
        <div css={styles.regionB}>
          <ProfileSidebar profile={profile} />

          <div css={styles.mainColumn}>
            <ReadmeCard
              readme={profile.readme}
              handle={profile.identity.handle}
              isOwner={profile.isOwner}
            />

            <PinnedGrid pinned={profile.pinned} isOwner={profile.isOwner} />

            <div css={styles.regionH}>
              <div css={styles.contributionsColumn}>
                <div css={styles.contributionsHeader}>
                  <Text
                    as="h2"
                    size={300}
                    weight="regular"
                    css={styles.contributionsHeading}
                  >
                    {contributionsHeading(view.contributions.total, selectedYear)}
                  </Text>
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <button type="button" css={styles.settingsTrigger}>
                        Contribution settings
                        <ChevronDown16Regular aria-hidden />
                      </button>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        {/* out of scope (§13) — the affordance, wired to no-ops. */}
                        <MenuItem>Show private contributions</MenuItem>
                        <MenuItem>Show activity overview</MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </div>

                <ContributionsCard
                  heatmap={
                    <ContributionHeatmap contributions={view.contributions} />
                  }
                  activityOverview={
                    <ActivityOverview overview={view.activityOverview} />
                  }
                />

                <div css={styles.timelineBlock}>
                  <ActivityTimeline
                    timeline={view.timeline}
                    hasMoreActivity={view.hasMoreActivity}
                  />
                  <FooterNote />
                </div>
              </div>

              <YearRail
                years={profile.availableYears}
                selectedYear={selectedYear}
                onSelectYear={handleSelectYear}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
