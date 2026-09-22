import { Clock, Link as LinkIcon, MapPin, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCount } from "@/lib/profile/format"
import type { MetaRow, Profile } from "@/lib/profile/types"
import { cn } from "@/lib/utils"

/**
 * Spec §4 — Region C, the profile sidebar.
 *
 * A bare column: no card, no background, no border, no footer (§16.4). It hugs
 * its content and ends after Organizations — there is no divider below it
 * (§16.5). Exactly two `border/subtle` hairlines exist in the whole region:
 * above Achievements and above Organizations, and each disappears with its
 * block when that block is empty (§13).
 */
export function ProfileSidebar({
  identity,
  counts,
  metaRows,
  achievements,
  organizations,
  isOwner,
}: Pick<
  Profile,
  "identity" | "counts" | "metaRows" | "achievements" | "organizations" | "isOwner"
>): React.JSX.Element {
  const initials = identity.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()

  return (
    <aside aria-label="Profile" className="flex flex-col gap-4">
      {/* §4.1 + §4.2 — below `lg` the avatar shrinks and identity sits beside
          it; at `lg` and up the avatar spans the column and identity sits
          beneath it (§15, narrow row). */}
      <div className="flex items-center gap-4 lg:flex-col lg:items-stretch">
        {/* §4.1 Avatar */}
        <div className="relative aspect-square w-20 shrink-0 lg:w-full">
          <Avatar className="size-full h-auto w-full aspect-square">
            <AvatarImage
              src={identity.avatarUrl}
              alt={identity.displayName}
              className="size-full h-auto w-full aspect-square"
            />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          {identity.statusEmoji ? (
            // Centred on the avatar's 45° lower-right point (50% + r/√2), so
            // it straddles the circumference: about half on the photo, half
            // off it. Roughly one-eighth of the diameter at `lg`.
            <button
              type="button"
              aria-label={`Set status. Current status: ${identity.statusEmoji}`}
              className={cn(
                "absolute top-[85.4%] left-[85.4%] z-10 flex -translate-x-1/2 -translate-y-1/2",
                "items-center justify-center rounded-full border border-border bg-background",
                "size-6 text-xs leading-none",
                "lg:h-auto lg:aspect-square lg:w-[13%] lg:text-base",
                "transition-colors outline-none hover:bg-muted",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            >
              <span aria-hidden="true">{identity.statusEmoji}</span>
            </button>
          ) : null}
        </div>

        {/* §4.2 Identity */}
        <div className="flex min-w-0 flex-col text-left">
          <h1 className="text-2xl font-bold text-foreground">
            {identity.displayName}
          </h1>
          <p className="text-xl font-normal text-muted-foreground">
            {identity.pronouns
              ? `${identity.handle} · ${identity.pronouns}`
              : identity.handle}
          </p>
          {identity.bio ? (
            <p className="mt-3 text-base whitespace-pre-line text-foreground">
              {identity.bio}
            </p>
          ) : null}
        </div>
      </div>

      {/* §4.3 Primary action — tonal, full-column width, a no-op (§13). */}
      {isOwner ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-border bg-muted font-medium text-foreground shadow-none dark:border-border dark:bg-muted"
        >
          Edit profile
        </Button>
      ) : null}

      {/* §4.4 Icon list — one icon column, every glyph decorative (§14). */}
      <ul className="flex flex-col gap-2 text-sm">
        <li className="mb-1 flex items-center gap-2">
          <Users aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">
              {formatCount(counts.followers)}
            </span>{" "}
            followers{" · "}
            <span className="font-bold text-foreground">
              {formatCount(counts.following)}
            </span>{" "}
            following
          </span>
        </li>

        {metaRows.map((row) => (
          <li key={row.kind} className="flex items-center gap-2">
            <MetaGlyph row={row} />
            <span className="min-w-0 break-words text-foreground">
              {row.href ? (
                // §16.23 — text/default, never accent-coloured.
                <a href={row.href} className="hover:underline">
                  {row.primary}
                </a>
              ) : (
                row.primary
              )}
              {row.secondary ? (
                <span className="text-muted-foreground"> {row.secondary}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {/* §4.5 Achievements — block and divider both vanish when empty (§13). */}
      {achievements.length > 0 ? (
        <>
          <Separator className="bg-border/60" />
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">Achievements</h2>
            <ul className="flex flex-nowrap items-start gap-[6%]">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="relative w-[20%] max-w-14 shrink-0">
                  {/* Artwork is arbitrary — never clipped to a common shape. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={achievement.imageUrl}
                    alt={achievement.name}
                    className="h-auto w-full"
                  />
                  {achievement.count !== undefined ? (
                    // Fill travels with the badge data, so it is inline style,
                    // never a token. Both fixture fills are dark — white text.
                    <span
                      style={{ backgroundColor: achievement.pillColor }}
                      className="absolute -right-1.5 -bottom-1 rounded-full px-1.5 text-[0.625rem] leading-4 font-bold text-white"
                    >
                      {achievement.count}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {/* §4.6 Organizations — the sidebar ends here (§16.5). */}
      {organizations.length > 0 ? (
        <>
          <Separator className="bg-border/60" />
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">Organizations</h2>
            <ul className="flex flex-nowrap items-start gap-2">
              {organizations.map((organization) => (
                <li key={organization.id} className="w-[12%] max-w-[34px] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={organization.avatarUrl}
                    alt={organization.name}
                    className="aspect-square h-auto w-full rounded-md border border-border object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </aside>
  )
}

/** The row's glyph. Decorative in every case — the row text carries it (§14). */
function MetaGlyph({ row }: { row: MetaRow }): React.JSX.Element {
  const className = "size-4 shrink-0 text-muted-foreground"

  switch (row.kind) {
    case "location":
      return <MapPin aria-hidden="true" className={className} />
    case "localTime":
      return <Clock aria-hidden="true" className={className} />
    case "social":
      return <LinkedInMark aria-hidden="true" className={className} />
    case "website":
    default:
      return <LinkIcon aria-hidden="true" className={className} />
  }
}

/**
 * lucide has no LinkedIn mark in this version, and §4.4 row 5 calls for a
 * *filled* brand mark rather than an outline system icon. Hand-rolled here and
 * filled with `currentColor` so it inherits the row's muted tone.
 */
function LinkedInMark(props: React.ComponentProps<"svg">): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
