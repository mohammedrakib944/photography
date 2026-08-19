"use client";

import { useMemo } from "react";
import type { ViewerImage } from "@/features/gallery/components/image-viewer-context";

/**
 * Client-side search + category filter over an already-loaded image list.
 */
export function useGalleryFilter(images: ViewerImage[], category: string | undefined, query: string) {
  return useMemo(() => {
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
}
