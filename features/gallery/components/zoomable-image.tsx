"use client";

import { GalleryImage } from "@/components/gallery-image";
import { useSimpleZoomPan } from "@/features/gallery/hooks/use-simple-zoom-pan";

const ZOOM_SCALE = 1.8;

export function ZoomableImage({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  const { zoomed, pan, boxRef, dragging, moved, toggleZoom, onPointerDown, onPointerMove, onPointerUp } =
    useSimpleZoomPan(ZOOM_SCALE);

  return (
    <div
      className="flex max-h-[75dvh] w-full items-center justify-center overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={boxRef}
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomed ? ZOOM_SCALE : 1})`,
          transition: dragging.current ? "none" : "transform 0.3s ease",
        }}
      >
        <GalleryImage
          src={src}
          width={width}
          height={height}
          alt={alt}
          preload
          onClick={() => !moved.current && toggleZoom()}
          className="select-none"
          style={{
            height: "auto",
            maxHeight: zoomed ? "none" : "75dvh",
            maxWidth: zoomed ? "none" : "100%",
            cursor: zoomed ? "grab" : "zoom-in",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}
