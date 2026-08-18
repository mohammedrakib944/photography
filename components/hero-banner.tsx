"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroBanner({ siteName, tagline }: { siteName: string; tagline?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reducedMotion) return;
    gsap.fromTo(
      ref.current.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }
    );
  }, [reducedMotion]);

  return (
    <section className="border-b border-border bg-background pt-32 pb-16 text-center md:pt-40 md:pb-20">
      <div ref={ref} className="site-container flex flex-col items-center gap-5">
        <h1 className="font-heading text-4xl font-light tracking-wide md:text-6xl">{siteName}</h1>
        {tagline && <p className="max-w-xl text-base text-muted-foreground md:text-lg">{tagline}</p>}
        <Link
          href="/work"
          className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Explore the gallery
        </Link>
      </div>
    </section>
  );
}
