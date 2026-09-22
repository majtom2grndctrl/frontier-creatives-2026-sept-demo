// Section 2 — Latest post (spec §7). Its numbers are derived from the same post
// record as the first Recent posts row, so the two cannot disagree.

import { CardHeader, StubPopover } from "@/components/CardHeader";
import { PostRow } from "@/components/PostRow";
import type { Ref } from "react";
import type { Post } from "@/data/types";
import { formatInteger, formatOpenRate, formatSigned } from "@/lib/format";

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
      <s-text>{label}</s-text>
      <s-text fontVariantNumeric="tabular-nums">{value}</s-text>
    </s-stack>
  );
}

export function LatestPostCard({ post, cardRef }: { post: Post; cardRef?: Ref<HTMLDivElement> }) {
  const stats = post.stats;

  return (
    <s-section padding="none">
      <div className="card" ref={cardRef}>
        <CardHeader heading="Latest post" linkLabel="View stats" commandFor="latest-post-stats" />

        <s-box padding="base">
          <PostRow post={post} variant="compact" />
        </s-box>
        <s-divider />

        {stats ? (
          <>
            <s-box padding="base">
              <s-stack gap="large-100">
                <MetricRow label="Total views" value={formatInteger(stats.views)} />
                <MetricRow label="New subscribers" value={formatSigned(stats.newSubscribers)} />
                <MetricRow label="Open rate" value={formatOpenRate(stats.openRate)} />
              </s-stack>
            </s-box>
            <s-divider />
          </>
        ) : null}

        <s-box padding="base">
          <s-button variant="secondary" icon="share" inlineSize="fill" commandFor="share-post">
            Share post
          </s-button>
        </s-box>
      </div>

      <StubPopover id="latest-post-stats">
        Full post analytics are out of scope for this prototype.
      </StubPopover>
      <StubPopover id="share-post">Copy link · Share to email · Share to social.</StubPopover>
    </s-section>
  );
}
