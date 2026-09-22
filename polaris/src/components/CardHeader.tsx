// The attached heading band (spec §5.1): heading inside the card, a trailing
// text link on the right, a hairline divider under it. The link is deliberately
// tertiary — these are secondary actions, not the card's primary one.

import type { ReactNode } from "react";

export function CardHeader({
  heading,
  linkLabel,
  commandFor,
}: {
  heading: string;
  linkLabel: string;
  commandFor: string;
}) {
  return (
    <>
      <s-box padding="base">
        <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
          <s-heading>{heading}</s-heading>
          <s-button variant="tertiary" commandFor={commandFor}>
            {linkLabel}
          </s-button>
        </s-stack>
      </s-box>
      <s-divider />
    </>
  );
}

/** Every header link and ⋯ menu opens something; none of them is a silent no-op. */
export function StubPopover({ id, children }: { id: string; children: ReactNode }) {
  return (
    <s-popover id={id}>
      <s-box padding="base" maxInlineSize="0">
        <s-paragraph>{children}</s-paragraph>
      </s-box>
    </s-popover>
  );
}
