// The harness index — the one screen that belongs to the gallery rather than to
// a demo. It lists every prototype built in this project and links to it.
//
// This screen owns the app's single `s-page`: it mounts only when no demo does,
// so the publication dashboard still gets its own when it is the active route.

import type { ReactElement } from "react";
import { PROTOTYPES } from "@/prototypes";
import { RouterLink } from "@/components/RouterLink";

export function PrototypeIndex(): ReactElement {
  return (
    <s-page heading="Polaris web components" inlineSize="small">
      <s-stack gap="large">
        <s-paragraph color="subdued">
          The same two build specs, implemented against Shopify&rsquo;s Polaris web
          components. Each prototype is its own product with its own chrome — only
          this index is shared.
        </s-paragraph>

        <nav aria-label="Prototypes">
          <ul style={{ display: "contents", listStyle: "none", margin: 0, padding: 0 }}>
            <s-stack gap="base">
              {PROTOTYPES.map((prototype) => (
                <li key={prototype.path}>
                  <s-section heading={prototype.name}>
                    <s-stack gap="small-100" alignItems="start">
                      <s-paragraph color="subdued">{prototype.description}</s-paragraph>
                      <RouterLink to={prototype.path}>
                        Open {prototype.name}
                      </RouterLink>
                    </s-stack>
                  </s-section>
                </li>
              ))}
            </s-stack>
          </ul>
        </nav>
      </s-stack>
    </s-page>
  );
}
