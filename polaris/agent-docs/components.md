# Polaris web components — full inventory

**59 custom elements.** The bundle carries 9 further `s-*` strings that are not authorable elements: 7 private internals (`s-internal-button`, `s-internal-icon`, `s-internal-link`, `s-internal-modal`, `s-internal-scroll-box`, `s-internal-text`, `s-internal-tooltip`), the context key `s-button-context`, and `s-default` (the implicit container-query container name). **Never author any of those.**

## Load

Already wired in `index.html`, vendored and offline — no CDN, no provider, no CSS import, no npm package for the components themselves:

```html
<link rel="stylesheet" href="/fonts/inter/styles.css" />
<script src="/polaris/local-font-shim.js"></script>
<script src="/polaris/local-icon-shim.js"></script>
<script src="/polaris/polaris-1.js"></script>
```

Both shims must precede `polaris-1.js` — see `AGENTS.md`.

Types are dev-only and already installed: `@shopify/polaris-types@1.0.7` augments both `preact` and `react` JSX `IntrinsicElements` (59 declarations each), so `<s-button variant="primary">` type-checks in `.tsx` under `jsx: react-jsx` and unknown props or elements are compile errors.

## Does NOT work standalone (needs the Admin iframe / App Bridge)

**None of these are Polaris elements.** They ship in `app-bridge.js`, not `polaris-1.js`, and `customElements.get()` returns `undefined` for all of them on localhost. Write one and you get an inert unknown element and silent failure.

| Thing | Status standalone |
|---|---|
| `<s-title-bar>` | ❌ not registered. Use `<s-page heading>` + its `primary-action`/`secondary-actions` slots instead. |
| `<s-save-bar>` | ❌ not registered. Put Save/Discard in `s-page` actions or a sticky `s-section`. |
| `<s-nav-menu>` | ❌ not registered. Build nav with `s-stack` + `s-link`, or `s-menu`. |
| `shopify.toast.show()` | ❌ `window.shopify` is `undefined`. Use `<s-banner>` for feedback. |
| `shopify.resourcePicker()`, `shopify.modal`, `shopify.pick` | ❌ same. |
| Session tokens, `shopify.idToken()`, authenticated Admin GraphQL | ❌ same. Mock your data. |

`window.polaris` **does** exist standalone — an object with `locale`, `currencyCode`, and a `translations` bag.

## Works standalone

Everything in the inventory below: page/section chrome, all form controls, **modal, popover, tooltip and menu overlays** (native `popover`/`<dialog>` plus the `command`/`commandFor` invoker pattern and a bundled polyfill), table with pagination, container-query responsive values, and native `<form>` + `FormData`.

---

# Inventory

Attribute names below are the **HTML attribute** spelling (lowercase, as the manifest reports them). In JSX use camelCase (`accessibilityLabel`, `commandFor`, `labelAccessibilityVisibility`) — the wrapper does `if (prop in element) element[prop] = value; else setAttribute(...)`. **Slot names are always kebab-case in your markup** (`slot="primary-action"`) even though the internal shadow slot is camelCase; `slot="primaryAction"` silently does not render.

Shared "Box layout attrs" referenced below = the 24 attrs listed under `s-box`.

## Page & structure

### `<s-page>` — the top-level app page frame (header, title, actions, centered content column)
- `heading: string` · `inlinesize: "base" | "small" | "large"`
- Slots: `(default)` main content · `primary-action` (one `s-button variant="primary"`) · `secondary-actions` (`s-button`/`s-button-group`, variant secondary/auto) · `breadcrumb-actions` (`s-link` only) · `aside` (sidebar; **only renders when `inlinesize="base"`**)
- ⚠️ Polaris warns in console if more than one `s-page` exists. One per app.

### `<s-section>` — **this is the card.** A titled surface with padding, border, radius.
- `heading: string` · `padding: "base" | "none"` · `accessibilitylabel: string`
- Slot: `(default)`
- Nests: outer renders `.level-1` (full card), nested `.level-2`, `.level-3` (progressively lighter subsections).

### `<s-box>` — the unstyled layout primitive. Nothing visual by default.
All 24 layout attrs; every other layout element inherits some subset:
`background` (`subdued|base|strong|transparent`) · `border` (BorderShorthand, e.g. `"base"`, `"small strong dashed"`) · `borderwidth` · `borderstyle` (`none|solid|dashed|auto`) · `bordercolor` (`subdued|base|strong`) · `borderradius` (`none|small-200|small-100|small|base|large|large-100|large-200`) · `padding` + `paddingblock` / `paddingblockstart` / `paddingblockend` / `paddinginline` / `paddinginlinestart` / `paddinginlineend` · `display` (`auto|none`) · `blocksize` / `minblocksize` / `maxblocksize` / `inlinesize` / `mininlinesize` / `maxinlinesize` · `overflow` (`visible|hidden`) · `accessibilityrole` · `accessibilitylabel` · `accessibilityvisibility` (`visible|hidden|exclusive`)
- `padding` accepts CSS-style 1–4 value shorthand, **flow-relative order**: `block-start inline-end block-end inline-start`.

### `<s-stack>` — flex row/column. Your default layout tool.
- `direction: "block" | "inline"` (**default `block`** = vertical) · `gap` · `rowgap` · `columngap` · `alignitems` · `justifycontent` · `aligncontent` · + Box attrs
- Slot: `(default)`

### `<s-grid>` — CSS grid
- `gridtemplatecolumns: string` (raw track values, e.g. `"1fr 1fr auto"`) · `gridtemplaterows` · `gap`/`rowgap`/`columngap` · `alignitems`/`justifyitems`/`placeitems` · `aligncontent`/`justifycontent`/`placecontent` · + Box attrs

### `<s-grid-item>` — grid child
- `gridcolumn` · `gridrow` (typed `"auto"` in the manifest but they take CSS grid-column/grid-row values) · + all 24 Box attrs

### `<s-divider>` — hairline rule
- `direction: "block" | "inline"` · `color: "base" | "strong"` · no slots, no events

### `<s-query-container>` — establishes a container-query container so `@container ...` responsive values resolve
- `containername: string` (default `''`; the implicit name is `s-default`) · `id`

### `<s-scroll-box>` — scrollable region with scroll-snap
- `snaptype: "none"|"mandatory"|"proximity"` · `scrollpadding` (spacing keyword) · `scrollmargin` · + all 24 Box attrs
- Events: `scroll`, `scrolltoedge`
- ⚠️ Warns in console if you omit `accessibilitylabel`.

## Typography

### `<s-heading>` — section heading. **Level is derived automatically from `s-section` nesting depth**: bare → `<h2>`, inside one `s-section` → `<h3>`. There is no `level` prop.
- `lineclamp: number` · `accessibilityrole: "heading"|"presentation"|"none"` · `accessibilityvisibility`

### `<s-paragraph>` — block text
- `color: "subdued"|"base"` · `tone: "auto"|"neutral"|"info"|"success"|"caution"|"warning"|"critical"` · `fontvariantnumeric: "auto"|"normal"|"tabular-nums"` · `dir` · `lineclamp: number` · `accessibilityvisibility`

### `<s-text>` — inline text
- `type: "strong"|"address"|"redundant"|"generic"` (`strong` renders `<strong>`) · `color` · `tone` · `fontvariantnumeric` · `dir` · `interestfor` · `accessibilityvisibility`
- ⚠️ No `size`/`variant`/`fontWeight` prop. Size comes from `s-heading` vs `s-paragraph` vs `s-text`, not from a scale prop.

### `<s-ordered-list>` / `<s-unordered-list>` / `<s-list-item>`
- Only `id`. Children of the lists must be `s-list-item`.

## Actions

### `<s-button>`
- `variant: "auto"|"primary"|"secondary"|"tertiary"` (default `auto` — context-determined) · `tone: "auto"|"neutral"|"critical"` · `icon: <IconName>` · `disabled` · `loading` · `type: "button"|"reset"|"submit"` · `href` · `target` · `download` · `inlinesize: "auto"|"fill"|"fit-content"` · `accessibilitylabel` · `lang` · **`commandfor: string`** + **`command: "--auto"|"--show"|"--hide"|"--toggle"|"--copy"`** · **`interestfor: string`**
- Events: `click`, `focus`, `blur`
- ⚠️ Icon-only buttons warn in console without `accessibilitylabel`.

### `<s-button-group>`
- `gap: "base"|"none"` · `accessibilitylabel`
- Slots: `(default)` · `primary-action` (one primary button; **cannot be used with `gap="none"`**) · `secondary-actions`

### `<s-clickable>` — turn any layout box into a button/link
- All 24 Box attrs, plus `s-button`'s behavior attrs: `href`, `command`/`commandfor`, `interestfor`, `disabled`, `loading`, `type`, `target`, `download`, `lang`. No default visual styling — you style it via Box props.
- Events: `click`, `focus`, `blur`

### `<s-link>`
- `href` · `target` · `download` · `tone: "auto"|"neutral"|"critical"` · `lang` · `command`/`commandfor` · `interestfor` · `accessibilitylabel`
- Event: `click`

### `<s-press-button>` — a toggle (pressed/unpressed) button
- `pressed: boolean` (+ `defaultPressed`) · `variant: "secondary"|"tertiary"` · `tone: "neutral"` · `icon` · `disabled` · `loading` · `inlinesize` · `accessibilitylabel` · `lang`
- Events: `click`, `focus`, `blur`

### `<s-menu>` — action list in a popover. Triggered by `commandFor`.
- `id` · `accessibilitylabel`
- Slot: `(default)` — **only accepts `s-button` and `s-section`**
```html
<s-button commandFor="cust-menu" icon="menu-horizontal" variant="tertiary" accessibilityLabel="More actions"></s-button>
<s-menu id="cust-menu" accessibilityLabel="Customer actions">
  <s-button icon="delete" tone="critical" accessibilityLabel="Delete">Delete</s-button>
</s-menu>
```

## Forms — inputs

Every field below is a **form-associated custom element**: they all appear in `new FormData(form)` inside a plain `<form>`, `form.reset()` restores `defaultValue`, and `<s-button type="submit">` submits the enclosing form. All values come back as **strings**.

**The shared field API** (present on `s-text-field`, `s-text-area`, `s-email-field`, `s-password-field`, `s-url-field`, `s-search-field`, `s-number-field`, `s-money-field`, `s-color-field`, `s-date-field`, `s-select`):
`id` · `name` · `label: any` · `labelaccessibilityvisibility: "visible"|"exclusive"` · `value` (+ `defaultValue` property) · `placeholder` · `details: any` (helper text) · `error: any` (**setting it renders the error state — there is no separate validation component**) · `required` · `disabled` · `readonly` · `autocomplete`
Slots on all of them: `error`, `details` (rich-content alternatives to the props).
Events on all of them: `input` (every keystroke), `change` (committed), `focus`, `blur`.

| Element | Extra attrs |
|---|---|
| `<s-text-field>` | `maxlength`, `minlength`, `prefix`, `suffix`, `icon` · extra slot `accessory` |
| `<s-text-area>` | `maxlength`, `minlength`, `rows` (default 2) |
| `<s-email-field>` | `maxlength`, `minlength` |
| `<s-password-field>` | `maxlength`, `minlength` |
| `<s-url-field>` | `maxlength`, `minlength` |
| `<s-search-field>` | `maxlength`, `minlength` |
| `<s-number-field>` | `min`, `max`, `step`, `prefix`, `suffix`, `inputmode: "decimal"\|"numeric"` |
| `<s-money-field>` | `min`, `max`, `currencycode` (`"auto"` + full ISO list) |
| `<s-color-field>` | `alpha: boolean` |
| `<s-date-field>` | `view` (`YYYY-MM`), `allow`, `disallow`, `allowdays`, `disallowdays` · extra events `invalid`, `viewchange` |
| `<s-select>` | `icon` · no `readonly`/`maxlength`. Slot `(default)` takes `s-option` / `s-option-group`. Events `change`,`input`,`blur`,`focus` |

### `<s-checkbox>`
`name` · `label: any` · `checked` (+ `defaultChecked`) · `indeterminate` · `value` · `details` · `error` · `required` · `disabled` · `accessibilitylabel` · `labelaccessibilityvisibility` · slots `error`, `details` · events `change`, `input`, `blur`

### `<s-switch>`
Same shape as checkbox: `name` · `label` · `checked` (+ `defaultChecked`) · `value` · `details` · `error` · `required` · `disabled` · `accessibilitylabel` · `labelaccessibilityvisibility` · events `change`, `input`, `blur`

### `<s-choice-list>` + `<s-choice>` — radio group / checkbox group
- `s-choice-list`: `name` · `label` · `multiple: boolean` (false = radios, true = checkboxes) · `values: string[]` (property; convenience for setting child `selected`) · `details` · `error` · `disabled` · `labelaccessibilityvisibility` · events `change`, `input`
- `s-choice`: `value` · `selected` (+ `defaultSelected`) · `disabled` · `accessibilitylabel` · slots `(default)` label, `details`, `secondary-content` (rich content below the label — accepts text fields, buttons)

### `<s-option>` / `<s-option-group>` — for `s-select` and `s-menu`-style pickers
- `s-option`: `value` · `selected` (+ `defaultSelected`) · `disabled`
- `s-option-group`: `label: string` · `disabled`

### `<s-color-picker>` — inline HSL/alpha picker (not a field; no label/error)
`id` · `name` · `value` (+ `defaultValue`) · `alpha` · events `input`, `change`

### `<s-date-picker>` — inline calendar
`type: "single" | "range"` · `name` · `value` (+ `defaultValue`; `YYYY-MM-DD`, or `YYYY-MM-DD--YYYY-MM-DD` for range) · `view`/`defaultView` (`YYYY-MM`) · `allow` · `disallow` · `allowdays` · `disallowdays` · events `change`, `input`, `focus`, `blur`, `viewchange`

### `<s-drop-zone>` — file input
`name` · `label` · `accept` (comma-separated extensions/MIME) · `multiple` · `files: readonly File[]` (read-only property) · `value` · `error` · `required` · `disabled` · `accessibilitylabel` · `labelaccessibilityvisibility` · slot `(default)` (replaces the default prompt) · events `change`, `input`, `droprejected`

> **There is no `<s-form>`.** Use a native `<form>`.

## Feedback & status

### `<s-banner>` — the inline alert / callout / empty-state-ish surface
- `tone: "auto"|"info"|"success"|"warning"|"critical"` · `heading: string` · `dismissible: boolean` · `hidden: boolean`
- Slots: `(default)` body · `secondary-actions` (max 2 `s-button`s, variant secondary/auto)
- Events: `dismiss`, `afterhide`
- `critical` renders an assertive ARIA live region; the others render a polite `status` region.

### `<s-badge>` — status pill
- `tone: "auto"|"neutral"|"info"|"success"|"caution"|"warning"|"critical"` · `color: "base"|"strong"` · `size: "base"|"large"|"large-100"` · `icon`
- Slot: `(default)`

### `<s-spinner>` — loading indicator
- `size: "base"|"large"|"large-100"` · `accessibilitylabel`
- No events. Decorative; pair with text.

### `<s-chip>` / `<s-clickable-chip>` — tag / filter token
- `s-chip`: `color: "subdued"|"base"|"strong"` · `removable` · `accessibilitylabel` · slots `(default)`, `graphic` (**`s-icon` only**) · event `remove`
- `s-clickable-chip`: + `href`, `command`/`commandfor`, `interestfor`, `disabled`, `hidden` · events `click`, `remove`, `afterhide`

## Overlays

All four are driven by the **invoker-command pattern**, not by an `open` prop. Put the overlay anywhere in the document, give it an `id`, and point a trigger at it.

### `<s-modal>`
- `heading: string` · `size: "base"|"small"|"small-100"|"large"|"large-100"` · `alignself: "center"|"start"` · `padding: "base"|"none"` · `accessibilitylabel`
- Methods: `showOverlay()`, `hideOverlay()`, `toggleOverlay()`
- Slots: `(default)` · `primary-action` (one primary `s-button`) · `secondary-actions`
- Events: `show`, `aftershow`, `hide`, `afterhide`
- Renders a real `<dialog>` in shadow DOM; the trigger sets `open`.
```html
<s-button commandFor="edit-modal" command="--show">Edit</s-button>
<s-modal id="edit-modal" heading="Edit product">
  <s-paragraph>…</s-paragraph>
  <s-button slot="primary-action" variant="primary" commandFor="edit-modal" command="--hide">Save</s-button>
  <s-button slot="secondary-actions" commandFor="edit-modal" command="--hide">Cancel</s-button>
</s-modal>
```

### `<s-popover>`
- Only sizing attrs: `blocksize`, `minblocksize`, `maxblocksize`, `inlinesize`, `mininlinesize`, `maxinlinesize`. **Position is computed from the trigger and cannot be overridden.**
- Events: `show`, `aftershow`, `hide`, `afterhide`, `toggle`, `aftertoggle`
- Uses the native `popover` attribute; positioning styles are injected on open.
```html
<s-button commandFor="opts">Options</s-button>
<s-popover id="opts">
  <s-stack direction="block"><s-button variant="tertiary">Import</s-button></s-stack>
</s-popover>
```

### `<s-tooltip>` — attached via `interestFor`, not `commandFor`
- `id` only. Slot `(default)` accepts **only `s-text`, `s-paragraph`, or raw text**.
```html
<s-tooltip id="bold-tip">Bold</s-tooltip>
<s-button interestFor="bold-tip" accessibilityLabel="Bold" icon="text-bold"></s-button>
```

### `<s-menu>` — see Actions above.

## Media

### `<s-icon>` — **515 named icons** (full list: `icons.txt` next to these docs)
- `type: <IconName>` · `tone` · `color: "subdued"|"base"` · `size: "base"|"small"` · `interestfor`
- An unknown `type` renders nothing and logs `Icon component rendered with no type`. Grep `icons.txt`; don't guess, and don't take names from `@shopify/polaris-types` — it tracks a newer bundle with ~42 icons this build lacks. The bundle also holds 111 internal-only icons; they are not reachable through `type`.
- Common names that exist: `plus edit delete search filter export import refresh settings home order product person team store menu-horizontal menu-vertical x check chevron-down chevron-up chevron-left chevron-right arrow-left arrow-right arrow-up external duplicate view hide alert-triangle info check-circle calendar clock email phone location cart money discount save undo redo drag-handle sort star heart image note inventory payment lock key link attachment upload download print share archive blog page collection catalog-product clipboard chart-vertical chart-line price-list`

### `<s-image>`
- `src` · `srcset` · `sizes` · `alt` · `loading: "eager"|"lazy"` · `aspectratio` (e.g. `"16/9"`, default `"1/1"`) · `objectfit: "contain"|"cover"` · `inlinesize: "auto"|"fill"` · border attrs · `accessibilityrole: "presentation"|"none"|"img"` · events `load`, `error`

### `<s-thumbnail>` — small product image
- `src` · `alt` · `size: "base"|"small"|"small-200"|"small-100"|"large"|"large-100"` · events `load`, `error`

### `<s-avatar>`
- `src` · `alt` · `initials` · `size: "base"|"small"|"small-200"|"large"|"large-200"` · events `load`, `error`

## Data display — the table family

### `<s-table>` — **the only tabular component.** Responsive: table on wide screens, stacked list on narrow.
- `variant: "auto" | "list"` — ⚠️ **the shopify.dev prose mentions a `"table"` value; it does not exist.** Setting `variant="table"` silently falls back to `auto`. The manifest is right.
- `loading: boolean` · `paginate: boolean` · `haspreviouspage: boolean` · `hasnextpage: boolean`
- Slots: `(default)` · `filters` (e.g. an `s-search-field` above the data)
- Events: `nextpage`, `previouspage`

### `<s-table-header-row>` / `<s-table-header>`
- `s-table-header`: `format: "base"|"numeric"|"currency"` (numeric/currency right-align) · `listslot: "primary"|"secondary"|"inline"|"kicker"|"labeled"` — controls how that column is presented in the collapsed list layout.
- ⚠️ Omitting `s-table-header-row` logs a console warning.

### `<s-table-body>` / `<s-table-row>` / `<s-table-cell>`
- `s-table-row`: `clickdelegate: string` — the `id` of an interactive element in the row (usually an `s-link`) that the whole row's click delegates to. This is how rows become navigable.

```html
<s-table paginate hasNextPage>
  <s-search-field slot="filters" label="Search" labelAccessibilityVisibility="exclusive"></s-search-field>
  <s-table-header-row>
    <s-table-header listSlot="primary">Product</s-table-header>
    <s-table-header listSlot="labeled" format="currency">Price</s-table-header>
    <s-table-header listSlot="secondary">Status</s-table-header>
  </s-table-header-row>
  <s-table-body>
    <s-table-row clickDelegate="row-1">
      <s-table-cell><s-link id="row-1" href="/products/1">Silk scarf</s-link></s-table-cell>
      <s-table-cell>$49.00</s-table-cell>
      <s-table-cell><s-badge tone="success">Active</s-badge></s-table-cell>
    </s-table-row>
  </s-table-body>
</s-table>
```

---

## Design tokens

**Spacing scale** — used by `padding`, `gap`, `rowgap`, `columngap`, `scrollpadding`. Middle-out from `base`:

| keyword | px |
|---|---|
| `none` | 0 |
| `small-500` | 2 |
| `small-400` | 4 |
| `small-300` | 6 |
| `small-200` | 8 |
| `small-100` = `small` | 12 |
| `base` | 16 |
| `large-100` = `large` | 20 |
| `large-200` | 24 |
| `large-300` | 32 |
| `large-400` | 40 |
| `large-500` | 48 |

**Border radius** (`borderradius`): `none` 0 · `small-200` 4 · `small-100`=`small` 6 · `base` 8 · `large-100`=`large` 12 · `large-200` 16.

**Border** (`border="base"`) = 1px solid `rgb(227,227,227)`.

**Tone** (semantic intent): `auto | neutral | info | success | caution | warning | critical`.
**Color** (intensity): `subdued | base | strong`.

**Responsive values** — any prop documented as responsive accepts a container-query string:
```html
<s-query-container>
  <s-box padding="@container (inline-size > 500px) large-400, small">…</s-box>
</s-query-container>
```
Syntax: `@container [name] (condition) valueIfTrue, valueIfFalse`. Mobile-first: the fallback is what applies at the smallest size. This compiles to a real `@container s-default (inline-size > 200px)` rule. Responsive props: `padding` and all its axis variants, `display`, `gap`/`rowgap`/`columngap`, `gridtemplatecolumns`, `gridtemplaterows`.

## Behavioral facts worth knowing

- **Hosts are `display: contents`** — `getComputedStyle(el).display === 'contents'` on `s-section`, `s-button`, `s-heading`, `s-stack`. Consequence: `el.getBoundingClientRect()` returns **all zeros** and `el.offsetParent` is `null`. Measure a child, or wrap in a plain `<div>`.
- **Styling is not overridable.** Shadow DOM + merchant branding. No CSS parts are exposed. Use component props.
- **Polaris logs dev warnings** to the console (`polaris: [node …] …`) for missing `accessibilityLabel`, missing `s-table-header-row`, multiple `s-page`s. Read them; they're accurate.
- **`command`/`commandFor` are the universal wiring** for overlays. `--auto` (default), `--show`, `--hide`, `--toggle`, `--copy`.
- **`interestFor`** is the hover/focus equivalent, used for tooltips.
