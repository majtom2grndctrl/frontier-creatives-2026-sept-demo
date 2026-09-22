// Demo 1 — the publication Home dashboard, built on Polaris web components.
//
// Shell shape (spec §2): a fixed recessed rail on the left, and a raised content
// pane inset from it with a rounded top-left corner and a hairline left edge. The
// pane header spans the pane's full width; the dashboard below it is the centered
// max-width column `s-page` provides.

import { useState } from "react";
import { DraftsCard } from "@/components/DraftsCard";
import { LatestPostCard } from "@/components/LatestPostCard";
import { OverviewSection } from "@/components/OverviewSection";
import { PaneHeader } from "@/components/PaneHeader";
import { RecentPostsCard } from "@/components/RecentPostsCard";
import { Sidebar } from "@/components/Sidebar";
import { drafts, latestPost, metrics, posts } from "@/data/fixtures";
import type { Period } from "@/data/types";
import { useMeasuredSize } from "@/lib/useMeasuredSize";

const NAV_TITLES: Record<string, string> = {
  home: "Home",
  publish: "Publish",
  audience: "Audience",
  analytics: "Analytics",
  revenue: "Revenue",
};

export function PublicationDemo() {
  const [nav, setNav] = useState("home");
  const [selectedMetricId, setSelectedMetricId] = useState(metrics[0]!.id);
  const [period, setPeriod] = useState<Period>("1y");

  // Drafts takes its height from Latest post, so its list clips instead of the
  // card growing (spec §8).
  const [latestCardRef, latestCardSize] = useMeasuredSize<HTMLDivElement>();

  // The rail's own width decides whether it shows labels; the width itself comes
  // from the shell's container query (spec §16).
  const [railRef, railSize] = useMeasuredSize<HTMLDivElement>();
  const compactRail = railSize.width > 0 && railSize.width < 140;

  const title = NAV_TITLES[nav] ?? "Home";

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="app-shell__rail" ref={railRef}>
          <Sidebar selectedId={nav} onSelect={setNav} compact={compactRail} />
        </div>

        <div className="app-shell__pane">
          <s-box
            background="base"
            borderRadius="large-200 none none none"
            borderWidth="none none none base"
            borderColor="base"
            borderStyle="solid"
          >
            <PaneHeader
              title={title}
              drawer={
                <s-modal id="nav-drawer" heading="Navigation" padding="none" accessibilityLabel="Navigation">
                  <Sidebar
                    idPrefix="drawer"
                    selectedId={nav}
                    onSelect={(id) => {
                      setNav(id);
                      document.querySelector<HTMLElementTagNameMap["s-modal"]>("s-modal#nav-drawer")?.hideOverlay();
                    }}
                  />
                </s-modal>
              }
            />

            <s-page inlineSize="base">
              {nav === "home" ? (
                <s-stack gap="large-200">
                  <OverviewSection
                    metrics={metrics}
                    period={period}
                    selectedId={selectedMetricId}
                    onSelect={setSelectedMetricId}
                    onPeriodChange={setPeriod}
                  />

                  {/* Latest post and Drafts are grid siblings, so they share a
                      height and fall to one column when the column narrows. */}
                  <s-query-container>
                    <s-grid
                      gridTemplateColumns="@container (inline-size > 700px) 1fr 1fr, 1fr"
                      gap="base"
                      alignItems="stretch"
                    >
                      <LatestPostCard post={latestPost} cardRef={latestCardRef} />
                      <DraftsCard drafts={drafts} blockSize={latestCardSize.height || undefined} />
                    </s-grid>
                  </s-query-container>

                  <RecentPostsCard posts={posts} />
                </s-stack>
              ) : (
                <s-section heading={title}>
                  <s-paragraph>
                    Only the Home dashboard is built in this prototype. Pick Home in the sidebar to
                    return to it.
                  </s-paragraph>
                </s-section>
              )}
            </s-page>
          </s-box>
        </div>
      </div>
    </div>
  );
}
