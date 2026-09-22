import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Profile } from "@/lib/profile/types"

/**
 * Spec §5 — Region F, the README card.
 *
 * The roomiest card on the screen (§12.3), filled with `surface/base` so it is
 * the same value as the page background (§16.1) and separated from it by its
 * hairline border alone. No shadow (§16.10), and no divider between the path
 * row and the body. The caller omits this card entirely when `readme` is null
 * (§13), so there is no empty state here.
 */

type Block =
  | { kind: "h1"; text: string }
  | { kind: "lead"; text: string }
  | { kind: "p"; text: string }

/**
 * A deliberately small fixture renderer, NOT a markdown engine. It handles only
 * the subset the seed README uses — an H1, a fully-bolded lead paragraph, and
 * body paragraphs with inline `**bold**`. Anything it does not recognise falls
 * through to a plain paragraph rather than being dropped. If the README ever
 * needs lists, links or code, reach for a real parser instead of growing this.
 */
function parseMarkdown(markdown: string): Block[] {
  return markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      // Soft line breaks inside a paragraph are not breaks in markdown.
      const text = block.split("\n").map((line) => line.trim()).join(" ")

      if (text.startsWith("# ")) {
        return { kind: "h1", text: text.slice(2).trim() } as const
      }
      if (
        text.length > 4 &&
        text.startsWith("**") &&
        text.endsWith("**") &&
        // ...and the bold run spans the whole paragraph, rather than the
        // paragraph merely starting and ending with separate bold runs.
        !text.slice(2, -2).includes("**")
      ) {
        return { kind: "lead", text: text.slice(2, -2) } as const
      }
      return { kind: "p", text } as const
    })
}

/** Splits a paragraph on `**`; every odd-indexed run is bold. */
function renderInline(text: string) {
  return text.split("**").map((run, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {run}
      </strong>
    ) : (
      run
    )
  )
}

/**
 * `path` arrives as e.g. "quietstack-nine / README.md". Segment names stay
 * `text/default` while the separator and the file extension go `text/muted`,
 * so the path has to be split rather than printed whole. This is the only
 * monospace on the entire screen (§12.2).
 */
function FilePath({ path }: { path: string }) {
  const segments = path.split("/").map((segment) => segment.trim())
  const fileName = segments[segments.length - 1] ?? ""
  const dot = fileName.lastIndexOf(".")
  const base = dot > 0 ? fileName.slice(0, dot) : fileName
  const extension = dot > 0 ? fileName.slice(dot) : ""

  return (
    <span className="font-mono text-sm text-foreground">
      {segments.slice(0, -1).map((segment, i) => (
        <span key={i}>
          {segment}
          <span className="text-muted-foreground"> / </span>
        </span>
      ))}
      {base}
      {extension ? (
        <span className="text-muted-foreground">{extension}</span>
      ) : null}
    </span>
  )
}

export function ReadmeCard({
  readme,
  isOwner,
}: {
  readme: NonNullable<Profile["readme"]>
  isOwner: boolean
}): React.JSX.Element {
  const blocks = parseMarkdown(readme.markdown)

  return (
    <Card className="gap-5 rounded-xl bg-background py-8 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-8">
        <FilePath path={readme.path} />
        {isOwner ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label="Edit README"
          >
            <Pencil />
          </Button>
        ) : null}
      </CardHeader>
      {/* No max-width here on purpose: the fixture's closing paragraph is
          written to wrap at exactly two lines at the card's own width (§5). */}
      <CardContent className="flex flex-col gap-4 px-8">
        {blocks.map((block, i) => {
          if (block.kind === "h1") {
            return (
              <div key={i}>
                {/* The person's name is the page's h1 (rendered in the
                    sidebar), so the README's markdown heading takes the level
                    below it while keeping `type/display` styling (§5). */}
                <h2 className="text-3xl font-bold text-foreground">
                  {block.text}
                </h2>
                {/* Markdown's own rule under an H1 — `border/subtle`, one step
                    lighter than the card's border. Not a card divider. */}
                <hr className="mt-3 border-t border-border/60" />
              </div>
            )
          }
          if (block.kind === "lead") {
            return (
              <p key={i} className="text-base font-semibold text-foreground">
                {renderInline(block.text)}
              </p>
            )
          }
          return (
            <p key={i} className="text-base text-foreground">
              {renderInline(block.text)}
            </p>
          )
        })}
      </CardContent>
    </Card>
  )
}
