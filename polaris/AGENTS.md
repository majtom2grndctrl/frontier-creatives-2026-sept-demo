# Agent instructions — Polaris web components (Frontier Creatives demo)

You're building a UI with **Shopify Polaris web components** for a live demo. It runs standalone on localhost — no Shopify Admin, no App Bridge, no store.

## Reference docs in this folder

- `components.md` — all 59 `s-*` elements: attributes, types, slots, events, tokens
- `use-cases.md` — **read this first.** "I need to build X" → which components, with working markup
- `gaps.md` — what Polaris React had that this doesn't, and the substitute for each
- `icons.txt` — all 515 valid `s-icon` names. Grep it; don't guess.
- `cem-reference.txt` — machine-generated dump of every element's attributes/slots/events, from `@shopify/polaris-types@1.0.7`'s Custom Elements Manifest. The authority when the prose docs and this disagree.

## Loading — already wired, do not change

The components are **vendored locally** so the demo survives dead venue wifi. `index.html` already loads them, in this order:

```html
<link rel="stylesheet" href="/fonts/inter/styles.css" />
<script src="/polaris/local-font-shim.js"></script>
<script src="/polaris/local-icon-shim.js"></script>
<script src="/polaris/polaris-1.js"></script>
```

No provider component. No CSS import. No npm package for the components themselves. No CDN.

**Do not repoint any of this at `cdn.shopify.com`.** That's where the bundle came
from, but this app must make zero network requests at runtime. Three rules keep
that true:

- Both shims **must** load before `polaris-1.js`. `local-font-shim.js` rewrites
  the hardcoded `<link>` the bundle injects for Shopify's Inter stylesheet;
  `local-icon-shim.js` rewrites the CDN prefix `<s-icon>` fetches each SVG from.
  Reorder them and the demo hits the network.
- Never edit `public/polaris/polaris-1.js`. It's a byte-exact vendored artifact
  with a recorded checksum (see `README.md`). Intercept around it, never patch it.
- Icon SVGs are served from `public/polaris/admin-ui-foundations/`. Don't add an
  icon by URL.

## Package manager

**Use `pnpm` for everything — installs, dev server, adding packages, running scripts. Do not use `npm` or `yarn`.**

## Hard rules

- **Never install or import `@shopify/polaris`.** The React library is deprecated and archived (frozen at 13.9.5, 2026-08-11). No `<Card>`, no `<Page>`, no `@shopify/polaris/build/esm/styles.css`.
- **Never add Tailwind, Bootstrap, or any CSS framework.** Not a utility class, not a reset, not a "just for layout" exception.
- **Never write custom CSS to restyle a Polaris component.** They're shadow DOM with no exposed parts — it won't work, and the attempt costs demo time. Appearance comes from props.
- **Never reach for App Bridge.** `window.shopify` is `undefined` here. `shopify.toast`, resource pickers, session tokens, and Admin GraphQL do not exist. `s-title-bar`, `s-save-bar`, and `s-nav-menu` are **not registered** and render as inert unknown elements with no error.
- **Only the 59 elements in `components.md` exist.** If you're unsure an element is real, check the file. `s-card`, `s-form`, `s-data-table`, `s-index-table`, `s-resource-list`, `s-tabs`, `s-pagination`, `s-toast`, `s-empty-state` do **not** exist.

## Use the design system, not raw values

- **Spacing:** use the scale on `gap` / `padding` — `none small-500 small-400 small-300 small-200 small-100 small base large large-100 large-200 large-300 large-400 large-500`. Never `padding="16px"` or `style="margin: 1rem"`.
- **Radius / border:** `borderRadius="base"`, `border="base"`. Never a hex or px.
- **Tone** carries meaning (`info success caution warning critical neutral auto`); **color** carries intensity (`subdued base strong`). Use `tone` when the color means something; `color="subdued"` to de-emphasize. Never a literal color anywhere.
- **Responsive:** wrap in `<s-query-container>` and use `@container (inline-size > 500px) large, small` value strings. No media queries of your own.

## Structure

- One `<s-page>` per app. Its `heading` is the `<h1>`; actions go in the `primary-action` / `secondary-actions` / `breadcrumb-actions` slots.
- `<s-section>` is the card. Nest it for subsections — the nesting depth drives both the visual weight *and* the heading level.
- `<s-heading>` levels itself from `s-section` nesting depth. There is no `level` prop; don't try to set one.
- Layout with `<s-stack>` first, `<s-grid>` when you genuinely need two dimensions, `<s-box>` when you need a styled container with no semantics.
- **Slot attributes are always kebab-case**: `slot="primary-action"`, `slot="secondary-actions"`, `slot="breadcrumb-actions"`. `slot="primaryAction"` renders nothing, silently.

## Semantics and accessibility

- Prefer the semantic element over a styled generic: `s-heading` not `s-text`, `s-link` for navigation, `s-button` for actions, `s-paragraph` for body copy.
- Forms are a native `<form>`. Every field takes `label` — always supply it. To hide it visually, `labelAccessibilityVisibility="exclusive"`; don't drop it.
- Icon-only buttons **require** `accessibilityLabel`. Polaris warns in the console if you forget.
- Field errors: set the `error` property to a message string. `required` alone shows nothing.
- Use `<s-clickable>` rather than an `onclick` on a `<div>`.

## Attribute vs property spelling

- HTML: lowercase attributes (`accessibilitylabel`, `commandfor`).
- JSX: camelCase props (`accessibilityLabel`, `commandFor`, `labelAccessibilityVisibility`).
- Events in JSX are `onClick` / `onChange` / `onInput`; the wrapper maps them to `addEventListener`.
- Types are **already installed and wired** (`@shopify/polaris-types@1.0.7`, listed in tsconfig `types`). JSX props are genuinely validated — a bogus attribute or a nonexistent element is a compile error, so trust `pnpm typecheck`.

## Overlays

Wire by `id`, not by state. `commandFor` + `command="--show" | "--hide" | "--toggle"` for `s-modal`, `s-popover`, `s-menu`. `interestFor` for `s-tooltip`. All four work standalone.

## When you hit something Polaris doesn't have

Check `gaps.md` for the sanctioned substitute and compose it from existing elements. Do **not** solve it by adding a dependency or a stylesheet.

## Writing style

Sentence case for all copy, comments, and headings.

Docs you write or edit in this folder follow two rules:

- **Direct and brief.** No filler, no hedging, no restated context, no flowery language or unnecessary jargon. Prefer a table or a tight bullet to a paragraph. Cut words, never facts — attribute names, gotchas, token values, and worked markup are the point.
- **Seamless.** Each doc reads as one coherent artifact written in a single pass. No trace of its edit history: no "updated", "note:", "as mentioned above", "(new)", "previously", "verified", changelog asides, or anything addressed to a reviewer instead of the next reader.

## Watch the console

Polaris logs `polaris: [node …]` warnings for real mistakes — missing accessibility labels, a table without a header row, more than one `s-page`. Keep the console open; they catch mistakes faster than reading.
