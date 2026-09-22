// Section 3 — Drafts (spec §8). The card takes its height from the Latest post
// card beside it, so the list scrolls inside and clips its last row. Rows render
// in fixture order — the sample order is deliberately not chronological, and
// ordering is a data concern, so nothing here sorts.

import { CardHeader, StubPopover } from "@/components/CardHeader";
import type { Post } from "@/data/types";
import { formatEditedAt } from "@/lib/format";

function DraftRow({ draft }: { draft: Post }) {
  // `Untitled` is real text, so it reaches the accessibility tree.
  const title = draft.title || "Untitled";
  const menuId = `draft-menu-${draft.id}`;

  return (
    <s-grid gridTemplateColumns="minmax(0, 1fr) auto auto" gap="small-100" alignItems="center">
      <s-grid-item minInlineSize="0">
        <s-stack gap="small-500">
          <s-paragraph lineClamp={1}>{title}</s-paragraph>
          <s-paragraph color="subdued">Edited {formatEditedAt(draft.editedAt!)}</s-paragraph>
        </s-stack>
      </s-grid-item>

      <s-badge tone="neutral">Draft</s-badge>

      <s-button
        variant="tertiary"
        icon="menu-horizontal"
        accessibilityLabel={`More actions for ${title}`}
        commandFor={menuId}
      />
      <s-menu id={menuId} accessibilityLabel={`Actions for ${title}`}>
        <s-button icon="edit">Continue editing</s-button>
        <s-button icon="delete" tone="critical">
          Delete draft
        </s-button>
      </s-menu>
    </s-grid>
  );
}

export function DraftsCard({ drafts, blockSize }: { drafts: Post[]; blockSize?: number }) {
  return (
    <s-section padding="none">
      {/* Height comes from the Latest post card, so the list clips rather than
          the card growing. Both cards carry identical chrome, so matching the
          inner heights matches the outer ones. */}
      <div className="card" style={blockSize ? { blockSize: `${blockSize}px` } : undefined}>
        <CardHeader heading="Drafts" linkLabel="View all" commandFor="drafts-view-all" />

        <div className="card__scroll">
          <s-box padding="base">
            <s-stack gap="large-200">
              {drafts.map((draft) => (
                <DraftRow key={draft.id} draft={draft} />
              ))}
            </s-stack>
          </s-box>
        </div>
      </div>

      <StubPopover id="drafts-view-all">All drafts live on the Publish page.</StubPopover>
    </s-section>
  );
}
