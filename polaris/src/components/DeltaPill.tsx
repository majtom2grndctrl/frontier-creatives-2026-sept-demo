// Period-over-period delta (spec §6.2). The arrow glyph and a spelled-out
// "up"/"down" carry direction, so the pill never relies on its tint alone.

import { formatDeltaPct } from "@/lib/format";

export function DeltaPill({ deltaPct }: { deltaPct: number }) {
  const rising = deltaPct >= 0;

  return (
    <s-badge tone={rising ? "success" : "critical"} icon={rising ? "arrow-up" : "arrow-down"}>
      <s-text accessibilityVisibility="exclusive">{rising ? "up " : "down "}</s-text>
      {formatDeltaPct(Math.abs(deltaPct))}
    </s-badge>
  );
}
