// Pinned section (spec §6): a header row that is not a card, then a two-equal-
// column grid. `.pinned-grid` (profile.css) supplies equal row/column gaps and
// never sets `align-items: start`, which is what lets each row's cards stretch
// to match their tallest sibling (§17).

import type { ReactElement } from "react";
import type { PinnedRepo } from "@/data/profile-types";
import { PinnedRepoCard } from "@/components/profile/PinnedRepoCard";

interface Props {
  pinned: PinnedRepo[];
  isOwner: boolean;
}

export function PinnedGrid({ pinned, isOwner }: Props): ReactElement | null {
  // No pinned repositories omits the whole section, header and all (§13).
  if (pinned.length === 0) return null;

  return (
    <s-stack gap="base">
      <s-stack direction="inline" gap="base" alignItems="baseline" justifyContent="space-between">
        <h2 className="plain-heading">
          <s-paragraph>Pinned</s-paragraph>
        </h2>
        {/* Accent link, no button chrome, no underline at rest. Customizing
            pins is out of scope (§0), so it's a no-op like the sidebar's
            Edit profile. No rule beneath this row (§16.6). */}
        {isOwner && <s-link href="#">Customize your pins</s-link>}
      </s-stack>

      {/* Five cards in the fixture: the last row holds one card and nothing
          else — no placeholder, no ghost tile (§16.7). The grid itself makes
          that happen for free; there's no third element to add. */}
      <div className="pinned-grid">
        {pinned.map((repo) => (
          <PinnedRepoCard key={repo.name} repo={repo} isOwner={isOwner} />
        ))}
      </div>
    </s-stack>
  );
}
