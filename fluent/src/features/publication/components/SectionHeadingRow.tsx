import type { ReactNode } from 'react'
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'

// §6.1 — the detached heading row. It sits *outside* and above its panel, on the
// bare pane surface, with its controls pushed right. Do not use this inside a
// card; §5.1's attached headings live in `Card`'s header band.
const useStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  heading: {
    marginBlock: 0,
    color: tokens.colorNeutralForeground1,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
})

export interface SectionHeadingRowProps {
  title: string
  /** put this on the panel below as `aria-labelledby` to tie the two together. */
  id?: string
  as?: 'h1' | 'h2' | 'h3'
  /** the right-hand slot: the period select and the `⋯` button in §6.1. */
  children?: ReactNode
  className?: string
}

export function SectionHeadingRow({
  title,
  id,
  as = 'h2',
  children,
  className,
}: SectionHeadingRowProps) {
  const styles = useStyles()

  return (
    <div className={mergeClasses(styles.row, className)}>
      <Text as={as} id={id} size={500} weight="semibold" className={styles.heading}>
        {title}
      </Text>
      {children ? <div className={styles.controls}>{children}</div> : null}
    </div>
  )
}
