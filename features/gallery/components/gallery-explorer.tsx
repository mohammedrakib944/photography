"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoGrid, photoGridClassName } from "@/features/gallery/components/photo-grid";
import type { ViewerImage } from "@/features/gallery/components/image-viewer-context";

type CategoryItem = { _id: string; name: string; slug: string };

/**
 * Shared search + category-filter + masonry grid — a client-side filter over
 * already-loaded images. The results area keeps a generous min-height so the
 * search bar and category pills above it never shift position when a filter
 * narrows the results down to few (or zero) photos.
 */
export function GalleryExplorer({
  images,
  categories,
}: {
  images: ViewerImage[];
  categories: CategoryItem[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);

  const visibleImages = useMemo(() => {
    let result = images;
    if (category) {
      result = result.filter((img) => img.category?.slug === category);
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
  }, [images, category, query]);

  return (
    <div>
      <div className="mb-8 flex w-full flex-col items-start gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            className="w-full rounded-full border border-border bg-background py-2.5 pr-4 pl-10 text-sm shadow-sm outline-none transition-all focus:border-foreground/40 focus:shadow-md"
          />
        </div>

        <nav className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-sm transition-all duration-200 hover:border-foreground/30",
              !category &&
                "border-foreground bg-foreground text-background shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] hover:bg-foreground/90"
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full border border-border px-4 py-1.5 text-sm transition-all duration-200 hover:border-foreground/30",
                category === c.slug &&
                  "border-foreground bg-foreground text-background shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] hover:bg-foreground/90"
              )}
            >
              {c.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[70vh]">
        {visibleImages.length > 0 ? (
          <div className={photoGridClassName}>
            <PhotoGrid images={visibleImages} />
          </div>
        ) : (
          <p className="w-full rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No photos match your search.
          </p>
        )}
      </div>
    </div>
  );
}
