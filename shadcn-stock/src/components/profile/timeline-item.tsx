"use client"

import * as React from "react"
import {
  BookMarked,
  FoldVertical,
  UnfoldVertical,
  CircleDot,
  Eye,
  GitCommitHorizontal,
  GitPullRequest,
  type LucideIcon,
} from "lucide-react"

import { barFraction, timelineTitle } from "@/lib/profile/format"
import type { TimelineDetail, TimelineItem, TimelineKind } from "@/lib/profile/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Spec §9.3 — the badge glyph varies by item kind. */
const KIND_ICON: Record<TimelineKind, LucideIcon> = {
  commits: GitCommitHorizontal,
  pullRequests: GitPullRequest,
  issues: CircleDot,
  reviews: Eye,
  createdRepository: BookMarked,
}

/**
 * The collapse control (§9.3): two arrows converging on a dotted line, `text/muted`,
 * **no border**, present at rest. Appears on every title row, and a second time on any
 * detail row flagged `collapsible`.
 */
function CollapseControl({
  expanded,
  onToggle,
  controls,
  label,
}: {
  expanded: boolean
  onToggle: () => void
  controls?: string
  label: string
}) {
  const Glyph = expanded ? UnfoldVertical : FoldVertical
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className="shrink-0 text-muted-foreground shadow-none"
    >
      <Glyph />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

/**
 * Volume bar (§9.3, §12.1): the ramp's darkest step inside a fixed-width track whose
 * right edge is flush with the sub-column's right edge. Length is proportional *within
 * the item*. Decorative — the count text already carries the value (§14).
 */
function VolumeBar({ fraction }: { fraction: number }) {
  return (
    <div
      aria-hidden="true"
      className="h-2 w-32 shrink-0 overflow-hidden rounded-full bg-border"
    >
      <div
        className="h-full rounded-full bg-chart-2"
        style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }}
      />
    </div>
  )
}

/**
 * Status group (§9.3): a solid `status/merged` pill with a bold `text/on-accent` count,
 * then the muted status word. §14 — the pill and the word are one phrase ("37 merged"),
 * so they are exposed as a single unit and the visual halves are hidden from AT.
 */
function StatusGroup({ pill }: { pill: NonNullable<TimelineDetail["statusPill"]> }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <span className="sr-only">{`${pill.count} ${pill.label}`}</span>
      <span
        aria-hidden="true"
        className="rounded-full bg-chart-3 px-2 py-0.5 text-xs font-bold text-primary-foreground"
      >
        {pill.count}
      </span>
      <span aria-hidden="true" className="text-sm text-muted-foreground">
        {pill.label}
      </span>
    </span>
  )
}

function DetailRow({ item, detail }: { item: TimelineItem; detail: TimelineDetail }) {
  // §9.3: a detail row may carry a collapse control of its own, in addition to the
  // title row's. The fixture has no nested rows beneath it to reveal.
  const [expanded, setExpanded] = React.useState(true)

  return (
    <div className="group flex items-center gap-3 py-1">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {/* §16.20: muted and un-underlined at rest; hovering the *row* accents it. */}
        <a
          href={detail.href}
          className="truncate text-muted-foreground group-hover:text-primary group-hover:underline"
        >
          {detail.repo}
        </a>
        {detail.countLabel ? (
          <>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <a
              href={detail.href}
              className="whitespace-nowrap text-muted-foreground group-hover:underline"
            >
              {detail.countLabel}
            </a>
          </>
        ) : null}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {detail.bar !== undefined ? (
          <VolumeBar fraction={barFraction(item, detail.bar)} />
        ) : null}
        {detail.statusPill ? <StatusGroup pill={detail.statusPill} /> : null}
        {detail.collapsible ? (
          <CollapseControl
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            label={`${expanded ? "Collapse" : "Expand"} ${detail.repo} details`}
          />
        ) : null}
      </div>
    </div>
  )
}

/**
 * Spec §9.3 — one timeline item: an icon badge centred on the rail, a plain-text title
 * row with a collapse control, and one detail row per repository.
 *
 * No divider, no timestamp, no avatar (§16.19).
 */
export function TimelineItemRow({ item }: { item: TimelineItem }): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(true)
  const detailsId = React.useId()
  const Glyph = KIND_ICON[item.kind]
  // Composed, never stored (§10) — pluralises "repository"/"repositories" for us.
  const title = timelineTitle(item)

  return (
    <div className="relative flex gap-3 pb-2">
      {/* Opaque fill + stacking context is what masks the rail behind the badge. */}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center",
          "rounded-md border border-border bg-background text-muted-foreground"
        )}
      >
        <Glyph className="size-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-h-8 items-center justify-between gap-3">
          <span className="min-w-0 text-base text-foreground">{title}</span>
          <CollapseControl
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            controls={detailsId}
            label={`${expanded ? "Collapse" : "Expand"} details for ${title}`}
          />
        </div>

        {expanded ? (
          <div id={detailsId} className="flex flex-col">
            {item.details.map((detail) => (
              <DetailRow key={detail.repo} item={item} detail={detail} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
