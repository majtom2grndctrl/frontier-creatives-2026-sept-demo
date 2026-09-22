// Sidebar artwork for the developer profile Overview screen (profile spec §4).
//
// Every mark here is drawn locally as inline SVG so the demo makes no network
// request: the spec's avatar image, its four achievement badges, and the filled
// brand mark the social meta row calls for. Polaris ships no brand marks and no
// decorative badge set, so this file supplies both.
//
// Everything is painted in `currentColor` at an opacity, the same trick the
// stylesheet's hairlines use, so the art inherits the Polaris text colour rather
// than introducing a palette. The one colour in this region — an achievement
// pill's fill — arrives as data and is set by the sidebar, not here.

import type { CSSProperties, ReactElement } from "react";
import type { Achievement } from "@/data/profile-types";

/** The avatar fills the sidebar column; the stylesheet owns the square. */
const FILL: CSSProperties = { display: "block", inlineSize: "100%", blockSize: "100%" };

/** A badge is sized by its flex track, so it scales on the inline axis alone. */
const BADGE: CSSProperties = { display: "block", inlineSize: "100%", blockSize: "auto" };

/** Matches the glyph column the meta rows reserve for a Polaris icon. */
const MARK: CSSProperties = { display: "block", inlineSize: "100%", blockSize: "100%" };

const AVATAR_CLIP = "profile-avatar-clip";

/**
 * A generic placeholder avatar: a head-and-shoulders silhouette on a tinted
 * disc, clipped to the disc so the shoulders meet its edge cleanly.
 */
export function AvatarArtwork({ label }: { label: string }): ReactElement {
  return (
    <svg viewBox="0 0 96 96" role="img" aria-label={label} style={FILL}>
      <defs>
        <clipPath id={AVATAR_CLIP}>
          <circle cx="48" cy="48" r="48" />
        </clipPath>
      </defs>
      <circle cx="48" cy="48" r="48" fill="currentColor" opacity="0.1" />
      <g clipPath={`url(#${AVATAR_CLIP})`} fill="currentColor" opacity="0.3">
        <circle cx="48" cy="37" r="15" />
        <path d="M48 57c-17.2 0-31.3 12.3-33 28.2A47.9 47.9 0 0 0 48 96a47.9 47.9 0 0 0 33-10.8C79.3 69.3 65.2 57 48 57Z" />
      </g>
    </svg>
  );
}

/**
 * Decorative badge artwork. Each variant is its own silhouette — a shield, a
 * ring, a star, a hexagon — rather than four fills inside a shared frame, so the
 * row reads as a set of images and not as a clipped grid (spec §4.5).
 */
export function AchievementArtwork({
  art,
  label,
}: {
  art: Achievement["art"];
  label: string;
}): ReactElement {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={label} style={BADGE}>
      {art === "shield" ? <Shield /> : null}
      {art === "ring" ? <Ring /> : null}
      {art === "star" ? <Star /> : null}
      {art === "hex" ? <Hex /> : null}
    </svg>
  );
}

function Shield(): ReactElement {
  return (
    <>
      <path
        d="M24 3.5 42 10v12.5c0 10.9-6.9 18.8-18 22.5-11.1-3.7-18-11.6-18-22.5V10Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M24 11.5 34.5 15.4v8.1c0 6.6-4 11.5-10.5 13.8-6.5-2.3-10.5-7.2-10.5-13.8v-8.1Z"
        fill="currentColor"
        opacity="0.44"
      />
      <path d="M19.5 24.3 22.8 27.6 29 21.4" fill="none" stroke="currentColor" strokeWidth="2.6" opacity="0.75" />
    </>
  );
}

function Ring(): ReactElement {
  return (
    <>
      <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.18" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.4"
        strokeDasharray="44 76" strokeLinecap="round" />
      <circle cx="24" cy="24" r="8.5" fill="currentColor" opacity="0.44" />
    </>
  );
}

function Star(): ReactElement {
  return (
    <>
      <path
        d="M24 3 29 17.1 44 17.5 32.1 26.6 36.3 41 24 32.5 11.7 41 15.9 26.6 4 17.5 19 17.1Z"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="24" cy="23.5" r="7" fill="currentColor" opacity="0.46" />
    </>
  );
}

function Hex(): ReactElement {
  return (
    <>
      <path d="M24 3 42.2 13.5V34.5L24 45 5.8 34.5V13.5Z" fill="currentColor" opacity="0.18" />
      <path d="M24 13 33.7 18.6V29.9L24 35.5 14.3 29.9V18.6Z" fill="currentColor" opacity="0.44" />
      <path d="M24 21 28 23.3v4.6L24 30.2 20 27.9v-4.6Z" fill="currentColor" opacity="0.72" />
    </>
  );
}

/**
 * The social row's glyph. The spec calls for a *filled* brand mark rather than
 * an outline system icon, and Polaris ships none — so it is one rounded square
 * with the wordmark knocked out of it by `evenodd`, drawn inset inside its box
 * so it reads at the same optical size as the icons above it.
 */
export function BrandMark(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" style={MARK} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.4 2h9.2A3.4 3.4 0 0 1 18 5.4v9.2a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 14.6V5.4A3.4 3.4 0 0 1 5.4 2Z
           M4.9 6.1a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 1 0-2.5 0Z
           M5.05 8.4h2.2v6.6h-2.2Z
           M8.7 8.4h2.1v1c.6-.8 1.5-1.2 2.4-1.2 1.6 0 2.6 1.1 2.6 2.9V15h-2.2v-3.5c0-.9-.4-1.5-1.2-1.5-.9 0-1.5.6-1.5 1.7V15H8.7Z"
      />
    </svg>
  );
}
