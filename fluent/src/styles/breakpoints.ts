// layout breakpoints are not tokenised by fluent, so literal px values are correct here.
export const breakpoints = {
  sm: 480,
  md: 640,
  lg: 1024,
} as const

export type Breakpoint = keyof typeof breakpoints

export const media = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
} as const
