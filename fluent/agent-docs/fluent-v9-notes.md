# Fluent v9 notes

Behaviour the api does not make obvious.

## Tokens are css custom properties

`tokens.colorNeutralForeground1` compiles to `var(--colorNeutralForeground1)`, not to a color. The same token therefore works unchanged in griffel `makeStyles` and in emotion, and emotion needs no `ThemeProvider`. Do not add one.

## FluentProvider scopes its variables

`FluentProvider` writes those custom properties onto its own element. Nothing outside it — `body`, `html` — can see them. To paint the page background, read the value off the theme object instead:

```tsx
const theme = mode === 'dark' ? webDarkTheme : webLightTheme
// theme.colorNeutralBackground1 is a real color; tokens.* is a var() reference
```

Skip this and the body keeps its default margin and white background, which shows as a pale gutter around the app in dark mode.

## Recessed and raised surfaces

Fluent has no `recessed` token. Use the neutral background scale:

| Role | Token |
| --- | --- |
| Recessed — app background, sidebars, resting strips | `colorNeutralBackground3` |
| Raised — content panes, cards, selected segments | `colorNeutralBackground1` |

The pair inverts on its own: `#f5f5f5` under `#ffffff` in light, `#141414` under `#292929` in dark. Raised stays the brighter surface in both themes, so never swap them by hand for dark mode.

## Tab renders a button

`TabList`'s root is a `<div>`, but `Tab`'s root slot is `<button>`. Nothing interactive or flow-level may sit inside a tab — no nested button, no link, no `<dl>`.

Use `TabList` whenever a tab holds text and an icon. When a tab needs its own control or a description list, hand-roll the strip and implement the pattern directly: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`, and Left/Right/Home/End.

## Where literal values are correct

Fluent tokenises color, spacing, radius, typography, stroke and motion. It does not tokenise layout. Literal px is right for layout breakpoints and for component intrinsic sizes — rail widths, thumbnail dimensions, chart geometry. Comment them in place so they do not read as token violations.
