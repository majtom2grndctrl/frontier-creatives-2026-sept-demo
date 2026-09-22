import type { Metadata } from "next";

import { ContentColumn } from "@/components/dashboard/app-shell";
import { DraftsCard } from "@/components/dashboard/drafts-card";
import { LatestPostCard } from "@/components/dashboard/latest-post-card";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { RecentPostsCard } from "@/components/dashboard/recent-posts-card";

export const metadata: Metadata = {
  title: "Meridian Notes — Home",
  description: "Publication home dashboard",
};

/**
 * Region B2 — the publication Home dashboard (spec §5).
 *
 * Section order and column spans come straight from §5's table: Overview full,
 * Latest post and Drafts as a two-column grid row, Recent posts full. The grid
 * row's items stretch so §7 and §8 are equal height, sized by the taller of the
 * two — which is what makes the Drafts list clip its last row (§8.2).
 *
 * §5's fifth section sits below the fold of the source and is deliberately out
 * of scope (§0.4) — nothing is invented for it.
 */
export default function HomeDashboard() {
  return (
    <ContentColumn>
      <OverviewSection />
      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <LatestPostCard />
        {/*
          §8.2 — the Drafts card's height is set by the Latest post card beside
          it, not by its own list. Taking it out of flow at `md`+ means it fills
          the row rather than contributing to it, so a list longer than the row
          overflows and clips its last row mid-height. Letting it size to its
          content instead would grow the card and destroy that affordance.
        */}
        <div className="relative min-h-0">
          <div className="md:absolute md:inset-0">
            <DraftsCard />
          </div>
        </div>
      </div>
      <RecentPostsCard />
    </ContentColumn>
  );
}
