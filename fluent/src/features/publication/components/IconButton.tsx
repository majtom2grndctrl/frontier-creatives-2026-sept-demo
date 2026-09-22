import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import { Button, Tooltip } from '@fluentui/react-components'
import type { ButtonProps } from '@fluentui/react-components'

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  /** the glyph. Always decorative — the accessible name comes from `label`. */
  icon: ReactElement
  /** the accessible name (§10.4: every icon-only button has one). */
  label: string
  /**
   * Tooltip copy, when it should say more than the label. Defaults to the label.
   * Fluent's tooltip opens on focus as well as hover, so it is keyboard reachable.
   */
  tooltip?: string
  appearance?: ButtonProps['appearance']
  shape?: ButtonProps['shape']
  size?: ButtonProps['size']
  disabledFocusable?: boolean
}

/**
 * §10.4 — the one icon button behind the `⋯`, ↗ and header-cluster controls:
 * shared size, transparent resting background, subtle hover fill, the theme's
 * focus ring, an `aria-label` and a tooltip.
 *
 * Native button props and the ref pass through to the underlying `Button`, so it
 * can be wrapped in a `MenuTrigger` for the stub menus of §14.9.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, label, tooltip, appearance, ...rest }, ref) {
    const content = tooltip ?? label

    return (
      <Tooltip
        content={content}
        // when the tooltip only restates the label it *is* the label; when it says
        // something extra it describes instead, so the two are not read twice.
        relationship={content === label ? 'label' : 'description'}
        withArrow
        positioning="above"
      >
        <Button
          {...rest}
          ref={ref}
          appearance={appearance ?? 'subtle'}
          icon={icon}
          aria-label={label}
        />
      </Tooltip>
    )
  },
)
