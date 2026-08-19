"use client";

import { useEffect } from "react";

/**
 * Escape/Arrow-key navigation for the image viewer, plus locking page scroll
 * while it's open. Only active while `active` is true (i.e. an image is
 * actually open).
 */
export function useModalKeyboardNav(
  active: boolean,
  handlers: { close: () => void; next: () => void; prev: () => void }
) {
  const { close, next, prev } = handlers;

  useEffect(() => {
    if (!active) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);
}
