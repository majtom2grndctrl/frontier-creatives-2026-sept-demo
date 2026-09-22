/**
 * The prototypes built from the repo's shared specs, in spec order.
 *
 * Names and descriptions are identical across every demo project in this repo,
 * so the same screen is recognisable by the same name in each design system.
 */
export type Prototype = {
  name: string
  path: string
  description: string
}

export const PROTOTYPES: Prototype[] = [
  {
    name: "Publication Dashboard",
    path: "/publication",
    description:
      "Author-facing home for a newsletter publishing platform: metric selector, subscriber growth chart, latest post, drafts, and recent posts.",
  },
  {
    name: "Developer Profile",
    path: "/profile",
    description:
      "Public profile overview for a code-hosting platform: identity sidebar, pinned repositories, contribution heatmap, and activity timeline.",
  },
]
