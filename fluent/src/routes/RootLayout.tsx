import { css } from '@emotion/react'
import { Button, Text, tokens } from '@fluentui/react-components'
import { WeatherMoon24Regular, WeatherSunny24Regular } from '@fluentui/react-icons'
import { NavLink, Outlet } from 'react-router'
import { PROTOTYPES } from '@/prototypes'
import { media } from '@/styles/breakpoints'
import { useThemeMode } from '@/theme/AppThemeProvider'

// emotion is used here because the shell is a responsive wrapper.
// fluent tokens are plain css custom properties, so they work directly in emotion.
function useStyles() {
  return {
    shell: css({
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
    }),
    header: css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      rowGap: tokens.spacingVerticalM,
      columnGap: tokens.spacingHorizontalL,
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
      borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
      [media.md]: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
      },
    }),
    nav: css({
      display: 'flex',
      alignItems: 'center',
      columnGap: tokens.spacingHorizontalM,
    }),
    navLink: css({
      color: tokens.colorNeutralForeground2,
      textDecoration: 'none',
      borderRadius: tokens.borderRadiusMedium,
      padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
      ':hover': {
        color: tokens.colorNeutralForeground1,
        backgroundColor: tokens.colorNeutralBackground1Hover,
      },
      '&[aria-current="page"]': {
        color: tokens.colorBrandForeground1,
      },
    }),
    main: css({
      flex: 1,
      padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalL}`,
      [media.md]: {
        padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
      },
    }),
  }
}

export function RootLayout() {
  const styles = useStyles()
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <div css={styles.shell}>
      <header css={styles.header}>
        {/* the page owns the h1, so the brand is plain text */}
        <Text as="span" weight="semibold" size={500}>
          fluent
        </Text>
        <nav css={styles.nav} aria-label="Main">
          <NavLink to="/" css={styles.navLink} end>
            Home
          </NavLink>
          {PROTOTYPES.map((prototype) => (
            <NavLink key={prototype.path} to={prototype.path} css={styles.navLink}>
              {prototype.name}
            </NavLink>
          ))}
          <Button
            appearance="subtle"
            icon={isDark ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
            onClick={toggleMode}
          >
            {isDark ? 'Light mode' : 'Dark mode'}
          </Button>
        </nav>
      </header>
      <main css={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
