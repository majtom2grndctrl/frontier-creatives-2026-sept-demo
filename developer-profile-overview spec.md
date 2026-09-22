# Developer Profile — Overview screen

A build spec for the public profile "Overview" page of a code-hosting and collaboration
platform: the screen a visitor lands on when they open a person's account.

---

## 0. How to read this spec

**Who this is for.** An agent implementing this screen in a repo that already has its own
design system. Nothing here is meant to reproduce the source product's brand.

**Brand adaptation is required.** Every visual value is written as a *semantic role*
(`surface/base`, `border/subtle`, `text/muted`, `accent/primary`, …). Resolve each role
against your own tokens. There are no hex codes, font names, or pixel values in this spec,
and you should not add any. Where a role name alone would lose something, the spec states
the *relationship* instead ("recessed relative to the page", "one step deeper than the
chrome band") — preserve the relationship, not any particular value.

**Structure is normative; metrics are not.** Region order, nesting, which element owns a
tint, what scrolls, what stretches, and every negative requirement in §16 are requirements.
Proportions are given as ratios of their container and are approximate — round them to
whatever your grid system prefers.

**Content is fictional.** Every name, handle, repository, URL, and number in this document
is invented. The *shapes* are real: a repository with no description sitting beside one with
a two-line description, a count of zero that suppresses its affordance, a singular
"1 repository". Keep those shapes when you substitute your own content, or the fixture stops
testing what it was built to test.

**Provenance markers.** Claims are marked where it matters:

- **[observed]** — read directly off the source rendering. Default; only stated where it
  disambiguates.
- **[inferred]** — deduced from geometry or from consistency across many repetitions.
- **[prescribed]** — not determinable from a static rendering. All hover, focus, keyboard,
  scroll, empty-state, responsive, and dark-mode behavior falls here, as does anything
  below the captured fold.

**Non-goals.** This spec covers the Overview tab only. The other profile tabs
(Repositories, Projects, Packages, Stars) are navigation targets, not screens to build.
Editing flows behind the pencil, "Edit profile", "Customize your pins", and "Contribution
settings" controls are out of scope — render the affordances, wire them to no-ops.

---

## 1. Product summary

A public profile page for a person on a code-hosting platform. It answers, in one scroll:
*who is this, what do they want you to look at, and how active are they?*

Primary visitor goals, in the order the layout serves them:

1. **Identify the person** — avatar, name, handle, pronouns, one-line role, location, contact links.
2. **Read their pitch** — a self-authored README rendered at the top of the main column.
3. **See their best work** — up to six hand-picked "pinned" repositories.
4. **Judge activity at a glance** — a year-long contribution heatmap, a breakdown of what
   kind of work they do, and a reverse-chronological activity timeline.
5. **Jump elsewhere** — into a repository, into another year of history, into the other tabs.

The owner viewing their own profile sees the same screen with edit affordances present
(pencil on the README card, "Edit profile", "Customize your pins", drag handles on pinned
cards). **This spec describes the owner-viewing-own-profile state**, because that is what
the source rendering showed. For a visitor, those four affordances are absent and nothing
else changes. [inferred]

---

## 2. Screen anatomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  CHROME BAND  (surface/raised-chrome, full-bleed, sticky? [prescribed: no])       │
│  ┌ row 1 ─────────────────────────────────────────────────────────────────────┐  │
│  │ [≡] (mark) handle                     [search] [ai▾] │ [+▾] [○][⑂][▤][✉] (av)│ │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│  ┌ row 2 ─────────────────────────────────────────────────────────────────────┐  │
│  │ Overview  Repositories (26)  Projects  Packages  Stars (78)                 │  │
│  │ ▔▔▔▔▔▔▔▔                                                                    │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
├══════════════════════════════════════════════════════════════════════════════════┤  ← border/default
│                                                                                   │
│   ┌── SIDEBAR ─────┐  ┌── MAIN ───────────────────────────────────────────────┐   │
│   │ ╭────────────╮ │  │ ┌ README card ──────────────────────────────────────┐ │   │
│   │ │            │ │  │ │ handle / README.md                            [✎] │ │   │
│   │ │   avatar   │ │  │ │ ── rendered markdown ───────────────────────────  │ │   │
│   │ │         ⓔ  │ │  │ └───────────────────────────────────────────────────┘ │   │
│   │ ╰────────────╯ │  │                                                       │   │
│   │ Display Name   │  │ Pinned                             Customize your pins│   │
│   │ handle · they  │  │ ┌───────────────────┐ ┌───────────────────┐           │   │
│   │ bio line 1     │  │ │ repo A       ⠿    │ │ repo B       ⠿    │  equal    │   │
│   │ bio line 2     │  │ │ ● lang   ☆ 4      │ │ ● lang            │  height   │   │
│   │ ┌────────────┐ │  │ └───────────────────┘ └───────────────────┘  per row  │   │
│   │ │Edit profile│ │  │ ┌───────────────────┐ ┌───────────────────┐           │   │
│   │ └────────────┘ │  │ │ repo C       ⠿    │ │ repo D       ⠿    │           │   │
│   │ ⚇ 31 · 47      │  │ │                   │ │ description over  │           │   │
│   │ ⌖ Location     │  │ │                   │ │ two lines         │           │   │
│   │ ⏱ 16:51 (UTC)  │  │ │ ● lang            │ │ ● lang            │  ← footers│   │
│   │ ⛓ website      │  │ └───────────────────┘ └───────────────────┘    aligned│   │
│   │ ▪ social       │  │ ┌───────────────────┐                                 │   │
│   │ ───────────────│  │ │ repo E       ⠿    │   (no card — 5 pins, 2 cols)    │   │
│   │ Achievements   │  │ │ one-line desc     │                                 │   │
│   │ ◍ ◍ ◍ ◍        │  │ │ ● lang            │                                 │   │
│   │ ───────────────│  │ └───────────────────┘                                 │   │
│   │ Organizations  │  │                                                       │   │
│   │ ▫ ▫ ▫          │  │ 3,847 contributions…      Contribution settings ▾     │   │
│   └────────────────┘  │ ┌── contributions card ──────────────┐  ┌──────────┐  │   │
│    ▲                  │ │  heatmap  (7 rows × ~53 weeks)     │  │ ▐ 2026 ▌ │  │   │
│    └ hugs content;    │ │  learn-link          Less ▢▢▢▢▢ More│  │   2025   │  │   │
│      bare background  │ ├────────────────────────────────────┤  │   2024   │  │   │
│      below it         │ │ Activity overview  │   radar chart │  │   ⋮      │  │   │
│                       │ └────────────────────┴───────────────┘  │   2012   │  │   │
│                       │                                         └──────────┘  │   │
│                       │ Contribution activity                    ▲ year rail  │   │
│                       │   September 2026 ───────────────────     │            │   │
│                       │   │ ▣ Created 194 commits in 1 repo   ⇕  │            │   │
│                       │   │   repo · 194 commits      ▬▬▬▬▬▬▬    │            │   │
│                       │   │ ▣ Opened 37 pull requests in 1 rep⇕  │            │   │
│                       │   │   repo              (37) merged  ⇕   │            │   │
│                       │ ┌───────────────────────────────────┐    │            │   │
│                       │ │        Show more activity         │    │            │   │
│                       │ └───────────────────────────────────┘    │            │   │
│                       │ Seeing something unexpected? …            │            │  │
│                       └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Region table

| # | Region | Container | Approx. width | Notes |
|---|---|---|---|---|
| A | Chrome band | full-bleed | 100% viewport | Two rows on one continuous recessed surface; **no divider between the rows**. One `border/default` hairline closes the band at the bottom. |
| B | Content column | centered | ~82% of viewport | Everything below the chrome band. |
| C | Sidebar | col 1 of B | ~24% of B | **Content-height.** Ends after Organizations; bare page background continues below it. |
| D | Gutter | — | ~2% of B | |
| E | Main column | col 2 of B | ~74% of B | |
| F | README card | full width of E | 100% of E | |
| G | Pinned | full width of E | 100% of E | 2 equal columns, gap ≈ 2% of E; **row gap equals column gap**. |
| H | Contributions band | 2-col sub-grid of E | — | Left sub-column ~83% of E, gutter ~4%, year rail ~13%. |
| H1 | Contributions + activity | col 1 of H | ~83% of E | One card. The same sub-column also owns §8 and the "Show more activity" button below it. |
| H2 | Year rail | col 2 of H | ~13% of E | Right edge flush with E's right edge. Extends *past* the contributions card, alongside the activity timeline. |
| I | Footer note | E | — | Single line, left-aligned with H1. |

**Composition facts that are easy to get wrong — all [observed]:**

- **The card fill and the page background are the same surface.** Cards are defined by their
  hairline border alone, not by any tonal difference. Do not tint card interiors.
- **The tint lives on the chrome band, not on the page.** The header + tab band is the
  recessed surface; the page below is the base surface. This is the inverse of the common
  "tinted page, plain cards" pattern — do not invert it.
- **The sidebar hugs its content.** It is dramatically shorter than the main column and the
  page background shows beneath it. Do not stretch it, do not give it a background, do not
  give it a footer.
- **Pinned cards stretch to the height of the tallest card in their row**, and their meta
  footer is pinned to the card's bottom edge. A description-less card beside a two-line-
  description card is the same height, with its language row bottom-aligned to its
  neighbour's. A row containing only one card is sized by that card alone.
- **The whole document scrolls as one.** No scrollbars appear on any pane, card, or list —
  not the year rail, not the heatmap, not the timeline. [observed; the capture is a
  full-document rendering, so this is the absence of any scroll affordance rather than
  proof of overflow behavior]

---

## 3. Region A — Chrome band

One block, recessed surface, full viewport width, two stacked rows with **no rule between
them**. A single `border/default` hairline closes the bottom of the block.

### Row 1 — global header

Left cluster, in order: a bordered icon button (menu glyph); the platform mark (circular,
not a button); the profile handle in **bold, `text/default`, not link-colored**.

Right cluster, in order:

1. **Search field** — bordered, filled with `surface/raised-chrome` (so it reads as an
   inset of the same tone the band already uses; the border is what makes it legible),
   leading magnifier glyph, muted placeholder containing an inline **key-cap chip** for the
   shortcut character. The chip is a small bordered rounded rect around a single character.
2. **Split button** — a single bordered container holding an icon segment and a caret
   segment, divided by an internal vertical hairline.
3. A bare vertical separator rule (not a button).
4. A second **split button** — plus glyph + caret.
5. Four standalone bordered icon buttons.
6. The viewer's avatar — circular, no border, no button chrome.

All icon buttons share one style: `border/default` outline, transparent fill, `text/muted`
glyph, square footprint, `radius/control`.

### Row 2 — profile tab bar

Horizontal tabs, left-aligned to the *viewport* inset, **not** to the content column of
region B. In order: **Overview** (active), Repositories, Projects, Packages, Stars.

- Each tab: leading outline glyph + label.
- **Only Repositories and Stars carry a count badge.** Projects and Packages have none.
- The count badge is a pill filled with `surface/recessed` — *one step deeper than the chrome
  band it sits on* — with `text/default` numerals.
- Active tab: label at a heavier weight, plus a **short indicator bar** underneath spanning
  only that tab's width — from just before its glyph to just past its label. The indicator
  occupies exactly the same line as the band's bottom border and replaces it there; it uses
  `accent/attention`, **a different hue from the `accent/primary`** used for links.
- Inactive tabs are `text/default` at regular weight — not muted.

---

## 4. Region C — Sidebar

A single column, no card, no background, no border around it. Its blocks are separated by
full-column `border/subtle` hairlines. Vertical order:

### 4.1 Avatar

Circular, **spanning the full width of the sidebar column**. A small circular **status
button** overlaps its lower-right circumference — `surface/base` fill, `border/default`
outline, a muted glyph inside, raised above the photo. Roughly one-eighth of the avatar's
diameter, straddling the lower-right edge so it sits about half on the photo and half off it
— not tucked inside. [observed]

### 4.2 Identity

- **Display name** — `type/title`, bold.
- **Handle · pronouns** — `type/subtitle`, regular weight, `text/muted`, joined by a middle
  dot. Both halves are the same muted tone; the pronouns are not further de-emphasized.
- **Bio** — `type/body`, `text/default`, free text that may contain hard line breaks. The
  fixture's bio is two lines; the second is a short line, so the block must not justify or
  stretch.

### 4.3 Primary action

A **full-column-width** button labelled "Edit profile": `surface/raised-chrome` fill,
`border/default` outline, `text/default` centered label at medium weight. This is a *tonal*
button, not a solid accent one — it must read quieter than the selected-year chip in §7.3.

### 4.4 Icon list

One list, one icon column, all glyphs at the same left edge and the same size, all
`text/muted`. Rows:

| Row | Glyph | Content |
|---|---|---|
| 1 | people | `**31** followers · **47** following` — counts bold `text/default`, words `text/muted`, middle-dot separator |
| 2 | pin | Location — `text/default` |
| 3 | clock | Local time `text/default` + a trailing muted parenthetical UTC offset |
| 4 | link | Website URL — **`text/default`, not accent-colored**, despite being a link |
| 5 | brand mark | Social handle — **`text/default`**. This row's glyph is a *filled* brand mark, not an outline system icon |

Row 1 sits slightly further from row 2 than rows 2–5 sit from each other — a small extra
gap, not a divider. [observed]

### 4.5 Achievements

`border/subtle` divider above. Heading "Achievements" at `type/body`, **bold** — note this
differs from the main column's section headings, which are regular weight (§6, §9.2).

Below it, a single row of four decorative badge images. Roughly one-fifth of the sidebar
width each, evenly spaced, no wrap, no "see all" link, no labels. Badge artwork is arbitrary
— circles, shields, whatever the image supplies; do not clip them to a common shape.

A badge may carry a **count pill** overlapping its lower-right, extending outside the badge's
silhouette. The pill's fill is **supplied per achievement alongside the artwork** — it is
data, not a design token; two badges in the fixture carry visibly different pill fills. Pill
text is `text/default`, bold, fully rounded pill shape. A badge with no count renders no pill.

### 4.6 Organizations

`border/subtle` divider above. Heading "Organizations", same style as §4.5.

A row of **rounded-square** avatars, each roughly three-fifths the diameter of an achievement badge,
with a `border/default` hairline. No names, no counts, no wrap in the fixture.

**The sidebar ends here.** No divider below Organizations, no footer, no trailing element.

---

## 5. Region F — README card

A bordered card, `surface/base` fill, `radius/card`.

**Header row** — a monospace file path and a trailing ghost icon button:

- Path: `handle` `/` `README` `.md`. Segment names are `text/default`; **the separator and
  the file extension are `text/muted`**. The whole path is monospace at `type/small`.
- Right end: a pencil glyph, `text/muted`, no border, no fill.
- No divider between this row and the body.

**Body** — rendered markdown, author-controlled. In the fixture:

1. An H1 at `type/display`, bold, followed by a full-width `border/subtle` horizontal rule.
   The rule is part of markdown H1 rendering, not a card divider — it is the *subtle* rule,
   one step lighter than the card's own border.
2. A bold lead paragraph at `type/body`.
3. A body paragraph at `type/body` that wraps to two lines.

Render the markdown with your system's prose styles. The card must not impose a max line
length narrower than the card itself: the fixture's paragraph is written to wrap at exactly
two lines at the specified column width.

---

## 6. Region G — Pinned

**Section header row** — not a card, no border:

- Left: "Pinned" at `type/body`, **regular weight**, `text/default`.
- Right: "Customize your pins" at `type/small`, `accent/primary`, no underline at rest, no
  button chrome.
- Baselines aligned. No rule beneath.

**Grid** — two equal columns. Column gap and row gap are equal. Five cards in the fixture,
so the last row holds one card in the left column and **nothing** in the right — no empty
placeholder, no "add a pin" tile, no ghost card.

Rows are independently sized; cards **stretch to their row's height**. See §9.1 for the
card component.

---

## 7. Region H — Contributions band

Two columns: the contributions content (left, ~83% of the main column) and the year rail
(right, ~13%), separated by a gutter of ~4%.

The band's left column contains, in order: the header row (§7.1), the contributions card
(§7.2), then — *continuing in the same left column* — the contribution activity section (§8)
and the "Show more activity" button. The year rail (§7.3) runs alongside all of it.

### 7.1 Header row (outside the card)

- Left: "**N** contributions in the last year" at `type/body`, regular weight,
  `text/default`. The count is thousands-separated.
- Right: "Contribution settings" + caret — `text/muted`, no border, no fill. A menu trigger.
- This row sits *above* the card's top border, not inside it.

### 7.2 Contributions card

**One card** containing two stacked regions separated by a **full-bleed `border/default`
horizontal rule** that touches both card edges.

#### 7.2a Heatmap region

A calendar grid, weeks as columns and days as rows.

- **Month labels** across the top, aligned to the week-column in which each month begins.
  Twelve labels in the fixture; **the final, partial month gets no label** because its
  column run is too short. `type/small`, `text/muted`.
- **Day labels** in a left column, **right-aligned toward the grid**: only Monday,
  Wednesday, and Friday are labelled. The other four rows are unlabelled. Seven rows are
  always rendered. `type/small`, `text/muted`.
- **Cells**: small squares with `radius/cell` (softly rounded, clearly not circles), separated
  by a gap roughly one-quarter of the cell's edge. Five intensity levels — see `data/contribution-N` in §12.1.
- **The trailing week is truncated**: the newest column renders only the days that have
  already occurred and leaves the remaining rows *empty* — no placeholder cells. The leading
  week renders in full. [observed]
- **Footer row** inside the card, below the grid:
  - Left: "Learn how we count contributions" — a link rendered in **`text/muted`, not
    `accent/primary`**. It is styled as quiet text.
  - Right: `Less` + the five level swatches in ascending order + `More`, all at `type/small`,
    `text/muted`. Swatches are the same size and radius as grid cells.

#### 7.2b Activity overview region

Split into two panes by a **vertical `border/default` rule** that is **inset from the
horizontal rule above and from the card's bottom edge by the card's internal padding** — it
does not run corner to corner. The panes are approximately equal in width.

**Left pane:**

- "Activity overview" heading, `type/body`, regular weight, `text/default`.
- One entry: a leading repository glyph and a **flowing sentence**, not a list:
  `Contributed to ` + up to three repository links + ` and N other repositories`.
  - Links are `accent/primary`, **bold**, comma-separated. No comma before "and". No
    trailing comma on the last link.
  - The sentence wraps naturally; wrapped lines indent to align with the first line's text,
    clearing the glyph (hanging indent). A link may not be broken across lines. [observed —
    the fixture's second and third links each start a new line]

**Right pane — activity breakdown chart:**

A four-axis radar/kite plot. This is not a set of stat tiles; it is one chart.

- Four axes drawn as solid lines radiating from a common center, at 12/3/6/9 o'clock. Axis
  arms are **equal length and always drawn at full length**, independent of the data — they
  are the frame, not the series.
- Axis order, clockwise from the top: Code review, Issues, Pull requests, Commits.
- Axis stroke uses the **dark end of the contribution ramp** (the same family as the heatmap's
  highest level), not a neutral.
- **Labels** sit just beyond each arm's end, `type/small`, `text/muted`, aligned *away* from
  the center (the left label is right-aligned toward its arm, the right label left-aligned).
  A category with a non-zero value stacks its **percentage above the category name**, both
  centered on the arm's axis.
  A category at zero shows **only the name — no "0%"**.
- **Data polygon**: a translucent fill drawn from the same ramp, with a small circular
  **marker** (`surface/base` fill, stroked in the ramp's darkest step) at each **non-zero** vertex. Zero
  vertices sit at the origin and get **no marker**.
- **The radial domain is `0 … max(series)`, not `0 … 100`.** The largest category's marker
  lands exactly at its arm's end; the others are plotted as a fraction of that maximum. With
  85% and 15%, the 15% marker sits at about one-sixth of an arm from center — visibly close
  to the origin. Do not scale to 100 or the chart collapses into an invisible sliver.
- No rings, no gridlines, no ticks, no legend, no axis numbers.

### 7.3 Year rail

A vertical list of years, newest first, in the right column of the band. Even vertical pitch.

- **Selected year**: a **solid `accent/primary` block** with `text/on-accent` label,
  `radius/chip` (noticeably rounder than a card). The chip **spans the rail column's full
  width**, so its right edge is flush with the main column's right edge and it extends well
  past its own label — it does not hug the label. The label is **left-aligned** inside the
  chip, not centered.
- **Unselected years**: `text/muted`, no fill, no border, indented so their text left edge
  lines up **exactly** with the selected chip's label. [observed]
- No headers, no "show all", no scroll container, no divider lines.
- The rail is a sibling of the entire left column, so its lower entries sit alongside the
  contribution-activity timeline, not alongside the contributions card. Both columns are
  top-aligned at the §7.1 header row.

---

## 8. Region — Contribution activity

Lives in the same left sub-column as §7.2, so it is **narrower than the README and Pinned
sections above it**. This is deliberate — do not widen it to the main column.

- **Section heading** "Contribution activity" — `type/body`, regular weight, `text/default`,
  aligned to the sub-column's left edge.
- **Month header** — slightly inset from the section heading. `**September**` bold
  `text/default` + ` 2026` at regular weight in `text/muted`, followed by a
  `border/default` rule filling the remaining width, vertically centered on the label.
- **Timeline rail** — a thin vertical line in `border/subtle` (lighter than the month rule),
  running down the left of the item stack. It **starts below the month header and stops just
  past the last item** — it does not reach the "Show more activity" button, and it does not
  touch the month rule. [observed]
- **Items** stack beneath, with no dividers between them. See §9.3.

Below the last item: a **full-sub-column-width "Show more activity" button** — bordered,
`surface/base` fill, `accent/primary` **bold centered label**. It is an outline button, not
a solid accent one.

Below that: the footer note — `text/default` sentence at `type/small` containing an inline
`accent/primary` **underlined** link, with terminal punctuation outside the link. Left-aligned
with the sub-column.

**The captured rendering ends here.** Whatever site-wide footer follows is out of frame; do
not invent one, and do not treat this note as the footer.

---

## 9. Shared components

### 9.1 `PinnedRepoCard`

```
┌───────────────────────────────────────────┐
│ [glyph] repo-name  (Public)            ⠿  │   header row
│                                           │
│ Optional description, up to two lines.    │   body (may be absent)
│                                           │   ← flexible space
│ ● Language        ☆ 4                     │   footer, bottom-anchored
└───────────────────────────────────────────┘
```

- Card: `border/default`, `surface/base`, `radius/card`.
- **Header row**: repository glyph (`text/muted`) · repository name (`accent/primary`,
  **bold**, `type/body`) · **visibility pill** · flexible space · **drag handle**.
- **Visibility pill**: fully rounded, **transparent fill**, `border/default` outline,
  `text/muted` label at `type/small`. It is an outline chip, never a filled badge.
- **Drag handle**: a six-dot grid glyph, `text/muted`, at the header row's right end.
  **Present on every card in the resting state** — it is not a hover affordance. (Owner view
  only; omit for visitors. [inferred])
- **Description**: `type/small`, `text/muted`, clamped to two lines. Omitted entirely when
  absent — no empty reserved space, but see the stretch rule below.
- **Footer**: language dot (a filled circle whose color comes from the **language data, not
  the design system**) + language name (`type/small`, `text/muted`). Then, only when the
  star count is greater than zero, a star glyph + count at `type/small`, `text/muted`.
  **A zero count renders nothing at all** — no glyph, no "0".
- **Stretch rule**: the card fills its grid row's height and the footer is pinned to the
  bottom. In a row where a sibling has a description and this card does not, the free space
  appears *between the header and the footer*, and the footers of the two cards align.

Variants exercised by the fixture: `no description + stars`, `no description + no stars`,
`no description in a stretched row`, `two-line description`, `one-line description in an
unstretched row`, `non-default language color`.

### 9.2 `SectionHeader`

Left label at `type/body` regular weight in `text/default`; optional right-aligned action at
`type/small` in `accent/primary` with no button chrome. Used by Pinned and (without the
action) by Contribution activity. **Not** the same as the sidebar's bold headings.

### 9.3 `TimelineItem`

```
 │
 ▣  Created 194 commits in 1 repository                              ⇕
 │    repo-path  ·  194 commits                              ▬▬▬▬▬▬▬▬▬▬
 │
```

- **Icon badge** — a rounded square, `surface/base` fill, `border/default` outline, muted
  glyph inside, **horizontally centered on the timeline rail** so it masks the rail behind it.
  The glyph varies by item kind (commit, pull request, …).
- **Title row** — `type/body`, `text/default`, **plain text with no links**. The count and
  the repository count are baked into the sentence and must pluralize correctly
  ("1 repository" / "2 repositories").
- **Right end of the title row** — a **collapse control**: a glyph of two arrows converging
  on a dotted line, `text/muted`, no border. Present at rest on every item.
- **Detail rows** — one per repository, indented to the title's left edge:
  - **Repository path** — at rest: `text/muted`, **no underline, not accent-colored**.
  - Optional **count link** ("194 commits") — `text/muted`.
  - Right-aligned trailing element, one of:
    - **Volume bar** — a fully rounded bar in the dark end of the contribution ramp, drawn
      in a fixed-width track whose right edge is flush with the sub-column's right edge. Its
      length is proportional **within the item** (the item's largest repository fills the
      track).
    - **Status group** — a solid `status/merged` pill with a bold `text/on-accent` count,
      followed by a `text/muted` status word, followed by the same collapse control. Note
      this row carries a collapse control of its own, *in addition to* the one on the title
      row.
- No divider between items. No timestamps. No avatars.

> **Captured hover state.** In the source rendering, the first item's detail row was caught
> mid-hover: its repository path showed as `accent/primary` **and underlined**, and its count
> link showed as `text/muted` **and underlined**. The second item, at rest, showed a plain
> muted path with no underline. **Spec the resting state as muted-and-unstyled**; underline
> both links and recolor the repository path to `accent/primary` on hover of the detail row.
> [hover: inferred from the two items' differing capture states]

### 9.4 `IconButton`

Square, `border/default` outline, transparent fill, `text/muted` glyph, `radius/control`.
Used throughout the chrome band. A **split** variant places two segments in one bordered
container divided by an internal vertical hairline.

### 9.5 `CountBadge`

Fully rounded pill, `surface/recessed` fill, `text/default` numerals at `type/small`. Used
by the tab bar only.

---

## 10. Data model

```ts
type Visibility = 'public' | 'private';

interface Profile {
  identity: Identity;
  counts: { followers: number; following: number };
  metaRows: MetaRow[];
  achievements: Achievement[];
  organizations: Organization[];
  readme: { path: string; markdown: string } | null;
  pinned: PinnedRepo[];               // 0–6; laid out 2-up
  contributions: ContributionYear;
  availableYears: number[];           // descending; [0] is the newest
  selectedYear: number;
  activityOverview: ActivityOverview;
  timeline: TimelineMonth[];
  hasMoreActivity: boolean;
  isOwner: boolean;                   // gates the four edit affordances
}

interface Identity {
  displayName: string;
  handle: string;
  pronouns?: string;
  bio?: string;                       // may contain hard line breaks
  avatarUrl: string;                  // required; a generic placeholder is fine
  statusEmoji?: string;               // renders the overlapping status button
}

interface MetaRow {
  kind: 'location' | 'localTime' | 'website' | 'social';
  primary: string;
  secondary?: string;                 // muted trailing text, e.g. a UTC offset
  href?: string;
  brand?: string;                     // 'social' only: selects the filled brand mark
}

interface PinnedRepo {
  name: string;
  visibility: Visibility;
  description?: string;               // absent, not empty-string, when there is none
  language?: { name: string; color: string };   // color is DATA, not a token
  stars: number;                      // 0 suppresses the star affordance entirely
}

interface Achievement {
  id: string;
  name: string;                       // used as alt text; never rendered as a label
  imageUrl: string;
  count?: number;                     // absent => no pill
  pillColor?: string;                 // supplied with the artwork; DATA, not a token
}

interface Organization { id: string; name: string; avatarUrl: string }

interface ContributionDay { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

interface ContributionYear {
  total: number;                      // rendered thousands-separated
  rangeStart: string;                 // ISO date of the first cell
  rangeEnd: string;                   // ISO date of the last cell; the trailing week
                                      // is truncated here, with no placeholder cells
  days: ContributionDay[];
}

interface ActivityOverview {
  contributedTo: { named: string[]; otherCount: number };
  /** Percentages of total activity. Sum to 100. Zero-valued keys render
   *  their axis label with no percentage and no marker. */
  breakdown: { commits: number; codeReview: number; pullRequests: number; issues: number };
}

type TimelineKind = 'commits' | 'pullRequests' | 'issues' | 'reviews' | 'createdRepository';

interface TimelineDetail {
  repo: string;
  href: string;
  countLabel?: string;                // e.g. "194 commits"; its own link
  bar?: number;                       // raw value; normalized against the item's max
  statusPill?: { count: number; label: string; tone: 'merged' | 'open' | 'closed' };
  collapsible?: boolean;              // renders a second collapse control on this row
}

interface TimelineItem {
  kind: TimelineKind;
  count: number;                      // 194
  repositoryCount: number;            // 1 -> "1 repository"; 2 -> "2 repositories"
  details: TimelineDetail[];
}

interface TimelineMonth { month: string; year: number; items: TimelineItem[] }
```

**Derived, not stored:** the timeline item title. Compose it from `kind`, `count`, and
`repositoryCount` — `"Created {count} commits in {repositoryCount} repositor{y|ies}"`,
`"Opened {count} pull requests in …"`. Storing the sentence invites the two halves to drift.

**Derived, not stored:** each detail row's bar length, as `bar / max(item.details.bar)`.

---

## 11. Seed data

All content below is fictional.

### Identity

| Field | Value |
|---|---|
| displayName | Rowan Alvarez |
| handle | quietstack-nine |
| pronouns | they/them |
| bio | `Design Engineer \| Platform Engineer`<br>`Portland, OR` |
| avatar | generic placeholder avatar (required — no real photograph) |
| statusEmoji | a neutral face emoji |
| followers / following | 31 / 47 |

### Meta rows

| kind | primary | secondary |
|---|---|---|
| location | Portland | — |
| localTime | 16:51 | (UTC −07:00) |
| website | https://rowan.example.com | — |
| social | in/rowanalvarez | — |

### Tab counts

Repositories **26**, Stars **78**. Projects and Packages: no count.

### README

Path `quietstack-nine / README.md`.

```markdown
# Rowan Alvarez

**I prototype in code at the intersection of design, engineering, and AI.**

I build testable product hypotheses — from customer problem to working interface. I think in
systems, ship in React with live AI-powered backends, and design the agent workflows that
make modern teams move faster.
```

### Pinned repositories

| # | Name | Visibility | Description | Language | Stars |
|---|---|---|---|---|---|
| 1 | `cadence-deck` | Public | *(none)* | TypeScript | 4 |
| 2 | `interest-mapping-workshop` | Public | *(none)* | TypeScript | 0 |
| 3 | `inventory-forecast-prototype` | Public | *(none)* | TypeScript | 0 |
| 4 | `nested-details` | Public | An HTML custom element for progressive disclosure, designed for long-form text content such as case-study write-ups. | TypeScript | 0 |
| 5 | `focus-timer` | Public | A lightweight desktop timer that manufactures deadline pressure. | Rust | 0 |

### Contributions

Total **3,847** in the last year. Selected year **2026**; rail runs 2026 → 2012 descending.
Generate 53 weeks of `ContributionDay` with a visible density gradient — sparse and mostly
level 0 for the first ~14 weeks, dense and mostly levels 2–4 for the last ~20 — and truncate
the final week after its second day.

### Activity overview

Contributed to `quietstack-nine/retro-board`, `quietstack-nine/skiffa`,
`quietstack-nine/market-scout` **and 13 other repositories**.

Breakdown: Commits **85%**, Pull requests **15%**, Code review **0%**, Issues **0%**.

### Timeline — September 2026

| # | kind | count | repos | Detail rows |
|---|---|---|---|---|
| 1 | commits | 194 | 1 | `quietstack-nine/retro-board` · "194 commits" · bar 194 |
| 2 | pullRequests | 37 | 1 | `quietstack-nine/retro-board` · pill `37 merged` · collapsible |
| 3 **[prescribed]** | commits | 31 | 2 | `quietstack-nine/skiffa` · "22 commits" · bar 22 — and — `quietstack-nine/market-scout` · "9 commits" · bar 9 |

`hasMoreActivity: true`.

> Item 3 is **not** in the source rendering. It is added deliberately so the fixture proves
> the volume bar is proportional *within* an item and that an item can carry more than one
> detail row. Drop it if you want a strictly faithful fixture; keep it if you want the bar
> logic covered.

### Achievements

Four badges with generic decorative artwork. Badge 1 has `count: 2` with one pill fill;
badge 4 has `count: 3` with a **visibly different** pill fill; badges 2 and 3 have no count. The two
different pill fills are the point — they demonstrate that the fill travels with the badge
data rather than coming from a token.

### Organizations

Three fictional organizations with placeholder square avatars.

### Footer note

`Seeing something unexpected? Take a look at the [profile guide].`

---

### States this fixture guarantees

| State | Where |
|---|---|
| Card with no description **stretched** beside one with a two-line description | Pinned #3 beside #4 |
| Card with no description in an **unstretched** row | Pinned #1 and #2 (neither has one) |
| Card with a **one-line** description, alone in its row, content-height | Pinned #5 |
| **Zero** star count suppressing the affordance entirely | Pinned #2–#5 |
| Non-zero star count | Pinned #1 |
| A **very long** repository name beside a short one, neither truncating | Pinned #3 (28 chars) beside #4 (14) |
| A **non-default** language color | Pinned #5 (Rust) vs. #1–#4 (TypeScript) |
| A row with an **empty second column** | Pinned row 3 |
| Multi-line bio with a **short** trailing line | Identity |
| Thousands-separated four-digit total | 3,847 contributions |
| A **truncated trailing week** in the heatmap | last column, 2 of 7 days |
| A **month with no label** because its column run is too short | trailing partial month |
| Sequential ramp exercising **all five** levels including level 0 | heatmap |
| A radar category at **exactly zero** — label only, no percentage, no marker | Code review, Issues |
| A radar domain where max ≠ 100, so the small value is **not** invisible | 85 / 15 |
| Text wrap **inside a link list** — links 2 and 3 start new lines | Activity overview sentence |
| Singular **"1 repository"** | Timeline items 1 and 2 |
| Plural **"2 repositories"** | Timeline item 3 |
| Detail row with a **volume bar** | Timeline items 1, 3 |
| Detail row with a **status pill** instead of a bar | Timeline item 2 |
| An item with **two** detail rows and proportional bars | Timeline item 3 |
| A badge **with** and **without** a count pill, with differing pill fills | Achievements 1, 4 vs. 2, 3 |
| Tabs **with** and **without** count badges | Repositories/Stars vs. Projects/Packages |
| A short sidebar against a very tall main column | whole page |

---

## 12. Visual system

### 12.1 Roles

| Role | Used for | Relationship to preserve |
|---|---|---|
| `surface/base` | Page background **and** every card fill | These are the **same** value. Cards are distinguished by border only. |
| `surface/raised-chrome` | Chrome band; tonal button fills (Edit profile, search field) | Recessed relative to `surface/base`. The **band** carries the tint; the page does not. |
| `surface/recessed` | Tab count badges; heatmap **level 0** cell | Deeper than `surface/raised-chrome`. Both must be **neutral** — **not** a pale tint of the contribution ramp. (In the source these two are near-neighbours rather than the identical value; one token for both is fine.) |
| `border/default` | Card outlines, control outlines, visibility pills, the chrome band's bottom edge, the contributions card's internal dividers, the timeline month rule | The heavier of the two hairlines |
| `border/subtle` | Sidebar section dividers, the timeline rail, markdown horizontal rules | Visibly lighter than `border/default` |
| `text/default` | Names, headings, timeline titles, sidebar meta values, inactive tab labels, count-badge numerals | |
| `text/muted` | Handle, pronouns, card descriptions, language names, pill labels, legend, axis labels, icon glyphs, resting-state repository paths, "Contribution settings", "Learn how we count contributions" | |
| `accent/primary` | Repository links, "Customize your pins", "Show more activity" label, the footer-note link, the **selected year chip fill** | One accent does both link text and the selected-chip fill |
| `text/on-accent` | Selected-year chip label, status-pill numerals | |
| `accent/attention` | Active tab indicator bar **only** | Must be **a different hue from `accent/primary`**, separable at a glance. Do not collapse them into one. |
| `status/merged` | The merged-count pill fill | A third distinct hue, unrelated to `accent/primary` |
| `data/contribution-N` | Heatmap levels 1–4, legend swatches, radar axis strokes, radar fill, radar markers, timeline volume bars | A four-step **sequential** ramp in one hue. The radar axes and volume bars use its **darkest** step. Level 0 is `surface/recessed`, not step 0 of this ramp. |
| `data/language-*` | Language dots | **Not tokens.** Supplied per language by the data. |

### 12.2 Typography

Five steps; use your system's nearest equivalents. Only the **ordering and the weight
assignments** are normative.

| Step | Weight | Used for |
|---|---|---|
| `type/display` | bold | README H1 (the largest text on the page) |
| `type/title` | bold | Profile display name (one step down from display) |
| `type/subtitle` | regular | Handle · pronouns |
| `type/body` | regular | Bio, main-column section headings, "N contributions…", timeline titles, repository names *(bold)*, sidebar section headings *(bold)*, activity-overview links *(bold)* |
| `type/small` | regular | Card descriptions, language names, pill labels, meta rows, legend, chart labels, footer note, the README breadcrumb *(monospace)* |

Weight carries as much hierarchy here as size does. In particular: **main-column section
headings are regular weight while sidebar section headings are bold**, at the same size. Do
not normalize them.

Monospace is used in exactly one place: the README card's file-path breadcrumb.

### 12.3 Density and radius

- Comfortable, not compact. Card internal padding is roughly uniform on all four sides of a
  given card, and the activity-overview vertical divider is inset from the contributions
  card's edges by that card's own padding. Padding is **not** shared across card types — the
  README card is the roomiest, pinned cards the tightest. [observed]
- Radius ladder, ascending: heatmap cells (small, softly rounded) → icon buttons and
  organization avatars (`radius/control`) → cards (`radius/card`) → the selected-year chip
  (`radius/chip`, noticeably rounder than a card) → visibility pills, status pills,
  achievement count pills, and volume bars (fully rounded).
- Avatars are circular; organization and achievement thumbnails are not.

### 12.4 Dark mode [prescribed]

Not observed. Implement by swapping tokens, preserving every relationship in §12.1 —
especially: page and card share one surface; the chrome band is a *distinct* surface from the
page; `border/subtle` stays lighter-contrast than `border/default`; heatmap level 0 remains a
**neutral** surface rather than the faintest step of the ramp; `accent/attention` remains distinguishable
from `accent/primary`.

---

## 13. Behavior

All of §13 is **[prescribed]** unless marked otherwise, since a static rendering cannot show
interaction.

- **Hover — repository links (pinned cards, activity overview):** underline appears; color
  unchanged.
- **Hover — timeline detail rows:** the repository path shifts from `text/muted` to
  `accent/primary` and gains an underline; the count link gains an underline and stays muted.
  [inferred from a captured hover state — see §9.3]
- **Hover — pinned cards:** no elevation change, no border change. The drag handle is already
  visible at rest, so nothing appears on hover. [observed: the handle is a resting affordance]
- **Hover — icon buttons, tabs, year-rail entries:** a light background wash; no movement.
- **Hover — heatmap cells:** a tooltip reading "N contributions on <date>" or
  "No contributions on <date>". Cells are focusable in DOM order.
- **Click — year rail:** replaces the heatmap, the header count, the activity overview, and
  the timeline with that year's data. The rail itself does not change. It is a
  single-selection control, not a set of links to separate pages.
- **Click — "Show more activity":** appends the next page of timeline items below the
  existing ones and keeps scroll position. The button disappears when `hasMoreActivity`
  becomes false.
- **Click — collapse controls:** toggle the item's detail rows.
- **Click — "Contribution settings", "Customize your pins", the pencil, "Edit profile":**
  out of scope; render as no-ops.
- **Drag handles:** out of scope; render the affordance without wiring reordering.
- **Nothing on this page is sticky.** Not the chrome band, not the sidebar, not the year rail.
  The document scrolls as a single unit.

### Empty states [prescribed]

| Condition | Behavior |
|---|---|
| No README | Omit the README card entirely. Do not render an empty card or a placeholder. |
| No pinned repositories | Omit the whole Pinned section, header and all. |
| No achievements | Omit the Achievements block **and its divider**. |
| No organizations | Omit the Organizations block **and its divider**. |
| Zero contributions in the selected year | Render the full grid at level 0 and the header as "No contributions in <year>". Keep the legend. |
| No timeline items for the selected year | Render the section heading and a single muted line; omit the month header, the rail, and the "Show more" button. |
| A category at 0% in the breakdown | Render the axis and its label; omit the percentage and the marker. **[observed]** |

---

## 14. Accessibility

- **Landmarks:** `banner` for the chrome band; `navigation` for the tab bar (`aria-label`
  naming the profile); `main` for region B; `complementary` for the sidebar.
- **Tabs** are links to distinct URLs, not ARIA tabs. Mark the active one `aria-current="page"`.
  Its count badge must be inside the link's accessible name ("Repositories, 26").
- **Avatar** requires meaningful alt text (the display name), or `alt=""` if the name is
  adjacent — pick one and be consistent. The status button is a real `button` with a label
  describing the status, not just the emoji.
- **Icon-only buttons** (menu, notifications, pencil, drag handle, collapse) each need an
  accessible name. The drag handle additionally needs a keyboard reorder path or an explicit
  `aria-hidden` plus an alternative reordering UI.
- **Meta rows:** the icon is decorative (`aria-hidden`); the row's text carries the meaning.
  The local-time row should expose the offset as part of its text, not only visually.
- **Heatmap:** render as a `table` (or `role="grid"`) with week columns and day rows, so a
  screen reader can traverse it. Each cell needs an accessible name of the form
  "N contributions on <full date>". Do not rely on color alone — the tooltip text and the
  cell name carry the value. Verify the four ramp steps are distinguishable in grayscale.
- **Activity breakdown chart:** give the SVG `role="img"` and an accessible description
  enumerating all four categories with their percentages, **including the zeros** — a
  sighted reader can see the two unlabelled axes, so a screen-reader user must be told
  "Code review 0%" explicitly.
- **Volume bars:** decorative reinforcement of the adjacent count. Mark `aria-hidden` — the
  count text already carries the value.
- **Status pills:** the pill and its trailing word form one phrase ("37 merged"); expose them
  together, not as two fragments.
- **Year rail:** a list of links, one marked `aria-current="page"`. Not a tablist — it
  navigates.
- **Focus:** a visible focus ring on every interactive element, including heatmap cells and
  the drag handles. Contrast the ring against both `surface/base` and
  `surface/raised-chrome`.
- **Contrast:** `text/muted` does a great deal of work in this design — on card descriptions,
  language names, pill labels, and resting-state repository paths. Verify it clears 4.5:1
  against `surface/base` before adopting it; if your muted token is lighter than the source's,
  step it up rather than accepting the design.

---

## 15. Responsive [prescribed]

Only the wide layout was observed. A reasonable ladder:

| Breakpoint | Behavior |
|---|---|
| Wide | As specified. |
| Medium | Pinned collapses to one column. The contributions band drops the year rail below the contributions card as a **horizontally scrolling row of chips** (the only place a scroll container is introduced). Activity overview's two panes stack, chart below text. |
| Narrow | Sidebar stacks **above** the main column. The avatar shrinks and the identity block sits beside it rather than beneath. The heatmap becomes its own horizontal scroll container, scrolled to the newest week; day labels stay pinned. The chrome band's icon-button cluster collapses behind the menu button. |

The heatmap and the year rail are the only elements that should ever acquire their own
scrollbar, and only below the wide breakpoint. Nothing else scrolls independently at any size.

---

## 16. Negative requirements

Explicit prohibitions. Each corresponds to something absent from the source that a competent
agent would otherwise add.

1. **No tonal difference between page background and card fill.** The card border is the only
   thing separating them.
2. **No divider between the two rows of the chrome band.** One continuous surface.
3. **No count badge on the Projects or Packages tabs.**
4. **The sidebar does not stretch** to the main column's height, has **no background**, **no
   border**, and **no footer**. Bare page background shows beneath it.
5. **No divider below the Organizations block** — the sidebar simply ends.
6. **No rule beneath the "Pinned" section header.**
7. **No placeholder card, ghost tile, or "add a pin" affordance** in the empty second column
   of the last pinned row.
8. **No star element when the count is zero** — not a dimmed glyph, not "0".
9. **The drag handle is not a hover affordance** — it is present at rest on every pinned card.
10. **No card elevation or shadow anywhere.** Borders only.
11. **Heatmap level 0 is a neutral surface, not the faintest step of the sequential ramp.**
12. **No placeholder cells in the heatmap's trailing partial week** — the column simply ends.
13. **No month label for the trailing partial month.**
14. **No rings, gridlines, ticks, legend, or numeric axis on the activity breakdown chart.**
15. **No "0%" on a zero-valued radar axis, and no marker at its origin vertex.**
16. **The radar's axis arms are always full length** regardless of the data.
17. **No separators between tabs**, and no rule between the two rows of the chrome band.
18. **The activity-overview vertical divider is inset** from the card's top and bottom edges —
    it does not run corner to corner.
19. **No dividers between timeline items**, and no timestamps or avatars on them.
20. **Timeline detail repository paths are not accent-colored at rest.**
21. **"Show more activity" is an outline button, not a solid accent button.**
22. **"Learn how we count contributions" is muted text, not an accent-colored link.**
23. **The sidebar's website and social rows are `text/default`, not accent-colored**, despite
    being links.
24. **Contribution activity and "Show more activity" are constrained to the narrower
    sub-column** — do not widen them to match README and Pinned.
25. **Nothing scrolls independently** at the wide breakpoint — no pane, card, or list has its
    own scrollbar. (That nothing is *sticky* either is [prescribed], not observed — a
    full-document capture cannot show it.)
26. **No site footer.** The page as captured ends at the one-line footer note.
27. **The active-tab indicator accent is not the link accent.** Keep the two hues distinct.

---

## 17. Suggested implementation

- One page component composing eight region components: `ChromeBand`, `ProfileSidebar`,
  `ReadmeCard`, `PinnedGrid`, `ContributionsBand`, `ActivityTimeline`, `YearRail`,
  `FooterNote`.
- Region B is a two-column CSS grid with `align-items: start` — that single declaration is
  what makes the sidebar hug its content. Do **not** use `stretch`.
- Region G is `grid-template-columns: repeat(2, 1fr)` with equal row and column gaps. The
  card is `display: flex; flex-direction: column`, the description block is `flex: 1`, and
  the footer follows — that combination produces both the equal-height rows and the
  bottom-anchored footer. Do not use `align-items: start` here; the default `stretch` is
  what you want.
- Region H is a nested two-column grid inside E, with the left column spanning §7.2, §8, and
  the "Show more" button, and the right column holding only the rail.
- The heatmap is a `<table>` of 7 rows × ~53 columns of `<td>`s; each cell is a small `div`
  or a rounded `rect`. A grid of divs also works but costs you the table semantics in §14.
- The breakdown chart is a hand-rolled inline SVG — four `line`s, one `polygon`, `circle`
  markers on the non-zero vertices, `text` labels. Do not reach for a charting library; the
  chart has no axes, ticks, or scales worth configuring, and the `0…max(series)` domain is
  three lines of arithmetic.
- Language dot colors and achievement pill colors arrive as data. Set them via inline style
  or a CSS custom property; do not add them to your token set.

---

## 18. Acceptance checklist

Each item is checkable against a running build.

**Composition**

- [ ] Sampling the page background and a card interior yields the **same** color.
- [ ] Sampling the chrome band yields a color **different** from the page background.
- [ ] The sidebar's bottom edge sits well above the main column's, with page background
      visible beside the main column's lower half.
- [ ] In the pinned grid's second row, the two cards' top and bottom edges are at identical
      y-coordinates, and their language rows share a baseline.
- [ ] The pinned grid's third row contains one card and no second element.
- [ ] The contributions card's right edge is **left of** the README card's right edge.
- [ ] The selected-year chip's right edge and the README card's right edge are at the same
      x-coordinate.
- [ ] The year rail's lowest entries sit vertically alongside the timeline, not the
      contributions card.
- [ ] The activity-overview vertical divider stops short of the card's top and bottom edges
      by the card's padding.
- [ ] "Show more activity" spans the same width as the contributions card.

**Content and state**

- [ ] Exactly two tabs show a count badge.
- [ ] Exactly one pinned card shows a star count; the other four show no star glyph at all.
- [ ] All five pinned cards show a drag handle without hovering.
- [ ] The heatmap's last column has fewer cells than the others.
- [ ] The heatmap shows exactly twelve month labels.
- [ ] "Code review" and "Issues" appear on the chart with no percentage above them and no
      marker at their vertex.
- [ ] The 15% marker is visibly displaced from the chart's origin — not coincident with it.
- [ ] The 85% marker sits at the end of its axis arm.
- [ ] Timeline item 1 reads "1 repository" (singular); item 3 reads "2 repositories".
- [ ] Timeline item 3's two bars have visibly different lengths, in the ratio 22:9.
- [ ] Two achievement badges show a count pill; the two pills have different fills.
- [ ] The sidebar shows exactly two divider lines.

**Negative**

- [ ] No shadow on any card or button.
- [ ] No rule between the chrome band's two rows.
- [ ] No rule beneath "Pinned".
- [ ] No rule below Organizations.
- [ ] No dividers between timeline items.
- [ ] No site footer below the one-line footer note.
- [ ] The heatmap's level-0 cells are a neutral recessed surface, not a tint of the sequential ramp.
- [ ] The active-tab indicator and a repository link are visibly different hues.
- [ ] At rest, a timeline detail row's repository path is muted and un-underlined; on hover
      it becomes accent-colored and underlined.
- [ ] At the wide breakpoint, no element on the page has its own scrollbar.

**Accessibility**

- [ ] Tabbing reaches every heatmap cell, and each announces a count and a date.
- [ ] The breakdown chart's accessible description names all four categories including the
      two at 0%.
- [ ] Every icon-only button has an accessible name.
- [ ] `text/muted` on `surface/base` measures at least 4.5:1.
- [ ] The focus ring is visible on both the chrome band and the page surface.
