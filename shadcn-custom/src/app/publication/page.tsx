import type { Metadata } from "next"

import { PublicationDashboard } from "@/components/publication/dashboard"

export const metadata: Metadata = {
  title: "Home · Meridian Notes",
  description:
    "Author-facing Home dashboard for a newsletter publishing platform.",
}

export default function PublicationDashboardPage() {
  return <PublicationDashboard />
}
