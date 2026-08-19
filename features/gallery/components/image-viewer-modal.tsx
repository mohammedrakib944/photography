"use client";

import { useRef } from "react";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer } from "@/features/gallery/components/image-viewer-context";
import { useContainedImageSize } from "@/features/gallery/hooks/use-contained-image-size";
import { useChromeHeight } from "@/features/gallery/hooks/use-chrome-height";
import { useImageZoomPan } from "@/features/gallery/hooks/use-image-zoom-pan";
import { useModalKeyboardNav } from "@/features/gallery/hooks/use-modal-keyboard-nav";

const ZOOM_SCALE = 1.8;

function formatBytes(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function ImageViewerModal() {
  const { state, close, next, prev } = useImageViewer();
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);

  const image = state ? state.images[state.index] : null;

  const chromeHeight = useChromeHeight([bottomBarRef, navBarRef], `${image?._id}-${state?.images.length}`);
  const { width: frameWidth, height: imageHeight } = useContainedImageSize(
    image?.width ?? 1,
    image?.height ?? 1,
    chromeHeight
  );
  const { zoomed, pan, boxRef, dragging, moved, toggleZoom, onPointerDown, onPointerMove, onPointerUp } =
    useImageZoomPan(ZOOM_SCALE, image?._id);
  useModalKeyboardNav(Boolean(image), { close, next, prev });

  if (!image) return null;

  const sizeLabel = formatBytes(image.sizeBytes);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-xl sm:p-6 md:p-12"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {state && state.images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={prev}
            className="fixed top-1/2 left-4 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-background md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={next}
            className="fixed top-1/2 right-4 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-background md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <div
        className="flex flex-col overflow-hidden rounded-2xl bg-background shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/5"
        style={{ width: frameWidth || undefined }}
      >
        <div
          className="relative flex items-center justify-center overflow-hidden bg-muted/30"
          style={{ height: imageHeight || undefined }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            ref={boxRef}
            className="h-full w-full will-change-transform"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
              transition: dragging.current ? "none" : "transform 0.25s ease-out",
            }}
          >
            {/* Zoom scale lives on its own layer, separate from the pan
                translate above — the drag only ever rewrites a pure
                translate3d on the outer layer every frame, never touching
                this one, which is the cheapest possible transform for the
                browser to composite at 1:1 with the cursor. */}
            <div
              className="h-full w-full"
              style={{
                transform: `scale(${zoomed ? ZOOM_SCALE : 1})`,
                transition: dragging.current ? "none" : "transform 0.25s ease-out",
              }}
            >
              <GalleryImage
                src={image.objectKey}
                width={image.width}
                height={image.height}
                alt={image.title ?? ""}
                preload
                onClick={() => !moved.current && toggleZoom()}
                className="block h-full w-full select-none"
                style={{
                  objectFit: "contain",
                  cursor: zoomed ? "grab" : "zoom-in",
                  touchAction: "none",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-border/50 bg-background/60 text-foreground backdrop-blur transition-colors hover:bg-background/90 md:top-6 md:right-6"
          >
            <X className="size-4" />
          </button>

          <button
            type="button"
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            onClick={toggleZoom}
            className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full border border-border/50 bg-background/60 text-foreground backdrop-blur transition-colors hover:bg-background/90 md:right-6 md:bottom-6"
          >
            {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
          </button>
        </div>

        {state && state.images.length > 1 && (
          <div ref={navBarRef} className="flex items-center justify-center gap-5 border-t border-border py-3 md:hidden">
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="flex size-9 items-center justify-center rounded-full border border-border transition-all duration-200 hover:-translate-x-0.5 hover:border-foreground/30 hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="font-heading text-xs tracking-[0.2em] text-muted-foreground tabular-nums">
              {state.index + 1} <span className="text-border">—</span> {state.images.length}
            </p>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="flex size-9 items-center justify-center rounded-full border border-border transition-all duration-200 hover:translate-x-0.5 hover:border-foreground/30 hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        <div
          ref={bottomBarRef}
          className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:px-6"
        >
          <div className="flex min-w-0 flex-col gap-2">
            {image.title && <h2 className="text-base font-medium">{image.title}</h2>}
            {image.description && <p className="max-w-2xl text-sm text-muted-foreground">{image.description}</p>}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1">
                {image.width} × {image.height}
                {sizeLabel && ` · ${sizeLabel}`}
              </span>
              {image.category?.name && (
                <span className="rounded-full border border-border px-3 py-1">{image.category.name}</span>
              )}
              {image.location && <span className="rounded-full border border-border px-3 py-1">{image.location}</span>}
              {image.cameraInfo && (
                <span className="rounded-full border border-border px-3 py-1">{image.cameraInfo}</span>
              )}
            </div>
          </div>
          <a
            href={`/api/images/${encodeURIComponent(image.objectKey)}?download=1`}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            <Download className="size-4" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
