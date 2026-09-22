# Component and token map

Which component solves which problem, and what each ramp step means.

## Components by use case

| Need | Use |
| --- | --- |
| Primary call to action | `Button appearance="primary"` |
| Secondary emphasis action | Tonal fill — `colorBrandBackground2` behind `colorBrandForeground2` text |
| Icon-only action | `Button appearance="subtle"` inside a `Tooltip`, always with `aria-label` |
| Label and caret opening a menu, as one control | `MenuButton` inside `MenuTrigger` |
| Overflow or contextual actions | `Menu` + `MenuTrigger` + `MenuPopover` |
| Transient panel — share sheet, detail popover | `Popover trapFocus` |
| Off-canvas navigation on narrow screens | `OverlayDrawer` |
| One of a few options | `Select` |
| One of many, or filtering | `Dropdown` or `Combobox` |
| Tabs holding text and an icon | `TabList` + `Tab` |
| Tabs holding a control or a description list | Hand-roll the strip; `Tab`'s root is a `<button>`. See `fluent-v9-notes.md`. |
| Person or publication identity | `Avatar` |
| Hairline rule | `Divider`, or a `colorNeutralStroke2` border |
| Status label | `Badge` |
| Section container | `Card` |

Two of those are local rather than Fluent. `features/publication/components/Card` is a plain container, because Fluent's `Card` is a selectable surface with fixed padding and cannot give a heading band above a divider or an unpadded scrolling body. `Chip` exists for the square-cornered status label the dashboard uses; reach for Fluent's `Badge` first and only fall back to `Chip` when the shape has to differ.

## Type ramp

Five steps carry a whole screen. Adding a sixth means two of them are doing the same job.

| Role | Component |
| --- | --- |
| Page title | `Title3` |
| Section heading | `Subtitle1` |
| Display numeral — metric values only | `LargeTitle` or `Display` |
| Body — nav rows, post titles, table rows | `Body1` |
| Micro — meta lines, labels, watermarks | `Caption1` |

## Color roles

| Role | Token |
| --- | --- |
| Recessed surface — app background, sidebars, resting strips | `colorNeutralBackground3` |
| Raised surface — content panes, cards, selected segments | `colorNeutralBackground1` |
| Hairline — borders, dividers, plot rules | `colorNeutralStroke2` |
| Primary text — titles, headings, values | `colorNeutralForeground1` |
| Secondary text — nav and field labels | `colorNeutralForeground2` |
| Tertiary text — meta lines, captions, watermarks | `colorNeutralForeground3` |
| Accent solid — primary fills, chart stroke, selection indicators | `colorBrandBackground` |
| Accent tonal, and text on it | `colorBrandBackground2`, `colorBrandForeground2` |
| Positive status, and text on it | `colorPaletteGreenBackground1`, `colorPaletteGreenForeground1` |
| Selected row | `colorSubtleBackgroundSelected` |
| Chip and placeholder fill | `colorNeutralBackground4` |

## Spacing and radius

Spacing runs `XXS` to `XXXL` on both axes as `spacingHorizontal*` and `spacingVertical*`. Roomy screens sit at `L` to `XXL`; dense tables sit at `S` to `M`. Radius is `borderRadiusSmall` for chips and pills, `borderRadiusMedium` for cards, buttons and thumbnails, `borderRadiusCircular` for avatars only.
