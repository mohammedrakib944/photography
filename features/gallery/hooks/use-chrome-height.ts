"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Sums the current rendered height of a set of elements (e.g. the modal's
 * top/bottom chrome bars), re-measuring via ResizeObserver whenever their
 * content changes, and re-observing whenever `recalcKey` changes (e.g. a bar
 * that only renders for some items, like a multi-image nav bar, mounting or
 * unmounting).
 */
export function useChromeHeight(refs: Array<RefObject<HTMLElement | null>>, recalcKey: unknown) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const elements = refs.map((ref) => ref.current).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    function measure() {
      setHeight(elements.reduce((sum, el) => sum + (el.offsetHeight || 0), 0));
    }

    // ResizeObserver fires its callback once, asynchronously, right after
    // observe() starts for each target — that gives us the initial
    // measurement, so there's no need for a separate synchronous call here.
    const observer = new ResizeObserver(measure);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recalcKey]);

  return height;
}
