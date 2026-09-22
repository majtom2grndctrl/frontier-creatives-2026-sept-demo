import type { Metadata } from "next"
import Link from "next/link"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PROTOTYPES } from "@/lib/prototypes"

export const metadata: Metadata = {
  title: "Prototypes — shadcn-stock",
  description: "The prototypes built against the stock shadcn/ui theme.",
}

/**
 * The project index — the one screen that belongs to this workspace rather than
 * to a prototype. Each prototype below is a whole site with its own chrome, so
 * the index links out to them and adds no shared frame of its own; `AppShell`
 * bypasses itself on this route.
 */
export default function PrototypeIndex() {
  return (
    <main className="bg-background min-h-svh w-full">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm font-medium">
            shadcn-stock
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            The same specs, on stock defaults.
          </h1>
          <p className="text-muted-foreground max-w-prose text-base">
            Every screen below comes from a brand-agnostic build spec, resolved
            against shadcn/ui exactly as it ships: the new-york style, a neutral
            base color, and no custom theme on top.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Prototypes</h2>

          <ul className="grid gap-4 md:grid-cols-2">
            {PROTOTYPES.map((prototype) => (
              <li key={prototype.path} className="flex">
                {/* The card is the link target as a whole — the title's anchor
                    stretches over it, so the accessible name stays the
                    prototype's name while the whole surface is the hit area. */}
                <Card className="hover:border-ring focus-within:border-ring relative w-full transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link
                        href={prototype.path}
                        className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                      >
                        {prototype.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{prototype.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
