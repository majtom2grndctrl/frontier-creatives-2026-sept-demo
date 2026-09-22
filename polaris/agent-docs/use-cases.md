# "I need to build X" → Polaris web components

Task-first lookup. Attribute spellings shown in **HTML** form; in JSX use camelCase (`accessibilityLabel`, `commandFor`, `labelAccessibilityVisibility`).

## 60-second cheat sheet

| You want | You write |
|---|---|
| a card | `<s-section heading="…">` |
| a page shell | `<s-page heading="…">` + `slot="primary-action"` |
| a vertical stack | `<s-stack gap="base">` (block is the default direction) |
| a horizontal row | `<s-stack direction="inline" gap="base">` |
| a form | native `<form>` + `s-*-field` + `<s-button type="submit">` |
| a table | `<s-table>` / `s-table-header-row` / `s-table-header` / `s-table-body` / `s-table-row` / `s-table-cell` |
| a status pill | `<s-badge tone="success">` |
| an alert | `<s-banner tone="critical" heading="…">` |
| a modal | `<s-button commandFor="id" command="--show">` + `<s-modal id="id">` |
| a toast | ❌ doesn't exist standalone — use `<s-banner>` |
| a dropdown of actions | `<s-button commandFor="id">` + `<s-menu id="id">` |
| a tooltip | `<s-button interestFor="id">` + `<s-tooltip id="id">` |
| an icon | `<s-icon type="plus">` (515 names in `icons.txt`) |
| spacing | `gap`/`padding` = `none small-500…small-100 small base large large-100…large-500` |

---

## "I need to show a list of records / tabular data"

**Use `<s-table>`.** It is the *only* data-display component. There is no `s-data-table`, no `s-index-table`, no `s-resource-list`.

It is responsive out of the box: `variant="auto"` (default) renders a real table on wide viewports and collapses to a stacked key-value list on narrow ones. `listSlot` on each header tells it how that column presents in the collapsed layout.

```html
<s-section heading="Products">
  <s-table paginate hasNextPage>
    <!-- filters slot sits above the data -->
    <s-search-field slot="filters" label="Search products"
                    labelAccessibilityVisibility="exclusive"
                    placeholder="Search"></s-search-field>

    <s-table-header-row>
      <s-table-header listSlot="primary">Product</s-table-header>
      <s-table-header listSlot="kicker">SKU</s-table-header>
      <s-table-header listSlot="labeled" format="currency">Price</s-table-header>
      <s-table-header listSlot="labeled" format="numeric">Stock</s-table-header>
      <s-table-header listSlot="secondary">Status</s-table-header>
    </s-table-header-row>

    <s-table-body>
      <s-table-row clickDelegate="p-1">
        <s-table-cell><s-link id="p-1" href="/products/1">Silk scarf</s-link></s-table-cell>
        <s-table-cell>SCF-001</s-table-cell>
        <s-table-cell>$49.00</s-table-cell>
        <s-table-cell>12</s-table-cell>
        <s-table-cell><s-badge tone="success">Active</s-badge></s-table-cell>
      </s-table-row>
    </s-table-body>
  </s-table>
</s-section>
```

**Rules that bite:**
- `variant` accepts only `"auto"` and `"list"`. **`variant="table"` does not exist** — the shopify.dev prose is wrong; setting it silently falls back to `auto`.
- Omitting `<s-table-header-row>` logs a console warning and breaks the list layout (headers supply the labels).
- **Row navigation** = put an `<s-link id="…">` in a cell and set `clickDelegate="…"` on the `<s-table-row>`. There's no `onRowClick`.
- Pagination is **presentational**: `paginate`, `hasPreviousPage`, `hasNextPage` render the arrows; you handle the `nextpage` / `previouspage` events and re-render rows yourself. There is no page-size control, no total count, no `s-pagination`.
- No built-in sorting, no row selection, no bulk-action bar. If the demo needs them, build them yourself: header cells with `s-button variant="tertiary"` for sort, an `s-checkbox` column for selection, an `s-stack` of buttons above the table for bulk actions.
- `format="numeric"` / `format="currency"` right-align the column. Use them.

**Not tabular?** A list of cards is `<s-stack gap="base">` of `<s-section>`s. A simple bulleted list is `<s-unordered-list>` + `<s-list-item>`.

## "I need a card"

**`<s-section>`.** There is no `s-card`.

```html
<s-section heading="Order summary">
  <s-stack gap="base">
    <s-paragraph>Body content.</s-paragraph>
    <s-button variant="primary">Fulfill</s-button>
  </s-stack>
</s-section>
```

How it differs from Polaris React's `Card`:
- `heading` is a plain string attribute — you can't slot rich content into the title, and there's no separate "card header actions" slot. Put actions inside the body, top-right via `<s-stack direction="inline" justifyContent="space-between">`.
- **It nests, and nesting is meaningful.** Outer `s-section` → `.level-1` (the full card). An `s-section` inside it → `.level-2`, then `.level-3` — progressively lighter subsection treatment. That replaces React's `Card.Section` / `BlockStack` sectioning.
- `padding="none"` gives you an edge-to-edge card (put a table or an image flush against the border).
- **`s-heading` inside a section auto-levels**: bare `s-heading` → `<h2>`, one level deep → `<h3>`. You get correct heading hierarchy for free and there is no `level` prop to set.

Need a card-like surface *without* the section semantics (e.g. a highlight box)? Use `<s-box background="subdued" borderRadius="base" border="base" padding="base">`.

## "I need a page with a header and actions"

**`<s-page>`.** One per app — Polaris warns in the console if it sees more than one.

```html
<s-page heading="Products" inlineSize="base">
  <s-link slot="breadcrumb-actions" href="/">Home</s-link>
  <s-button slot="primary-action" variant="primary" icon="plus">Add product</s-button>
  <s-button slot="secondary-actions">Export</s-button>
  <s-button slot="secondary-actions">Import</s-button>

  <s-stack gap="large-100">
    <s-section heading="All products">…</s-section>
    <s-section heading="Drafts">…</s-section>
  </s-stack>

  <s-stack slot="aside" gap="base">
    <s-section heading="Insights">…</s-section>
  </s-stack>
</s-page>
```

Slot rules:
- Slot names are **kebab-case** in markup: `primary-action`, `secondary-actions`, `breadcrumb-actions`, `aside`. Writing `slot="primaryAction"` renders nothing, silently.
- `primary-action` takes exactly one `s-button variant="primary"`.
- `secondary-actions` takes `s-button` / `s-button-group` with variant `secondary` or `auto`. On narrow viewports Polaris collapses them into an overflow menu automatically.
- `breadcrumb-actions` takes `s-link` only. On narrow viewports it collapses into a breadcrumb menu button.
- **`aside` only renders when `inlineSize="base"`.** If your sidebar vanishes, that's why.
- `<s-page>` renders `<main>` and its heading is the page `<h1>`.

`s-title-bar` is App Bridge and does not exist standalone. `s-page`'s header is the title bar.

## "I need a form"

Native `<form>`. **There is no `<s-form>`.** Every Polaris field is a form-associated custom element, so `FormData`, `form.reset()`, and `type="submit"` all just work.

```html
<form id="product-form">
  <s-section heading="Product details">
    <s-stack gap="base">
      <s-text-field name="title" label="Title" required
                    details="Appears on the storefront."></s-text-field>

      <s-text-area name="description" label="Description" rows="4"></s-text-area>

      <s-stack direction="inline" gap="base">
        <s-money-field name="price" label="Price" currencyCode="USD" min="0"></s-money-field>
        <s-number-field name="qty" label="Quantity" min="0" step="1"></s-number-field>
      </s-stack>

      <s-select name="status" label="Status">
        <s-option value="draft" selected>Draft</s-option>
        <s-option value="active">Active</s-option>
      </s-select>

      <s-choice-list name="channels" label="Sales channels" multiple>
        <s-choice value="online">Online store</s-choice>
        <s-choice value="pos">Point of sale</s-choice>
      </s-choice-list>

      <s-checkbox name="taxable" label="Charge tax on this product" checked></s-checkbox>
      <s-switch name="published" label="Published"></s-switch>

      <s-drop-zone name="images" label="Images" accept="image/*" multiple></s-drop-zone>

      <s-stack direction="inline" gap="base" justifyContent="end">
        <s-button type="reset">Discard</s-button>
        <s-button type="submit" variant="primary">Save</s-button>
      </s-stack>
    </s-stack>
  </s-section>
</form>

<script>
  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // { title: 'Hat', price: '12.50', qty: '3', status: 'draft', channels: 'online', taxable: 'on', ... }
  });
</script>
```

**Labels.** Every field takes `label`; there is no `s-label`. To hide it visually but keep it for screen readers, `labelAccessibilityVisibility="exclusive"`. Never omit `label` — use `accessibilityLabel` only where the element has no `label` prop.

**Helper text.** `details="…"` (or the `details` slot for rich content).

**Validation.** No validation component, and `required` is semantic only — it produces no automatic error. Set the message yourself:

```js
const field = document.querySelector('[name=title]');
field.error = value ? '' : 'Title is required';   // truthy string → error styling + message
```
Set `error` to `''`/`undefined` to clear. `error` is also a slot if you need rich content. For a form-level summary use `<s-banner tone="critical" heading="There is 1 error">`.

**Events.** `input` fires on every keystroke; `change` fires when committed. Both are `CustomEvent`s with a typed `currentTarget`. In JSX: `onInput` / `onChange` (the wrapper lowercases and calls `addEventListener`).

**Dirty state.** Every field has both `value` and `defaultValue`. A field is dirty when they differ; `form.reset()` restores `defaultValue`. In HTML, the `value` attribute seeds `defaultValue`.

**Everything comes back as a string.** `new FormData()` gives `"3"`, not `3`. Convert yourself.

**Field vocabulary at a glance:** `s-text-field` `s-text-area` `s-email-field` `s-password-field` `s-url-field` `s-search-field` `s-number-field` `s-money-field` `s-color-field` `s-color-picker` `s-date-field` `s-date-picker` `s-select` (+ `s-option`, `s-option-group`) `s-checkbox` `s-switch` `s-choice-list` (+ `s-choice`) `s-drop-zone`.

## "I need to lay things out"

**Default to `<s-stack>`.** It's a flexbox with token gaps.

```html
<!-- vertical (direction defaults to "block") -->
<s-stack gap="base">…</s-stack>

<!-- horizontal, right-aligned, vertically centered -->
<s-stack direction="inline" gap="small" alignItems="center" justifyContent="end">…</s-stack>

<!-- header row: title left, actions right -->
<s-stack direction="inline" justifyContent="space-between" alignItems="center">
  <s-heading>Recent orders</s-heading>
  <s-button variant="tertiary">View all</s-button>
</s-stack>
```

**`<s-grid>` + `<s-grid-item>`** for real 2D layouts. `gridTemplateColumns` takes raw CSS track values.

```html
<s-grid gridTemplateColumns="repeat(3, 1fr)" gap="base">
  <s-grid-item><s-section heading="Sales">…</s-section></s-grid-item>
  <s-grid-item gridColumn="span 2"><s-section heading="Traffic">…</s-section></s-grid-item>
</s-grid>
```

**`<s-box>`** when you need a styled container with no semantics: `background`, `border`, `borderRadius`, `padding`, sizing, `overflow`. It's the escape hatch that keeps you out of custom CSS.

**`<s-divider>`** for a rule. **`<s-scroll-box>`** for a scrollable region (give it `accessibilityLabel` or Polaris warns).

**Spacing tokens:**

| keyword | px | | keyword | px |
|---|---|---|---|---|
| `none` | 0 | | `base` | **16** |
| `small-500` | 2 | | `large-100` = `large` | 20 |
| `small-400` | 4 | | `large-200` | 24 |
| `small-300` | 6 | | `large-300` | 32 |
| `small-200` | 8 | | `large-400` | 40 |
| `small-100` = `small` | 12 | | `large-500` | 48 |

Same scale for `gap`, `rowGap`, `columnGap`, `padding` and all its axis variants. `padding` takes CSS-style 1–4 value shorthand but in **flow-relative order**: `block-start inline-end block-end inline-start`. So `padding="base none"` = 16px top/bottom, 0 left/right.

Radius: `none` 0 · `small-200` 4 · `small`/`small-100` 6 · `base` 8 · `large`/`large-100` 12 · `large-200` 16.

**Responsive layout** — wrap in `<s-query-container>` and use container-query value strings:

```html
<s-query-container>
  <s-grid gap="base"
          gridTemplateColumns="@container (inline-size > 700px) 1fr 1fr, 1fr">
    …
  </s-grid>
</s-query-container>
```
Syntax: `@container [name] (condition) valueIfTrue, valueIfFalse`. Mobile-first — the fallback applies at the smallest size. Name a container with `containerName="outer"` on the `s-query-container` and target it with `@container outer (…)`.

## "I need to show status / errors / empty states / loading"

| Need | Component |
|---|---|
| Inline status word ("Active", "Draft", "Paid") | `<s-badge tone="success\|info\|warning\|critical\|neutral">` |
| Page/section-level alert, error summary, tip | `<s-banner tone="…" heading="…" dismissible>` |
| Field-level error | `field.error = 'message'` (any field) |
| Loading spinner | `<s-spinner>` — pair with text; it has no label of its own beyond `accessibilityLabel` |
| Table loading | `<s-table loading>` |
| Button in-flight | `<s-button loading>` (also disables it) |
| Toast / flash message | ❌ **not available standalone.** `shopify.toast` is App Bridge; `window.shopify` is `undefined` on localhost. Use a `<s-banner dismissible>` you show/hide. |
| Skeleton loaders | ❌ none exist. Use `<s-spinner>` or render placeholder `<s-box background="subdued" blockSize=…>` bars. |
| Progress bar | ❌ none exists. |

**Empty state.** There is no `s-empty-state`. Compose it:

```html
<s-section>
  <s-stack gap="base" alignItems="center" padding="large-300">
    <s-icon type="order" size="base"></s-icon>
    <s-heading>No orders yet</s-heading>
    <s-paragraph color="subdued">Orders will appear here once customers start buying.</s-paragraph>
    <s-button variant="primary">Create order</s-button>
  </s-stack>
</s-section>
```

**Tone vs color.** `tone` = semantic intent (`auto neutral info success caution warning critical`). `color` = intensity (`subdued base strong`). Use `tone` to mean something, `color` to de-emphasize.

## "I need a modal / popover / tooltip / dropdown"

**All four work standalone**, with no Admin and no App Bridge. They're built on the native `popover` attribute and `<dialog>`, wired with the `command`/`commandFor` invoker pattern (Polaris ships the polyfill in the bundle).

There is **no `open` prop and no controlled/uncontrolled state**. You wire a trigger to an `id`.

```html
<!-- Modal -->
<s-button commandFor="confirm" command="--show">Delete</s-button>
<s-modal id="confirm" heading="Delete product?">
  <s-paragraph>This can't be undone.</s-paragraph>
  <s-button slot="primary-action" variant="primary" tone="critical"
            commandFor="confirm" command="--hide">Delete</s-button>
  <s-button slot="secondary-actions" commandFor="confirm" command="--hide">Cancel</s-button>
</s-modal>

<!-- Popover -->
<s-button commandFor="opts">Options</s-button>
<s-popover id="opts">
  <s-stack direction="block"><s-button variant="tertiary">Import</s-button></s-stack>
</s-popover>

<!-- Menu (action list) -->
<s-button commandFor="row-menu" icon="menu-horizontal" variant="tertiary"
          accessibilityLabel="More actions"></s-button>
<s-menu id="row-menu" accessibilityLabel="Product actions">
  <s-button icon="duplicate">Duplicate</s-button>
  <s-button icon="delete" tone="critical">Delete</s-button>
</s-menu>

<!-- Tooltip: interestFor, NOT commandFor -->
<s-tooltip id="tip">Copies the SKU</s-tooltip>
<s-button interestFor="tip" icon="clipboard" accessibilityLabel="Copy SKU"></s-button>
```

Notes:
- `command` values: `--auto` (default, does the sensible thing per component), `--show`, `--hide`, `--toggle`, `--copy`. For `s-popover` and `s-menu` you can omit `command` entirely.
- Programmatic control on `s-modal`: `el.showOverlay()`, `el.hideOverlay()`, `el.toggleOverlay()`.
- Events: modal `show`/`aftershow`/`hide`/`afterhide`; popover adds `toggle`/`aftertoggle`.
- Popover position is derived from the trigger and **cannot** be overridden.
- `s-menu` children may only be `s-button` and `s-section`. `s-tooltip` children may only be `s-text`, `s-paragraph`, or raw text.
- Overlays can live anywhere in the document — put them as siblings after the trigger, or at the end of `<body>`.

## "Typography and text hierarchy"

Only three text elements, and **size is not a prop**:

- `<s-heading>` — section/page headings. **The level is computed from `s-section` nesting depth**, not set by you: bare → `<h2>`, one `s-section` deep → `<h3>`, two deep → `<h4>`. The page `<h1>` comes from `<s-page heading>`. Props: `lineClamp`, `accessibilityRole`.
- `<s-paragraph>` — block body copy. Props: `color` (`subdued`/`base`), `tone`, `lineClamp`, `fontVariantNumeric`, `dir`.
- `<s-text>` — inline. `type="strong"` renders `<strong>`; other types: `address`, `redundant`, `generic`. Same `color`/`tone`/`fontVariantNumeric`.

There is **no `variant="headingLg"` / `bodyMd` scale** like Polaris React. If you want a smaller/quieter line, use `<s-paragraph color="subdued">`, not a size prop.

Numbers in tables/metrics: `fontVariantNumeric="tabular-nums"` so digits align.
Truncation: `lineClamp="2"` on `s-heading` / `s-paragraph`.
Lists: `<s-ordered-list>` / `<s-unordered-list>` with `<s-list-item>` children.

## "I need icons"

`<s-icon type="plus" tone="critical" size="small">`. **515 icon names** — the complete list is in `icons.txt` beside this file. Grep it before guessing; an invalid name renders nothing and logs `Icon component rendered with no type`. Don't take names from `@shopify/polaris-types`; it tracks a newer bundle. The bundle's 111 internal-only icons are not reachable through `type`.

Icons also embed directly in several components via an `icon` attribute: `s-button`, `s-press-button`, `s-badge`, `s-text-field`, `s-select`.

Icon-only buttons **must** carry `accessibilityLabel` or Polaris warns in the console.

## "I need navigation / tabs / breadcrumbs"

- **Breadcrumbs**: `<s-link slot="breadcrumb-actions">` inside `<s-page>`.
- **App nav sidebar**: no component — `s-nav-menu` is App Bridge. Build it with `<s-stack>` + `<s-link>`, or the `aside` slot on `s-page`.
- **Tabs**: ❌ no `s-tabs`. Substitutes: an `<s-stack direction="inline">` of `s-press-button`s (real pressed state, correct toggle-group ARIA) with your own show/hide, `<s-select>` as a view switcher, or separate `s-section`s. Do **not** wrap the press buttons in `s-button-group` — its default slot drops them and they render nothing.
- **Pagination**: only what `<s-table paginate>` provides. No standalone pagination component.

## "I need a metric / KPI tile"

Compose it:
```html
<s-section heading="Total sales">
  <s-stack gap="small-200">
    <s-text fontVariantNumeric="tabular-nums" type="strong">$12,480.00</s-text>
    <s-stack direction="inline" gap="small-300" alignItems="center">
      <s-icon type="arrow-up" tone="success" size="small"></s-icon>
      <s-text color="subdued">12% vs last week</s-text>
    </s-stack>
  </s-stack>
</s-section>
```
No charts ship with Polaris. If the demo needs one, draw inline SVG inside an `s-section` — do **not** pull in a chart library and its stylesheet.

## "I need a custom clickable thing"

`<s-clickable>` — every `s-box` layout attr plus every button behavior attr (`href`, `command`/`commandFor`, `disabled`, `loading`, `type`, `target`). Use it for clickable cards, list rows, custom tiles. No default appearance; style it with Box props.

## "I need filter chips / tags"

`<s-chip removable>` (static, fires `remove`) or `<s-clickable-chip>` (clickable + removable + `href`/`command`). `graphic` slot accepts an `s-icon` only.

## Wiring events

Vanilla:
```js
document.querySelector('s-text-field')
  .addEventListener('change', (e) => console.log(e.currentTarget.value));
```
React/Preact — write the handler as an `onX` prop; the wrapper detects `'onChange' in element` and registers `addEventListener('change', …)`:
```jsx
<s-button onClick={handleClick}>Save</s-button>
<s-text-field label="Title" onInput={(e) => setTitle(e.currentTarget.value)} />
```

## Things that will silently do nothing

- `slot="primaryAction"` (camelCase slot names). Use kebab-case.
- `variant="table"` on `s-table`. Only `auto` / `list`.
- `s-page` `aside` slot when `inlineSize` isn't `base`.
- Any `s-title-bar` / `s-save-bar` / `s-nav-menu` / `s-card` / `s-form` — unregistered elements render as inert unknown tags with no error.
- `el.getBoundingClientRect()` on a Polaris host — hosts are `display: contents`, so you get zeros. Measure a child or a wrapping `<div>`.
- Custom CSS targeting component internals — shadow DOM, no exposed parts.
