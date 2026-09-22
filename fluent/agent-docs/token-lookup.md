# Design token lookup

How to replace a hardcoded css value with the Fluent token that matches it.

## Finding the token

1. Categorise the value: hex or rgb is a color, px and rem are spacing, font size, border radius or stroke width, a bare 400 to 700 is a font weight, ms is a duration, cubic-bezier is a curve.

2. Grep the raw value in `tokens/tokens-src/global/` to find its scale name — `colors.ts`, `spacings.ts`, `fonts.ts`, `borderRadius.ts`, `strokeWidths.ts`, `curves.ts`, `durations.ts`, `typographyStyles.ts`.

3. Grep that scale name in `tokens/tokens-src/alias/lightColor.ts` to find the semantic token pointing at it. Semantic tokens are the ones to use — they follow the theme, raw scale values do not. `colorNeutralBackground1` is `#ffffff` in the light theme and `#292929` in the dark one; the literal `#ffffff` is white in both.

4. `theme/theme-library/` shows how the alias layer composes into `webLightTheme`, `webDarkTheme` and the high-contrast themes.

## Using it

Tokens come from the component package, not the theme package:

```tsx
import { tokens } from '@fluentui/react-components'

// instead of color: '#0078d4'
color: tokens.colorBrandBackground
```

This works in griffel `makeStyles` and in emotion alike, because `tokens.*` resolves to a css custom property rather than a value.

## Common mappings

| Hardcoded | Token |
| --- | --- |
| `#0078d4` | `tokens.colorBrandBackground` |
| `#242424` | `tokens.colorNeutralForeground1` |
| `#ffffff` | `tokens.colorNeutralBackground1` |
| `4px` radius | `tokens.borderRadiusMedium` |
| `8px` spacing | `tokens.spacingHorizontalS` or `tokens.spacingVerticalS` |
| `14px` font size | `tokens.fontSizeBase300` |
| `600` font weight | `tokens.fontWeightSemibold` |

When nothing matches exactly, take the nearest semantic token rather than keeping the literal. Being one step off the scale costs less than being off-theme in dark mode.
