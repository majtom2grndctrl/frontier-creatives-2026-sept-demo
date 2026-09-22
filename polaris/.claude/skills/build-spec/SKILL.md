---
name: build-spec
description: Build a screen from a spec file in this Shopify Polaris web components project. Orchestrate the work — read the spec, plan the build, and delegate right-sized pieces to subagents. Use when the user runs /build-spec with a spec filename.
---

# Build a spec

`$ARGUMENTS` names the spec file to build. If it's empty, ask which spec.

You are the **orchestrator**. You own the plan, the integration, and the final screen. Delegate the building. Write code yourself only for wiring the pieces together.

## 1. Read the spec

Read the file end to end. Note the screen anatomy, every rendering state it exercises, the data shape, and what it leaves unspecified. Don't invent contents for sections it marks silent.

## 2. Ground the plan

Read before planning:

- `agent-docs/use-cases.md` — "I need to build X" → which `s-*` elements, with working markup. Read first.
- `agent-docs/components.md` — the 59 `s-*` elements: attributes, slots, events, tokens.
- `agent-docs/gaps.md` — what Polaris React had that this doesn't, and the sanctioned substitute.
- `agent-docs/icons.txt` — the 515 valid `s-icon` names. Grep it; don't guess.
- `AGENTS.md` — the hard rules and the design-token usage. Re-read it.

## 3. Plan

Decompose the screen into independent, right-sized pieces. Fix the shared contracts first — the `s-page` shell, data fixture shape, section boundaries — so pieces compose without rework. Map each spec section to `s-*` elements and their token props before you delegate. If a spec asks for something Polaris lacks, resolve it against `gaps.md` in the plan, not per subagent.

## 4. Delegate

Spawn a subagent per piece with the Agent tool.

Right-size the tasks:
- One coherent piece per agent — a section, a fixture, an overlay. Not "the whole page," not "one button."
- Sequence what depends: shared types, the page shell, and fixtures first; independent sibling sections in parallel.
- Match the agent to the work. Mechanical, well-specified piece → a fast model. Ambiguous or design-heavy piece → a stronger one.

Coordinate so agents never collide — no worktrees needed:
- One file, one agent. Give each piece its own new file (a section component, a fixture). Never assign the same file to two agents.
- Own the shared and integration files yourself: the `s-page` shell, the page route, and any shared types or fixtures. Subagents create their files; you edit these to wire the pieces in, after they land.
- Agents touching disjoint files run safely in parallel on the same working tree. No branches, no worktrees, no git isolation.

Right-size the briefs. Each subagent starts fresh and can't see this conversation. Every brief carries:
- The exact spec section to build, quoted or referenced by number.
- The docs above it must read.
- The hard rules below.
- The acceptance check: what "done" looks like and how to verify.

## Hard rules — put these in every brief

- Use `pnpm` for everything. Never `npm` or `yarn`.
- Only the 59 elements in `components.md` exist. Verify an element is real before using it. No `@shopify/polaris`, no App Bridge (`s-title-bar`, `s-save-bar`, `s-nav-menu` are inert).
- No Tailwind, Bootstrap, or any CSS framework. No custom CSS to restyle a component — appearance comes from props.
- Use the design system on props: the spacing scale on `gap`/`padding`, `tone` for meaning and `color` for intensity, `borderRadius="base"`. Never a hex, px, or literal color.
- Slot attributes are kebab-case: `slot="primary-action"`. Wire overlays by `id` with `commandFor` + `command`.
- Every field takes a `label`. Icon-only buttons take `accessibilityLabel`. Sentence case for all copy.

## 5. Integrate and verify

Wire the pieces into the page. Resolve conflicts and seams yourself. Then run `pnpm typecheck` (types are wired — trust it), run `pnpm dev`, and watch the console for `polaris:` warnings. Confirm the screen matches the spec's anatomy and states, and report what you built.
