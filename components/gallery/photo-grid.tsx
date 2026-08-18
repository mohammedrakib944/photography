"use client";

import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer, type ViewerImage } from "@/components/gallery/image-viewer-context";

const GRID_CLASS = "columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4";

function isModifiedClick(e: React.MouseEvent) {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/**
 * Renders each photo as a card. Returns a Fragment (no wrapper element) so it
 * can be dropped directly inside a ScrollReveal container, whose stagger
 * animation needs direct DOM access to each card.
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
          className="group relative mb-5 block break-inside-avoid overflow-hidden rounded-xl bg-muted shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <GalleryImage
            src={img.objectKey}
            width={img.width}
            height={img.height}
            alt={img.title ?? ""}
            style={{ width: "100%", height: "auto", display: "block" }}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {img.title && <p className="p-4 text-sm font-medium text-white">{img.title}</p>}
          </div>
        </a>
      ))}
    </>
  );
}

export { GRID_CLASS as photoGridClassName };
