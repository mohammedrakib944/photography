"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Grows a list into view `pageSize` items at a time instead of mounting
 * everything up front — a sentinel ref is watched via IntersectionObserver
 * and pulls in another page once it scrolls near the viewport. Resets back
 * to the first page whenever the *identity* of `items` changes (e.g. a new
 * search/category), so a fresh result set doesn't inherit however far the
 * previous one had scrolled.
 */
export function usePaginatedList<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Adjusting state directly during render (rather than in an effect) is the
  // React-documented way to reset state when a dependency changes — it
  // avoids an extra effect-triggered render pass.
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setVisibleCount(pageSize);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageSize, items.length));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length, pageSize]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    sentinelRef,
  };
}
