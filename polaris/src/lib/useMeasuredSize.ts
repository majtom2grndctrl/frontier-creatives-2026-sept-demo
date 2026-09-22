// Polaris hosts are `display: contents`, so `getBoundingClientRect()` on one
// returns zeros. Anything that needs a real measurement observes a plain element
// instead — the workaround `gaps.md` prescribes.

import { useEffect, useRef, useState } from "react";

export function useMeasuredSize<T extends HTMLElement>(fallback = { width: 0, height: 0 }) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(fallback);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const rect = entry?.contentRect;
      if (!rect) return;
      setSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
