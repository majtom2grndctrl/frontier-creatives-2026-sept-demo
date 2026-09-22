"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Info, MoreHorizontal } from "lucide-react"

import { IconButton } from "@/components/dashboard/icon-button"
import { StubMenu } from "@/components/dashboard/stub-menu"
import { TrendChart } from "@/components/dashboard/trend-chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DEFAULT_METRIC_ID, metrics } from "@/data/dashboard"
import {
  PERIOD_OPTIONS,
  formatDeltaPct,
  formatMetricValue,
  metricLabel,
} from "@/lib/dashboard/format"
import type { Metric, Period } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

/**
 * Spec §6 — Overview.
 *
 * Two structural decisions carry this section, and both are easy to get wrong:
 *
 * 1. §5.1 DETACHED heading. The `Overview` heading and its two controls sit
 *    OUTSIDE and ABOVE the bordered panel, directly on the pane surface. The
 *    panel holds data only. This is the opposite of the other three sections,
 *    which use `section-card`'s attached header band — do not route this
 *    section through that shell.
 *
 * 2. §6.2 is a TABLIST, not three stat cards. One bordered container holds the
 *    segment strip above a hairline divider and the chart below it; the strip's
 *    selection is what chooses the plotted series (§15 calls this the single
 *    most important a11y decision on the screen).
 *
 * This component owns the screen's only state (§17): `selectedMetricId` and
 * `period`. Everything else is fixture data.
 */
export function OverviewSection(): React.JSX.Element {
  const [selectedMetricId, setSelectedMetricId] =
    React.useState<string>(DEFAULT_METRIC_ID)
  const [period, setPeriod] = React.useState<Period>("1y")

  const selectedIndex = Math.max(
    0,
    metrics.findIndex((metric) => metric.id === selectedMetricId)
  )
  const selectedMetric = metrics[selectedIndex]

  const uid = React.useId()
  const panelId = `${uid}-panel`
  const tabId = (metricId: string) => `${uid}-tab-${metricId}`

  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  // §15 — roving focus. The selected tab is the only one in the tab order;
  // Left/Right (and Home/End) select and focus the adjacent segment, wrapping.
  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const count = metrics.length
    let nextIndex: number
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (selectedIndex + 1) % count
        break
      case "ArrowLeft":
        nextIndex = (selectedIndex - 1 + count) % count
        break
      case "Home":
        nextIndex = 0
        break
      case "End":
        nextIndex = count - 1
        break
      default:
        return
    }
    event.preventDefault()
    setSelectedMetricId(metrics[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section className="flex flex-col gap-4">
      {/* §6.1 — detached heading row: bare pane surface, no panel behind it. */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base leading-none font-semibold">Overview</h2>
        {/* Two outlined controls of equal height (§6.1): h-8 select, size-8 button. */}
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <SelectTrigger size="sm" aria-label="Trend period" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <StubMenu label="Overview options" items={["Export CSV", "Embed"]}>
            <IconButton label="Overview options" className="border bg-transparent">
              <MoreHorizontal />
            </IconButton>
          </StubMenu>
        </div>
      </div>

      {/*
        One container for the strip AND the chart (§6.2). `overflow-hidden` is
        load-bearing: it is what makes the selected segment's accent top bar
        follow the container's radius at the outer corners instead of running
        square to the edge. The bar is a plain absolutely-positioned child of
        its segment, so it lives inside this clipping context rather than
        floating above it.
      */}
      <div className="bg-card overflow-hidden rounded-xl border">
        {/*
          Resting fill is the recessed role (§13 surface/recessed), so the strip
          reads a step below the card the chart sits on. The `border-b` is the
          hairline divider between strip and chart — TrendChart draws neither
          the container nor this divider.

          `--surface-recessed` exists because stock light mode resolves
          --background and --card to the same white, which would have hidden the
          raised/recessed step entirely in light mode (§13 requires it to invert
          correctly in both themes).
        */}
        <div
          role="tablist"
          aria-label="Overview metric"
          className="bg-surface-recessed grid grid-cols-3 border-b"
        >
          {metrics.map((metric, index) => (
            <MetricSegment
              key={metric.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              metric={metric}
              period={period}
              selected={metric.id === selectedMetricId}
              tabId={tabId(metric.id)}
              panelId={panelId}
              onSelect={() => setSelectedMetricId(metric.id)}
              onKeyDown={handleTabKeyDown}
            />
          ))}
        </div>

        {/*
          §6.3 / §15 — the chart region is the tablist's panel. The role and the
          label belong here, not inside TrendChart.
        */}
        <div
          role="tabpanel"
          id={panelId}
          tabIndex={0}
          aria-labelledby={tabId(selectedMetric.id)}
          aria-label={`${metricLabel(selectedMetric, period)} trend`}
          className="outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50"
        >
          <TrendChart metric={selectedMetric} period={period} />
        </div>
      </div>
    </section>
  )
}

/**
 * One segment of the §6.2 strip.
 *
 * The ⓘ trigger is a real focusable `<button>` (§14.6 wants the tooltip on
 * keyboard focus, not just hover), so it cannot nest inside the tab `<button>`.
 * It is a sibling positioned over the space the label row reserves for it —
 * which keeps the markup valid and means a click on it never also switches the
 * tab.
 */
const MetricSegment = React.forwardRef<
  HTMLButtonElement,
  {
    metric: Metric
    period: Period
    selected: boolean
    tabId: string
    panelId: string
    onSelect: () => void
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  }
>(function MetricSegment(
  { metric, period, selected, tabId, panelId, onSelect, onKeyDown },
  ref
) {
  // §6.2 inference — the label is derived from the period, so the third segment
  // relabels itself when the §6.1 select changes.
  const label = metricLabel(metric, period)
  const value = formatMetricValue(metric.value, metric.format)
  const priorValue = formatMetricValue(metric.priorValue, metric.format) ?? ""
  // The empty state omits the pill entirely — never a 0 or a 0% chip.
  const delta = metric.value === null ? null : metric.deltaPct

  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        role="tab"
        id={tabId}
        aria-selected={selected}
        aria-controls={panelId}
        tabIndex={selected ? 0 : -1}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex h-full w-full flex-col gap-3 p-6 text-left transition-colors outline-none",
          // Inset focus ring: an outer ring would be sliced off by the
          // container's overflow-hidden on the two edge segments.
          "focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50",
          "motion-reduce:transition-none",
          // §6.2 — the selected segment is a raised block on the recessed
          // strip. Its own edges read as the dividers, which is why there are
          // no vertical rules between segments (§18).
          selected ? "bg-card" : "hover:bg-card/50"
        )}
      >
        {selected ? (
          <span
            aria-hidden="true"
            className="bg-primary absolute inset-x-0 top-0 h-1"
          />
        ) : null}

        {/* Label row. min-h-10 reserves two lines so every segment's value and
            comparison line share a baseline whether the label wraps or not. */}
        <span className="text-muted-foreground flex min-h-10 items-start gap-2 text-sm font-medium">
          <span>{label}</span>
          {/* Reserves the ⓘ's box at the segment's right edge. */}
          <span aria-hidden="true" className="ml-auto size-5 shrink-0" />
        </span>

        {/* Value row — the only place the display type step appears (§13). */}
        <span className="flex items-baseline gap-2">
          {value === null ? (
            <>
              <span
                aria-hidden="true"
                className="text-muted-foreground text-3xl leading-none font-semibold"
              >
                –
              </span>
              <span className="sr-only">No data</span>
            </>
          ) : (
            <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
              {value}
            </span>
          )}
          {delta !== null ? <DeltaPill pct={delta} /> : null}
        </span>

        <span className="text-muted-foreground text-xs">From {priorValue}</span>
      </button>

      {/* §14.6 — definition tooltip on hover AND keyboard focus. Radix's
          Tooltip opens on both. Sits over the spacer reserved above. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`About ${label}`}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-6 right-6 grid size-5 place-items-center rounded-sm transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
          >
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{metric.infoText}</TooltipContent>
      </Tooltip>
    </div>
  )
})

/**
 * §6.2 / §15 — a rounded RECTANGLE at the small radius, not a capsule: nothing
 * on this screen is fully rounded except the avatar. Direction never rides on
 * colour alone — the arrow glyph carries it visually and an `sr-only` word
 * carries it to the accessibility tree.
 */
function DeltaPill({ pct }: { pct: number }): React.JSX.Element {
  const up = pct >= 0
  const Arrow = up ? ArrowUp : ArrowDown

  return (
    <span className="bg-success text-success-foreground inline-flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 text-xs font-medium">
      <Arrow aria-hidden="true" className="size-3" />
      <span className="sr-only">{up ? "up " : "down "}</span>
      {formatDeltaPct(Math.abs(pct))}
    </span>
  )
}
