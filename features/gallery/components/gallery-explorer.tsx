"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PhotoGrid,
  photoGridClassName,
} from "@/features/gallery/components/photo-grid";
import { useGalleryFilter } from "@/features/gallery/hooks/use-gallery-filter";
import { usePaginatedList } from "@/features/gallery/hooks/use-paginated-list";
import type { ViewerImage } from "@/features/gallery/components/image-viewer-context";

type CategoryItem = { _id: string; name: string; slug: string };

const PAGE_SIZE = 20;

/**
 * Shared search + category-filter + masonry grid — a client-side filter over
 * already-loaded images. The results area keeps a generous min-height so the
 * search bar and category pills above it never shift position when a filter
 * narrows the results down to few (or zero) photos.
 *
 * Only 20 photos are ever mounted at once, growing as the sentinel below the
 * grid scrolls into view — see `usePaginatedList`.
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

  const filteredImages = useGalleryFilter(images, category, query);
  const { visibleItems: visibleImages, hasMore, sentinelRef } = usePaginatedList(filteredImages, PAGE_SIZE);

  return (
    <div>
      <div className="mb-8 flex w-full flex-col items-center gap-4">
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
          <>
            <div className={photoGridClassName}>
              <PhotoGrid images={visibleImages} allImages={filteredImages} />
            </div>
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-10">
                <span className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
                  Loading more…
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="w-full rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No photos match your search.
          </p>
        )}
      </div>
    </div>
  );
}
