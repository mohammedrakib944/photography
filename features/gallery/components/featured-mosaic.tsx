"use client";

import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer, type ViewerImage } from "@/features/gallery/components/image-viewer-context";

function Tile({
  image,
  images,
  index,
  className,
}: {
  image: ViewerImage;
  images: ViewerImage[];
  index: number;
  className?: string;
}) {
  const { open } = useImageViewer();

  return (
    <button
      type="button"
      onClick={() => open(images, index)}
      className={`group relative overflow-hidden rounded-2xl bg-muted text-left shadow-[0_20px_45px_-20px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.5)] ${className ?? ""}`}
    >
      <GalleryImage
        src={image.objectKey}
        width={image.width}
        height={image.height}
        alt={image.title ?? ""}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        style={{ width: "100%", height: "100%" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      {image.title && (
        <p className="pointer-events-none absolute right-4 bottom-4 left-4 font-heading text-sm font-light tracking-wide text-white drop-shadow-sm">
          {image.title}
        </p>
      )}
    </button>
  );
}

/**
 * A small static bento of featured photos — no drag, no overlap, no
 * clipping box to fight with. Just a curated grid that scales and lifts on
 * hover; each tile opens the shared viewer at its position in the set.
 */
export function FeaturedMosaic({ images }: { images: ViewerImage[] }) {
  if (images.length === 0) return null;
  const shown = images.slice(0, 3);

  if (shown.length === 1) {
    return (
      <div className="aspect-[4/5] w-[380px]">
        <Tile image={shown[0]} images={images} index={0} className="h-full w-full" />
      </div>
    );
  }

  if (shown.length === 2) {
    return (
      <div className="grid h-[420px] w-[420px] grid-cols-2 gap-4">
        <Tile image={shown[0]} images={images} index={0} className="h-full w-full" />
        <Tile image={shown[1]} images={images} index={1} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="grid h-[440px] w-[420px] grid-cols-2 grid-rows-2 gap-4">
      <Tile image={shown[0]} images={images} index={0} className="row-span-2 h-full w-full" />
      <Tile image={shown[1]} images={images} index={1} className="h-full w-full" />
      <Tile image={shown[2]} images={images} index={2} className="h-full w-full" />
    </div>
  );
}
