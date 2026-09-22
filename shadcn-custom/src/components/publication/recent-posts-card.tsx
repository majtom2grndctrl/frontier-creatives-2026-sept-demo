"use client"

import { CardHeaderBand, CardHeaderLink, SectionCard } from "./primitives"
import { PostRow } from "./post-row"
import type { Author, Post } from "@/lib/publication/types"

/**
 * Recent posts (spec §9). Full-variant post rows with no dividers between
 * them — the separation is vertical spacing alone.
 */
export function RecentPostsCard({
  posts,
  author,
}: {
  posts: Post[]
  author: Author
}) {
  return (
    <SectionCard>
      <CardHeaderBand
        title="Recent posts"
        headingId="recent-posts-heading"
        action={
          <CardHeaderLink
            title="All posts"
            description="The full archive isn't part of this prototype — it would open every published post with sorting and search."
          >
            View all
          </CardHeaderLink>
        }
      />
      <ul className="flex flex-col gap-s4 p-s3">
        {posts.map((post) => (
          <li key={post.id}>
            <PostRow post={post} author={author} variant="full" />
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
