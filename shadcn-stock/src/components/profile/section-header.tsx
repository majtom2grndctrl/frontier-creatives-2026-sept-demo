import { cn } from "@/lib/utils"

/**
 * Spec §9.2 — a main-column section header.
 *
 * Left label at `type/body` in **regular** weight; optional right-aligned
 * action at `type/small` in `accent/primary` with no button chrome. Deliberately
 * NOT the same as the sidebar's bold headings (§12.2) — do not normalize them.
 * No rule beneath (§16.6).
 */
export function SectionHeader({
  label,
  action,
  className,
  id,
}: {
  label: string
  action?: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <h2 id={id} className="text-base font-normal text-foreground">
        {label}
      </h2>
      {action}
    </div>
  )
}
