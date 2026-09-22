import { PinnedRepoCard } from "@/components/profile/pinned-repo-card"
import { SectionHeader } from "@/components/profile/section-header"
import type { PinnedRepo } from "@/lib/profile/types"

/**
 * Spec §6 — Region G, the pinned repositories grid.
 *
 * Two equal columns with equal row and column gaps. Deliberately **no**
 * `items-start`: the default `stretch` is what makes the cards in a row equal
 * height (§17). Five pins means the last row holds one card and *nothing* in
 * the right column — no placeholder, no ghost tile (§16.7). No rule beneath the
 * header (§16.6). With no pins the whole section, header and all, is omitted (§13).
 */
export function PinnedGrid({
  pinned,
  isOwner,
}: {
  pinned: PinnedRepo[]
  isOwner: boolean
}) {
  if (pinned.length === 0) return null

  return (
    <section aria-labelledby="pinned-heading">
      <SectionHeader
        id="pinned-heading"
        label="Pinned"
        action={
          isOwner ? (
            <button type="button" className="text-sm text-primary hover:underline">
              Customize your pins
            </button>
          ) : undefined
        }
      />
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {pinned.map((repo) => (
          <PinnedRepoCard key={repo.name} repo={repo} isOwner={isOwner} />
        ))}
      </div>
    </section>
  )
}
