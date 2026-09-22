"use client"

import { ArrowUpRight, Heart, MessageCircle, MoreHorizontal, Text } from "lucide-react"

import { IconButton, OverflowMenu } from "./primitives"
import { formatPostDate, formatRate } from "@/lib/publication/format"
import type { Author, Post } from "@/lib/publication/types"
import { cn } from "@/lib/utils"

/**
 * The shared post row (spec §10.2). One component, two variants:
 *
 * - `compact` — the left block plus an overflow button. Nothing else.
 * - `full`    — the left block, three metric stacks, an open-in-place arrow
 *               and an overflow button.
 *
 * Title truncation is a layout outcome, not something baked into the string:
 * the same record truncates in the half-width Latest post card and renders in
 * full in the full-width Recent posts row.
 */
export function PostRow({
  post,
  author,
  variant,
}: {
  post: Post
  author: Author
  variant: "compact" | "full"
}) {
  const title = post.title || "Untitled"
  const date = post.publishedAt ? formatPostDate(post.publishedAt) : ""
  const accessibleName = [title, date, author.name].filter(Boolean).join(", ")

  return (
    <article className="flex flex-wrap items-center gap-x-s2 gap-y-s2">
      <PostThumbnail post={post} />

      <div className="flex min-w-0 flex-1 basis-s10 flex-col gap-s4xs">
        <a
          href="#"
          aria-label={accessibleName}
          className="truncate rounded-sm text-t1 font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {title}
        </a>
        <p className="truncate text-sm text-muted-foreground">
          {date} &middot; {author.name}
        </p>
        <p className="flex items-center gap-s2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-s4xs">
            <Heart aria-hidden className="size-3.5" />
            <span>
              {post.likes}
              <span className="sr-only"> likes</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-s4xs">
            <MessageCircle aria-hidden className="size-3.5" />
            <span>
              {post.comments}
              <span className="sr-only"> comments</span>
            </span>
          </span>
        </p>
      </div>

      {variant === "full" && post.stats && (
        /* Below md the stacks drop under the text block rather than shrink. */
        <dl className="order-last flex w-full gap-s2 pl-s11 md:order-none md:w-auto md:pl-0">
          <MetricStack label="Subs" value={post.stats.newSubscribers} />
          <MetricStack label="Views" value={post.stats.views} />
          <MetricStack label="Opened" value={formatRate(post.stats.openRate)} />
        </dl>
      )}

      <div className="flex shrink-0 items-center">
        {variant === "full" && (
          <IconButton label={`Open "${title}"`}>
            <ArrowUpRight />
          </IconButton>
        )}
        <OverflowMenu
          label={`More actions for "${title}"`}
          icon={<MoreHorizontal />}
          items={["Edit", "Duplicate", "Copy link", "Unpublish"]}
        />
      </div>
    </article>
  )
}

/**
 * Fixed-size landscape thumbnail. A post with no cover renders a tinted
 * placeholder with a centred lines-of-text glyph — never a broken image or a
 * collapsed box.
 */
function PostThumbnail({ post, className }: { post: Post; className?: string }) {
  return (
    <div
      className={cn(
        "h-s7 w-s10 shrink-0 overflow-hidden rounded-md border border-border bg-muted",
        className
      )}
    >
      {post.coverUrl ? (
        <img
          src={post.coverUrl}
          alt=""
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Text aria-hidden className="size-5 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

/** A value over its label, left-aligned so the columns form vertical rules. */
function MetricStack({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex w-s6 flex-col-reverse">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-t1 tabular-nums">{value}</dd>
    </div>
  )
}
