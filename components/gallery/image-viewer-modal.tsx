"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer } from "@/components/gallery/image-viewer-context";

const ZOOM_SCALE = 1.8;

function formatBytes(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ImageViewerModal() {
  const { state, close, next, prev } = useImageViewer();
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const image = state ? state.images[state.index] : null;

  useEffect(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [image?._id]);

  useEffect(() => {
    if (!image) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [image, close, next, prev]);

  if (!image) return null;

  const sizeLabel = formatBytes(image.sizeBytes);

  function toggleZoom() {
    setZoomed((z) => {
      if (z) setPan({ x: 0, y: 0 });
      return !z;
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!zoomed) return;
    dragging.current = true;
    moved.current = false;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !boxRef.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const el = boxRef.current;
      if (!el) return;
      const maxX = Math.max(0, (el.offsetWidth * (ZOOM_SCALE - 1)) / 2);
      const maxY = Math.max(0, (el.offsetHeight * (ZOOM_SCALE - 1)) / 2);
      setPan((p) => ({
        x: clamp(p.x + dx, -maxX, maxX),
        y: clamp(p.y + dy, -maxY, maxY),
      }));
    });
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-6 backdrop-blur-md md:p-12"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {state && state.images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={prev}
            className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground transition-colors hover:bg-muted md:left-4"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={next}
            className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground transition-colors hover:bg-muted md:right-4"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <div className="flex h-full max-h-[820px] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {image.width} × {image.height}
            </span>
            {sizeLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{sizeLabel}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/images/${encodeURIComponent(image.objectKey)}?download=1`}
              className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              <Download className="size-4" />
              Download
            </a>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30">
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div
              ref={boxRef}
              className="inline-block will-change-transform"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? ZOOM_SCALE : 1})`,
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
                className="block rounded-lg shadow-lg select-none"
                style={{
                  height: "auto",
                  maxHeight: "62dvh",
                  maxWidth: "100%",
                  cursor: zoomed ? "grab" : "zoom-in",
                  touchAction: "none",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            onClick={toggleZoom}
            className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full border border-border bg-background/80 transition-colors hover:bg-muted md:right-6 md:bottom-6"
          >
            {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
          </button>
        </div>

        {(image.title || image.description || image.category || image.location || image.cameraInfo) && (
          <div className="flex flex-col gap-2 border-t border-border px-4 py-4 md:px-6">
            {image.title && <h2 className="text-base font-medium">{image.title}</h2>}
            {image.description && <p className="max-w-2xl text-sm text-muted-foreground">{image.description}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {image.category?.name && (
                <span className="rounded-full border border-border px-3 py-1">{image.category.name}</span>
              )}
              {image.location && <span className="rounded-full border border-border px-3 py-1">{image.location}</span>}
              {image.cameraInfo && (
                <span className="rounded-full border border-border px-3 py-1">{image.cameraInfo}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
