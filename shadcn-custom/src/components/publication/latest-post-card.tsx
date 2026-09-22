"use client"

import { Copy, Share } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CardHeaderBand, CardHeaderLink, SectionCard } from "./primitives"
import { PostRow } from "./post-row"
import { formatRate, formatSigned } from "@/lib/publication/format"
import type { Author, Post } from "@/lib/publication/types"

/**
 * Latest post (spec §7). An attached-heading card in three blocks separated
 * by hairline dividers: the header band, the post summary row, and the metric
 * list with its share action.
 *
 * The metric rows are read off the same `Post` record the Recent posts table
 * renders, so the two sections cannot drift apart.
 */
export function LatestPostCard({
  post,
  author,
}: {
  post: Post
  author: Author
}) {
  const stats = post.stats
  const title = post.title || "Untitled"

  return (
    <SectionCard className="h-full">
      <CardHeaderBand
        title="Latest post"
        headingId="latest-post-heading"
        action={
          <CardHeaderLink
            title="Post stats"
            description="The full stats view isn't part of this prototype — it would open views, opens, clicks and subscriber attribution for this post."
          >
            View stats
          </CardHeaderLink>
        }
      />

      <div className="border-b border-border p-s3">
        <PostRow post={post} author={author} variant="compact" />
      </div>

      <div className="flex flex-1 flex-col gap-s4 p-s3">
        {stats && (
          /* No dividers between rows — the vertical rhythm does the work. */
          <dl className="flex flex-col gap-s3">
            <MetricRow label="Total views" value={stats.views.toLocaleString()} />
            <MetricRow
              label="New subscribers"
              value={formatSigned(stats.newSubscribers)}
            />
            <MetricRow label="Open rate" value={formatRate(stats.openRate, 2)} />
          </dl>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="mt-auto w-full bg-accent-tonal font-semibold text-accent-on-tonal hover:bg-accent-tonal/70"
              size="lg"
            >
              <Share />
              Share post
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center">
            <PopoverTitle className="text-t1 font-semibold">
              Share &ldquo;{title}&rdquo;
            </PopoverTitle>
            <PopoverDescription className="mt-s3xs text-sm">
              A share sheet would open here.
            </PopoverDescription>
            <Button variant="outline" size="sm" className="mt-s2 w-full">
              <Copy />
              Copy link
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </SectionCard>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-s2">
      <dt className="text-t1 text-muted-foreground">{label}</dt>
      <dd className="text-t1 tabular-nums">{value}</dd>
    </div>
  )
}
