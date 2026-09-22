import * as React from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileCard } from "@/components/profile/primitives"
import type { Profile } from "@/lib/profile/types"

/* -------------------------------------------------------------------------
   Fixture-scale markdown renderer (spec §5)
   ---------------------------------------------------------------------- */

type ReadmeNode =
  | { kind: "h1"; text: string }
  | { kind: "lead"; text: string }
  | { kind: "paragraph"; text: string }

/**
 * Not a markdown pipeline — there isn't one in this project, and the spec
 * forbids adding one. The fixture only ever emits an `# ` heading, a
 * `**bold**` lead paragraph, and a plain paragraph, so a blank-line split
 * plus three pattern checks is the whole grammar this needs.
 */
function parseReadme(markdown: string): ReadmeNode[] {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): ReadmeNode => {
      if (block.startsWith("# ")) return { kind: "h1", text: block.slice(2) }
      const boldMatch = block.match(/^\*\*(.+)\*\*$/)
      if (boldMatch) return { kind: "lead", text: boldMatch[1] }
      return { kind: "paragraph", text: block }
    })
}

/* -------------------------------------------------------------------------
   README card (spec §5, Region F)
   ---------------------------------------------------------------------- */

export function ReadmeCard({
  readme,
  isOwner,
}: {
  readme: NonNullable<Profile["readme"]>
  isOwner: boolean
}): React.JSX.Element {
  // Fixture ships the path as one string; split it here so the separator and
  // extension can take the muted color while the segment names stay default.
  const segments = readme.path.split("/")
  const file = segments.pop() ?? ""
  const dotIndex = file.lastIndexOf(".")
  const fileName = dotIndex === -1 ? file : file.slice(0, dotIndex)
  const extension = dotIndex === -1 ? "" : file.slice(dotIndex)

  const nodes = parseReadme(readme.markdown)

  return (
    // Roomiest padding on the screen (spec §12.3) — the README card is the
    // one exception to the pinned cards' tighter p-s4.
    //
    // A step above where the ramp would put it if padding tracked type size.
    // It does not: this card is ~930px wide and did not get narrower when the
    // type scale stepped down, so its padding should not have either. s6 is
    // what p-s5 resolved to before that shift.
    <ProfileCard className="px-s6 py-s6">
      <div className="flex items-center justify-between gap-s2">
        <p className="truncate font-mono text-sm">
          {segments.map((segment) => (
            <React.Fragment key={segment}>
              <span className="text-foreground">{segment}</span>
              <span className="text-muted-foreground">/</span>
            </React.Fragment>
          ))}
          <span className="text-foreground">{fileName}</span>
          <span className="text-muted-foreground">{extension}</span>
        </p>
        {isOwner ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit README"
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil />
          </Button>
        ) : null}
      </div>
      {/* No divider between the header row and the body (spec §5, §16). */}
      <div className="flex flex-col gap-s3 pt-s5">
        {nodes.map((node, i) => {
          if (node.kind === "h1") {
            return (
              <div key={i} className="flex flex-col gap-s2xs">
                <h1 className="text-t4 font-bold text-foreground">
                  {node.text}
                </h1>
                {/* border/subtle: one step lighter than the card's own
                    border/default (spec §5, §12.1) — not a card divider. */}
                <Separator className="bg-border/60" />
              </div>
            )
          }
          if (node.kind === "lead") {
            return (
              <p key={i} className="text-t1 font-bold text-foreground">
                {node.text}
              </p>
            )
          }
          // No max-w-prose here on purpose: the card must not impose a line
          // length narrower than itself (spec §5).
          return (
            <p key={i} className="text-t1 text-foreground">
              {node.text}
            </p>
          )
        })}
      </div>
    </ProfileCard>
  )
}
