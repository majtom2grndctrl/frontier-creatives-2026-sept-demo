import { Global, css } from '@emotion/react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'

export type ThemeMode = 'light' | 'dark'

type ThemeModeContextValue = {
  mode: ThemeMode
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined,
)

function getPreferredMode(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

type AppThemeProviderProps = {
  children: ReactNode
}

/**
 * Wraps the app in fluent's provider and owns the light/dark mode.
 *
 * Note: there is deliberately no emotion `ThemeProvider` here. Fluent tokens are
 * already emitted as css custom properties by `FluentProvider`, so emotion styles
 * can reference `tokens.colorNeutralForeground1` and friends directly with no
 * extra plumbing. Please do not add one.
 */
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getPreferredMode)

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, toggleMode }),
    [mode, toggleMode],
  )

  const theme = mode === 'dark' ? webDarkTheme : webLightTheme

  return (
    <ThemeModeContext.Provider value={value}>
      {/* fluent's css custom properties land on the provider element, not on body,
          so the page background reads its value straight off the theme object. */}
      <Global
        styles={css({
          body: {
            margin: 0,
            backgroundColor: theme.colorNeutralBackground1,
          },
        })}
      />
      <FluentProvider theme={theme}>{children}</FluentProvider>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext)
  if (!context) {
    throw new Error('useThemeMode must be used inside an AppThemeProvider')
  }
  return context
}
