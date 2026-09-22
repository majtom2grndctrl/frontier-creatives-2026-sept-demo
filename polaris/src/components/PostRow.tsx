// The shared post row (spec §10.2). One component, two variants: `compact` for
// the Latest post card, `full` for the Recent posts card. Truncation is a layout
// outcome of the column widths, never baked into the string.

import { CoverArt } from "@/components/CoverArt";
import { author } from "@/data/fixtures";
import type { Post } from "@/data/types";
import { formatInteger, formatOpenRate, formatPostDate } from "@/lib/format";

interface StackDatum {
  label: string;
  value: string;
}

function metricStacks(post: Post): StackDatum[] {
  const stats = post.stats;
  if (!stats) return [];
  return [
    { label: "Subs", value: formatInteger(stats.newSubscribers) },
    { label: "Views", value: formatInteger(stats.views) },
    { label: "Opened", value: formatOpenRate(stats.openRate, 0) },
  ];
}

function EngagementCount({ icon, count, noun }: { icon: "heart" | "chat"; count: number; noun: string }) {
  return (
    <s-stack direction="inline" gap="small-400" alignItems="center">
      <s-icon type={icon} size="small" color="subdued" />
      <s-text color="subdued" fontVariantNumeric="tabular-nums">
        {formatInteger(count)}
      </s-text>
      <s-text accessibilityVisibility="exclusive">{` ${noun}`}</s-text>
    </s-stack>
  );
}

function MetricStack({ stack }: { stack: StackDatum }) {
  return (
    <s-stack gap="small-500">
      <s-text type="strong" fontVariantNumeric="tabular-nums">
        {stack.value}
      </s-text>
      <s-paragraph color="subdued">{stack.label}</s-paragraph>
    </s-stack>
  );
}

// Below the breakpoint the metric stacks drop under the text block rather than
// shrinking (spec §16). Only one copy is laid out; `display: none` keeps the
// other out of the accessibility tree too.
const STACKS_INLINE = "@container (inline-size > 560px) auto, none";
const STACKS_BELOW = "@container (inline-size > 560px) none, auto";

export function PostRow({ post, variant }: { post: Post; variant: "compact" | "full" }) {
  const date = post.publishedAt ? formatPostDate(post.publishedAt) : "";
  const menuId = `post-menu-${post.id}`;
  const stacks = variant === "full" ? metricStacks(post) : [];

  // The text column takes the surplus and its title truncates; every other column
  // is sized to its content. Responsive value strings split on a comma, so the
  // track list cannot use `minmax(0, 1fr)` — `minInlineSize="0"` on the text item
  // disables the grid item's automatic minimum instead, which is what lets a
  // plain `1fr` shrink below its content.
  const columns =
    variant === "full"
      ? "@container (inline-size > 560px) auto 1fr 4rem 4rem 4rem auto auto, auto 1fr auto auto"
      : "auto minmax(0, 1fr) auto";

  return (
    <s-query-container>
      <s-grid gridTemplateColumns={columns} gap="small-100" alignItems="center">
        <CoverArt cover={post.cover} title={post.title} />

        <s-grid-item minInlineSize="0">
          <s-stack gap="small-400">
            <s-paragraph lineClamp={1}>
              <s-text type="strong">{post.title}</s-text>
            </s-paragraph>
            <s-paragraph color="subdued" lineClamp={1}>
              {`${date} · ${author.name}`}
            </s-paragraph>
            <s-stack direction="inline" gap="small-100" alignItems="center">
              <EngagementCount icon="heart" count={post.likes} noun="likes" />
              <EngagementCount icon="chat" count={post.comments} noun="comments" />
            </s-stack>

            {stacks.length > 0 ? (
              <s-box display={STACKS_BELOW} paddingBlockStart="small-200">
                <s-stack direction="inline" gap="large-200">
                  {stacks.map((stack) => (
                    <MetricStack key={stack.label} stack={stack} />
                  ))}
                </s-stack>
              </s-box>
            ) : null}
          </s-stack>
        </s-grid-item>

        {stacks.map((stack) => (
          <s-box key={stack.label} display={STACKS_INLINE}>
            <MetricStack stack={stack} />
          </s-box>
        ))}

        {variant === "full" ? (
          <s-button
            variant="tertiary"
            icon="arrow-up-right"
            accessibilityLabel={`Open ${post.title}`}
            commandFor={`${menuId}-open`}
          />
        ) : null}

        <s-button
          variant="tertiary"
          icon="menu-horizontal"
          accessibilityLabel={`More actions for ${post.title}`}
          commandFor={menuId}
        />

        <s-menu id={menuId} accessibilityLabel={`Actions for ${post.title}`}>
          <s-button icon="edit">Edit post</s-button>
          <s-button icon="share">Share</s-button>
          <s-button icon="duplicate">Duplicate</s-button>
        </s-menu>

        {variant === "full" ? (
          <s-popover id={`${menuId}-open`}>
            <s-box padding="base">
              <s-paragraph>Opening “{post.title}” is out of scope for this prototype.</s-paragraph>
            </s-box>
          </s-popover>
        ) : null}
      </s-grid>
    </s-query-container>
  );
}
