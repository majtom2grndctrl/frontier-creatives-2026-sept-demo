"use client"

import * as React from "react"
import { Share } from "lucide-react"

import { PostRow } from "@/components/dashboard/post-row"
import { SectionCard } from "@/components/dashboard/section-card"
import { StubPopover } from "@/components/dashboard/stub-menu"
import { Button } from "@/components/ui/button"
import { author, latestPost } from "@/data/dashboard"
import { formatInteger, formatOpenRate, formatSigned } from "@/lib/dashboard/format"

/**
 * Spec §7 — Section 2: Latest post. Attached-heading card (§5.1), rendered via
 * `SectionCard`, which owns the header band + its divider. Three body blocks
 * below, separated from each other by hairline dividers: the compact post
 * summary row, the metric list (generous rhythm, no dividers between its own
 * rows — §7.3), and the tonal `Share post` button (§7.4).
 *
 * §12.3: every metric value below is derived from `latestPost.stats`, the same
 * record §9's full post row reads, so the two sections can never disagree.
 */
export function LatestPostCard(): React.JSX.Element {
  const stats = latestPost.stats

  return (
    <SectionCard
      title="Latest post"
      action={{
        label: "View stats",
        description: "Detailed post analytics aren't wired up in this prototype.",
      }}
      className="h-full"
      bodyClassName="flex h-full flex-col"
    >
      <div className="px-6 py-5">
        <PostRow post={latestPost} author={author} variant="compact" />
      </div>

      <dl className="flex flex-col gap-5 border-t px-6 py-6">
        <MetricRow label="Total views" value={stats ? formatInteger(stats.views) : "—"} />
        <MetricRow
          label="New subscribers"
          value={stats ? formatSigned(stats.newSubscribers) : "—"}
        />
        <MetricRow label="Open rate" value={stats ? formatOpenRate(stats.openRate) : "—"} />
      </dl>

      <div className="mt-auto border-t px-6 py-5">
        <StubPopover
          title="Share post"
          description="Copy a link to this post to share it wherever you'd like."
          footer={
            <Button variant="outline" size="sm" className="w-fit">
              Copy link
            </Button>
          }
        >
          <Button
            variant="ghost"
            className="w-full bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary"
          >
            <Share aria-hidden="true" className="size-4" />
            Share post
          </Button>
        </StubPopover>
      </div>
    </SectionCard>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}
