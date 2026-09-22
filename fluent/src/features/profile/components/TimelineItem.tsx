import { useState } from 'react'
import type { ReactElement } from 'react'
import { Button, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import {
  Book16Regular,
  BranchFork16Regular,
  ChevronUpDown16Regular,
  Code16Regular,
  CommentCheckmark16Regular,
  ErrorCircle16Regular,
} from '@fluentui/react-icons'
import type { TimelineDetail, TimelineItem as TimelineItemData, TimelineKind } from '../types'
import { barFraction, timelineItemTitle } from '../format'
import { rampStrongest } from '../palette'

// §9.3 — one timeline item: a badge sitting on the rail, a plain-text title, a
// collapse control, and one detail row per repository.
//
//  │
//  ▣  Created 194 commits in 1 repository                              ⇕
//  │    repo-path  ·  194 commits                              ▬▬▬▬▬▬▬▬▬▬
//  │
//
// The title sentence is NOT composed here. §10 makes it derived precisely so the
// count and the repository count cannot drift apart — `timelineItemTitle` owns
// it, and `barFraction` owns the bar length for the same reason.
//
// No divider, no timestamp, no avatar (§16.19).

/** §9.3 — the badge glyph varies by item kind. Outline glyphs throughout. */
const KIND_GLYPH: Record<TimelineKind, ReactElement> = {
  commits: <Code16Regular />,
  pullRequests: <BranchFork16Regular />,
  issues: <ErrorCircle16Regular />,
  reviews: <CommentCheckmark16Regular />,
  createdRepository: <Book16Regular />,
}

// Layout geometry, not tokens (see `fluent-v9-notes.md`). The badge's footprint
// and the volume-bar track are component intrinsic sizes; Fluent tokenises
// colour, spacing and radius but not these.
//
// BADGE_SIZE matters twice: the badge is the item's first grid column, so half
// of it is the rail's x-offset. `ActivityTimeline` parks the rail at that same
// offset, which is what puts the badge dead centre on the line and lets its
// opaque `surface/base` fill mask the rail behind it.
/** exported so `ActivityTimeline` can park the rail on the badge's centre. */
export const TIMELINE_BADGE_SIZE = 24
const BADGE_SIZE = TIMELINE_BADGE_SIZE
const BAR_TRACK_WIDTH = 120
const BAR_HEIGHT = 8

const useStyles = makeStyles({
  // two columns: the badge (on the rail) and everything else. The detail rows
  // live in column 2 as well, which is what indents them to the title's left
  // edge (§9.3) without a second magic number.
  item: {
    display: 'grid',
    gridTemplateColumns: `${BADGE_SIZE}px 1fr`,
    columnGap: tokens.spacingHorizontalM,
    alignItems: 'start',
    minWidth: 0,
    paddingBlock: tokens.spacingVerticalS,
    // no divider between items (§16.19)
  },

  // §9.3 — a rounded square, `surface/base` fill, `border/default` outline, a
  // muted glyph inside. `position: relative` lifts it over the rail's
  // pseudo-element so the opaque fill actually masks the line.
  badge: {
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box',
    width: `${BADGE_SIZE}px`,
    height: `${BADGE_SIZE}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    minWidth: 0,
    // the badge is 24px tall; match it so the title sits on the badge's centre.
    minHeight: `${BADGE_SIZE}px`,
  },
  // §9.3 — plain text with NO links. type/body, text/default.
  title: {
    flexGrow: 1,
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },

  // §9.3 — the collapse control: two chevrons converging, `text/muted`, no
  // border and no fill. Present at rest on every item, not a hover affordance.
  collapse: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
    ':hover': {
      color: tokens.colorNeutralForeground2,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },

  detailList: {
    // the item is a `badge | content` grid, and this list is its third child, so
    // auto-placement would drop it into the badge column and squeeze every row
    // to 24px. Pin it to column 2, under the title.
    gridColumnStart: '2',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
    marginBlockStart: tokens.spacingVerticalXS,
    minWidth: 0,
  },
  // §13 — hover belongs to the ROW, not to the individual links: hovering
  // anywhere on the row lights both of them. `:focus-within` gives the keyboard
  // the same feedback.
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
    minWidth: 0,
    minHeight: `${BADGE_SIZE}px`,
    '&:hover [data-repo-link]': {
      color: tokens.colorBrandForegroundLink,
      textDecorationLine: 'underline',
    },
    '&:focus-within [data-repo-link]': {
      color: tokens.colorBrandForegroundLink,
      textDecorationLine: 'underline',
    },
    // the count link gains an underline and STAYS muted (§13).
    '&:hover [data-count-link]': {
      textDecorationLine: 'underline',
    },
    '&:focus-within [data-count-link]': {
      textDecorationLine: 'underline',
    },
  },

  // §16.20 — at rest the repository path is muted and NOT accent-coloured, and
  // carries no underline. The row's `:hover` rule above is the only thing that
  // changes either.
  link: {
    color: tokens.colorNeutralForeground2,
    textDecorationLine: 'none',
    // the row is a flex line. The path must not collapse to nothing (the bar
    // would ride over it) nor refuse to yield (at narrow widths the fixed-width
    // bar track gets shoved off-screen and scrolls the page sideways). Letting
    // it shrink to an ellipsis instead satisfies both ends of the range.
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
      borderRadius: tokens.borderRadiusMedium,
    },
  },
  separator: {
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },

  // right-aligned trailing element — a volume bar or a status group, never both.
  trailing: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    flexShrink: 0,
    marginInlineStart: 'auto',
  },

  // §9.3 — a fixed-width track whose right edge is flush with the sub-column's
  // right edge; the bar inside is a percentage of it, so the comparison is
  // within the item. The track itself is unpainted.
  barTrack: {
    width: `${BAR_TRACK_WIDTH}px`,
    height: `${BAR_HEIGHT}px`,
    flexShrink: 0,
    backgroundColor: 'transparent',
  },
  barFill: {
    height: '100%',
    // §12.1 — volume bars use the contribution ramp's most intense step.
    backgroundColor: rampStrongest,
    borderRadius: tokens.borderRadiusCircular,
  },

  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalXS,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: tokens.spacingHorizontalS,
    backgroundColor: tokens.colorPaletteBerryBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: tokens.borderRadiusCircular,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase300,
    fontWeight: tokens.fontWeightBold,
  },
  statusWord: {
    color: tokens.colorNeutralForeground2,
  },

  // §14 — the pill and its trailing word are one phrase ("37 merged"). The two
  // visible boxes are hidden from assistive tech and this carries the phrase
  // whole, rather than exposing "37" and "merged" as separate fragments.
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
})

export interface TimelineItemProps {
  item: TimelineItemData
  className?: string
}

export function TimelineItem({ item, className }: TimelineItemProps) {
  const styles = useStyles()
  // §13 — the collapse controls toggle this item's detail rows. Local state:
  // nothing above needs to know, and nothing on this page is sticky or shared.
  const [expanded, setExpanded] = useState(true)

  const title = timelineItemTitle(item)
  const toggle = () => setExpanded((open) => !open)

  const collapseControl = (label: string) => (
    <Button
      appearance="subtle"
      size="small"
      className={styles.collapse}
      icon={<ChevronUpDown16Regular />}
      aria-expanded={expanded}
      aria-label={label}
      onClick={toggle}
    />
  )

  return (
    <li className={mergeClasses(styles.item, className)}>
      <span className={styles.badge} aria-hidden>
        {KIND_GLYPH[item.kind]}
      </span>

      <div className={styles.titleRow}>
        {/* type/body, text/default, plain text — no links (§9.3) */}
        <Text size={300} weight="regular" className={styles.title}>
          {title}
        </Text>
        {collapseControl(`${expanded ? 'Collapse' : 'Expand'} details for ${title}`)}
      </div>

      {expanded ? (
        <ul className={styles.detailList}>
          {item.details.map((detail) => (
            <DetailRow
              key={detail.repo}
              detail={detail}
              details={item.details}
              collapseControl={collapseControl}
              expanded={expanded}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

interface DetailRowProps {
  detail: TimelineDetail
  /** the whole item's rows — the bar is normalised against their max (§10). */
  details: TimelineDetail[]
  collapseControl: (label: string) => ReactElement
  expanded: boolean
}

function DetailRow({ detail, details, collapseControl, expanded }: DetailRowProps) {
  const styles = useStyles()
  const fraction = barFraction(detail, details)

  return (
    <li className={styles.detailRow}>
      <a className={styles.link} href={detail.href} data-repo-link="true">
        {detail.repo}
      </a>
      {detail.countLabel ? (
        <>
          <span className={styles.separator} aria-hidden>
            &middot;
          </span>
          <a className={styles.link} href={detail.href} data-count-link="true">
            {detail.countLabel}
          </a>
        </>
      ) : null}

      <div className={styles.trailing}>
        {/* §14 — the bar is decorative reinforcement of the count beside it, so
            it is hidden: the count text already carries the value. */}
        {fraction !== null ? (
          <div className={styles.barTrack} aria-hidden>
            <div className={styles.barFill} style={{ width: `${fraction * 100}%` }} />
          </div>
        ) : null}

        {detail.statusPill ? (
          <span className={styles.statusGroup}>
            <span className={styles.visuallyHidden}>
              {`${detail.statusPill.count} ${detail.statusPill.label}`}
            </span>
            <span className={styles.statusPill} aria-hidden>
              {detail.statusPill.count}
            </span>
            <Text size={200} className={styles.statusWord} aria-hidden>
              {detail.statusPill.label}
            </Text>
          </span>
        ) : null}

        {/* §9.3 — this row carries a collapse control of its OWN, in addition to
            the one on the title row. Both drive the same disclosure. */}
        {detail.collapsible
          ? collapseControl(`${expanded ? 'Collapse' : 'Expand'} details for ${detail.repo}`)
          : null}
      </div>
    </li>
  )
}
