import type { Metadata } from "next"

import { ProfileOverview } from "@/components/profile/profile-overview"

export const metadata: Metadata = {
  title: "Rowan Alvarez (quietstack-nine)",
  description:
    "Public developer profile — Overview tab for a code-hosting platform.",
}

export default function ProfileOverviewPage() {
  return <ProfileOverview />
}
