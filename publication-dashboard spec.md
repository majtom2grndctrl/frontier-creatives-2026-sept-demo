# Technical Specification — Publishing Platform: Publication Home Dashboard

**Status:** Draft for prototype build
**Audience:** AI coding agents building a clickable prototype
**Scope:** One screen — the author-facing "Home" dashboard of a newsletter/publishing web app, inside the full app shell (sidebar + content pane header + scrolling dashboard).

---

## 0. How to read this spec

1. **Brand adaptation is required.** This repository ships a brand guide (design tokens, type scale, color ramps, spacing scale, component primitives). Every visual value below is expressed as a *semantic role*, never a literal hex code, font name, or pixel value. Resolve each role against the repo's brand guide. If the brand guide lacks a role, pick the nearest available token and note the substitution in a code comment.
2. **Layout structure is normative; layout metrics are not.** The arrangement of regions, their nesting, their scroll behavior, and their relative visual weight must match. Exact widths, paddings, and radii should come from the brand guide's spacing/radius scales.
3. **All sample content is fictional.** The publication, author, post titles, metrics, and dates are invented and chosen to exercise every rendering state (empty metric, huge percentage delta, untitled draft, post with no cover image, titles that truncate and titles that don't, current-year and prior-year dates). Do not treat any of it as real data, and do not substitute real personal data for it.
4. **Where this spec is silent, it is silent on purpose.** Anything below the fold of the source is called out and left unspecified — do not invent contents for it.
5. **Observed vs. conventional.** Everything describing the resting, default state was read off the source. Hover, focus, open-menu, loading, and error styling could not be — where this spec describes them it is prescribing a sensible convention, not reporting the source, and you may substitute the repo's own conventions freely. Points that would be easy to mistake for observation are flagged inline as assumptions or inferences.
6. **Non-goals:** authentication, real analytics, email sending, payments, and server persistence. Dashboard data comes from a local fixture (§11).

---

## 1. Product summary

A desktop-first web app where an author runs a subscription newsletter. The screen specified here is the **publication Home dashboard**: a vertical stack of summary sections covering audience growth, the most recent post's performance, work in progress, and a post-by-post table.

Primary user goals on this screen:
- Read the headline audience and revenue numbers, and see the trend behind them.
- Switch which metric the trend chart plots, and over what period.
- Check how the latest post performed, and share it.
- Resume an unfinished draft.
- Scan recent posts with their per-post metrics.

---

## 2. Screen anatomy

```
┌───────────────┬──────────────────────────────────────────────────────────┐
│ [logo] Pub    │  Home                          [☀][search][chat][bell][@]│
│               ├──────────────────────────────────────────────────────────┤
│  Home         │                                                          │
│  Website   ↗  │        ┌────────────────────────────────────┐            │
│               │        │ Overview            [1 year ▾] [⋯] │  ← heading │
│ [  Create ▾ ] │        ├────────────────────────────────────┤    row is  │
│               │        │▀▀▀▀▀▀▀▀│         │         │       │    outside │
│  Publish      │        │ metric │ metric  │ metric  │       │    the box │
│  Audience     │        ├────────────────────────────────────┤            │
│  Analytics    │        │                                    │            │
│  Revenue      │        │           step-area chart          │            │
│               │        └────────────────────────────────────┘            │
│               │        ┌───────────────┐ ┌──────────────────┐            │
│               │        │ Latest post   │ │ Drafts           │            │
│               │        │ (heading is   │ │ (scrolls inside) │            │
│               │        │  inside card) │ │                  │            │
│               │        └───────────────┘ └──────────────────┘            │
│               │        ┌────────────────────────────────────┐            │
│               │        │ Recent posts                       │            │
│               │        └────────────────────────────────────┘            │
│               │        ┌────────────────────────────────────┐            │
│               │        │ (further section, below the fold)  │            │
│  (no footer)  │        └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘            │
└───────────────┴──────────────────────────────────────────────────────────┘
```

| ID | Region | Behavior |
|----|--------|----------|
| A | Sidebar | Fixed left rail, full viewport height, recessed surface. Does not scroll at the reference height; no footer. |
| B | Content pane | Raised surface, inset from the sidebar with a rounded top-left corner and a hairline left border. Fills the rest of the viewport. |
| B1 | Pane header | Page title left, icon cluster right, hairline bottom divider. Spans the **full pane width** — it is not constrained to the content column. |
| B2 | Content column | The scrolling dashboard. Constrained to a **centered max-width column** (roughly half the pane width at the reference size) with wide empty gutters either side. |

---

## 3. Region A — Sidebar

Fixed-width rail (roughly one-seventh of a wide desktop viewport; use the brand guide's nearest layout width token). Its surface is the *recessed* role — the same value as the app background, one step below the content pane. Contents, top → bottom:

1. **Publication identity card** — a bordered, rounded box (not a plain nav row) containing a small square publication avatar and the publication name in a semibold body role, truncating with an ellipsis. Clicking it opens a publication switcher (prototype: stub popover).
2. **Primary nav group** — no section label:
   - `Home` — house icon. Rendered in the **selected** nav style: filled rounded row on the subtle-selected surface role.
   - `Website` — browser-window icon, plus a trailing **external-link arrow** pushed to the row's right edge. It is the only row with that affordance; it opens the public site in a new tab.
3. **`Create` button** — full-width, solid accent fill, inverse-colored semibold label with a trailing caret. This is the only solid-accent control in the sidebar and the visual anchor of the rail. Opens a menu (prototype: `New post`, `New note`, `Import`).
4. **Secondary nav group** — separated from the button by a whitespace gap, no divider rule and no section label: `Publish`, `Audience`, `Analytics`, `Revenue`. Each is an outline icon + body-role label.

**The sidebar has no footer.** Everything below `Revenue` is empty rail. Do not add a settings row, user card, or upgrade prompt.

**States:** hover on a nav row lightens its background; the selected row keeps its filled background. Rows are links, and exactly one is selected at a time (`Home` here).

---

## 4. Region B1 — Pane header

- **Left:** the page title (`Home`) in a heading role, noticeably larger and heavier than nav labels but smaller than a marketing hero.
- **Right:** a cluster of four icon-only buttons followed by the account avatar:
  1. Theme toggle (sun/brightness glyph)
  2. Search (magnifier)
  3. Messages/comments (speech bubble)
  4. Notifications (bell)
  5. **Account avatar** — a circular image with a small caret badge overlapping its bottom-right corner, indicating it opens a menu. Use a generic placeholder avatar; never a photograph of a real person.
- A hairline bottom divider spans the full pane width.
- The four icon buttons are evenly spaced, share one size, and carry `aria-label`s plus hover tooltips.

*Assumption (not determinable from a static source):* the header stays fixed while the content column scrolls beneath it. Build it sticky; the divider is there to carry the seam.

---

## 5. Region B2 — Content column layout

- A single centered column with a **max width**, leaving wide empty gutters on both sides at the reference viewport. The gutters are bare pane surface — do not fill them with a secondary rail.
- Sections stack vertically with a consistent gap from the spacing scale.
- Section order and column spans:

| Order | Section | Span |
|-------|---------|------|
| 1 | Overview | full column |
| 2 | Latest post | half column (left) |
| 3 | Drafts | half column (right) |
| 4 | Recent posts | full column |
| 5 | *(a further section exists below the fold of the source and is out of scope — see §0.4)* | — |

- Sections 2 and 3 form a two-column grid row with a gutter. **They are equal height**, sized by the taller of the two; §8 covers how Drafts fills the surplus.

### 5.1 Two section-heading patterns — do not conflate them

This screen deliberately uses two different heading treatments, and getting them backwards is the most likely way to build a wrong-looking page:

- **Detached heading (Overview only).** The heading and its controls sit **outside and above** the bordered panel, directly on the pane surface. The panel below contains only the data.
- **Attached heading (Latest post, Drafts, Recent posts).** The heading sits **inside** the card, in a header band separated from the body by a hairline divider, with a trailing text link on the right.

---

## 6. Section 1 — Overview

### 6.1 Heading row (detached — see §5.1)

- **Left:** `Overview` in the section-heading role.
- **Right:** two outlined controls of equal height, sitting on the pane surface with no panel behind them:
  1. A **period select** showing the current range (sample: `1 year`) with a trailing caret. Options: `30 days`, `90 days`, `1 year`, `All time`.
  2. A `⋯` icon button (stub menu: `Export CSV`, `Embed`).

### 6.2 Metric segment strip

This strip is **not three independent stat cards.** It is a single bordered container acting as a **segmented tab control that chooses which series the chart below plots.** Build it that way — as a tablist whose selection drives §6.3 (§15 gives the roles) — not as static tiles.

- The container's resting fill is the *recessed* surface role. The **selected** segment is a raised (page-surface) block sitting on that recessed strip, with a **thick accent-colored bar along its top edge**, spanning exactly that segment's width. Where that bar meets the container's outer corner it follows the container's radius rather than running square to the edge — so the indicator belongs to the container's clipping context, not floated above it.
- Because the selected segment is a lighter block on a darker strip, its edges read as dividers. **Do not add explicit vertical rules between segments** — there is no divider between two adjacent unselected segments, which is the tell that the "dividers" are really just the selected block's own edges.
- Three segments, left → right, each laid out identically:

| Segment | Role |
|---------|------|
| Total subscribers | Selected by default; drives the chart |
| Pledged annualized revenue | Exercises the **empty** state |
| 1y views | Exercises a very large percentage delta |

*Inference worth building in:* the third label embeds the selected period (`1y views` while the §6.1 select reads `1 year`). Treat the label as derived from the period rather than a constant string, so changing the period relabels it.

- Segment contents, top → bottom:
  1. **Label row** — the metric name in a small secondary role, with a muted **info icon** (ⓘ) pushed to the segment's right edge. The icon shows a definition tooltip on hover/focus.
  2. **Value row** — the value in the display-numeral role (large, bold), with an optional **delta pill** to its right: a small chip on the positive/success tint, containing a direction arrow and a percentage. Despite the name it is a **rounded rectangle at the small radius, not a capsule** — nothing on this screen is fully rounded except the avatar. A metric with no value renders a short muted dash instead of a numeral **and omits the delta pill entirely** — it does not render a `0%` pill or a zero. The dash occupies the numeral's line box so the three segments' comparison lines stay on one baseline.
  3. **Comparison line** — `From <prior value>` in a tertiary role.

### 6.3 Trend chart

Occupies the lower portion of the same bordered container, below a hairline divider.

- **A step-area chart** (`stepAfter` interpolation): flat runs joined by vertical risers. This is a cumulative count, so **do not use linear or smooth/monotone interpolation** — a straight diagonal between two counts would assert values that never existed.
- An accent-colored stroke at the brand guide's data-line weight, with a low-opacity accent fill beneath it down to the plot floor. The stroke is heavier than the gridlines and lighter than a border — if the brand guide has no chart tokens, the hairline weight is too thin.
- **Y axis:** integer ticks with a domain that starts at the series minimum, **not at zero**. Labels only — no tick marks. Very light horizontal gridlines span the plot width. A faint vertical rule marks the plot's left edge.
- **X axis:** evenly spaced date labels (sample: 7 labels across a one-year range), no tick marks, sitting below a plot-floor rule.
- **No data-point dots and no legend.** The selected segment in §6.2 is the legend.
- **Watermark:** inside the plot area, bottom-right, a small bookmark glyph plus the publication's domain in uppercase letter-spaced micro type, in a muted role. Use a fictional domain (§12).
- **Hover (not visible in a static source, but required):** a crosshair and a tooltip giving the date and value at the hovered step.
- The chart re-plots when the §6.2 selection or the §6.1 period changes.

---

## 7. Section 2 — Latest post

An attached-heading card (§5.1). Body, top → bottom, with hairline dividers between the three blocks:

1. **Header band** — `Latest post` heading; `View stats` text link on the right in a muted role (**not** accent-colored — the text links in these card headers are secondary, not primary actions).
2. **Post summary row** — the shared post row of §10.2, in its compact variant: thumbnail, title (single line, truncates with an ellipsis), meta line, engagement row, and a trailing `⋯` overflow button. No per-post metric columns in this variant.
3. **Metric list** — three label/value rows with generous vertical rhythm and **no dividers between them**: label left in a body role, value right-aligned in a body role. Sample rows: `Total views`, `New subscribers` (rendered with an explicit `+` sign), `Open rate` (a percentage with two decimals).
4. **`Share post` button** — full-width, **tonal accent** variant: low-opacity accent background with an accent-colored semibold label and a leading share/upload icon. This is visibly *not* the same variant as the sidebar's solid `Create` button; the brand guide's secondary/tonal button role should carry it.

---

## 8. Section 3 — Drafts

An attached-heading card (§5.1), equal in height to §7.

1. **Header band** — `Drafts` heading; `View all` muted text link on the right.
2. **Body** — a **vertically scrolling list** that fills the card's remaining height, with a visible scrollbar thumb when it overflows. The card height is set by the Latest post card next to it, so the list clips its last row mid-height; that partial row is the affordance telling the reader there is more. Do not let the card grow to fit the list.
3. **Draft row** — no dividers between rows:
   - **Left, stacked:** the draft title in a body role, single line with ellipsis; beneath it `Edited <date, time>` in a muted role. A draft with no title renders the literal placeholder `Untitled` in the same style as a real title (not italic, not muted).
   - **Right:** a small `Draft` **status chip** — a rounded rectangle (not a full pill) on a neutral tint with primary-role text — followed by a `⋯` overflow button.
4. **Ordering:** render the fixture order as given. The sample order is deliberately **not** strictly reverse-chronological, so a build that adds a sort will visibly diverge; ordering is a data concern and no sort belongs in this component.

---

## 9. Section 4 — Recent posts

A full-column attached-heading card (§5.1).

1. **Header band** — `Recent posts` heading; `View all` muted text link on the right.
2. **Body** — post rows in the shared full variant of §10.2, with **no dividers between rows**; separation comes from vertical spacing alone.

---

## 10. Shared components

### 10.1 Card shell

Raised surface, hairline border, medium radius, no shadow (or the faintest step on the elevation scale). Optional header band with a hairline bottom divider. Used by §7, §8, §9, and by the Overview panel in §6 minus the header band.

### 10.2 Post row

One component with two variants.

**Common left block, left → right:**
- **Thumbnail** — fixed-size landscape rounded rectangle with a hairline border, holding the post's cover image. A post with **no cover** renders a placeholder: a neutral tinted fill with a centered muted "lines of text" glyph. Never stretch or crop-distort; use object-fit cover.
- **Text block** (flexes to fill), stacked:
  1. **Title** — body role, semibold, single line, truncating with an ellipsis.
  2. **Meta line** — `<date> • <author>` in a muted role, with a middot separator.
  3. **Engagement row** — a heart icon + like count, then a comment icon + comment count, both icons and numerals in a muted role. Renders even when both counts are zero.

**Compact variant** (§7): the left block plus a trailing `⋯` button. Nothing else.

**Full variant** (§9): the left block, then, right-aligned in fixed-width columns:
- Three **metric stacks**, each a value in a body role above a label in a muted micro role: `Subs`, `Views`, `Opened`. Values and labels are left-aligned within their own column, so the three columns form clean vertical rules of text.
- An **open-in-place arrow** icon button (↗).
- A `⋯` overflow icon button.

### 10.3 Date formatting

Dates use a **relative-year** format, and this rule must be implemented, not hardcoded per row:
- A date in the current year renders as month + day (`Apr 22`).
- A date in a prior year renders as full month + day + year (`July 18, 2024`).

Use the locale-aware date API. §12 includes one prior-year post specifically to exercise the second branch.

### 10.4 Icon buttons

All `⋯`, ↗, and header-cluster buttons share one size, a transparent resting background, a subtle hover fill, a visible focus ring, an `aria-label`, and a hover/focus tooltip.

---

## 11. Data model

```ts
type ID = string;

interface Publication {
  id: ID;
  name: string;
  domain: string;          // rendered as the chart watermark
  avatarUrl: string;
}

interface Author { id: ID; name: string; avatarUrl: string; }

interface Post {
  id: ID;
  title: string;           // empty string renders as "Untitled"
  status: 'published' | 'draft';
  authorId: ID;
  coverUrl?: string;       // absent → placeholder glyph (§10.2)
  publishedAt?: string;    // ISO 8601; published posts only
  editedAt?: string;       // ISO 8601 with time; drafts only
  likes: number;
  comments: number;
  stats?: PostStats;       // published posts only
}

interface PostStats {
  newSubscribers: number;
  views: number;
  openRate: number;        // 0–1; formatted to a percentage at render time
}

// The three segments of §6.2. `value: null` is the empty state — a dash and
// no delta pill. Do not model it as 0, which would render a "0" and a "0%" pill.
interface Metric {
  id: ID;
  label: string;
  value: number | null;
  format: 'integer' | 'currency' | 'percent';
  priorValue: number;
  deltaPct: number | null; // null whenever value is null
  series: SeriesPoint[];   // plotted when this metric is selected
  infoText: string;        // the ⓘ tooltip
}

interface SeriesPoint { date: string; value: number; }  // ISO date, cumulative

type Period = '30d' | '90d' | '1y' | 'all';

interface DashboardState {
  selectedMetricId: ID;    // drives the chart
  period: Period;
}
```

Notes:
- `deltaPct` is stored, not derived at render time, so the empty state cannot accidentally produce `Infinity` or `NaN` from a zero prior value.
- `series` is **cumulative and monotonic** — that is what makes the step interpolation of §6.3 correct.
- A metric whose `value` is `null` still carries a `series`: a flat run of zeros across the period, so selecting it plots a valid empty-state chart (§14.3) rather than an absent axis or a crash.
- Post ordering comes from the fixture arrays; components never sort (§8.4).

---

## 12. Seed data

All content below is fictional.

**Publication:** `Meridian Notes` · domain `meridiannotes.example.com`
**Author:** `Jordan Avery` (single author across every post)
**Treat "today" as:** `Sep 3, 2026` — so `Apr 22` and `Feb 24` are current-year dates and `July 18, 2024` exercises the prior-year branch of §10.3.

### 12.1 Metrics (§6.2)

| Segment | Value | Delta | From | Notes |
|---|---|---|---|---|
| Total subscribers | `38` | `↑ 15.2%` | `33` | **Selected by default** |
| Pledged annualized revenue | *(empty — dash)* | *(none)* | `0` | Exercises the empty state |
| 1y views | `208` | `↑ 1,633%` | `12` | Exercises a 4-digit percentage |

### 12.2 Subscriber series (§6.3, the default plot)

Cumulative, one year, y-domain `33 → 38`. Shape: a long flat run, then three risers clustered in the last third, with the final riser landing on the plot's right edge.

| Date | Value |
|---|---|
| Sep 4, 2025 | 33 |
| Apr 12, 2026 | 34 |
| May 6, 2026 | 35 |
| Aug 30, 2026 | 38 |

X-axis labels (7, evenly spaced): `Sep 4`, `Oct 27`, `Dec 19`, `Feb 10`, `Apr 4`, `May 27`, `Jul 19`.

### 12.3 Latest post (§7)

- **Title:** `The Quiet Layer: What Fast Prototyping Overlooks` — long enough to truncate in the half-width card and to fit in full in the §9 full-width row, which is exactly the point.
- **Meta:** `Apr 22 • Jordan Avery` · likes `1` · comments `0`
- **Cover:** present (an abstract diagram placeholder)
- **Metric rows:** `Total views` `96` · `New subscribers` `+3` · `Open rate` `18.75%`

These are the **same post** as the first row of §12.5 and must agree with it: `96` views, `3` subs, and an open rate that rounds to the `19%` shown there. A build that lets the two sections disagree has hardcoded them instead of deriving both from one record.

### 12.4 Drafts (§8) — order as listed, deliberately not chronological

| Title | Edited |
|---|---|
| *(empty → renders* `Untitled`*)* | Sep 3, 12:10 PM |
| `What theme parks can teach us about onboarding…` | Jul 29, 11:28 AM |
| `Start the migration in the smallest place that…` | Jul 21, 4:07 PM |
| *(empty → renders* `Untitled`*)* | Jun 1, 2:32 PM |
| `The future of generated interfaces and design roles…` | Jul 3, 11:24 AM |

Five rows is more than the card's height accommodates, so the list must scroll and clip its last row.

### 12.5 Recent posts (§9)

| Title | Date | Cover | Likes | Comments | Subs | Views | Opened |
|---|---|---|---|---|---|---|---|
| The Quiet Layer: What Fast Prototyping Overlooks | Apr 22 | ✅ diagram | 1 | 0 | 3 | 96 | 19% |
| A checklist is not the same thing as a process | Feb 24 | — *(placeholder)* | 0 | 0 | 0 | 4 | 21% |
| Shared vocabulary beats shared components, most of the time | July 18, 2024 | ✅ chart image | 0 | 0 | 0 | 11 | 15% |

Coverage this fixture guarantees, and which the build must visibly satisfy:

- A metric with a value and a delta, a metric with **no** value and **no** delta, and a metric with a four-digit percentage delta — all three in one strip.
- A post with a cover image and a post without one, so the placeholder glyph renders.
- A title long enough to truncate in the half-width card **and** show in full at full width — proving truncation is a layout outcome, not baked into the string.
- A current-year date and a prior-year date, so both branches of §10.3 run.
- Two untitled drafts, so the `Untitled` fallback renders more than once.
- Zero-valued likes, comments, and subscriber counts that still render rather than collapsing.
- A drafts list that overflows its card and scrolls.

---

## 13. Visual system (role-based — resolve against the repo brand guide)

The source uses a strikingly small palette: **two levels of neutral surface, one accent, one positive tint, and text roles.** Resist adding more.

| Role | Where used |
|------|------------|
| `surface/recessed` | App background, sidebar, the metric strip's resting fill, unselected segments |
| `surface/raised` | Content pane, all cards, the **selected** metric segment |
| `border/hairline` | Card borders, pane left edge, header-band dividers, thumbnail borders, plot rules |
| `text/primary` | Page title, section headings, card and post titles, metric values |
| `text/secondary` | Nav labels, metric labels, metric-row labels |
| `text/tertiary` | Meta lines, `Edited …`, `From …`, engagement counts, metric-stack labels, watermark |
| `accent/solid` | `Create` button fill, selected-segment top indicator, chart stroke |
| `accent/tonal` | `Share post` button background, chart area fill (at lower opacity) |
| `accent/on-tonal` | `Share post` label and icon |
| `status/positive-tint` + `status/positive-text` | Delta pills |
| `surface/selected-subtle` | Selected sidebar nav row |
| `neutral/chip` | The `Draft` status chip, the empty-cover placeholder fill |
| `radius/sm`, `radius/md`, `radius/full` | Status chip and delta pills; cards, buttons, thumbnails, panels; the avatar only |
| `space/*` | All gutters and paddings — use the scale, no arbitrary values |

**Typography:** five steps suffice — page title, section heading, display numeral (metric values), body (nav rows, post titles, metric rows), and micro (meta lines, labels, watermark). Metric values are the only place the display step appears.

**Density:** roomy, not compact. This screen breathes — generous padding inside cards and wide vertical rhythm between metric rows. Prefer the looser end of the spacing scale, which is the opposite of a dense board or table UI.

**Dark mode:** if the brand guide defines a dark theme, all roles must resolve in both. The recessed/raised relationship must **invert correctly** — in dark mode the raised surface is lighter than the recessed one, so the selected metric segment stays the brighter block. The delta pill needs a dark-theme tint that keeps ≥ 4.5:1 on its text.

---

## 14. Behavior & interaction requirements

Must-have for the prototype to be considered complete:

1. Dashboard renders from the fixture; no network calls.
2. Clicking a metric segment selects it, moves the accent top indicator, raises its surface, and **re-plots the chart** with that metric's series and y-domain.
3. The empty metric segment is still selectable and plots an empty/zero-state chart rather than crashing or plotting `null`.
4. Changing the period select re-slices the series and re-labels the x-axis.
5. Chart hover shows a crosshair and a date/value tooltip.
6. Info icons show their tooltip on hover **and** on keyboard focus.
7. The Drafts list scrolls independently inside its card; the card does not grow.
8. `Share post` opens a share sheet (prototype: a stub popover with copy-link).
9. `View stats` / `View all` links and every `⋯` menu open something — a stub popover is fine, silent no-ops are not.
10. The `Create` button opens its menu; the caret and the label are one button.
11. Theme toggle switches light/dark and every §13 role resolves in both.
12. Sidebar nav switches the selected row (other destinations may render a stub page).

---

## 15. Accessibility

- The metric strip is a **tablist** (`role="tablist"`, each segment `role="tab"` with `aria-selected`), and the chart is its `tabpanel` with an `aria-label` naming the selected metric. Left/right arrows move between segments. This is the single most important a11y decision on the screen — building it as three buttons or three divs loses the relationship between the selection and the chart.
- The chart carries a text alternative summarizing the series (start value, end value, direction, period), and a visually-hidden data table of §12.2 so the trend is available without vision.
- Delta pills never rely on color alone: the arrow glyph and the sign carry direction, and their accessible name spells out `up`/`down`.
- The empty metric announces something meaningful (`No data`), not a bare dash character.
- Every icon-only button has an `aria-label` and a tooltip reachable by keyboard focus.
- Post rows expose a single accessible name combining title, date, and author; the metric stacks are `<dl>`-style label/value pairs, not bare numbers.
- `Untitled` is real text, not a CSS `::after` — it must reach the accessibility tree.
- Focus is visible on every interactive element and trapped in popovers, restoring on close.
- Respect `prefers-reduced-motion`: chart transitions and segment-indicator movement become instant.

---

## 16. Responsive behavior

- **Wide (≥ ~1200px):** as specified — sidebar open, content column centered with wide gutters.
- **Medium (~768–1200px):** sidebar collapses to an icon rail or drawer; the content column widens toward the pane edges as the gutters give way first; Latest post and Drafts remain side by side until they cannot.
- **Narrow (< ~768px):** sidebar becomes a drawer; every section stacks to one column; the metric strip becomes horizontally scrollable segments or a select; the §10.2 full variant drops its metric stacks below the text block rather than shrinking them.

Breakpoint values should come from the repo's brand guide if it defines them.

---

## 17. Suggested implementation

- Any component framework already used in the repo. If none: React + TypeScript + Vite.
- Charting: whatever the repo already uses. If nothing: a small declarative library, or hand-rolled SVG — the chart is one monotonic series and a step path is a short `d` string. **Whatever the choice, confirm it supports step interpolation before committing** (§6.3).
- Styling via the repo's existing token system — never raw hex values in components.
- Component tree:
  `AppShell` → `Sidebar` (`PublicationCard`, `NavGroup` → `NavRow`, `CreateButton`) · `ContentPane` → `PaneHeader` (`IconButtonCluster`, `AccountMenu`) · `DashboardColumn` → `OverviewSection` (`SectionHeadingRow`, `MetricTabs` → `MetricSegment`, `TrendChart`) · `LatestPostCard` (`PostRow`, `MetricRow`, `ShareButton`) · `DraftsCard` (`DraftRow`) · `RecentPostsCard` (`PostRow`) — with `Card`, `PostRow`, `IconButton`, `Chip`, and `DeltaPill` as shared primitives.
- State: a small store holding `selectedMetricId` and `period`; everything else is fixture data passed down. Keep the series-slicing for a period in a pure function so it is testable without the DOM.

---

## 18. Acceptance checklist

- [ ] The sidebar renders both nav groups, the identity card, and the solid `Create` button — and **nothing** below `Revenue`.
- [ ] The pane header spans the full pane width while the dashboard below is a centered max-width column with visible empty gutters.
- [ ] `Overview`'s heading sits **outside** its panel; the other three sections' headings sit **inside** their cards above a divider.
- [ ] The metric strip is a tablist: selecting a segment moves the accent top bar, raises that segment, and re-plots the chart.
- [ ] No vertical divider is drawn between two unselected segments.
- [ ] The empty metric shows a dash with no delta pill, and is still selectable.
- [ ] The chart is a step-area with a non-zero-based y-domain, no dots, no legend, and a domain watermark.
- [ ] Latest post and Drafts are equal height; the Drafts list scrolls inside its card and clips its last row.
- [ ] `Untitled` renders for both empty-titled drafts.
- [ ] The post with no cover shows the placeholder glyph, not a broken image or a collapsed box.
- [ ] The same long title truncates in the half-width card and renders in full in the full-width row.
- [ ] Current-year and prior-year dates use different formats from one shared formatter.
- [ ] `Create` (solid) and `Share post` (tonal) are visibly different button variants.
- [ ] Every interactive element has a visible focus state and an accessible name; the chart has a text alternative.
- [ ] No real personal data appears anywhere in the build — the fixture in §12 is used verbatim.
- [ ] No literal color, font, or spacing values appear outside the token layer.
- [ ] Light and dark themes both resolve the recessed/raised relationship correctly.
