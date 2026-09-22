// Post cover art, drawn as inline SVG so the demo makes no network requests.
// Everything is painted in `currentColor` at varying opacity, so the art picks up
// the inherited Polaris text color instead of introducing a literal palette.

import type { CoverArt as CoverArtKind } from "@/data/types";

const WIDTH = 96;
const HEIGHT = 64;

function Diagram() {
  return (
    <>
      <rect x="10" y="14" width="26" height="14" rx="3" fill="currentColor" opacity="0.16" />
      <rect x="58" y="14" width="26" height="14" rx="3" fill="currentColor" opacity="0.16" />
      <rect x="34" y="40" width="26" height="14" rx="3" fill="currentColor" opacity="0.28" />
      <path
        d="M23 28 L23 34 L47 34 L47 40 M71 28 L71 34 L47 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </>
  );
}

function Chart() {
  return (
    <>
      <path d="M12 46 L32 38 L52 42 L72 20 L84 26" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <path
        d="M12 46 L32 38 L52 42 L72 20 L84 26 L84 54 L12 54 Z"
        fill="currentColor"
        opacity="0.1"
      />
      <path d="M12 54 L84 54" stroke="currentColor" strokeWidth="1" opacity="0.25" />
    </>
  );
}

/** No cover: the "lines of text" placeholder glyph on a tinted ground. */
function Placeholder() {
  return (
    <>
      <rect x="26" y="22" width="44" height="4" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="26" y="30" width="44" height="4" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="26" y="38" width="28" height="4" rx="2" fill="currentColor" opacity="0.25" />
    </>
  );
}

export function CoverArt({ cover, title }: { cover?: CoverArtKind; title: string }) {
  const label = cover ? `Cover image for ${title}` : `${title} has no cover image`;

  return (
    <s-box
      border="base"
      borderRadius="base"
      background={cover ? "base" : "strong"}
      overflow="hidden"
      display="auto"
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={label}
        style={{ display: "block" }}
      >
        {cover === "diagram" ? <Diagram /> : cover === "chart" ? <Chart /> : <Placeholder />}
      </svg>
    </s-box>
  );
}
