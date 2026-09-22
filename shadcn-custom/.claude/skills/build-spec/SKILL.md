---
name: build-spec
description: Build a screen from a spec file in this Next.js + shadcn project with a custom design system. Orchestrate the work — read the spec, plan the build, and delegate right-sized pieces to subagents. Use when the user runs /build-spec with a spec filename.
---

# Build a spec

`$ARGUMENTS` names the spec file to build. If it's empty, ask which spec.

You are the **orchestrator**. You own the plan, the integration, and the final screen. Delegate the building. Write code yourself only for wiring the pieces together.

## 1. Read the spec

Read the file end to end. Note the screen anatomy, every rendering state it exercises, the data shape, and what it leaves unspecified. Resolve every semantic role in the spec against this project's tokens. Don't invent contents for sections it marks silent.

## 2. Ground the plan

Read before planning:

- `agent-docs/styling.md` — color, spacing, sizing, `cn()`, icons.
- `agent-docs/composition.md` — which component to reach for, and how they nest.
- `agent-docs/theming.md` — the token layer: type ramp, spacing series, brand scales, grid.
- `src/components/ui/` — the 38 installed shadcn components.
- `AGENTS.md` — the design system and rules. Re-read it.

## 3. Plan

Decompose the screen into independent, right-sized pieces. Fix the shared contracts first — route, data fixture shape, component boundaries — so pieces compose without rework. Map each spec section to components and tokens before you delegate. Pick one accent for the screen and hold it.

## 4. Delegate

Spawn a subagent per piece with the Agent tool.

Right-size the tasks:
- One coherent piece per agent — a section, a component, a fixture. Not "the whole screen," not "one button."
- Sequence what depends: shared types, fixtures, and any newly-copied components first; independent sibling sections in parallel.
- Match the agent to the work. Mechanical, well-specified piece → a fast model. Ambiguous or design-heavy piece → a stronger one.

Coordinate so agents never collide — no worktrees needed:
- One file, one agent. Give each piece its own new file (a component, a fixture, a hook). Never assign the same file to two agents.
- Own the shared and integration files yourself: the `page.tsx` route, `globals.css`, and any shared types or fixtures. Subagents create their files; you edit these to wire the pieces in, after they land.
- Agents touching disjoint files run safely in parallel on the same working tree. No branches, no worktrees, no git isolation.

Right-size the briefs. Each subagent starts fresh and can't see this conversation. Every brief carries:
- The exact spec section to build, quoted or referenced by number.
- The docs above it must read.
- The hard rules below.
- The acceptance check: what "done" looks like and how to verify.

## Hard rules — put these in every brief

- Use `pnpm` for everything. Never `npm` or `yarn`.
- Consume the design tokens; don't redefine them. Sizes come from the spacing series (`p-s3`, `gap-s2`, `rounded-lg`), font sizes from the type ramp (`text-t*`). Semantic tokens first (`bg-primary`, `text-muted-foreground`); reach for a brand scale (`bg-azure-500`) only for deliberate color. One accent per screen.
- No hardcoded hex/rgb, one-off pixel sizes, or Tailwind palette classes — except status: `text-destructive`, stock `green`, stock `amber`.
- Layout with `grid-canvas` / `content-area` / `bleed-area`.
- Don't run the `shadcn` CLI — the network blocks it. To add an uninstalled component, copy it from `component-source/ui/` and swap `@/registry/new-york-v4/...` imports for `@/components/...`.
- Components are Radix-based. Compose with `asChild`. No Base UI `render` prop or `nativeButton`.

## 5. Integrate and verify

Wire the pieces into the route. Resolve conflicts and seams yourself. Then run `pnpm dev`, confirm the screen builds clean and matches the spec's anatomy and states, and report what you built.
