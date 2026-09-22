// PinnedRepoCard (spec §9.1).
//
// The stretch rule (§17): the grid's default `align-items: stretch` makes each
// card's `s-box` fill the row's height (`.pinned-grid` in profile.css never
// overrides that). Inside it, `.pinned-card` is a *plain* `<div>` — Polaris
// hosts render `display: contents`, so the flex column that actually stretches
// and the `.pinned-card__fill` spacer that pushes the footer to the bottom edge
// both need a real box to live on, not an `s-box`.

import type { CSSProperties, ReactElement } from "react";
import type { PinnedRepo } from "@/data/profile-types";

interface Props {
  repo: PinnedRepo;
  isOwner: boolean;
}

export function PinnedRepoCard({ repo, isOwner }: Props): ReactElement {
  return (
    <s-box background="base" border="base" borderRadius="base" padding="small-100">
      <div className="pinned-card">
        <s-stack direction="inline" gap="small-200" alignItems="center" justifyContent="space-between">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-icon type="git-repository" color="subdued" size="small" />
            <s-link href="#">
              <s-text type="strong">{repo.name}</s-text>
            </s-link>
            {/* Visibility pill: transparent fill, border/default outline — an
                outline chip, never a filled badge. `large-200` is the biggest
                radius the scale offers; at this box's height the browser
                clamps it to a full pill, so no literal radius is needed. */}
            <s-box border="base" borderRadius="large-200" paddingBlock="small-400" paddingInline="small-200">
              <s-text color="subdued">{repo.visibility === "public" ? "Public" : "Private"}</s-text>
            </s-box>
          </s-stack>

          {/* Present at rest on every card, not a hover affordance (§16.9).
              Owner-only; reordering itself is out of scope (§13). */}
          {isOwner && <s-icon type="drag-handle" color="subdued" size="small" />}
        </s-stack>

        {/* Omitted entirely when absent — no reserved space of its own; the
            flex spacer below covers the stretch rule regardless (§9.1). */}
        {repo.description && (
          <s-paragraph color="subdued" lineClamp={2}>
            {repo.description}
          </s-paragraph>
        )}

        <div className="pinned-card__fill" />

        <s-stack direction="inline" gap="base" alignItems="center">
          {repo.language && (
            <s-stack direction="inline" gap="small-300" alignItems="center">
              <span
                className="language-dot"
                style={{ "--language-color": repo.language.color } as CSSProperties}
              />
              <s-text color="subdued">{repo.language.name}</s-text>
            </s-stack>
          )}

          {/* A zero count renders nothing at all — no glyph, no "0" (§16.8). */}
          {repo.stars > 0 && (
            <s-stack direction="inline" gap="small-300" alignItems="center">
              <s-icon type="star" color="subdued" size="small" />
              <s-text color="subdued">{repo.stars}</s-text>
            </s-stack>
          )}
        </s-stack>
      </div>
    </s-box>
  );
}
