import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import { ArrowDownFilled, ArrowUpFilled } from '@fluentui/react-icons'
import {
  deltaAccessibleText,
  deltaDirection,
  formatDeltaPct,
} from '../format'

// §6.2 — a small chip on the positive tint holding a direction arrow and a
// percentage. A rounded rectangle at the small radius, not a capsule.
//
// §15 — never colour alone: the arrow glyph carries direction visually, a
// negative delta keeps its minus sign, and the accessible name spells out
// `up` or `down`.
const useStyles = makeStyles({
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
    borderRadius: tokens.borderRadiusSmall,
    paddingBlock: tokens.spacingVerticalXXS,
    paddingInline: tokens.spacingHorizontalSNudge,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    fontWeight: tokens.fontWeightSemibold,
    // a four-digit delta (1,633%) must not wrap onto a second line
    whiteSpace: 'nowrap',
  },
  up: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  down: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
  },
  arrow: {
    fontSize: tokens.fontSizeBase200,
  },
})

export interface DeltaPillProps {
  /** already in percent units (`15.2` → `15.2%`). `null` renders nothing at all. */
  deltaPct: number | null
  className?: string
}

export function DeltaPill({ deltaPct, className }: DeltaPillProps) {
  const styles = useStyles()

  // the empty metric omits the pill entirely — no `0%`, no zero (§6.2).
  if (deltaPct === null) return null

  const direction = deltaDirection(deltaPct)
  const Arrow = direction === 'up' ? ArrowUpFilled : ArrowDownFilled

  return (
    <span
      className={mergeClasses(styles.pill, styles[direction], className)}
      role="img"
      aria-label={deltaAccessibleText(deltaPct)}
    >
      <Arrow className={styles.arrow} aria-hidden />
      <span aria-hidden>{formatDeltaPct(deltaPct)}</span>
    </span>
  )
}
