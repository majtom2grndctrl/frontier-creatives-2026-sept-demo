import * as React from "react"
import { Clock, Link2, MapPin, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { MetaRow, Profile } from "@/lib/profile/types"

/* -------------------------------------------------------------------------
   Filled brand mark (spec §4.4 row 5)
   ---------------------------------------------------------------------- */

/**
 * Lucide only ships outline icons, and the spec calls for a *filled* brand
 * mark on the social row — a rounded square with an "in" glyph reads as a
 * generic filled brand mark without borrowing a real trademark.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <g fill="var(--color-background)">
        <rect x="6.5" y="9.5" width="2.5" height="8" />
        <circle cx="7.75" cy="6.25" r="1.5" />
        <path d="M11.5 9.5h2.4v1.15c.55-.85 1.5-1.4 2.75-1.4 2.1 0 3.35 1.4 3.35 3.9v4.35h-2.5v-3.9c0-1.15-.45-1.95-1.55-1.95-.85 0-1.4.6-1.6 1.15-.08.2-.1.45-.1.7v4h-2.5V9.5Z" />
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------
   Icon list row (spec §4.4)
   ---------------------------------------------------------------------- */

function MetaIconRow({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <li className={cn("flex items-center gap-s1 text-t1", className)}>
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      {children}
    </li>
  )
}

/** Renders one row of §4.4, rows 2–5, switched on `metaRows[].kind`. */
function MetaRowContent({ row }: { row: MetaRow }) {
  switch (row.kind) {
    case "location":
      return <span className="text-foreground">{row.primary}</span>
    case "localTime":
      // Offset must be real text in the row, not a visual-only annotation (spec §14).
      return (
        <span className="text-foreground">
          {row.primary}
          {row.secondary ? (
            <span className="text-muted-foreground"> {row.secondary}</span>
          ) : null}
        </span>
      )
    case "website":
      // §16.23: text/default, not accent-colored, despite being a link.
      return (
        <a href={row.href} className="truncate text-foreground">
          {row.primary}
        </a>
      )
    case "social":
      return (
        <a href={row.href} className="truncate text-foreground">
          {row.primary}
        </a>
      )
  }
}

function metaRowIcon(row: MetaRow) {
  switch (row.kind) {
    case "location":
      return <MapPin aria-hidden className="size-4" />
    case "localTime":
      return <Clock aria-hidden className="size-4" />
    case "website":
      return <Link2 aria-hidden className="size-4" />
    case "social":
      return <BrandMark className="size-4" />
  }
}

/* -------------------------------------------------------------------------
   Achievements & organizations (spec §4.5, §4.6)
   ---------------------------------------------------------------------- */

function AchievementBadge({
  achievement,
}: {
  achievement: Profile["achievements"][number]
}) {
  return (
    <div className="relative w-1/5">
      {/* Artwork is arbitrary (shield, circle, whatever) — never clipped to a
          common shape (spec §4.5, §16). */}
      <img
        src={achievement.imageUrl}
        alt={achievement.name}
        className="w-full"
      />
      {achievement.count ? (
        <span
          // pillColor is data supplied with the artwork, not a design token (spec §4.5, §17).
          style={{ backgroundColor: achievement.pillColor }}
          className="absolute -right-s2xs -bottom-s3xs rounded-full px-s3xs text-xs font-bold text-white"
        >
          {achievement.count}
        </span>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------
   Sidebar (spec §4)
   ---------------------------------------------------------------------- */

export function ProfileSidebar({ profile }: { profile: Profile }) {
  const { identity, counts, metaRows, achievements, organizations } = profile

  return (
    // No background, no border, no fixed height — it hugs its content and the
    // page shows through beneath it (spec §4, §16.4). The page grid supplies
    // `align-items: start`.
    <aside aria-label="Profile" className="flex flex-col gap-s5">
      {/* Column at wide; below it the sidebar spans the whole page, where a
          full-width avatar would be absurd — §15 shrinks it and sets the
          identity block beside it instead. */}
      <div className="flex flex-row items-center gap-s3 lg:flex-col lg:items-stretch">
        {/* §4.1 — full sidebar-width circular avatar, status button straddling
            its lower-right edge. */}
        <div className="relative w-s10 shrink-0 lg:w-full">
          <Avatar className="size-auto w-full aspect-square">
            <AvatarImage src={identity.avatarUrl} alt={identity.displayName} />
            <AvatarFallback>
              {identity.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {identity.statusEmoji ? (
            <button
              type="button"
              aria-label={identity.statusLabel ?? "Status"}
              /* Half on the photo, half off it (spec §4.1). The anchor is the
                 circle's own lower-right 45° point, not the square's corner:
                 a circle inscribed in its box sits (1 - √2/2)/2 ≈ 14.6% in
                 from each corner, so offsetting by that much and then
                 centring the button on the result lands it exactly on the
                 circumference. Anchoring at the corner instead pushes it well
                 clear of the photo. */
              className="absolute right-[14.6%] bottom-[14.6%] flex aspect-square w-[12.5%] translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
            >
              <span aria-hidden className="text-[0.6em] leading-none">
                {identity.statusEmoji}
              </span>
            </button>
          ) : null}
        </div>

        {/* §4.2 — identity block */}
        <div className="flex min-w-0 flex-1 flex-col gap-s1 lg:flex-none">
          {/* Name and handle are one unit — the handle is a subtitle, not a
              sibling line — so they sit at the tight-pair step and the bio
              clears the pair below. */}
          <div className="flex flex-col gap-s4xs">
            <h1 className="text-t3 font-bold text-foreground">
              {identity.displayName}
            </h1>
            <p className="text-t2 font-normal text-muted-foreground">
              {identity.handle}
              {identity.pronouns ? ` · ${identity.pronouns}` : null}
            </p>
          </div>
          {identity.bio ? (
            <p className="whitespace-pre-line text-t1 text-foreground">
              {identity.bio}
            </p>
          ) : null}
        </div>

      </div>

      {/* §4.3 — tonal, full-width primary action; a deliberate no-op (spec §1, §13). */}
      <div className="flex flex-col gap-s3">
        <Button
          type="button"
          variant="secondary"
          className="w-full border border-border shadow-none"
        >
          Edit profile
        </Button>

        {/* §4.4 — one icon list, one icon column */}
        <ul className="flex flex-col gap-s1">
          <MetaIconRow
            icon={<Users aria-hidden className="size-4" />}
            // Row 1 sits slightly further from row 2 than the rest sit from
            // each other — a small extra gap, not a divider (spec §4.4).
            className="mb-s3xs"
          >
            <span className="text-foreground">
              <span className="font-bold">{counts.followers}</span>{" "}
              <span className="text-muted-foreground">followers</span> ·{" "}
              <span className="font-bold">{counts.following}</span>{" "}
              <span className="text-muted-foreground">following</span>
            </span>
          </MetaIconRow>
          {metaRows.map((row) => (
            <MetaIconRow key={row.kind} icon={metaRowIcon(row)}>
              <MetaRowContent row={row} />
            </MetaIconRow>
          ))}
        </ul>
      </div>

      {/* §4.5 — Achievements (empty state omits block + divider, spec §13) */}
      {achievements.length > 0 ? (
        <div className="flex flex-col gap-s3">
          <Separator className="bg-border/60" />
          <div className="flex flex-col gap-s1">
            <h2 className="text-t1 font-bold text-foreground">Achievements</h2>
            {/* Badges are ~1/5 of the sidebar (spec §4.5). Below the wide
                breakpoint the sidebar spans the whole page and that fraction
                turns into a 160px badge, so the row is capped there — and only
                there, since at wide the ratio is the spec's own rule. The cap
                is s14 rather than s13 because the count pill is `text-xs`,
                which is fixed: one step lower and the artwork shrinks under
                the pill until the two overlap. */}
            <div className="flex max-w-s14 items-start justify-between gap-s2 lg:max-w-none">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* §4.6 — Organizations (empty state omits block + divider; sidebar ends here, spec §13, §16.5) */}
      {organizations.length > 0 ? (
        <div className="flex flex-col gap-s3">
          <Separator className="bg-border/60" />
          <div className="flex flex-col gap-s1">
            <h2 className="text-t1 font-bold text-foreground">Organizations</h2>
            <div className="flex max-w-s14 items-center gap-s2 lg:max-w-none">
              {organizations.map((org) => (
                <img
                  key={org.id}
                  src={org.avatarUrl}
                  alt={org.name}
                  // Rounded-square, not circular — and roughly 3/5 the
                  // diameter of an achievement badge (spec §4.6).
                  className="w-[12%] rounded-xs border border-border"
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
