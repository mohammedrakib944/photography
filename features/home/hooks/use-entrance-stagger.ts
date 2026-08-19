"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/**
 * Fades + translates up the direct children of `ref` in a staggered
 * sequence as soon as they mount (unlike `ScrollReveal`, which waits for
 * scroll-into-view — this is for above-the-fold content like the hero).
 * Skipped entirely under prefers-reduced-motion.
 */
export function useEntranceStagger(ref: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    if (!ref.current || reducedMotion) return;
    gsap.fromTo(
      ref.current.children,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 }
    );
  }, [ref, reducedMotion]);
}
