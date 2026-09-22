// Region C of the developer profile Overview screen (profile spec §4).
//
// A single column with no card, no background and no border of its own: avatar,
// identity, the full-width "Edit profile" affordance, the meta rows, then the
// achievement and organization blocks. It ends at Organizations — no trailing
// divider, no footer (spec §16.5) — and the grid in `profile.css` is what stops
// it stretching to the main column's height.
//
// Two headings rules the spec is strict about: the sidebar's section headings
// are *bold* where the main column's are regular at the same size (§12.2), and
// the website and social rows are links rendered in `text/default` rather than
// the link accent (§16.23).

import { Fragment } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { Achievement, MetaRow, Organization, Profile } from "@/data/profile-types";
import { formatInteger } from "@/lib/format";
import { AchievementArtwork, AvatarArtwork, BrandMark } from "@/components/profile/ProfileArtwork";

/**
 * One glyph column for the meta rows. Every row's mark centres in the same
 * square, so a Polaris icon and the hand-drawn brand mark share a left edge and
 * an optical size whatever each one's intrinsic size turns out to be.
 */
const GLYPH_SLOT: CSSProperties = {
  display: "grid",
  placeItems: "center",
  inlineSize: "1.25rem",
  blockSize: "1.25rem",
  flex: "none",
};

/**
 * `.profile-avatar__status` centres its child; stretching it instead makes the
 * status button fill the square the stylesheet sized, so the button stays
 * proportional to the avatar at every width. Polaris box props cannot express
 * "fill your parent" — `inlineSize` only accepts `auto` or `0`.
 */
const STATUS_FILL: CSSProperties = { placeItems: "stretch" };

/** Centres the emoji in the stretched button, which is a box and not a stack. */
const STATUS_GLYPH: CSSProperties = {
  display: "grid",
  placeItems: "center",
  blockSize: "100%",
  lineHeight: 1,
};

/** Same reason as `STATUS_FILL`: a grid item stretches, so the bordered box
 *  fills the square tile `.profile-org` sizes. */
const ORG_FILL: CSSProperties = { display: "grid" };

export function ProfileSidebar({ profile }: { profile: Profile }): ReactElement {
  const { identity, counts, metaRows, achievements, organizations } = profile;

  return (
    <aside aria-label="Profile details">
      <s-stack gap="base">
        <div className="profile-sidebar__identity">
          <div className="profile-avatar">
            <AvatarArtwork label={identity.displayName} />
            {identity.statusEmoji ? <StatusButton identity={identity} /> : null}
          </div>

          <s-box paddingBlockStart="base">
            <s-stack gap="small-100">
              <s-stack gap="small-400">
                <s-heading>{identity.displayName}</s-heading>
                <s-paragraph color="subdued">
                  {identity.handle}
                  {identity.pronouns ? ` · ${identity.pronouns}` : ""}
                </s-paragraph>
              </s-stack>
              {identity.bio ? <Bio bio={identity.bio} /> : null}
            </s-stack>
          </s-box>
        </div>

        {/* Tonal, not solid accent: it has to read quieter than a primary
            button. Editing is out of scope, so the affordance is a no-op. */}
        <s-button type="button" variant="secondary" inlineSize="fill">
          Edit profile
        </s-button>

        {/* Row 1 sits a little further from row 2 than rows 2–5 sit from each
            other — a wider gap, never a divider. */}
        <s-stack gap="small-100">
          <MetaRowLine glyph={<s-icon type="team" size="small" color="subdued" />}>
            <s-text type="strong">{formatInteger(counts.followers)}</s-text>{" "}
            <s-text color="subdued">followers</s-text>
            <s-text color="subdued">{" · "}</s-text>
            <s-text type="strong">{formatInteger(counts.following)}</s-text>{" "}
            <s-text color="subdued">following</s-text>
          </MetaRowLine>

          <s-stack gap="small-200">
            {metaRows.map((row) => (
              <MetaRowLine key={row.kind} glyph={<MetaGlyph kind={row.kind} />}>
                <MetaRowValue row={row} />
              </MetaRowLine>
            ))}
          </s-stack>
        </s-stack>

        {/* No achievements omits the block and its divider (spec §13). */}
        {achievements.length > 0 ? (
          <SidebarBlock heading="Achievements">
            <div className="profile-achievements">
              {achievements.map((achievement) => (
                <Badge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </SidebarBlock>
        ) : null}

        {/* Same for organizations, and the sidebar simply ends here. */}
        {organizations.length > 0 ? (
          <SidebarBlock heading="Organizations">
            <div className="profile-orgs">
              {organizations.map((organization) => (
                <OrgAvatar key={organization.id} organization={organization} />
              ))}
            </div>
          </SidebarBlock>
        ) : null}
      </s-stack>
    </aside>
  );
}

/**
 * Straddles the avatar's lower-right circumference — half on the photo, half off
 * it — on the page surface with a `border/default` outline. A real button with a
 * label describing the status, not just the emoji (spec §14).
 */
function StatusButton({ identity }: { identity: Profile["identity"] }): ReactElement {
  return (
    <div className="profile-avatar__status" style={STATUS_FILL}>
      <s-clickable
        type="button"
        background="base"
        border="base"
        borderRadius="large-200"
        overflow="hidden"
        accessibilityLabel={identity.statusLabel ?? "Set status"}
      >
        <span style={STATUS_GLYPH} aria-hidden="true">
          {identity.statusEmoji}
        </span>
      </s-clickable>
    </div>
  );
}

/** Free text with hard line breaks. The trailing line is short, so the block
 *  must wrap naturally rather than justify. */
function Bio({ bio }: { bio: string }): ReactElement {
  const lines = bio.split("\n");

  return (
    <s-paragraph>
      {lines.map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </s-paragraph>
  );
}

function MetaRowLine({ glyph, children }: { glyph: ReactNode; children: ReactNode }): ReactElement {
  return (
    <s-stack direction="inline" gap="small-200" alignItems="center">
      {/* The glyph is decorative; the row's text carries the meaning. */}
      <span style={GLYPH_SLOT} aria-hidden="true">
        {glyph}
      </span>
      <s-paragraph>{children}</s-paragraph>
    </s-stack>
  );
}

function MetaGlyph({ kind }: { kind: MetaRow["kind"] }): ReactElement {
  switch (kind) {
    case "location":
      return <s-icon type="location" size="small" color="subdued" />;
    case "localTime":
      return <s-icon type="clock" size="small" color="subdued" />;
    case "website":
      return <s-icon type="link" size="small" color="subdued" />;
    case "social":
      return <BrandMark />;
  }
}

function MetaRowValue({ row }: { row: MetaRow }): ReactElement {
  if (row.href) {
    // A link, but neutral rather than accent-coloured (spec §16.23).
    return (
      <s-link href={row.href} tone="neutral">
        {row.primary}
      </s-link>
    );
  }

  return (
    <>
      <s-text>{row.primary}</s-text>
      {/* The local-time row carries its offset in the text, not only visually. */}
      {row.secondary ? (
        <>
          {" "}
          <s-text color="subdued">{row.secondary}</s-text>
        </>
      ) : null}
    </>
  );
}

/** A `border/subtle` divider, then a bold heading, then the block's own row. */
function SidebarBlock({ heading, children }: { heading: string; children: ReactNode }): ReactElement {
  return (
    <s-stack gap="small-100">
      <div className="hairline-subtle" />
      <h3 className="plain-heading">
        <s-text type="strong">{heading}</s-text>
      </h3>
      {children}
    </s-stack>
  );
}

/** Decorative artwork with an optional count pill overlapping its lower-right.
 *  The pill's fill travels with the badge as data, so it is the one literal
 *  colour in this region and it arrives through a custom property. */
function Badge({ achievement }: { achievement: Achievement }): ReactElement {
  const label =
    achievement.count === undefined
      ? achievement.name
      : `${achievement.name}, ${formatInteger(achievement.count)}`;

  return (
    <div className="profile-achievement">
      <AchievementArtwork art={achievement.art} label={label} />
      {achievement.count === undefined ? null : (
        <span
          className="profile-achievement__pill"
          style={{ "--pill-fill": achievement.pillColor } as CSSProperties}
          aria-hidden="true"
        >
          {achievement.count}
        </span>
      )}
    </div>
  );
}

/** Polaris's avatar is circular, so the rounded squares are composed from a
 *  bordered box carrying the organization's initials. */
function OrgAvatar({ organization }: { organization: Organization }): ReactElement {
  return (
    <div className="profile-org" style={ORG_FILL}>
      <s-stack
        alignItems="center"
        justifyContent="center"
        background="subdued"
        border="base"
        borderColor="base"
        borderRadius="small"
        overflow="hidden"
      >
        <s-text color="subdued" accessibilityVisibility="hidden">
          {organization.initials}
        </s-text>
        <s-text accessibilityVisibility="exclusive">{organization.name}</s-text>
      </s-stack>
    </div>
  );
}
