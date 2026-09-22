import type { Metadata } from "next"

import { ActivityTimeline } from "@/components/profile/activity-timeline"
import { ChromeBand } from "@/components/profile/chrome-band"
import { ContributionsCard } from "@/components/profile/contributions-card"
import { PinnedGrid } from "@/components/profile/pinned-grid"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ReadmeCard } from "@/components/profile/readme-card"
import { YearRail } from "@/components/profile/year-rail"
import { PROFILE_TABS, getAdditionalTimeline, getProfile } from "@/data/profile"

export const metadata: Metadata = {
  title: "Rowan Alvarez (quietstack-nine)",
  description: "Developer profile overview",
}

/**
 * Developer Profile — Overview (spec §2).
 *
 * A standalone screen: it deliberately renders outside this repo's dashboard
 * shell, because §3's chrome band is full-bleed and §16 forbids the extra
 * chrome an app frame would add. `AppShell` bypasses itself on this route.
 *
 * Three composition facts from §2 drive the layout and are easy to lose:
 *
 *  - The tint lives on the chrome band, not on the page. The page below is the
 *    base surface and so is every card fill — cards are defined by their
 *    hairline border alone (§16.1).
 *  - Region B's `items-start` is the single declaration that makes the sidebar
 *    hug its content instead of stretching to the main column (§16.4).
 *  - Region H's left sub-column owns §7.2, §8 and the "Show more" button, so
 *    the timeline is *narrower* than README and Pinned above it (§16.24). The
 *    year rail is a sibling of that whole column, which is why its lower
 *    entries sit alongside the timeline rather than the contributions card.
 *
 * Nothing on this page is sticky and nothing scrolls independently (§16.25).
 */
export default async function ProfileOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year } = await searchParams
  const parsed = Number(year)
  const profile = getProfile(Number.isInteger(parsed) ? parsed : 2026)

  return (
    /*
     * §14 asks for a focus ring that contrasts against BOTH `surface/base` and
     * `surface/raised-chrome`. The stock `--ring` measures 1.55:1 on the page
     * and 1.49:1 on the chrome band at shadcn's default 50% alpha — well under
     * the 3:1 a focus indicator needs. Rebinding `--ring` to the theme's own
     * `--primary` for this subtree takes it to 4.00 / 3.94 in light and
     * 4.48 / 4.15 in dark, using an existing semantic token.
     *
     * Scoped here rather than in `globals.css` on purpose: the shadcn
     * primitives all resolve `var(--ring)` at runtime, so every control inside
     * this page inherits the accessible ring, while the rest of the app keeps
     * the stock theme exactly as it ships.
     */
    <div
      className="min-h-svh bg-background"
      style={{ "--ring": "var(--primary)" } as React.CSSProperties}
    >
      <ChromeBand handle={profile.identity.handle} tabs={PROFILE_TABS} />

      {/* Region B — centred, ~82% of the viewport. */}
      <div className="mx-auto w-[82%] max-w-[1280px] pt-6 pb-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,24fr)_minmax(0,74fr)] lg:gap-[2%]">
          {/* Region C */}
          <ProfileSidebar
            identity={profile.identity}
            counts={profile.counts}
            metaRows={profile.metaRows}
            achievements={profile.achievements}
            organizations={profile.organizations}
            isOwner={profile.isOwner}
          />

          {/* Region E */}
          <main className="flex min-w-0 flex-col gap-6">
            {/* §13 — no README means no card at all, not an empty one. */}
            {profile.readme ? (
              <ReadmeCard readme={profile.readme} isOwner={profile.isOwner} />
            ) : null}

            <PinnedGrid pinned={profile.pinned} isOwner={profile.isOwner} />

            {/* Region H. The rail sits between the card and the timeline in DOM
                order so that below `lg`, where the grid collapses to one column,
                it lands directly beneath the contributions card (§15). */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,83fr)_minmax(0,13fr)] lg:gap-x-[4%]">
              <div className="lg:col-start-1 lg:row-start-1">
                <ContributionsCard
                  year={profile.contributions}
                  selectedYear={profile.selectedYear}
                  activityOverview={profile.activityOverview}
                />
              </div>

              <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
                <YearRail
                  years={profile.availableYears}
                  selectedYear={profile.selectedYear}
                />
              </div>

              <div className="lg:col-start-1 lg:row-start-2">
                <ActivityTimeline
                  months={profile.timeline}
                  hasMore={profile.hasMoreActivity}
                  moreMonths={getAdditionalTimeline(profile.selectedYear)}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
