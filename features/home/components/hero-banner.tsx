"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEntranceStagger } from "@/features/home/hooks/use-entrance-stagger";
import { InstagramIcon } from "@/features/home/components/instagram-icon";
import { FeaturedMosaic, type ViewerImage } from "@/features/gallery";

export function HeroBanner({
  siteName,
  tagline,
  instagramUrl,
  featuredImages = [],
}: {
  siteName: string;
  tagline?: string;
  instagramUrl?: string;
  featuredImages?: ViewerImage[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEntranceStagger(ref, reducedMotion);

  return (
    <section className="bg-background pt-28 pb-14 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20">
      <div className="site-container grid items-center gap-10 md:grid-cols-2 md:gap-12">
        <div
          ref={ref}
          className="flex flex-col items-center gap-6 text-center md:items-start md:text-left"
        >
          <span className="h-px w-10 bg-foreground/30 md:self-start" />
          <h1 className="font-heading text-4xl leading-[1.1] font-light tracking-tight sm:text-5xl md:text-7xl md:leading-[1.05]">
            {siteName}
          </h1>
          {tagline && (
            <p className="max-w-md text-base text-muted-foreground md:text-lg">{tagline}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <Link
              href="#gallery"
              className="flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)]"
            >
              Explore the gallery
            </Link>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-muted"
              >
                <InstagramIcon className="size-4.5" />
              </a>
            )}
          </div>
        </div>

        {featuredImages.length > 0 && (
          <div className="flex flex-col items-center gap-5 md:order-last">
            <div className="flex items-center gap-3">
              <span className="h-px w-6 bg-border" />
              <p className="font-heading text-xs font-light tracking-[0.3em] text-muted-foreground uppercase">
                Featured
              </p>
              <span className="h-px w-6 bg-border" />
            </div>
            <FeaturedMosaic images={featuredImages} />
          </div>
        )}
      </div>
    </section>
  );
}
