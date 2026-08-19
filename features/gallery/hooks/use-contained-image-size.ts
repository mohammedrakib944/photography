"use client";

import { useEffect, useState } from "react";

const VIEWPORT_MARGIN_DESKTOP = 48;
const VIEWPORT_MARGIN_MOBILE = 16;
const MOBILE_BREAKPOINT = 640;

// px kept clear around the whole dialog on each side — smaller on narrow
// screens, where the overlay's own padding is already tighter and every
// pixel of image real estate matters more.
function viewportMargin() {
  return window.innerWidth < MOBILE_BREAKPOINT ? VIEWPORT_MARGIN_MOBILE : VIEWPORT_MARGIN_DESKTOP;
}

function computeContainedSize(naturalWidth: number, naturalHeight: number, chromeHeight: number) {
  const margin = viewportMargin();
  const maxWidth = window.innerWidth - margin * 2;
  const maxHeight = window.innerHeight - margin * 2 - chromeHeight;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  return { width: naturalWidth * scale, height: naturalHeight * scale };
}

/**
 * Sizes an image at its own aspect ratio (never cropped, never stretched to
 * fill a fixed box) — scaled down only as far as needed to fit the viewport
 * minus whatever room the surrounding chrome is currently taking up, and
 * never scaled up past its natural resolution.
 */
export function useContainedImageSize(naturalWidth: number, naturalHeight: number, chromeHeight: number) {
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? { width: naturalWidth, height: naturalHeight }
      : computeContainedSize(naturalWidth, naturalHeight, chromeHeight)
  );

  useEffect(() => {
    function recalc() {
      setSize(computeContainedSize(naturalWidth, naturalHeight, chromeHeight));
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [naturalWidth, naturalHeight, chromeHeight]);

  return size;
}
