import { css } from '@emotion/react'
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import { media } from '@/styles/breakpoints'

// §7.3 — the year rail: a vertical list of years, newest first, running
// alongside the whole left column (§7.1's header down through §8's timeline).
//
// §14 is explicit about the shape: "a list of links, one marked
// `aria-current="page"`. Not a tablist — it navigates." §13's framing of the
// click behaviour ("a single-selection control, not links to separate pages")
// is about what happens on click, not the markup — it still renders as
// `<nav><ul><li><a>`, and `onSelectYear` swaps the band's data in place.

export interface YearRailProps {
  /** descending, newest first (§7.3). */
  years: number[]
  selectedYear: number
  onSelectYear: (year: number) => void
}

// emotion carries only the one responsive decision this rail makes — §15
// medium collapses it into a horizontally scrolling row of chips, the only
// other place (besides the heatmap) a scroll container is allowed — per
// CLAUDE.md's rule that responsive wrappers go through emotion, not griffel.
function useRailStyles() {
  return {
    // §7.3 root: no *width* here — the page's grid owns the column, and at
    // `lg` there is no scroll container at all (§16.25). Not sticky (§13).
    //
    // It does need `min-width: 0`, though: the rail is a grid item, and a grid
    // item's default `min-width: auto`
    // refuses to shrink below its content — 15 chips in a row measure ~960px,
    // so below `lg` the nav grew past the viewport and scrolled the whole PAGE
    // sideways instead of scrolling itself. `min-width: 0` lets it take the
    // track's width, which is what finally arms the `overflow-x` below.
    root: css({
      minWidth: 0,
    }),
    list: css({
      listStyleType: 'none',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'auto',
      gap: tokens.spacingHorizontalS,
      [media.lg]: {
        flexDirection: 'column',
        overflowX: 'visible',
        // even vertical pitch (§7.3) — one gap value between every entry.
        // The pitch also has to carry the rail PAST the contributions card and
        // alongside the activity timeline (§7.3, and §18's checklist). At the
        // tightest gap the 15 years stop level with the card's bottom edge,
        // which reads as a rail that belongs to the card alone.
        gap: tokens.spacingVerticalM,
      },
    }),
    // flex-basis auto + no grow/shrink: below `lg` each entry shrinks to its
    // own chip content; at `lg` the column direction's cross axis (width)
    // still stretches by default, so the entry's own `width: 100%` (below)
    // resolves against the full rail column.
    item: css({
      flex: '0 0 auto',
      minWidth: 0,
    }),
  }
}

const useStyles = makeStyles({
  entry: {
    display: 'block',
    boxSizing: 'border-box',
    width: '100%',
    textAlign: 'left',
    textDecorationLine: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusLarge,
    // same padding on every entry, selected or not — the reliable way to keep
    // an unselected label's left edge lined up with the selected chip's label.
    paddingBlock: tokens.spacingVerticalSNudge,
    paddingInline: tokens.spacingHorizontalM,
    ':focus-visible': {
      outlineWidth: tokens.strokeWidthThick,
      outlineStyle: 'solid',
      outlineColor: tokens.colorStrokeFocus2,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },
  // §7.3 unselected: muted text, no fill, no border.
  entryUnselected: {
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground2,
    // §13 hover — a light background wash, no movement.
    ':hover': {
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },
  },
  // §7.3 selected: a solid accent block, `radius/chip` — noticeably rounder
  // than a card — spanning the rail column's full width so it extends well
  // past its own (left-aligned, not centred) label.
  entrySelected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
})

export function YearRail({ years, selectedYear, onSelectYear }: YearRailProps) {
  const railStyles = useRailStyles()
  const styles = useStyles()

  return (
    <nav aria-label="Contribution year" css={railStyles.root}>
      <ul css={railStyles.list}>
        {years.map((year) => {
          const isSelected = year === selectedYear

          return (
            <li key={year} css={railStyles.item}>
              <a
                href="#"
                className={mergeClasses(
                  styles.entry,
                  isSelected ? styles.entrySelected : styles.entryUnselected,
                )}
                aria-current={isSelected ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onSelectYear(year)
                }}
              >
                {/* type/body (§12.2) */}
                <Text as="span" size={300} weight="regular">
                  {year}
                </Text>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
