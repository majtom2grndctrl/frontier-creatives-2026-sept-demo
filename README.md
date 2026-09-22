# Frontier Creatives Demo — Taking Back Control Over AI UI

> **Frontier Creatives Meetup** · Seattle, WA · September 2026  
> Presentation and demo by [Dan Hiester](https://github.com/majtom2grndctrl)

A live demonstration showcasing how **establishing a design system up front allows teams to take back control over the look, feel, and quality of AI-generated user interfaces**.

---

## The Thesis

When AI coding agents are asked to build interfaces from prompts or direct screenshots, the default result is almost always the same: generic "AI aesthetic", bloated Tailwind utility soup, hardcoded hex colors, arbitrary spacing, fragile layout assumptions, and brand drift.

This repository demonstrates an alternative workflow:

```
┌─────────────────────────┐
│     Source Interface    │
│  (Screenshot or screen) │
└────────────┬────────────┘
             │
             │  Agent Skill: `screenshot-to-spec`
             ▼
┌─────────────────────────┐
│ Brand-Agnostic Build    │  • Semantic roles (`surface/base`, `text/muted`, `accent/primary`)
│ Specification           │  • Structural layout & normative hierarchy
│ (*.spec.md)             │  • Data models & fixture edge cases (fictionalized)
└────────────┬────────────┘  • Falsifiable acceptance criteria & negative requirements
             │
             ├──────────────────────────┬──────────────────────────┐
             │                          │                          │
             ▼                          ▼                          ▼
      Target DS:                 Target DS:                 Target DS:
     shadcn-custom             Shopify Polaris          Fluent UI React v9
┌─────────────────────────┐┌─────────────────────────┐┌─────────────────────────┐
│ `AGENTS.md` + Tokens    ││ `AGENTS.md` + Components││ `AGENTS.md` + Tokens    │
└────────────┬────────────┘└────────────┬────────────┘└────────────┬────────────┘
             │                          │                          │
             │ Agent Skill: `build-spec`│ Agent Skill: `build-spec`│ Agent Skill: `build-spec`
             ▼                          ▼                          ▼
┌─────────────────────────┐┌─────────────────────────┐┌─────────────────────────┐
│   Bespoke Brand UI      ││  Native Shopify Admin   ││   Enterprise Fluent UI  │
│  (Roboto Flex, custom   ││ (Web components, shadow ││ (Griffel, tokens, light/│
│   ramp, 19-col grid)    ││  DOM, offline vendored) ││  dark theme provider)   │
└─────────────────────────┘└─────────────────────────┘└─────────────────────────┘
```

1. **Deconstruct UI into a design-agnostic spec**: An AI agent uses the `screenshot-to-spec` skill to reverse-engineer a UI into a brand-agnostic technical specification. All visual values are expressed as *semantic roles* (`surface/base`, `border/subtle`, `text/muted`, `accent/primary`), never literal hex codes or pixels.
2. **Ground the agent in the target design system**: The target codebase provides the agent with its ground truth through `AGENTS.md`, design tokens, component maps, and styling rules.
3. **Orchestrate the build**: The agent uses the `build-spec` skill to read the spec, map semantic roles to the project's native tokens/primitives, decompose the screen into modular tasks for subagents, and verify the result against an acceptance checklist.

**The result:** The exact same interface spec can be implemented across multiple design systems. Instead of looking like a generic clone, each prototype looks and behaves like a native, first-class citizen of that specific design system.

---

## Repository Structure

```
├── developer-profile-overview spec.md    # Spec reverse-engineered from GitHub Profile
├── github-profile-page.png               # Source screenshot for Developer Profile
├── publication-dashboard spec.md         # Spec reverse-engineered from Substack Home
├── substack-screenshot.png               # Source screenshot for Publication Dashboard
├── workspacekanba spec.md                # Spec reverse-engineered from Notion Kanban
├── notion screenshot.png                 # Source screenshot for Workspace Kanban
│
├── shadcn-custom/                        # Bespoke design system (Roboto Flex, custom ramp, grid)
│   ├── .claude/skills/build-spec/        # Orchestrator skill for building specs in this DS
│   ├── AGENTS.md                         # Design system ground truth for agents
│   └── src/app/                          # / (index), /publication, /profile, /styleguide
│
├── shadcn-stock/                         # Vanilla baseline (Next.js 15 + Tailwind v4 + shadcn new-york)
│   ├── .claude/skills/build-spec/        # Orchestrator skill for building specs in stock theme
│   ├── AGENTS.md                         # Stock theme rules
│   └── src/app/                          # / (index), /publication, /profile
│
├── polaris/                              # Shopify Polaris Web Components (Vite + React 19 + TypeScript)
│   ├── .claude/skills/build-spec/        # Orchestrator skill for Polaris components
│   ├── AGENTS.md                         # Component catalog & web component rules
│   └── src/demos/                        # / (index), /publication, /profile (with top switcher)
│
└── fluent/                               # Microsoft Fluent UI React v9 (Vite + React 19 + react-router 8)
    ├── .claude/skills/build-spec/        # Orchestrator skill for Fluent v9
    ├── AGENTS.md                         # Fluent component & styling rules (Griffel/Emotion)
    └── src/routes/, src/features/        # / (index), /publication, /profile
```

---

## The Agent Skills

The workflow relies on two complementary skills:

### 1. `screenshot-to-spec` (Screen Deconstruction)

Located in `~/.claude/skills/screenshot-to-spec`, this skill transforms a screenshot into a complete technical specification that another agent can implement without ever seeing the original image:

- **Reconnaissance before drafting**: Crops regions at full resolution (using macOS `sips`) to inspect subtle details: identifying which element carries background tints, discovering what scrolls, distinguishing content-height from stretched boxes, and catching hover/interaction artifacts.
- **Color sampling to semantic roles**: Samples pixel relationships to detect surface levels and brand accents, deliberately mapping them to roles like `surface/base`, `surface/sunken`, `border/subtle`, `text/muted`, and `accent/primary`. Hex values and pixel measurements are forbidden in the spec.
- **Anonymization with state preservation**: Fictionalizes all personal data, metrics, and identifiers while strictly preserving edge case shapes: string lengths, title wrapping, zero counts, and overflowing lists.
- **Negative requirements**: Explicitly specifies what is *absent* ("no card shadows", "no row dividers", "no footer") to prevent AI coding agents from hallucinating standard boilerplate.
- **Falsifiable acceptance checklist**: Concludes with a concrete checklist of visual, structural, and accessibility criteria that can be checked against a running build.

### 2. `build-spec` (Design-System Grounded Implementation)

Located in `.claude/skills/build-spec` inside each prototype workspace, this skill turns the agent into an **orchestrator**:

- **Grounds the plan**: Reads the project's `AGENTS.md` and `agent-docs/` (component maps, token lookups, theming rules, known component gaps).
- **Decomposes into modular pieces**: Splits the spec into isolated files (components, fixtures, hooks) so work can be delegated to subagents without git collisions.
- **Enforces hard rules**: Forbids ad-hoc CSS or styling outside design tokens.
- **Integration & Verification**: Wires pieces into the app shell, compiles types, and verifies against the spec's acceptance checklist.

---

## The Prototypes

Each prototype folder implements the specs against a different design system philosophy:

| Prototype | Framework | Design System Foundation | Key Features |
|---|---|---|---|
| **[`shadcn-custom/`](./shadcn-custom)** | Next.js 15, React 19, Tailwind v4 | Custom Design System over Radix primitives | • **Roboto Flex** variable font<br>• Custom 14-step type ramp (`text-t1`..`text-t14`) with locked line heights<br>• 20-step geometric spacing series (`s4xs`..`s16`) for padding, gap, radius, and leading<br>• 3 curated 11-step brand scales (`azure`, `magenta`, `gold`)<br>• 19-column grid system (`grid-canvas`, `content-area`, `bleed-area`)<br>• Dedicated interactive style guide |
| **[`shadcn-stock/`](./shadcn-stock)** | Next.js 15, React 19, Tailwind v4 | Stock shadcn/ui (`new-york` style) | • Unmodified neutral theme baseline<br>• 38 pre-installed Radix components<br>• Shows how the spec builds against standard Tailwind utilities and defaults |
| **[`polaris/`](./polaris)** | Vite, React 19, TypeScript | Shopify Polaris Web Components | • Standalone custom elements (`s-*`), no App Bridge dependency<br>• **100% offline-ready**: vendored bundle, 625 SVGs, Inter font, and zero runtime network requests via local shims<br>• No custom component CSS: styling driven strictly by Polaris props (`tone`, `color`, `gap`, `padding`)<br>• Top demo switcher harness |
| **[`fluent/`](./fluent)** | Vite, React 19, react-router 8 | Microsoft Fluent UI React v9 | • `@fluentui/react-components` (v9, not v8)<br>• Griffel `makeStyles` for component styles + Emotion for layout wrappers<br>• Fluent design tokens (`tokens.*`)<br>• Live theme provider with dark/light mode switching |

---

## Running the Demos

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (`corepack enable && corepack prepare pnpm@latest --activate`)

> [!NOTE]
> All projects use `pnpm` exclusively. Run `pnpm install` inside any project folder before starting its development server.

---

### 1. `shadcn-custom` (Bespoke Design System)

Explore the custom design system tokens, type scale, spacing series, and implementations:

```bash
cd shadcn-custom
pnpm install
pnpm dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) for the prototype index:
- **Publication Dashboard:** [http://localhost:3000/publication](http://localhost:3000/publication)
- **Developer Profile:** [http://localhost:3000/profile](http://localhost:3000/profile)
- **Interactive Style Guide:** [http://localhost:3000/styleguide](http://localhost:3000/styleguide)

---

### 2. `shadcn-stock` (Standard Baseline)

Compare how the same specs render under stock shadcn/ui defaults:

```bash
cd shadcn-stock
pnpm install
pnpm dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) for the prototype index:
- **Publication Dashboard:** [http://localhost:3000/publication](http://localhost:3000/publication)
- **Developer Profile:** [http://localhost:3000/profile](http://localhost:3000/profile)

---

### 3. `polaris` (Shopify Polaris Web Components)

Experience the Shopify admin language running completely offline:

```bash
cd polaris
pnpm install
pnpm dev
```

Open your browser to [http://localhost:5173](http://localhost:5173) for the prototype index, or use
the switcher in the top bar to move between:
- **Publication Dashboard** (`/publication`)
- **Developer Profile** (`/profile`)

Typecheck at any time:
```bash
pnpm typecheck
```

---

### 4. `fluent` (Microsoft Fluent UI v9)

Experience Microsoft's Fluent design language:

```bash
cd fluent
pnpm install
pnpm dev
```

Open your browser to [http://localhost:5173](http://localhost:5173) for the prototype index:
- **Publication Dashboard:** [http://localhost:5173/publication](http://localhost:5173/publication)
- **Developer Profile:** [http://localhost:5173/profile](http://localhost:5173/profile)

Typecheck at any time:
```bash
pnpm typecheck
```

---

## The Case Study Specs

In the repo root, you will find three pairs of source screenshots and their corresponding specs:

1. **Publication Dashboard**
   - Source: `substack-screenshot.png` (Substack publication dashboard)
   - Spec: `publication-dashboard spec.md`
   - Covers: KPI metrics selector, step-area subscriber growth chart, latest post card with share menu, draft post overflow list, recent posts table with delivery stats.
2. **Developer Profile Overview**
   - Source: `github-profile-page.png` (GitHub user profile)
   - Spec: `developer-profile-overview spec.md`
   - Covers: Full-bleed chrome band, user identity sidebar, README card, pinned repositories 2x3 grid, year contribution heatmap, radar activity breakdown, timeline list, and year selector rail.
3. **Workspace Kanban Board**
   - Source: `notion screenshot.png` (Notion database kanban board)
   - Spec: `workspacekanba spec.md`
   - Covers: Multi-tier navigation sidebar, breadcrumb bar, view tabs, status-tinted column panels, multi-property task cards, and drag-and-drop affordances.

---

## Key Takeaways for Teams Building with AI

1. **Don't feed screenshots directly to a code-generation prompt.** Reverse-engineer the UI into an abstracted specification first.
2. **Abstract colors and metrics to semantic roles.** By using roles instead of hex values and pixel measurements, you separate structure from aesthetics.
3. **Equip your AI agents with a design system manual.** Provide an `AGENTS.md` and token references in the repo so the model knows which primitives exist and which rules are inviolable.
4. **Use negative constraints.** Models love adding shadows, footers, rounded corners, and helper text. Explicit prohibitions in the spec protect interface fidelity.
5. **Separate orchestration from component implementation.** Have a lead agent plan the structure and shared types, delegate individual components to subagents, and assemble the result cleanly.
