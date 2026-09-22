"use client"

import { MoreHorizontal } from "lucide-react"

import {
  CardHeaderBand,
  CardHeaderLink,
  OverflowMenu,
  SectionCard,
  StatusChip,
} from "./primitives"
import { formatEditedAt } from "@/lib/publication/format"
import type { Post } from "@/lib/publication/types"

/**
 * Drafts (spec §8). The card's height is set by the Latest post card beside
 * it, so the list scrolls inside and clips its last row — that partial row is
 * the affordance telling the reader there is more.
 *
 * The scroller is absolutely positioned inside a flexible box so it
 * contributes no intrinsic height: the card never grows to fit the list.
 *
 * Rows render in fixture order, which is deliberately not chronological.
 * Ordering is a data concern and no sort belongs here.
 */
export function DraftsCard({ drafts }: { drafts: Post[] }) {
  return (
    <SectionCard className="h-full">
      <CardHeaderBand
        title="Drafts"
        headingId="drafts-heading"
        action={
          <CardHeaderLink
            title="All drafts"
            description="The full drafts list isn't part of this prototype — it would open every unpublished post with filters and bulk actions."
          >
            View all
          </CardHeaderLink>
        }
      />

      <div className="relative min-h-s10 flex-1">
        <ul className="absolute inset-0 flex flex-col gap-s3 overflow-y-auto p-s3">
          {drafts.map((draft) => (
            <DraftRow key={draft.id} draft={draft} />
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}

function DraftRow({ draft }: { draft: Post }) {
  /* Real text, not a ::after — the fallback has to reach the a11y tree. */
  const title = draft.title || "Untitled"

  return (
    <li className="flex items-center gap-s2">
      <div className="flex min-w-0 flex-1 flex-col gap-s4xs">
        <a
          href="#"
          className="truncate rounded-sm text-t1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {title}
        </a>
        {draft.editedAt && (
          <p className="truncate text-sm text-muted-foreground">
            Edited {formatEditedAt(draft.editedAt)}
          </p>
        )}
      </div>
      <StatusChip>Draft</StatusChip>
      <OverflowMenu
        label={`More actions for "${title}"`}
        icon={<MoreHorizontal />}
        items={["Continue editing", "Rename", "Duplicate", "Discard"]}
      />
    </li>
  )
}
