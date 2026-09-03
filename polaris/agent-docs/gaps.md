# Gaps, substitutions, and rough edges

## Polaris React → web components: what has no equivalent

Absent = not registered by `polaris-1.js`. Writing one produces an inert unknown element, silently.

| Polaris React | Web component | What to do instead |
|---|---|---|
| `Card`, `Card.Section` | ❌ no `s-card` | **`<s-section>`.** Nest `s-section` inside `s-section` for `Card.Section` — the nesting level drives the visual weight (level-1/2/3). `padding="none"` for edge-to-edge. |
| `DataTable` | ❌ no `s-data-table` | **`<s-table>`** + `s-table-header-row`/`s-table-header`/`s-table-body`/`s-table-row`/`s-table-cell`. Use `format="numeric"\|"currency"` for alignment. |
| `IndexTable` | ❌ no `s-index-table` | `<s-table>`, but **you lose row selection and the bulk-action bar entirely.** Rebuild: an `s-checkbox` column, your own selected-count state, and an `s-stack` of `s-button`s above the table. |
| `ResourceList` / `ResourceItem` | ❌ no `s-resource-list` | `<s-table variant="list">` (the built-in stacked layout, with `listSlot` on headers driving what shows where), **or** an `<s-stack>` of `<s-clickable>` rows. |
| `Form`, `FormLayout` | ❌ no `s-form` | Native `<form>`. All fields are form-associated — `FormData`, `reset()`, and `<s-button type="submit">` work. `FormLayout.Group` → `<s-stack direction="inline" gap="base">`. |
| `Toast`, `Frame`, `ContextualSaveBar` | ❌ App Bridge only | No standalone equivalent. Use `<s-banner dismissible>` and show/hide it. |
| `Tabs` | ❌ no `s-tabs` | `<s-button-group>` of `<s-press-button>` (real pressed state + ARIA) with your own panel switching, or `<s-select>` as a view switcher. |
| `Pagination` | ❌ no `s-pagination` | Only `<s-table paginate hasNextPage hasPreviousPage>` + the `nextpage`/`previouspage` events. For non-table pagination, roll your own with two `s-button`s. |
| `EmptyState` | ❌ | `<s-section>` + centered `<s-stack>` with `s-icon` + `s-heading` + `s-paragraph` + `s-button`. |
| `SkeletonBodyText`, `SkeletonDisplayText`, `SkeletonPage`, `SkeletonThumbnail` | ❌ | `<s-spinner>`, or `<s-box background="subdued" borderRadius="base" blockSize=…>` placeholder bars. |
| `ProgressBar` | ❌ | Nothing. Show a percentage as text, or `<s-spinner>` for indeterminate. |
| `Layout`, `Layout.Section`, `Layout.AnnotatedSection` | ❌ | `<s-grid>` / `<s-stack>`. Annotated sections: `<s-grid gridTemplateColumns="1fr 2fr">` with the description in the first column. |
| `Page` `titleMetadata`, `pagination`, `actionGroups` | partial | `<s-page>` has only `heading` + the four slots. Put a `<s-badge>` next to the heading inside the body, not in the header. |
| `Filters`, `IndexFilters` | ❌ | `<s-table>`'s `filters` slot (put an `s-search-field` and `s-select`s there) + `s-clickable-chip` for applied filters. Filtering logic is yours. |
| `Autocomplete`, `Combobox`, `Listbox` | ❌ | `<s-select>` if the option set is fixed. No typeahead component exists. |
| `Tag` | ❌ | `<s-chip removable>` / `<s-clickable-chip>`. |
| `Collapsible`, `Accordion` | ❌ | Native `<details>`/`<summary>`, or `<s-button>` toggling `hidden` on an `s-box`. |
| `Tooltip` | ✅ `<s-tooltip>` | Attach with `interestFor`, not by wrapping. |
| `Popover`, `ActionList` | ✅ `<s-popover>`, `<s-menu>` | Trigger with `commandFor`. |
| `Icon` | ✅ `<s-icon>` | **Icon names changed.** 515 names in `icons.txt`; they're kebab-case (`menu-horizontal`, `alert-triangle`), not React's `XIconMinor` identifiers. Grep before guessing. |
| `Text` with `variant="headingLg"` etc. | ⚠️ partial | `<s-heading>` / `<s-paragraph>` / `<s-text>`. **There is no type-scale prop.** Heading level is derived from `s-section` nesting depth. |
| `Badge`, `Banner`, `Spinner`, `Avatar`, `Thumbnail`, `Divider`, `Box`, `Grid`, `BlockStack`/`InlineStack` | ✅ | `s-badge`, `s-banner`, `s-spinner`, `s-avatar`, `s-thumbnail`, `s-divider`, `s-box`, `s-grid`, `s-stack direction="block"` / `direction="inline"`. |
| Charts (`@shopify/polaris-viz`) | ❌ | Not part of Polaris. Inline SVG if you must. Do not add a chart library + stylesheet. |

## What silently doesn't work outside the Admin iframe

- **`window.shopify` is `undefined`.** Every App Bridge API is therefore unavailable: `shopify.toast.show()`, `shopify.resourcePicker()`, `shopify.modal`, `shopify.saveBar`, `shopify.idToken()`, `shopify.environment`, authenticated Admin GraphQL.
- **`s-title-bar`, `s-save-bar`, `s-nav-menu` are not registered custom elements.** These are App Bridge elements from `app-bridge.js`, not Polaris. Writing them produces an inert unknown HTML element — **no error, no warning, just nothing rendered.** This is the single easiest way to lose demo time.
- `<meta name="shopify-api-key">` and `app-bridge.js` are pointless standalone; omit them.

**What *does* work standalone — don't hedge on these:** all 59 elements render; `s-modal`, `s-popover`, `s-tooltip`, `s-menu` open and position correctly; native `<form>` + `FormData` collects every field; container-query responsive values compile to real `@container` rules; `window.polaris` exists as an object with `locale`, `currencyCode`, and a `translations` bag.

## Rough edges

### `display: contents` on every host breaks measurement
`getComputedStyle(el).display === 'contents'` for `s-section`, `s-button`, `s-heading`, `s-stack`, `s-box`. Consequences:
- `el.getBoundingClientRect()` returns `{x:0,y:0,width:0,height:0,…}` — **all zeros, no error**.
- `el.offsetParent` is `null`; `offsetWidth`/`offsetHeight` are 0.
- `IntersectionObserver` / `ResizeObserver` on the host observe a zero-size box.
- Fix: wrap in a plain `<div>` and measure that, or reach into `el.shadowRoot` for the rendered child. Both are hacks; prefer restructuring so you don't measure at all.

### Styling is not overridable
Shadow DOM, no exposed CSS parts, appearance driven by merchant branding settings. Your stylesheet cannot reach inside. Everything visual comes from component props (`padding`, `gap`, `background`, `border`, `tone`, `color`, `variant`, `size`). If you want a stylesheet, you're using the wrong element — reach for `s-box` / `s-clickable`, which expose the layout surface as props.

### The docs and the manifest disagree
`s-table` `variant`: shopify.dev prose lists `auto | list | table`; the Custom Elements Manifest lists `"auto" | "list"`. **The manifest is correct** — `variant="table"` falls back to `auto`. When prose and manifest conflict on an attribute, trust the manifest dump in `cem-reference.txt`. Icon names are the one exception: take those from `icons.txt`, which is generated from the vendored bundle.

### Slot names: kebab in markup, camel in shadow DOM
The shadow root contains `<slot name="primaryAction">`, but the attribute you write is `slot="primary-action"`. `slot="primaryAction"` assigns nothing and renders nothing, silently. Always kebab-case in your markup. (In JSX, passing slotted content as a *prop* — `primaryAction={…}` — is the React wrapper's camelCase prop form, which is a different thing from the `slot` attribute.)

### `@shopify/polaris-types` JSX typing
Works under `typescript@5` with `jsx: "react-jsx"`:
- The `.d.ts` contains **59 `declare module 'react'` blocks and 59 `declare module 'preact'` blocks**, augmenting `IntrinsicElements` for both.
- `<s-button variant="primary" onClick={…}>` type-checks.
- `<s-card>` errors with `TS2339: Property 's-card' does not exist on type 'JSX.IntrinsicElements'`.
- An unknown prop errors with `TS2322`.
- Vanilla DOM typing also works: `HTMLElementTagNameMap` is augmented, so `document.createElement('s-button').variant = 'primary'` and `document.querySelector('s-modal')?.showOverlay()` both type-check, and `globalThis.polaris` is typed.
- Setup: `"types": ["@shopify/polaris-types"]` in tsconfig, or `/// <reference types="@shopify/polaris-types" />`. Already done here.

Two caveats:
- **Its `IconName` union is wrong for this build.** The package tracks a newer bundle and lists ~42 icons the vendored one lacks, so a name can type-check and still render nothing. `icons.txt` is the authority.
- The package declares `@types/react` and `preact` as devDependencies and its type file `import`s from both. In a project with neither installed you may see resolution errors — `skipLibCheck: true` covers most of it.

### Manifest quirks (cosmetic, not bugs)
- Several attributes appear **twice** in the CEM (`value`, `checked`, `selected`, `pressed`, `view`). The second entry is the `defaultValue`/`defaultChecked`/`defaultSelected`/`defaultPressed`/`defaultView` sibling; the generator collapsed the names. Both exist at runtime.
- `s-checkbox` reports `indeterminate` twice for the same reason.
- Some `autocomplete` defaults read `'tel' for PhoneField` — a copy-paste artifact from a shared doc comment. There is no `s-phone-field`.
- `s-grid-item`'s `gridColumn`/`gridRow` are typed `"auto"` in the manifest but accept CSS grid line/span values.
- A few `PROPS-ONLY` entries surface as `undefined` — internal symbols, ignore.

### Dev-time console warnings are real and useful
Polaris logs `polaris: [node …] …` warnings:
- `The icon-only button with icon="delete" must also have an "accessibilityLabel" property.`
- `Table component is missing TableHeaderRow.`
- `accessibilityLabel is recommended when scroll-box is provided`
- `There may be multiple instances of the Page component…`

Keep the console open during the demo; these catch mistakes faster than reading.

### Versioning
Upstream channels: `polaris-1.js` = newest stable in the 1.x line, `polaris-1.0.js` = frozen, `polaris-1.1-rc.js` = release candidate, `polaris.js` = legacy unversioned. This app vendors a snapshot of `polaris-1.js` and loads it from `public/polaris/`; it never fetches any of them.

## The deprecation, stated once
`@shopify/polaris` (React) is archived as of 2026-08-11, frozen at 13.9.5. Do not install it, import it, copy its component names, or import its CSS. Everything is `s-*` custom elements from the vendored bundle.
