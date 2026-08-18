"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoGrid, photoGridClassName } from "@/components/gallery/photo-grid";
import { ScrollReveal } from "@/components/scroll-reveal";
import type { ViewerImage } from "@/components/gallery/image-viewer-context";

type CategoryItem = { _id: string; name: string; slug: string };

/**
 * Shared search + category-filter + masonry grid. Category filtering is
 * URL-driven (?category=) when `urlSyncCategory` is set (used on /work, so
 * filtered views are shareable links); search is always local state — it's a
 * client-side filter over already-loaded images, not worth round-tripping.
 */
export function GalleryExplorer({
  images,
  categories,
  urlSyncCategory = false,
  activeCategory,
}: {
  images: ViewerImage[];
  categories: CategoryItem[];
  urlSyncCategory?: boolean;
  activeCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [localCategory, setLocalCategory] = useState<string | undefined>(undefined);

  const categoryFilter = urlSyncCategory ? activeCategory : localCategory;

  const visibleImages = useMemo(() => {
    let result = images;
    if (categoryFilter) {
      result = result.filter((img) => img.category?.slug === categoryFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (img) =>
          img.title?.toLowerCase().includes(q) ||
          img.description?.toLowerCase().includes(q) ||
          img.location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [images, categoryFilter, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos by title, description, or location…"
            className="w-full rounded-full border border-border bg-background py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-foreground"
          />
        </div>

        <nav className="flex flex-wrap gap-2">
          {urlSyncCategory ? (
            <>
              <Link
                href="/work"
                className={cn(
                  "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted",
                  !activeCategory && "border-foreground bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/work?category=${c.slug}`}
                  className={cn(
                    "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted",
                    activeCategory === c.slug && "border-foreground bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLocalCategory(undefined)}
                className={cn(
                  "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted",
                  !localCategory && "border-foreground bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setLocalCategory(c.slug)}
                  className={cn(
                    "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted",
                    localCategory === c.slug && "border-foreground bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="min-h-[60vh]">
        {visibleImages.length > 0 ? (
          <ScrollReveal className={photoGridClassName}>
            <PhotoGrid images={visibleImages} />
          </ScrollReveal>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No photos match your search.
          </p>
        )}
      </div>
    </div>
  );
}
