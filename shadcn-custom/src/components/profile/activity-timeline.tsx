"use client"

import * as React from "react"
import {
  BookMarked,
  CircleDot,
  Eye,
  FoldVertical,
  GitCommitHorizontal,
  GitPullRequest,
  UnfoldVertical,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { SectionHeader } from "@/components/profile/primitives"
import { pluralize } from "@/lib/profile/format"
import { RAMP_STRONG } from "@/lib/profile/ramp"
import type {
  TimelineDetail,
  TimelineItem as TimelineItemData,
  TimelineKind,
  TimelineMonth,
} from "@/lib/profile/types"
import { cn } from "@/lib/utils"

const HEADING_ID = "contribution-activity"

/**
 * The rail's x-offset, the month label's inset, and the item content's indent
 * are one system: the rail drops from the month label's left edge and every
 * icon badge is centred on it. Changing one without the others breaks the
 * alignment, so they are named here rather than sprinkled through the markup.
 */
const RAIL_X = "left-s3"
const RAIL_INSET = "pl-s3"
const ITEM_INDENT = "pl-s6"

/* -------------------------------------------------------------------------
   Kind → glyph, kind → sentence (spec §9.3, §10)
   ---------------------------------------------------------------------- */

const KIND_ICON: Record<TimelineKind, LucideIcon> = {
  commits: GitCommitHorizontal,
  pullRequests: GitPullRequest,
  issues: CircleDot,
  reviews: Eye,
  createdRepository: BookMarked,
}

/**
 * The title is derived, never stored (spec §10): keeping the sentence in the
 * fixture lets its two halves drift from `count` and `repositoryCount`. Both
 * halves pluralize independently — the acceptance check is item 1 reading
 * "1 repository" beside item 3's "2 repositories" (§18).
 */
function titleFor(item: TimelineItemData): string {
  const inRepos = ` in ${pluralize(item.repositoryCount, "repository", "repositories")}`

  switch (item.kind) {
    case "commits":
      return `Created ${pluralize(item.count, "commit", "commits")}${inRepos}`
    case "pullRequests":
      return `Opened ${pluralize(item.count, "pull request", "pull requests")}${inRepos}`
    case "issues":
      return `Opened ${pluralize(item.count, "issue", "issues")}${inRepos}`
    case "reviews":
      return `Reviewed ${pluralize(item.count, "pull request", "pull requests")}${inRepos}`
    // The repositories *are* the subject here, so the trailing clause would
    // only repeat the count back.
    case "createdRepository":
      return `Created ${pluralize(item.count, "repository", "repositories")}`
  }
}

/**
 * Only `merged` has a role in §12.1. The other two tones never appear in the
 * fixture, so they take the neutral recessed pill rather than a hue invented
 * for them — a wrong colour would read as meaning.
 */
const PILL_TONE: Record<
  NonNullable<TimelineDetail["statusPill"]>["tone"],
  string
> = {
  merged: "bg-gold-700 text-white",
  open: "bg-surface-sunken text-foreground",
  closed: "bg-surface-sunken text-foreground",
}

/* -------------------------------------------------------------------------
   Collapse control (spec §9.3, §13, §14)
   ---------------------------------------------------------------------- */

/**
 * Two arrows converging on a dotted line, borderless and muted. It is a
 * `CollapsibleTrigger`, so the copy that rides on a status row toggles the
 * same item as the one on the title row (§13) — that duplication is in the
 * source, not an accident of composition.
 */
function CollapseControl({ label, open }: { label: string; open: boolean }) {
  const Glyph = open ? FoldVertical : UnfoldVertical

  return (
    <CollapsibleTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={label}
        className="text-muted-foreground hover:text-foreground"
      >
        <Glyph />
      </Button>
    </CollapsibleTrigger>
  )
}

/* -------------------------------------------------------------------------
   Detail row trailing elements (spec §9.3)
   ---------------------------------------------------------------------- */

/**
 * The bar is proportional *within its item* — the item's largest repository
 * fills the track — so the ratio is computed at render time and set inline
 * (§10). A percentage derived from data is not a hardcoded size.
 * `aria-hidden` because the adjacent count link already says the number (§14).
 */
function VolumeBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0

  return (
    <div aria-hidden className="w-s10 shrink-0">
      <div
        className={cn("h-s2xs rounded-full", RAMP_STRONG.bg)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * "37 merged" is one phrase, so the visible pill and word are both hidden
 * from assistive tech and the phrase is exposed once (§14). Reading them as
 * two fragments turns a status into a stray number.
 */
function StatusGroup({
  pill,
}: {
  pill: NonNullable<TimelineDetail["statusPill"]>
}) {
  return (
    <span className="flex shrink-0 items-center gap-s3xs">
      <span className="sr-only">{`${pill.count} ${pill.label}`}</span>
      <Badge
        aria-hidden
        className={cn("px-s2xs font-bold tabular-nums", PILL_TONE[pill.tone])}
      >
        {pill.count}
      </Badge>
      <span aria-hidden className="text-sm text-muted-foreground">
        {pill.label}
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------
   Detail row (spec §9.3, §13, §16.20)
   ---------------------------------------------------------------------- */

const LINK_CLASS =
  "rounded-xs underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

/**
 * Hovering anywhere on the row drives both links, which is why the `group`
 * sits on the row and not on either anchor. At rest the path is muted and
 * un-underlined — it is deliberately *not* accent-coloured (§16.20).
 */
function DetailRow({
  detail,
  max,
  itemTitle,
  open,
}: {
  detail: TimelineDetail
  max: number
  itemTitle: string
  open: boolean
}) {
  return (
    <div className="group flex items-center gap-s3xs text-sm">
      <a
        href={detail.href}
        className={cn(
          LINK_CLASS,
          "truncate text-muted-foreground group-hover:text-accent-solid group-hover:underline"
        )}
      >
        {detail.repo}
      </a>
      {detail.countLabel ? (
        <>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <a
            href={detail.href}
            className={cn(
              LINK_CLASS,
              "shrink-0 text-muted-foreground group-hover:underline"
            )}
          >
            {detail.countLabel}
          </a>
        </>
      ) : null}

      {/* The trailing element's right edge is flush with the sub-column's. */}
      <div className="ml-auto flex shrink-0 items-center gap-s3xs pl-s2">
        {detail.bar !== undefined ? (
          <VolumeBar value={detail.bar} max={max} />
        ) : null}
        {detail.statusPill ? <StatusGroup pill={detail.statusPill} /> : null}
        {detail.collapsible ? (
          <CollapseControl label={`Toggle details for ${itemTitle}`} open={open} />
        ) : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------
   TimelineItem (spec §9.3)
   ---------------------------------------------------------------------- */

function TimelineItem({ item }: { item: TimelineItemData }) {
  const [open, setOpen] = React.useState(true)

  const Glyph = KIND_ICON[item.kind]
  const title = titleFor(item)
  const max = Math.max(0, ...item.details.map((detail) => detail.bar ?? 0))

  return (
    <div className={cn("relative pb-s4 last:pb-0", ITEM_INDENT)}>
      {/* The badge masks the rail, so its fill has to be the page surface
          rather than transparent. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0 flex size-s4 -translate-x-1/2 items-center justify-center rounded-xs border border-border bg-background",
          RAIL_X
        )}
      >
        <Glyph className="size-s1 text-muted-foreground" />
      </span>

      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-start justify-between gap-s2">
          <h4 className="text-t1 font-normal text-foreground">{title}</h4>
          <CollapseControl label={`Toggle details for ${title}`} open={open} />
        </div>
        <CollapsibleContent className="mt-s3xs flex flex-col gap-s3xs">
          {item.details.map((detail) => (
            <DetailRow
              key={detail.repo}
              detail={detail}
              max={max}
              itemTitle={title}
              open={open}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

/* -------------------------------------------------------------------------
   Month block (spec §8)
   ---------------------------------------------------------------------- */

function MonthBlock({ month }: { month: TimelineMonth }) {
  return (
    <div className="flex flex-col gap-s4xs">
      <div className={cn("flex items-center gap-s2", RAIL_INSET)}>
        <h3 className="text-t1 whitespace-nowrap">
          <span className="font-bold text-foreground">{month.month}</span>{" "}
          <span className="font-normal text-muted-foreground">{month.year}</span>
        </h3>
        {/* Wrapped so the flex sizing lands on the wrapper — `Separator`'s own
            `w-full` would otherwise fight a `flex-1` passed to it. */}
        <div className="flex-1">
          <Separator />
        </div>
      </div>

      {/* The rail is anchored to this wrapper, not to the section, so its
          extent is exactly the item stack's: it clears the month rule above
          and stops a step past the last item, well short of the button (§8). */}
      <div className="relative py-s1">
        <span
          aria-hidden
          className={cn("absolute inset-y-0 w-px bg-border/60", RAIL_X)}
        />
        {month.items.map((item, i) => (
          <TimelineItem key={`${item.kind}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------
   Contribution activity (spec §8, Region H1)
   ---------------------------------------------------------------------- */

export function ActivityTimeline({
  timeline,
  hasMoreActivity,
}: {
  timeline: TimelineMonth[]
  hasMoreActivity: boolean
}): React.JSX.Element {
  // A month with nothing in it would render a rule and a bare rail.
  const months = timeline.filter((month) => month.items.length > 0)

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="flex w-full flex-col gap-s5"
    >
      {/* The heading binds to the month stack; the button is a sibling of the
          pair, so it sits a full step clear of the last item instead of
          reading as one more row of the timeline. */}
      <div className="flex flex-col gap-s1">
        <SectionHeader id={HEADING_ID} title="Contribution activity" />

        {months.length === 0 ? (
          /* One muted line, no month header, no rail, no button (§13). */
          <p className="text-t1 text-muted-foreground">
            No contribution activity in the selected year.
          </p>
        ) : (
          <div className="flex flex-col gap-s5">
            {months.map((month) => (
              <MonthBlock key={`${month.month}-${month.year}`} month={month} />
            ))}
          </div>
        )}
      </div>

      {months.length > 0 && hasMoreActivity ? (
        /* Outline, not a solid accent fill (§16.21), and `variant="outline"`
           ships a `shadow-xs` this screen does not allow (§16.10). */
        <Button
          type="button"
          variant="outline"
          className="w-full border-border bg-background font-bold text-accent-solid shadow-none hover:text-accent-solid dark:bg-background"
        >
          Show more activity
        </Button>
      ) : null}
    </section>
  )
}
