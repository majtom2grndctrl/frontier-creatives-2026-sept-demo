"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import { IconButton } from "@/components/dashboard/icon-button"
import { SectionCard } from "@/components/dashboard/section-card"
import { StubMenu } from "@/components/dashboard/stub-menu"
import { Badge } from "@/components/ui/badge"
import { drafts } from "@/data/dashboard"
import { formatEditedAt } from "@/lib/dashboard/format"
import type { Post } from "@/lib/dashboard/types"

/**
 * Spec §8 — Section 3: Drafts. Attached-heading card (§5.1), equal in height to
 * the Latest post card beside it (§5, §7). `SectionCard` gets `className="h-full"`
 * so the grid row — not this component — sets the card's height; the Latest post
 * card is the taller neighbour, so it is the one that determines the row height.
 *
 * The body is a real vertical scroller (§8.2): the `SectionCard` body wrapper is
 * already `min-h-0 flex-1` inside the card's column flex, which gives it a
 * *bounded* height once the row height is set. The `<ul>` below then takes
 * `h-full overflow-y-auto` — never a fixed pixel height — so five rows overflow
 * that bounded box, the last row clips mid-height, and the native scrollbar
 * thumb (§8.2, §13) is the affordance that there's more below the fold.
 *
 * §8.4: `drafts` is rendered in fixture order, exactly as given — no sorting.
 * Ordering is a data concern owned by `src/data/dashboard.ts`, not this component.
 */
export function DraftsCard(): React.JSX.Element {
  return (
    <SectionCard
      title="Drafts"
      action={{
        label: "View all",
        description: "The full drafts list isn't wired up in this prototype.",
      }}
      className="h-full"
    >
      <ul className="h-full overflow-y-auto px-6 py-2">
        {drafts.map((draft) => (
          <DraftRow key={draft.id} draft={draft} />
        ))}
      </ul>
    </SectionCard>
  )
}

function DraftRow({ draft }: { draft: Post }) {
  // §8.3 / §15: an empty title renders the literal string "Untitled", in the
  // same element and style as a real title — real text, not a CSS ::after.
  const displayTitle = draft.title === "" ? "Untitled" : draft.title
  const editedText = draft.editedAt ? formatEditedAt(draft.editedAt) : ""
  const accessibleName = editedText ? `${displayTitle}. Edited ${editedText}` : displayTitle

  return (
    <li
      className="flex items-center gap-4 py-4"
      aria-label={accessibleName}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{displayTitle}</p>
        <p className="truncate text-xs text-muted-foreground">
          {editedText ? `Edited ${editedText}` : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="rounded-sm bg-muted text-foreground">
          Draft
        </Badge>
        <StubMenu
          label={`Actions for ${displayTitle}`}
          items={["Continue editing", "Rename", "Duplicate", "Delete"]}
        >
          <IconButton label={`Actions for ${displayTitle}`}>
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </IconButton>
        </StubMenu>
      </div>
    </li>
  )
}
