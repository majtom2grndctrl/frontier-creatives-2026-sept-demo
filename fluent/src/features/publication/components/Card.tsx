import type { ElementType, ReactNode } from 'react'
import {
  Text,
  makeStyles,
  mergeClasses,
  tokens,
  useId,
} from '@fluentui/react-components'

// §10.1 — the shared card shell: raised surface, hairline border, medium radius,
// no shadow, and an *optional* header band with a hairline bottom divider.
//
// §5.1 has two heading patterns and they must not be conflated. Pass `heading`
// for the attached pattern (Latest post, Drafts, Recent posts). Omit it for the
// Overview panel, whose heading is a detached `SectionHeadingRow` above the card.
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    // clips the metric strip's accent indicator to the card's corner radius (§6.2)
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
    paddingBlock: tokens.spacingVerticalM,
    paddingInline: tokens.spacingHorizontalXL,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  heading: {
    marginBlock: 0,
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  headerAction: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flexGrow: 1,
  },
  bodyPadded: {
    paddingBlock: tokens.spacingVerticalL,
    paddingInline: tokens.spacingHorizontalXL,
  },
})

export interface CardProps {
  /**
   * The attached heading of §5.1. When omitted the card renders no header band
   * and no divider — that is the Overview panel's shape.
   */
  heading?: string
  headingLevel?: 'h2' | 'h3'
  /** the trailing muted text link in the header band (`View stats`, `View all`). */
  headerAction?: ReactNode
  /** the semantic element for the card itself. */
  as?: ElementType
  /** `none` lets the body run edge to edge, for the Overview strip and chart. */
  bodyPadding?: 'default' | 'none'
  className?: string
  bodyClassName?: string
  children: ReactNode
  /** for a headingless card, name the region yourself. */
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function Card({
  heading,
  headingLevel = 'h2',
  headerAction,
  as: Root = 'section',
  bodyPadding = 'default',
  className,
  bodyClassName,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: CardProps) {
  const styles = useStyles()
  const headingId = useId('card-heading-')
  const labelledBy = ariaLabelledBy ?? (heading ? headingId : undefined)

  return (
    <Root
      className={mergeClasses(styles.card, className)}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
    >
      {heading ? (
        <div className={styles.header}>
          <Text
            as={headingLevel}
            id={headingId}
            size={500}
            weight="semibold"
            truncate
            wrap={false}
            className={styles.heading}
          >
            {heading}
          </Text>
          {headerAction ? (
            <div className={styles.headerAction}>{headerAction}</div>
          ) : null}
        </div>
      ) : null}
      <div
        className={mergeClasses(
          styles.body,
          bodyPadding === 'default' && styles.bodyPadded,
          bodyClassName,
        )}
      >
        {children}
      </div>
    </Root>
  )
}
