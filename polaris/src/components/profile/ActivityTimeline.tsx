// Contribution activity (profile spec §8) and its `TimelineItem`s (§9.3).
// Lives in the narrower left sub-column of the contributions band alongside
// `ContributionsCard` — this component adds no width of its own (§16.24).
//
// The timeline title is derived, never stored (§10): compose it from `kind`,
// `count` and `repositoryCount` so the sentence and the data can't drift.

import { useId, useState, type CSSProperties, type ReactElement } from "react";
import type {
  TimelineDetail,
  TimelineItem,
  TimelineKind,
  TimelineMonth,
} from "@/data/profile-types";
import { FOOTER_NOTE } from "@/data/profile-fixtures";
import { formatInteger } from "@/lib/format";

/** Verified against `agent-docs/icons.txt`. One glyph per timeline kind. */
const KIND_ICON: Record<
  TimelineKind,
  "git-commit" | "git-branch" | "alert-circle" | "eye-check-mark" | "git-repository"
> = {
  commits: "git-commit",
  pullRequests: "git-branch",
  issues: "alert-circle",
  reviews: "eye-check-mark",
  createdRepository: "git-repository",
};

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

/** "Created 194 commits in 1 repository" / "…in 2 repositories" (§9.3, §10). */
function titleFor(item: TimelineItem): string {
  const count = formatInteger(item.count);
  const repoWord = plural(item.repositoryCount, "repository", "repositories");

  switch (item.kind) {
    case "commits":
      return `Created ${count} ${plural(item.count, "commit")} in ${item.repositoryCount} ${repoWord}`;
    case "pullRequests":
      return `Opened ${count} ${plural(item.count, "pull request")} in ${item.repositoryCount} ${repoWord}`;
    case "issues":
      return `Opened ${count} ${plural(item.count, "issue")} in ${item.repositoryCount} ${repoWord}`;
    case "reviews":
      return `Reviewed ${count} ${plural(item.count, "pull request")} in ${item.repositoryCount} ${repoWord}`;
    case "createdRepository":
      return `Created ${count} ${repoWord}`;
  }
}

interface Props {
  timeline: TimelineMonth[];
  hasMoreActivity: boolean;
}

export function ActivityTimeline({ timeline, hasMoreActivity }: Props): ReactElement {
  // No timeline items for the selected year: heading plus one muted line,
  // omitting the month header, the rail and "Show more activity" (§13).
  const isEmpty = timeline.length === 0;

  return (
    <s-stack direction="block" gap="base">
      <h2 className="plain-heading">
        <s-paragraph>Contribution activity</s-paragraph>
      </h2>

      {isEmpty ? (
        <s-paragraph color="subdued">No activity to show for this year.</s-paragraph>
      ) : (
        <>
          {timeline.map((month) => (
            <MonthSection key={`${month.year}-${month.month}`} month={month} />
          ))}

          {/* Outline button, not a solid accent one (§16.21) — an `s-clickable`
              box styled with border and base-fill props. */}
          {hasMoreActivity ? (
            <s-clickable
              type="button"
              onClick={() => {
                /* Out of scope (§13): appending the next page is a no-op here. */
              }}
              accessibilityLabel="Show more activity"
              border="base"
              background="base"
              borderRadius="base"
              padding="base"
              inlineSize="100%"
            >
              {/*
                The label is bold and centred in an outline button (§16.21).
                It is not accent-coloured: Polaris's only accent text primitive
                is `s-link`, which is itself interactive, and nesting a link
                inside this button would nest two controls.
              */}
              <s-stack direction="inline" justifyContent="center">
                <s-text type="strong">Show more activity</s-text>
              </s-stack>
            </s-clickable>
          ) : null}
        </>
      )}

      {/* The page ends here — no site footer (§16.26). */}
      <s-paragraph>
        {FOOTER_NOTE.before}
        <s-link href="#" tone="auto">
          {FOOTER_NOTE.linkLabel}
        </s-link>
        {FOOTER_NOTE.after}
      </s-paragraph>
    </s-stack>
  );
}

function MonthSection({ month }: { month: TimelineMonth }): ReactElement {
  // Detail rows default open, matching the spec's captured rendering, where
  // every item's details are visible at rest; the collapse control closes them.
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (id: string) => {
    setCollapsedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <s-stack direction="block" gap="small-200">
      <div className="month-header">
        <span>
          <s-text type="strong">{month.month}</s-text> <s-text color="subdued">{month.year}</s-text>
        </span>
        <div className="month-header__rule" />
      </div>

      <div className="timeline">
        <s-stack direction="block" gap="large-100">
          {month.items.map((item) => (
            <TimelineItemRow
              key={item.id}
              item={item}
              open={!collapsedIds.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </s-stack>
      </div>
    </s-stack>
  );
}

function TimelineItemRow({
  item,
  open,
  onToggle,
}: {
  item: TimelineItem;
  open: boolean;
  onToggle: () => void;
}): ReactElement {
  const max = Math.max(0, ...item.details.map((detail) => detail.bar ?? 0));

  return (
    <div className="timeline-item">
      {/* Rounded square, masks the rail behind it (`.timeline-item__badge`). */}
      <div className="timeline-item__badge">
        <s-box background="base" border="base" borderRadius="base" padding="small-200">
          <s-icon type={KIND_ICON[item.kind]} color="subdued" size="small" />
        </s-box>
      </div>

      <s-stack direction="block" gap="small-200">
        <s-stack direction="inline" gap="small" alignItems="center" justifyContent="space-between">
          <s-paragraph>{titleFor(item)}</s-paragraph>
          <CollapseButton open={open} onToggle={onToggle} />
        </s-stack>

        {open ? (
          <s-stack direction="block" gap="small-200">
            {item.details.map((detail) => (
              <DetailRow
                key={detail.repo}
                detail={detail}
                barPercent={max > 0 ? ((detail.bar ?? 0) / max) * 100 : 0}
                open={open}
                onToggle={onToggle}
              />
            ))}
          </s-stack>
        ) : null}
      </s-stack>
    </div>
  );
}

function CollapseButton({ open, onToggle }: { open: boolean; onToggle: () => void }): ReactElement {
  return (
    <s-button
      type="button"
      variant="tertiary"
      icon="arrows-in-horizontal"
      accessibilityLabel={open ? "Hide details" : "Show details"}
      onClick={onToggle}
    />
  );
}

function DetailRow({
  detail,
  barPercent,
  open,
  onToggle,
}: {
  detail: TimelineDetail;
  barPercent: number;
  open: boolean;
  onToggle: () => void;
}): ReactElement {
  // Captured hover state (§9.3): resting is muted and un-underlined; hover
  // (and, for keyboard use, focus) recolours to accent and underlines. `tone`
  // is a real Polaris prop, so the swap needs no styling of the shadow DOM —
  // `neutral` is the closest available stand-in for `text/muted` since
  // `s-link` exposes no `subdued` tone.
  const [active, setActive] = useState(false);

  return (
    <div className="timeline-detail">
      <s-stack direction="inline" gap="small-200" alignItems="center">
        {/*
          `s-link` is accent-coloured at every `tone` — `neutral` does not mute
          it — so a resting path cannot be a link (§16.20). At rest this is an
          `s-clickable` carrying muted text; on hover it becomes a real `s-link`,
          which is what supplies the accent. The underline comes from
          `.timeline-detail__path:hover`. The hover handlers sit on the wrapper,
          so swapping the child does not drop the hover.
        */}
        <span
          className="timeline-detail__path"
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
        >
          {active ? (
            <s-link href={detail.href}>{detail.repo}</s-link>
          ) : (
            <s-clickable href={detail.href}>
              <s-text color="subdued">{detail.repo}</s-text>
            </s-clickable>
          )}
        </span>
        {/* The count link stays muted on hover and only gains an underline. */}
        {detail.countLabel ? (
          <span className="timeline-detail__count">
            <s-clickable href={detail.href}>
              <s-text color="subdued">{detail.countLabel}</s-text>
            </s-clickable>
          </span>
        ) : null}
      </s-stack>

      {detail.statusPill ? (
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <StatusPhrase count={detail.statusPill.count} label={detail.statusPill.label} />
          {detail.collapsible ? <CollapseButton open={open} onToggle={onToggle} /> : null}
        </s-stack>
      ) : detail.bar !== undefined ? (
        <div className="timeline-bar-track">
          <div
            className="timeline-bar"
            aria-hidden="true"
            style={{ "--bar-length": `${barPercent}%` } as CSSProperties}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * The pill and its trailing word expose as one phrase, "37 merged" (§14) —
 * `role="text"` plus an `aria-hidden` visual layer keeps assistive tech from
 * reading the count and the word as two fragments.
 */
function StatusPhrase({ count, label }: { count: number; label: string }): ReactElement {
  const id = useId();

  return (
    <span id={id} role="text" aria-label={`${formatInteger(count)} ${label}`}>
      <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
        <s-badge tone="success">
          <s-text type="strong">{formatInteger(count)}</s-text>
        </s-badge>
        <s-text color="subdued">{label}</s-text>
      </span>
    </span>
  );
}
