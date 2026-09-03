# polaris

Frontier Creatives 2026 demo — Shopify Polaris.

Vite + React 19 + TypeScript. Runs entirely offline: every Polaris asset is
vendored, and the app makes zero network requests at runtime.

```
pnpm install
pnpm dev          # http://localhost:5173
```

`pnpm build` · `pnpm preview` · `pnpm typecheck` · `pnpm lint`

Agent instructions are in `AGENTS.md`; component reference is in `agent-docs/`.

## Why there is no Shopify CLI scaffold here

Two upstream facts shaped this app.

**Polaris React is deprecated.** `@shopify/polaris` carries an npm deprecation
flag, is frozen at 13.9.5 (2025-03-26), and `Shopify/polaris-react` was archived
on 2026-08-11. Current Polaris is a set of web components delivered as one
script. There is no React package to install and no `AppProvider` to wrap.

**`shopify app init` needs a Shopify account.** It scaffolds a React Router app
that requires a Partner login, a development store, OAuth, and a Cloudflare
tunnel before it renders anything. That is the right path for a real embedded
app and the wrong one for a local demo.

The web components themselves need none of that. They register from a plain
script tag and render fully styled on localhost, with real shadow DOM and
self-contained styles. Modals, popovers, menus and tooltips work too — they use
native `<dialog>`, the popover API, and the `command`/`commandFor` invoker
pattern with a bundled polyfill.

What does *not* work outside the Shopify Admin is anything backed by App Bridge:
`window.shopify` is undefined, so `shopify.toast`, resource pickers, session
tokens and Admin GraphQL are unavailable, and `s-title-bar`, `s-save-bar` and
`s-nav-menu` are never registered. They fail silently rather than erroring.

## Vendored assets

Downloaded 2026-09-03 from Shopify's CDN into `public/`. Shopify publishes no
license or version metadata with these files; the only build marker is the hash
comment at the top of the bundle.

| Asset | Source | Local path | Size |
|---|---|---|---|
| Component bundle | `cdn.shopify.com/shopifycloud/polaris-1.js` | `public/polaris/polaris-1.js` | 504,626 B |
| Icons (515 public + 111 internal) | `cdn.shopify.com/shopifycloud/admin-ui-foundations/{icons,internal-only}/<hash>.svg` | `public/polaris/admin-ui-foundations/` | 625 files, 452,043 B |
| Inter webfont | `cdn.shopify.com/static/fonts/inter/v4/styles.css` + 7 woff2 subsets | `public/fonts/inter/` | 221,094 B |

- Bundle build marker: `5ff803d5f82b5b8a4238acb189bfebec198906dc`
- Bundle SHA-256: `2e432210f94cf5e28a48a9236740ff9fe609e43e54dec8f3b4810008df0ac55f`
- Font asset fingerprint: `1751944278923`
- Registers 59 `s-*` elements. No `s-card`, `s-data-table`, `s-index-table` or
  `s-resource-list` — see `agent-docs/gaps.md`.

`polaris-1.js` is served with `Cache-Control: max-age=60` and carries no version
in its filename, so upstream moves continuously. The vendored copy is a
point-in-time snapshot and will drift from live within days. That is the
intended tradeoff: a frozen, verified bundle cannot break mid-demo.

## How the offline guarantee works

The bundle reaches for the network in two places, neither of which is
configurable. Two shims intercept it, and both must load before `polaris-1.js`:

- **`local-font-shim.js`** — on load the bundle appends a `<link>` to Shopify's
  Inter stylesheet. The shim wraps `document.head.appendChild` for exactly that
  one href, then restores the native method.
- **`local-icon-shim.js`** — `<s-icon>` lazily `fetch`es each icon from a
  hardcoded CDN prefix, and asserts that prefix immediately before fetching, so
  the URL map cannot be repointed. The shim wraps `window.fetch` and rewrites
  that one prefix to the local mirror. It stays installed, since icons load for
  the life of the page; every other request passes through untouched.

`public/polaris/polaris-1.js` is a byte-exact copy and must stay that way — the
checksum above is what makes it re-verifiable. Intercept around it, never patch
it.

Verified with all 515 public icons rendered on one page: 515/515 drew, and every
request in the resource-timing log resolved to localhost.

## Type checking

`@shopify/polaris-types@1.0.7` is a dev dependency wired through tsconfig
`types`. JSX props are genuinely validated — `<s-card>` and misspelled
attributes are compile errors.

Two cautions:

- The package tracks a newer bundle than the one vendored here. Its icon union
  lists ~42 icons this build does not have, which is why
  `agent-docs/icons.txt` is generated from the bundle instead.
- Vite's React-TS template ships a solution-style root `tsconfig.json`
  (`"files": []` plus `references`), under which `tsc --noEmit` checks nothing
  and exits 0. This app uses a single flat config so `pnpm typecheck` is real.
