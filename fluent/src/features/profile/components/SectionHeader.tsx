import type { ReactNode } from 'react'
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'

// §9.2 — the main column's section header: a regular-weight label with an
// optional accent action pushed right, no card, no border, and no rule beneath
// it (§16.6).
//
// This is deliberately NOT the sidebar's heading style. §12.2: main-column
// section headings are regular weight while sidebar headings are bold, at the
// same size. Do not normalise the two.
const useStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  label: {
    marginBlock: 0,
    color: tokens.colorNeutralForeground1,
  },
  action: {
    flexShrink: 0,
  },
})

export interface SectionHeaderProps {
  title: ReactNode
  as?: 'h2' | 'h3'
  /** put this on the region below as `aria-labelledby`. */
  id?: string
  /** the right-hand slot — an accent-coloured text action with no button chrome. */
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  as = 'h2',
  id,
  action,
  className,
}: SectionHeaderProps) {
  const styles = useStyles()

  return (
    <div className={mergeClasses(styles.row, className)}>
      {/* type/body, regular weight (§12.2) */}
      <Text as={as} id={id} size={300} weight="regular" className={styles.label}>
        {title}
      </Text>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
