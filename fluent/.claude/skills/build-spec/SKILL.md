---
name: build-spec
description: Build a screen from a spec file in this Fluent UI React v9 project. Orchestrate the work — read the spec, plan the build, and delegate right-sized pieces to subagents. Use when the user runs /build-spec with a spec filename.
---

# Build a spec

`$ARGUMENTS` names the spec file to build. If it's empty, ask which spec.

You are the **orchestrator**. You own the plan, the integration, and the final screen. Delegate the building. Write code yourself only for wiring the pieces together.

## 1. Read the spec

Read the file end to end. Note the screen anatomy, every rendering state it exercises, the data shape, and what it leaves unspecified. Don't invent contents for sections it marks silent.

## 2. Ground the plan

Read before planning:

- `CLAUDE.md` — styling and accessibility rules. Read it before any component work.
- `agent-docs/component-map.md` — which component maps to which use case.
- `agent-docs/token-lookup.md` — map a spec's semantic role or raw value to the right token.
- `agent-docs/fluent-v9-notes.md` — token and component behavior the API hides.
- `src/features/publication/` — the fullest worked example of these conventions. Match it.
- `src/router.tsx`, `src/routes/` — where pages mount; `RootLayout` is the shell.

## 3. Plan

Decompose the screen into independent, right-sized pieces. Fix the shared contracts first — route, data fixture shape, component boundaries — so pieces compose without rework. Map each spec section to a component and a token set before you delegate.

## 4. Delegate

Spawn a subagent per piece with the Agent tool.

Right-size the tasks:
- One coherent piece per agent — a section, a component, a fixture. Not "the whole screen," not "one button."
- Sequence what depends: shared types, tokens, and fixtures first; independent sibling sections in parallel.
- Match the agent to the work. Mechanical, well-specified piece → a fast model. Ambiguous or design-heavy piece → a stronger one.

Coordinate so agents never collide — no worktrees needed:
- One file, one agent. Give each piece its own new file (a component, a fixture, a hook). Never assign the same file to two agents.
- Own the shared and integration files yourself: `src/router.tsx`, `RootLayout`, anything under `src/theme/`, and any shared types or fixtures. Subagents create their files; you edit these to wire the pieces in, after they land.
- Agents touching disjoint files run safely in parallel on the same working tree. No branches, no worktrees, no git isolation.

Right-size the briefs. Each subagent starts fresh and can't see this conversation. Every brief carries:
- The exact spec section to build, quoted or referenced by number.
- The docs above it must read, and the worked example to match.
- The hard rules below.
- The acceptance check: what "done" looks like and how to verify.

## Hard rules — put these in every brief

- Use `pnpm` for everything. Never `npm` or `yarn`.
- Import components, `makeStyles`, and `tokens` from `@fluentui/react-components` — **not** `@fluentui/react` (that's v8, a different library).
- Import icons individually from `@fluentui/react-icons`. No `Icon` component, no `initializeIcons()`.
- Style with `makeStyles` and tokens. No hardcoded hex, px, or rem — map every value to a token.
- Match the accessibility and keyboard rules in `CLAUDE.md`.

## 5. Integrate and verify

Wire the pieces into the route. Resolve conflicts and seams yourself. Then run `pnpm dev`, confirm the screen builds clean and matches the spec's anatomy and states, and report what you built.
