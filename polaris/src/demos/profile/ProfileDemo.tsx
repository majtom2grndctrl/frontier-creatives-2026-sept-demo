// Demo 2 — the developer profile Overview screen, built on Polaris web
// components. `developer-profile-overview spec.md` in the repo root is the
// specification it implements.
//
// Shell shape (spec §2): a full-bleed recessed chrome band, then a centred
// content column that is a two-column grid — a content-height sidebar and a much
// taller main column. `align-items: start` on that grid is the single
// declaration that keeps the sidebar from stretching (spec §16.4), and it lives
// in `profile.css` with the rest of this screen's geometry.
//
// There is no `s-page` here. Its header centres itself over a 630px column and
// its body cannot reach the viewport's edge, neither of which this design
// allows — so the landmarks are native elements, the way `gaps.md` prescribes
// for app chrome. The publication demo owns the app's one `s-page`.

import { useState } from "react";
import { ActivityTimeline } from "@/components/profile/ActivityTimeline";
import { ChromeBand } from "@/components/profile/ChromeBand";
import { ContributionsCard } from "@/components/profile/ContributionsCard";
import { PinnedGrid } from "@/components/profile/PinnedGrid";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ReadmeCard } from "@/components/profile/ReadmeCard";
import { YearRail } from "@/components/profile/YearRail";
import { profile } from "@/data/profile-fixtures";
import { emptyContributionYear } from "@/lib/contributions";

/** Zeroed for any year but the newest — the fixture carries one year of data. */
const NO_ACTIVITY = {
  contributedTo: { named: [], otherCount: 0 },
  breakdown: { commits: 0, codeReview: 0, pullRequests: 0, issues: 0 },
};

export function ProfileDemo() {
  const [selectedYear, setSelectedYear] = useState(profile.selectedYear);
  const isCurrentYear = selectedYear === profile.selectedYear;

  // Selecting a year replaces the heatmap, the header count, the activity
  // overview and the timeline in place — the rail itself does not change
  // (spec §13). Every earlier year lands on the empty states.
  const contributions = isCurrentYear
    ? profile.contributions
    : emptyContributionYear(selectedYear);
  const activityOverview = isCurrentYear ? profile.activityOverview : NO_ACTIVITY;
  const timeline = isCurrentYear ? profile.timeline : [];

  return (
    <div className="profile-page">
      <ChromeBand profile={profile} activeTabId="overview" />

      <s-box background="base" paddingBlock="large-300">
        {/* Region B. The sidebar's `complementary` sits inside it, as spec §14 asks. */}
        <main className="profile-content">
          <ProfileSidebar profile={profile} />

          <s-stack gap="large-300">
            <ReadmeCard readme={profile.readme} isOwner={profile.isOwner} />
            <PinnedGrid pinned={profile.pinned} isOwner={profile.isOwner} />

            {/*
              Region H. The left sub-column owns the contributions card, the
              activity timeline and the "Show more" button; the rail is a
              sibling of all three, so its lower entries sit alongside the
              timeline rather than the card (spec §7.3).
            */}
            <div className="contrib-band">
              <s-stack gap="large-300">
                <ContributionsCard
                  contributions={contributions}
                  activityOverview={activityOverview}
                  selectedYear={selectedYear}
                />
                <ActivityTimeline
                  timeline={timeline}
                  hasMoreActivity={isCurrentYear && profile.hasMoreActivity}
                />
              </s-stack>

              <YearRail
                years={profile.availableYears}
                selectedYear={selectedYear}
                onSelectYear={setSelectedYear}
              />
            </div>
          </s-stack>
        </main>
      </s-box>
    </div>
  );
}
