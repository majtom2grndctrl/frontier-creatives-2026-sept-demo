import { BookMarked, Grip, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatCount } from "@/lib/profile/format"
import type { PinnedRepo } from "@/lib/profile/types"

/**
 * Spec §9.1 — one pinned repository card.
 *
 * Fill is `bg-background`, the same surface as the page (§16.1) — never
 * `bg-card`. Border only; no shadow (§16.10). This is the tightest-padded card
 * type on the screen (§12.3).
 *
 * Stretch rule: `flex flex-col h-full` + a `flex-1` spacer between the optional
 * description and the footer. That is what gives equal-height rows *and* a
 * bottom-anchored footer, so a description-less card's language row lands on the
 * same baseline as its two-line-description neighbour's.
 */
export function PinnedRepoCard({
  repo,
  isOwner,
}: {
  repo: PinnedRepo
  isOwner: boolean
}) {
  const visibilityLabel =
    repo.visibility.charAt(0).toUpperCase() + repo.visibility.slice(1)

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-background p-4">
      {/* Header row */}
      <div className="flex items-start gap-2">
        <BookMarked className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
        {/* Names must not truncate — they wrap instead (§11 fixture: 28 chars beside 14). */}
        <a
          href="#"
          className="text-base font-bold break-words text-primary hover:underline"
        >
          {repo.name}
        </a>
        {/* Outline chip, never a filled badge: transparent fill + border/default. */}
        <Badge
          variant="outline"
          className="mt-0.5 bg-transparent text-sm font-normal text-muted-foreground"
        >
          {visibilityLabel}
        </Badge>
        {isOwner ? (
          <button
            type="button"
            className="-m-1 ml-auto shrink-0 rounded-md p-1 text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Grip className="size-4" aria-hidden />
            <span className="sr-only">Reorder {repo.name}</span>
          </button>
        ) : null}
      </div>

      {/* Description — omitted entirely when absent (§9.1), clamped to two lines. */}
      {repo.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {repo.description}
        </p>
      ) : null}

      {/* Flexible space: absorbs the row's extra height so the footer sinks. */}
      <div className="min-h-3 flex-1" aria-hidden />

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-4">
        {repo.language ? (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {/* DATA, not a token — inline style is the point (§12.1, §17). */}
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: repo.language.color }}
              aria-hidden
            />
            {repo.language.name}
          </span>
        ) : null}
        {/* A zero count renders nothing at all — no glyph, no "0" (§16.8). */}
        {repo.stars > 0 ? (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-4" aria-hidden />
            {formatCount(repo.stars)}
            <span className="sr-only">stars</span>
          </span>
        ) : null}
      </div>
    </div>
  )
}
