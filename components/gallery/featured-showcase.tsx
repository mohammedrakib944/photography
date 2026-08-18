"use client";

import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer, type ViewerImage } from "@/components/gallery/image-viewer-context";

export function FeaturedShowcase({ images }: { images: ViewerImage[] }) {
  const { open } = useImageViewer();

  if (images.length === 0) return null;

  return (
    <section className="site-container py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Featured
          </p>
          <h2 className="font-heading text-2xl font-light tracking-wide md:text-3xl">
            Handpicked shots
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {images.map((img, index) => (
          <button
            key={img._id}
            type="button"
            onClick={() => open(images, index)}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted text-left shadow-md ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:ring-black/10"
          >
            <GalleryImage
              src={img.objectKey}
              width={img.width}
              height={img.height}
              alt={img.title ?? ""}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ width: "100%", height: "100%" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
            {img.title && (
              <p className="absolute right-4 bottom-4 left-4 text-sm font-medium text-white drop-shadow-sm">
                {img.title}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
