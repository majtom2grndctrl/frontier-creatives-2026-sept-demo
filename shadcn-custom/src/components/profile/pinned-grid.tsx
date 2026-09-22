import * as React from "react"
import { Book, GripVertical, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ProfileCard,
  SectionHeader,
  SectionHeaderAction,
} from "@/components/profile/primitives"
import type { PinnedRepo } from "@/lib/profile/types"

/* -------------------------------------------------------------------------
   PinnedRepoCard (spec §9.1)
   ---------------------------------------------------------------------- */

function PinnedRepoCard({
  repo,
  isOwner,
}: {
  repo: PinnedRepo
  isOwner: boolean
}) {
  const visibilityLabel =
    repo.visibility.charAt(0).toUpperCase() + repo.visibility.slice(1)

  return (
    // Tightest padding on the screen (spec §12.3) — deliberately less than
    // the README card's p-s6. One step above the ramp's type-derived value for
    // the same reason: the card's width is set by the grid, not by the type
    // size, so its padding did not shrink when the type scale did.
    <ProfileCard className="flex h-full flex-col px-s4 py-s4">
      {/* One flat row, and it must not wrap (spec §9.1: the handle sits at the
          header row's right end). Only the name wraps, inside its own box via
          `break-words` + `min-w-0` — a wrapping *row* orphans the glyph on a
          line of its own once a 28-char name like "inventory-forecast-prototype"
          no longer fits, which is what a `flex-wrap` group did here.

          The two `mt-0.5`s are optical nudges, not layout: `items-start` pins
          the glyph and the chip to the name's first line, and 2px centres their
          shorter line boxes against the name's 20px one. Nothing on the ramp is
          that small, and a one-off micro-adjustment inside a component is what
          the numeric scale is for. */}
      <div className="flex items-start gap-x-s2xs">
        <Book
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        />
        <a
          href="#"
          className="min-w-0 break-words text-t1 font-bold text-accent-solid underline-offset-4 hover:underline"
        >
          {repo.name}
        </a>
        {/* Outline chip, never a filled badge (spec §9.1) — transparent
            fill is what tells "Public" apart from a status badge. Badge
            already ships shrink-0, rounded-full and text-xs; only the muted
            colour and regular weight are this screen's own decisions. */}
        <Badge
          variant="outline"
          className="mt-0.5 px-s2xs font-normal text-muted-foreground"
        >
          {visibilityLabel}
        </Badge>
        {isOwner ? (
          // A real button so it has a keyboard-reachable accessible name
          // (spec §14). Reordering itself is out of scope (spec §13), so the
          // handler stays a no-op rather than pretending to be wired up.
          // `Button` already carries shrink-0, outline-none and the focus
          // ring; `rounded-xs` because --radius-md on a 24px box is a circle.
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Reorder ${repo.name}`}
            className="-mt-0.5 ml-auto rounded-xs text-muted-foreground hover:text-foreground"
          >
            <GripVertical aria-hidden className="size-4" />
          </Button>
        ) : null}
      </div>

      {/* Omitted entirely when absent — no wrapper, so a repo without one
          contributes no box and no margin (spec §9.1). */}
      {repo.description ? (
        <p className="mt-s2 line-clamp-2 text-sm text-muted-foreground">
          {repo.description}
        </p>
      ) : null}

      {/* The flexible spacer (spec §9.1, §17). `flex-1` absorbs the row's
          surplus height so the footer sinks to the bottom and stays level with
          a taller sibling's; `min-h-s2` is the floor, so the footer still
          clears whatever is above it when there is no surplus to absorb. It
          holds space and nothing else, hence aria-hidden. */}
      <div className="min-h-s2 flex-1" aria-hidden />

      <div className="flex items-center gap-s2">
        {repo.language ? (
          <span className="flex items-center gap-s3xs">
            {/* Language color is data, not a token (spec §9.1, §17) — the
                only inline style in this file. */}
            <span
              aria-hidden
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: repo.language.color }}
            />
            <span className="text-sm text-muted-foreground">
              {repo.language.name}
            </span>
          </span>
        ) : null}
        {repo.stars > 0 ? (
          <span className="flex items-center gap-s4xs text-sm text-muted-foreground">
            <Star aria-hidden className="size-4" />
            {repo.stars}
          </span>
        ) : null}
      </div>
    </ProfileCard>
  )
}

/* -------------------------------------------------------------------------
   PinnedGrid (spec §6, Region G)
   ---------------------------------------------------------------------- */

export function PinnedGrid({
  pinned,
  isOwner,
}: {
  pinned: PinnedRepo[]
  isOwner: boolean
}): React.JSX.Element | null {
  // No pinned repositories → omit the whole section, header and all
  // (spec §13 empty states).
  if (pinned.length === 0) return null

  return (
    <section className="flex flex-col gap-s1">
      {/* No rule beneath this header (spec §16.6) — SectionHeader doesn't
          add one, so there's nothing to suppress. */}
      <SectionHeader
        title="Pinned"
        action={
          isOwner ? (
            <SectionHeaderAction>Customize your pins</SectionHeaderAction>
          ) : undefined
        }
      />
      {/* One gap-* for both axes (spec §6, §17) so row and column gaps can't
          drift apart. Default align-items: stretch (not "start") is what
          makes cards fill their row's height. Collapses to one column below
          the wide breakpoint (§15); two columns of repository card at phone
          width leave nothing but wrapped fragments. */}
      <div className="grid grid-cols-1 gap-s4 lg:grid-cols-2">
        {pinned.map((repo) => (
          <PinnedRepoCard key={repo.name} repo={repo} isOwner={isOwner} />
        ))}
      </div>
    </section>
  )
}
