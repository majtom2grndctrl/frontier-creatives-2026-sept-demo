import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Style guide — shadcn-custom",
  description:
    "The type ramp, spacing ramp, and 19-column grid that define this system.",
};

type TypeStep = {
  name: string;
  size: string;
  /* The spacing step this size's line height resolves to. */
  leading: string;
  cls: string;
  specimen: string;
};

const typeRamp: TypeStep[] = [
  {
    name: "text-t1",
    size: "14.4px",
    leading: "s4 · 20.00px",
    cls: "text-t1",
    specimen: "The quick brown fox jumps over the lazy dog",
  },
  {
    name: "text-t2",
    size: "18px",
    leading: "s5 · 24.99px",
    cls: "text-t2",
    specimen: "The quick brown fox jumps over the lazy dog",
  },
  {
    name: "text-t3",
    size: "22.5px",
    leading: "s6 · 31.24px",
    cls: "text-t3",
    specimen: "The quick brown fox jumps over the lazy dog",
  },
  {
    name: "text-t4",
    size: "28.13px",
    leading: "s6 · 31.24px",
    cls: "text-t4",
    specimen: "The quick brown fox jumps over the lazy dog",
  },
  {
    name: "text-t5",
    size: "35.16px",
    leading: "s7 · 39.05px",
    cls: "text-t5",
    specimen: "Grids, type, and rhythm",
  },
  {
    name: "text-t6",
    size: "43.95px",
    leading: "s8 · 48.82px",
    cls: "text-t6",
    specimen: "Grids, type, and rhythm",
  },
  {
    name: "text-t7",
    size: "54.93px",
    leading: "s9 · 61.02px",
    cls: "text-t7",
    specimen: "Composition first",
  },
  {
    name: "text-t8",
    size: "68.66px",
    leading: "s10 · 76.28px",
    cls: "text-t8",
    specimen: "Composition first",
  },
  {
    name: "text-t9",
    size: "85.83px",
    leading: "s11 · 95.34px",
    cls: "text-t9",
    specimen: "Type at scale",
  },
  {
    name: "text-t10",
    size: "107.29px",
    leading: "s12 · 119.18px",
    cls: "text-t10",
    specimen: "Type at scale",
  },
  {
    name: "text-t11",
    size: "134.11px",
    leading: "s13 · 148.98px",
    cls: "text-t11",
    specimen: "Scale",
  },
  {
    name: "text-t12",
    size: "167.64px",
    leading: "s14 · 186.22px",
    cls: "text-t12",
    specimen: "Ag",
  },
  {
    name: "text-t13",
    size: "209.55px",
    leading: "s15 · 232.77px",
    cls: "text-t13",
    specimen: "Ag",
  },
  {
    name: "text-t14",
    size: "261.93px",
    leading: "s16 · 290.97px",
    cls: "text-t14",
    specimen: "Ag",
  },
];

type SpaceStep = {
  name: string;
  size: string;
  cls: string;
  base?: boolean;
};

const spacingRamp: SpaceStep[] = [
  { name: "s4xs", size: "4.19px", cls: "w-s4xs" },
  { name: "s3xs", size: "5.24px", cls: "w-s3xs" },
  { name: "s2xs", size: "6.55px", cls: "w-s2xs" },
  { name: "sxs", size: "8.19px", cls: "w-sxs" },
  { name: "s1", size: "10.24px", cls: "w-s1", base: true },
  { name: "s2", size: "12.80px", cls: "w-s2" },
  { name: "s3", size: "16.00px", cls: "w-s3" },
  { name: "s4", size: "20.00px", cls: "w-s4" },
  { name: "s5", size: "24.99px", cls: "w-s5" },
  { name: "s6", size: "31.24px", cls: "w-s6" },
  { name: "s7", size: "39.05px", cls: "w-s7" },
  { name: "s8", size: "48.82px", cls: "w-s8" },
  { name: "s9", size: "61.02px", cls: "w-s9" },
  { name: "s10", size: "76.28px", cls: "w-s10" },
  { name: "s11", size: "95.34px", cls: "w-s11" },
  { name: "s12", size: "119.18px", cls: "w-s12" },
  { name: "s13", size: "148.98px", cls: "w-s13" },
  { name: "s14", size: "186.22px", cls: "w-s14" },
  { name: "s15", size: "232.77px", cls: "w-s15" },
  { name: "s16", size: "290.97px", cls: "w-s16" },
];

type RadiusStep = {
  name: string;
  size: string;
  cls: string;
};

const radiusScale: RadiusStep[] = [
  { name: "rounded-xs", size: "8.19px", cls: "rounded-xs" },
  { name: "rounded-sm", size: "10.24px", cls: "rounded-sm" },
  { name: "rounded-md", size: "12.80px", cls: "rounded-md" },
  { name: "rounded-lg", size: "16.00px", cls: "rounded-lg" },
  { name: "rounded-xl", size: "20.00px", cls: "rounded-xl" },
];

type ColorStep = {
  step: string;
  value: string;
  swatch: string;
  label: string;
};

type ColorScale = {
  name: string;
  hue: string;
  steps: ColorStep[];
};

const colorScales: ColorScale[] = [
  {
    name: "magenta",
    hue: "hue 328",
    steps: [
      {
        step: "050",
        value: "oklch(0.971 0.018 328)",
        swatch: "bg-magenta-050",
        label: "text-magenta-950",
      },
      {
        step: "100",
        value: "oklch(0.936 0.040 328)",
        swatch: "bg-magenta-100",
        label: "text-magenta-950",
      },
      {
        step: "200",
        value: "oklch(0.874 0.080 328)",
        swatch: "bg-magenta-200",
        label: "text-magenta-950",
      },
      {
        step: "300",
        value: "oklch(0.795 0.122 328)",
        swatch: "bg-magenta-300",
        label: "text-magenta-950",
      },
      {
        step: "400",
        value: "oklch(0.706 0.160 328)",
        swatch: "bg-magenta-400",
        label: "text-magenta-950",
      },
      {
        step: "500",
        value: "oklch(0.624 0.190 328)",
        swatch: "bg-magenta-500",
        label: "text-magenta-050",
      },
      {
        step: "600",
        value: "oklch(0.551 0.180 328)",
        swatch: "bg-magenta-600",
        label: "text-magenta-050",
      },
      {
        step: "700",
        value: "oklch(0.472 0.152 328)",
        swatch: "bg-magenta-700",
        label: "text-magenta-050",
      },
      {
        step: "800",
        value: "oklch(0.395 0.122 328)",
        swatch: "bg-magenta-800",
        label: "text-magenta-050",
      },
      {
        step: "900",
        value: "oklch(0.317 0.092 328)",
        swatch: "bg-magenta-900",
        label: "text-magenta-050",
      },
      {
        step: "950",
        value: "oklch(0.223 0.055 328)",
        swatch: "bg-magenta-950",
        label: "text-magenta-050",
      },
    ],
  },
  {
    name: "azure",
    hue: "hue 237",
    steps: [
      {
        step: "050",
        value: "oklch(0.971 0.015 237)",
        swatch: "bg-azure-050",
        label: "text-azure-950",
      },
      {
        step: "100",
        value: "oklch(0.936 0.035 237)",
        swatch: "bg-azure-100",
        label: "text-azure-950",
      },
      {
        step: "200",
        value: "oklch(0.874 0.071 237)",
        swatch: "bg-azure-200",
        label: "text-azure-950",
      },
      {
        step: "300",
        value: "oklch(0.795 0.119 237)",
        swatch: "bg-azure-300",
        label: "text-azure-950",
      },
      {
        step: "400",
        value: "oklch(0.706 0.154 237)",
        swatch: "bg-azure-400",
        label: "text-azure-950",
      },
      {
        step: "500",
        value: "oklch(0.624 0.136 237)",
        swatch: "bg-azure-500",
        label: "text-azure-050",
      },
      {
        step: "600",
        value: "oklch(0.551 0.120 237)",
        swatch: "bg-azure-600",
        label: "text-azure-050",
      },
      {
        step: "700",
        value: "oklch(0.472 0.103 237)",
        swatch: "bg-azure-700",
        label: "text-azure-050",
      },
      {
        step: "800",
        value: "oklch(0.395 0.086 237)",
        swatch: "bg-azure-800",
        label: "text-azure-050",
      },
      {
        step: "900",
        value: "oklch(0.317 0.069 237)",
        swatch: "bg-azure-900",
        label: "text-azure-050",
      },
      {
        step: "950",
        value: "oklch(0.223 0.048 237)",
        swatch: "bg-azure-950",
        label: "text-azure-050",
      },
    ],
  },
  {
    name: "gold",
    hue: "hue 85",
    steps: [
      {
        step: "050",
        value: "oklch(0.971 0.018 85)",
        swatch: "bg-gold-050",
        label: "text-gold-950",
      },
      {
        step: "100",
        value: "oklch(0.936 0.040 85)",
        swatch: "bg-gold-100",
        label: "text-gold-950",
      },
      {
        step: "200",
        value: "oklch(0.874 0.080 85)",
        swatch: "bg-gold-200",
        label: "text-gold-950",
      },
      {
        step: "300",
        value: "oklch(0.795 0.122 85)",
        swatch: "bg-gold-300",
        label: "text-gold-950",
      },
      {
        step: "400",
        value: "oklch(0.706 0.144 85)",
        swatch: "bg-gold-400",
        label: "text-gold-950",
      },
      {
        step: "500",
        value: "oklch(0.624 0.127 85)",
        swatch: "bg-gold-500",
        label: "text-gold-050",
      },
      {
        step: "600",
        value: "oklch(0.551 0.112 85)",
        swatch: "bg-gold-600",
        label: "text-gold-050",
      },
      {
        step: "700",
        value: "oklch(0.472 0.096 85)",
        swatch: "bg-gold-700",
        label: "text-gold-050",
      },
      {
        step: "800",
        value: "oklch(0.395 0.080 85)",
        swatch: "bg-gold-800",
        label: "text-gold-050",
      },
      {
        step: "900",
        value: "oklch(0.317 0.064 85)",
        swatch: "bg-gold-900",
        label: "text-gold-050",
      },
      {
        step: "950",
        value: "oklch(0.223 0.045 85)",
        swatch: "bg-gold-950",
        label: "text-gold-050",
      },
    ],
  },
];

const constants = [
  {
    label: "Base type size",
    value: "14.4px",
    note: "--type-base, 0.9rem. Step t1 of the ramp.",
  },
  {
    label: "Scale ratio",
    value: "1.25",
    note: "One ratio drives both the type and the spacing ramps.",
  },
  {
    label: "Spacing base",
    value: "0.71094 em",
    note: "Cap height of Roboto Flex (1456/2048 em), so 10.24px at s1.",
  },
];

const columns = Array.from({ length: 19 }, (_, i) => i + 1);

const paddingDemos = [
  { label: "p-s2", cls: "p-s2" },
  { label: "p-s4", cls: "p-s4" },
  { label: "p-s6", cls: "p-s6" },
];

const gapDemos = [
  { label: "gap-s2", cls: "gap-s2" },
  { label: "gap-s4", cls: "gap-s4" },
  { label: "gap-s6", cls: "gap-s6" },
];

const releaseCards = [
  {
    tag: "Foundation",
    title: "One ratio, everywhere",
    body: "Type and space share the same 1.25 multiplier, so a heading two steps up always clears itself by a matching two steps of air.",
    action: "Read the ramp",
  },
  {
    tag: "Layout",
    title: "Nineteen columns",
    body: "Seventeen live columns with a gutter column held on each side. Every block on this page is placed against that same canvas.",
    action: "See the grid",
  },
  {
    tag: "Rhythm",
    title: "Optical, not arbitrary",
    body: "Spacing starts at the cap height of the face itself, so the vertical rhythm is measured in letters rather than in round numbers.",
    action: "Inspect spacing",
  },
];

function SectionHeading({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-s1">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-mono tabular-nums">
          {index}
        </Badge>
        <h2 className="text-t4 tracking-tight">{title}</h2>
      </div>
      <p className="max-w-prose text-muted-foreground">{description}</p>
      <Separator className="mt-s1" />
    </div>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

export default function StyleguidePage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="grid-canvas gap-y-s8 py-s8">
        <header className="content-area flex flex-col gap-s3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Style guide</Badge>
            <Badge variant="outline">14 type steps</Badge>
            <Badge variant="outline">18 spacing steps</Badge>
            <Badge variant="outline">5 radius steps</Badge>
            <Badge variant="outline">3 color scales</Badge>
            <Badge variant="outline">19 columns</Badge>
          </div>

          <h1 className="text-t6 tracking-tight md:text-t8">
            A system, set first.
          </h1>

          <p className="max-w-prose text-t2 text-muted-foreground">
            Every size on this page comes from three constants. Nothing below is
            a one-off value.
          </p>

          <dl className="grid gap-s1 sm:grid-cols-3">
            {constants.map((c) => (
              <div
                key={c.label}
                className="flex flex-col gap-s1 rounded-lg border border-border bg-card p-s2"
              >
                <dt>
                  <Meta>{c.label}</Meta>
                </dt>
                <dd className="text-t3 leading-s5 tracking-tight">
                  {c.value}
                </dd>
                <dd className="text-sm text-muted-foreground">{c.note}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="bleed-area grid-canvas gap-y-s3">
          <div className="content-area">
            <SectionHeading
              index="01"
              title="The grid"
              description="Nineteen columns across the full canvas. The two outer columns are held back as gutters, leaving seventeen live content columns — that is what content-area spans."
            />
          </div>

          <div className="bleed-area grid-canvas">
            {columns.map((n) => {
              const isGutter = n === 1 || n === 19;
              return (
                <div key={n} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "h-s7 w-full rounded-sm",
                      isGutter
                        ? "bg-muted"
                        : "bg-primary/15 ring-1 ring-inset ring-primary/25",
                    )}
                  />
                  <span className="hidden font-mono text-xs tabular-nums text-muted-foreground md:inline">
                    {n}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bleed-area grid-canvas gap-y-2">
            <div className="col-start-1 col-span-1 flex justify-center">
              <Meta>gut</Meta>
            </div>
            <div className="content-area flex items-center gap-3">
              <div className="h-px flex-1 bg-primary" />
              <span className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted-foreground">
                content-area · 17 live
              </span>
              <div className="h-px flex-1 bg-primary" />
            </div>
            <div className="col-start-19 col-span-1 flex justify-center">
              <Meta>gut</Meta>
            </div>
          </div>

          <div className="bleed-area grid-canvas gap-y-2">
            <div className="content-area rounded-md bg-accent px-s1 py-s1 text-sm">
              content-area — columns 2 → 18
            </div>
            <div className="col-start-2 col-span-8 rounded-md bg-muted px-s1 py-s1 text-sm">
              8 columns
            </div>
            <div className="col-start-10 col-span-9 rounded-md bg-muted px-s1 py-s1 text-sm">
              9 columns
            </div>
            <div className="col-start-2 col-span-5 rounded-md bg-muted px-s1 py-s1 text-sm">
              5
            </div>
            <div className="col-start-7 col-span-6 rounded-md bg-muted px-s1 py-s1 text-sm">
              6
            </div>
            <div className="col-start-13 col-span-6 rounded-md bg-muted px-s1 py-s1 text-sm">
              6
            </div>
          </div>
        </section>

        <section className="content-area flex flex-col gap-s3">
          <SectionHeading
            index="02"
            title="The type ramp"
            description="Fourteen steps from 14.4px, each one a quarter larger than the last. The top three steps run past the width of the page, so they scroll inside their own row."
          />

          <div className="flex flex-col gap-s2">
            {typeRamp.map((step) => (
              <div
                key={step.name}
                className="flex flex-col gap-s1 border-b border-border pb-s2"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                    {step.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {step.size}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    line height {step.leading}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <p
                    className={cn(step.cls, "whitespace-nowrap tracking-tight")}
                  >
                    {step.specimen}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-area flex flex-col gap-s3">
          <SectionHeading
            index="03"
            title="The spacing ramp"
            description="Sixteen steps rooted in the cap height of the typeface rather than a round pixel number, plus four sub-base steps that continue the series downward. Each bar below is exactly one step wide."
          />

          <div className="overflow-x-auto">
            <div className="flex min-w-fit flex-col gap-s1">
              {spacingRamp.map((step) => (
                <div
                  key={step.name}
                  className={cn(
                    "flex items-center gap-3 rounded-sm py-1",
                    step.base &&
                      "bg-muted px-2 ring-1 ring-inset ring-border",
                  )}
                >
                  <span className="w-14 shrink-0 font-mono text-xs uppercase tracking-widest text-foreground">
                    {step.name}
                  </span>
                  <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {step.size}
                  </span>
                  <div
                    className={cn("h-6 shrink-0 rounded-sm bg-primary", step.cls)}
                  />
                  {step.base ? (
                    <span className="shrink-0 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      optical base
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-s2">
            <Meta>padding, in place</Meta>
            <div className="flex flex-wrap items-start gap-s2">
              {paddingDemos.map((d) => (
                <div
                  key={d.label}
                  className={cn(
                    "rounded-lg bg-muted",
                    "ring-1 ring-inset ring-border",
                    d.cls,
                  )}
                >
                  <div className="rounded-sm bg-primary px-3 py-2 font-mono text-xs text-primary-foreground">
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-s2">
            <Meta>gap, in place</Meta>
            <div className="flex flex-col gap-s2">
              {gapDemos.map((d) => (
                <div key={d.label} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {d.label}
                  </span>
                  <div className={cn("flex", d.cls)}>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="size-6 rounded-sm bg-primary" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-s2">
            <Meta>stacked rhythm</Meta>
            <div className="space-y-s2 rounded-lg border border-border bg-card p-s3">
              <p className="text-t3 tracking-tight">Vertical rhythm</p>
              <p className="text-muted-foreground">
                This block sits on space-y-s2 inside p-s3. The measure, the
                leading, and the air between lines all resolve to the same ramp.
              </p>
              <p className="text-muted-foreground">
                Change the ratio in one place and every relationship on the page
                moves with it.
              </p>
            </div>
          </div>
        </section>

        <section className="content-area flex flex-col gap-s3">
          <SectionHeading
            index="04"
            title="Radius"
            description="Corners ride the same geometric series as space. The five radius steps sit three steps up that series from the sub-base, which on a 1.25 ratio is 1.953x — the nearest the scale comes to double."
          />

          <p className="max-w-prose text-muted-foreground">
            Radius shares the spacing series, so corners and gaps stay in
            rhythm — rounded-lg is exactly spacing step s3.
          </p>

          <div className="flex flex-wrap gap-s3">
            {radiusScale.map((step) => (
              <div key={step.name} className="flex flex-col gap-s1">
                <div
                  className={cn(
                    "size-24 border border-border bg-primary/15 sm:size-28",
                    step.cls,
                  )}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                    {step.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {step.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-area flex flex-col gap-s3">
          <SectionHeading
            index="05"
            title="Color"
            description="Three palettes on one lightness ramp, eleven steps each. Hue holds constant down a scale; chroma arcs to a peak at the middle and is pulled back wherever the sRGB gamut runs out, which is why azure and gold read quieter than magenta at the same step."
          />

          <div className="flex flex-col gap-s4">
            {colorScales.map((scale) => (
              <div key={scale.name} className="flex flex-col gap-s2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                    {scale.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {scale.hue}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex min-w-fit gap-s2">
                    {scale.steps.map((step) => (
                      <div
                        key={step.step}
                        className="flex w-s11 shrink-0 flex-col gap-s1"
                      >
                        <div
                          className={cn(
                            "flex h-s7 items-end rounded-md p-s1",
                            step.swatch,
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono text-xs tabular-nums",
                              step.label,
                            )}
                          >
                            {step.step}
                          </span>
                        </div>
                        <span className="font-mono text-xs leading-tight tabular-nums text-muted-foreground">
                          {step.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-s2 rounded-lg border border-border bg-card p-s3">
            <Meta>in place</Meta>
            <div className="flex flex-wrap gap-s2">
              <span className="rounded-md bg-magenta-100 px-s2 py-s1 text-sm text-magenta-900">
                magenta 100 / 900
              </span>
              <span className="rounded-md bg-azure-600 px-s2 py-s1 text-sm text-azure-050">
                azure 600 / 050
              </span>
              <span className="rounded-md border border-gold-500 bg-gold-050 px-s2 py-s1 text-sm text-gold-800">
                gold 050 / 500 / 800
              </span>
            </div>
          </div>
        </section>

        <section className="content-area flex flex-col gap-s3">
          <SectionHeading
            index="06"
            title="Applied"
            description="The ramps carrying real interface: shadcn primitives sized, padded, and spaced entirely from the tokens above."
          />

          <div className="flex flex-col gap-s3 rounded-xl border border-border bg-card p-s4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>v2.0</Badge>
              <Badge variant="outline">September 2026</Badge>
            </div>
            <h3 className="max-w-prose text-t5 tracking-tight">
              The system ships before the screens.
            </h3>
            <p className="max-w-prose text-t2 text-muted-foreground">
              Decide the ratio, the base, and the canvas once. Everything after
              that is composition.
            </p>
            <div className="flex flex-wrap gap-s1">
              <Button size="lg">Open the tokens</Button>
              <Button size="lg" variant="outline">
                View the grid
              </Button>
            </div>
          </div>

          <div className="grid gap-s2 md:grid-cols-3">
            {releaseCards.map((card) => (
              <Card key={card.title} className="gap-s2 py-s3">
                <CardHeader className="gap-s1 px-s3">
                  <Badge variant="secondary" className="w-fit">
                    {card.tag}
                  </Badge>
                  <CardTitle className="text-t3 tracking-tight">
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.body}</CardDescription>
                </CardHeader>
                <CardContent className="px-s3">
                  <Separator />
                </CardContent>
                <CardFooter className="px-s3">
                  <Button variant="ghost" size="sm">
                    {card.action}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-s2 rounded-lg bg-muted p-s3">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              t1 / s1 · t3 / s3 · t5 / s5
            </span>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-t1">Body</span>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-t3">Heading</span>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-t5">Display</span>
          </div>
        </section>

        <footer className="content-area pb-s6">
          <Separator className="mb-s2" />
          <p className="text-sm text-muted-foreground">
            18px base · 1.25 ratio · 0.71094 optical height · radius on the same series · 19 columns, 17 live
          </p>
        </footer>
      </div>
    </main>
  );
}
