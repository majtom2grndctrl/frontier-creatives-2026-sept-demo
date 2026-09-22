"use client"

import { PostRow } from "@/components/dashboard/post-row"
import { SectionCard } from "@/components/dashboard/section-card"
import { author, recentPosts } from "@/data/dashboard"

/**
 * Spec §9 — Recent posts. A full-column attached-heading card (§5.1) listing
 * every post in the shared full variant (§10.2). Rows are separated by
 * vertical spacing alone — no dividers — and rendered in fixture order.
 */
export function RecentPostsCard() {
  return (
    <SectionCard
      title="Recent posts"
      action={{
        label: "View all",
        description: "Browse every post you've published.",
      }}
    >
      <ul className="flex flex-col gap-6 px-6 py-6">
        {recentPosts.map((post) => (
          <li key={post.id}>
            <PostRow post={post} author={author} variant="full" />
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
