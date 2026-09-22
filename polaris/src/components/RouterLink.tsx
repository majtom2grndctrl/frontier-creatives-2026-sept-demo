// A Polaris anchor that navigates through react-router.
//
// A real anchor, so the browser's own link affordances (middle-click,
// cmd-click, "copy link address", the status-bar preview) all work, with
// `useLinkClickHandler` supplying exactly the click behaviour react-router's own
// `Link` has — it routes a plain left-click and leaves a modified or middle
// click to the browser.
//
// `s-link` is accent-coloured at every `tone` (`neutral` does not mute it), so
// tone cannot mute a link: `appearance="muted"` swaps in `s-clickable` — also an
// anchor — carrying subdued content. That is how the harness switcher tells its
// current entry from the rest. Neither element exposes `aria-*` in its typed
// surface, and the role each names lives on an anchor inside its shadow DOM
// where an `aria-current` on the host would not reach it anyway, so state is
// announced through `accessibilityLabel` and the markup marker belongs on a
// wrapping `<li>`, the same as the profile demo's year rail.

import type { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from "react";
import { useHref, useLinkClickHandler } from "react-router";

export function RouterLink({
  to,
  appearance = "link",
  accessibilityLabel,
  children,
}: {
  to: string;
  appearance?: "link" | "muted";
  accessibilityLabel?: string;
  children: ReactNode;
}): ReactElement {
  const href = useHref(to);
  const handleClick = useLinkClickHandler<HTMLElement>(to);

  // Polaris types a component's `onClick` as a bare DOM `Event`; React still
  // delivers its own synthetic mouse event, which is what the handler reads the
  // modifier keys and button off.
  const onClick = (event: Event) =>
    handleClick(event as unknown as ReactMouseEvent<HTMLElement>);

  if (appearance === "muted") {
    return (
      <s-clickable href={href} onClick={onClick} accessibilityLabel={accessibilityLabel}>
        {typeof children === "string" ? <s-text color="subdued">{children}</s-text> : children}
      </s-clickable>
    );
  }

  return (
    <s-link href={href} onClick={onClick} accessibilityLabel={accessibilityLabel}>
      {children}
    </s-link>
  );
}
