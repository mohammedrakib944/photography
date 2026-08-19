"use client";

import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer, type ViewerImage } from "@/features/gallery/components/image-viewer-context";

const GRID_CLASS = "columns-1 gap-5 sm:columns-2 lg:columns-3";

function isModifiedClick(e: React.MouseEvent) {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/**
 * Renders each photo as a card. Returns a Fragment (no wrapper element) so it
 * can be dropped directly inside the masonry columns container.
 *
 * Clicking a card opens the shared ImageViewerModal in place (no URL change,
 * no navigation) — the href is kept so the image stays a real, crawlable,
 * right-click-able link, but a plain left click intercepts it via
 * preventDefault and opens the viewer instead.
 */
export function PhotoGrid({ images }: { images: ViewerImage[] }) {
  const { open } = useImageViewer();

  return (
    <>
      {images.map((img, index) => (
        <a
          key={img._id}
          href={`/work/${img.slug}`}
          onClick={(e) => {
            if (isModifiedClick(e)) return;
            e.preventDefault();
            open(images, index);
          }}
          className="group relative mb-5 block break-inside-avoid overflow-hidden rounded-2xl bg-muted ring-1 ring-black/[0.03] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)]"
        >
          <GalleryImage
            src={img.objectKey}
            width={img.width}
            height={img.height}
            alt={img.title ?? ""}
            style={{ width: "100%", height: "auto", display: "block" }}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {img.title && (
              <p className="font-heading text-base font-light tracking-wide text-white">{img.title}</p>
            )}
            {(img.location || img.category?.name) && (
              <p className="text-xs tracking-[0.08em] text-white/75 uppercase">
                {[img.location, img.category?.name].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </a>
      ))}
    </>
  );
}

export { GRID_CLASS as photoGridClassName };
