// The demo harness.
//
// This repo is a gallery, not a product: each demo is a whole *site* built on
// Polaris web components, with its own chrome, its own navigation and its own
// spec. The switcher below is the only thing they share — a slim strip that
// belongs to the harness, sits outside every demo's own frame, and owns the
// single scroll container so each demo can assume the document scrolls as one.
//
// Each demo is a route, so a demo is addressable: /publication and /profile are
// the URLs, and the switcher only moves between them and the index at /. Only
// one demo mounts at a time, which is what keeps the "one `s-page` per app"
// rule true — the index owns one, the publication dashboard owns one, the
// developer profile uses none.

import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router";
import { RouterLink } from "@/components/RouterLink";
import { PROTOTYPES } from "@/prototypes";
import "@/profile.css";

export default function App(): ReactElement {
  const { pathname } = useLocation();

  return (
    <div className="demo-root">
      <div className="demo-switcher">
        <s-box background="strong" padding="small-300 base">
          <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-icon type="sandbox" size="small" color="subdued" />
              <s-text color="subdued">Frontier Creatives demo</s-text>
            </s-stack>

            <nav aria-label="Prototypes">
              {/* `display: contents` keeps real list semantics without adding a
                  second flex context on top of the stack's own row layout. The
                  `<li>`s below stay real boxes, though: `s-clickable` renders a
                  block-level anchor, and with the list item's own box gone that
                  anchor fills the row and pushes its sibling onto a second line
                  (`s-stack` wraps). */}
              <ul style={{ display: "contents", listStyle: "none", margin: 0, padding: 0 }}>
                <s-stack direction="inline" gap="base" alignItems="center">
                  <li aria-current={pathname === "/" ? "page" : undefined}>
                    <RouterLink
                      to="/"
                      appearance={pathname === "/" ? "link" : "muted"}
                      accessibilityLabel={pathname === "/" ? "Index, current page" : undefined}
                    >
                      Index
                    </RouterLink>
                  </li>
                  {PROTOTYPES.map((prototype) => (
                    <li
                      key={prototype.path}
                      aria-current={pathname === prototype.path ? "page" : undefined}
                    >
                      <RouterLink
                        to={prototype.path}
                        appearance={pathname === prototype.path ? "link" : "muted"}
                        accessibilityLabel={
                          pathname === prototype.path
                            ? `${prototype.name}, current prototype`
                            : undefined
                        }
                      >
                        {prototype.name}
                      </RouterLink>
                    </li>
                  ))}
                </s-stack>
              </ul>
            </nav>
          </s-stack>
        </s-box>
      </div>

      <div className="demo-stage">
        <Outlet />
      </div>
    </div>
  );
}
