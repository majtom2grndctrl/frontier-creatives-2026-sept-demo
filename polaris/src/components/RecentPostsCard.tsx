// Section 4 — Recent posts (spec §9). Rows are separated by vertical rhythm
// alone; there are no dividers between them.

import { CardHeader, StubPopover } from "@/components/CardHeader";
import { PostRow } from "@/components/PostRow";
import type { Post } from "@/data/types";

export function RecentPostsCard({ posts }: { posts: Post[] }) {
  return (
    <s-section padding="none">
      <div className="card">
        <CardHeader heading="Recent posts" linkLabel="View all" commandFor="recent-posts-view-all" />

        <s-box padding="base">
          <s-stack gap="large-200">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} variant="full" />
            ))}
          </s-stack>
        </s-box>
      </div>

      <StubPopover id="recent-posts-view-all">All posts live on the Publish page.</StubPopover>
    </s-section>
  );
}
