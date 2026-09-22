"use client"

import {
  ArrowUpRight,
  FileText,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react"

import { IconButton } from "@/components/dashboard/icon-button"
import { StubMenu } from "@/components/dashboard/stub-menu"
import { formatInteger, formatOpenRate, formatPostDate } from "@/lib/dashboard/format"
import type { Author, Post } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

/**
 * Spec §10.2 — the shared post row, used compact by §7 (Latest post) and full
 * by §9 (Recent posts). One left block (thumbnail + title + meta + engagement)
 * shared by both variants; the full variant appends metric stacks + actions.
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
  const metaText = `${formatPostDate(post.publishedAt ?? "")} • ${author.name}`
  const accessibleName = `${post.title}. ${metaText}`

  return (
    <div className="flex items-center gap-3" aria-label={accessibleName}>
      {/* Thumbnail */}
      {/* §10.2 — a fixed-size *landscape* rounded rectangle, not a square. */}
      <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <FileText aria-hidden="true" className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Text block */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{post.title}</p>
        <p className="truncate text-xs text-muted-foreground">{metaText}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart aria-hidden="true" className="size-3.5" />
            <span aria-hidden="true">{formatInteger(post.likes)}</span>
            <span className="sr-only">
              {post.likes} {post.likes === 1 ? "like" : "likes"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle aria-hidden="true" className="size-3.5" />
            <span aria-hidden="true">{formatInteger(post.comments)}</span>
            <span className="sr-only">
              {post.comments} {post.comments === 1 ? "comment" : "comments"}
            </span>
          </span>
        </div>
      </div>

      {variant === "compact" ? (
        <StubMenu label="Post actions" items={["Edit", "Duplicate", "Copy link", "Delete"]}>
          <IconButton label="More">
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </IconButton>
        </StubMenu>
      ) : (
        <FullVariantActions post={post} />
      )}
    </div>
  )
}

function FullVariantActions({ post }: { post: Post }) {
  const stats = post.stats
  return (
    <div className="flex shrink-0 items-center gap-4">
      <MetricStack label="Subs" value={stats ? formatInteger(stats.newSubscribers) : "—"} />
      <MetricStack label="Views" value={stats ? formatInteger(stats.views) : "—"} />
      <MetricStack
        label="Opened"
        value={stats ? formatOpenRate(stats.openRate, 0) : "—"}
      />

      <StubMenu label="Open post" items={["Open post", "Open in new tab"]}>
        <IconButton label="Open post">
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </IconButton>
      </StubMenu>

      <StubMenu label="Post actions" items={["Edit", "Duplicate", "Copy link", "Delete"]}>
        <IconButton label="More">
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </IconButton>
      </StubMenu>
    </div>
  )
}

function MetricStack({ label, value }: { label: string; value: string }) {
  return (
    <dl className={cn("w-14 shrink-0 flex flex-col-reverse")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </dl>
  )
}
