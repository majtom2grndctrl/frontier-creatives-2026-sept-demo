"use client"

import * as React from "react"
import { Info, MoreHorizontal } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeltaPill, OverflowMenu, SectionCard } from "./primitives"
import { TrendChart } from "./trend-chart"
import { formatMetricValue } from "@/lib/publication/format"
import { PERIOD_OPTIONS } from "@/lib/publication/series"
import type { Metric, Period } from "@/lib/publication/types"
import { cn } from "@/lib/utils"

/**
 * Overview (spec §6). The only section on this screen using the *detached*
 * heading pattern: the heading and its controls sit outside and above the
 * bordered panel, on bare pane surface. Everything else attaches its heading
 * inside the card.
 */
export function OverviewSection({
  metrics,
  selectedMetricId,
  onSelectMetric,
  period,
  onPeriodChange,
  domain,
}: {
  metrics: Metric[]
  selectedMetricId: string
  onSelectMetric: (id: string) => void
  period: Period
  onPeriodChange: (period: Period) => void
  domain: string
}) {
  const selected =
    metrics.find((metric) => metric.id === selectedMetricId) ?? metrics[0]

  return (
    <section aria-labelledby="overview-heading" className="flex flex-col gap-s2">
      <div className="flex items-center justify-between gap-s2">
        <h2 id="overview-heading" className="text-t2 font-semibold">
          Overview
        </h2>
        <div className="flex items-center gap-s2xs">
          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as Period)}
          >
            <SelectTrigger aria-label="Reporting period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <OverflowMenu
            label="Overview options"
            className="size-9"
            icon={<MoreHorizontal />}
            items={["Export CSV", "Embed"]}
          />
        </div>
      </div>

      <SectionCard>
        <MetricTabs
          metrics={metrics}
          selectedMetricId={selected.id}
          onSelectMetric={onSelectMetric}
        />
        <div className="border-t border-border p-s3">
          <TrendChart
            key={selected.id}
            metric={selected}
            period={period}
            domain={domain}
            id="overview-chart"
            labelledBy={`metric-tab-${selected.id}`}
          />
        </div>
      </SectionCard>
    </section>
  )
}

/**
 * The metric strip (spec §6.2) — a tablist, not three stat cards. The
 * selection drives the chart below, which is its tabpanel.
 *
 * The strip's resting fill is the recessed surface; the selected segment is a
 * raised block sitting on it, carrying an accent bar along its top edge. The
 * apparent "dividers" between segments are just that block's own edges, so no
 * vertical rules are drawn — there is none between two unselected segments.
 */
function MetricTabs({
  metrics,
  selectedMetricId,
  onSelectMetric,
}: {
  metrics: Metric[]
  selectedMetricId: string
  onSelectMetric: (id: string) => void
}) {
  const tabRefs = React.useRef<(HTMLDivElement | null)[]>([])

  function handleKeyDown(event: React.KeyboardEvent) {
    const current = metrics.findIndex((metric) => metric.id === selectedMetricId)
    const last = metrics.length - 1
    let next = -1
    if (event.key === "ArrowRight") next = current === last ? 0 : current + 1
    else if (event.key === "ArrowLeft") next = current === 0 ? last : current - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = last
    if (next < 0) return
    event.preventDefault()
    onSelectMetric(metrics[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Choose which metric the trend chart plots"
      onKeyDown={handleKeyDown}
      className="grid grid-cols-1 grid-rows-none gap-y-s1 bg-surface-recessed sm:grid-cols-3 sm:grid-rows-[auto_auto_auto]"
    >
      {metrics.map((metric, index) => {
        const selected = metric.id === selectedMetricId
        return (
          <div
            key={metric.id}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            role="tab"
            id={`metric-tab-${metric.id}`}
            aria-selected={selected}
            aria-controls="overview-chart"
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelectMetric(metric.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelectMetric(metric.id)
              }
            }}
            className={cn(
              "relative grid cursor-pointer gap-y-s1 p-s3 outline-none",
              "sm:row-span-3 sm:grid-rows-subgrid",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
              "motion-safe:transition-colors",
              selected
                ? "bg-surface-raised"
                : "hover:bg-foreground/[0.03]"
            )}
          >
            {selected && (
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-s4xs bg-accent-graphic"
              />
            )}

            <div className="flex items-start justify-between gap-s1">
              <span className="text-sm text-muted-foreground">
                {metric.label}
              </span>
              <InfoTip label={metric.label} text={metric.infoText} />
            </div>

            <div className="flex flex-wrap items-center gap-s1">
              {metric.value === null ? (
                <span className="text-t4 font-semibold text-muted-foreground">
                  <span aria-hidden>&mdash;</span>
                  <span className="sr-only">No data</span>
                </span>
              ) : (
                <span className="text-t4 font-semibold tabular-nums">
                  {formatMetricValue(metric.value, metric.format)}
                </span>
              )}
              {metric.deltaPct !== null && (
                <DeltaPill deltaPct={metric.deltaPct} />
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              From {formatMetricValue(metric.priorValue, metric.format)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

/** The ⓘ beside a metric label. Opens on hover and on keyboard focus. */
function InfoTip({ label, text }: { label: string; text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          onClick={(event) => event.stopPropagation()}
          className="shrink-0 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Info aria-hidden className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-s13">{text}</TooltipContent>
    </Tooltip>
  )
}
