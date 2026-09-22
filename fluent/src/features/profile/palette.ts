import { css } from '@emotion/react'
import type { ThemeMode } from '@/theme/AppThemeProvider'

// §12.1 `data/contribution-N` — a four-step *sequential* ramp in one hue.
//
// Fluent tokenises semantic colour, not data scales: there is no four-step
// sequential ramp anywhere in the theme, and the brand tokens that look like one
// in the light theme run the wrong direction in the dark one
// (`colorBrandBackground2Hover` is #cfe4fa in light but #0c3b5e in dark, which
// would make level 1 darker than level 4). So the ramp is declared here, in the
// brand hue, sampled from Fluent's own brand ramp — the same exemption
// `fluent-v9-notes.md` grants chart geometry, for the same reason.
//
// The steps are emitted as css custom properties on the page root so griffel
// `makeStyles` can reference them statically, exactly like a token.
//
// Level 0 is NOT part of this ramp — it is `surface/recessed`, a neutral
// (§16.11). Consumers read `contributionSurface` for it.

/** brand-ramp samples: light runs pale -> deep, dark runs deep -> bright. */
const RAMP = {
  light: ['#b4d6fa', '#77b7f7', '#2886de', '#0f548c'],
  dark: ['#0e4775', '#115ea3', '#2886de', '#62abf5'],
} as const satisfies Record<ThemeMode, readonly [string, string, string, string]>

export type ContributionLevel = 0 | 1 | 2 | 3 | 4

/** the css variable holding ramp step `level` (1–4). */
export function rampVar(level: 1 | 2 | 3 | 4): string {
  return `var(--profile-contribution-${level})`
}

/**
 * The ramp's most intense step — the radar's axis strokes and markers, and the
 * timeline volume bars (§12.1: "the radar axes and volume bars use its darkest
 * step"). In the dark theme "darkest" means most intense, so this is always
 * step 4 rather than a literal darkness.
 */
export const rampStrongest = rampVar(4)

/** a translucent wash of the strongest step, for the radar's data polygon. */
export const rampWash = `var(--profile-contribution-wash)`

/** emitted on the page root; every ramp reference resolves against these. */
export function contributionRampVars(mode: ThemeMode) {
  const steps = RAMP[mode]
  return css({
    '--profile-contribution-1': steps[0],
    '--profile-contribution-2': steps[1],
    '--profile-contribution-3': steps[2],
    '--profile-contribution-4': steps[3],
    // the polygon reads as a tint of the arm colour rather than a fifth step.
    '--profile-contribution-wash': `color-mix(in srgb, ${steps[3]} 28%, transparent)`,
  })
}
