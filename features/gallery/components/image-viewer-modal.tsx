"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { GalleryImage } from "@/components/gallery-image";
import { useImageViewer } from "@/features/gallery/components/image-viewer-context";

const ZOOM_SCALE = 1.8;
const VIEWPORT_MARGIN = 48; // px kept clear around the whole dialog on each side

function formatBytes(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Sizes the image at its own aspect ratio (never cropped, never stretched to
 * fill a fixed box) — scaled down only as far as needed to fit the viewport
 * minus whatever room the top/bottom chrome bars are currently taking up, and
 * never scaled up past its natural resolution. The dialog frame then simply
 * wraps this size, so the frame follows the image instead of the other way
 * around.
 */
function computeContainedSize(
  naturalWidth: number,
  naturalHeight: number,
  chromeHeight: number
) {
  const maxWidth = window.innerWidth - VIEWPORT_MARGIN * 2;
  const maxHeight = window.innerHeight - VIEWPORT_MARGIN * 2 - chromeHeight;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  return { width: naturalWidth * scale, height: naturalHeight * scale };
}

function useContainedImageSize(
  naturalWidth: number,
  naturalHeight: number,
  chromeHeight: number
) {
  const [size, setSize] = useState(() =>
    typeof window === "undefined"
      ? { width: naturalWidth, height: naturalHeight }
      : computeContainedSize(naturalWidth, naturalHeight, chromeHeight)
  );

  useEffect(() => {
    function recalc() {
      setSize(computeContainedSize(naturalWidth, naturalHeight, chromeHeight));
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [naturalWidth, naturalHeight, chromeHeight]);

  return size;
}

export function ImageViewerModal() {
  const { state, close, next, prev } = useImageViewer();
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [chromeHeight, setChromeHeight] = useState(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const dragBounds = useRef({ maxX: 0, maxY: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const image = state ? state.images[state.index] : null;

  const { width: frameWidth, height: imageHeight } = useContainedImageSize(
    image?.width ?? 1,
    image?.height ?? 1,
    chromeHeight
  );

  useLayoutEffect(() => {
    const bottomEl = bottomBarRef.current;
    if (!bottomEl) return;
    function measure() {
      setChromeHeight(bottomEl!.offsetHeight || 0);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bottomEl);
    return () => ro.disconnect();
  }, [image?._id]);

  useEffect(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
    panRef.current = { x: 0, y: 0 };
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
      const next = !z;
      const nextPan = next ? panRef.current : { x: 0, y: 0 };
      panRef.current = nextPan;
      setPan(nextPan);
      return next;
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!zoomed || !boxRef.current) return;
    dragging.current = true;
    moved.current = false;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    const el = boxRef.current;
    // Measured once up front — reading offsetWidth/Height on every pointermove
    // forces a synchronous layout reflow each frame, which is what made the
    // drag feel like it was lagging behind the cursor.
    dragBounds.current = {
      maxX: Math.max(0, (el.offsetWidth * (ZOOM_SCALE - 1)) / 2),
      maxY: Math.max(0, (el.offsetHeight * (ZOOM_SCALE - 1)) / 2),
    };
    el.style.transition = "none";
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  // While dragging, the pan is written straight to the DOM (bypassing React
  // state) so the image tracks the cursor with zero render latency — routing
  // every pointermove through setState here was what made the drag lag behind
  // the cursor. The final position is committed to state once, on release.
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !boxRef.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };

    const { maxX, maxY } = dragBounds.current;
    const nextX = clamp(panRef.current.x + dx, -maxX, maxX);
    const nextY = clamp(panRef.current.y + dy, -maxY, maxY);
    panRef.current = { x: nextX, y: nextY };
    boxRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (boxRef.current) boxRef.current.style.transition = "";
    setPan(panRef.current);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-xl md:p-12"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {state && state.images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={prev}
            className="fixed top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-background md:left-4"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={next}
            className="fixed top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-background md:right-4"
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

        <div ref={bottomBarRef} className="flex items-end justify-between gap-4 border-t border-border px-4 py-4 md:px-6">
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
            className="flex shrink-0 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            <Download className="size-4" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
