// Region B1 — the pane header (spec §4). Polaris ships no top bar: `s-title-bar`
// is App Bridge, and `s-page`'s own header centres itself over the content column
// and folds more than a couple of secondary actions into an overflow menu. So this
// is composed from primitives, the same way `gaps.md` says to build app nav.
//
// The title is a real `<h1>`; `s-heading` supplies the typography with its own
// heading role stripped, so the document gets one h1 and no nested heading.

import type { ReactNode } from "react";
import { author } from "@/data/fixtures";
import { StubPopover } from "@/components/CardHeader";

const ACTIONS = [
  { id: "theme", icon: "sun", label: "Switch theme" },
  { id: "search", icon: "search", label: "Search" },
  { id: "messages", icon: "chat", label: "Messages" },
  { id: "notifications", icon: "notification", label: "Notifications" },
] as const;

export function PaneHeader({ title, drawer }: { title: string; drawer?: ReactNode }) {
  return (
    <div className="pane-header">
      <s-box
        background="base"
        padding="small-100 base"
        borderWidth="none none base none"
        borderColor="base"
        borderStyle="solid"
      >
        <s-grid gridTemplateColumns="minmax(0, 1fr) auto" gap="base" alignItems="center">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            {/* Only rendered once the rail itself is hidden (spec §16). */}
            <div className="pane-header__drawer-trigger">
              <s-button
                variant="tertiary"
                icon="menu"
                accessibilityLabel="Open navigation"
                commandFor="nav-drawer"
              />
            </div>
            <h1 className="pane-header__title">
              <s-heading accessibilityRole="presentation">{title}</s-heading>
            </h1>
          </s-stack>

          <s-stack direction="inline" gap="small-300" alignItems="center">
            {ACTIONS.map((action) => (
              <s-button
                key={action.id}
                variant="tertiary"
                icon={action.icon}
                accessibilityLabel={action.label}
                interestFor={`tip-${action.id}`}
                commandFor={`stub-${action.id}`}
              />
            ))}
            {/* The caret badge is Polaris's own menu-activator affordance. */}
            <s-button
              variant="tertiary"
              accessibilityLabel={`${author.name} — account menu`}
              commandFor="account-menu"
            >
              <s-avatar initials={author.initials} size="small" alt="" />
            </s-button>
          </s-stack>
        </s-grid>
      </s-box>

      {ACTIONS.map((action) => (
        <s-tooltip key={action.id} id={`tip-${action.id}`}>
          {action.label}
        </s-tooltip>
      ))}
      <StubPopover id="stub-theme">
        Light and dark themes come from the Admin’s branding tokens, which a standalone Polaris
        build cannot resolve.
      </StubPopover>
      <StubPopover id="stub-search">Search is out of scope for this prototype.</StubPopover>
      <StubPopover id="stub-messages">No new messages.</StubPopover>
      <StubPopover id="stub-notifications">No new notifications.</StubPopover>
      <s-menu id="account-menu" accessibilityLabel="Account">
        <s-button icon="person">Profile</s-button>
        <s-button icon="settings">Settings</s-button>
        <s-button icon="exit">Sign out</s-button>
      </s-menu>

      {drawer}
    </div>
  );
}
