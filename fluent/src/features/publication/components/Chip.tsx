import type { ReactNode } from 'react'
import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components'

// the `Draft` status chip of §8.3: a rounded rectangle on a neutral tint with
// primary-role text. Deliberately not a full pill — only the avatar is (§13).
const useStyles = makeStyles({
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    borderRadius: tokens.borderRadiusSmall,
    paddingBlock: tokens.spacingVerticalXXS,
    paddingInline: tokens.spacingHorizontalS,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    fontWeight: tokens.fontWeightMedium,
    whiteSpace: 'nowrap',
  },
})

export interface ChipProps {
  children: ReactNode
  className?: string
}

export function Chip({ children, className }: ChipProps) {
  const styles = useStyles()
  return <span className={mergeClasses(styles.chip, className)}>{children}</span>
}
