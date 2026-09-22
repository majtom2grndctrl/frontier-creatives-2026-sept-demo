"use client"

import * as React from "react"

import { StubPopover } from "@/components/dashboard/stub-menu"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Spec §5.1 "attached heading" + §10.1 card shell — used by Latest post (§7),
 * Drafts (§8), and Recent posts (§9), so all three read as one family.
 *
 * The heading sits INSIDE the card, in a header band separated from the body by
 * a hairline divider, with a trailing text link on the right. That link is
 * deliberately muted, not accent-coloured: §7.1 calls these secondary actions.
 *
 * The Overview panel (§6) uses the *detached* pattern instead and composes
 * `Card` directly without this header band — do not route it through here.
 */
export function SectionCard({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string
  /** The trailing header link, e.g. `View stats` / `View all`. */
  action?: { label: string; description: string }
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <Card
      className={cn(
        // gap-0/py-0 so the header band can own the divider and the body can
        // control its own rhythm; overflow-hidden keeps a scrolling body (§8)
        // clipped to the card's radius.
        "gap-0 overflow-hidden py-0 shadow-none",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <h2 className="text-base leading-none font-semibold">{title}</h2>
        {action ? (
          <StubPopover
            align="end"
            title={action.label}
            description={action.description}
          >
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]"
            >
              {action.label}
            </button>
          </StubPopover>
        ) : null}
      </div>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </Card>
  )
}
