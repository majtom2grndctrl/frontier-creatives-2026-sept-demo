// Region A — chrome band (profile spec §3).
//
// One recessed block, full viewport width, two stacked rows with no rule
// between them, closed by a single `border/default` hairline at the bottom.
// The hairline is the last child of the recessed surface so the active tab's
// `.profile-tab__indicator` (absolutely positioned at the tab's own bottom
// edge, see profile.css) sits flush on top of it and reads as a replacement
// rather than a second line.

import type { ReactElement } from "react";
import type { Profile } from "@/data/profile-types";

interface ChromeBandProps {
  profile: Profile;
  activeTabId: string;
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

/** The platform mark: a circular brand mark, not a button. Drawn locally so
 *  the demo makes no network requests; `currentColor` inherits the ambient
 *  Polaris text color instead of naming a palette value. */
function PlatformMark(): ReactElement {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden="true" style={{ display: "block" }}>
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}

export function ChromeBand({ profile, activeTabId }: ChromeBandProps): ReactElement {
  const initials = getInitials(profile.identity.displayName);

  return (
    <header className="profile-chrome">
      <s-box background="subdued">
        {/* Row 1 — global header */}
        <s-box paddingInline="large-200" paddingBlock="small-200">
          <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
            {/* Left cluster: menu button, platform mark, handle */}
            <s-stack direction="inline" gap="small-300" alignItems="center">
              <s-button variant="secondary" icon="menu" accessibilityLabel="Menu"></s-button>
              <PlatformMark />
              <s-text type="strong">{profile.identity.handle}</s-text>
            </s-stack>

            {/* Right cluster: search, two split buttons separated by a bare
                rule, four standalone icon buttons, viewer avatar. The row is a
                plain flex div, not an `s-stack`: the stack wraps, and a wrapped
                search group drags the split buttons to a second line. Items are
                centred; only each split button's own inner row stretches, which
                is what gives its internal hairline full height. */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "0 0 auto" }}>
                <s-search-field
                  label="Search"
                  labelAccessibilityVisibility="exclusive"
                  placeholder="Search"
                ></s-search-field>
                {/* Key-cap chip. s-search-field's placeholder is a plain
                    string and can't hold markup, so the shortcut chip renders
                    as a bordered sibling in the same row instead of inline
                    inside the field — called out in the build report. */}
                <s-box border="base" borderRadius="small" paddingInline="small-200" paddingBlock="small-400">
                  <s-text color="subdued">/</s-text>
                </s-box>
              </div>

              {/* Collapses behind the menu button at the narrow breakpoint (§15). */}
              <div className="profile-chrome__actions">
              <s-box border="base" borderRadius="base">
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <s-button variant="tertiary" icon="wand" accessibilityLabel="AI tools"></s-button>
                  <s-divider direction="block"></s-divider>
                  <s-button variant="tertiary" icon="caret-down" accessibilityLabel="Open AI tools menu"></s-button>
                </div>
              </s-box>

              {/* A bare rule, not a button. It needs an explicit height because
                  the row centres rather than stretches. */}
              <div style={{ display: "flex", blockSize: "1.5rem" }}>
                <s-divider direction="block"></s-divider>
              </div>

              <s-box border="base" borderRadius="base">
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <s-button variant="tertiary" icon="plus" accessibilityLabel="Create new"></s-button>
                  <s-divider direction="block"></s-divider>
                  <s-button variant="tertiary" icon="caret-down" accessibilityLabel="Open create menu"></s-button>
                </div>
              </s-box>

              <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-button variant="secondary" icon="notification" accessibilityLabel="Notifications"></s-button>
                <s-button variant="secondary" icon="chat" accessibilityLabel="Discussions"></s-button>
                <s-button variant="secondary" icon="compass" accessibilityLabel="Explore"></s-button>
                <s-button variant="secondary" icon="apps" accessibilityLabel="Apps"></s-button>
              </s-stack>
              </div>

              <s-stack direction="inline" alignItems="center">
                <s-avatar size="small" initials={initials} alt={profile.identity.displayName}></s-avatar>
              </s-stack>
            </div>
          </s-stack>
        </s-box>

        {/* Row 2 — profile tab bar. Left-aligned to the viewport inset (the
            same paddingInline as row 1), not to the centered content column. */}
        <nav aria-label={`${profile.identity.displayName} profile sections`}>
          <s-box paddingInline="large-200">
            <div className="profile-tabs">
              {profile.tabs.map((tab) => {
                const active = tab.id === activeTabId;
                const accessibleName = tab.count != null ? `${tab.label}, ${tab.count}` : tab.label;

                return (
                  <a
                    key={tab.id}
                    href="#"
                    className="profile-tab"
                    aria-current={active ? "page" : undefined}
                    aria-label={accessibleName}
                  >
                    <s-box paddingInline="small-100" paddingBlock="small-200">
                      <s-stack direction="inline" gap="small-200" alignItems="center">
                        <s-icon type={tab.icon} color="subdued" size="small"></s-icon>
                        {active ? <s-text type="strong">{tab.label}</s-text> : <s-text>{tab.label}</s-text>}
                        {tab.count != null && (
                          <s-box
                            background="strong"
                            borderRadius="large-200"
                            paddingInline="small-200"
                            paddingBlock="small-500"
                          >
                            <s-text fontVariantNumeric="tabular-nums">{tab.count}</s-text>
                          </s-box>
                        )}
                      </s-stack>
                    </s-box>
                    {active && (
                      <s-text tone="caution">
                        <span className="profile-tab__indicator" aria-hidden="true"></span>
                      </s-text>
                    )}
                  </a>
                );
              })}
            </div>
          </s-box>
        </nav>

        <s-divider></s-divider>
      </s-box>
    </header>
  );
}
