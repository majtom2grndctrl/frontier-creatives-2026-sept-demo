import { Button, Text, makeStyles, tokens, useId } from '@fluentui/react-components'
import { Pen16Regular } from '@fluentui/react-icons'
import type { Profile } from '../types'

// §5 Region F — the README card. A bordered card on `surface/base`, holding a
// monospace file-path breadcrumb, an optional pencil, and the author's rendered
// markdown.
//
// §16.1: the card fill and the page background are the same value. The hairline
// border is the only thing separating them — do not tint the interior.
//
// §12.3: this is the roomiest card on the screen. Its padding is deliberately a
// step above the pinned cards' (§9.1); padding is not shared across card types.
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    // §16.1 — the same surface as the page behind it.
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    // §16.10 — borders only, no elevation anywhere on this screen.
    paddingBlock: tokens.spacingVerticalXL,
    paddingInline: tokens.spacingHorizontalXXL,
    rowGap: tokens.spacingVerticalL,
  },
  // §5 — no divider between the header row and the body.
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
  },
  // §12.2 — monospace is used in exactly one place on this screen, and this is it.
  path: {
    minWidth: 0,
    color: tokens.colorNeutralForeground1,
    wordBreak: 'break-all',
  },
  // the separator and the extension step back; the segment names do not (§5).
  pathMuted: {
    color: tokens.colorNeutralForeground2,
  },
  // §5 — a ghost pencil: no border, no fill, muted glyph. `transparent` carries
  // the focus ring and hover wash for free (§14).
  pencil: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    rowGap: tokens.spacingVerticalL,
  },
  headingBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  heading: {
    marginBlock: 0,
    color: tokens.colorNeutralForeground1,
  },
  // §5.1 — the rule under an H1 is part of markdown rendering, not a card
  // divider, so it is `border/subtle`: one step lighter than the card's own edge.
  headingRule: {
    width: '100%',
    border: 'none',
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    marginBlock: tokens.spacingVerticalS,
    marginInline: 0,
  },
  // §5 — no max line length narrower than the card. The fixture's closing
  // paragraph is written to wrap at exactly two lines at the card's own width.
  paragraph: {
    marginBlock: 0,
    color: tokens.colorNeutralForeground1,
  },
  strong: {
    fontWeight: tokens.fontWeightSemibold,
  },
})

// --- a minimal markdown renderer -------------------------------------------
//
// Deliberately NOT a general markdown parser, and not a dependency. It covers
// exactly the subset §5 exercises: an `# H1`, a paragraph that is entirely
// `**bold**`, and a plain paragraph. Anything else falls through as literal
// text. `dangerouslySetInnerHTML` is not used — every run becomes a real node.
//
// Widen this only by widening the block and inline grammars below; do not reach
// for regex-driven html.

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }

/** blank lines separate blocks; `# ` opens a heading. */
function parseBlocks(markdown: string): Block[] {
  return markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map<Block>((block) =>
      block.startsWith('# ')
        ? { kind: 'heading', text: block.slice(2).trim() }
        // soft-wrapped source lines join into one paragraph, as markdown does.
        : { kind: 'paragraph', text: block.replace(/\s*\n\s*/g, ' ') },
    )
}

type Run = { text: string; bold: boolean }

/** splits a line into plain and `**bold**` runs. No other inline marker. */
function parseInlineRuns(text: string): Run[] {
  const runs: Run[] = []
  const bold = /\*\*([^*]+)\*\*/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = bold.exec(text)) !== null) {
    if (match.index > cursor) {
      runs.push({ text: text.slice(cursor, match.index), bold: false })
    }
    runs.push({ text: match[1], bold: true })
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) runs.push({ text: text.slice(cursor), bold: false })
  return runs
}

export interface ReadmeCardProps {
  /** §13 empty state: `null` omits the card entirely — no empty card, no placeholder. */
  readme: Profile['readme']
  /** the first segment of the breadcrumb path. */
  handle: string
  /** §1 — gates the pencil; a visitor sees the card without it. */
  isOwner: boolean
}

export function ReadmeCard({ readme, handle, isOwner }: ReadmeCardProps) {
  const styles = useStyles()
  const pathId = useId('readme-path-')

  // §13 — no README means no card at all, not an empty one.
  if (!readme) return null

  const blocks = parseBlocks(readme.markdown)

  return (
    <section className={styles.card} aria-labelledby={pathId}>
      <div className={styles.header}>
        {/* §12.2 type/small, monospace. Segment names are text/default; the
            separator and the extension are text/muted. */}
        <Text id={pathId} font="monospace" size={200} className={styles.path}>
          {handle}
          <span className={styles.pathMuted}> / </span>
          README
          <span className={styles.pathMuted}>.md</span>
        </Text>
        {isOwner ? (
          // §0 — editing is out of scope; render the affordance, wire it to a no-op.
          <Button
            appearance="transparent"
            icon={<Pen16Regular />}
            className={styles.pencil}
            aria-label="Edit profile README"
            onClick={() => {}}
          />
        ) : null}
      </div>

      <div className={styles.body}>
        {blocks.map((block, index) =>
          block.kind === 'heading' ? (
            // the markdown H1 renders one level down in the document outline —
            // the page's own h1 belongs to the profile identity, not to prose.
            <div key={index} className={styles.headingBlock}>
              {/* §12.2 type/display — the largest text on the page. */}
              <Text as="h2" size={700} weight="bold" className={styles.heading}>
                {block.text}
              </Text>
              <hr className={styles.headingRule} />
            </div>
          ) : (
            // §12.2 type/body, whatever the run weights inside it turn out to be.
            <Text key={index} as="p" size={300} className={styles.paragraph}>
              {parseInlineRuns(block.text).map((run, runIndex) =>
                run.bold ? (
                  <strong key={runIndex} className={styles.strong}>
                    {run.text}
                  </strong>
                ) : (
                  <span key={runIndex}>{run.text}</span>
                ),
              )}
            </Text>
          ),
        )}
      </div>
    </section>
  )
}
