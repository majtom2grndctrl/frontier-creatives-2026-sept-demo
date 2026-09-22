import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PROTOTYPES } from "@/lib/prototypes"

export const metadata: Metadata = {
  title: "Prototypes — shadcn-custom",
  description:
    "The prototypes built against this project's custom design system.",
}

/**
 * The project index — the one screen that belongs to this workspace rather than
 * to a prototype. Each prototype below is a whole site with its own chrome, so
 * the index links out to them and adds no shared frame of its own.
 */
export default function PrototypeIndex() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="grid-canvas gap-y-s8 py-s10">
        <header className="content-area flex flex-col gap-s3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>shadcn-custom</Badge>
            <Badge variant="outline">Roboto Flex</Badge>
            <Badge variant="outline">19 columns</Badge>
          </div>

          <h1 className="text-t6 tracking-tight md:text-t8">
            The same specs, in one system.
          </h1>

          <p className="max-w-prose text-t2 text-muted-foreground">
            Every screen below comes from a brand-agnostic build spec, resolved
            against this project&rsquo;s type ramp, spacing series, color scales,
            and grid.
          </p>
        </header>

        <section className="content-area flex flex-col gap-s3">
          <h2 className="text-t4 tracking-tight">Prototypes</h2>

          <ul className="grid gap-s2 md:grid-cols-2">
            {PROTOTYPES.map((prototype) => (
              <li key={prototype.path} className="flex">
                {/* The card is the link target as a whole — the title's anchor
                    stretches over it, so the accessible name stays the
                    prototype's name while the whole surface is the hit area. */}
                <Card className="relative w-full transition-colors hover:border-azure-400 focus-within:border-azure-400">
                  <CardHeader className="gap-s1">
                    <CardTitle className="text-t3 leading-s5 tracking-tight">
                      <Link
                        href={prototype.path}
                        className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                      >
                        {prototype.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-t1 leading-s4">
                      {prototype.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section className="content-area flex flex-col gap-s3">
          <h2 className="text-t4 tracking-tight">The system itself</h2>

          <Card className="relative w-full transition-colors hover:border-azure-400 focus-within:border-azure-400">
            <CardHeader className="gap-s1">
              <CardTitle className="text-t3 leading-s5 tracking-tight">
                <Link
                  href="/styleguide"
                  className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                >
                  Style guide
                </Link>
              </CardTitle>
              <CardDescription className="text-t1 leading-s4">
                The type ramp, spacing series, radius steps, color scales, and
                19-column grid the prototypes are built from.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </main>
  )
}
