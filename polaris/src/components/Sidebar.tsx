// Region A — the sidebar (spec §3). A recessed rail: identity card, primary nav,
// the solid Create button, then the secondary nav group. Nothing below `Revenue`
// — no settings row, no user card, no upgrade prompt, no footer.
//
// Polaris has no nav component (`s-nav-menu` is App Bridge), so this is composed
// from primitives, as `gaps.md` prescribes.

import { publication } from "@/data/fixtures";
import { StubPopover } from "@/components/CardHeader";

interface NavItem {
  id: string;
  label: string;
  icon: "home" | "globe" | "blog" | "team" | "chart-vertical" | "cash-dollar";
  /** Leaves the app rather than switching the selected row. */
  external?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "website", label: "Website", icon: "globe", external: true },
];

const SECONDARY_NAV: NavItem[] = [
  { id: "publish", label: "Publish", icon: "blog" },
  { id: "audience", label: "Audience", icon: "team" },
  { id: "analytics", label: "Analytics", icon: "chart-vertical" },
  { id: "revenue", label: "Revenue", icon: "cash-dollar" },
];

function CreateActions() {
  return (
    <>
      <s-button variant="tertiary" icon="page-add">
        New post
      </s-button>
      <s-button variant="tertiary" icon="note-add">
        New note
      </s-button>
      <s-button variant="tertiary" icon="import">
        Import
      </s-button>
    </>
  );
}

function NavRow({
  item,
  selected,
  compact,
  onSelect,
  commandFor,
}: {
  item: NavItem;
  selected: boolean;
  compact: boolean;
  onSelect?: () => void;
  commandFor?: string;
}) {
  const name = item.external ? `${item.label} — opens the public site` : item.label;

  return (
    <s-clickable
      onClick={onSelect}
      commandFor={commandFor}
      background={selected ? "strong" : "transparent"}
      borderRadius="base"
      padding="small-200 small-100"
      accessibilityLabel={compact || item.external ? name : undefined}
    >
      <s-stack
        direction="inline"
        gap="small-100"
        alignItems="center"
        justifyContent={compact ? "center" : "space-between"}
      >
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-icon type={item.icon} size="small" />
          {compact ? null : <s-text type={selected ? "strong" : "generic"}>{item.label}</s-text>}
        </s-stack>
        {item.external && !compact ? <s-icon type="arrow-up-right" size="small" color="subdued" /> : null}
      </s-stack>
    </s-clickable>
  );
}

export function Sidebar({
  selectedId,
  onSelect,
  compact = false,
  // The rail and the narrow-viewport drawer both mount this, so overlay ids are
  // namespaced — `commandFor` resolves by id and duplicates would collide.
  idPrefix = "rail",
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  idPrefix?: string;
}) {
  const createMenuId = `${idPrefix}-create-menu`;
  const createPopoverId = `${idPrefix}-create-popover`;
  const switcherId = `${idPrefix}-publication-switcher`;
  const websiteId = `${idPrefix}-website`;

  return (
    <s-box background="subdued" padding="small-100">
      <s-stack gap="large-200">
        <s-stack gap="small-200">
          <s-clickable
            commandFor={switcherId}
            border="base"
            borderRadius="base"
            padding="small-200"
            background="base"
            accessibilityLabel={`${publication.name} — switch publication`}
          >
            <s-stack
              direction="inline"
              gap="small-200"
              alignItems="center"
              justifyContent={compact ? "center" : "start"}
            >
              <s-avatar initials={publication.initials} size="small" alt="" />
              {compact ? null : (
                <s-paragraph lineClamp={1}>
                  <s-text type="strong">{publication.name}</s-text>
                </s-paragraph>
              )}
            </s-stack>
          </s-clickable>

          {PRIMARY_NAV.map((item) =>
            item.external ? (
              <NavRow
                key={item.id}
                item={item}
                compact={compact}
                selected={false}
                commandFor={websiteId}
              />
            ) : (
              <NavRow
                key={item.id}
                item={item}
                compact={compact}
                selected={item.id === selectedId}
                onSelect={() => onSelect(item.id)}
              />
            ),
          )}
        </s-stack>

        {/* Pointing `commandFor` at an s-menu makes Polaris render the trailing caret. */}
        {compact ? (
          // Polaris replaces an icon-only *menu* trigger's icon with
          // `menu-horizontal`, which would read as "more actions" on the one
          // control that creates things. A popover trigger keeps the plus.
          // The key forces a fresh element on the mode flip: Polaris resolves a
          // button's overlay affordance once, at connect time.
          <s-button
            key="create-compact"
            variant="primary"
            icon="plus"
            accessibilityLabel="Create"
            commandFor={createPopoverId}
          />
        ) : (
          <s-button key="create-full" variant="primary" inlineSize="fill" commandFor={createMenuId}>
            Create
          </s-button>
        )}

        <s-stack gap="small-200">
          {SECONDARY_NAV.map((item) => (
            <NavRow
              key={item.id}
              item={item}
              compact={compact}
              selected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
            />
          ))}
        </s-stack>
      </s-stack>

      {compact ? (
        <s-popover id={createPopoverId}>
          <s-stack gap="small-500" padding="small-300">
            <CreateActions />
          </s-stack>
        </s-popover>
      ) : (
        <s-menu id={createMenuId} accessibilityLabel="Create">
          <CreateActions />
        </s-menu>
      )}

      <StubPopover id={switcherId}>
        Publication switching is out of scope for this prototype.
      </StubPopover>

      <StubPopover id={websiteId}>
        The public site at {publication.domain} is out of scope for this prototype.
      </StubPopover>
    </s-box>
  );
}
