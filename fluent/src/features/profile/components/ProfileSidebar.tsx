import type { CSSProperties, ReactElement } from 'react'
import { Button, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import {
  Clock16Regular,
  Link16Regular,
  Location16Regular,
  People16Regular,
  PersonSquare16Filled,
} from '@fluentui/react-icons'
import type { MetaRow, Profile } from '../types'

// §4 — region C. A single column: no card, no background, no border around it
// (§16.4). Its blocks are separated by full-column `border/subtle` hairlines.
//
// Vertical order: avatar (§4.1), identity (§4.2), `Edit profile` (§4.3), the
// icon list (§4.4), Achievements (§4.5), Organizations (§4.6). The sidebar ENDS
// after Organizations — no divider below it, no footer, no trailing element
// (§16.5). The page owns the grid column and the background; this component
// sets neither a width nor a height, so the column hugs its content.

/** the glyph column of §4.4 — one icon per meta row kind, all at one size. */
const META_ICONS: Record<MetaRow['kind'], ReactElement> = {
  location: <Location16Regular />,
  localTime: <Clock16Regular />,
  website: <Link16Regular />,
  // §4.4 row 5: a *filled* brand mark rather than an outline system icon.
  social: <PersonSquare16Filled />,
}

// §15 narrow — below this the avatar shrinks and the identity block moves
// beside it instead of sitting beneath, so the profile header stops eating a
// whole phone screen before the content starts. `@/styles/breakpoints` tops out
// at lg (1024), this screen's *wide* step, so the narrow width lives here.
const IDENTITY_BESIDE_AVATAR = '@media (max-width: 599px)'
/** the shrunken avatar's edge at that step, in px — layout geometry. */
const NARROW_AVATAR_EDGE = 96

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalL,
    minWidth: 0,
    // deliberately no width, no background, no border, no min-height (§16.4).
  },

  // §4.1 — the avatar spans the full width of the column and is the positioning
  // context for the status button that straddles its lower-right circumference.
  // wide: `contents`, so the avatar and identity stay siblings in the sidebar's
  // own column flow and nothing about §4's vertical order changes. Narrow: a
  // real flex row, which is what puts the identity beside the avatar (§15).
  identityHeader: {
    display: 'contents',
    [IDENTITY_BESIDE_AVATAR]: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacingHorizontalL,
    },
  },
  avatarFrame: {
    position: 'relative',
    width: '100%',
    [IDENTITY_BESIDE_AVATAR]: {
      width: `${NARROW_AVATAR_EDGE}px`,
      flexShrink: 0,
    },
    // layout geometry, not a token: the photo is a circle, so the frame is square.
    aspectRatio: '1 / 1',
  },
  avatarImage: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: tokens.borderRadiusCircular,
  },
  statusButton: {
    position: 'absolute',
    // §4.1 geometry, all literal percentages of the avatar's own diameter:
    // the button is ~1/8 of the diameter, and its centre sits on the circle at
    // 45° below-right — 50% + (50% x cos45°) ≈ 85.4% — so subtracting its own
    // half-width (6.25%) parks it half on the photo and half off it.
    insetInlineStart: '79.1%',
    insetBlockStart: '79.1%',
    width: '12.5%',
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusCircular,
    // raised above the photo, by stacking order alone — no shadow (§16.10).
    zIndex: 1,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
    },
  },

  // §4.2 — identity. The bio's second line is short, so nothing here justifies
  // or stretches: the block is left-aligned text at its natural measure.
  identity: {
    [IDENTITY_BESIDE_AVATAR]: {
      minWidth: 0,
    },
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXXS,
    minWidth: 0,
    textAlign: 'start',
  },
  displayName: {
    marginBlock: 0,
    color: tokens.colorNeutralForeground1,
  },
  // §4.2: handle and pronouns are the *same* muted tone — the pronouns are not
  // further de-emphasised.
  handleLine: {
    color: tokens.colorNeutralForeground2,
  },
  bio: {
    marginBlockStart: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground1,
    // the bio may carry hard line breaks (§10 `Identity.bio`); render them.
    whiteSpace: 'pre-line',
  },

  // §4.3 — a *tonal* button, not a solid accent one: it must read quieter than
  // the selected-year chip in §7.3. Fluent's outline appearance supplies the
  // hairline; the fill is overridden to `surface/raised-chrome`.
  editButton: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightMedium,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
      color: tokens.colorNeutralForeground1,
    },
  },

  // §4.4 — ONE list, ONE icon column.
  metaList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXS,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  // §4.4: row 1 sits slightly further from row 2 than rows 2–5 sit from each
  // other — a small extra gap, not a divider.
  metaRowLead: {
    marginBlockEnd: tokens.spacingVerticalXS,
  },
  metaIcon: {
    display: 'flex',
    flexShrink: 0,
    // every glyph shares one left edge, one size and one muted colour (§4.4).
    color: tokens.colorNeutralForeground2,
  },
  metaText: {
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
  },
  metaMuted: {
    color: tokens.colorNeutralForeground2,
  },
  metaCount: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightBold,
  },
  // §16.23 — the website and social rows are links but are NOT accent-coloured.
  metaLink: {
    color: tokens.colorNeutralForeground1,
    textDecorationLine: 'none',
    ':hover': {
      textDecorationLine: 'underline',
    },
    ':focus-visible': {
      outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: tokens.spacingHorizontalXXS,
      borderRadius: tokens.borderRadiusMedium,
    },
  },

  // §4.5 / §4.6 — each block opens with a full-column `border/subtle` hairline.
  block: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalM,
    paddingBlockStart: tokens.spacingVerticalL,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  // §12.2: sidebar section headings are BOLD while the main column's are regular
  // weight, at the same size. Do not normalise the two.
  blockHeading: {
    marginBlock: 0,
    color: tokens.colorNeutralForeground1,
  },

  // §4.5 — four badges in one row, evenly spaced, no wrap, no labels.
  badgeRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    position: 'relative',
    // layout geometry: each badge is roughly one-fifth of the column (§4.5).
    flex: '0 0 20%',
  },
  // the artwork is arbitrary — no radius, no clipping to a common shape (§4.5).
  badgeImage: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
  countPill: {
    position: 'absolute',
    // geometry: the pill overlaps the badge's lower-right and extends *outside*
    // its silhouette, so both offsets are negative fractions of the badge box.
    insetInlineEnd: '-10%',
    insetBlockEnd: '-6%',
    paddingInline: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusCircular,
    // §4.5 / §17 — the fill is DATA, not a token: it arrives on the achievement
    // and is handed in through this custom property by the render below.
    backgroundColor: 'var(--profile-achievement-pill)',
    // §4.5 specs `text/default` here, but the pill sits on a saturated data fill
    // whose contrast is unknown, so the on-accent foreground is substituted for
    // legibility (§14 contrast).
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightBold,
  },

  // §4.6 — rounded-square (not circular) avatars, roughly three-fifths the
  // diameter of an achievement badge. No names, no counts, no wrap.
  orgRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    columnGap: tokens.spacingHorizontalS,
  },
  orgAvatar: {
    display: 'block',
    // geometry: 20% badge x 3/5 = 12% of the column (§4.6).
    flex: '0 0 12%',
    width: '12%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: tokens.borderRadiusMedium,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
  },
})

export interface ProfileSidebarProps {
  profile: Profile
}

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const styles = useStyles()
  const { identity, counts, metaRows, achievements, organizations } = profile

  function renderMetaContent(row: MetaRow) {
    // §4.4 rows 4 and 5 are links; §16.23 keeps them `text/default` all the same.
    const body =
      row.kind === 'localTime' ? (
        <>
          {row.primary}
          {row.secondary ? (
            // §14: the UTC offset is part of the row's *text*, not a visual-only
            // flourish, so a screen reader reads "16:51 (UTC −07:00)".
            <>
              {' '}
              <span className={styles.metaMuted}>{row.secondary}</span>
            </>
          ) : null}
        </>
      ) : (
        row.primary
      )

    if (row.href) {
      return (
        <a className={styles.metaLink} href={row.href}>
          {body}
        </a>
      )
    }
    return body
  }

  return (
    // `aside` is implicitly the `complementary` landmark of §14.
    <aside className={styles.root} aria-label={`${identity.displayName} profile details`}>
      {/* §4.1 + §4.2 — at wide this wrapper is `display: contents` and changes
          nothing; at narrow it becomes the row that seats the identity beside a
          shrunken avatar (§15). */}
      <div className={styles.identityHeader}>
      {/* §4.1 — avatar, with the status button straddling its lower-right edge. */}
      <div className={styles.avatarFrame}>
        <img
          className={styles.avatarImage}
          src={identity.avatarUrl}
          // §14 offers two options for the avatar; this screen consistently picks
          // the meaningful one — the display name.
          alt={identity.displayName}
        />
        {identity.statusEmoji ? (
          <button
            type="button"
            className={styles.statusButton}
            // §14: a real button whose name describes the status, not just the
            // emoji. Editing is out of scope (§1), so the click is a no-op.
            aria-label="Change status"
            onClick={() => {}}
          >
            <span aria-hidden="true">{identity.statusEmoji}</span>
          </button>
        ) : null}
      </div>

      {/* §4.2 — identity. */}
      <div className={styles.identity}>
        {/* type/title, bold (§12.2) */}
        <Text as="h2" size={600} weight="bold" className={styles.displayName}>
          {identity.displayName}
        </Text>
        {/* type/subtitle, regular weight, both halves equally muted */}
        <Text as="p" size={500} weight="regular" className={styles.handleLine}>
          {identity.pronouns
            ? `${identity.handle} · ${identity.pronouns}`
            : identity.handle}
        </Text>
        {identity.bio ? (
          <Text as="p" size={300} weight="regular" className={styles.bio}>
            {identity.bio}
          </Text>
        ) : null}
      </div>
      </div>

      {/* §4.3 — owner-only affordance (§1); out of scope, so a no-op. */}
      {profile.isOwner ? (
        <Button appearance="outline" className={styles.editButton} onClick={() => {}}>
          Edit profile
        </Button>
      ) : null}

      {/* §4.4 — one list, one icon column. Every glyph is decorative; the row's
          text carries the meaning (§14). */}
      <ul className={styles.metaList}>
        <li className={mergeClasses(styles.metaRow, styles.metaRowLead)}>
          <span className={styles.metaIcon} aria-hidden="true">
            <People16Regular />
          </span>
          {/* type/small (§12.2) — counts bold `text/default`, words `text/muted` */}
          <Text size={200} weight="regular" className={styles.metaMuted}>
            <span className={styles.metaCount}>{counts.followers}</span> followers
            {' · '}
            <span className={styles.metaCount}>{counts.following}</span> following
          </Text>
        </li>
        {metaRows.map((row) => (
          <li key={row.kind} className={styles.metaRow}>
            <span className={styles.metaIcon} aria-hidden="true">
              {META_ICONS[row.kind]}
            </span>
            <Text size={200} weight="regular" truncate wrap={false} className={styles.metaText}>
              {renderMetaContent(row)}
            </Text>
          </li>
        ))}
      </ul>

      {/* §4.5 — omitted entirely, divider and all, when there are none (§13). */}
      {achievements.length > 0 ? (
        <section className={styles.block}>
          <Text as="h2" size={300} weight="semibold" className={styles.blockHeading}>
            Achievements
          </Text>
          <div className={styles.badgeRow}>
            {achievements.map((achievement) => (
              <div key={achievement.id} className={styles.badge}>
                <img
                  className={styles.badgeImage}
                  src={achievement.imageUrl}
                  alt={achievement.name}
                />
                {achievement.count === undefined ? null : (
                  <Text
                    size={200}
                    weight="bold"
                    className={styles.countPill}
                    // the fill travels with the badge data rather than the token
                    // set (§4.5, §17) — hence a custom property, not a token.
                    style={
                      {
                        '--profile-achievement-pill': achievement.pillColor,
                      } as CSSProperties
                    }
                  >
                    {achievement.count}
                  </Text>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* §4.6 — likewise omitted with its divider when empty (§13). The sidebar
          ends here: no divider below, no footer, no trailing element (§16.5). */}
      {organizations.length > 0 ? (
        <section className={styles.block}>
          <Text as="h2" size={300} weight="semibold" className={styles.blockHeading}>
            Organizations
          </Text>
          <div className={styles.orgRow}>
            {organizations.map((organization) => (
              <img
                key={organization.id}
                className={styles.orgAvatar}
                src={organization.avatarUrl}
                alt={organization.name}
              />
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  )
}
