// README card (spec §5). A bordered `s-box` — never `s-section`, which would
// derive the H1's heading level from nesting depth and shrink it (§0).
//
// The markdown is a fixed three-block fixture (H1, bold lead paragraph, body
// paragraph): no markdown library, just a hand-rolled split on blank lines.
// Storing the parsed shape instead of the raw string keeps this file the only
// place that has to know the fixture's grammar.

import type { ReactElement } from "react";
import type { Profile } from "@/data/profile-types";

interface ReadmeBlock {
  text: string;
  bold: boolean;
}

interface ParsedReadme {
  heading: string;
  paragraphs: ReadmeBlock[];
}

/** Splits on blank lines: block 0 is `# Heading`, the rest are paragraphs,
 *  each either `**bold**` or plain. */
function parseReadme(markdown: string): ParsedReadme {
  const [first, ...rest] = markdown.trim().split(/\n\s*\n/);
  const heading = (first ?? "").replace(/^#+\s*/, "").trim();
  const paragraphs = rest.map((block): ReadmeBlock => {
    const bold = /^\*\*[\s\S]*\*\*$/.test(block.trim());
    return { text: bold ? block.trim().slice(2, -2) : block.trim(), bold };
  });
  return { heading, paragraphs };
}

interface ParsedPath {
  handle: string;
  name: string;
  ext: string;
}

/** `handle/README.md` -> segments, so the separator and extension can be
 *  muted independently of the handle and file name (§5). */
function parsePath(path: string): ParsedPath {
  const slash = path.lastIndexOf("/");
  const handle = slash === -1 ? "" : path.slice(0, slash);
  const filename = slash === -1 ? path : path.slice(slash + 1);
  const dot = filename.indexOf(".");
  const name = dot === -1 ? filename : filename.slice(0, dot);
  const ext = dot === -1 ? "" : filename.slice(dot);
  return { handle, name, ext };
}

interface Props {
  readme: Profile["readme"];
  isOwner: boolean;
}

export function ReadmeCard({ readme, isOwner }: Props): ReactElement | null {
  // No README omits the card entirely — no empty card, no placeholder (§13).
  if (!readme) return null;

  const { heading, paragraphs } = parseReadme(readme.markdown);
  const { handle, name, ext } = parsePath(readme.path);

  return (
    <s-box background="base" border="base" borderRadius="base" padding="large-200">
      <s-stack gap="large-100">
        <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
          <span className="mono">
            <s-text>{handle}</s-text>
            <s-text color="subdued">/</s-text>
            <s-text>{name}</s-text>
            <s-text color="subdued">{ext}</s-text>
          </span>

          {/* Ghost icon button, owner-only. Editing is out of scope (§0), so
              it carries no handler — a no-op like the sidebar's Edit profile. */}
          {isOwner && (
            <s-button type="button" variant="tertiary" icon="edit" accessibilityLabel="Edit README" />
          )}
        </s-stack>

        {/* No divider above this body — the header row runs straight into the
            markdown (§5). */}
        <s-stack gap="base">
          <s-stack gap="small-200">
            <s-heading>{heading}</s-heading>
            {/* The markdown H1's rule: `border/subtle`, one step lighter than
                the card's own `border/default` (§5). */}
            <div className="hairline-subtle" />
          </s-stack>

          {paragraphs.map((paragraph, index) => (
            <s-paragraph key={index}>
              {paragraph.bold ? <s-text type="strong">{paragraph.text}</s-text> : paragraph.text}
            </s-paragraph>
          ))}
        </s-stack>
      </s-stack>
    </s-box>
  );
}
