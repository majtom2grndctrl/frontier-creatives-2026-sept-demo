# Technical Specification — Workspace App: Kanban Board View

**Status:** Draft for prototype build
**Audience:** AI coding agents building a clickable prototype
**Scope:** One screen — a document-workspace application displaying a database page rendered as a Kanban board, inside the full app shell (sidebar + tab bar + page header).

---

## 0. How to read this spec

1. **Brand adaptation is required.** This repository ships a brand guide (design tokens, type scale, color ramps, spacing scale, component primitives). Every visual value below is expressed as a *semantic role*, never a literal hex code, font name, or pixel value. Resolve each role against the repo's brand guide. If the brand guide lacks a role, pick the nearest available token and note the substitution in a code comment.
2. **Layout structure is normative; layout metrics are not.** The arrangement of regions, their nesting, their scroll behavior, and their relative visual weight must match. Exact widths, paddings, and radii should come from the brand guide's spacing/radius scales.
3. **All sample content in this spec is fictional.** Names, tasks, tags, and dates are invented and chosen to exercise every visual state (wrapping titles, cards with and without dates, 0–2 chips in each of three chip properties, empty columns, an overflowing column). Do not treat any of it as real data, and do not substitute real personal data for it.
4. **Non-goals:** server persistence, authentication, multi-user sync, and real-time collaboration. Board data lives in a local store (§12). The Board view is the deliverable; the one Table view required by §6.2 may be minimal.

---

## 1. Product summary

A desktop-first knowledge-workspace application. The user navigates a tree of pages from a left sidebar; pages open in browser-style tabs. The screen specified here is a **database page** ("Tasks Board") rendered with a **Board (Kanban)** view: tasks are grouped into columns by a `status` property and displayed as cards.

Primary user goals on this screen:
- Scan all in-flight work grouped by status.
- Move a task between statuses by dragging its card.
- Create a task directly into a specific status column.
- Open a task to see its full page.
- Switch between saved views of the same underlying database.

---

## 2. Screen anatomy

```
┌──────────────────────────────────────────────────────────────────────────┐
│ A. Title bar: [◦◦◦] [workspace] │ [⇤][←][→] [ tab ][+]                   │
├────────────────┬─────────────────────────────────────────────────────────┤
│                │ C. Page bar: [breadcrumb]      [meta][Share][★][⋯]      │
│  B. Sidebar    ├─────────────────────────────────────────────────────────┤
│                │ D. Page header: [emoji] [Page title]                    │
│  - Nav+search  │    [view tabs]                        [view toolbar]    │
│  - Recents     ├─────────────────────────────────────────────────────────┤
│  - Favorites   │ E. Board canvas — status-tinted panels, content-height  │
│  - Teamspaces  │   ┌────────┐┌────────┐┌────────┐┌────────┐ ...          │
│  - Shared      │   │ [pill] ││ [pill] ││ [pill] ││ [pill] │              │
│  - Private     │   │ card   ││ card   ││ card   │└────────┘              │
│                │   │ card   │└────────┘│ card   │  (short column)        │
│  - Footer CTA  │   │ + New  │          │ card   │             (F. FAB)   │
│                │   └────────┘          │ + New  │                        │
│                │                       └────────┘                        │
└────────────────┴─────────────────────────────────────────────────────────┘
```

Region breakdown:

| ID | Region | Behavior |
|----|--------|----------|
| A | Title bar | Fixed, full width, app chrome height. Single row: OS window controls and workspace identity at the far left (over the sidebar's column), then sidebar toggle, history back/forward, the tab strip, and a new-tab button. |
| B | Sidebar | Fixed left rail, resizable/collapsible, independently vertically scrollable. |
| C | Page bar | Sticky to top of the content pane. Breadcrumb left, page actions right. |
| D | Page header | Scrolls with content *or* sticks — see §6.1. Contains title block, view tabs, view toolbar. |
| E | Board canvas | Fills remaining space. Scrolls horizontally as a unit when the columns exceed the pane width; vertical overflow scrolls the whole content pane, not individual columns. |
| F | Assistant FAB | Floating, bottom-right, above all content. |

---

## 3. Region A — Title bar

Left → right:

1. **Window controls** — three circular macOS-style dots (close / minimize / zoom). In a web prototype these are decorative; render them but make them non-interactive (`aria-hidden`).
2. **Workspace identity** — a small avatar/icon plus the workspace owner's display name (sample: `Alex Morgan`). Clicking opens a workspace switcher menu (prototype: a stub popover listing one workspace + "Log out").
3. **Sidebar toggle** — icon button; collapses/expands Region B.
4. **History back / forward** — icon buttons, disabled-styled when there is no history in that direction.
5. **Tab strip** — one or more tabs. Active tab shows page emoji + truncated page title with an ellipsis. Each tab has a close affordance on hover. A `+` button appends a new tab.
6. **Right of the tab strip** — empty space that acts as a window-drag region. (The global search affordance lives in the sidebar's top row, §4.1 — not here.)

Visual roles: title bar uses the app-chrome surface role (subtly distinct from both sidebar and content surfaces). Active tab uses the content surface role so it reads as continuous with the page below. Inactive tabs use the chrome surface with secondary text.

---

## 4. Region B — Sidebar

### 4.1 Structure

Fixed-width rail (roughly one-sixth of a wide desktop viewport; use the brand guide's nearest layout width token). Contents in order:

**Top action group** (no section label):
- `Home` — house icon, rendered in the *selected/active* nav style since Home is the current root.
- Icon-only row of three utility buttons: Chat/Inbox-style icons (sample labels: `Chats`, `Drafts`, `Inbox`). Each shows a tooltip on hover.
- A search icon button aligned to the right of that row.

**Sections**, each with a small uppercase-or-muted section label and a collapse chevron on hover:

| Section | Contents (sample, fictional) |
|---------|------------------------------|
| Recents | `Discovery Notes`, `Projects`, `Tasks Board` *(selected)*, `Presentation Draft`, `Vendor Shortlist`, `Reply to Intro Email`, `Send Portfolio Link`, `Quarterly Filing`, `Personal Filing`, `Role Search`, `More…` |
| Favorites | `Tasks Board`, `Retro Notes (2025)`, `Projects`, `Discovery Notes`, `Journal` → child: *No pages inside*, `Retro Notes (2023)`, `Portfolio` |
| Teamspaces | `Workspace HQ`, `Tasks Board` *(selected)*, `Projects`, `+ Add new` |
| Shared | `Retro Notes (2025)`, `Retro Notes (2023)` |
| Private | `Presentation Draft`, `New page`, `New page`, `Onboarding Notes`, `Openings Tracker`, `Journal` → child: *No pages inside*, `Role Descriptions`, … (list continues below the fold) |

Each row: leading icon (an emoji, a document glyph, or a database glyph), then a single-line label that truncates with an ellipsis. Rows that can have children show a disclosure triangle that replaces the icon on hover. An empty expanded parent renders a muted, non-interactive `No pages inside` child row.

**Footer**, pinned to the bottom of the sidebar, always visible:
- A pill-shaped primary-ish button: `New chat` with a leading sparkle/assistant icon and a trailing keyboard-shortcut hint (sample: `⌘O`). Renders the hint in a muted, smaller style.
- A secondary icon button to its right (compose/new-page).

### 4.2 States

- **Selected row:** filled background using the subtle-selected surface role, plus a visible focus/selection outline on the currently open page. Two rows may read as selected simultaneously when the same page appears under multiple sections (e.g. `Tasks Board` under both Recents and Teamspaces) — this is intentional and matches the source design.
- **Hover row:** lighter background, reveals a `⋯` overflow button and a `+` add-child button on the right edge.
- **Scroll:** sidebar body scrolls; a thin scrollbar appears on hover/scroll. The top action group and the footer do not scroll.
- **Collapsed:** sidebar animates to zero width; a floating expand button appears at the top-left of the content pane.

---

## 5. Region C — Page bar

- **Left:** breadcrumb trail — `Workspace HQ / Tasks Board`, each segment prefixed by its icon, separated by a slash or chevron per the brand guide. Segments are links; the last segment is the current page and is styled as plain text but is click-to-rename.
- **Right, in order:** a muted `Edited <relative or short date>` label (sample: `Edited Mar 16`); a `Share` button with a leading people icon; a star/favorite toggle (filled when favorited — favorited in the default state); a `⋯` page-menu button.
- Sticky to the top of the content pane; gains a hairline bottom border once the board scrolls.

---

## 6. Region D — Page header

### 6.1 Title block

- Large page emoji (sample: 📝) at display size, immediately left of the title.
- Page title as the page's largest type role: `Tasks Board`.
- Title is `contenteditable` in the prototype; edits update the tab strip, breadcrumb, and sidebar labels live.

### 6.2 View tabs

A horizontal row of saved views directly beneath the title. Each tab = a view-type icon + the view name.

| View name | Type icon | Active by default |
|-----------|-----------|-------------------|
| `The Big Board` | board | ✅ |
| `Priorities` | board | — |
| `Household` | table | — |

Active tab: full-strength text with an underline/indicator in the accent role. Inactive: muted text, background tint on hover. A trailing `+` button (revealed on hover of the row) adds a view — prototype may no-op with a toast.

Switching views must actually change what is rendered. `The Big Board` shows every record. `Priorities` is the same board with a stored filter `Flags contains Priority`. `Household` renders the records whose Category includes `Household` as a table with columns Title / Status / Flags / Date / Category / Client. Each view keeps its own filters, sorts, and `visibleProperties`, and switching back restores them — so views are data, not three hardcoded screens.

### 6.3 View toolbar

Right-aligned on the same baseline as the view tabs. Icon buttons, each with a tooltip, in order:

1. **Filter** — opens a popover to add a filter rule (property, operator, value). Prototype: support filtering by tag and by status.
2. **Sort** — popover to sort cards within columns by Title or Date, asc/desc.
3. **Automations** (lightning icon) — stub popover, "No automations yet".
4. **Assistant / AI** (sparkle icon) — stub.
5. **Search in view** (magnifier) — expands into an inline text input that filters cards by title substring, live.
6. **View settings** (sliders icon) — popover listing the view's properties (Flags, Date, Category, Client, page icon) as toggles that reorder-and-show/hide. Toggling must actually add, remove, and reorder the chip rows and the date on every card, since card layout is driven by `visibleProperties` (§7.4).
7. **`New`** — a filled primary button with an attached dropdown caret. Clicking the main body creates a new card in the first column and opens it; the caret opens a menu to choose the destination column.

---

## 7. Region E — Board canvas

### 7.1 Layout

- A horizontally scrolling flex row of fixed-width columns with a consistent gutter. Column width: roughly one-seventh of a wide desktop content area; use a single shared width token so all columns match.
- The canvas has generous leading padding, set so the **cards'** left edge lines up with the page title above (the column panel itself bleeds slightly further left by its own padding).
- Horizontal scrolling: mouse wheel with shift, trackpad, or drag on empty canvas. At the reference width all seven columns fit with room to spare, so the horizontal scroll is a narrower-viewport affordance, not a default state.
- Each column **is** a rounded panel filled with a low-opacity tint of its own status color (a few percent — enough to group, not enough to compete with the cards on top of it). The panel wraps the header pill, the cards, and the column footer.
- The panel's height **hugs its content**: a two-card column is short, and the tail of the canvas below it is bare page surface. Columns are top-aligned, not stretched to equal height.
- The **whole content pane scrolls vertically as one unit** — columns do not scroll independently and column headers do not pin. A column taller than the viewport simply extends past the fold and is reached by scrolling the pane.

### 7.2 Column header

- Inside the top of the column panel, a small **status pill**: a colored dot + the status name, on a tinted background matching the status color at low opacity. Colors come from the brand guide's *categorical/status* palette — assign one distinct hue per status, in palette order. Do not hardcode the source colors.
- An optional card-count badge (muted, right of the name). **Off in the default state** — expose it as a view setting rather than rendering it.
- **On hover:** a `⋯` (column menu: rename, set color, hide, delete) and a `+` (add card to top) appear at the right of the header.

### 7.3 Statuses (columns), left → right

| Order | Status | Notes |
|-------|--------|-------|
| 1 | `Icebox` | Parked / someday |
| 2 | `Inbox` | Unsorted capture |
| 3 | `To do` | Ready to start |
| 4 | `In progress` | Empty in the default dataset |
| 5 | `Current priority` | |
| 6 | `In review` | Empty in the default dataset |
| 7 | `Done` | Longest column; must overflow past the bottom of the viewport |

The status ordering is part of the data model (`status.order`), not the rendering code.

### 7.4 Card

A card is a rounded rectangle on the **neutral** elevated-surface role — hairline border, small shadow (brand guide's card/elevation-1 token). The card is *not* tinted; the status color lives on the column panel behind it (§7.1), and the resulting white-on-tint contrast is what makes the columns legible.

Contents, top → bottom. The card renders the view's `visibleProperties` **in the order that list defines** — this ordering is a data concern, not hardcoded markup. Four properties are visible by default, and the default order deliberately straddles the date:

1. **Icon + Title.** Some cards show a small leading document glyph before the title (property `hasPageIcon`); most do not. Title wraps to at most two lines, then truncates with an ellipsis.
2. **Flags** — chips from the `Flags` multi-select (`Priority`, `Personal Projects`). Renders **above** the date.
3. **Date** — a muted, small-type line (sample format: `October 27, 2025`; format via the locale-aware date API, not a hand-rolled string). Dates are uniformly muted; past dates get no special treatment.
4. **Category** — chips from the `Category` multi-select (`Household`, `Networking`, `Volunteer`, `Paid Work`, `Equity Stake`, `Social Portfolio`).
5. **Client** — chips from the `Client` multi-select (`Startup A`, `Hospitality Client`, `Community Assoc.`).

Each multi-select occupies **its own line**, even when it holds a single chip. That per-property line break is the only signal that two adjacent chips belong to different properties, so do not merge the three into one flowing chip row. Within a property, chips wrap onto additional lines.

All three chip properties render identically: small pill chips, each with a stable color drawn from the brand guide's categorical palette keyed by the chip's *name*, so the same value is always the same color everywhere it appears. Chip color is per value, not per property — the three properties share one palette, and two values in different properties may legitimately land on the same hue. Any property may be empty on any card; §10 exercises every combination.

Card states: hover raises elevation slightly and shows a `⋯` in the top-right corner; active/dragging tilts or lifts the card and leaves a dashed placeholder in the source position; focus shows a visible focus ring.

Clicking a card opens it as a page (prototype: a modal or side panel showing the title, a status select, a date picker, multi-select editors for Flags, Category, and Client, and an empty body — every edit writes back to the board immediately). `Esc` closes it and returns focus to the originating card.

### 7.5 Column footer

Inside the column panel, below the last card, sits a full-width `+ New page` affordance: a card-shaped block on a slightly lighter inset surface than the panel around it, with its label and `+` rendered in the column's status color at reduced strength. Hover deepens the tint; focus shows a ring. Clicking replaces it with an inline, focused text input; `Enter` commits a new card into that column and re-opens a fresh input for rapid entry; `Esc` cancels; blur with content commits, blur while empty cancels.

Empty columns (`In progress`, `In review`) show *only* this affordance — no empty-state illustration or text.

### 7.6 Drag and drop

- Cards drag between and within columns. Use the HTML5 drag-and-drop API or a small library already present in the repo.
- While dragging, valid drop targets show an insertion line at the computed index; the dragged card follows the cursor at reduced opacity.
- Dropping updates the card's `status` and `order`, persists, and animates the card into place.
- Keyboard accessible alternative: with a card focused, `Space` picks up, arrow keys move between positions/columns, `Space` drops, `Esc` cancels. Announce each move via an `aria-live="polite"` region.
- Columns themselves are reorderable by dragging their header pill.

---

## 8. Region F — Assistant FAB

A circular floating button in the bottom-right corner of the content pane, offset from both edges, above board content but below any modal. Contains an assistant/sparkle glyph. Clicking opens a right-side assistant panel (prototype: static panel with an input, a "Ask about this board" prompt, and a canned reply). The panel overlays the board; `Esc` closes it.

---

## 9. Data model

```ts
type ID = string;

interface Workspace {
  id: ID;
  name: string;            // "Alex Morgan"
  teamspaces: Teamspace[];
}

interface Teamspace { id: ID; name: string; icon: string; pageIds: ID[]; }

interface Page {
  id: ID;
  title: string;
  icon?: string;           // emoji or glyph key
  kind: 'doc' | 'database';
  parentId?: ID;
  childIds: ID[];          // empty array on an expandable page renders "No pages inside"
  favorite: boolean;
  updatedAt: string;       // ISO 8601
  location: 'teamspace' | 'shared' | 'private';
}

interface Database extends Page {
  kind: 'database';
  properties: Property[];
  records: DbRecord[];
  views: View[];
}

type Property =
  | { id: ID; name: 'Status';   type: 'select';       options: StatusOption[] }
  | { id: ID; name: 'Flags';    type: 'multi_select'; options: ChipOption[] } // renders above Date
  | { id: ID; name: 'Date';     type: 'date' }
  | { id: ID; name: 'Category'; type: 'multi_select'; options: ChipOption[] } // renders below Date
  | { id: ID; name: 'Client';   type: 'multi_select'; options: ChipOption[] };// renders below Category

interface StatusOption { id: ID; name: string; colorKey: string; order: number; }
interface ChipOption   { id: ID; name: string; colorKey: string; }

// Named DbRecord, not Record — `Record` is a built-in TypeScript utility type.
interface DbRecord {
  id: ID;
  title: string;
  hasPageIcon: boolean;    // renders leading document glyph
  statusId: ID;
  flagIds: ID[];           // chips rendered above the date
  date?: string;           // ISO 8601 date, no time
  categoryIds: ID[];       // chips rendered below the date
  clientIds: ID[];         // chips rendered below Category
  order: number;           // sort position within its status column
}

interface View {
  id: ID;
  name: string;
  type: 'board' | 'table';
  groupByPropertyId?: ID;      // board only
  filters: Filter[];
  sorts: Sort[];
  visibleProperties: ID[];     // which properties render on cards, in render order
}

interface Filter { propertyId: ID; op: 'is' | 'is_not' | 'contains' | 'before' | 'after'; value: string; }
interface Sort   { propertyId: ID; direction: 'asc' | 'desc'; }
```

Notes:

- `colorKey` is a *semantic key* (e.g. `cat-1` … `cat-8`, or the brand guide's own category names), resolved at render time against the brand palette. Never store hex values in the data.
- Statuses and chip values are addressed by ID everywhere; names are display-only and must be editable without breaking references.
- The three multi-selects are distinct properties with distinct option sets, but they draw chip colors from **one shared categorical palette** keyed by option name — so `Volunteer` and `Startup A` never collide even though they live in different properties.
- `order` is a sparse integer or fractional index so a drag only rewrites the moved record, not the whole column.

---

## 10. Seed data

All records below are fictional and exist to exercise every rendering state.

**Flags** (chips above the date): `Priority`, `Personal Projects`
**Category** (chips below the date): `Volunteer`, `Paid Work`, `Equity Stake`, `Social Portfolio`, `Household`, `Networking`
**Client** (chips below Category): `Startup A`, `Hospitality Client`, `Community Assoc.`

Columns below list each record's Flags / Date / Category / Client / leading-icon flag. `—` means the property is empty on that card and its line is omitted entirely.

**Icebox**
| Title | Flags | Date | Category | Client | Icon |
|---|---|---|---|---|---|
| Onboarding Flow Concept | — | Oct 27, 2025 | Volunteer | Startup A | — |
| Re-create the scaffolding experiment | — | — | Social Portfolio | — | — |

**Inbox** *(this column is shown in its hover state in the source design — see §7.2)*
| Title | Flags | Date | Category | Client | Icon |
|---|---|---|---|---|---|
| Draft logo concepts | Personal Projects | — | Social Portfolio | — | — |
| Vector tooling comparison | — | — | Social Portfolio | — | — |
| Side-project prototype | — | — | — | — | ✅ |
| Follow up with contact | — | — | — | — | ✅ |

**To do**
| Title | Flags | Date | Category | Client | Icon |
|---|---|---|---|---|---|
| Reply to new connection re: coffee | — | Mar 16, 2026 | — | — | — |
| Call about scheduling an appointment | — | Mar 18, 2026 | — | — | — |
| Quarterly filing | — | Apr 3, 2026 | Household | Community Assoc. | — |
| Personal filing | — | Apr 10, 2026 | Household | — | — |
| Schedule intro call | — | — | Networking | — | ✅ |

**In progress** — *(empty)*

**Current priority**
| Title | Flags | Date | Category | Client | Icon |
|---|---|---|---|---|---|
| Send prototype walkthrough video | — | Mar 16, 2026 | — | — | — |

**In review** — *(empty)*

**Done** *(long enough to overflow the viewport)*
| Title | Flags | Date | Category | Client | Icon |
|---|---|---|---|---|---|
| Review reference site | — | Oct 29, 2025 | — | — | — |
| Recruiter follow-up | — | Nov 6, 2025 | Paid Work | — | — |
| Skills assessment | Priority | Nov 12, 2025 | Household | — | ✅ |
| Portfolio deck | Priority | Nov 30, 2025 | — | — | ✅ |
| Renew vehicle registration | Priority | Dec 1, 2025 | Household | — | — |
| Update resume on a careers site | Priority | Dec 14, 2025 | Household | — | — |
| Send resume to a connection | — | Mar 16, 2026 | — | — | — |
| Claim asset bundle | Personal Projects | May 27, 2026 | — | — | ✅ |
| Experience audit | — | — | Equity Stake | Hospitality Client | — |
| Schedule call with partner org | — | — | Networking | — | ✅ |
| File tickets for hospitality client | — | — | — | Hospitality Client | — |

Coverage this dataset guarantees, and which the build must visibly satisfy:

- Every chip-property combination: Flags only (`Portfolio deck`), Category only (`Re-create the scaffolding experiment`), Client only (`File tickets for hospitality client`), Category + Client (`Onboarding Flow Concept`, `Experience audit`), Flags + Category (`Skills assessment`), and none at all (`Review reference site`).
- Cards with and without a date; with and without a leading icon; a card with a leading icon and nothing but a title (`Side-project prototype`).
- Titles that wrap to two lines: `Reply to new connection re: coffee`, `Update resume on a careers site`, `Send resume to a connection`.
- Two empty columns, two short columns whose panels visibly hug their content, and one column that overflows the fold.
- Dates on both sides of the app's "today" (treat today as **Mar 16, 2026**), so a build that invents past/future date styling is visibly wrong — every date renders in the same muted role (§7.4).

---

## 11. Visual system (role-based — resolve against the repo brand guide)

| Role | Where used |
|------|------------|
| `surface/app-chrome` | Title bar |
| `surface/sidebar` | Sidebar background — slightly recessed vs. content |
| `surface/content` | Board canvas, active tab |
| `surface/raised` | Cards, popovers, modals |
| `border/hairline` | Card borders, sticky-bar bottom borders, sidebar/content divider |
| `elevation/1`, `elevation/2` | Card resting / card hover+drag, popovers |
| `text/primary` | Page title, card titles, active nav |
| `text/secondary` | Sidebar rows, view tabs (inactive) |
| `text/tertiary` | Section labels, card dates, keyboard hints, "No pages inside" |
| `accent/*` | `New` button, active view-tab indicator, focus rings, selection |
| `palette/categorical-1..n` | Status pill colors and chip colors (all three chip properties share one palette) |
| `tint/status-subtle` | Column panel, tinted by its status; the resting `+ New page` block inside it |
| `surface/overlay` + `scrim` | Record panel, assistant panel, command palette |
| `radius/sm`, `radius/md`, `radius/pill` | Chips/tags; cards and buttons; status pills and the `New chat` button |
| `space/*` | All gutters, paddings — use the scale, no arbitrary values |

**Typography:** four sizes suffice — display (page title), body (card titles, nav rows), small (dates, tab labels), micro (section labels, tag chips, keyboard hints). Map each to the brand guide's nearest step. Card titles and nav rows share the body size; card titles carry slightly more weight.

**Density:** the design is *compact*. Prefer the tighter end of the brand guide's spacing scale for card internals and sidebar rows.

**Dark mode:** if the brand guide defines a dark theme, all roles above must resolve in both themes. Status/tag colors must keep ≥ 4.5:1 contrast for their label text in each theme — use the tinted-background + darker-text pattern in light, and darker-background + lighter-text in dark.

---

## 12. Behavior & interaction requirements

Must-have for the prototype to be considered complete:

1. Board renders from the seed data, grouped and ordered by `status.order` and `record.order`.
2. Drag a card between columns → status updates and persists across reload.
3. Reorder cards within a column via drag.
4. `+ New page` in a column footer creates a card in that column.
5. `New` button (and its caret menu) creates a card and opens the record panel.
6. Card click opens the record panel; edits to title, status, date, Flags, Category, and Client reflect on the board immediately.
7. View tabs switch views; `Priorities` filters, `Household` renders a table.
8. Search-in-view filters cards by title substring, live, and shows a "No results" state per column.
9. View-settings toggles show, hide, and reorder Flags, Date, Category, Client, and the page icon on cards.
10. Sidebar collapse/expand; sidebar rows navigate (prototype: switch the active page, at minimum for the board page; other pages may render a stub doc page).
11. Favorite star toggles and adds/removes the page from the Favorites section.
12. Title edits propagate to tab, breadcrumb, and sidebar.

Persistence: `localStorage`, keyed by workspace ID, hydrated from the seed data on first run. Provide a `?reset` query param or a dev-menu item to reseed.

---

## 13. Accessibility

- The board is a labelled region; each column is a labelled group (`role="group"`, `aria-label="<status>, N cards"`); each card is a focusable element with an accessible name of its title plus status.
- Full keyboard operation: `Tab` through columns, arrow keys within a column, `Enter` opens a card, and the pick-up/move/drop model in §7.6.
- All icon-only buttons carry `aria-label` and a visible tooltip on hover/focus.
- Focus is visible on every interactive element; focus is trapped in modals/popovers and restored on close.
- Color is never the sole carrier of meaning: statuses and chips always show their text label alongside their color, and the status tint on the column panel is decorative only.
- The card's status is exposed in its accessible name, so the panel tint is never the only cue.
- Each chip property is an accessible list labelled by its property name, so a screen reader can tell `Category` from `Client` where sighted users rely on the line break (§7.4).
- Respect `prefers-reduced-motion`: drop card lift/tilt animations and view transitions to instant.
- Live region announces drag results, card creation, and filter result counts.

---

## 14. Responsive behavior

- **Wide (≥ ~1200px):** as specified — sidebar open, all columns visible/scrollable.
- **Medium (~768–1200px):** sidebar auto-collapses to an overlay drawer; board unchanged.
- **Narrow (< ~768px):** sidebar is a drawer; the board becomes one column wide with a horizontal snap-scroll between columns and a status selector at the top; the tab strip collapses to the active tab only; the view toolbar collapses into a single `⋯` overflow menu.

Breakpoint values should come from the repo's brand guide if it defines them.

---

## 15. Suggested implementation

- Any component framework already used in the repo. If none: React + TypeScript + Vite.
- Styling via the repo's existing token system (CSS custom properties, Tailwind theme, or CSS-in-JS) — never raw hex values in components.
- Component tree:
  `AppShell` → `TitleBar` (`WindowControls`, `WorkspaceMenu`, `HistoryNav`, `TabStrip`) · `Sidebar` (`SidebarTopBar` incl. `GlobalSearchButton`, `SidebarSection` → `SidebarRow`, `SidebarFooter`) · `ContentPane` → `PageBar` (`Breadcrumb`, `PageActions`) · `PageHeader` (`TitleBlock`, `ViewTabs`, `ViewToolbar`) · `BoardView` (`BoardColumn` → `ColumnHeader`, `CardList` → `Card` → `Chip`, `NewCardButton`) · `TableView` · `RecordPanel` · `AssistantPanel` · `AssistantFab` · `CommandPalette`.
- State: a single store (context + reducer, or the repo's existing state library) exposing `records`, `statuses`, `chipOptions` (keyed by property), `views`, `activeViewId`, and actions `moveCard`, `createCard`, `updateCard`, `deleteCard`, `setView`, `setFilter`, `setVisibleProperties`.
- Keep board grouping/filtering/sorting in a pure selector so it is unit-testable without the DOM.

---

## 16. Acceptance checklist

- [ ] All seven columns render in order, including the two empty ones.
- [ ] Column panels are status-tinted and hug their content height; cards on top of them are neutral, not tinted.
- [ ] The `Done` column extends past the fold and is reached by scrolling the content pane — columns do not scroll independently and headers do not pin.
- [ ] The board scrolls horizontally without the page scrolling horizontally.
- [ ] Cards render every combination in §10 correctly, with each chip property on its own line: Flags only, Category only, Client only, pairs, and none; ±date; ±leading icon; a two-line wrapping title.
- [ ] Every date renders in the same muted role — no past/future date styling.
- [ ] View switching preserves each view's own filters, sorts, and visible properties, including chip-property order.
- [ ] No real personal data appears anywhere in the build — the seed data in §10 is used verbatim.
- [ ] Drag-and-drop works with both mouse and keyboard, and persists.
- [ ] Every interactive element has a visible focus state and an accessible name.
- [ ] No literal color, font, or spacing values appear outside the token layer.
- [ ] Light and dark themes both pass contrast checks on cards, chips, and status pills.
- [ ] Reload preserves board state; `?reset` restores the seed.
