"use client";

import { useEffect, useState } from "react";

/**
 * Whether the page has been scrolled past `threshold` px — used to
 * intensify the fixed nav's background/blur once content starts sliding
 * underneath it.
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
